import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const AdminDashboard = () => {
  const [account, setAccount] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('Error loading admin dashboard.');
        }
      }
    };

    init();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      <p>Connected Account: {account}</p>
      {}
    </div>
  );
};

export default AdminDashboard;
