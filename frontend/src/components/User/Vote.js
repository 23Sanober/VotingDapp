import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig'; 

const Vote = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState({}); 
  const [message, setMessage] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(electionContract);

          // Get voter status 
          const voterStatus = await electionContract.methods.getVoterStatus().call({ from: accounts[0] });
          setIsApproved(voterStatus[0]); 

          // Get all elections
          const electionsData = await electionContract.methods.getElections().call();

         
          const formattedElections = electionsData.map((election) => ({
            id: Number(election.id), 
            name: election.name,
            active: election.active,
            endTime: Number(election.endTime), 
          }));

          setElections(formattedElections);

          // Get candidates for each election
          for (let i = 0; i < formattedElections.length; i++) {
            const electionId = formattedElections[i].id;
            const candidatesData = await electionContract.methods.getCandidates(electionId).call();

            setCandidates((prev) => ({
              ...prev,
              [electionId]: candidatesData.map((candidate) => ({
                id: Number(candidate.id), 
                name: candidate.name,
                voteCount: Number(candidate.voteCount),
              })),
            }));
          }
        } catch (error) {
          setMessage('Error connecting to the blockchain.');
          console.error(error);
        }
      } else {
        setMessage('Please install MetaMask to use this application.');
      }
    };

    init();
  }, []);

  const handleVote = async (electionId) => {
    if (!contract) {
      setMessage('Smart contract not loaded. Please try again.');
      return;
    }

    const selectedCandidate = selectedCandidates[electionId];
    if (!selectedCandidate) {
      setMessage('Please select a candidate to vote for.');
      return;
    }

    try {
      const gasEstimate = await contract.methods.vote(electionId, selectedCandidate).estimateGas({ from: account });
      await contract.methods.vote(electionId, selectedCandidate).send({ from: account, gas: gasEstimate });
      setMessage(`Vote successfully cast for candidate ${selectedCandidate} in election ${electionId}`);
    } catch (error) {
      console.error('Error casting vote:', error);
      setMessage('Failed to cast vote. See console for details.');
    }
  };

  const handleCandidateSelection = (electionId, candidateId) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [electionId]: candidateId, 
    }));
  };

  return (
    <div className="container mt-5">
      <h2>Cast Your Vote</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {isApproved ? (
        <div>
          <h3>Select an Election</h3>
          {elections.length === 0 ? (
            <p>No elections available at the moment.</p>
          ) : (
            <div className="row">
              {elections.map((election) => (
                <div key={election.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Election Name: {election.name}</h5>
                      <p>Status: {election.active ? 'Active' : 'Inactive'}</p>
                      <p>End Date: {new Date(election.endTime * 1000).toLocaleString()}</p>

                      <h6 className="mt-4">Candidates:</h6>
                      {candidates[election.id] && candidates[election.id].length > 0 ? (
                        <ul className="list-group mt-2">
                          {candidates[election.id].map((candidate) => (
                            <li
                              key={candidate.id}
                              className={`list-group-item d-flex justify-content-between align-items-center ${
                                selectedCandidates[election.id] === candidate.id ? 'active' : ''
                              }`}
                              onClick={() => handleCandidateSelection(election.id, candidate.id)}
                            >
                              {candidate.name}
                              <span className="badge bg-primary rounded-pill">{candidate.voteCount} Votes</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No candidates available for this election.</p>
                      )}
                      <button
                        className="btn btn-primary mt-3"
                        onClick={() => handleVote(election.id)}
                        disabled={!selectedCandidates[election.id]}
                      >
                        Cast Vote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>You are not approved to vote yet.</h3>
          <p>Please wait for the admin to approve your voter registration.</p>
        </div>
      )}
    </div>
  );
};

export default Vote;