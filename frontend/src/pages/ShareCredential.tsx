import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, LinkIcon, ArrowLeft, Copy, CheckCircle2, QrCode, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { shareCredential } from '../services/walletService';

const ShareCredential: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleGenerateShareToken = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await shareCredential(id);
      setToken(response.presentationToken);
    } catch (error: any) {
      console.error('Failed to generate sharing token:', error);
      alert('Failed to generate token: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = token ? `${window.location.origin}/verify?token=${token}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCredId = () => {
    navigator.clipboard.writeText(id || '');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 mt-16">
      {/* Back link */}
      <Link to="/credentials" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Credentials
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Share Credential</h1>
      <p className="text-slate-500 mb-6 text-sm">Generate a secure sharing link for a verifier to verify this credential.</p>

      {/* Credential UUID — always visible */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Credential ID — paste this into the Verifier page to verify directly
        </p>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
          <code className="text-xs font-mono text-slate-700 break-all flex-1">{id}</code>
          <button
            onClick={copyCredId}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-medium rounded-lg transition-colors"
          >
            {copiedId
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy ID</>}
          </button>
        </div>
      </div>

      {/* Token generation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {!token ? (
          <div className="flex flex-col items-center py-4">
            <div className="bg-indigo-50 p-5 rounded-full mb-5">
              <Share2 className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Generate a Presentation Token</h2>
            <p className="text-slate-500 text-center text-sm max-w-sm mb-2">
              Creates a signed link valid for <strong>1 hour</strong>. The verifier can paste the token or scan the QR code.
            </p>
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
              <Clock className="w-3.5 h-3.5" /> Token expires in 1 hour after generation
            </div>
            <button
              onClick={handleGenerateShareToken}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Generating…' : 'Generate Sharing Token'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Token generated! Valid for 1 hour.</span>
            </div>

            {/* Presentation token UUID */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Presentation Token — paste this at the Verify page
              </p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                <code className="text-xs font-mono text-slate-700 break-all flex-1">{token}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(token); }}
                  className="flex-shrink-0 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* QR code + Share link side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col items-center">
                <QrCode className="w-5 h-5 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 text-sm mb-3">QR Code</h3>
                <QRCodeSVG value={shareUrl} size={150} bgColor="#ffffff" fgColor="#1e293b" level="M" className="rounded-lg border border-slate-200 p-1.5" />
                <p className="text-xs text-slate-400 mt-3 text-center">Verifier scans this to verify</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 flex flex-col">
                <LinkIcon className="w-5 h-5 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 text-sm mb-3">Share Link</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-2 flex-1">
                  <span className="text-xs font-mono text-slate-600 break-all">{shareUrl}</span>
                  <button onClick={copyLink} className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 p-1">
                    {copiedLink
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Valid for 1 hour from generation</p>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setToken(null)} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                Generate a new token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCredential;
