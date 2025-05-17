/**
 * Serviço de Gerenciamento de Alunos
 * 
 * Este módulo contém todas as operações relacionadas à API de alunos,
 * centralizando a comunicação entre o frontend e o backend.
 */
import api from './api';

export const alunoService = {
  /**
   * Cadastra um novo aluno no sistema
   * 
   * @param {Object} alunoData - Dados do aluno a ser cadastrado
   * @param {string} alunoData.nome - Nome completo do aluno
   * @param {string} alunoData.email - E-mail único do aluno
   * @param {string} alunoData.cpf - CPF único do aluno
   * @returns {Promise<Object>} Dados do aluno cadastrado com ID
   * @throws {Error} Erro se o cadastro falhar (ex: email/CPF duplicado)
   */
  async cadastrarAluno(alunoData) {
    try {
      console.log('Enviando dados para API:', alunoData);
      const response = await api.post('/alunos', alunoData);
      console.log('Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Resposta do servidor:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar aluno');
    }
  },

  /**
   * Lista todos os alunos cadastrados no sistema
   * 
   * @returns {Promise<Array>} Lista de alunos cadastrados
   * @throws {Error} Erro se a listagem falhar
   */
  async listarAlunos() {
    try {
      const response = await api.get('/alunos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao listar alunos');
    }
  },

  /**
   * Busca os dados de um aluno específico pelo ID
   * 
   * @param {number|string} id - ID do aluno a ser buscado
   * @returns {Promise<Object>} Dados do aluno encontrado
   * @throws {Error} Erro se a busca falhar ou o aluno não existir
   */
  async buscarAlunoPorId(id) {
    try {
      const response = await api.get(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar aluno');
    }
  }
}; 