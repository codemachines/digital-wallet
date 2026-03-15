import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

// For the purposes of the requirements we'll define a dummy fetch for wallet info 
// since the backend spec doesn't explicitly have a GET /wallet endpoint besides the credentials.
// But we assume the wallet ID format is did:wallet:<uuid>

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { wallet, setWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If not a HOLDER, redirect to credentials
    if (user && user.role && user.role !== 'HOLDER') {
      navigate('/credentials', { replace: true });
    }

    // Simulate fetching or generating wallet info based on user
    if (!wallet && user) {
      // Use the injected didWalletId from the user object
      const walletId = user.id;
      setWallet({ id: walletId, owner: user.name || user.email });
    }
  }, [user, wallet, setWallet]);

  const copyToClipboard = () => {
    if (wallet?.id) {
      navigator.clipboard.writeText(wallet.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Wallet Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your digital identity and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
           <div className="bg-indigo-50 p-4 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
             <WalletIcon className="h-10 w-10 text-indigo-600" />
           </div>
           
           <h2 className="text-lg font-semibold text-slate-800 mb-2">Your Digital Wallet</h2>
           
           {wallet ? (
             <div className="flex flex-col items-center w-full">
                <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 flex items-center justify-between w-full max-w-sm">
                  <span className="font-mono text-sm text-slate-600 truncate mr-2" title={wallet.id}>
                    {wallet.id}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                    title="Copy Wallet ID"
                  >
                    {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  This is your unique Decentralized Identifier (DID). Share this with issuers to receive credentials.
                </p>
             </div>
           ) : (
              <div className="flex items-center text-amber-600 text-sm">
                 <AlertCircle className="w-4 h-4 mr-2" />
                 <span>Initializing wallet...</span>
              </div>
           )}
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-sm p-6 text-white flex flex-col justify-between min-h-[250px]">
          <div>
            <h2 className="text-lg font-medium text-indigo-200 mb-1">Holder Summary</h2>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-sm text-slate-400">Total Credentials</p>
          </div>
          <div className="mt-6 border-t border-slate-700 pt-4">
             <p className="text-sm text-slate-300">
               Store credentials securely and control how they are shared with verifiers. Ready to receive credentials!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
