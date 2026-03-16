import api from './api';

export const issueCredential = async (data: any): Promise<any> => {
  const response = await api.post('/issuer/credential', data);
  return response.data;
};

export const revokeCredential = async (id: string): Promise<any> => {
  const response = await api.post(`/issuer/revoke/${id}`);
  return response.data;
};

export const getIssuedCredentials = async (): Promise<any[]> => {
  const response = await api.get('/issuer/credentials');
  return response.data;
};
