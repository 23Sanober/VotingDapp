import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';
import Web3 from 'web3'; 
import { Paper, Stack, Button, TextField, Typography } from '@mui/material';

const Login = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleMetaMaskConfirm = async () => {
    try {
      if (window.ethereum) {
        console.log('Connecting to MetaMask...');
        
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        const accounts = await web3.eth.getAccounts();
        console.log('MetaMask Accounts:', accounts);
  
        if (accounts.length === 0) {
          throw new Error('Please connect to MetaMask.');
        }
  
        if (accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
          throw new Error('MetaMask address does not match the entered wallet address.');
        }
  
        const message = "Please sign this message to confirm your wallet ownership.";
        
        const password = ''; 
        
        const signature = await web3.eth.personal.sign(message, accounts[0], password);
        console.log('Signature:', signature);
  
        return accounts[0]; 
      } else {
        throw new Error('MetaMask is not installed.');
      }
    } catch (error) {
      console.error('MetaMask Error:', error.message || error);
      setMessage(error.message || 'Wallet confirmation failed.');
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    console.log('Wallet Address Entered:', walletAddress);

    const confirmedAddress = await handleMetaMaskConfirm();
    console.log('Confirmed Address:', confirmedAddress);

    if (!confirmedAddress) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending login request to backend with:', { walletAddress: confirmedAddress });

      const response = await axios.post('http://localhost:5003/login', {
        walletAddress: confirmedAddress
      });

      console.log('Backend Response:', response.data);

      const { token, message: successMessage } = response.data;

      if (token) {
        login(token); 
        setMessage(successMessage || 'Login successful.');
        navigate('/dashboard');
      } else {
        setMessage('Authentication token not provided.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      if (error.response) {
        setMessage(error.response.data.message || 'Login failed.');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 400, margin: 'auto' }}>
      <form onSubmit={handleLogin}>
        <Stack gap={3}>
          <Typography variant="h4" align="center">Login</Typography>
          <TextField
            label="Wallet Address"
            variant="filled"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
          {message && <Typography color="error">{message}</Typography>}
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>

          <Typography variant="h6" textAlign="center" color="text.primary">
            Don’t have an account?{' '} 
            <Link to="/register" style={{ textDecoration: 'none', color: '#3f51b5' }}>
              Sign up
            </Link>
          </Typography>
        </Stack>
      </form>
    </Paper>
  );
};

export default Login;