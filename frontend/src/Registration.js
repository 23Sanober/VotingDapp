
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Web3 from 'web3'; 
import {  Paper, Stack, Button, TextField, Typography } from '@mui/material';

const Registration = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const confirmedAddress = await handleMetaMaskConfirm();

    if (!confirmedAddress) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5003/register', {
        walletAddress: confirmedAddress
      });

      setMessage(response.data.message);
      navigate('/login'); 
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Registration failed.');
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 400, margin: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Typography variant="h4" align="center">Register</Typography>
          <TextField
            label="Wallet Address"
            variant="filled"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
          {message && <Typography color="error">{message}</Typography>}
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>

          <Typography variant="h6" textAlign="center" color="text.primary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#3f51b5' }}>
              Log In
            </Link>
          </Typography>
        </Stack>
      </form>
    </Paper>
  );
};

export default Registration;