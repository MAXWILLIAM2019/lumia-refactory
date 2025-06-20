import api from './api';

export const sprintService = {
  async cadastrarSprint(sprintData) {
    try {
      if (!sprintData.planoId) {
        throw new Error('É necessário selecionar um plano de estudo');
      }
      
      const response = await api.post('/sprints', sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar sprint:', error);
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar sprint');
    }
  },

  async listarSprints() {
    try {
      const response = await api.get('/sprints');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar sprints:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar sprints');
    }
  },

  async atualizarSprint(id, sprintData) {
    try {
      const response = await api.put(`/sprints/${id}`, sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar sprint:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar sprint');
    }
  },

  async buscarSprintPorId(id) {
    try {
      const response = await api.get(`/sprints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar sprint:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar sprint');
    }
  },
  
  async excluirSprint(id) {
    try {
      const response = await api.delete(`/sprints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir sprint:', error);
      throw new Error(error.response?.data?.message || 'Erro ao excluir sprint');
    }
  },
  
  async reordenarSprints(planoId, ordemSprints) {
    try {
      const response = await api.post('/sprints/reordenar', {
        planoId,
        ordemSprints
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao reordenar sprints:', error);
      throw new Error(error.response?.data?.message || 'Erro ao reordenar sprints');
    }
  },

  async listarSprintsPorPlano(planoId) {
    try {
      const response = await api.get(`/planos/${planoId}/sprints`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar sprints do plano:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar sprints do plano');
    }
  },

  async listarSprintsDoAluno() {
    try {
      const response = await api.get('/alunos/sprints');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar sprints do aluno:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar sprints do aluno');
    }
  },

  async adicionarMetas(sprintId, metas) {
    try {
      const response = await api.post(`/sprints/${sprintId}/metas`, metas);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar metas:', error);
      throw new Error(error.response?.data?.message || 'Erro ao adicionar metas à sprint');
    }
  }
}; 