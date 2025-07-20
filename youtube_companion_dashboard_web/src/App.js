import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
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
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Collapse,
  Snackbar,
  Alert as MuiAlert
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
import GoogleIcon from '@mui/icons-material/Google';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LogoutIcon from '@mui/icons-material/Logout';

// Utility to decode HTML entities
function decodeHtmlEntities(str) {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function App() {
  // Default video ID - you can change this to your uploaded video ID
  const [videoId, setVideoId] = useState('2ixomGQdCXk'); // Replace with your video ID
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
  const [activeTab, setActiveTab] = useState(0);
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }
  const [alert, setAlert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type: 'comment' | 'reply' }
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Simulate user authentication state (for demo)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // { name, avatarUrl }
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const backendAPIURL = process.env.REACT_APP_API_URL?.replace(/\/api$/, '');;
  console.log(backendAPIURL);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    handleMenuClose();
    try {
      // Try to call backend logout endpoint if it exists
      await fetch(`${backendAPIURL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Ignore errors if endpoint does not exist
    }
  };

  // Check for login (for demo, check if google_oauth_tokens.json exists via backend endpoint)
  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const tryFetch = () => {
      fetch(`${backendAPIURL}/api/userinfo`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.name) {
            setIsLoggedIn(true);
            setUserProfile(data);
          } else if (attempts < 3 && !cancelled) {
            attempts++;
            setTimeout(tryFetch, 500); // retry after 1s
          } else {
            setIsLoggedIn(false);
            setUserProfile(null);
          }
        })
        .catch(() => {
          if (attempts < 3 && !cancelled) {
            attempts++;
            setTimeout(tryFetch, 500);
          } else {
            setIsLoggedIn(false);
            setUserProfile(null);
          }
        });
    };

    tryFetch();

    return () => { cancelled = true; };
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${backendAPIURL}/auth/google`;
  };

  // Load video data and comments on component mount
  useEffect(() => {
    if (isLoggedIn && videoId) {
      loadVideoData();
      loadComments();
    }
  }, [isLoggedIn, videoId]);



  const loadVideoData = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideoDetails(videoId);
      setVideoData(response.data.data);
      setNewTitle(response.data.data.title);
      setNewDescription(response.data.data.description);
    } catch (error) {
      console.error('Error loading video data:', error);
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
    }
  };

  // Helper: Redirect to Google OAuth if login is required
  const handleOAuthRedirect = () => {
    window.location.href = `${backendAPIURL}/auth/google`; // Adjust if backend is on a different host/port
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) return;
    
    try {
      setLoading(true);
      const response = await videoAPI.updateVideo(videoId, { title: newTitle });
      setVideoData(prev => ({ ...prev, title: newTitle }));
      setEditingTitle(false);
      setAlert({ message: 'Title updated successfully!', severity: 'success' });
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error updating title:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    try {
      setLoading(true);
      await videoAPI.updateVideo(videoId, { description: newDescription });
      setVideoData(prev => ({ ...prev, description: newDescription }));
      setEditingDescription(false);
      setAlert({ message: 'Description updated successfully!', severity: 'success' });
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error updating description:', error);
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
      setAlert({ message: 'Comment added successfully!', severity: 'success' });
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId, silent = false, type = 'comment') => {
    if (!silent) {
      setDeleteTarget({ id: commentId, type }); // type: 'comment' or 'reply'
      setConfirmDeleteOpen(true);
      return;
    }
    try {
      setLoading(true);
      if (type === 'reply') {
        await videoAPI.deleteReply(commentId);
      } else {
        await videoAPI.deleteComment(commentId);
      }
      setComments(prev =>
        prev
          .map(comment => {
            // Remove reply from replies array if it exists
            const newReplies = (comment.replies || []).filter(reply => reply.id !== commentId);
            if (newReplies.length !== (comment.replies || []).length) {
              return { ...comment, replies: newReplies };
            }
            return comment;
          })
          // Remove top-level comment if it matches
          .filter(comment => type === 'comment' ? comment.id !== commentId : true)
      );
      setAlert({ message: type === 'reply' ? 'Reply deleted successfully!' : 'Comment deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting', type, error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setConfirmingDelete(true);
      await handleDeleteComment(deleteTarget.id, true, deleteTarget.type);
      setDeleteTarget(null);
      setConfirmDeleteOpen(false);
      setConfirmingDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setConfirmDeleteOpen(false);
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    try {
      setLoading(true);
      setReplyingId(commentId);
      const response = await videoAPI.addReply(commentId, replyText);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, response.data.data] }
          : comment
      ));
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
      
      setReplyText('');
      setReplyTo(null);
      setOpenReplyDialog(false);
      setAlert({ message: 'Reply added successfully!', severity: 'success' });
    } catch (error) {
      if (error.response && (error.response.data?.error?.includes('Login Required') || error.response.status === 401)) {
        setTimeout(handleOAuthRedirect, 1500);
        return;
      }
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
      setReplyingId(null);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
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

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:'white'
      }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome to YouTube Companion Dashboard
        </Typography>
        <Button
          color="primary"
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          size="large"
        >
          Login with Google
        </Button>
      </Box>
    );
  }

  // Show loading state if video data is not loaded (but user is logged in)
  if (!videoData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

console.log(userProfile);

  // Toast close handler
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setAlert(null);
  };

  return (
    <Box sx={{ bgcolor: '#fff' }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            YouTube Companion Dashboard
          </Typography>
          {isLoggedIn && userProfile && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={handleProfileMenuOpen}
                aria-controls={openMenu ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
              >
                <Avatar
                  src={userProfile.avatarUrl}
                  sx={{ width: 32, height: 32, mr: 1 }}
                >
                  {!userProfile.avatarUrl && userProfile.name && userProfile.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500 }}
                >
                  {userProfile.name}
                </Typography>
              </Box>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    borderRadius: 2,
                    minWidth: 220,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    mt: 1,
                  },
                }}
                MenuListProps={{
                  sx: { p: 0 },
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, px: 2 }}>
                  <Avatar src={userProfile.avatarUrl} sx={{ width: 56, height: 56, mb: 1 }}>
                    {!userProfile.avatarUrl && userProfile.name && userProfile.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {userProfile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {userProfile.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ fontWeight: 500, fontSize: 16, justifyContent: 'center', py: 1.5, color: 'primary.main' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {!isLoggedIn ? (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Welcome to YouTube Companion Dashboard
          </Typography>
          <Button
            color="primary"
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            size="large"
          >
            Login with Google
          </Button>
        </Box>
      ) : (
        <Container maxWidth="md" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card elevation={4} sx={{ borderRadius: 4, overflow: 'visible', mb: 4, width: '100%', maxWidth: 700 }}>
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
            </CardContent>
          </Card>
          <Box sx={{ width: '100%', maxWidth: 700 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fff' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Comments" icon={<CommentIcon />} />
                <Tab label="Notes" icon={<NoteIcon />} />
              </Tabs>
              {activeTab === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Comments ({comments.length})
                  </Typography>
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
                                  {formatDate(comment.publishedAt)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {decodeHtmlEntities(comment.text)}
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
                                  <IconButton size="small" onClick={() => {
                                    setDeleteTarget({ id: comment.id, type: 'comment' });
                                    setConfirmDeleteOpen(true);
                                  }} color="error" disabled={deletingId === comment.id}>
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
                                      {formatDate(reply.publishedAt)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {decodeHtmlEntities(reply.text)}
                                  </Typography>
                                }
                              />
                              {reply.isOwnerComment && (
                                <ListItemSecondaryAction>
                                  <IconButton sx={{marginRight:'10px'}} size="small" onClick={() => {
                                    setDeleteTarget({ id: reply.id, type: 'reply' });
                                    setConfirmDeleteOpen(true);
                                  }} color="error" disabled={deletingId === reply.id}>
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
                </>
              )}
              {activeTab === 1 && (
                <Notes videoId={videoId} />
              )}
            </Paper>
          </Box>
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
                disabled={!replyText.trim() || loading}
                startIcon={replyingId === replyTo?.id && loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {replyingId === replyTo?.id && loading ? 'Replying...' : 'Reply'}
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={!!alert}
            autoHideDuration={3000}
            onClose={handleAlertClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            {alert && (
              <MuiAlert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
                {alert.message}
              </MuiAlert>
            )}
          </Snackbar>
          <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
            <DialogTitle>Are you sure you want to delete this {deleteTarget?.type}?</DialogTitle>
            <DialogActions>
              <Button onClick={handleCancelDelete} disabled={confirmingDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={confirmingDelete} startIcon={confirmingDelete ? <CircularProgress size={16} color="inherit" /> : null}>
                {confirmingDelete ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </Box>
  );
}

export default App;
