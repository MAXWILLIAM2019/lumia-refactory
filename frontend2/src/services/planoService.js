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
      
      // Garante que sempre retornamos um array, mesmo se a API retornar null/undefined
      if (!response.data) {
        console.log('3. Dados não encontrados, retornando array vazio');
        return [];
      }
      
      // Verifica se os dados recebidos têm o formato esperado
      if (!Array.isArray(response.data)) {
        console.warn('4. Resposta da API não é um array:', response.data);
        // Se não for um array mas for um objeto, pode ser o caso de um único plano
        if (response.data && typeof response.data === 'object') {
          console.log('5. Convertendo objeto único em array');
          return [response.data];
        }
        // Caso contrário, retorna array vazio
        return [];
      }
      
      console.log('6. Processamento concluído, retornando dados');
      return response.data;
    } catch (error) {
      console.error('7. Erro ao listar planos:', error);
      
      // Adiciona mais detalhes ao erro para diagnóstico
      if (error.response) {
        console.error('8. Dados da resposta de erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('9. Erro na requisição (sem resposta):', error.request);
      }
      
      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar planos'
      );
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