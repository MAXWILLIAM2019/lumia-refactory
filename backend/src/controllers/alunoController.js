/**
 * Controller de Aluno
 * 
 * Este módulo gerencia todas as operações relacionadas a alunos,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa regras de negócio e validação de dados.
 */
const Aluno = require('../models/Aluno');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const GrupoUsuario = require('../models/GrupoUsuario');
const AlunoInfo = require('../models/AlunoInfo');

/**
 * Cria um novo aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} req.body.nome - Nome do aluno
 * @param {string} req.body.email - Email do aluno (deve ser único)
 * @param {string} req.body.cpf - CPF do aluno (deve ser único)
 * @param {string} [req.body.senha] - Senha do aluno (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno criado com status 201 ou mensagem de erro
 */
exports.createAluno = async (req, res) => {
  try {
    const { nome, email, cpf, senha } = req.body;
    if (!nome || !email || !cpf) {
      return res.status(400).json({ message: 'Preencha nome, email e CPF.' });
    }

    // Verifica se já existe usuário com o mesmo email (login)
    const usuarioExistente = await Usuario.findOne({ where: { login: email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Já existe um usuário com este email.' });
    }

    // Verifica se já existe usuário com o mesmo CPF
    const cpfExistente = await Usuario.findOne({ where: { cpf } });
    if (cpfExistente) {
      return res.status(400).json({ message: 'Já existe um usuário com este CPF.' });
    }

    // Busca o grupo "aluno"
    const grupoObj = await GrupoUsuario.findOne({ where: { nome: 'aluno' } });
    if (!grupoObj) {
      return res.status(400).json({ message: 'Grupo de usuário "aluno" não encontrado.' });
    }

    // Criptografa a senha se enviada, senão deixa nulo
    let senhaCriptografada = null;
    if (senha) {
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    // Cria o usuário
    const novoUsuario = await Usuario.create({
      login: email,
      senha: senhaCriptografada,
      grupo: grupoObj.IdGrupo,
      situacao: true,
      nome: nome,
      cpf: cpf
    });

    // Cria info complementar
    const novoAlunoInfo = await AlunoInfo.create({
      IdUsuario: novoUsuario.IdUsuario,
      email
    });

    // Monta resposta (sem senha)
    const usuarioSemSenha = novoUsuario.toJSON();
    delete usuarioSemSenha.senha;
    const alunoInfo = novoAlunoInfo.toJSON();

    res.status(201).json({ usuario: usuarioSemSenha, alunoInfo });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Já existe um aluno cadastrado com este email ou CPF.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar aluno', error: error.message });
  }
};

/**
 * Busca todos os alunos
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de todos os alunos cadastrados
 */
exports.getAllAlunos = async (req, res) => {
  try {
    console.log('Buscando todos os alunos (nova estrutura)...');
    // Busca todos os usuários do grupo aluno, incluindo info complementar
    const alunos = await Usuario.findAll({
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'aluno' },
          attributes: []
        },
        {
          model: AlunoInfo,
          as: 'alunoInfo',
        }
      ],
      attributes: ['IdUsuario', 'login', 'situacao', 'nome', 'cpf'],
      order: [['IdUsuario', 'ASC']]
    });
    // Formatar resposta
    const alunosFormatados = alunos.map(u => ({
      id: u.IdUsuario,
      email: u.login,
      situacao: u.situacao,
      nome: u.nome || '',
      cpf: u.cpf || '',
      info: u.alunoInfo || {}
    }));
    res.json(alunosFormatados);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar alunos',
      error: error.message 
    });
  }
};

/**
 * Busca um aluno específico
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados do aluno encontrado ou mensagem de erro 404
 */
exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] } // Exclui o campo senha da resposta
    });
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar aluno',
      error: error.message 
    });
  }
};

/**
 * Atualiza os dados de um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.id - ID do aluno
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} [req.body.nome] - Nome do aluno
 * @param {string} [req.body.email] - Email do aluno
 * @param {string} [req.body.telefone] - Telefone do aluno
 * @param {string} [req.body.biografia] - Biografia do aluno
 * @param {string} [req.body.formacao] - Formação do aluno
 * @param {boolean} [req.body.isTrabalhando] - Se está trabalhando
 * @param {boolean} [req.body.isAceitaTermos] - Se aceita termos
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno atualizado ou mensagem de erro
 */
exports.updateAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, biografia, formacao, isTrabalhando, isAceitaTermos } = req.body;

    // Validação de telefone se fornecido
    if (telefone !== undefined && telefone !== null && telefone !== '') {
      // Remove todos os caracteres não numéricos
      const apenasNumeros = telefone.replace(/\D/g, '');
      
      // Valida se tem 10 ou 11 dígitos (telefone brasileiro)
      if (apenasNumeros.length !== 10 && apenasNumeros.length !== 11) {
        return res.status(400).json({ 
          message: 'Telefone deve ter 10 ou 11 dígitos (formato brasileiro)',
          field: 'telefone',
          received: telefone,
          expected: 'Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
        });
      }
      
      // Valida se contém apenas números válidos
      if (!/^\d{10,11}$/.test(apenasNumeros)) {
        return res.status(400).json({ 
          message: 'Telefone deve conter apenas números válidos',
          field: 'telefone',
          received: telefone
        });
      }
      
    }

    // Busca o usuário
    const usuario = await Usuario.findOne({
      where: { IdUsuario: id },
      include: [
        {
          model: GrupoUsuario,
          as: 'grupoUsuario',
          where: { nome: 'aluno' },
          attributes: []
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    // CPF não pode ser alterado pelo próprio aluno - apenas por administradores

    // Verifica se o novo email já existe em outro usuário
    if (email && email !== usuario.login) {
      const emailExistente = await Usuario.findOne({ where: { login: email } });
      if (emailExistente) {
        return res.status(400).json({ message: 'Já existe um usuário com este email.' });
      }
    }

    // Atualiza o usuário (CPF não pode ser alterado pelo próprio aluno)
    await usuario.update({
      nome: nome || usuario.nome,
      login: email || usuario.login
    });

    // Atualiza os dados no AlunoInfo
    const dadosAlunoInfo = {};
    if (email) dadosAlunoInfo.email = email;
    if (telefone !== undefined) dadosAlunoInfo.telefone = telefone;
    if (biografia !== undefined) dadosAlunoInfo.biografia = biografia;
    if (formacao !== undefined) dadosAlunoInfo.formacao = formacao;
    if (isTrabalhando !== undefined) dadosAlunoInfo.is_trabalhando = isTrabalhando;
    if (isAceitaTermos !== undefined) dadosAlunoInfo.is_aceita_termos = isAceitaTermos;

    if (Object.keys(dadosAlunoInfo).length > 0) {
      // Verificar se existe registro na tabela aluno_info
      const alunoInfoExistente = await AlunoInfo.findOne({ where: { IdUsuario: id } });
      
      if (alunoInfoExistente) {
        // Atualizar registro existente
        await AlunoInfo.update(
          dadosAlunoInfo,
          { where: { IdUsuario: id } }
        );
      } else {
        // Criar novo registro se não existir
        const dadosParaCriar = {
          IdUsuario: id,
          email: email || usuario.login, // Usar email fornecido ou login do usuário
          ...dadosAlunoInfo
        };
        await AlunoInfo.create(dadosParaCriar);
      }
    }

    // Busca o usuário atualizado
    const usuarioAtualizado = await Usuario.findOne({
      where: { IdUsuario: id },
      include: [
        {
          model: AlunoInfo,
          as: 'alunoInfo'
        }
      ],
      attributes: ['IdUsuario', 'login', 'situacao', 'nome', 'cpf']
    });

    // Monta resposta
    const resposta = {
      id: usuarioAtualizado.IdUsuario,
      email: usuarioAtualizado.login,
      situacao: usuarioAtualizado.situacao,
      nome: usuarioAtualizado.nome,
      cpf: usuarioAtualizado.cpf,
      info: usuarioAtualizado.alunoInfo,
      // Incluir dados específicos do aluno_info para facilitar o frontend
      telefone: usuarioAtualizado.alunoInfo?.telefone,
      biografia: usuarioAtualizado.alunoInfo?.biografia,
      formacao: usuarioAtualizado.alunoInfo?.formacao,
      isTrabalhando: usuarioAtualizado.alunoInfo?.is_trabalhando,
      isAceitaTermos: usuarioAtualizado.alunoInfo?.is_aceita_termos
    };

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ message: 'Erro ao atualizar aluno', error: error.message });
  }
};

/**
 * Deleta um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.deleteAluno = async (req, res) => {
  try {
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Remove o aluno
    await aluno.destroy();
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Define uma senha para um aluno existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} req.body - Dados da requisição
 * @param {string} req.body.senha - Nova senha do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.definirSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;
    if (!senha) {
      return res.status(400).json({ message: 'A senha é obrigatória' });
    }
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await usuario.update({ senha: senhaCriptografada });
    res.json({ message: 'Senha definida com sucesso' });
  } catch (error) {
    console.error('Erro ao definir senha:', error);
    res.status(500).json({ message: 'Erro ao definir senha', error: error.message });
  }
};

/**
 * Gera uma senha aleatória para um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Senha gerada em texto plano e mensagem de sucesso
 */
exports.gerarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    // Busca o usuário na tabela usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const senhaGerada = Math.random().toString(36).slice(-8);
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
    await usuario.update({ senha: senhaCriptografada });
    res.json({ message: 'Senha gerada com sucesso', senha: senhaGerada });
  } catch (error) {
    console.error('Erro ao gerar senha:', error);
    res.status(500).json({ message: 'Erro ao gerar senha', error: error.message });
  }
};

/**
 * Busca os planos associados ao aluno autenticado
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de planos associados ao aluno
 */
exports.getAlunoPlanos = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.aluno e req.user
    const alunoId = req.user.id;
    
    // Importa os modelos necessários
    const AlunoPlano = require('../models/AlunoPlano');
    const Plano = require('../models/Plano');
    
    console.log(`Buscando planos para o aluno ID ${alunoId}`);
    
    // Busca as associações aluno-plano
    const associacoes = await AlunoPlano.findAll({
      where: { alunoId },
      include: [{
        model: Plano,
        as: 'plano'
      }]
    });
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${alunoId}`);
      return res.json([]);
    }
    
    // Formata o resultado
    const planos = associacoes.map(associacao => ({
      id: associacao.id,
      alunoId: associacao.alunoId,
      planoId: associacao.planoId,
      dataInicio: associacao.dataInicio,
      dataPrevisaoTermino: associacao.dataPrevisaoTermino,
      dataConclusao: associacao.dataConclusao,
      status: associacao.status,
      progresso: associacao.progresso,
      observacoes: associacao.observacoes,
      plano: associacao.plano
    }));
    
    console.log(`${planos.length} planos encontrados para o aluno ID ${alunoId}`);
    res.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos do aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar planos do aluno',
      error: error.message 
    });
  }
};

/**
 * Busca as sprints associadas ao aluno logado através de seu plano
 * Se for administrador, retorna todas as sprints do sistema
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de sprints associadas ao aluno ou todas as sprints (se admin)
 */
exports.getAlunoSprints = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.user com id e role
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`===== INICIANDO BUSCA DE SPRINTS =====`);
    console.log(`ID do usuário autenticado: ${userId}, Role: ${userRole}`);
    console.log(`Dados do token:`, req.user);
    
    // Importa os modelos necessários
    const { AlunoPlano, Plano, Sprint, Meta } = require('../models');
    console.log(`Modelos importados com sucesso`);
    
    // Se for administrador, retorna todas as sprints do sistema
    if (userRole === 'administrador') {
      console.log(`Usuário é administrador - buscando todas as sprints do sistema`);
      
      const todasSprints = await Sprint.findAll({
        include: [
          {
            model: Meta,
            as: 'metas'
          },
          {
            model: Plano,
            as: 'Plano'
          }
        ],
        order: [
          ['PlanoId', 'ASC'],
          ['posicao', 'ASC'],
          ['dataInicio', 'ASC']
        ]
      });
      
      console.log(`${todasSprints?.length || 0} sprints encontradas no sistema para administrador`);
      return res.json(todasSprints || []);
    }
    
    // Busca as associações aluno-plano
    console.log(`Buscando associações do aluno ID ${userId} com planos...`);
    const associacoes = await AlunoPlano.findAll({
      where: { IdUsuario: userId },
      include: [{
        model: Plano
      }]
    });
    
    console.log(`Número de associações encontradas: ${associacoes?.length || 0}`);
    if (associacoes && associacoes.length > 0) {
      console.log(`Primeira associação:`, JSON.stringify(associacoes[0].toJSON(), null, 2));
    }
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${userId}`);
      return res.status(404).json({ 
        message: 'Aluno não possui planos de estudo atribuídos' 
      });
    }
    
    // Pega o primeiro plano (geralmente será apenas um)
    const planoId = associacoes[0].planoId;
    console.log(`Usando plano ID ${planoId} para buscar sprints`);
    
    if (!planoId) {
      console.log(`ERRO: ID do plano não encontrado na associação`);
      return res.status(500).json({ 
        message: 'Erro ao identificar plano do aluno',
        details: 'PlanoId ausente na associação' 
      });
    }
    
    // Busca as sprints associadas ao plano
    console.log(`Buscando sprints do plano ID ${planoId}...`);
    const sprints = await Sprint.findAll({
      where: { PlanoId: planoId },
      include: [{
        model: Meta,
        as: 'metas'
      }],
      order: [
        ['posicao', 'ASC'],
        ['dataInicio', 'ASC']
      ]
    });
    
    console.log(`Número de sprints encontradas: ${sprints?.length || 0}`);
    if (sprints && sprints.length > 0) {
      console.log(`Primeira sprint ID: ${sprints[0].id}, Nome: ${sprints[0].nome}`);
      console.log(`Número de metas na primeira sprint: ${sprints[0].metas?.length || 0}`);
    }
    
    if (!sprints || sprints.length === 0) {
      console.log(`Nenhuma sprint encontrada para o plano ID ${planoId}`);
      return res.status(404).json({ 
        message: 'Não há sprints cadastradas no plano de estudo' 
      });
    }
    
    console.log(`${sprints.length} sprints encontradas para o aluno ID ${userId}`);
    console.log(`===== FINALIZANDO BUSCA DE SPRINTS =====`);
    res.json(sprints);
  } catch (error) {
    console.error('===== ERRO AO BUSCAR SPRINTS =====');
    console.error('Erro ao buscar sprints:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erro ao buscar sprints',
      error: error.message 
    });
  }
};

module.exports = {
  createAluno: exports.createAluno,
  getAllAlunos: exports.getAllAlunos,
  getAlunoById: exports.getAlunoById,
  updateAluno: exports.updateAluno,
  deleteAluno: exports.deleteAluno,
  definirSenha: exports.definirSenha,
  gerarSenha: exports.gerarSenha,
  getAlunoPlanos: exports.getAlunoPlanos,
  getAlunoSprints: exports.getAlunoSprints
}; 