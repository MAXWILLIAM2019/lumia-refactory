/**
 * Configuração de Feature Flags
 * 
 * Este módulo gerencia as feature flags do sistema, permitindo
 * ativar ou desativar funcionalidades de forma controlada.
 * 
 * As feature flags são armazenadas no localStorage para persistência
 * entre sessões, mas podem ser sobrescritas por configurações de ambiente.
 */

// Nomes das feature flags
export const FEATURE_FLAGS = {
  // Flag para controlar o uso dos novos endpoints da API
  USE_NEW_ENDPOINTS: 'useNewEndpoints',
  
  // Flag para ativar logs detalhados de API
  VERBOSE_API_LOGGING: 'verboseApiLogging',
  
  // Flag para ativar modo de teste
  TEST_MODE: 'testMode'
};

// Valores padrão das feature flags
const DEFAULT_FLAGS = {
  [FEATURE_FLAGS.USE_NEW_ENDPOINTS]: false,
  [FEATURE_FLAGS.VERBOSE_API_LOGGING]: false,
  [FEATURE_FLAGS.TEST_MODE]: false
};

// Chave para armazenar as flags no localStorage
const STORAGE_KEY = 'sis_mentoria_feature_flags';

/**
 * Carrega as feature flags do localStorage
 * @returns {Object} Feature flags
 */
function loadFlags() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar feature flags:', error);
  }
  
  return { ...DEFAULT_FLAGS };
}

/**
 * Salva as feature flags no localStorage
 * @param {Object} flags - Feature flags a serem salvas
 */
function saveFlags(flags) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.error('Erro ao salvar feature flags:', error);
  }
}

// Carrega as flags iniciais
let currentFlags = loadFlags();

/**
 * Obtém o valor de uma feature flag
 * @param {string} flagName - Nome da feature flag
 * @param {any} defaultValue - Valor padrão caso a flag não exista
 * @returns {any} Valor da feature flag
 */
export function getFeatureFlag(flagName, defaultValue = false) {
  // Verifica se existe uma variável de ambiente para sobrescrever a flag
  const envFlag = process.env[`REACT_APP_FEATURE_${flagName.toUpperCase()}`];
  if (envFlag !== undefined) {
    return envFlag === 'true';
  }
  
  // Retorna o valor da flag ou o valor padrão
  return flagName in currentFlags ? currentFlags[flagName] : defaultValue;
}

/**
 * Define o valor de uma feature flag
 * @param {string} flagName - Nome da feature flag
 * @param {any} value - Novo valor da feature flag
 */
export function setFeatureFlag(flagName, value) {
  currentFlags = {
    ...currentFlags,
    [flagName]: value
  };
  
  saveFlags(currentFlags);
  
  // Dispara um evento para notificar outros componentes
  window.dispatchEvent(new CustomEvent('featureFlagChanged', {
    detail: { flagName, value }
  }));
  
  console.log(`Feature flag "${flagName}" ${value ? 'ativada' : 'desativada'}`);
}

/**
 * Reseta todas as feature flags para os valores padrão
 */
export function resetFeatureFlags() {
  currentFlags = { ...DEFAULT_FLAGS };
  saveFlags(currentFlags);
  
  // Dispara um evento para notificar outros componentes
  window.dispatchEvent(new CustomEvent('featureFlagsReset'));
  
  console.log('Feature flags resetadas para valores padrão');
}

/**
 * Obtém todas as feature flags
 * @returns {Object} Todas as feature flags
 */
export function getAllFeatureFlags() {
  return { ...currentFlags };
}
