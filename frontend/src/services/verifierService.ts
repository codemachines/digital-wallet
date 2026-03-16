import api from './api';
import type { VerificationResponse } from '../types';

export const verifyCredential = async (token: string): Promise<VerificationResponse> => {
  // Assessment requires POST /verify
  const response = await api.post('/verify', { token });
  return response.data;
};

export const getVerificationLogs = async (): Promise<any[]> => {
  const response = await api.get('/verification/logs');
  return response.data;
};
