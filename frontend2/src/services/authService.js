/**
 * Serviço de Autenticação
 * 
 * Este módulo gerencia todas as operações relacionadas à autenticação,
 * como gerenciamento de tokens e verificação de status de autenticação.
 */
import api from './api';

const AUTH_TOKEN_KEY = 'token';

const authService = {
  /**
   * Obtém o token de autenticação armazenado
   * @returns {string|null} Token JWT ou null se não estiver autenticado
   */
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Armazena o token de autenticação
   * @param {string} token - Token JWT recebido do servidor
   */
  setToken: (token) => {
    console.log('Armazenando token no localStorage');
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Remove o token de autenticação (logout)
   */
  removeToken: () => {
    console.log('Removendo token do localStorage');
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  /**
   * Verifica se o usuário está autenticado localmente
   * @returns {boolean} true se o token existir, false caso contrário
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  /**
   * Valida o token no servidor
   * @returns {Promise<boolean>} Promise que resolve para true se o token for válido
   */
  validateToken: async () => {
    try {
      console.log('Validando token no servidor...');
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.log('Nenhum token encontrado para validar');
        return false;
      }
      
      const response = await api.get('/auth/validate');
      console.log('Resposta da validação:', response.data);
      return response.data.valid;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      if (error.response?.status === 401) {
        // Se o token for inválido, faça logout automaticamente
        authService.removeToken();
      }
      return false;
    }
  },
  
  /**
   * Realiza login no sistema
   * @param {Object} credentials - Credenciais de login
   * @param {string} credentials.email - Email do usuário
   * @param {string} credentials.senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  login: async (credentials) => {
    try {
      console.log('Tentando fazer login com:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.token) {
        authService.setToken(response.data.token);
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }
};

export default authService; 