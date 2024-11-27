import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ElectionManagementABI from '../../ElectionManagement.json'; 

const contractAddress = ""; 

const Ballot = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Initialize Web3 and connecting to the contract
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const electionContract = new web3.eth.Contract(ElectionManagementABI.abi, contractAddress);

          // get all elections
          const electionsData = await electionContract.methods.getElections().call();

          const formattedElections = electionsData.map((election) => ({
            id: Number(election.id),
            name: election.name,
            active: election.active,
            endTime: Number(election.endTime),
          }));

          
          setElections(formattedElections);

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

  return (
    <div className="container mt-5">
      <h2>Ballot Page</h2>
      {message && <div className="alert alert-info">{message}</div>}

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
                        <li key={candidate.id} className="list-group-item d-flex justify-content-between align-items-center">
                          {candidate.name}
                          <span className="badge bg-primary rounded-pill">{candidate.voteCount} Votes</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No candidates available for this election.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ballot;
