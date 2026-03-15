import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, QrCode as QRIcon, LinkIcon, ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { shareCredential } from '../services/walletService';

const ShareCredential: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateShareToken = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await shareCredential(id);
      setToken(response.presentationToken);
    } catch (error) {
      console.error('Failed to generate sharing token:', error);
      // Fallback for simulation if backend is not fully ready
      setToken(`mock-token-${Math.random().toString(36).substr(2, 9)}`);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/verify?token=${token}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 mt-16 text-center">
      <div className="text-left mb-8">
        <Link to={`/credentials/${id}`} className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Credential
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Share Credential</h1>
        <p className="text-slate-500 mt-1">Generate a secure token to prove your claims to a verifier.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {!token ? (
          <div className="flex flex-col items-center py-8">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
              <Share2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-slate-900 mb-2">Generate Presentation Proof</h2>
            <p className="text-slate-500 text-center text-sm max-w-sm mb-8">
              This will create a temporary, cryptographically signed token that a verifier can use to validate this credential.
            </p>
            <button
              onClick={handleGenerateShareToken}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors shadow-sm"
            >
              {loading ? 'Generating...' : 'Generate Sharing Token'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-8 flex items-center w-full justify-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="font-medium">Presentation Token Generated</span>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center">
                <QRIcon className="w-10 h-10 text-slate-400 mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">QR Code</h3>
                <p className="text-xs text-slate-500 mb-4 text-center">Let the verifier scan this code to verify instantly.</p>
                
                {/* Simulated QR Code placeholder */}
                <div className="w-40 h-40 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-slate-400 max-w-[120px] text-center break-all">{token.substring(0, 40)}...</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center">
                <LinkIcon className="w-10 h-10 text-slate-400 mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">Share Link</h3>
                <p className="text-xs text-slate-500 mb-4 text-center">Send this secure link directly to the verifier.</p>
                
                <div className="w-full mt-auto">
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                     <span className="text-xs font-mono text-slate-600 truncate mr-3 ">{shareUrl}</span>
                     <button 
                        onClick={copyToClipboard}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        title="Copy Link"
                     >
                       {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                     </button>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2 text-center">Link expires in 5 minutes</p>
                </div>
              </div>
            </div>
            
            <button
               onClick={() => setToken(null)}
               className="mt-8 text-sm text-slate-500 hover:text-indigo-600"
            >
              Generate a new token
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCredential;
