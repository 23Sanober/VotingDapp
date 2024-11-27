import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig'; 

const ElectionResults = () => {
  const [account, setAccount] = useState('');
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } else {
        alert('Please install MetaMask');
      }
    };

    loadAccount();
  }, []);

  const fetchResults = async () => {
    if (!electionId) {
      setMessage('Please enter an Election ID.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const web3 = new Web3(window.ethereum);
      const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      const results = await electionContract.methods.getElectionResults(electionId).call();
      const isPublished = await electionContract.methods.resultsPublished(electionId).call();

      const formattedCandidates = results.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        voteCount: Number(candidate.voteCount),
      }));

      setCandidates(formattedCandidates);
      setResultsPublished(isPublished);
    } catch (error) {
      console.error('Error fetching election results:', error);
      setMessage('Failed to fetch election results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const publishResults = async () => {
    if (!electionId) {
      setMessage('Please enter an Election ID.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const web3 = new Web3(window.ethereum);
      const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await electionContract.methods.publishResults(electionId).send({ from: account });

      setMessage('Results published successfully.');
      setResultsPublished(true);
    } catch (error) {
      console.error('Error publishing results:', error);
      setMessage('Failed to publish results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin - Election Results</h2>

      <div className="mb-3">
        <label htmlFor="electionId" className="form-label">Election ID</label>
        <input
          type="text"
          className="form-control"
          id="electionId"
          placeholder="Enter Election ID"
          value={electionId}
          onChange={(e) => setElectionId(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={fetchResults} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Results'}
      </button>

      {message && <div className="alert alert-info mt-3">{message}</div>}

      {candidates.length > 0 && (
        <div className="mt-5">
          <h3>Results for Election ID: {electionId}</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Candidate Name</th>
                <th>Votes Received</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.id}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.voteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {resultsPublished ? (
            <div className="alert alert-success mt-3">Results have been published.</div>
          ) : (
            <button className="btn btn-success mt-3" onClick={publishResults}>
              Publish Results
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ElectionResults;