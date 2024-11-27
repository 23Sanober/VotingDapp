import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GenericPrivateLayout = ({ sidebar: SidebarComponent, isAuthenticated, loginPath }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(loginPath);
  };

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  return (
    <div className="d-flex">
      {SidebarComponent && <SidebarComponent />} {}
      <div className="flex-fill">
        <nav className="navbar navbar-light bg-light">
          <div className="container-fluid">
            <div className="d-flex justify-content-between w-100">
              {}
              <div></div>
              <div className="d-flex">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <Outlet /> {}
      </div>
    </div>
  );
};

export default GenericPrivateLayout;