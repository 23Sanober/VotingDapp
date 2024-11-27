import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTachometerAlt, FaPoll, FaUsers, FaClipboardList, FaCog, FaEthereum } from 'react-icons/fa';
import { useState, useEffect } from 'react';  
import axios from 'axios';  
import Web3 from 'web3';    
import './Setting/Button64.css';

const Sidebar = () => {

  const [profilePhoto, setProfilePhoto] = useState(null);  
  const [, setWalletAddress] = useState('');  

  const location = useLocation();

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          setWalletAddress(accounts[0]);
  
          // Fetch profile photo from backend
          const response = await axios.get(`http://localhost:5003/profile/${accounts[0]}`);
  
          if (response.data.profilePhoto) {
            // Construct the IPFS URL for the profile photo
            setProfilePhoto(`https://gateway.pinata.cloud/ipfs/${response.data.profilePhoto}`);
          }
        } else {
          console.log('Please install MetaMask.');
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };
  
    fetchProfilePhoto();
  }, []);
  return (
    <nav className="p-4 fixed-left" 
    style={{ 
      height: '100vh', 
      backgroundColor: 'black',  
      color: '#f8f9fa'  
    }}>
      {}
      <div className="text-center mb-4">
  {profilePhoto ? (
    <img
      src={profilePhoto} 
      alt="User Profile"
      className="rounded-circle mb-2"
      style={{ width: '80px', height: '80px' }}
    />
  ) : (
    <img
      src="/default-profile.png"  
      alt="Default Profile"
      className="rounded-circle mb-2"
      style={{ width: '80px', height: '80px' }}
    />
  )}
  <h5 className="text-light">Sanu</h5>
  
</div>

      {/* Menu */}
      <h4 className="text-center mb-4">Menu</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
            <span className="text">
              <FaTachometerAlt className="me-2" /> Dashboard
            </span>
          </Link>
        </li>
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/ballot' ? 'active' : ''}`} to="/ballot">
            <span className="text">
              <FaClipboardList className="me-2" /> View Ballots
            </span>
          </Link>
        </li>
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/vote' ? 'active' : ''}`} to="/vote">
            <span className="text">
              <FaUsers className="me-2" /> Cast Vote
            </span>
          </Link>
        </li>
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/results' ? 'active' : ''}`} to="/results">
            <span className="text">
              <FaPoll className="me-2" /> Election Results
            </span>
          </Link>
        </li>

        {}
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/register-blockchain' ? 'active' : ''}`} to="/register-blockchain">
            <span className="text">
              <FaEthereum className="me-2" /> Voter Registration
            </span>
          </Link>
        </li>

        
        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/candidate' ? 'active' : ''}`} to="/candidate">
            <span className="text">
              <FaEthereum className="me-2" /> Vote Verification
            </span>
          </Link>
        </li>

        <li className="nav-item mb-4">
          <Link className={`button-64 ${location.pathname === '/settings' ? 'active' : ''}`} to="/settings">
            <span className="text">
              <FaCog className="me-2" /> Settings
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );

};

export default Sidebar;