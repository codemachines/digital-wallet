import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, ShieldCheck, LogOut, LayoutDashboard, Award, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ROLE_BADGE: Record<string, string> = {
  ISSUER: 'bg-purple-500',
  HOLDER: 'bg-indigo-500',
  VERIFIER: 'bg-emerald-500',
};

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLink = (to: string, label: string, Icon: React.ElementType) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
        isActive(to) ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 mr-1.5" />
      {label}
    </Link>
  );

  const mobileLink = (to: string, label: string, Icon: React.ElementType) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive(to) ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Link>
  );

  return (
    <nav className="bg-slate-900 border-b border-slate-800 w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Wallet className="h-7 w-7 text-indigo-400" />
              <span className="ml-2 text-lg font-bold text-white tracking-wide">
                Identity<span className="text-indigo-400">Wallet</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {isAuthenticated && (
              <div className="hidden sm:ml-10 sm:flex sm:space-x-6">
                {/* HOLDER links */}
                {user?.role === 'HOLDER' && (
                  <>
                    {navLink('/', 'Dashboard', LayoutDashboard)}
                    {navLink('/credentials', 'My Credentials', ShieldCheck)}
                  </>
                )}

                {/* ISSUER links */}
                {user?.role === 'ISSUER' && (
                  <>
                    {navLink('/issue', 'Issue Credential', Award)}
                    {navLink('/issued', 'Issued List', ShieldCheck)}
                  </>
                )}

                {/* VERIFIER links */}
                {user?.role === 'VERIFIER' && (
                  <>
                    {navLink('/verify', 'Verify Credential', Search)}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  {user?.role && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${ROLE_BADGE[user.role] || 'bg-slate-600'}`}>
                      {user.role}
                    </span>
                  )}
                  <span className="text-sm text-slate-400 max-w-[160px] truncate">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-700 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Logout
                  </button>
                </div>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(o => !o)}
                  className="sm:hidden p-2 text-slate-400 hover:text-white"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && isAuthenticated && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-1">
          {user?.role === 'HOLDER' && (
            <>
              {mobileLink('/', 'Dashboard', LayoutDashboard)}
              {mobileLink('/credentials', 'My Credentials', ShieldCheck)}
            </>
          )}
          {user?.role === 'ISSUER' && (
            <>
              {mobileLink('/issue', 'Issue Credential', Award)}
              {mobileLink('/issued', 'Issued List', ShieldCheck)}
            </>
          )}
          {user?.role === 'VERIFIER' && (
            <>{mobileLink('/verify', 'Verify Credential', Search)}</>
          )}
          <div className="border-t border-slate-700 pt-3 mt-1">
            <div className="flex items-center gap-2 px-4 pb-2">
              {user?.role && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${ROLE_BADGE[user.role] || 'bg-slate-600'}`}>
                  {user.role}
                </span>
              )}
              <span className="text-sm text-slate-400 truncate">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
