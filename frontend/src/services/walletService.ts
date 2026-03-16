import api from './api';
import type { Credential, ShareResponse } from '../types';

export const getCredentials = async (): Promise<Credential[]> => {
  const response = await api.get('/wallet/credentials');
  return response.data;
};

export const getCredentialById = async (id: string): Promise<Credential> => {
  const response = await api.get(`/wallet/credentials/${id}`);
  return response.data;
};

export const shareCredential = async (id: string): Promise<ShareResponse> => {
  const response = await api.post(`/wallet/share/${id}`);
  return response.data;
};

export const presentCredential = async (data: { credentialId: string; fields: string[] }): Promise<any> => {
  const response = await api.post('/wallet/present', data);
  return response.data;
};
