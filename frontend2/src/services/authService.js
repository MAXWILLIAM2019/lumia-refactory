import api from './api';

const authService = {
  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token; // Retorna true se existir um token, false caso contrário
  },

  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }
};

// Configuração do Axios
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Removendo temporariamente o interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default authService; 