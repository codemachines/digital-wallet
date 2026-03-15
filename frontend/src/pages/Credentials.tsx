import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, ChevronRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { getCredentials } from '../services/walletService';

const Credentials: React.FC = () => {
  const { credentials, setCredentials } = useWallet();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const walletIdStr = user.id || '';
        const response = await getCredentials(walletIdStr);
        setCredentials(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to fetch credentials:', error);
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [user, setCredentials]);

  const safeCredentials = Array.isArray(credentials) ? credentials : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.role === 'ISSUER' ? 'Issued Credentials' : 'My Credentials'}
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'ISSUER' ? 'View credentials you have issued.' : 'View and manage your verified credentials.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : safeCredentials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200 border-dashed">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No credentials found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === 'ISSUER' ? "You haven't issued any credentials yet." : "You don't have any credentials in your wallet yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {safeCredentials.map((cred, idx) => (
            <Link 
              key={cred?.id || idx} 
              to={`/credentials/${cred?.id || ''}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  #{cred?.id ? String(cred.id).slice(-6) : 'N/A'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{cred?.type || 'Unknown Type'}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{cred?.issuer || 'Unknown Issuer'}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {cred?.issuedAt ? new Date(cred.issuedAt).toLocaleDateString() : 'Unknown Date'}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Credentials;
