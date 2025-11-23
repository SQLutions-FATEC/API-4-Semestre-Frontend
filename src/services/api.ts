import axios from "axios";

// Define a URL base dependendo do ambiente
const baseURL =
  import.meta.env.MODE === "mock"
    ? "/" // modo mock (sem back)
    : import.meta.env.VITE_API_URL || "http://localhost:8080"; // local por padrão

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // importante para CORS com allowCredentials(true)
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Redireciona para página principal se estiver em uma rota protegida
      if (window.location.pathname !== '/' && window.location.pathname !== '/cidadao' && window.location.pathname !== '/sobre') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
