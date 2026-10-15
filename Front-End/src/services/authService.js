import api from './api.js';

export const login = async (credentials) => (await api.post('/auth/login', credentials)).data;
export const register = async (account) => (await api.post('/auth/register', account)).data;
export const getCurrentUser = async () => (await api.get('/auth/me')).data;
export const updateCurrentUser = async (profile) => (await api.put('/auth/me', profile)).data;
