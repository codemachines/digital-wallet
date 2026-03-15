import api from './api';
import type { AuthResponse } from '../types';

export const registerUser = async (data: any): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: any): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};
