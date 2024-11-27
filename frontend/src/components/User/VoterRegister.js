import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig'; 

function UserBlockchainRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    address: '',
  });
  const [message, setMessage] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const accounts = await web3.eth.getAccounts();
          if (accounts.length === 0) {
            setMessage('Please connect to MetaMask.');
            return;
          }

          const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          const voterStatus = await electionContract.methods.getVoterStatus().call({ from: accounts[0] });

          console.log('Voter Status:', voterStatus);

          
          const isApproved = voterStatus[0];
          const isDeclined = voterStatus[1];
          const adminComment = voterStatus[2];

        
          if (isApproved) {
            setRegistrationStatus('Approved');
            setComment(adminComment);
          } else if (isDeclined) {
            setRegistrationStatus('Declined');
            setComment(adminComment);
          } else {
            setRegistrationStatus('Pending Approval');
          }
        } catch (error) {
          console.error('Error fetching voter status:', error);
          setMessage('Error fetching voter status. Please try again.');
        }
      }
    };

    checkRegistrationStatus();
    const interval = setInterval(() => {
      checkRegistrationStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegistration = async () => {
    if (!formData.name || !formData.dob || !formData.gender || !formData.address) {
      setMessage('All fields are required.');
      return;
    }
  
    if (!window.ethereum) {
      setMessage('MetaMask is not installed. Please install MetaMask to proceed.');
      return;
    }
  
    setIsLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setMessage('Please connect to MetaMask.');
        setIsLoading(false);
        return;
      }
  
      const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
      await electionContract.methods.registerVoter(
        formData.name,
        formData.dob,
        formData.gender,
        formData.address
      ).send({ from: accounts[0] });
  
      setMessage('Registration request sent successfully. Please wait for admin approval.');
      setRegistrationStatus('Pending Approval');
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Failed to register. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Voter Registration</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {}
      {registrationStatus && (
        <div className={`alert ${registrationStatus === 'Approved' ? 'alert-success' : registrationStatus === 'Declined' ? 'alert-danger' : 'alert-warning'} mt-4`}>
          <h5>Registration Status: {registrationStatus}</h5>
          {comment && (
            <p>Admin Comment: <strong>{comment}</strong></p>
          )}
        </div>
      )}

      {}
      {registrationStatus !== 'Approved' && (
        <form>
          {}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {}
          <div className="mb-3">
            <label htmlFor="dob" className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          {}
          <div className="mb-3">
            <label className="form-label">Gender</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                id="genderMale"
                value="Male"
                checked={formData.gender === 'Male'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="genderMale">
                Male
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="gender"
                id="genderFemale"
                value="Female"
                checked={formData.gender === 'Female'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="genderFemale">
                Female
              </label>
            </div>
          </div>

          {}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {}
          <button
            type="button"
            className="btn btn-primary mt-3"
            disabled={isLoading}
            onClick={handleRegistration}
          >
            {isLoading ? 'Registering...' : 'Register with MetaMask'}
          </button>
        </form>
      )}
    </div>
  );
}

export default UserBlockchainRegistration;