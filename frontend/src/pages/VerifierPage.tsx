import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, Search, CheckCircle,
  FileText, SlidersHorizontal, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const VERIFIER_FIELDS = ['name', 'degree', 'university', 'year'];

const STATUS_STYLES: Record<string, { bg: string; icon: React.ElementType; label: string; sub: string }> = {
  VERIFIED:          { bg: 'bg-green-50 border-green-200', icon: CheckCircle, label: 'Verification Successful', sub: 'Cryptographic signature is valid and credential is active.' },
  INVALID_SIGNATURE: { bg: 'bg-red-50 border-red-200',    icon: ShieldAlert,  label: 'Invalid Signature',       sub: 'The credential signature could not be verified.' },
  REVOKED:           { bg: 'bg-orange-50 border-orange-200', icon: ShieldX,   label: 'Credential Revoked',       sub: 'This credential has been revoked by the issuer.' },
  EXPIRED:           { bg: 'bg-yellow-50 border-yellow-200', icon: Clock,     label: 'Credential Expired',       sub: 'This credential has passed its expiry date.' },
};

const VerifierPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selective disclosure
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [credentialId, setCredentialId] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [disclosureResult, setDisclosureResult] = useState<any | null>(null);
  const [disclosureLoading, setDisclosureLoading] = useState(false);

  useEffect(() => {
    if (tokenParam) handleVerify(tokenParam);
  }, [tokenParam]);

  const handleVerify = async (token: string) => {
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const resp = await api.post('/verify', { token });
      setResult(resp.data);
      if (resp.data.credentialId) setCredentialId(resp.data.credentialId);
    } catch (err: any) {
      const d = err.response?.data;
      if (d?.status) {
        setResult(d);
      } else {
        setError(err.response?.data?.error || err.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (f: string) =>
    setSelectedFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSelectiveDisclose = async () => {
    if (!credentialId || selectedFields.length === 0) return;
    setDisclosureLoading(true);
    setDisclosureResult(null);
    try {
      const resp = await api.post('/verify/present', { credentialId, fields: selectedFields });
      setDisclosureResult(resp.data);
    } catch (err: any) {
      alert('Selective disclosure failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDisclosureLoading(false);
    }
  };

  const statusInfo = result?.status ? STATUS_STYLES[result.status] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mt-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Credential Verifier</h1>
        <p className="text-slate-500 mt-2">
          Enter a presentation token or credential ID to verify authenticity.
        </p>
      </div>

      {/* Token Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={tokenInput}
            onChange={e => { setTokenInput(e.target.value); setResult(null); setError(null); }}
            placeholder="Enter presentation token or credential UUID…"
            className="flex-1 appearance-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
          <button
            onClick={() => handleVerify(tokenInput)}
            disabled={!tokenInput.trim() || loading}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <><Search className="w-4 h-4 mr-2" />Verify</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Verification Result */}
        {result && statusInfo && (() => {
          const Icon = statusInfo.icon;
          const isVerified = result.status === 'VERIFIED';
          return (
            <div className={`mt-6 border rounded-2xl p-6 ${statusInfo.bg}`}>
              <div className="flex items-start gap-3 mb-4">
                <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isVerified ? 'text-green-600' : result.status === 'REVOKED' ? 'text-orange-500' : result.status === 'EXPIRED' ? 'text-yellow-600' : 'text-red-600'}`} />
                <div>
                  <h3 className="font-bold text-slate-900">{statusInfo.label}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{statusInfo.sub}</p>
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-xl p-4 border border-white shadow-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{result.status}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Issuer</dt>
                  <dd className="mt-1 text-sm font-mono text-slate-700 break-all">{result.issuer || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Issued Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {result.issuedDate ? new Date(result.issuedDate).toLocaleDateString() : '—'}
                  </dd>
                </div>
                {result.expiryDate && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Expiry Date</dt>
                    <dd className="mt-1 text-sm text-slate-900">{new Date(result.expiryDate).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          );
        })()}
      </div>

      {/* Selective Disclosure */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowDisclosure(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-800 text-sm">Selective Disclosure Request</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Optional</span>
          </div>
          {showDisclosure ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showDisclosure && (
          <div className="px-6 pb-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mt-4 mb-4">
              Request only specific fields from the credential holder. The holder's wallet generates a signed proof with only the disclosed fields.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Credential ID</label>
              <input
                type="text"
                value={credentialId}
                onChange={e => setCredentialId(e.target.value)}
                placeholder="Credential UUID (auto-filled after verification)"
                className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Fields to Request</label>
              <div className="flex flex-wrap gap-2">
                {VERIFIER_FIELDS.map(field => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedFields.includes(field)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSelectiveDisclose}
              disabled={!credentialId || selectedFields.length === 0 || disclosureLoading}
              className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors"
            >
              {disclosureLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Request Disclosure
            </button>

            {disclosureResult && (
              <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Disclosure Proof
                </h4>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Disclosed Claims</p>
                  <div className="space-y-2">
                    {Object.entries(disclosureResult.disclosedClaims || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-500 capitalize">{k}</span>
                        <span className="text-sm font-semibold text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Cryptographic Proof</p>
                  <p className="text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded p-2 break-all max-h-16 overflow-y-auto">
                    {disclosureResult.proof}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifierPage;
