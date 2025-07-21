import React from 'react';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';

const LoginButton = ({ onClick }) => (
  <Button
    color="primary"
    variant="contained"
    startIcon={<GoogleIcon />}
    onClick={onClick}
    size="large"
  >
    Login with Google
  </Button>
);

export default LoginButton; 