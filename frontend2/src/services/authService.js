/**
 * Serviço de Autenticação
 * 
 * Este módulo gerencia todas as operações relacionadas à autenticação,
 * incluindo o sistema de impersonation que permite administradores
 * acessarem o sistema como se fossem alunos específicos.
 * 
 * Fluxo de Impersonation:
 * 1. Admin inicia impersonation de um aluno
 * 2. Token original é armazenado
 * 3. Novo token de impersonation é usado
 * 4. Sistema opera como aluno
 * 5. Admin pode retornar à sua sessão original
 */
import api from './api';

const AUTH_TOKEN_KEY = 'token';
const USER_ROLE_KEY = 'userRole';
const IMPERSONATION_KEY = 'impersonating';
const ORIGINAL_TOKEN_KEY = 'originalToken';
const ORIGINAL_ROLE_KEY = 'originalRole';
const IMPERSONATED_USER_KEY = 'impersonatedUser';

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
   * @param {string} role - Tipo de usuário (admin, aluno)
   */
  setToken: (token, role) => {
    console.log(`Armazenando token no localStorage para ${role}`);
    console.log('Token recebido:', token);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_ROLE_KEY, role);
  },

  /**
   * Remove o token de autenticação (logout)
   */
  removeToken: () => {
    console.log('Removendo token do localStorage');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(IMPERSONATION_KEY);
    localStorage.removeItem(ORIGINAL_TOKEN_KEY);
    localStorage.removeItem(ORIGINAL_ROLE_KEY);
    localStorage.removeItem(IMPERSONATED_USER_KEY);
  },

  /**
   * Obtém o tipo de usuário logado
   * @returns {string|null} Tipo de usuário ou null se não estiver logado
   */
  getUserRole: () => {
    return localStorage.getItem(USER_ROLE_KEY);
  },

  /**
   * Verifica se o usuário está autenticado localmente
   * @returns {boolean} true se o token existir e for válido, false caso contrário
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
      return false;
    }
    
    try {
      // Verificação básica de formato de token JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('Token com formato inválido');
        return false;
      }
      
      // Verifica expiração do token, se houver payload
      // Os tokens JWT têm a segunda parte como payload, que deve ser decodificada de base64
      const payload = JSON.parse(atob(tokenParts[1]));
      
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Converte de segundos para milissegundos
        const currentTime = Date.now();
        
        if (currentTime > expirationTime) {
          console.log('Token expirado');
          // Remove o token expirado
          authService.removeToken();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
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
   * Realiza login unificado no sistema
   * @param {Object} credentials - Credenciais de login
   * @param {string} credentials.login - Login do usuário
   * @param {string} credentials.senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  login: async (credentials) => {
    try {
      console.log('Tentando fazer login com:', credentials.login);
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        // Armazena o grupo retornado pelo backend
        authService.setToken(response.data.token, response.data.grupo);
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  /**
   * Inicia uma sessão de impersonation como aluno
   * @param {number} alunoId - ID do aluno a ser impersonado
   * @returns {Promise<Object>} Dados do usuário impersonado e novo token
   * 
   * Processo:
   * 1. Solicita token de impersonation do backend
   * 2. Armazena credenciais originais do admin
   * 3. Configura nova sessão como aluno
   * 4. Atualiza headers de autenticação
   */
  async startImpersonation(alunoId) {
    try {
      console.log('Iniciando impersonation para aluno:', alunoId);
      const response = await api.post(`/auth/impersonate/${alunoId}`);
      
      if (response.data.success && response.data.token) {
        console.log('Token de impersonation recebido:', response.data);
        
        // Guarda o token e role originais
        localStorage.setItem(ORIGINAL_TOKEN_KEY, this.getToken());
        localStorage.setItem(ORIGINAL_ROLE_KEY, this.getUserRole());
        
        // Define o novo token de impersonation
        this.setToken(response.data.token, 'aluno');
        localStorage.setItem(IMPERSONATION_KEY, 'true');
        localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(response.data.usuario));
        
        // Configura o token no Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        console.log('Impersonation configurado com sucesso');
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao iniciar impersonation:', error);
      throw error;
    }
  },

  /**
   * Encerra uma sessão de impersonation
   * 
   * Processo:
   * 1. Recupera credenciais originais do admin
   * 2. Restaura sessão original
   * 3. Limpa dados de impersonation
   * 4. Atualiza headers de autenticação
   */
  stopImpersonation() {
    const originalToken = localStorage.getItem(ORIGINAL_TOKEN_KEY);
    const originalRole = localStorage.getItem(ORIGINAL_ROLE_KEY);
    
    if (originalToken && originalRole) {
      console.log('Restaurando sessão original');
      this.setToken(originalToken, originalRole);
      
      // Configura o token original no Axios
      api.defaults.headers.common['Authorization'] = `Bearer ${originalToken}`;
      
      localStorage.removeItem(ORIGINAL_TOKEN_KEY);
      localStorage.removeItem(ORIGINAL_ROLE_KEY);
      localStorage.removeItem(IMPERSONATION_KEY);
      localStorage.removeItem(IMPERSONATED_USER_KEY);
    }
  },

  /**
   * Verifica se está em modo de impersonation
   * @returns {boolean} true se estiver em modo de impersonation
   * 
   * Usado para:
   * - Controlar exibição de alertas de impersonation
   * - Gerenciar comportamento de componentes
   * - Validar operações permitidas
   */
  isImpersonating() {
    return localStorage.getItem(IMPERSONATION_KEY) === 'true';
  },

  /**
   * Obtém o papel original do usuário antes do impersonation
   * @returns {string|null}
   */
  getOriginalRole() {
    return localStorage.getItem(ORIGINAL_ROLE_KEY);
  },

  /**
   * Obtém os dados do usuário sendo impersonado
   * @returns {Object|null}
   */
  getImpersonatedUser() {
    const userData = localStorage.getItem(IMPERSONATED_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService; 