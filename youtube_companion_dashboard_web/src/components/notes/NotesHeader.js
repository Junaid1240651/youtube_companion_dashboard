import React from 'react';
import { Box, Typography, TextField, MenuItem, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const NotesHeader = ({
  notesCount,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  onAddNote
}) => (
    <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{fontSize:'18px', textAlign:'center'}}>
            Video Improvement Notes {notesCount}
        </Typography>
   
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Fab color="primary" size="small" aria-label="add" onClick={onAddNote} sx={{ boxShadow: 'none' }}>
        <AddIcon />
      </Fab>
      <Typography variant="button" sx={{ ml: 1, fontWeight: 600, color: 'primary.main', letterSpacing: 1 }}>
        Add Note
      </Typography>
        </Box>
        
    </Box>
     <Box sx={{ display: 'flex', alignItems: 'end', flex: 1, justifyContent: 'end', gap: 2 }}>
      <TextField
        label="Category"
        select
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="all">All Categories</MenuItem>
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
        value={priorityFilter}
        onChange={e => setPriorityFilter(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="all">All Priorities</MenuItem>
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </TextField>
    </Box>
    </Box >
);

export default NotesHeader; 