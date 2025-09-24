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
  baseURL: '/api'
});

/**
 * IMPORTANTE:
 * O baseURL já inclui '/api'. Portanto, todas as chamadas devem ser feitas usando apenas o caminho relativo após '/api'.
 * Exemplo correto: axios.get('/disciplinas') => http://localhost:3000/api/disciplinas
 * Exemplo incorreto: axios.get('/api/disciplinas') => http://localhost:3000/api/api/disciplinas (DUPLICADO!)
 *
 * Esse padrão vale para TODAS as requisições deste projeto.
 */

/**
 * Configuração do cliente Axios para comunicação com a API
 * 
 * Inclui suporte a:
 * - Autenticação via token JWT
 * - Impersonation de usuários
 * - Interceptação de requisições
 * - Logs detalhados para debug
 * 
 * Configuração:
 * - URL Base: http://localhost:3000/api
 * - Todas as requisições são relativas a esta base
 */

/**
 * Interceptor de Requisições
 * 
 * Responsável por:
 * 1. Verificar estado de impersonation
 * 2. Adicionar token de autenticação
 * 3. Registrar logs para debug
 * 
 * Fluxo:
 * - Verifica se está em modo de impersonation
 * - Recupera token apropriado (original ou impersonation)
 * - Adiciona header de autorização
 * - Registra informações para debug
 */
api.interceptors.request.use(
  (config) => {
    // Verifica se está em modo de impersonation
    const isImpersonating = localStorage.getItem('impersonating') === 'true';
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Se estiver em modo de impersonation, adiciona headers adicionais
      if (isImpersonating) {
        config.headers['X-Original-Token'] = localStorage.getItem('originalToken');
        config.headers['X-Original-Role'] = localStorage.getItem('originalRole');
      }
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na resposta da API:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export default api; 