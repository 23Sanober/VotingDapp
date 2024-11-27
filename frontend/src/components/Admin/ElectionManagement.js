import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig'; 

const ElectionManagement = () => {
  const [account, setAccount] = useState('');
  const [electionName, setElectionName] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [elections, setElections] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const accounts = await web3.eth.getAccounts();
          if (accounts.length === 0) {
            setMessage('No accounts found. Please connect MetaMask.');
            return;
          }

          setAccount(accounts[0]);
          const votingSystem = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(votingSystem);

          // Get all elections
          const electionsData = await votingSystem.methods.getElections().call();
          const electionsList = electionsData.map((election) => ({
            id: Number(election.id),
            name: election.name,
            active: election.active,
            endTime: Number(election.endTime),
          }));
          setElections(electionsList);
        } catch (error) {
          console.error("Initialization error: ", error);
          setMessage('Error loading election management. Please check MetaMask connection.');
        }
      } else {
        setMessage('Please install MetaMask!');
      }
    };

    init();
  }, []);

  const createElection = async () => {
    if (!contract) {
      setMessage('Smart contract is not loaded. Please try again later.');
      return;
    }

    if (!electionName || !endDate) {
      setMessage('Please enter a valid election name and end date.');
      return;
    }

    try {
      const endTime = Math.floor(new Date(endDate).getTime() / 1000); 
      console.log("Creating election with params:", electionName, endTime);

      const gasEstimate = await contract.methods.createElection(electionName, endTime).estimateGas({ from: account });

      await contract.methods.createElection(electionName, endTime).send({ from: account, gas: gasEstimate });

      setMessage(`Election "${electionName}" created successfully.`);
      setElectionName('');
      setEndDate('');

      // Get all updated election list
      fetchElections();
    } catch (error) {
      console.error("Error creating election:", error);
      setMessage('Failed to create election. See console for details.');
    }
  };

  const fetchElections = async () => {
    if (contract) {
      const electionsData = await contract.methods.getElections().call();
      const electionsList = electionsData.map((election) => ({
        id: Number(election.id),
        name: election.name,
        active: election.active,
        endTime: Number(election.endTime),
      }));
      setElections(electionsList);
    }
  };

  const handleStartElection = async (id) => {
    if (!contract) return;

    try {
      await contract.methods.startElection(id).send({ from: account });
      setMessage(`Election ${id} started successfully.`);
      fetchElections();
    } catch (error) {
      console.error("Error starting election:", error);
      setMessage('Failed to start election.');
    }
  };

  const handleStopElection = async (id) => {
    if (!contract) return;

    try {
      await contract.methods.stopElection(id).send({ from: account });
      setMessage(`Election ${id} stopped successfully.`);
      fetchElections();
    } catch (error) {
      console.error("Error stopping election:", error);
      setMessage('Failed to stop election.');
    }
  };

  const handleDeleteElection = async (id) => {
    if (!contract) return;

    try {
      await contract.methods.deleteElection(id).send({ from: account });
      setMessage(`Election ${id} deleted successfully.`);
      fetchElections();
    } catch (error) {
      console.error("Error deleting election:", error);
      setMessage('Failed to delete election.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Election Management</h2>
      {message && <div className="alert alert-info mt-3">{message}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Election Name"
          value={electionName}
          onChange={(e) => setElectionName(e.target.value)}
        />
        <label htmlFor="endDate" className="form-label">End Date</label>
        <input
          type="datetime-local"
          className="form-control mb-2"
          placeholder="Election End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="btn btn-primary" onClick={createElection}>
          Create Election
        </button>
      </div>

      <h3>Current Elections</h3>
      {elections.length === 0 ? (
        <p>No elections available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map((election) => (
              <tr key={election.id}>
                <td>{election.id}</td>
                <td>{election.name}</td>
                <td>{new Date(election.endTime * 1000).toLocaleString()}</td>
                <td>{election.active ? 'Active' : 'Inactive'}</td>
                <td>
                  {!election.active ? (
                    <button className="btn btn-success me-2" onClick={() => handleStartElection(election.id)}>
                      Start
                    </button>
                  ) : (
                    <button className="btn btn-danger me-2" onClick={() => handleStopElection(election.id)}>
                      Stop
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleDeleteElection(election.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ElectionManagement;
