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
    return !!token;
  },

  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Primeiro verifica se o token está expirado localmente
      if (!this.isAuthenticated()) {
        return false;
      }

      // Se não estiver expirado, valida no servidor
      const response = await api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
};

// Configuração do Axios
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default authService; 