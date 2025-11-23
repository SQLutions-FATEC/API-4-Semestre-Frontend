import axios from "axios";

// Define a URL base dependendo do ambiente
const baseURL =
  import.meta.env.MODE === "mock"
    ? "/" // modo mock (sem back)
    : "/api"; // Sempre usar proxy em desenvolvimento

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// Debug da configuração
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('🔧 API Configuration:', {
    baseURL,
    mode: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL
  });
}

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
      console.log('🚀 Making request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'N/A',
        authHeader: config.headers?.Authorization ? 'Bearer ' + (config.headers.Authorization as string).substring(7, 27) + '...' : 'None',
        withCredentials: config.withCredentials
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('✅ Response received:', {
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase()
      });
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        fullURL: error.config?.baseURL + error.config?.url,
        headers: error.response?.headers
      });
    }

    if (error.response?.status === 401) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('🔒 Token inválido ou expirado, fazendo logout...');
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
