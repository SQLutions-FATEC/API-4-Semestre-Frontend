import axios from "axios";

// Define a URL base dependendo do ambiente
const baseURL =
  import.meta.env.MODE === "mock"
    ? "/" // modo mock (sem back)
    : import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('Making request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        withCredentials: config.withCredentials
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message
      });
    }

    if (error.response?.status === 401) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Token inválido ou expirado, fazendo logout...');
      }
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Redireciona para página principal se estiver em uma rota protegida
      const currentPath = window.location.pathname;
      const publicPaths = ['/cidadao', '/sobre'];

      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/cidadao';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
