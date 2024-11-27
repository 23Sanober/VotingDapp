import React, { useState } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig';

const Results = () => {
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      // Get candidates and results for the election ID
      const results = await electionContract.methods.getElectionResults(electionId).call();

      const formattedCandidates = results.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        voteCount: Number(candidate.voteCount),
      }));

      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error fetching election results:', error);
      setMessage('Failed to fetch election results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>User - Election Results</h2>

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
        </div>
      )}
    </div>
  );
};

export default Results;