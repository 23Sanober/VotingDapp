
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Setting/Button64.css'; 

const Settings = () => {
  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {}
      <div className="p-4 bg-light" style={{ width: '30%' }}>
        <h2>Settings</h2>
        <ul>
          {}
          <li>
            <Link to="/settings/profile" className="button-64" role="button">
              <span className="text">Profile</span>
            </Link>
          </li>
          {}
        </ul>
      </div>

      {}
      <div className="flex-grow-1 p-4" style={{ width: '70%', backgroundColor: '#f8f9fa' }}>
        <Outlet /> {}
      </div>
    </div>
  );
};

export default Settings;