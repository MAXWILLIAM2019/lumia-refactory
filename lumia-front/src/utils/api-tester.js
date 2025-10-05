/**
 * Utilitário para testar a API
 * 
 * Este módulo fornece funções para testar os endpoints da API,
 * verificando se estão funcionando corretamente e comparando
 * as respostas dos endpoints antigos e novos.
 */
import api from '../services/api';
import { OLD_ENDPOINTS, NEW_ENDPOINTS, API_CONFIG } from '../services/api-endpoints';

/**
 * Testa um endpoint específico
 * @param {string} module - Módulo da API (PLANOS, DISCIPLINAS, etc.)
 * @param {string} endpoint - Nome do endpoint dentro do módulo
 * @param {Array} params - Parâmetros para endpoints dinâmicos
 * @param {string} method - Método HTTP (get, post, put, delete)
 * @param {Object} data - Dados para enviar no corpo da requisição (para POST e PUT)
 * @returns {Promise<Object>} Resultado do teste
 */
export async function testEndpoint(module, endpoint, params = [], method = 'get', data = null) {
  // Salva o estado atual da configuração
  const originalConfig = { ...API_CONFIG };
  
  try {
    // Resultados dos testes
    const results = {
      old: { success: false, data: null, error: null, time: 0 },
      new: { success: false, data: null, error: null, time: 0 }
    };
    
    // Testa o endpoint antigo
    API_CONFIG.useNewEndpoints = false;
    const oldUrl = getEndpointUrl(OLD_ENDPOINTS, module, endpoint, params);
    const oldStartTime = performance.now();
    
    try {
      const oldResponse = await makeRequest(oldUrl, method, data);
      results.old.success = true;
      results.old.data = oldResponse.data;
      results.old.status = oldResponse.status;
    } catch (error) {
      results.old.error = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
    
    results.old.time = performance.now() - oldStartTime;
    
    // Testa o endpoint novo
    API_CONFIG.useNewEndpoints = true;
    const newUrl = getEndpointUrl(NEW_ENDPOINTS, module, endpoint, params);
    const newStartTime = performance.now();
    
    try {
      const newResponse = await makeRequest(newUrl, method, data);
      results.new.success = true;
      results.new.data = newResponse.data;
      results.new.status = newResponse.status;
    } catch (error) {
      results.new.error = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
    
    results.new.time = performance.now() - newStartTime;
    
    // Compara os resultados
    results.comparison = compareResults(results.old, results.new);
    
    return results;
  } finally {
    // Restaura a configuração original
    Object.assign(API_CONFIG, originalConfig);
  }
}

/**
 * Obtém a URL completa de um endpoint
 * @param {Object} endpoints - Objeto de endpoints
 * @param {string} module - Módulo da API
 * @param {string} endpoint - Nome do endpoint
 * @param {Array} params - Parâmetros para endpoints dinâmicos
 * @returns {string} URL completa
 */
function getEndpointUrl(endpoints, module, endpoint, params) {
  if (!endpoints[module]) {
    throw new Error(`Módulo "${module}" não encontrado nos endpoints`);
  }
  
  const endpointFn = endpoints[module][endpoint];
  
  if (!endpointFn) {
    throw new Error(`Endpoint "${endpoint}" não encontrado no módulo "${module}"`);
  }
  
  // Se o endpoint for uma função (para endpoints dinâmicos com parâmetros)
  if (typeof endpointFn === 'function') {
    return endpointFn(...params);
  }
  
  // Se for uma string direta
  return endpointFn;
}

/**
 * Faz uma requisição HTTP
 * @param {string} url - URL da requisição
 * @param {string} method - Método HTTP
 * @param {Object} data - Dados para enviar no corpo da requisição
 * @returns {Promise<Object>} Resposta da requisição
 */
async function makeRequest(url, method, data) {
  switch (method.toLowerCase()) {
    case 'get':
      return await api.get(url);
    case 'post':
      return await api.post(url, data);
    case 'put':
      return await api.put(url, data);
    case 'delete':
      return await api.delete(url);
    default:
      throw new Error(`Método HTTP não suportado: ${method}`);
  }
}

/**
 * Compara os resultados dos testes
 * @param {Object} oldResult - Resultado do endpoint antigo
 * @param {Object} newResult - Resultado do endpoint novo
 * @returns {Object} Resultado da comparação
 */
function compareResults(oldResult, newResult) {
  const comparison = {
    bothSucceeded: oldResult.success && newResult.success,
    bothFailed: !oldResult.success && !newResult.success,
    onlyOldSucceeded: oldResult.success && !newResult.success,
    onlyNewSucceeded: !oldResult.success && newResult.success,
    sameStatusCode: oldResult.status === newResult.status,
    sameDataStructure: false,
    differences: []
  };
  
  // Se ambos tiveram sucesso, compara a estrutura dos dados
  if (comparison.bothSucceeded) {
    comparison.sameDataStructure = compareDataStructure(oldResult.data, newResult.data, comparison.differences);
  }
  
  return comparison;
}

/**
 * Compara a estrutura de dois objetos de dados
 * @param {any} oldData - Dados do endpoint antigo
 * @param {any} newData - Dados do endpoint novo
 * @param {Array} differences - Array para armazenar as diferenças encontradas
 * @returns {boolean} True se as estruturas forem iguais
 */
function compareDataStructure(oldData, newData, differences = []) {
  // Se os tipos forem diferentes
  if (typeof oldData !== typeof newData) {
    differences.push({
      path: '',
      oldType: typeof oldData,
      newType: typeof newData
    });
    return false;
  }
  
  // Se for um array
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    // Se os arrays tiverem tamanhos diferentes
    if (oldData.length !== newData.length) {
      differences.push({
        path: '',
        oldLength: oldData.length,
        newLength: newData.length
      });
    }
    
    // Se os arrays estiverem vazios, considera que têm a mesma estrutura
    if (oldData.length === 0 && newData.length === 0) {
      return true;
    }
    
    // Compara o primeiro item dos arrays para verificar a estrutura
    if (oldData.length > 0 && newData.length > 0) {
      return compareDataStructure(oldData[0], newData[0], differences);
    }
    
    return true;
  }
  
  // Se for um objeto
  if (oldData !== null && newData !== null && typeof oldData === 'object' && typeof newData === 'object') {
    const oldKeys = Object.keys(oldData);
    const newKeys = Object.keys(newData);
    
    // Verifica se há campos diferentes
    const oldOnly = oldKeys.filter(key => !newKeys.includes(key));
    const newOnly = newKeys.filter(key => !oldKeys.includes(key));
    
    if (oldOnly.length > 0) {
      differences.push({
        path: '',
        oldOnly
      });
    }
    
    if (newOnly.length > 0) {
      differences.push({
        path: '',
        newOnly
      });
    }
    
    // Compara campos em comum
    const commonKeys = oldKeys.filter(key => newKeys.includes(key));
    let structureEqual = true;
    
    for (const key of commonKeys) {
      const keyEqual = compareDataStructure(
        oldData[key], 
        newData[key], 
        differences.map(diff => ({
          ...diff,
          path: diff.path ? `${key}.${diff.path}` : key
        }))
      );
      
      structureEqual = structureEqual && keyEqual;
    }
    
    return structureEqual;
  }
  
  // Para tipos primitivos, considera que têm a mesma estrutura
  return true;
}

/**
 * Testa todos os endpoints principais
 * @returns {Promise<Object>} Resultados dos testes
 */
export async function testAllEndpoints() {
  const results = {};
  
  // Testa endpoints de planos
  results.planos = {
    listar: await testEndpoint('PLANOS', 'BASE'),
    // Outros endpoints de planos...
  };
  
  // Testa endpoints de disciplinas
  results.disciplinas = {
    listar: await testEndpoint('DISCIPLINAS', 'BASE'),
    ativas: await testEndpoint('DISCIPLINAS', 'ATIVAS'),
    // Outros endpoints de disciplinas...
  };
  
  // Testa endpoints de sprints
  results.sprints = {
    listar: await testEndpoint('SPRINTS', 'BASE'),
    // Outros endpoints de sprints...
  };
  
  // Testa endpoints de alunos
  results.alunos = {
    listar: await testEndpoint('ALUNOS', 'BASE'),
    // Outros endpoints de alunos...
  };
  
  return results;
}
