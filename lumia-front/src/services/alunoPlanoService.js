/**
 * Serviço para gerenciamento de associações entre alunos e planos
 * 
 * Responsável por todas as operações relacionadas às associações,
 * como atribuir planos a alunos, atualizar progresso, etc.
 * 
 * NOTA: Atualmente implementado como relacionamento 1:1 simplificado
 * (um aluno tem um plano), mas preparado para expansão futura para N:N.
 */
import api from './api';

/**
 * Atribui um plano a um aluno
 * @param {Object} dados - Dados da associação
 * @param {number} dados.idusuario - ID do aluno
 * @param {number} dados.PlanoId - ID do plano (IMPORTANTE: deve ser maiúsculo)
 * @param {string} [dados.dataInicio] - Data de início (opcional)
 * @param {string} [dados.status] - Status inicial (opcional)
 * @param {string} [dados.observacoes] - Observações (opcional)
 * @returns {Promise} Promessa com a associação criada
 */
const atribuirPlano = async (dados) => {
  console.log('=== INÍCIO DA ATRIBUIÇÃO DE PLANO (SERVICE) ===');
  console.log('Dados originais recebidos:', dados);
  
  try {
    // Garantir que o PlanoId está com P maiúsculo
    const dadosFormatados = {
      ...dados,
      PlanoId: dados.PlanoId || dados.planoId // aceita ambos mas envia com P maiúsculo
    };
    delete dadosFormatados.planoId; // remove versão minúscula se existir
    
    console.log('Dados formatados para envio:', dadosFormatados);
    console.log('URL da requisição:', '/aluno-plano');
    
    try {
      const response = await api.post('/aluno-plano', dadosFormatados);
      console.log('✓ Resposta do servidor:', {
        status: response.status,
        data: response.data
      });
      console.log('=== ATRIBUIÇÃO DE PLANO CONCLUÍDA COM SUCESSO ===');
      return response.data;
    } catch (apiError) {
      console.error('✗ Erro na chamada da API:', {
        status: apiError.response?.status,
        data: apiError.response?.data,
        message: apiError.message
      });
      throw apiError;
    }
  } catch (error) {
    console.error('=== ERRO NA ATRIBUIÇÃO DE PLANO ===', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    throw error;
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
    console.log('Chamando API para listar associações...');
    const response = await api.get('/aluno-plano');
    console.log('Resposta da API para associações:', response);
    
    // Verifica e formata os dados recebidos para garantir consistência
    if (Array.isArray(response.data)) {
      return response.data.map(assoc => {
        // Garante que os campos importantes estejam acessíveis de forma consistente
        return {
          id: assoc.id,
          alunoId: assoc.IdUsuario || assoc.idusuario || assoc.AlunoId || assoc.alunoId,
          planoId: assoc.PlanoId || assoc.planoId,
          status: assoc.status || 'não definido',
          progresso: assoc.progresso || 0,
          dataInicio: assoc.dataInicio,
          // Formata os dados do plano de forma consistente
          plano: assoc.Plano || assoc.plano || {}
        };
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro no serviço alunoPlanoService.listarAssociacoes:', error);
    throw new Error(error.response?.data?.message || 'Erro ao listar associações');
  }
};

/**
 * Busca o plano associado a um aluno (relação 1:1 simplificada)
 * @param {number} alunoId - ID do aluno
 * @returns {Promise} Promessa com o plano do aluno (primeiro/único plano)
 */
const buscarPlanoPorAluno = async (alunoId) => {
  try {
    const response = await api.get(`/aluno-plano/aluno/${alunoId}`);
    
    // Para relação 1:1, retorna apenas o primeiro plano encontrado
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    return null; // Retorna null se não houver plano
  } catch (error) {
    console.error('Erro ao buscar plano do aluno:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar plano do aluno');
  }
};

/**
 * Busca os planos associados a um aluno
 * @param {number} alunoId - ID do aluno
 * @returns {Promise} Promessa com a lista de planos do aluno
 * @deprecated Use buscarPlanoPorAluno() para relação 1:1
 */
const buscarPlanosPorAluno = async (alunoId) => {
  try {
    console.log(`Buscando planos para o aluno ID: ${alunoId}`);
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
  buscarPlanoPorAluno,   // Nova função para relação 1:1
  buscarPlanosPorAluno,  // Mantida para compatibilidade
  buscarAlunosPorPlano
}; 