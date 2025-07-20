import userQuery from '../helper/dbHelper.js';

// Helper to safely stringify objects (avoids circular structure errors)
function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({ error: 'Could not stringify', message: e.message });
  }
}

class EventLogger {
  // Log an event to the database
  static async logEvent(eventData) {
    try {
      const {
        eventType,
        eventAction, 
        eventMessage, 
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
        (event_type, event_action, event_message, video_id, comment_id, note_id, user_agent, ip_address, request_data, response_data, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        eventType,
        eventAction,
        eventMessage,
        videoId,
        commentId,
        noteId,
        userAgent,
        ipAddress,
        requestData ? safeStringify(requestData) : null,
        responseData ? safeStringify(responseData) : null,
        status,
        errorMessage
      ];

      await userQuery(query, values);
      console.log(`Event logged: ${eventType} - ${eventAction} - ${eventMessage}`);
    } catch (error) {
      console.error('Error logging event:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Log video-related events
  static async logVideoEvent(apiMethod, eventMessage, videoId, requestData = null, responseData = null, req = null, errorMessage = null) {
    let userAgent = null, ipAddress = null;
    let safeRequestData = requestData;
    if (req) {
      userAgent = req.get('User-Agent');
      ipAddress = req.ip || req.connection?.remoteAddress;
      safeRequestData = {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        ...requestData
      };
    }
    await this.logEvent({
      eventType: 'video',
      eventAction: apiMethod, // e.g., 'GET', 'POST'
      eventMessage,           // e.g., 'fetch_comments'
      videoId,
      userAgent,
      ipAddress,
      requestData: safeRequestData,
      responseData,
      errorMessage,
      status: errorMessage ? 'error' : 'success'
    });
  }

  // Log comment-related events
  static async logCommentEvent(apiMethod, eventMessage, videoId, commentId, requestData = null, responseData = null, req = null, errorMessage = null) {
    let userAgent = null, ipAddress = null;
    let safeRequestData = requestData;
    if (req) {
      userAgent = req.get('User-Agent');
      ipAddress = req.ip || req.connection?.remoteAddress;
      safeRequestData = {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        ...requestData
      };
    }
    await this.logEvent({
      eventType: 'comment',
      eventAction: apiMethod,
      eventMessage,
      videoId,
      commentId,
      userAgent,
      ipAddress,
      requestData: safeRequestData,
      responseData,
      errorMessage,
      status: errorMessage ? 'error' : 'success'
    });
  }

  // Log note-related events
  static async logNoteEvent(apiMethod, eventMessage, videoId, noteId, requestData = null, responseData = null, req = null, errorMessage = null) {
    let userAgent = null, ipAddress = null;
    let safeRequestData = requestData;
    if (req) {
      userAgent = req.get('User-Agent');
      ipAddress = req.ip || req.connection?.remoteAddress;
      safeRequestData = {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        ...requestData
      };
    }
    await this.logEvent({
      eventType: 'note',
      eventAction: apiMethod,
      eventMessage,
      videoId,
      noteId,
      userAgent,
      ipAddress,
      requestData: safeRequestData,
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