import api from './api.js';

export const listCategories = async () => (await api.get('/categories')).data;
export const createCategory = async (category) => (await api.post('/categories', category)).data;
export const updateCategory = async (id, category) => (await api.put(`/categories/${id}`, category)).data;
export const deleteCategory = async (id) => api.delete(`/categories/${id}`);
