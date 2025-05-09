import api from './api';

export const planoService = {
  async cadastrarPlano(planoData) {
    try {
      console.log('1. Iniciando cadastro de plano');
      console.log('2. Dados do plano:', JSON.stringify(planoData, null, 2));
      
      // Validação básica dos dados antes de enviar
      if (!planoData.nome || !planoData.cargo || !planoData.descricao || !planoData.duracao) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (!planoData.disciplinas || !Array.isArray(planoData.disciplinas) || planoData.disciplinas.length === 0) {
        throw new Error('É necessário adicionar pelo menos uma disciplina');
      }

      const response = await api.post('/planos', planoData);
      console.log('3. Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('4. Erro ao cadastrar plano:', error);
      throw error;
    }
  },

  async listarPlanos() {
    try {
      console.log('1. Iniciando listagem de planos');
      const response = await api.get('/planos');
      console.log('2. Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('3. Erro ao listar planos:', error);
      throw error;
    }
  },

  async buscarPlanoPorId(id) {
    try {
      console.log('Buscando plano por ID:', id);
      const response = await api.get(`/planos/${id}`);
      console.log('Plano encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      throw error;
    }
  },

  async atualizarPlano(id, planoData) {
    try {
      console.log('1. Iniciando atualização do plano');
      console.log('2. ID do plano:', id);
      console.log('3. Dados do plano:', JSON.stringify(planoData, null, 2));
      
      const response = await api.put(`/planos/${id}`, planoData);
      console.log('4. Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('5. Erro ao atualizar plano:', error);
      throw error;
    }
  },

  async excluirPlano(id) {
    try {
      console.log('Excluindo plano:', id);
      const response = await api.delete(`/planos/${id}`);
      console.log('Plano excluído:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      throw error;
    }
  }
}; 