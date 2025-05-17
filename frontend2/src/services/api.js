/**
 * Configuração centralizada da API
 * 
 * Este módulo configura a instância do Axios para comunicação com o backend,
 * definindo a URL base e interceptores para autenticação.
 */
import axios from 'axios';

/**
 * Instância do Axios configurada para o backend
 * 
 * Todas as requisições usarão a URL base definida e terão
 * comportamentos padronizados através dos interceptores.
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

/**
 * Interceptor de requisição
 * 
 * Adiciona automaticamente o token JWT de autenticação no header
 * de todas as requisições, se disponível no localStorage.
 * NOTA: Este é o único interceptor de requisição que deve existir no projeto.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor - Token encontrado:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor - Authorization header configurado');
    }
    return config;
  },
  (error) => {
    console.error('API Interceptor - Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Interceptor - Erro na resposta:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export default api; 