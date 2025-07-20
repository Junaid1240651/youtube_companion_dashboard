import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { videoAPI } from './services/api.js';
import Notes from './components/Notes.js';
import './App.css';

function App() {
  // Default video ID - you can change this to your uploaded video ID
  const [videoId, setVideoId] = useState('G47Tqj1rpOY'); // Replace with your video ID
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load video data and comments on component mount
  useEffect(() => {
    if (videoId) {
      loadVideoData();
      loadComments();
    }
  }, [videoId]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideoDetails(videoId);
      setVideoData(response.data.data);
      setNewTitle(response.data.data.title);
      setNewDescription(response.data.data.description);
    } catch (error) {
      console.error('Error loading video data:', error);
      showAlert('Error loading video data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await videoAPI.getComments(videoId);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error loading comments:', error);
      showAlert('Error loading comments', 'error');
    }
  };

  // Helper: Redirect to Google OAuth if login is required
  const handleOAuthRedirect = () => {
    window.location.href = 'http://localhost:3000/auth/google'; // Adjust if backend is on a different host/port
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) return;
    
    try {
      setLoading(true);
      const response = await videoAPI.updateVideo(videoId, { title: newTitle });
      setVideoData(prev => ({ ...prev, title: newTitle }));
      setEditingTitle(false);
      showAlert('Title updated successfully!');
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        showAlert('Login required. Redirecting to Google OAuth...', 'warning');
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error updating title:', error);
      showAlert('Error updating title', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.updateVideo(videoId, { description: newDescription });
      setVideoData(prev => ({ ...prev, description: newDescription }));
      setEditingDescription(false);
      showAlert('Description updated successfully!');
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        showAlert('Login required. Redirecting to Google OAuth...', 'warning');
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error updating description:', error);
      showAlert('Error updating description', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const response = await videoAPI.addComment(videoId, newComment);
      setComments(prev => [response.data.data, ...prev]);
      setNewComment('');
      showAlert('Comment added successfully!');
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        showAlert('Login required. Redirecting to Google OAuth...', 'warning');
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error adding comment:', error);
      showAlert('Error adding comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setLoading(true);
      await videoAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showAlert('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert('Error deleting comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    try {
      setLoading(true);
      const response = await videoAPI.addReply(commentId, replyText);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, response.data.data] }
          : comment
      ));
      
      setReplyText('');
      setReplyTo(null);
      setOpenReplyDialog(false);
      showAlert('Reply added successfully!');
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        showAlert('Login required. Redirecting to Google OAuth...', 'warning');
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error adding reply:', error);
      showAlert('Error adding reply', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Show loading state if video data is not loaded
  if (!videoData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            YouTube Companion Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={4} sx={{ borderRadius: 4, overflow: 'visible', mb: 4 }}>
          <Box sx={{ position: 'relative', pt: '56.25%' }}>
            {/* Responsive YouTube Player */}
            <iframe
              src={`https://www.youtube.com/embed/${videoData.id}`}
              title={videoData.title}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '16px 16px 0 0'
              }}
              allowFullScreen
            />
            <Chip
              label={videoData.status}
              color={videoData.status === 'public' ? 'success' : 'warning'}
              size="small"
              sx={{ position: 'absolute', top: 16, right: 16, textTransform: 'capitalize' }}
            />
          </Box>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {videoData.title}
            </Typography>
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
                      disabled={loading}
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
          </CardContent>
        </Card>
        <Grid container spacing={4}>
          {/* Right Side Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Comments" icon={<CommentIcon />} />
                <Tab label="Notes" icon={<NoteIcon />} />
              </Tabs>
              {activeTab === 0 && (
                <>
                  {/* Comments Section */}
                  <Typography variant="h6" gutterBottom>
                    Comments ({comments.length})
                  </Typography>
                  {/* Add Comment */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
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
                  <Divider sx={{ my: 2 }} />
                  {/* Comments List */}
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {comments.map((comment) => (
                      <React.Fragment key={comment.id}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {comment.authorName?.charAt(0) || 'U'}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">{comment.authorName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(comment.publishedAt)}
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
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Reply">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setReplyTo(comment);
                                    setOpenReplyDialog(true);
                                  }}
                                >
                                  <ReplyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {comment.isOwnerComment && (
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {/* Replies */}
                        {comment.replies && comment.replies.map((reply) => (
                          <ListItem key={reply.id} sx={{ pl: 6, px: 0 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 24, height: 24 }}>
                              {reply.authorName?.charAt(0) || 'U'}
                            </Avatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">{reply.authorName}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(reply.publishedAt)}
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
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>
                        ))}
                        <Divider sx={{ my: 1 }} />
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
              {activeTab === 1 && (
                <Notes videoId={videoId} />
              )}
            </Paper>
          </Grid>
        </Grid>
        {/* Reply Dialog */}
        <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => handleAddReply(replyTo?.id)} 
              variant="contained"
              disabled={!replyText.trim()}
            >
              Reply
            </Button>
          </DialogActions>
        </Dialog>
        {/* Floating Action Button for Upload */}
        <Fab
          color="primary"
          aria-label="upload video"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <PlayIcon />
        </Fab>
      </Container>
    </Box>
  );
}

export default App;
