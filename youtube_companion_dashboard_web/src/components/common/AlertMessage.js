import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const AlertMessage = ({ alert, handleAlertClose }) => (
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
);

export default AlertMessage; 