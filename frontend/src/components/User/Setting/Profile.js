
// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';

const Profile = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [uploadedImageHash, setUploadedImageHash] = useState(''); 
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    
    const fetchProfile = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          setWalletAddress(accounts[0]);

          const response = await axios.get(`http://localhost:5003/profile/${accounts[0]}`);
          setUploadedImageHash(response.data.profilePhoto); 
        } else {
          setMessage('Please connect to MetaMask.');
        }
      } catch (error) {
        setMessage('Error fetching profile.');
      }
    };

    fetchProfile();
  }, []);

  
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file); 
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!profilePhoto) {
      setMessage('Please select a profile photo.');
      setIsLoading(false);
      return;
    }

    try {
      
      const formData = new FormData();
      formData.append('file', profilePhoto);
      formData.append('walletAddress', walletAddress); 

      // Send image to Pinata via backend API
      const response = await axios.post('http://localhost:5003/updateProfile', formData);

      setUploadedImageHash(response.data.hash); 
      setMessage('Profile photo updated successfully.');
    } catch (error) {
      setMessage('Failed to update profile photo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="profilePhoto" className="form-label">Upload Profile Photo</label>
          <input
            type="file"
            className="form-control"
            id="profilePhoto"
            name="profilePhoto"
            onChange={handleProfilePhotoChange}
            required
          />
        </div>

        {uploadedImageHash && (
          <div className="mb-3">
            <label className="form-label">Current Profile Photo</label>
            <div>
              <img
                src={`https://gateway.pinata.cloud/ipfs/${uploadedImageHash}`} 
                alt="Profile"
                width="150"
                height="150"
                className="img-thumbnail"
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile Photo'}
        </button>

        {message && <div className="mt-3 alert alert-info">{message}</div>}
      </form>
    </div>
  );
};

export default Profile;