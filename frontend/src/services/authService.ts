import api from './api';
import { User, LoginCredentials, RegisterData } from '../types';

export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  // We'll fetch from /users/me? But we need to get user ID from token.
  // Better: decode token or have /users/me endpoint. For simplicity, we'll use /users/{id}.
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No token');
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.sub;
  const response = await api.get(`/users/${userId}`);
  return response.data;
};