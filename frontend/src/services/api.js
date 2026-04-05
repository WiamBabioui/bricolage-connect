import axios from 'axios';

const api = axios.create({
  // ✅ Cette ligne choisit l'URL de Railway en ligne, ou localhost sur ton PC
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ✅ Interceptor — ajoute le token JWT à CHAQUE requête automatiquement */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ✅ Interceptor réponse — si 401, déconnecte l'utilisateur */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login/client';
    }
    return Promise.reject(error);
  }
);

export default api;