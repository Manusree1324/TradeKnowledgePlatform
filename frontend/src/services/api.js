import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });
export const assetUrl = (value) => value?.startsWith('http') ? value : `${API_URL.replace(/\/api\/?$/, '')}${value || ''}`;

api.interceptors.request.use((config) => {
	const token = window.localStorage.getItem('trade-knowledge-token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});