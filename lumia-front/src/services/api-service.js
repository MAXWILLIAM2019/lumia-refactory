/**
 * Serviço centralizado de API
 * 
 * Este serviço encapsula todas as chamadas à API do sistema,
 * utilizando os endpoints definidos em api-endpoints.js.
 * 
 * Benefícios:
 * - Centraliza a lógica de comunicação com o backend
 * - Facilita a migração para novos endpoints
 * - Padroniza o tratamento de erros e logs
 * - Permite implementar cache e outras otimizações
 */
import api from './api';
import { getEndpoint } from './api-endpoints';

/**
 * Serviço de API para o módulo de Planos
 */
export const planoApiService = {
  /**
   * Lista todos os planos
   * @returns {Promise<Array>} Lista de planos
   */
  listarPlanos: async () => {
    try {
      console.log('API: Listando planos');
      const response = await api.get(getEndpoint('PLANOS', 'BASE'));
      
      // Normaliza a resposta para garantir um array
      if (!response.data) {
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          return [response.data];
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao listar planos:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar planos'
      );
    }
  },
  
  /**
   * Busca um plano pelo ID
   * @param {number} id - ID do plano
   * @returns {Promise<Object>} Dados do plano
   */
  buscarPlanoPorId: async (id) => {
    try {
      console.log(`API: Buscando plano ID ${id}`);
      const response = await api.get(getEndpoint('PLANOS', 'DETAIL', id));
      
      if (!response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar plano ${id}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao buscar plano'
      );
    }
  },
  
  /**
   * Cadastra um novo plano
   * @param {Object} planoData - Dados do plano
   * @returns {Promise<Object>} Plano criado
   */
  cadastrarPlano: async (planoData) => {
    try {
      console.log('API: Cadastrando plano', planoData);
      
      // Validação básica dos dados
      if (!planoData.nome || !planoData.cargo || !planoData.descricao || !planoData.duracao) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      const endpoint = getEndpoint('PLANOS', 'BASE');
      console.log(`API: Usando endpoint ${endpoint}`);
      const response = await api.post(endpoint, planoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar plano:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao cadastrar plano'
      );
    }
  },
  
  /**
   * Atualiza um plano existente
   * @param {number} id - ID do plano
   * @param {Object} planoData - Dados atualizados do plano
   * @returns {Promise<Object>} Plano atualizado
   */
  atualizarPlano: async (id, planoData) => {
    try {
      console.log(`API: Atualizando plano ID ${id}`, planoData);
      const response = await api.put(getEndpoint('PLANOS', 'DETAIL', id), planoData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar plano ${id}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar plano'
      );
    }
  },
  
  /**
   * Exclui um plano
   * @param {number} id - ID do plano
   * @returns {Promise<Object>} Resultado da operação
   */
  excluirPlano: async (id) => {
    try {
      console.log(`API: Excluindo plano ID ${id}`);
      const response = await api.delete(getEndpoint('PLANOS', 'DETAIL', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir plano ${id}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao excluir plano'
      );
    }
  },
  
  /**
   * Busca as disciplinas associadas a um plano
   * @param {number} planoId - ID do plano
   * @returns {Promise<Array>} Lista de disciplinas
   */
  buscarDisciplinasPorPlano: async (planoId) => {
    try {
      if (!planoId) {
        console.log('API: ID do plano não fornecido, retornando array vazio');
        return [];
      }
      
      console.log(`API: Buscando disciplinas do plano ID ${planoId}`);
      const response = await api.get(getEndpoint('PLANOS', 'DISCIPLINAS', planoId));
      
      // Normaliza a resposta para garantir um array
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          return [response.data];
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar disciplinas do plano ${planoId}:`, error);
      return [];
    }
  }
};

/**
 * Serviço de API para o módulo de Disciplinas
 */
export const disciplinaApiService = {
  /**
   * Lista todas as disciplinas
   * @returns {Promise<Array>} Lista de disciplinas
   */
  listarDisciplinas: async () => {
    try {
      console.log('API: Listando disciplinas');
      const response = await api.get(getEndpoint('DISCIPLINAS', 'BASE'));
      
      // Normaliza a resposta para garantir um array
      if (!response.data) {
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          return [response.data];
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao listar disciplinas:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar disciplinas'
      );
    }
  },
  
  /**
   * Lista todas as disciplinas ativas
   * @returns {Promise<Array>} Lista de disciplinas ativas
   */
  listarDisciplinasAtivas: async () => {
    try {
      console.log('API: Listando disciplinas ativas');
      const response = await api.get(getEndpoint('DISCIPLINAS', 'ATIVAS'));
      
      // Normaliza a resposta para garantir um array
      if (!response.data) {
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          return [response.data];
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao listar disciplinas ativas:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar disciplinas ativas'
      );
    }
  },
  
  /**
   * Lista versões de uma disciplina
   * @param {number} id - ID da disciplina
   * @returns {Promise<Array>} Lista de versões
   */
  listarVersoesDisciplina: async (id) => {
    try {
      console.log(`API: Listando versões da disciplina ID ${id}`);
      const response = await api.get(getEndpoint('DISCIPLINAS', 'VERSOES', id));
      
      // Normaliza a resposta para garantir um array
      if (!response.data) {
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          return [response.data];
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar versões da disciplina ${id}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar versões da disciplina'
      );
    }
  },
  
  /**
   * Cria uma nova versão de disciplina
   * @param {number} id - ID da disciplina
   * @param {Object} dados - Dados da nova versão
   * @returns {Promise<Object>} Nova versão criada
   */
  criarVersaoDisciplina: async (id, dados) => {
    try {
      console.log(`API: Criando nova versão da disciplina ID ${id}`, dados);
      const response = await api.post(getEndpoint('DISCIPLINAS', 'VERSOES', id), dados);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar versão da disciplina ${id}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao criar versão da disciplina'
      );
    }
  },
  
  /**
   * Compara duas versões de disciplina
   * @param {number} id1 - ID da primeira versão
   * @param {number} id2 - ID da segunda versão
   * @returns {Promise<Object>} Resultado da comparação
   */
  compararVersoesDisciplina: async (id1, id2) => {
    try {
      console.log(`API: Comparando versões ${id1} e ${id2}`);
      const response = await api.get(getEndpoint('DISCIPLINAS', 'COMPARAR', id1, id2));
      return response.data;
    } catch (error) {
      console.error(`Erro ao comparar versões ${id1} e ${id2}:`, error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao comparar versões da disciplina'
      );
    }
  }
};

/**
 * Serviço de API para o módulo de Sprints
 */
export const sprintApiService = {
  /**
   * Lista todas as sprints
   * @returns {Promise<Array>} Lista de sprints
   */
  listarSprints: async () => {
    try {
      console.log('API: Listando sprints');
      const response = await api.get(getEndpoint('SPRINTS', 'BASE'));
      return response.data;
    } catch (error) {
      console.error('Erro ao listar sprints:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar sprints'
      );
    }
  },
  
  /**
   * Cadastra uma nova sprint
   * @param {Object} sprintData - Dados da sprint
   * @returns {Promise<Object>} Sprint criada
   */
  cadastrarSprint: async (sprintData) => {
    try {
      if (!sprintData.planoId) {
        throw new Error('É necessário selecionar um plano de estudo');
      }
      
      console.log('API: Cadastrando sprint', sprintData);
      const response = await api.post(getEndpoint('SPRINTS', 'BASE'), sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar sprint:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao cadastrar sprint'
      );
    }
  },
  
  /**
   * Busca uma sprint pelo ID
   * @param {number} id - ID da sprint
   * @returns {Promise<Object>} Dados da sprint
   */
  buscarSprintPorId: async (id) => {
    try {
      console.log(`API: Buscando sprint ID ${id}`);
      const response = await api.get(getEndpoint('SPRINTS', 'DETAIL', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar sprint ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao buscar sprint'
      );
    }
  },
  
  /**
   * Atualiza uma sprint existente
   * @param {number} id - ID da sprint
   * @param {Object} sprintData - Dados atualizados da sprint
   * @returns {Promise<Object>} Sprint atualizada
   */
  atualizarSprint: async (id, sprintData) => {
    try {
      console.log(`API: Atualizando sprint ID ${id}`, sprintData);
      const response = await api.put(getEndpoint('SPRINTS', 'DETAIL', id), sprintData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar sprint ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar sprint'
      );
    }
  },
  
  /**
   * Exclui uma sprint
   * @param {number} id - ID da sprint
   * @returns {Promise<Object>} Resultado da operação
   */
  excluirSprint: async (id) => {
    try {
      console.log(`API: Excluindo sprint ID ${id}`);
      const response = await api.delete(getEndpoint('SPRINTS', 'DETAIL', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir sprint ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao excluir sprint'
      );
    }
  },
  
  /**
   * Reordena sprints de um plano
   * @param {number} planoId - ID do plano
   * @param {Array} ordemSprints - Nova ordem das sprints
   * @returns {Promise<Object>} Resultado da operação
   */
  reordenarSprints: async (planoId, ordemSprints) => {
    try {
      console.log(`API: Reordenando sprints do plano ID ${planoId}`, ordemSprints);
      const response = await api.post(getEndpoint('SPRINTS', 'REORDENAR'), {
        planoId,
        ordemSprints
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao reordenar sprints do plano ${planoId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao reordenar sprints'
      );
    }
  },
  
  /**
   * Lista sprints de um plano
   * @param {number} planoId - ID do plano
   * @returns {Promise<Array>} Lista de sprints
   */
  listarSprintsPorPlano: async (planoId) => {
    try {
      console.log(`API: Listando sprints do plano ID ${planoId}`);
      const response = await api.get(getEndpoint('SPRINTS', 'POR_PLANO', planoId));
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar sprints do plano ${planoId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar sprints do plano'
      );
    }
  },
  
  /**
   * Lista sprints do aluno autenticado
   * @returns {Promise<Array>} Lista de sprints
   */
  listarSprintsDoAluno: async () => {
    try {
      console.log('API: Listando sprints do aluno');
      const response = await api.get(getEndpoint('ALUNOS', 'SPRINTS'));
      return response.data;
    } catch (error) {
      console.error('Erro ao listar sprints do aluno:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar sprints do aluno'
      );
    }
  },
  
  /**
   * Adiciona metas a uma sprint
   * @param {number} sprintId - ID da sprint
   * @param {Array} metas - Metas a serem adicionadas
   * @returns {Promise<Object>} Resultado da operação
   */
  adicionarMetas: async (sprintId, metas) => {
    try {
      console.log(`API: Adicionando metas à sprint ID ${sprintId}`, metas);
      const response = await api.post(getEndpoint('SPRINTS', 'METAS', sprintId), metas);
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar metas à sprint ${sprintId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao adicionar metas à sprint'
      );
    }
  }
};

/**
 * Serviço de API para o módulo de Alunos/Usuários
 */
export const usuarioApiService = {
  /**
   * Lista todos os alunos
   * @returns {Promise<Array>} Lista de alunos
   */
  listarAlunos: async () => {
    try {
      console.log('API: Listando alunos');
      // Nos novos endpoints, usa /usuarios?grupo=aluno; nos antigos, usa /alunos
      const endpoint = getEndpoint('ALUNOS', 'BASE');
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar alunos'
      );
    }
  },
  
  /**
   * Busca um aluno pelo ID
   * @param {number} id - ID do aluno
   * @returns {Promise<Object>} Dados do aluno
   */
  buscarAlunoPorId: async (id) => {
    try {
      console.log(`API: Buscando aluno ID ${id}`);
      const response = await api.get(getEndpoint('ALUNOS', 'DETAIL', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar aluno ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao buscar aluno'
      );
    }
  },
  
  /**
   * Cadastra um novo aluno
   * @param {Object} alunoData - Dados do aluno
   * @returns {Promise<Object>} Aluno criado
   */
  cadastrarAluno: async (alunoData) => {
    try {
      console.log('API: Cadastrando aluno', alunoData);
      const response = await api.post(getEndpoint('ALUNOS', 'BASE'), alunoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao cadastrar aluno'
      );
    }
  },
  
  /**
   * Atualiza um aluno existente
   * @param {number} id - ID do aluno
   * @param {Object} alunoData - Dados atualizados do aluno
   * @returns {Promise<Object>} Aluno atualizado
   */
  atualizarAluno: async (id, alunoData) => {
    try {
      console.log(`API: Atualizando aluno ID ${id}`, alunoData);
      const response = await api.put(getEndpoint('ALUNOS', 'DETAIL', id), alunoData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar aluno ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar aluno'
      );
    }
  },
  
  /**
   * Define a senha de um aluno
   * @param {number} id - ID do aluno
   * @param {Object} senhaData - Dados da senha
   * @returns {Promise<Object>} Resultado da operação
   */
  definirSenha: async (id, senhaData) => {
    try {
      console.log(`API: Definindo senha para aluno ID ${id}`);
      const response = await api.post(getEndpoint('ALUNOS', 'DEFINIR_SENHA', id), senhaData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao definir senha para aluno ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao definir senha'
      );
    }
  },
  
  /**
   * Gera uma nova senha para um aluno
   * @param {number} id - ID do aluno
   * @returns {Promise<Object>} Resultado da operação com a senha gerada
   */
  gerarSenha: async (id) => {
    try {
      console.log(`API: Gerando senha para aluno ID ${id}`);
      const response = await api.post(getEndpoint('ALUNOS', 'GERAR_SENHA', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar senha para aluno ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao gerar senha'
      );
    }
  },
  
  /**
   * Atualiza as notificações de um aluno
   * @param {number} id - ID do aluno
   * @param {Object} notificacoesData - Configurações de notificações
   * @returns {Promise<Object>} Resultado da operação
   */
  atualizarNotificacoes: async (id, notificacoesData) => {
    try {
      console.log(`API: Atualizando notificações do aluno ID ${id}`, notificacoesData);
      const response = await api.put(getEndpoint('ALUNOS', 'NOTIFICACOES', id), notificacoesData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar notificações do aluno ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar notificações'
      );
    }
  }
};

/**
 * Serviço de API para o módulo de Autenticação
 */
export const authApiService = {
  /**
   * Realiza login no sistema
   * @param {Object} credentials - Credenciais de login
   * @returns {Promise<Object>} Dados do usuário e token
   */
  login: async (credentials) => {
    try {
      console.log('API: Realizando login');
      const response = await api.post(getEndpoint('AUTH', 'LOGIN'), credentials);
      return response.data;
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao realizar login'
      );
    }
  },
  
  /**
   * Obtém dados do usuário autenticado
   * @returns {Promise<Object>} Dados do usuário
   */
  me: async () => {
    try {
      console.log('API: Obtendo dados do usuário autenticado');
      const response = await api.get(getEndpoint('AUTH', 'ME'));
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao obter dados do usuário'
      );
    }
  },
  
  /**
   * Inicia impersonation de outro usuário
   * @param {number} id - ID do usuário a impersonar
   * @returns {Promise<Object>} Dados do usuário impersonado e token
   */
  impersonate: async (id) => {
    try {
      console.log(`API: Iniciando impersonation do usuário ID ${id}`);
      const response = await api.post(getEndpoint('AUTH', 'IMPERSONATE', id));
      return response.data;
    } catch (error) {
      console.error(`Erro ao impersonar usuário ${id}:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao impersonar usuário'
      );
    }
  },
  
  /**
   * Encerra impersonation
   * @returns {Promise<Object>} Dados do usuário original
   */
  stopImpersonate: async () => {
    try {
      console.log('API: Encerrando impersonation');
      const response = await api.post(getEndpoint('AUTH', 'STOP_IMPERSONATE'));
      return response.data;
    } catch (error) {
      console.error('Erro ao encerrar impersonation:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao encerrar impersonation'
      );
    }
  }
};
