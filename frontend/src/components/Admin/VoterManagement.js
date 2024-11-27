import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig';

const VoterManagement = () => {
  const [voters, setVoters] = useState([]);
  const [comments, setComments] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          const votersData = await electionContract.methods.getAllVoters().call();
          setVoters(votersData);

        
          electionContract.events.VoterApproved()
            .on('data', (event) => {
              console.log('Voter approved:', event.returnValues);
              init(); 
            });

          electionContract.events.VoterDeclined()
            .on('data', (event) => {
              console.log('Voter declined:', event.returnValues);
              init(); 
            });

        } catch (error) {
          console.error('Error fetching voter data:', error);
          setMessage('Error connecting to blockchain or fetching voter data.');
        }
      } else {
        setMessage('Please install MetaMask to use this application.');
      }
    };

    init();
  }, []);

  const handleApprove = async (voterAddress) => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await electionContract.methods.approveVoter(voterAddress).send({ from: accounts[0] });

      setMessage(`Voter with address ${voterAddress} approved successfully.`);
      setVoters(voters.map(voter => 
        voter.voterAddress === voterAddress ? { ...voter, isApproved: true, isDeclined: false } : voter
      ));
    } catch (error) {
      console.error('Approval error:', error);
      setMessage('Failed to approve voter.');
    }
  };

  const handleDecline = async (voterAddress, comment) => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await electionContract.methods.declineVoter(voterAddress, comment).send({ from: accounts[0] });

      setMessage(`Voter with address ${voterAddress} declined successfully.`);
      setVoters(voters.map(voter => 
        voter.voterAddress === voterAddress ? { ...voter, isApproved: false, isDeclined: true, comment } : voter
      ));
    } catch (error) {
      console.error('Decline error:', error);
      setMessage('Failed to decline voter.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Voter Management</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {voters.length === 0 ? (
        <p>No voter requests available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Address</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>User Address</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {voters.map((voter, index) => (
              <tr key={index}>
                <td>{voter.voterAddress}</td>
                <td>{voter.name}</td>
                <td>{voter.dob}</td>
                <td>{voter.gender}</td>
                <td>{voter.userAddress}</td>
                <td>
                  {voter.isApproved ? (
                    <span className="badge bg-success">Approved</span>
                  ) : voter.isDeclined ? (
                    <span className="badge bg-danger">Declined</span>
                  ) : (
                    <span className="badge bg-warning">Pending</span>
                  )}
                </td>
                <td>
                  {!voter.isApproved && !voter.isDeclined && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleApprove(voter.voterAddress)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleDecline(voter.voterAddress, comments[voter.voterAddress] || '')}
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add comment"
                    value={comments[voter.voterAddress] || ''}
                    onChange={(e) => setComments({ ...comments, [voter.voterAddress]: e.target.value })}
                    disabled={voter.isApproved || voter.isDeclined}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VoterManagement;