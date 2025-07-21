import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import NoteForm from './NoteForm';
import SaveIcon from '@mui/icons-material/Save';

const NoteDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  handleSubmit,
  loading,
  editingNote
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <form onSubmit={handleSubmit}>
      <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
      <DialogContent>
        <NoteForm
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          editingNote={editingNote}
          hideActions
          contentRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" sx={{ fontWeight: 700, mr: 2 }} disabled={loading}>
          CANCEL
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !formData.title.trim()}
          sx={{ fontWeight: 700, minWidth: 120 }}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        >
          {editingNote ? 'UPDATE' : 'CREATE'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

export default NoteDialog; 