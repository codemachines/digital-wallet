import api from './api';
import type { Credential, ShareResponse } from '../types';

export const getCredentials = async (walletId: string): Promise<Credential[]> => {
  const response = await api.get(`/credential/wallet/${walletId}`);
  return response.data;
};

export const getCredentialById = async (id: string): Promise<Credential> => {
  const response = await api.get(`/credentials/${id}`);
  return response.data;
};

export const shareCredential = async (id: string): Promise<ShareResponse> => {
  const response = await api.post(`/credentials/wallet/share/${id}`);
  return response.data;
};

export const presentCredential = async (data: { credentialId: string; fields: string[] }): Promise<any> => {
  const response = await api.post('/credentials/wallet/present', data);
  return response.data;
};
