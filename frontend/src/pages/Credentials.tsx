import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Share2, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { getCredentials } from '../services/walletService';

const Credentials: React.FC = () => {
  const { credentials, setCredentials } = useWallet();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const response = await getCredentials();
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

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Credentials</h1>
          <p className="text-slate-500 mt-1">Your verified credentials issued by trusted issuers.</p>
        </div>
      </div>

      {/* Wallet DID — prominently at top */}
      <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          Your Wallet DID — Share this with issuers to receive credentials
        </p>
        <div className="flex items-center gap-2 mt-1">
          <code className="text-xs font-mono text-indigo-600 break-all flex-1">{user?.id}</code>
          <button
            onClick={() => copyId(user?.id || '')}
            className="flex-shrink-0 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
          >
            {copiedId === user?.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : safeCredentials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-slate-200">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No credentials yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Copy your Wallet DID above and share it with an issuer.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeCredentials.map((cred) => (
            <div key={cred.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">

              {/* ── Card Header ── */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">{cred.type || 'Credential'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        By <span className="font-mono">{cred.issuer || '—'}</span>
                      </p>
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {cred.issuedAt ? new Date(cred.issuedAt).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/credentials/${cred.id}/share`}
                      className="inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                    </Link>
                    <button
                      onClick={() => setExpandedId(expandedId === cred.id ? null : cred.id)}
                      className="inline-flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      {expandedId === cred.id
                        ? <><EyeOff className="w-3.5 h-3.5 mr-1.5" />Hide</>
                        : <><Eye className="w-3.5 h-3.5 mr-1.5" />Claims</>}
                    </button>
                  </div>
                </div>

                {/* ── Credential UUID — always visible ── */}
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credential ID (for verification)</p>
                    <p className="text-xs font-mono text-slate-600 break-all mt-0.5">{cred.id}</p>
                  </div>
                  <button
                    onClick={() => copyId(cred.id)}
                    title="Copy credential ID"
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    {copiedId === cred.id
                      ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>

              {/* ── Expanded Claims ── */}
              {expandedId === cred.id && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Decrypted Claims</p>
                  {cred.claims && Object.keys(cred.claims).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(cred.claims).map(([key, value]) => (
                        <div key={key} className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No claims available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Credentials;
