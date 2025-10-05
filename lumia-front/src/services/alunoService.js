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
  },

  /**
   * Define ou altera uma senha para um aluno
   * 
   * @param {number|string} id - ID do aluno
   * @param {Object} senhaData - Dados da senha
   * @param {string} [senhaData.senhaAtual] - Senha atual (obrigatória para alunos)
   * @param {string} senhaData.novaSenha - Nova senha
   * @returns {Promise<Object>} Mensagem de confirmação
   * @throws {Error} Erro se a definição de senha falhar
   */
  async definirSenha(id, senhaData) {
    try {
      const response = await api.post(`/alunos/${id}/definir-senha`, senhaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao definir senha:', error);
      throw new Error(error.response?.data?.message || 'Erro ao definir senha para o aluno');
    }
  },

  /**
   * Gera uma senha aleatória para um aluno
   * 
   * @param {number|string} id - ID do aluno
   * @returns {Promise<Object>} Objeto contendo a senha gerada e mensagem de confirmação
   * @throws {Error} Erro se a geração de senha falhar
   */
  async gerarSenha(id) {
    try {
      const response = await api.post(`/alunos/${id}/gerar-senha`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar senha:', error);
      throw new Error(error.response?.data?.message || 'Erro ao gerar senha para o aluno');
    }
  },

  /**
   * Atualiza os dados de um aluno
   * @param {number|string} id - ID do aluno
   * @param {Object} dados - Dados a serem atualizados
   * @returns {Promise<Object>} Dados do aluno atualizado
   */
  async atualizarAluno(id, dados) {
    try {
      const response = await api.put(`/alunos/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar aluno');
    }
  }
}; 