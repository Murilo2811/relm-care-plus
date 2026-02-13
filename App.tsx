import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicWarrantyForm from './pages/PublicWarrantyForm';
import TrackClaim from './pages/TrackClaim';
import ClaimDetail from './pages/ClaimDetail';
import Home from './pages/Home';
import Stores from './pages/Stores';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import { Layout } from './components/Layout';

interface ProtectedRouteProps {
  user: User | null;
  children?: React.ReactNode;
}

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <HashRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/register" element={<PublicWarrantyForm />} />
        <Route path="/track" element={<TrackClaim />} />

        {/* Login Page */}
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute user={user}>
            <Layout user={user!} onLogout={() => setUser(null)}>
              <Routes>
                <Route path="dashboard" element={<Dashboard user={user!} />} />
                <Route path="stores" element={<Stores user={user!} />} />
                <Route path="users" element={<Users user={user!} />} />
                <Route path="settings" element={<Settings user={user!} />} />
                <Route path="reports" element={<Reports user={user!} />} />
                <Route path="claims/:id" element={<ClaimDetail user={user!} />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
}