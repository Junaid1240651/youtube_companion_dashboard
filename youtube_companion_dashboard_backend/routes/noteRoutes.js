import express from 'express';
import NoteController from '../controllers/noteController.js';

const router = express.Router();

// Notes routes
router.get('/:videoId/notes', NoteController.getNotes);
router.get('/:videoId/notes/category', NoteController.getNotesByCategory);
router.get('/:videoId/notes/priority', NoteController.getNotesByPriority);
router.post('/:videoId/notes', NoteController.createNote);

// Individual note routes
router.get('/notes/:noteId', NoteController.getNote);
router.put('/notes/:noteId', NoteController.updateNote);
router.delete('/notes/:noteId', NoteController.deleteNote);
router.patch('/notes/:noteId/toggle', NoteController.toggleNoteCompletion);

export default router; 