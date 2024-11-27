import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="fixed-left">
      <ul className="nav flex-column bg-dark vh-100">
        <li className="nav-item">
        <Link to="/admin-dashboard" className="nav-link text-white">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin-election-management" className="nav-link text-white">
            Election Management
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin-candidate-management" className="nav-link text-white">
            Candidate Management
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin-voter-management" className="nav-link text-white">
            VOTER REQUESTS
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/admin-results" className="nav-link text-white">
            FINAL RESULTS
          </Link>
        </li>
        
      </ul>
    </div>
  );
};

export default AdminSidebar;
