import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; 

const ADMIN_ADDRESS = ""; 

const AdminLogin = () => {
  const [inputAddress, setInputAddress] = useState(ADMIN_ADDRESS);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const { loginAdmin } = useAuth(); 

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();

          if (accounts.length === 0) {
            setMessage('No accounts found. Please connect MetaMask.');
            return;
          }

        } catch (error) {
          if (error.code === 4001) {
            setMessage('Permission to access MetaMask denied.');
          } else {
            setMessage('Please install MetaMask or use a Web3 compatible browser.');
            console.error(error);
          }
        }
      } else {
        setMessage('MetaMask is not installed. Please install MetaMask to use this feature.');
      }
    };

    init();
  }, []);

  const handleCheckAdmin = () => {
    if (!inputAddress) {
      setMessage('Please enter a valid Ethereum address.');
      return;
    }

    setLoading(true);

    if (inputAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      loginAdmin(); 
      setMessage('Address is an Admin. Redirecting...');

      setTimeout(() => {
        navigate('/admin-dashboard'); 
      }, 1000);
    } else {
      setMessage('Entered address is not an Admin.');
    }

    setLoading(false);
  };

  const handleGoToUserLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body">
          <h3 className="card-title text-center">Admin Login</h3>
          <p className="text-center">{message}</p>

          <div className="mb-3">
            <label htmlFor="inputAddress" className="form-label">Enter Ethereum Address</label>
            <input
              type="text"
              className="form-control"
              id="inputAddress"
              placeholder="Paste Admin Address Here"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
            />
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-primary"
              onClick={handleCheckAdmin}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Admin Status'}
            </button>
          </div>

          <div className="d-grid gap-2 mt-3">
            <button
              className="btn btn-secondary"
              onClick={handleGoToUserLogin}
            >
              Go to User Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
