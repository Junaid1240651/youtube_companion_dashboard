import { google } from 'googleapis';
import pkg from "lodash";
const { get } = pkg;
// Import oauth2Client and tokens from index.js
import { oauth2Client, oauthTokens } from '../index.js';

class YouTubeService {
  constructor() {
    this.youtube = google.youtube('v3');
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  // Helper to get auth for write operations
  getAuth() {
    if (oauthTokens) {
      oauth2Client.setCredentials(oauthTokens);
      return oauth2Client;
    }
    return this.apiKey;
  }

  // Get video details by ID (read-only)
  async getVideoDetails(videoId) {
    try {
      const response = await this.youtube.videos.list({
        key: this.apiKey,
        part: ['snippet', 'statistics', 'contentDetails', 'status'],
        id: [videoId]
      });
      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }
      const video = response.data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        likeCount: parseInt(video.statistics.likeCount) || 0,
        commentCount: parseInt(video.statistics.commentCount) || 0,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        status: video.status?.privacyStatus,
        categoryId: video.snippet.categoryId // Add this
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  // Get comments for a video
  async getVideoComments(videoId, maxResults = 100) {
    try {
      const response = await this.youtube.commentThreads.list({
        key: this.apiKey,
        part: ['snippet', 'replies'],
        videoId: videoId,
        maxResults: maxResults,
        order: 'time'
      });

      const comments = [];
      
      for (const item of response.data.items) {
        const comment = {
          id: item.snippet.topLevelComment.id,
          videoId: videoId,
          authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
          authorChannelId: item.snippet.topLevelComment.snippet.authorChannelId?.value,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
          parentId: null,
          isOwnerComment: item.snippet.topLevelComment.snippet.authorChannelId?.value === process.env.YOUTUBE_CHANNEL_ID,
          replies: []
        };

        // Get replies if they exist
        if (item.replies) {
          for (const reply of item.replies.comments) {
            comment.replies.push({
              id: reply.id,
              videoId: videoId,
              authorName: reply.snippet.authorDisplayName,
              authorChannelId: reply.snippet.authorChannelId?.value,
              text: reply.snippet.textDisplay,
              likeCount: reply.snippet.likeCount,
              publishedAt: reply.snippet.publishedAt,
              parentId: comment.id,
              isOwnerComment: reply.snippet.authorChannelId?.value === process.env.YOUTUBE_CHANNEL_ID
            });
          }
        }

        comments.push(comment);
      }

      return comments;
    } catch (error) {
      console.error('Error fetching video comments:', error);
      throw error;
    }
  }

  // Add a comment to a video (write)
  async addComment(videoId, text) {
    try {
      const response = await this.youtube.commentThreads.insert({
        auth: this.getAuth(),
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text
              }
            }
          }
        }
      });

      return {
        id: response.data.id,
        videoId: videoId,
        authorName: response.data.snippet.topLevelComment.snippet.authorDisplayName,
        authorChannelId: response.data.snippet.topLevelComment.snippet.authorChannelId?.value,
        text: response.data.snippet.topLevelComment.snippet.textDisplay,
        likeCount: response.data.snippet.topLevelComment.snippet.likeCount,
        publishedAt: response.data.snippet.topLevelComment.snippet.publishedAt,
        parentId: null,
        isOwnerComment: true
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Add a reply to a comment (write)
  async addReply(commentId, text) {
    try {
      const response = await this.youtube.comments.insert({
        auth: this.getAuth(),
        part: ['snippet'],
        requestBody: {
          snippet: {
            parentId: commentId,
            textOriginal: text
          }
        }
      });

      return {
        id: response.data.id,
        videoId: response.data.snippet.videoId,
        authorName: response.data.snippet.authorDisplayName,
        authorChannelId: response.data.snippet.authorChannelId?.value,
        text: response.data.snippet.textDisplay,
        likeCount: response.data.snippet.likeCount,
        publishedAt: response.data.snippet.publishedAt,
        parentId: commentId,
        isOwnerComment: true
      };
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  // Delete a comment (write)
  async deleteComment(commentId) {
    try {
      await this.youtube.comments.delete({
        auth: this.getAuth(),
        id: commentId
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Update video title and description (write)
  async updateVideo(videoId, title, description, categoryId) {
    try {
      // Fetch current video details if title, description, or categoryId is missing
      let updatedTitle = title;
      let updatedDescription = description;
      let updatedCategoryId = categoryId;
      if (!title || !description || !categoryId) {
        const current = await this.getVideoDetails(videoId);
        if (!title) updatedTitle = current.title;
        if (!description) updatedDescription = current.description;
        if (!categoryId) updatedCategoryId = current.categoryId;
      }
      const response = await this.youtube.videos.update({
        auth: this.getAuth(),
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: {
            title: updatedTitle,
            description: updatedDescription,
            categoryId: updatedCategoryId
          }
        }
      });
      return {
        id: response.data.id,
        title: response.data.snippet.title,
        description: response.data.snippet.description
      };
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }
}

export default YouTubeService; 