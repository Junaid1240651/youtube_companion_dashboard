import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { notesAPI } from '../services/api.js';

const Notes = ({ videoId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });

  // Load notes on component mount
  useEffect(() => {
    if (videoId) {
      loadNotes();
    }
  }, [videoId]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNotes(videoId);
      setNotes(response.data.data);
    } catch (error) {
      console.error('Error loading notes:', error);
      showAlert('Error loading notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showAlert('Note title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (editingNote) {
        // Update existing note
        const response = await notesAPI.updateNote(editingNote.id, formData);
        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? response.data.data : note
        ));
        showAlert('Note updated successfully!');
      } else {
        // Create new note
        const response = await notesAPI.createNote(videoId, formData);
        setNotes(prev => [response.data.data, ...prev]);
        showAlert('Note created successfully!');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving note:', error);
      showAlert('Error saving note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority
    });
    setOpenDialog(true);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setLoading(true);
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      showAlert('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      showAlert('Error deleting note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (noteId) => {
    try {
      const response = await notesAPI.toggleCompletion(noteId);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? response.data.data : note
      ));
      showAlert('Note status updated!');
    } catch (error) {
      console.error('Error toggling note completion:', error);
      showAlert('Error updating note status', 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'default',
      content: 'primary',
      thumbnail: 'secondary',
      title: 'info',
      description: 'success',
      tags: 'warning'
    };
    return colors[category] || 'default';
  };

  // Filter notes based on current filters
  const filteredNotes = notes.filter(note => {
    if (filter !== 'all' && note.category !== filter) return false;
    if (priorityFilter !== 'all' && note.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <Box>
      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Video Improvement Notes ({notes.length})
        </Typography>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filter}
              label="Category"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="thumbnail">Thumbnail</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="description">Description</MenuItem>
              <MenuItem value="tags">Tags</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Notes List */}
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
            No notes found. Create your first note to get started!
          </Typography>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleCompletion(note.id)}
                    color={note.is_completed ? 'success' : 'default'}
                  >
                    {note.is_completed ? <CheckCircleIcon /> : <UncheckedIcon />}
                  </IconButton>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          textDecoration: note.is_completed ? 'line-through' : 'none',
                          color: note.is_completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {note.title}
                      </Typography>
                      <Chip 
                        label={note.priority} 
                        size="small" 
                        color={getPriorityColor(note.priority)}
                      />
                      <Chip 
                        label={note.category} 
                        size="small" 
                        color={getCategoryColor(note.category)}
                      />
                    </Box>
                    
                    {note.content && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          textDecoration: note.is_completed ? 'line-through' : 'none',
                          mb: 1
                        }}
                      >
                        {note.content}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(note.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(note)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(note.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </List>

      {/* Add Note Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="content">Content</MenuItem>
                  <MenuItem value="thumbnail">Thumbnail</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="description">Description</MenuItem>
                  <MenuItem value="tags">Tags</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading || !formData.title.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {editingNote ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add note"
        onClick={() => setOpenDialog(true)}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Notes; 