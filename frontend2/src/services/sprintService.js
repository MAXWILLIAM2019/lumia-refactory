import api from './api';

export const sprintService = {
  async cadastrarSprint(sprintData) {
    try {
      const response = await api.post('/sprints', sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar sprint:', error);
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar sprint');
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
  }
}; 