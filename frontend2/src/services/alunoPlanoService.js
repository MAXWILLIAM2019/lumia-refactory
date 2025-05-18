/**
 * Serviço para gerenciamento de associações entre alunos e planos
 * 
 * Responsável por todas as operações relacionadas às associações,
 * como atribuir planos a alunos, atualizar progresso, etc.
 */
import api from './api';

/**
 * Atribui um plano a um aluno
 * @param {Object} dados - Dados da associação
 * @param {number} dados.alunoId - ID do aluno
 * @param {number} dados.planoId - ID do plano
 * @param {string} [dados.dataInicio] - Data de início (opcional)
 * @param {string} [dados.status] - Status inicial (opcional)
 * @param {string} [dados.observacoes] - Observações (opcional)
 * @returns {Promise} Promessa com a associação criada
 */
const atribuirPlano = async (dados) => {
  try {
    const response = await api.post('/aluno-plano', dados);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atribuir plano ao aluno');
  }
};

/**
 * Atualiza o progresso de um aluno em um plano
 * @param {number} id - ID da associação
 * @param {Object} dados - Dados a serem atualizados
 * @returns {Promise} Promessa com a associação atualizada
 */
const atualizarProgresso = async (id, dados) => {
  try {
    const response = await api.put(`/aluno-plano/${id}`, dados);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar progresso');
  }
};

/**
 * Remove a associação entre um aluno e um plano
 * @param {number} id - ID da associação
 * @returns {Promise} Promessa com mensagem de sucesso
 */
const removerAssociacao = async (id) => {
  try {
    const response = await api.delete(`/aluno-plano/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao remover associação');
  }
};

/**
 * Lista todas as associações entre alunos e planos
 * @returns {Promise} Promessa com a lista de associações
 */
const listarAssociacoes = async () => {
  try {
    const response = await api.get('/aluno-plano');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar associações');
  }
};

/**
 * Busca os planos associados a um aluno
 * @param {number} alunoId - ID do aluno
 * @returns {Promise} Promessa com a lista de planos do aluno
 */
const buscarPlanosPorAluno = async (alunoId) => {
  try {
    const response = await api.get(`/aluno-plano/aluno/${alunoId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar planos do aluno');
  }
};

/**
 * Busca os alunos associados a um plano
 * @param {number} planoId - ID do plano
 * @returns {Promise} Promessa com a lista de alunos do plano
 */
const buscarAlunosPorPlano = async (planoId) => {
  try {
    const response = await api.get(`/aluno-plano/plano/${planoId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar alunos do plano');
  }
};

export const alunoPlanoService = {
  atribuirPlano,
  atualizarProgresso,
  removerAssociacao,
  listarAssociacoes,
  buscarPlanosPorAluno,
  buscarAlunosPorPlano
}; 