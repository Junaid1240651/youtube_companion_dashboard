import React from 'react';
import { Box, Typography, IconButton, Tooltip, CircularProgress, TextField, Button, Divider, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';

const VideoDetails = ({
  videoData,
  editingTitle,
  setEditingTitle,
  newTitle,
  setNewTitle,
  handleSaveTitle,
  loading,
  editingDescription,
  setEditingDescription,
  newDescription,
  setNewDescription,
  handleSaveDescription,
  formatNumber,
  formatDate
}) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {editingTitle ? (
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <TextField
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton onClick={handleSaveTitle} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <SaveIcon />}
          </IconButton>
          <IconButton onClick={() => setEditingTitle(false)}>
            <CancelIcon />
          </IconButton>
        </Box>
      ) : (
        <>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ flex: 1 }}>
            {videoData.title}
          </Typography>
          <Tooltip title="Edit Title">
            <IconButton onClick={() => setEditingTitle(true)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VisibilityIcon fontSize="small" />
        <Typography variant="body2">{formatNumber(videoData.viewCount)} views</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThumbUpIcon fontSize="small" />
        <Typography variant="body2">{formatNumber(videoData.likeCount)} likes</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CommentIcon fontSize="small" />
        <Typography variant="body2">{formatNumber(videoData.commentCount)} comments</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {formatDate(videoData.publishedAt)}
      </Typography>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }} gutterBottom>Description</Typography>
        {editingDescription ? null : (
          <IconButton onClick={() => setEditingDescription(true)}>
            <EditIcon />
          </IconButton>
        )}
      </Box>
      {editingDescription ? (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveDescription}
              disabled={loading || !newDescription.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setEditingDescription(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {videoData.description}
        </Typography>
      )}
    </Paper>
  </>
);

export default VideoDetails; 