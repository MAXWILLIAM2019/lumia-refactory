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
  },

  // Métodos para gerenciar versionamento de disciplinas
  
  async listarVersoesDisciplina(id) {
    try {
      console.log(`Iniciando listagem de versões da disciplina ${id}`);
      const response = await api.get(`/disciplinas/${id}/versoes`);
      
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
      console.error('Erro ao listar versões da disciplina:', error);
      
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao listar versões da disciplina'
      );
    }
  },
  
  async criarVersaoDisciplina(id, dados) {
    try {
      console.log(`Criando nova versão da disciplina ${id}`);
      const response = await api.post(`/disciplinas/${id}/versoes`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar versão da disciplina:', error);
      
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao criar versão da disciplina'
      );
    }
  },
  
  async compararVersoesDisciplina(id1, id2) {
    try {
      console.log(`Comparando versões ${id1} e ${id2}`);
      const response = await api.get(`/disciplinas/comparar/${id1}/${id2}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao comparar versões da disciplina:', error);
      
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Erro ao comparar versões da disciplina'
      );
    }
  }
}; 