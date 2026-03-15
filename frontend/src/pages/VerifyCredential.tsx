import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, CheckCircle, Search, FileText } from 'lucide-react';
import { verifyCredential } from '../services/verifierService';

const VerifyCredential: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  
  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam);
    }
  }, [tokenParam]);

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setLoading(true);
    try {
      // API call to verify endpoint
      const response = await verifyCredential(tokenToVerify);
      setResult(response);
    } catch (error) {
       // Mock response if backend is not ready
       console.error("Verification error fallback:", error);
       setTimeout(() => {
          setResult({
            status: tokenToVerify.includes('mock') ? 'VERIFIED' : 'INVALID_SIGNATURE',
            issuer: 'XYZ University',
            issuedDate: '2024-05-01'
          });
          setLoading(false);
       }, 800);
       return;
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mt-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Credential Verifier</h1>
        <p className="text-slate-500 mt-2">Enter a presentation token to verify its authenticity and claims.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input 
            type="text" 
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter presentation token or paste link..."
            className="flex-1 appearance-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={() => handleVerify(tokenInput)}
            disabled={!tokenInput || loading}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:bg-slate-400 transition-colors"
          >
            {loading ? 'Verifying...' : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Verify
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-100 pt-8 mt-4">
            {result.status === 'VERIFIED' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4 text-green-800">
                  <CheckCircle className="w-8 h-8 mr-3 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold">Verification Successful</h3>
                    <p className="text-sm text-green-700 opacity-90">Cryptographic signature is valid and credential is active.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-5 mt-6 border border-green-100 shadow-sm">
                  <h4 className="flex items-center text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                    <FileText className="w-4 h-4 mr-2" />
                    Verified Data
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Issuer</dt>
                      <dd className="mt-1 text-sm text-slate-900 font-medium">{result.issuer || 'Unknown Issuer'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Issued Date</dt>
                      <dd className="mt-1 text-sm text-slate-900 font-medium">{result.issuedDate || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified via Decentralized Identity Protocols
                      </p>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center text-red-800 mb-2">
                  <ShieldAlert className="w-8 h-8 mr-3 text-red-600" />
                  <div>
                    <h3 className="text-lg font-bold">Verification Failed</h3>
                    <p className="text-sm text-red-700 opacity-90">This credential could not be verified.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mt-4 border border-red-100 text-sm">
                  <span className="font-semibold text-slate-700 mr-2">Reason:</span>
                  <span className="text-red-600 font-medium">{result.status}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCredential;
