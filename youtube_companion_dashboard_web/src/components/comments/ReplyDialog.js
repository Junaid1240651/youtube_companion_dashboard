import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';

const ReplyDialog = ({
  open,
  onClose,
  replyTo,
  replyText,
  setReplyText,
  handleAddReply,
  loading,
  replyingId
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      Reply to {replyTo?.author}
    </DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Write your reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        variant="outlined"
        sx={{ mt: 1 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button 
        onClick={() => handleAddReply(replyTo?.id)} 
        variant="contained"
        disabled={!replyText.trim() || loading}
        startIcon={replyingId === replyTo?.id && loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {replyingId === replyTo?.id && loading ? 'Replying...' : 'Reply'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ReplyDialog; 