import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { logout } from '../../services/api';
import { CircularProgress, Box, Typography } from '@mui/material';

const Logout = () => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API endpoint
        await logout();
        
        // Clear CSRF token from localStorage
        localStorage.removeItem('csrfToken');
        
        // Clear any other auth tokens or user data from storage
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Clear cookies by setting them to expire in the past
        document.cookie.split(';').forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });
        
        // Reset the user context to null
        setUser(null);
      } catch (err) {
        console.error('Logout error:', err);
        setError('Failed to logout properly. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    performLogout();
  }, [setUser]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Logging out...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography color="error" variant="body1">
          {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          You will be redirected to the home page in 3 seconds...
        </Typography>
        {setTimeout(() => <Navigate to="/" replace />, 3000)}
      </Box>
    );
  }

  // Redirect to home page after successful logout
  return <Navigate to="/" replace />;
};

export default Logout;
