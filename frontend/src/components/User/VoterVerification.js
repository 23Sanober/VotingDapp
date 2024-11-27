import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contractConfig';

const VoterVerification = () => {
  const [account, setAccount] = useState('');
  const [electionId, setElectionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [, setStoredVoteHash] = useState('');
  const [, setIsVerified] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask");
      }
    };
    loadAccount();
  }, []);

  const handleVerifyVote = async () => {
    const web3 = new Web3(window.ethereum);
    const electionContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    try {
      // Gets the stored vote hash
      const voteHashFromContract = await electionContract.methods.getVoteHash(electionId).call({ from: account });
      setStoredVoteHash(voteHashFromContract);

      
      const generatedHash = web3.utils.soliditySha3(
        { type: 'uint256', value: electionId },
        { type: 'uint256', value: candidateId },
        { type: 'address', value: account }
      );

      if (voteHashFromContract === generatedHash) {
        setIsVerified(true);
        setMessage("✅ Your vote is verified and untampered!");
      } else {
        setIsVerified(false);
        setMessage("❌ You have not voted for this specific candidate.");
      }
    } catch (error) {
      console.error("Error verifying vote:", error);
      setMessage("Failed to verify vote.");
    }
  };

  return (
    <div>
      <h2>Verify Your Vote</h2>
      <input
        type="text"
        placeholder="Election ID"
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Candidate ID"
        value={candidateId}
        onChange={(e) => setCandidateId(e.target.value)}
      />
      <button onClick={handleVerifyVote}>Verify Vote</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default VoterVerification;