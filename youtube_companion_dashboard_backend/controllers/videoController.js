import YouTubeService from '../services/youtubeService.js';
import userQuery from '../helper/dbHelper.js';
import EventLogger from '../services/eventLogger.js';

class VideoController {
  // Get video details
  static async getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;
      
      // Get video details from YouTube API
      const youtubeService = new YouTubeService();
      const videoDetails = await youtubeService.getVideoDetails(videoId);
      
      // Save or update video in database
      await VideoController.saveVideoToDatabase(videoDetails);
      
      // Log the event
      await EventLogger.logVideoEvent('fetch_details', videoId, { videoId }, videoDetails);
      
      res.json({
        success: true,
        data: videoDetails
      });
    } catch (error) {
      console.error('Error getting video details:', error);
      
      // Log error event
      await EventLogger.logVideoEvent('fetch_details', req.params.videoId, { videoId: req.params.videoId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching video details',
        error: error.message
      });
    }
  }

  // Update video title and description
  static async updateVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { title, description } = req.body;
      
      if (!title && !description) {
        return res.status(400).json({
          success: false,
          message: 'Title or description is required'
        });
      }
      
      // Update video on YouTube
      const youtubeService = new YouTubeService();
      const updatedVideo = await youtubeService.updateVideo(videoId, title, description);
      
      // Update video in database
      await VideoController.updateVideoInDatabase(videoId, updatedVideo);
      
      // Log the event
      await EventLogger.logVideoEvent('update', videoId, { videoId, title, description }, updatedVideo);
      
      res.json({
        success: true,
        data: updatedVideo
      });
    } catch (error) {
      console.error('Error updating video:', error);
      
      // Log error event
      await EventLogger.logVideoEvent('update', req.params.videoId, req.body, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error updating video',
        error: error.message
      });
    }
  }

  // Get video comments
  static async getVideoComments(req, res) {
    try {
      const { videoId } = req.params;
      const { maxResults = 100 } = req.query;
      
      // Get comments from YouTube API
      const youtubeService = new YouTubeService();
      const comments = await youtubeService.getVideoComments(videoId, parseInt(maxResults));
      
      // Save comments to database
      await VideoController.saveCommentsToDatabase(comments);
      
      // Log the event
      await EventLogger.logVideoEvent('fetch_comments', videoId, { videoId, maxResults }, { count: comments.length });
      
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error getting video comments:', error);
      
      // Log error event
      await EventLogger.logVideoEvent('fetch_comments', req.params.videoId, req.query, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching video comments',
        error: error.message
      });
    }
  }

  // Add comment to video
  static async addComment(req, res) {
    try {
      const { videoId } = req.params;
      const { text } = req.body;
      
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required'
        });
      }
      
      // Add comment to YouTube
      const youtubeService = new YouTubeService();
      const comment = await youtubeService.addComment(videoId, text);
      
      // Save comment to database
      await VideoController.saveCommentToDatabase(comment);
      
      // Log the event
      await EventLogger.logCommentEvent('add', videoId, comment.id, { videoId, text }, comment);
      
      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('add', req.params.videoId, null, req.body, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  }

  // Add reply to comment
  static async addReply(req, res) {
    try {
      const { commentId } = req.params;
      const { text } = req.body;
      
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Reply text is required'
        });
      }
      
      // Add reply to YouTube
      const youtubeService = new YouTubeService();
      const reply = await youtubeService.addReply(commentId, text);
      
      // Save reply to database
      await VideoController.saveCommentToDatabase(reply);
      
      // Log the event
      await EventLogger.logCommentEvent('add_reply', reply.videoId, reply.id, { commentId, text }, reply);
      
      res.json({
        success: true,
        data: reply
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('add_reply', null, req.params.commentId, req.body, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error adding reply',
        error: error.message
      });
    }
  }

  // Delete comment
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      
      // Delete comment from YouTube
      const youtubeService = new YouTubeService();
      await youtubeService.deleteComment(commentId);
      
      // Delete comment from database
      await VideoController.deleteCommentFromDatabase(commentId);
      
      // Log the event
      await EventLogger.logCommentEvent('delete', null, commentId, { commentId }, { success: true });
      
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('delete', null, req.params.commentId, { commentId: req.params.commentId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error deleting comment',
        error: error.message
      });
    }
  }

  // Helper methods for database operations
  static async saveVideoToDatabase(videoDetails) {
    const query = `
      INSERT INTO videos (id, title, description, thumbnail_url, view_count, like_count, comment_count, published_at, duration, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        thumbnail_url = VALUES(thumbnail_url),
        view_count = VALUES(view_count),
        like_count = VALUES(like_count),
        comment_count = VALUES(comment_count),
        duration = VALUES(duration),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      videoDetails.id,
      videoDetails.title,
      videoDetails.description,
      videoDetails.thumbnail,
      videoDetails.viewCount,
      videoDetails.likeCount,
      videoDetails.commentCount,
      toMySQLDateTime(videoDetails.publishedAt), // convert here
      videoDetails.duration,
      videoDetails.status
    ];
    
    await userQuery(query, values);
  }

  static async updateVideoInDatabase(videoId, updatedVideo) {
    const query = `
      UPDATE videos 
      SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const values = [updatedVideo.title, updatedVideo.description, videoId];
    await userQuery(query, values);
  }

  static async saveCommentsToDatabase(comments) {
    for (const comment of comments) {
      await VideoController.saveCommentToDatabase(comment);
      
      // Save replies
      if (comment.replies && comment.replies.length > 0) {
        for (const reply of comment.replies) {
          await VideoController.saveCommentToDatabase(reply);
        }
      }
    }
  }

  static async saveCommentToDatabase(comment) {
    const query = `
      INSERT INTO comments (id, video_id, author_name, author_channel_id, text, like_count, published_at, parent_id, is_owner_comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        author_name = VALUES(author_name),
        text = VALUES(text),
        like_count = VALUES(like_count),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      comment.id,
      comment.videoId,
      comment.authorName,
      comment.authorChannelId,
      comment.text,
      comment.likeCount,
      toMySQLDateTime(comment.publishedAt), // convert here
      comment.parentId,
      comment.isOwnerComment
    ];
    
    await userQuery(query, values);
  }

  static async deleteCommentFromDatabase(commentId) {
    const query = 'DELETE FROM comments WHERE id = ?';
    await userQuery(query, [commentId]);
  }
}

// Helper to convert ISO 8601 to MySQL DATETIME
function toMySQLDateTime(isoString) {
  if (!isoString) return null;
  return isoString.replace('T', ' ').replace('Z', '');
}

export default VideoController; 