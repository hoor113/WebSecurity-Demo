import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/balance', {
        withCredentials: true
      });
      if (response.data.success) {
        setBalance(response.data.balance);
      }
    } catch (error) {
      setMessage('Failed to fetch balance');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to My Website!
          </Typography>
          
          {user ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Hello, {user.username}!
              </Typography>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  component={Link} 
                  to="/profile" 
                  variant="contained" 
                  color="primary"
                  startIcon={<PersonIcon />}
                >
                  View Profile
                </Button>

                <Button
                  component={Link}
                  to="/comment"
                  variant="contained"
                  color="primary"
                  startIcon={<CommentIcon />}
                > 
                  Comment Demo
                </Button>
                      
                <Button 
                  component={Link} 
                  to="/logout" 
                  variant="outlined" 
                  color="error"
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
              </Box>

              {balance !== null && (
                <Typography variant="h5" color="primary" sx={{ my: 2 }}>
                  Your Balance: ${balance}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                Please log in or register to view your profile.
              </Typography>
              
              {/* <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="contained" 
                  color="primary"
                >
                  Login
                </Button>
                
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="outlined" 
                  color="primary"
                >
                  Register
                </Button>
              </Box> */}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 