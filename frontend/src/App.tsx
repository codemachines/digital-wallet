import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { useAuth } from './contexts/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Credentials from './pages/Credentials';
import CredentialDetails from './pages/CredentialDetails';
import ShareCredential from './pages/ShareCredential';
import IssueCredential from './pages/IssueCredential';
import IssuerDashboard from './pages/IssuerDashboard';
import VerifierPage from './pages/VerifierPage';

/**
 * Redirects the root "/" to the correct landing page based on role.
 */
const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ISSUER') return <Navigate to="/issue" replace />;
  if (user?.role === 'VERIFIER') return <Navigate to="/verify" replace />;
  return <Dashboard />;  // HOLDER
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* /verify is public — verifiers paste share links without logging in */}
              <Route path="/verify" element={<VerifierPage />} />

              {/* Protected Routes (require login) */}
              <Route element={<ProtectedRoute />}>
                {/* Root — role-based redirect */}
                <Route path="/" element={<RoleRedirect />} />

                {/* HOLDER routes */}
                <Route path="/credentials" element={<Credentials />} />
                <Route path="/credentials/:id" element={<CredentialDetails />} />
                <Route path="/credentials/:id/share" element={<ShareCredential />} />

                {/* ISSUER routes */}
                <Route path="/issue" element={<IssueCredential />} />
                <Route path="/issued" element={<IssuerDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
