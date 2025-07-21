import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button, CircularProgress } from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, message, confirmText = 'DELETE', cancelText = 'CANCEL', loading }) => (
  <Dialog open={open} onClose={loading ? undefined : onClose}>
    <DialogTitle>{message}</DialogTitle>
    <DialogActions>
      <Button onClick={onClose} color="primary" disabled={loading}>{cancelText}</Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        sx={{ fontWeight: 700 }}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog; 