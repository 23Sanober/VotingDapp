import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig'; 

const CandidateManagement = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState({});
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [candidateNames, setCandidateNames] = useState({}); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();

        setAccount(accounts[0]);
        const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(electionContract);

        // Get all elections
        const electionsData = await electionContract.methods.getElections().call();
        setElections(electionsData);
      } else {
        setMessage('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const handleAddCandidate = async (electionId) => {
    const candidateName = candidateNames[electionId]; 
    if (!candidateName) {
      setMessage('Please enter a candidate name.');
      return;
    }

    try {
      await contract.methods.addCandidate(electionId, candidateName).send({ from: account });
      setMessage(`Candidate "${candidateName}" added successfully to election ID: ${electionId}.`);
      setCandidateNames((prev) => ({
        ...prev,
        [electionId]: '', 
      }));
      fetchCandidates(electionId);
    } catch (error) {
      setMessage('Failed to add candidate.');
      console.error(error);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const candidatesData = await contract.methods.getCandidates(electionId).call();
      setCandidates((prev) => ({
        ...prev,
        [electionId]: candidatesData,
      }));
    } catch (error) {
      setMessage('Error fetching candidates.');
      console.error(error);
    }
  };

  const handleDeleteCandidate = async (electionId, candidateId) => {
    try {
      await contract.methods.deleteCandidate(electionId, candidateId).send({ from: account });
      setMessage(`Candidate ID: ${candidateId} deleted successfully from election ID: ${electionId}.`);
      fetchCandidates(electionId);
    } catch (error) {
      setMessage('Failed to delete candidate.');
      console.error(error);
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const handleCandidateNameChange = (electionId, value) => {
    setCandidateNames((prev) => ({
      ...prev,
      [electionId]: value, 
    }));
  };

  return (
    <div className="container mt-5">
      <h2>Candidate Management</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {elections.length === 0 ? (
        <p>No elections available.</p>
      ) : (
        elections.map((election) => (
          <div key={election.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{election.name}</h5>
              <p><strong>Active:</strong> {election.active ? 'Yes' : 'No'}</p>
              <p><strong>End Date:</strong> {formatDateTime(election.endTime)}</p>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Candidate Name"
                  value={candidateNames[election.id] || ''} 
                  onChange={(e) => handleCandidateNameChange(election.id, e.target.value)}
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => handleAddCandidate(election.id)}
                >
                  Add Candidate
                </button>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => fetchCandidates(election.id)}
              >
                Show Candidates
              </button>
              <ul className="list-group mt-3">
                {candidates[election.id] &&
                  candidates[election.id].map((candidate) => (
                    <li key={candidate.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        {candidate.name} - Votes: {candidate.voteCount}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCandidate(election.id, candidate.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CandidateManagement;