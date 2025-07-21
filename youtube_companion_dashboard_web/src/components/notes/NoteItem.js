import React from 'react';
import { ListItem, ListItemText, Chip, Box, IconButton, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const NoteItem = ({ note, onEdit, onDelete, onToggleCompleted }) => (
  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
    <Tooltip title={note.is_completed ? 'Mark as incomplete' : 'Mark as complete'}>
      <IconButton
        size="small"
        onClick={onToggleCompleted}
        color={note.is_completed ? 'success' : 'default'}
        sx={{ mr: 1 }}
      >
        {note.is_completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
      </IconButton>
    </Tooltip>
    <ListItemText
      primary={
        <Typography
          variant="subtitle2"
          sx={{
            textDecoration: note.is_completed ? 'line-through' : 'none',
            color: note.is_completed ? 'text.secondary' : 'text.primary',
            fontWeight: 500
          }}
        >
          {note.title}
        </Typography>
      }
      secondary={
        <>
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
            {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
          </Typography>
        </>
      }
    />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={note.priority}
        size="small"
        color={
          note.priority === 'high'
            ? 'error'
            : note.priority === 'medium'
            ? 'primary'
            : note.priority === 'low'
            ? 'success'
            : 'default'
        }
      />
      <Chip label={note.category} size="small" />
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => onEdit(note)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => onDelete(note.id)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </ListItem>
);

export default NoteItem; 