import userQuery from '../helper/dbHelper.js';

class EventLogger {
  // Log an event to the database
  static async logEvent(eventData) {
    try {
      const {
        eventType,
        eventAction,
        videoId = null,
        commentId = null,
        noteId = null,
        userAgent = null,
        ipAddress = null,
        requestData = null,
        responseData = null,
        status = 'success',
        errorMessage = null
      } = eventData;

      const query = `
        INSERT INTO event_logs 
        (event_type, event_action, video_id, comment_id, note_id, user_agent, ip_address, request_data, response_data, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        eventType,
        eventAction,
        videoId,
        commentId,
        noteId,
        userAgent,
        ipAddress,
        requestData ? JSON.stringify(requestData) : null,
        responseData ? JSON.stringify(responseData) : null,
        status,
        errorMessage
      ];

      await userQuery(query, values);
      console.log(`Event logged: ${eventType} - ${eventAction}`);
    } catch (error) {
      console.error('Error logging event:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Log video-related events
  static async logVideoEvent(eventAction, videoId, requestData = null, responseData = null, errorMessage = null) {
    await this.logEvent({
      eventType: 'video',
      eventAction,
      videoId,
      requestData,
      responseData,
      errorMessage,
      status: errorMessage ? 'error' : 'success'
    });
  }

  // Log comment-related events
  static async logCommentEvent(eventAction, videoId, commentId, requestData = null, responseData = null, errorMessage = null) {
    await this.logEvent({
      eventType: 'comment',
      eventAction,
      videoId,
      commentId,
      requestData,
      responseData,
      errorMessage,
      status: errorMessage ? 'error' : 'success'
    });
  }

  // Log note-related events
  static async logNoteEvent(eventAction, videoId, noteId, requestData = null, responseData = null, errorMessage = null) {
    await this.logEvent({
      eventType: 'note',
      eventAction,
      videoId,
      noteId,
      requestData,
      responseData,
      errorMessage,
      status: errorMessage ? 'error' : 'success'
    });
  }

  // Log API request events
  static async logApiRequest(req, res, eventType, eventAction, additionalData = {}) {
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await this.logEvent({
      eventType,
      eventAction,
      userAgent,
      ipAddress,
      requestData: {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        ...additionalData
      },
      responseData: {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      }
    });
  }

  // Get event logs with filtering
  static async getEventLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM event_logs WHERE 1=1';
      const values = [];

      if (filters.eventType) {
        query += ' AND event_type = ?';
        values.push(filters.eventType);
      }

      if (filters.videoId) {
        query += ' AND video_id = ?';
        values.push(filters.videoId);
      }

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        values.push(filters.endDate);
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(filters.limit);
      }

      const results = await userQuery(query, values);
      return results;
    } catch (error) {
      console.error('Error getting event logs:', error);
      throw error;
    }
  }
}

export default EventLogger; 