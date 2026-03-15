import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, ShieldCheck, LogOut, LayoutDashboard, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Wallet className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-bold text-white tracking-wide">Identity<span className="text-indigo-500">Wallet</span></span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {(!user?.role || user?.role === 'HOLDER') && (
                  <Link
                    to="/"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/') ? 'border-indigo-500 text-white' : 'border-transparent text-slate-300 hover:border-slate-300 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                )}
                
                <Link
                  to="/credentials"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/credentials') || isActive('/credentials/:id') ? 'border-indigo-500 text-white' : 'border-transparent text-slate-300 hover:border-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Credentials
                </Link>

                {user?.role === 'ISSUER' && (
                  <Link
                    to="/issue"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/issue') ? 'border-indigo-500 text-white' : 'border-transparent text-slate-300 hover:border-slate-300 hover:text-white'
                    }`}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Issue
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:block">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
