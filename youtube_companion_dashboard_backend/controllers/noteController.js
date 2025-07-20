import userQuery from '../helper/dbHelper.js';
import EventLogger from '../services/eventLogger.js';

class NoteController {
  // Get all notes for a video
  static async getNotes(req, res) {
    try {
      const { videoId } = req.params;
      
      const query = `
        SELECT * FROM notes 
        WHERE video_id = ? 
        ORDER BY created_at DESC
      `;
      
      const notes = await userQuery(query, [videoId]);
      
      // Log the event
      await EventLogger.logNoteEvent('fetch_all', videoId, null, { videoId }, { count: notes.length });
      
      res.json({
        success: true,
        data: notes
      });
    } catch (error) {
      console.error('Error getting notes:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('fetch_all', req.params.videoId, null, { videoId: req.params.videoId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching notes',
        error: error.message
      });
    }
  }

  // Get a single note by ID
  static async getNote(req, res) {
    try {
      const { noteId } = req.params;
      
      const query = 'SELECT * FROM notes WHERE id = ?';
      const notes = await userQuery(query, [noteId]);
      
      if (notes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      const note = notes[0];
      
      // Log the event
      await EventLogger.logNoteEvent('fetch_single', note.video_id, noteId, { noteId }, note);
      
      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      console.error('Error getting note:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('fetch_single', null, req.params.noteId, { noteId: req.params.noteId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching note',
        error: error.message
      });
    }
  }

  // Create a new note
  static async createNote(req, res) {
    try {
      const { videoId } = req.params;
      const { title, content, category = 'general', priority = 'medium' } = req.body;
      
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Note title is required'
        });
      }
      
      const query = `
        INSERT INTO notes (video_id, title, content, category, priority)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [videoId, title.trim(), content?.trim() || '', category, priority];
      const result = await userQuery(query, values);
      
      const noteId = result.insertId;
      
      // Get the created note
      const createdNote = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      
      // Log the event
      await EventLogger.logNoteEvent('create', videoId, noteId, { videoId, title, content, category, priority }, createdNote[0]);
      
      res.status(201).json({
        success: true,
        data: createdNote[0]
      });
    } catch (error) {
      console.error('Error creating note:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('create', req.params.videoId, null, req.body, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error creating note',
        error: error.message
      });
    }
  }

  // Update a note
  static async updateNote(req, res) {
    try {
      const { noteId } = req.params;
      const { title, content, category, priority, isCompleted } = req.body;
      
      // Check if note exists
      const existingNotes = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      if (existingNotes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      const existingNote = existingNotes[0];
      
      // Build update query dynamically
      let query = 'UPDATE notes SET ';
      const values = [];
      const updates = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title.trim());
      }
      
      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content?.trim() || '');
      }
      
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }
      
      if (priority !== undefined) {
        updates.push('priority = ?');
        values.push(priority);
      }
      
      if (isCompleted !== undefined) {
        updates.push('is_completed = ?');
        values.push(isCompleted);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      query += updates.join(', ') + ' WHERE id = ?';
      values.push(noteId);
      
      await userQuery(query, values);
      
      // Get the updated note
      const updatedNotes = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      const updatedNote = updatedNotes[0];
      
      // Log the event
      await EventLogger.logNoteEvent('update', existingNote.video_id, noteId, { noteId, ...req.body }, updatedNote);
      
      res.json({
        success: true,
        data: updatedNote
      });
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('update', null, req.params.noteId, req.body, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error updating note',
        error: error.message
      });
    }
  }

  // Delete a note
  static async deleteNote(req, res) {
    try {
      const { noteId } = req.params;
      
      // Check if note exists and get video_id for logging
      const existingNotes = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      if (existingNotes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      const existingNote = existingNotes[0];
      
      const query = 'DELETE FROM notes WHERE id = ?';
      await userQuery(query, [noteId]);
      
      // Log the event
      await EventLogger.logNoteEvent('delete', existingNote.video_id, noteId, { noteId }, { success: true });
      
      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('delete', null, req.params.noteId, { noteId: req.params.noteId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error deleting note',
        error: error.message
      });
    }
  }

  // Get notes by category
  static async getNotesByCategory(req, res) {
    try {
      const { videoId } = req.params;
      const { category } = req.query;
      
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category parameter is required'
        });
      }
      
      const query = `
        SELECT * FROM notes 
        WHERE video_id = ? AND category = ?
        ORDER BY created_at DESC
      `;
      
      const notes = await userQuery(query, [videoId, category]);
      
      // Log the event
      await EventLogger.logNoteEvent('fetch_by_category', videoId, null, { videoId, category }, { count: notes.length });
      
      res.json({
        success: true,
        data: notes
      });
    } catch (error) {
      console.error('Error getting notes by category:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('fetch_by_category', req.params.videoId, null, req.query, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching notes by category',
        error: error.message
      });
    }
  }

  // Get notes by priority
  static async getNotesByPriority(req, res) {
    try {
      const { videoId } = req.params;
      const { priority } = req.query;
      
      if (!priority) {
        return res.status(400).json({
          success: false,
          message: 'Priority parameter is required'
        });
      }
      
      const query = `
        SELECT * FROM notes 
        WHERE video_id = ? AND priority = ?
        ORDER BY created_at DESC
      `;
      
      const notes = await userQuery(query, [videoId, priority]);
      
      // Log the event
      await EventLogger.logNoteEvent('fetch_by_priority', videoId, null, { videoId, priority }, { count: notes.length });
      
      res.json({
        success: true,
        data: notes
      });
    } catch (error) {
      console.error('Error getting notes by priority:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('fetch_by_priority', req.params.videoId, null, req.query, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error fetching notes by priority',
        error: error.message
      });
    }
  }

  // Mark note as completed/incomplete
  static async toggleNoteCompletion(req, res) {
    try {
      const { noteId } = req.params;
      
      // Check if note exists
      const existingNotes = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      if (existingNotes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      const existingNote = existingNotes[0];
      const newCompletionStatus = !existingNote.is_completed;
      
      const query = 'UPDATE notes SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await userQuery(query, [newCompletionStatus, noteId]);
      
      // Get the updated note
      const updatedNotes = await userQuery('SELECT * FROM notes WHERE id = ?', [noteId]);
      const updatedNote = updatedNotes[0];
      
      // Log the event
      await EventLogger.logNoteEvent('toggle_completion', existingNote.video_id, noteId, { noteId, isCompleted: newCompletionStatus }, updatedNote);
      
      res.json({
        success: true,
        data: updatedNote
      });
    } catch (error) {
      console.error('Error toggling note completion:', error);
      
      // Log error event
      await EventLogger.logNoteEvent('toggle_completion', null, req.params.noteId, { noteId: req.params.noteId }, null, error.message);
      
      res.status(500).json({
        success: false,
        message: 'Error toggling note completion',
        error: error.message
      });
    }
  }
}

export default NoteController; 