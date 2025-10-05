import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { getFeatureFlag, FEATURE_FLAGS } from './config/feature-flags';
import { setUseNewEndpoints } from './services/api-endpoints';

/**
 * Componente principal da aplicação
 * Define as rotas e a estrutura base do app
 * 
 * Rotas disponíveis:
 * - /: Dashboard principal
 * - /register-sprint: Cadastro de sprints
 * - /edit-sprint/:id: Edição de sprint específica
 * - /sprints: Listagem de sprints
 * - /register-student: Cadastro de alunos
 * - /register-plan: Cadastro de planos
 * - /planos: Listagem de planos
 * - /planos/cadastrar: Cadastro de planos (rota alternativa)
 * - /planos/editar/:id: Edição de plano específico
 * - /teste-endpoints: Teste de endpoints da API
 */
function App() {
  // Configura os endpoints com base nas feature flags
  useEffect(() => {
    // Configura o uso dos novos endpoints com base na feature flag
    const useNewEndpoints = getFeatureFlag(FEATURE_FLAGS.USE_NEW_ENDPOINTS);
    setUseNewEndpoints(useNewEndpoints);
    
    // Adiciona um listener para atualizar a configuração quando a feature flag mudar
    const handleFeatureFlagChange = (event) => {
      if (event.detail?.flagName === FEATURE_FLAGS.USE_NEW_ENDPOINTS) {
        setUseNewEndpoints(event.detail.value);
      }
    };
    
    window.addEventListener('featureFlagChanged', handleFeatureFlagChange);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleFeatureFlagChange);
    };
  }, []);
  
  return <AppRoutes />;
}

export default App;