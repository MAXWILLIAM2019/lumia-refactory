/**
 * Configuração centralizada de endpoints da API
 * 
 * Este módulo define todos os endpoints utilizados no sistema,
 * facilitando a migração para novas rotas e a manutenção.
 */

// Configuração de feature flag para controlar qual versão dos endpoints usar
export const API_CONFIG = {
  // Quando true, usa os novos endpoints; quando false, usa os endpoints antigos
  useNewEndpoints: false,
  
  // Ambiente atual (development, testing, production)
  environment: process.env.NODE_ENV || 'development'
};

// Endpoints antigos (versão atual)
export const OLD_ENDPOINTS = {
  // Módulo de Planos
  PLANOS: {
    BASE: '/planos',
    DETAIL: (id) => `/planos/${id}`,
    DISCIPLINAS: (id) => `/planos/${id}/disciplinas`,
  },
  
  // Módulo de Disciplinas
  DISCIPLINAS: {
    BASE: '/disciplinas',
    ATIVAS: '/disciplinas/ativas',
    DETAIL: (id) => `/disciplinas/${id}`,
    VERSOES: (id) => `/disciplinas/${id}/versoes`,
    COMPARAR: (id1, id2) => `/disciplinas/comparar/${id1}/${id2}`,
  },
  
  // Módulo de Sprints
  SPRINTS: {
    BASE: '/sprints',
    DETAIL: (id) => `/sprints/${id}`,
    REORDENAR: '/sprints/reordenar',
    POR_PLANO: (planoId) => `/planos/${planoId}/sprints`,
    METAS: (id) => `/sprints/${id}/metas`,
  },
  
  // Módulo de Alunos
  ALUNOS: {
    BASE: '/alunos',
    DETAIL: (id) => `/alunos/${id}`,
    DEFINIR_SENHA: (id) => `/alunos/${id}/definir-senha`,
    GERAR_SENHA: (id) => `/alunos/${id}/gerar-senha`,
    NOTIFICACOES: (id) => `/alunos/${id}/notificacoes`,
    SPRINTS: '/alunos/sprints',
  },
  
  // Módulo de Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    IMPERSONATE: (id) => `/auth/impersonate/${id}`,
    STOP_IMPERSONATE: '/auth/stop-impersonate',
  }
};

// Novos endpoints (versão refatorada)
export const NEW_ENDPOINTS = {
  // Módulo de Planos
  PLANOS: {
    BASE: '/planos-mestre',
    MESTRE: '/planos-mestre/mestre',
    DETAIL: (id) => `/planos-mestre/${id}`,
    MESTRE_DETAIL: (id) => `/planos-mestre/mestre/${id}`,
    DISCIPLINAS: (id) => `/planos-mestre/${id}/disciplinas`,
  },
  
  // Módulo de Disciplinas
  DISCIPLINAS: {
    BASE: '/disciplinas',
    ATIVAS: '/disciplinas/ativas',
    DETAIL: (id) => `/disciplinas/${id}`,
    VERSOES: (id) => `/disciplinas/${id}/versoes`,
    COMPARAR: (id1, id2) => `/disciplinas/comparar/${id1}/${id2}`,
  },
  
  // Módulo de Sprints
  SPRINTS: {
    BASE: '/sprints-mestre',
    DETAIL: (id) => `/sprints-mestre/${id}`,
    REORDENAR: '/sprints-mestre/reordenar',
    POR_PLANO: (planoId) => `/planos-mestre/${planoId}/sprints`,
    METAS: (id) => `/sprints-mestre/${id}/metas`,
  },
  
  // Módulo de Usuários (antigo Alunos)
  USUARIOS: {
    BASE: '/usuarios',
    ALUNOS: '/usuarios?grupo=aluno',
    DETAIL: (id) => `/usuarios/${id}`,
    DEFINIR_SENHA: (id) => `/usuarios/${id}/definir-senha`,
    GERAR_SENHA: (id) => `/usuarios/${id}/gerar-senha`,
    NOTIFICACOES: (id) => `/usuarios/${id}/notificacoes`,
  },
  
  // Funcionalidades específicas de alunos
  ALUNOS_FUNCIONALIDADES: {
    SPRINTS: '/alunos-funcionalidades/sprints',
  },
  
  // Módulo de Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    IMPERSONATE: (id) => `/auth/impersonate/${id}`,
    STOP_IMPERSONATE: '/auth/stop-impersonate',
  }
};

/**
 * Retorna o endpoint correto com base na configuração atual
 * @param {string} module - Módulo da API (PLANOS, DISCIPLINAS, etc.)
 * @param {string} endpoint - Nome do endpoint dentro do módulo
 * @param {Array} params - Parâmetros para endpoints dinâmicos
 * @returns {string} - URL do endpoint
 */
export function getEndpoint(module, endpoint, ...params) {
  const endpointsVersion = API_CONFIG.useNewEndpoints ? NEW_ENDPOINTS : OLD_ENDPOINTS;
  
  if (!endpointsVersion[module]) {
    console.error(`Módulo "${module}" não encontrado nos endpoints`);
    return '';
  }
  
  const endpointFn = endpointsVersion[module][endpoint];
  
  if (!endpointFn) {
    console.error(`Endpoint "${endpoint}" não encontrado no módulo "${module}"`);
    return '';
  }
  
  // Se o endpoint for uma função (para endpoints dinâmicos com parâmetros)
  if (typeof endpointFn === 'function') {
    return endpointFn(...params);
  }
  
  // Se for uma string direta
  return endpointFn;
}

/**
 * Ativa ou desativa o uso dos novos endpoints
 * @param {boolean} useNew - Se true, usa os novos endpoints; se false, usa os antigos
 */
export function setUseNewEndpoints(useNew) {
  API_CONFIG.useNewEndpoints = useNew;
  console.log(`Endpoints ${useNew ? 'novos' : 'antigos'} ativados`);
}
