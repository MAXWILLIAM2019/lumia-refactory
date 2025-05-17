import api from './api';

export const disciplinaService = {
  async listarDisciplinas() {
    try {
      console.log('1. Iniciando listagem de disciplinas');
      const response = await api.get('/disciplinas');
      console.log('2. Resposta da API:', response.data);
      
      if (!response.data) {
        console.log('3. Dados não encontrados, retornando array vazio');
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('4. Resposta da API não é um array:', response.data);
        if (response.data && typeof response.data === 'object') {
          console.log('5. Convertendo objeto único em array');
          return [response.data];
        }
        return [];
      }
      
      console.log('6. Processamento concluído, retornando dados');
      return response.data;
    } catch (error) {
      console.error('7. Erro ao listar disciplinas:', error);
      
      if (error.response) {
        console.error('8. Dados da resposta de erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('9. Erro na requisição (sem resposta):', error.request);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar disciplinas'
      );
    }
  },
  
  async listarDisciplinasAtivas() {
    try {
      console.log('1. Iniciando listagem de disciplinas ativas');
      const response = await api.get('/disciplinas/ativas');
      console.log('2. Resposta da API:', response.data);
      
      if (!response.data) {
        console.log('3. Dados não encontrados, retornando array vazio');
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('4. Resposta da API não é um array:', response.data);
        if (response.data && typeof response.data === 'object') {
          console.log('5. Convertendo objeto único em array');
          return [response.data];
        }
        return [];
      }
      
      console.log('6. Processamento concluído, retornando dados');
      return response.data;
    } catch (error) {
      console.error('7. Erro ao listar disciplinas ativas:', error);
      
      if (error.response) {
        console.error('8. Dados da resposta de erro:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('9. Erro na requisição (sem resposta):', error.request);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar disciplinas ativas'
      );
    }
  }
}; 