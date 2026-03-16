import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { issueCredential } from '../services/issuerService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const IssueCredential: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user && user.role !== 'ISSUER') {
      navigate('/credentials', { replace: true });
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        type: data.type || "EducationCredential",
        walletId: data.subject,
        subjectDid: data.subject,
        claims: {
          name: data.claimName,
          degree: data.claimDegree,
          university: data.claimUniversity,
          year: parseInt(data.claimYear, 10) || 2024
        }
      };

      // Optional expiry — convert datetime-local string to ISO-8601
      if (data.expiryAt) {
        payload.expiryAt = new Date(data.expiryAt).toISOString().replace('Z', '');
      }

      console.log('Issuing credential with payload:', payload);
      await issueCredential(payload);
      setSuccessMsg("Credential issued successfully!");
      reset(); // Clear form
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to issue credential.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Award className="w-6 h-6 mr-2 text-indigo-600" />
          Issue a Credential
        </h1>
        <p className="text-slate-500 mt-2">Create and cryptographically sign a verifiable credential for a wallet holder.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {successMsg && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-3" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
             <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">Metadata</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject Wallet ID (DID)</label>
                  <input
                    type="text"
                    placeholder="did:wallet:abc123..."
                    {...register('subject', { required: 'Wallet ID is required' })}
                    className={`w-full appearance-none rounded-lg border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.subject ? 'border-red-300' : 'border-slate-300'}`}
                  />
                  {errors.subject && <p className="mt-1 text-sm text-red-600">{String(errors.subject.message)}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Credential Type</label>
                  <input
                    type="text"
                    defaultValue="EducationCredential"
                    {...register('type', { required: 'Type is required' })}
                    className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
             </div>
          </div>

          <div>
             <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">Education Claims</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
                   <input
                     type="text"
                     placeholder="Rahul Sharma"
                     {...register('claimName', { required: 'Name is required' })}
                     className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Degree</label>
                   <input
                     type="text"
                     placeholder="B.Tech"
                     {...register('claimDegree', { required: 'Degree is required' })}
                     className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">University / Institution</label>
                   <input
                     type="text"
                     placeholder="XYZ University"
                     {...register('claimUniversity', { required: 'University is required' })}
                     className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                   />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Graduation Year</label>
                    <input
                      type="number"
                      placeholder="2022"
                      {...register('claimYear', { required: 'Year is required' })}
                      className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                 </div>
              </div>
           </div>

           <div>
             <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
               Validity
               <span className="ml-2 text-xs font-normal text-slate-400">(optional)</span>
             </h3>
             <div className="max-w-xs">
               <label className="block text-sm font-medium text-slate-700 mb-2">
                 Expiry Date &amp; Time
                 <span className="ml-1 text-slate-400 text-xs">(leave blank for no expiry)</span>
               </label>
               <input
                 type="datetime-local"
                 {...register('expiryAt')}
                 className="w-full appearance-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
             </div>
           </div>

          <div className="pt-4 flex justify-end">
            <button
               type="submit"
               disabled={loading}
               className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Issue Credential'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueCredential;
