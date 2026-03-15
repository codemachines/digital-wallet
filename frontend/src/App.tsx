// App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Credentials from './pages/Credentials';
import CredentialDetails from './pages/CredentialDetails';
import ShareCredential from './pages/ShareCredential';
import VerifyCredential from './pages/VerifyCredential';
import IssueCredential from './pages/IssueCredential';

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
              <Route path="/verify" element={<VerifyCredential />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/credentials" element={<Credentials />} />
                <Route path="/credentials/:id" element={<CredentialDetails />} />
                <Route path="/credentials/:id/share" element={<ShareCredential />} />
                <Route path="/issue" element={<IssueCredential />} />
              </Route>
            </Routes>
          </div>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
