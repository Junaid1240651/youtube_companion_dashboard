import React from 'react';
import { Box, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const NoteForm = ({
  formData,
  setFormData,
  handleSubmit,
  loading,
  editingNote,
  handleCancel,
  hideActions,
  contentRows = 2
}) => (
  <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
    <TextField
      label="Title"
      value={formData.title}
      onChange={e => setFormData({ ...formData, title: e.target.value })}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <TextField
      label="Content"
      value={formData.content}
      onChange={e => setFormData({ ...formData, content: e.target.value })}
      fullWidth
      multiline
      rows={contentRows}
      sx={{ mb: 2 }}
    />
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Category"
        select
        value={formData.category}
        onChange={e => setFormData({ ...formData, category: e.target.value })}
        sx={{ mb: 1, flex: 1 }}
      >
        <MenuItem value="general">General</MenuItem>
        <MenuItem value="content">Content</MenuItem>
        <MenuItem value="thumbnail">Thumbnail</MenuItem>
        <MenuItem value="title">Title</MenuItem>
        <MenuItem value="description">Description</MenuItem>
        <MenuItem value="tags">Tags</MenuItem>
      </TextField>
      <TextField
        label="Priority"
        select
        value={formData.priority}
        onChange={e => setFormData({ ...formData, priority: e.target.value })}
        sx={{ mb: 1, flex: 1 }}
      >
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </TextField>
    </Box>
    {!hideActions && (
      <Box sx={{ mt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={loading || !formData.title.trim()}
          sx={{ mr: 1 }}
        >
          {editingNote ? 'Update' : 'Add'} Note
        </Button>
        {editingNote && (
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </Box>
    )}
  </Box>
);

export default NoteForm; 