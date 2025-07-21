import React from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const CommentForm = ({ newComment, setNewComment, handleAddComment, loading }) => (
  <Box sx={{ mb: 2 }}>
    <TextField
      fullWidth
      multiline
      rows={4}
      placeholder="Add a comment..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      variant="outlined"
      size="small"
      sx={{ mb: 1 }}
    />
    <Button
      variant="contained"
      onClick={handleAddComment}
      disabled={!newComment.trim() || loading}
      startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
      fullWidth
    >
      Add Comment
    </Button>
  </Box>
);

export default CommentForm; 