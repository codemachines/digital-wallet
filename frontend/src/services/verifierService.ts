import api from './api';
import type { VerificationResponse } from '../types';

export const verifyCredential = async (credentialId: string): Promise<VerificationResponse> => {
  const response = await api.post(`/credentials/verify/${credentialId}`);
  return response.data;
};

export const getVerificationLogs = async (): Promise<any[]> => {
  const response = await api.get('/credentials/verification/logs');
  return response.data;
};
