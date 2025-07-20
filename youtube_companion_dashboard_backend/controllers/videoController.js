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
      await EventLogger.logVideoEvent('GET', 'fetch_details', videoId, { videoId }, videoDetails, req);
      
      res.json({
        success: true,
        data: videoDetails
      });
    } catch (error) {
      console.error('Error getting video details:', error);
      
      // Log error event
      await EventLogger.logVideoEvent('GET', 'fetch_details', req.params.videoId, { videoId: req.params.videoId }, null, req, error.message);
      
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
      await EventLogger.logVideoEvent('PUT', title ? 'change_title' : 'change_description', videoId, { videoId, title, description }, updatedVideo, req);
      
      res.json({
        success: true,
        data: updatedVideo
      });
    } catch (error) {
      console.error('Error updating video:', error);
      try {
        await EventLogger.logVideoEvent('PUT', 'update_video_error', req.params.videoId, req.body, null, req, error.message);
      } catch (logErr) {
        console.error('Error logging event:', logErr);
      }
      return res.status(500).json({
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
      await EventLogger.logVideoEvent('GET', 'fetch_comments', videoId, { videoId, maxResults }, { count: comments.length }, req);
      
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error getting video comments:', error);
      
      // Log error event
      await EventLogger.logVideoEvent('GET', 'fetch_comments', req.params.videoId, req.query, null, req, error.message);
      
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
      await EventLogger.logCommentEvent('POST', 'add_comment', videoId, comment.id, { videoId, text }, comment, req);
      
      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('POST', req.params.videoId, null, req.body, null, req, error.message);
      
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
      await EventLogger.logCommentEvent('POST', 'add_reply', reply.videoId, reply.id, { commentId, text }, reply, req);
      
      res.json({
        success: true,
        data: reply
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('POST', null, req.params.commentId, req.body, null, req, error.message);
      
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
      
      // Log the event BEFORE deleting the comment from the database
      await EventLogger.logCommentEvent('DELETE', 'delete_comment', null, commentId, { commentId }, { success: true }, req);
      
      // Delete comment from YouTube
      const youtubeService = new YouTubeService();
      await youtubeService.deleteComment(commentId);
      
      // Delete comment from database
      await VideoController.deleteCommentFromDatabase(commentId);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      // Log error event
      await EventLogger.logCommentEvent('DELETE', 'delete_comment', null, req.params.commentId, { commentId: req.params.commentId }, null, req, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error deleting comment',
        error: error.message
      });
    }
  }

  // Delete reply
  static async deleteReply(req, res) {
    try {
      const { replyId } = req.params;
      // Optionally, fetch the reply to check if it exists and is a reply (has parentId)
      const replyRows = await userQuery('SELECT * FROM comments WHERE id = ?', [replyId]);
      if (!replyRows.length || !replyRows[0].parent_id) {
        return res.status(404).json({ success: false, message: 'Reply not found' });
      }
      // Log the event BEFORE deleting the reply from the database
      await EventLogger.logCommentEvent('DELETE', 'delete_reply', null, replyId, { replyId }, { success: true }, req);
      // Delete reply from YouTube
      const youtubeService = new YouTubeService();
      await youtubeService.deleteComment(replyId);
      // Delete reply from database
      await VideoController.deleteCommentFromDatabase(replyId);
      res.json({ success: true, message: 'Reply deleted successfully' });
    } catch (error) {
      console.error('Error deleting reply:', error);
      await EventLogger.logCommentEvent('DELETE', 'delete_reply', null, req.params.replyId, { replyId: req.params.replyId }, null, req, error.message);
      res.status(500).json({ success: false, message: 'Error deleting reply', error: error.message });
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
    let videoId = comment.videoId;
    // If videoId is missing (for replies), fetch from parent comment
    if (!videoId && comment.parentId) {
      const parent = await userQuery('SELECT video_id FROM comments WHERE id = ?', [comment.parentId]);
      if (parent.length > 0) {
        videoId = parent[0].video_id;
      }
    }
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
      videoId,
      comment.authorName,
      comment.authorChannelId,
      comment.text,
      comment.likeCount,
      toMySQLDateTime(comment.publishedAt),
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