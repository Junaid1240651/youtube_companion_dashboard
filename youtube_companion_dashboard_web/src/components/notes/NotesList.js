import React from 'react';
import { Box, Typography, List, Divider } from '@mui/material';

const NotesList = ({ notes, renderNoteItem, header }) => (
  <Box>
    {header && (
      <Typography variant="h6" sx={{ mb: 2 }}>{header}</Typography>
    )}
    <List>
      {notes.map((note) => (
        <React.Fragment key={note.id}>
          {renderNoteItem(note)}
          <Divider sx={{ my: 1 }} />
        </React.Fragment>
      ))}
    </List>
  </Box>
);

export default NotesList; 