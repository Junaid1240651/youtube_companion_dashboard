import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import LoginButton from './components/auth/LoginButton';
import UserProfileMenu from './components/auth/UserProfileMenu';
import VideoPlayer from './components/video/VideoPlayer';
import VideoDetails from './components/video/VideoDetails';
import CommentList from './components/comments/CommentList';
import CommentForm from './components/comments/CommentForm';
import NotesList from './components/notes/NotesList';
import NoteItem from './components/notes/NoteItem';
import './App.css';
import { videoAPI, notesAPI, userAPI } from './services/api.js';
import AlertMessage from './components/common/AlertMessage';
import TabsPanel from './components/common/TabsPanel';
import CommentIcon from '@mui/icons-material/Comment';
import NoteIcon from '@mui/icons-material/Note';
import ReplyDialog from './components/comments/ReplyDialog';
import NotesHeader from './components/notes/NotesHeader';
import NoteDialog from './components/notes/NoteDialog';
import ConfirmDialog from './components/common/ConfirmDialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function App() {
  // Default video ID - you can change this to your uploaded video ID
  const [videoId] = useState('dXcBh6d5g3U'); // Replace with your video ID
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
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type: 'comment' | 'reply' }
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [notes, setNotes] = useState([]); // State for notes
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });
  const [editingNote, setEditingNote] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteConfirmDeleteOpen, setNoteConfirmDeleteOpen] = useState(false);
  const [noteDeleteTarget, setNoteDeleteTarget] = useState(null); // note id
  const [noteStatusAlert, setNoteStatusAlert] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Simulate user authentication state (for demo)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // { name, avatarUrl }
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const backendAPIURL = process.env.REACT_APP_API_URL?.replace(/\/api$/, '');;

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
      await userAPI.logout();
    } catch (e) {
      // Ignore errors if endpoint does not exist
    }
  };

  // Check for login (for demo, check if google_oauth_tokens.json exists via backend endpoint)
  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const tryFetch = () => {
      userAPI.getUserInfo()
        .then(res => res.data)
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

  const loadVideoData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await videoAPI.getVideoDetails(videoId);
      setVideoData(res.data.data);
      setNewTitle(res.data.data.title);
      setNewDescription(res.data.data.description);
    } catch (error) {
      console.error('Error loading video data:', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const loadComments = useCallback(async () => {
    function markOwner(comments, userChannelId) {
      return comments.map(comment => ({
        ...comment,
        isOwnerComment: comment.authorChannelId === userChannelId,
        replies: comment.replies ? markOwner(comment.replies, userChannelId) : []
      }));
    }
    try {
      const res = await videoAPI.getComments(videoId);
      const userChannelId = userProfile?.channelId;
      const commentsWithOwner = markOwner(res.data.data, userChannelId);
      setComments(commentsWithOwner);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [videoId, userProfile]);

  const loadNotes = useCallback(async () => {
    try {
      const res = await notesAPI.getNotes(videoId);
      setNotes(res.data.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, [videoId]);

  useEffect(() => {
    if (isLoggedIn && videoId) {
      loadVideoData();
      loadComments();
      loadNotes();
    }
  }, [isLoggedIn, videoId, loadVideoData, loadComments, loadNotes]);

  // Helper: Redirect to Google OAuth if login is required
  const handleOAuthRedirect = () => {
    window.location.href = `${backendAPIURL}/auth/google`; // Adjust if backend is on a different host/port
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) return;
    
    try {
      setLoading(true);
      await videoAPI.updateVideo(videoId, { title: newTitle });
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
      setComments(prev => [
        { ...response.data.data, replies: [] }, // Ensure replies is always an array
        ...prev
      ]);
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
    setLoading(true);
    
    try {
      if (type === 'reply') {
        await videoAPI.deleteReply(commentId);
        setComments(prev => {
          const updated = prev
            .map(comment => {
              const newReplies = (comment.replies || []).filter(reply => reply.id !== commentId);
              if (newReplies.length !== (comment.replies || []).length) {
                return { ...comment, replies: newReplies };
              }
              return comment;
            })
            .filter(comment => true); // No top-level removal for replies
          return updated;
        });
        setAlert({ message: 'Reply deleted successfully!', severity: 'success' });
      } else {
        await videoAPI.deleteComment(commentId);
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setAlert({ message: 'Comment deleted successfully!', severity: 'success' });
      }
    } catch (error) {
      setAlert({ message: `Error deleting ${type === 'reply' ? 'reply' : 'comment'}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDelete = (id, type) => {
    
    setDeleteTarget({ id, type });
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setLoading(true);
      await handleDeleteComment(deleteTarget.id, true, deleteTarget.type);
      setDeleteTarget(null);
      setConfirmDeleteOpen(false);
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
          ? { ...comment, replies: Array.isArray(comment.replies) ? [...comment.replies, response.data.data] : [response.data.data] }
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

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setLoading(true);
    try {
      if (editingNote) {
        await notesAPI.updateNote(editingNote.id, formData);
        setNotes(prev => prev.map(note =>
          note.id === editingNote.id ? { ...note, ...formData } : note
        ));
        setAlert({ message: 'Note updated successfully!', severity: 'success' });
      } else {
        const response = await notesAPI.createNote(videoId, formData);
        setNotes(prev => [response.data.data, ...prev]);
        setAlert({ message: 'Note created successfully!', severity: 'success' });
      }
      setFormData({ title: '', content: '', category: 'general', priority: 'medium' });
      setEditingNote(null);
      setNoteDialogOpen(false); // Close dialog after successful submission
    } catch (error) {
      setAlert({ message: 'Error saving note', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority
    });
    setNoteDialogOpen(true); // Show dialog when editing
  };

  const handleDeleteNote = async (noteId) => {
    setLoading(true);
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setAlert({ message: 'Note deleted successfully!', severity: 'success' });
    } catch (error) {
      setAlert({ message: 'Error deleting note', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAddNote = () => {
    setNoteDialogOpen(true);
    setEditingNote(null);
    setFormData({ title: '', content: '', category: 'general', priority: 'medium' });
  };

  const handleRequestDeleteNote = (noteId) => {
    setNoteDeleteTarget(noteId);
    setNoteConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteNote = async () => {
    if (noteDeleteTarget) {
      setLoading(true);
      await handleDeleteNote(noteDeleteTarget);
      setNoteDeleteTarget(null);
      setNoteConfirmDeleteOpen(false);
      setLoading(false);
    }
  };

  const handleToggleNoteCompleted = async (noteId) => {
    setLoading(true);
    try {
      const response = await notesAPI.toggleCompletion(noteId);
      setNotes(prev => prev.map(note => note.id === noteId ? response.data.data : note));
      setNoteStatusAlert(true);
    } catch (error) {
      setAlert({ message: 'Error updating note status', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (categoryFilter !== 'all' && note.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && note.priority !== priorityFilter) return false;
    return true;
  });

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
        <LoginButton onClick={handleGoogleLogin} />
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
            <UserProfileMenu
              userProfile={userProfile}
                anchorEl={anchorEl}
              openMenu={openMenu}
              handleProfileMenuOpen={handleProfileMenuOpen}
              handleMenuClose={handleMenuClose}
              handleLogout={handleLogout}
            />
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
          <LoginButton onClick={handleGoogleLogin} />
        </Box>
      ) : (
        <Container maxWidth="md" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card elevation={4} sx={{ borderRadius: 4, overflow: 'visible', mb: 4, width: '100%', maxWidth: 700 }}>
            <Box sx={{ position: 'relative', pt: '56.25%' }}>
              <VideoPlayer videoId={videoData.id} title={videoData.title} />
              <Chip
                label={videoData.status}
                color={videoData.status === 'public' ? 'success' : 'warning'}
                size="small"
                sx={{ position: 'absolute', top: 16, right: 16, textTransform: 'capitalize' }}
              />
            </Box>
            <CardContent>
              <VideoDetails
                videoData={videoData}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                handleSaveTitle={handleSaveTitle}
                loading={loading}
                editingDescription={editingDescription}
                setEditingDescription={setEditingDescription}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                handleSaveDescription={handleSaveDescription}
                formatNumber={formatNumber}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
          {/* Comments */}
          <TabsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={[{
              label: 'COMMENTS',
              count: comments.length,
              icon: <CommentIcon />,
              content: <>
                <CommentForm
                  newComment={newComment}
                  setNewComment={setNewComment}
                  handleAddComment={handleAddComment}
                  loading={loading}
                />
                <CommentList
                  comments={comments}
                  userProfile={userProfile}
                  expandedReplies={expandedReplies}
                  toggleReplies={toggleReplies}
                  setReplyTo={setReplyTo}
                  setOpenReplyDialog={setOpenReplyDialog}
                  setDeleteTarget={setDeleteTarget}
                  setConfirmDeleteOpen={setConfirmDeleteOpen}
                  deletingId={null} // Removed deletingId
                  onDelete={handleRequestDelete}
                />
              </>
            }, {
              label: 'NOTES',
              count: notes.length,
              icon: <NoteIcon />,
              content: <>
                <NotesHeader
                  notesCount={notes.length}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  priorityFilter={priorityFilter}
                  setPriorityFilter={setPriorityFilter}
                  onAddNote={handleStartAddNote}
                />
                {noteStatusAlert && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#e6f4ea', color: '#388e3c', borderRadius: 2, px: 3, py: 2, fontWeight: 600, fontSize: 18 }}>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 28 }} />
                      Note status updated!
                    </Box>
                  </Box>
                )}
                {filteredNotes.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {notes.length === 0
                        ? 'No notes found. Create your first note to get started!'
                        : 'No notes found for the selected filters.'}
                    </Typography>
                  </Box>
                ) : (
                  <NotesList
                    notes={filteredNotes}
                    renderNoteItem={note => (
                      <NoteItem
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={() => handleRequestDeleteNote(note.id)}
                        onToggleCompleted={() => handleToggleNoteCompleted(note.id)}
                      />
                    )}
                    header={null}
                  />
                )}
              </>
            }]}
          />
          <AlertMessage alert={alert} handleAlertClose={handleAlertClose} />
          <NoteDialog
            open={noteDialogOpen}
            onClose={() => { setNoteDialogOpen(false); setEditingNote(null); }}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleNoteSubmit}
            loading={loading}
            editingNote={editingNote}
          />
        </Container>
      )}
      <ReplyDialog
        open={openReplyDialog}
        onClose={() => setOpenReplyDialog(false)}
        replyTo={replyTo}
        replyText={replyText}
        setReplyText={setReplyText}
        handleAddReply={handleAddReply}
        loading={loading}
        replyingId={null} // Removed replyingId
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete this ${deleteTarget?.type || 'comment'}?`}
        confirmText="DELETE"
        cancelText="CANCEL"
        loading={loading}
      />
      <ConfirmDialog
        open={noteConfirmDeleteOpen}
        onClose={() => setNoteConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDeleteNote}
        message="Are you sure you want to delete this note?"
        confirmText="DELETE"
        cancelText="CANCEL"
        loading={loading}
      />
    </Box>
  );
}

export default App;
