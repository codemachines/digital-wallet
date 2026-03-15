import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Share2, Award, Calendar } from 'lucide-react';
import { getCredentialById } from '../services/walletService';
import type { Credential } from '../types';

const CredentialDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCred = async () => {
      if (!id) return;
      try {
        const response = await getCredentialById(id);
        setCredential(response);
      } catch (error) {
        console.error('Failed to fetch credential details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCred();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 mt-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Credential not found</h2>
        <Link to="/credentials" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Credentials
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <Link to="/credentials" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Credentials
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative">
          <ShieldCheck className="absolute top-6 right-6 w-16 h-16 opacity-20" />
          <div className="bg-white/20 p-3 rounded-xl inline-block mb-4 backdrop-blur-sm">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{credential.type}</h1>
          <p className="text-indigo-100 mt-2 flex items-center">
            Issued by {credential.issuer}
          </p>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500 mb-1">Issue Date</p>
              <p className="font-medium text-slate-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {credential.issuedAt ? new Date(credential.issuedAt).toLocaleDateString() : 'Unknown Date'}
              </p>
            </div>
            <Link 
              to={`/credentials/${credential.id}/share`}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Context
            </Link>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Credential Claims</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {credential.claims && Object.entries(credential.claims).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-slate-900 font-medium">
                    {String(value)}
                  </p>
                </div>
              ))}
              {(!credential.claims || Object.keys(credential.claims).length === 0) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-500">
                  No claims available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialDetails;
