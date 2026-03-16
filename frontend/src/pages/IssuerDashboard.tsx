import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, Calendar, Award, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getIssuedCredentials, revokeCredential } from '../services/issuerService';

const IssuerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = async () => {
    try {
      const data = await getIssuedCredentials();
      setCredentials(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load issued credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredentials(); }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this credential? This cannot be undone.')) return;
    setRevoking(id);
    try {
      await revokeCredential(id);
      setCredentials(prev => prev.map(c => c.id === id ? { ...c, revoked: true } : c));
    } catch (err: any) {
      alert('Failed to revoke: ' + (err.response?.data?.message || err.message));
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Award className="w-6 h-6 mr-2 text-purple-600" />
            Issued Credentials
          </h1>
          <p className="text-slate-500 mt-1">
            Credentials you have issued. You can revoke any credential at any time.
          </p>
        </div>
        <a href="/issue" className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <Award className="w-4 h-4 mr-2" />
          Issue New
        </a>
      </div>

      {/* Issuer DID display */}
      <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-purple-800">Your Issuer DID</p>
          <p className="text-xs font-mono text-purple-600 break-all mt-0.5">{user?.id}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200 border-dashed">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No credentials issued yet</h3>
          <p className="mt-1 text-sm text-slate-500">Go to Issue Credential to create and sign credentials for wallet holders.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                cred.revoked ? 'border-red-200 opacity-70' : 'border-slate-200 hover:shadow-md hover:border-purple-300'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${cred.revoked ? 'bg-red-50' : 'bg-purple-50'}`}>
                  {cred.revoked ? (
                    <ShieldX className="w-5 h-5 text-red-500" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                {cred.revoked ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">REVOKED</span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ACTIVE</span>
                )}
              </div>

              {/* Type */}
              <h3 className="text-base font-semibold text-slate-900">{cred.type || 'Credential'}</h3>

              {/* Subject DID */}
              <div className="mt-2">
                <p className="text-xs text-slate-400 font-medium">ISSUED TO</p>
                <p className="text-xs font-mono text-slate-600 truncate mt-0.5" title={cred.subjectDid || cred.subject}>
                  {cred.subjectDid || cred.subject || '—'}
                </p>
              </div>

              {/* Claims preview */}
              {cred.claims && Object.keys(cred.claims).length > 0 && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3 space-y-1">
                  {Object.entries(cred.claims).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500 capitalize">{k}</span>
                      <span className="text-slate-700 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {cred.issuedAt ? new Date(cred.issuedAt).toLocaleDateString() : '—'}
                </div>
                {!cred.revoked && (
                  <button
                    onClick={() => handleRevoke(cred.id)}
                    disabled={revoking === cred.id}
                    className="inline-flex items-center text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <ShieldX className="w-3 h-3 mr-1" />
                    {revoking === cred.id ? 'Revoking…' : 'Revoke'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuerDashboard;
