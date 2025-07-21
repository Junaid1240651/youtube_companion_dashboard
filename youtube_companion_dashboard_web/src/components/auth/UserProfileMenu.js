import React from 'react';
import { Avatar, Menu, MenuItem, Typography, Divider, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const UserProfileMenu = ({ userProfile, anchorEl, openMenu, handleProfileMenuOpen, handleMenuClose, handleLogout }) => (
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
);

export default UserProfileMenu; 