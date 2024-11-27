import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Registration from './Registration';
import Dashboard from './components/User/Dashboard';
import Results from './components/User/Results';
import Vote from './components/User/Vote';
import Ballot from './components/User/Ballot';
import Settings from './components/User/Settings';
import PublicLayout from './layouts/PublicLayout'; 
import GenericPrivateLayout from './layouts/GenericPrivateLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard'; 
import ElectionManagement from './components/Admin/ElectionManagement';
import VoterManagement from './components/Admin/VoterManagement';
import CandidateManagement from './components/Admin/CandidateManagement';
import ElectionResults from './components/Admin/ElectionResults';
import Sidebar from './components/User/Sidebar';
import AdminSidebar from './components/Admin/AdminSidebar';
import {useAuth} from './contexts/AuthContext';
import VoterRegister from './components/User/VoterRegister';
import VoterVerification from './components/User/VoterVerification';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './components/User/Setting/Profile'; 


function App() {
  const { isAuthenticated, isAdminAuthenticated } = useAuth(); 

  return (
    <Routes>
      {}
      <Route path="/login" element={<PublicLayout />}>
        <Route index element={<Login />} />
      </Route>
      <Route path="/register" element={<PublicLayout />}>
        <Route index element={<Registration />} />
      </Route>
      <Route path="/admin-login" element={<PublicLayout />}>
        <Route index element={<AdminLogin />} />
      </Route>
      
      {}
      <Route element={
        <GenericPrivateLayout
          sidebar={Sidebar}
          isAuthenticated={isAuthenticated}
          loginPath="/login"
        />
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ballot" element={<Ballot />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/results" element={<Results />} />
        <Route path="//register-blockchain" element={<VoterRegister />} />
        <Route path="//candidate" element={<VoterVerification />} />
        
        {/* Nested route for settings and profile */}
        <Route path="/settings" element={<Settings />}>
          {/* Add the profile component as a child route */}
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      
      {}
      <Route element={
        <GenericPrivateLayout
          sidebar={AdminSidebar}
          isAuthenticated={isAdminAuthenticated}
          loginPath="/admin-login"
        />
      }>
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {}
        <Route path="/admin-election-management" element={<ElectionManagement />} />
        <Route path="/admin-voter-management" element={<VoterManagement />} />
        <Route path="/admin-candidate-management" element={<CandidateManagement />} />
        <Route path="/admin-results" element={<ElectionResults />} />
      </Route>
      
      {}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;