import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const alunoService = {
  async cadastrarAluno(alunoData) {
    try {
      console.log('Enviando dados para API:', alunoData);
      const response = await axios.post(`${API_URL}/alunos`, alunoData);
      console.log('Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Resposta do servidor:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar aluno');
    }
  },

  async listarAlunos() {
    try {
      const response = await axios.get(`${API_URL}/alunos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar alunos');
    }
  },

  async buscarAlunoPorId(id) {
    try {
      const response = await axios.get(`${API_URL}/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar aluno');
    }
  }
}; 