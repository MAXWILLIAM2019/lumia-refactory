import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const planoService = {
  async cadastrarPlano(planoData) {
    try {
      console.log('1. Iniciando cadastro de plano');
      console.log('2. URL da API:', `${API_URL}/planos`);
      console.log('3. Dados do plano:', JSON.stringify(planoData, null, 2));
      
      // Validação básica dos dados antes de enviar
      if (!planoData.nome || !planoData.cargo || !planoData.descricao || !planoData.duracao) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (!planoData.disciplinas || !Array.isArray(planoData.disciplinas) || planoData.disciplinas.length === 0) {
        throw new Error('É necessário adicionar pelo menos uma disciplina');
      }

      // Verifica se o servidor está respondendo
      try {
        console.log('4. Fazendo requisição POST para:', `${API_URL}/planos`);
        console.log('4.1. Headers:', {
          'Content-Type': 'application/json'
        });
        console.log('4.2. Body:', JSON.stringify(planoData, null, 2));
        
        const response = await axios.post(`${API_URL}/planos`, planoData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('5. Resposta da API:', response.data);
        return response.data;
      } catch (axiosError) {
        console.error('6. Erro na requisição:', axiosError);
        console.error('6.1. Erro completo:', {
          message: axiosError.message,
          response: axiosError.response?.data,
          status: axiosError.response?.status,
          headers: axiosError.response?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers,
            data: axiosError.config?.data
          }
        });
        
        if (!axiosError.response) {
          throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }
        
        if (axiosError.response.status === 400) {
          throw new Error(`Erro de validação: ${axiosError.response.data.error}`);
        }
        
        if (axiosError.response.status === 500) {
          console.error('6.2. Erro 500 detalhado:', {
            error: axiosError.response.data.error,
            message: axiosError.response.data.message,
            stack: axiosError.response.data.stack
          });
          throw new Error(`Erro no servidor: ${axiosError.response.data.error || 'Erro interno do servidor'}`);
        }

        throw new Error(`Erro ao cadastrar plano: ${axiosError.response.data.error || axiosError.message}`);
      }
    } catch (error) {
      console.error('8. Erro completo:', error);
      throw error; // Propaga o erro com a mensagem específica
    }
  },

  async listarPlanos() {
    try {
      console.log('1. Iniciando listagem de planos');
      console.log('2. URL da API:', `${API_URL}/planos`);
      
      const response = await axios.get(`${API_URL}/planos`);
      console.log('3. Resposta da API:', response.data);
      console.log('4. Status da resposta:', response.status);
      console.log('5. Headers da resposta:', response.headers);
      
      if (!Array.isArray(response.data)) {
        console.error('6. Erro: resposta não é um array:', response.data);
        throw new Error('Formato de resposta inválido');
      }
      
      return response.data;
    } catch (error) {
      console.error('7. Erro ao listar planos:', error);
      console.error('8. Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      if (!error.response) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao listar planos');
    }
  },

  async buscarPlanoPorId(id) {
    try {
      console.log('Buscando plano por ID:', id);
      const response = await axios.get(`${API_URL}/planos/${id}`);
      console.log('Plano encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      if (!error.response) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao buscar plano');
    }
  },

  async atualizarPlano(id, planoData) {
    try {
      console.log('1. Iniciando atualização do plano');
      console.log('2. ID do plano:', id);
      console.log('3. Dados do plano:', JSON.stringify(planoData, null, 2));
      console.log('4. URL da API:', `${API_URL}/planos/${id}`);
      
      const response = await axios.put(`${API_URL}/planos/${id}`, planoData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('5. Resposta da API:', response.data);
      console.log('6. Status da resposta:', response.status);
      console.log('7. Headers da resposta:', response.headers);
      
      return response.data;
    } catch (error) {
      console.error('8. Erro ao atualizar plano:', error);
      console.error('9. Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      if (!error.response) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao atualizar plano');
    }
  },

  async excluirPlano(id) {
    try {
      console.log('Excluindo plano:', id);
      const response = await axios.delete(`${API_URL}/planos/${id}`);
      console.log('Plano excluído:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      if (!error.response) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao excluir plano');
    }
  }
}; 