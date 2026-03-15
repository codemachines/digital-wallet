import api from './api';

export const issueCredential = async (data: any): Promise<any> => {
  const response = await api.post('/credentials/issue', data);
  return response.data;
};

export const revokeCredential = async (id: string): Promise<any> => {
  const response = await api.post(`/credentials/issuer/revoke/${id}`);
  return response.data;
};
