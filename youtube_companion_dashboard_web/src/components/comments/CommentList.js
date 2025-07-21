import React from 'react';
import { List, Divider, Collapse, Box, Typography, IconButton, Avatar, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, CircularProgress } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CommentList = ({
  comments,
  userProfile,
  expandedReplies,
  toggleReplies,
  setReplyTo,
  setOpenReplyDialog,
  deletingId,
  onDelete
}) => (
  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
    {comments.map((comment) => (
      <React.Fragment key={comment.id}>
        {/* Top-level comment */}
        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
          <Avatar
            src={comment.isOwnerComment
              ? (!userProfile?.avatarUrl && userProfile?.name && userProfile.name.replace(/^@/, '').trim().charAt(0).toUpperCase())
              : (!comment.avatarUrl && comment.authorName && comment.authorName.replace(/^@/, '').trim().charAt(0).toUpperCase())}
            sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}
          >
            {comment.isOwnerComment
              ? (!userProfile?.avatarUrl && userProfile?.name && userProfile.name.replace(/^@/, '').trim().charAt(0).toUpperCase())
              : (!comment.avatarUrl && comment.authorName && comment.authorName.replace(/^@/, '').trim().charAt(0).toUpperCase())}
          </Avatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ bgcolor: '#eee', px: 1, borderRadius: 1 }}>
                  {comment.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {/* You can pass formatDate as a prop if needed */}
                  {comment.publishedAt}
                </Typography>
              </Box>
            }
            secondary={
              <Typography variant="body2" sx={{ mt: 1 }}>
                {comment.text}
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Reply">
                <IconButton size="small" onClick={() => { setReplyTo(comment); setOpenReplyDialog(true); }}>
                  <ReplyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {comment.isOwnerComment && (
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => onDelete(comment.id, 'comment')} color="error" disabled={deletingId === comment.id}>
                    {deletingId === comment.id ? <CircularProgress size={20} color="error" /> : <DeleteIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
        {/* Replies toggle */}
        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <Box sx={{ pl: 8, display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }} onClick={() => toggleReplies(comment.id)}>
            <ReplyIcon fontSize="small" sx={{ color: 'primary.main', mr: 0.5 }} />
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mr: 0.5 }}>
              {expandedReplies[comment.id] ? 'Hide' : `1 reply${comment.replies.length > 1 ? 'ies' : ''}`.replace('1 replyies', `${comment.replies.length} replies`)}
            </Typography>
            {expandedReplies[comment.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Box>
        )}
        {/* Replies (collapsible) */}
        <Collapse in={!!expandedReplies[comment.id]} timeout="auto" unmountOnExit>
          {(comment.replies || []).map((reply) => (
            <ListItem key={reply.id} sx={{ ml: 8, pl: 0, px: 0, bgcolor: '#f7f7f7', borderRadius: 2, my: 1, maxWidth:'88%' }}>
              <Avatar
                src={
                  reply.isOwnerComment
                    ? userProfile?.avatarUrl || undefined
                    : reply.avatarUrl || undefined
                }
                sx={{
                  mr: 2,
                  bgcolor: 'secondary.main',
                  width: 32,
                  height: 32,
                  marginLeft: '10px',
                }}
              >
                {
                  reply.isOwnerComment
                    ? (!userProfile?.avatarUrl &&
                      userProfile?.name?.replace(/^@/, '').trim().charAt(0).toUpperCase())
                    : (!reply.avatarUrl &&
                      reply.authorName?.replace(/^@/, '').trim().charAt(0).toUpperCase())
                }
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ bgcolor: '#dbd9d5', px: 1, borderRadius: 1 }}>
                      {reply.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reply.publishedAt}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {reply.text}
                  </Typography>
                }
              />
              {reply.isOwnerComment && (
                <ListItemSecondaryAction>
                  <IconButton sx={{marginRight:'10px'}} size="small" onClick={() => onDelete(reply.id, 'reply')} color="error" disabled={deletingId === reply.id}>
                    {deletingId === reply.id ? <CircularProgress size={20} color="error" /> : <DeleteIcon fontSize="small" />}
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </Collapse>
        <Divider sx={{ my: 1 }} />
      </React.Fragment>
    ))}
  </List>
);

export default CommentList; 