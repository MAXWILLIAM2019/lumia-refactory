/**
 * Controller de Disciplina
 * 
 * Este módulo gerencia todas as operações relacionadas às disciplinas,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa também o sistema de versionamento de disciplinas.
 */
const Disciplina = require('../models/Disciplina');
const Assunto = require('../models/Assunto');
const { Op } = require('sequelize');
const sequelize = require('../db');
const Plano = require('../models/Plano');

/**
 * Lista todas as disciplinas cadastradas
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de disciplinas com seus assuntos
 */
exports.listarDisciplinas = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      order: [
        ['nome', 'ASC'],
        [{ model: Assunto, as: 'assuntos' }, 'nome', 'ASC']
      ]
    });
    
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar disciplinas',
      error: error.message 
    });
  }
};

/**
 * Lista apenas as disciplinas ativas
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de disciplinas ativas com seus assuntos
 */
exports.listarDisciplinasAtivas = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      where: {
        ativa: true
      },
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      order: [
        ['nome', 'ASC'],
        [{ model: Assunto, as: 'assuntos' }, 'nome', 'ASC']
      ]
    });
    
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error('Erro ao listar disciplinas ativas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar disciplinas ativas',
      error: error.message 
    });
  }
};

/**
 * Busca uma disciplina pelo ID
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados da disciplina encontrada ou erro
 */
exports.buscarDisciplina = async (req, res) => {
  try {
    const disciplina = await Disciplina.findByPk(req.params.id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    res.status(200).json(disciplina);
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar disciplina',
      error: error.message 
    });
  }
};

/**
 * Cria uma nova disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {string} req.body.nome - Nome da disciplina
 * @param {boolean} req.body.ativa - Indica se a disciplina está ativa (opcional, default: true)
 * @param {Array} req.body.assuntos - Lista de assuntos da disciplina (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Disciplina criada ou erro
 */
exports.criarDisciplina = async (req, res) => {
  try {
    const { nome, assuntos, ativa = true } = req.body;
    
    // Verifica se já existe uma disciplina com o mesmo nome
    // Usando LOWER para fazer comparação case-insensitive no SQLite
    const disciplinaExistente = await Disciplina.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nome')), 
        sequelize.fn('LOWER', nome)
      )
    });
    
    if (disciplinaExistente) {
      return res.status(400).json({ 
        message: 'Já existe uma disciplina com este nome' 
      });
    }
    
    // Cria a disciplina
    const disciplina = await Disciplina.create({ 
      nome,
      ativa: ativa === false ? false : true // Garante que seja um booleano
    });
    
    // Se houver assuntos, adiciona-os
    if (assuntos && Array.isArray(assuntos) && assuntos.length > 0) {
      const assuntosData = assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: disciplina.id
      }));
      
      await Assunto.bulkCreate(assuntosData);
    }
    
    // Retorna a disciplina criada com seus assuntos
    const disciplinaCompleta = await Disciplina.findByPk(disciplina.id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    res.status(201).json(disciplinaCompleta);
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao criar disciplina',
      error: error.message 
    });
  }
};

/**
 * Atualiza uma disciplina existente
 * 
 * Esta função verifica se a disciplina está sendo usada em algum plano.
 * - Se não estiver em uso, atualiza diretamente
 * - Se estiver em uso, cria uma nova versão
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} req.body - Corpo da requisição
 * @param {string} req.body.nome - Nome da disciplina (opcional)
 * @param {boolean} req.body.ativa - Status da disciplina (opcional)
 * @param {Array} req.body.assuntos - Lista de assuntos da disciplina (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.atualizarDisciplina = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { nome, assuntos, ativa, descricao } = req.body;
    
    // Verifica se a disciplina existe
    const disciplina = await Disciplina.findByPk(id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        },
        {
          model: Plano,
          as: 'planos'
        }
      ],
      transaction
    });
    
    if (!disciplina) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    // Verifica se esta disciplina está sendo usada por algum plano
    const disciplinaEmUso = disciplina.planos && disciplina.planos.length > 0;
    
    console.log(`Disciplina em uso: ${disciplinaEmUso ? 'Sim' : 'Não'}`);
    
    // Se não estiver em uso, podemos atualizar diretamente
    if (!disciplinaEmUso) {
      console.log('Atualizando disciplina diretamente (não está em uso)');
      
      // Prepara os dados para atualização
      const dadosAtualizacao = {};
      
      // Se o nome for alterado, verifica se já existe outra disciplina com o mesmo nome
      if (nome && nome !== disciplina.nome) {
        const disciplinaExistente = await Disciplina.findOne({
          where: sequelize.and(
            { id: { [Op.ne]: id } },
            sequelize.where(
              sequelize.fn('LOWER', sequelize.col('nome')),
              sequelize.fn('LOWER', nome)
            )
          ),
          transaction
        });
        
        if (disciplinaExistente) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: 'Já existe outra disciplina com este nome' 
          });
        }
        
        // Adiciona o nome aos dados de atualização
        dadosAtualizacao.nome = nome;
      }
      
      // Adiciona outros campos aos dados de atualização se fornecidos
      if (ativa !== undefined) {
        dadosAtualizacao.ativa = ativa === false ? false : true;
      }
      
      if (descricao !== undefined) {
        dadosAtualizacao.descricao = descricao;
      }
      
      // Atualiza a disciplina com todos os campos necessários
      if (Object.keys(dadosAtualizacao).length > 0) {
        await disciplina.update(dadosAtualizacao, { transaction });
      }
      
      // Se houver assuntos, atualiza-os
      if (assuntos && Array.isArray(assuntos)) {
        // Remove todos os assuntos existentes
        await Assunto.destroy({ 
          where: { disciplinaId: id },
          transaction
        });
        
        // Adiciona os novos assuntos
        if (assuntos.length > 0) {
          const assuntosData = assuntos.map(assunto => ({
            nome: assunto.nome,
            disciplinaId: id
          }));
          
          await Assunto.bulkCreate(assuntosData, { transaction });
        }
      }
      
      await transaction.commit();
      
      // Retorna a disciplina atualizada com seus assuntos
      const disciplinaAtualizada = await Disciplina.findByPk(id, {
        include: [
          {
            model: Assunto,
            as: 'assuntos'
          }
        ]
      });
      
      return res.status(200).json({
        disciplina: disciplinaAtualizada,
        message: 'Disciplina atualizada com sucesso',
        versionada: false
      });
    } 
    // Se estiver em uso, criamos uma nova versão
    else {
      console.log('Criando nova versão da disciplina (em uso por planos)');
      
      // Determinar a ID de origem (para casos onde já é uma versão)
      const idOrigem = disciplina.disciplina_origem_id || disciplina.id;
      
      // Buscar última versão para incrementar
      const ultimaVersao = await Disciplina.findOne({
        where: sequelize.or(
          { id: idOrigem },
          { disciplina_origem_id: idOrigem }
        ),
        order: [['versao', 'DESC']],
        transaction
      });
      
      const novaVersao = ultimaVersao ? ultimaVersao.versao + 1 : 1;
      console.log(`Criando versão ${novaVersao}`);
      
      // Cria a nova versão da disciplina com o nome formatado
      const nomeBase = nome || disciplina.nome;
      const nomeFormatado = `${nomeBase} (editada) v${novaVersao}`;
      
      const novaDisciplina = await Disciplina.create({
        nome: nomeFormatado,
        descricao: descricao || disciplina.descricao,
        versao: novaVersao,
        ativa: ativa === false ? false : true,
        disciplina_origem_id: idOrigem
      }, { transaction });
      
      // Copiar os assuntos
      if (assuntos && Array.isArray(assuntos) && assuntos.length > 0) {
        const assuntosData = assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: novaDisciplina.id
        }));
        
        await Assunto.bulkCreate(assuntosData, { transaction });
      } else if (disciplina.assuntos && disciplina.assuntos.length > 0) {
        // Se não foram fornecidos novos assuntos, copia os antigos
        const assuntosData = disciplina.assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: novaDisciplina.id
        }));
        
        await Assunto.bulkCreate(assuntosData, { transaction });
      }
      
      await transaction.commit();
      
      // Retorna a nova versão da disciplina com seus assuntos
      const disciplinaAtualizada = await Disciplina.findByPk(novaDisciplina.id, {
        include: [
          {
            model: Assunto,
            as: 'assuntos'
          }
        ]
      });
      
      return res.status(200).json({
        disciplina: disciplinaAtualizada,
        message: 'Nova versão da disciplina criada automaticamente pois está em uso por planos',
        versionada: true,
        versao: novaVersao
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar disciplina',
      error: error.message 
    });
  }
};

/**
 * Remove uma disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.removerDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se a disciplina existe
    const disciplina = await Disciplina.findByPk(id);
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    // Remove a disciplina (os assuntos serão removidos em cascata)
    await disciplina.destroy();
    
    res.status(200).json({ message: 'Disciplina removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao remover disciplina',
      error: error.message 
    });
  }
};

/**
 * Cria uma nova versão de uma disciplina existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina original
 * @param {Object} req.body - Corpo da requisição
 * @param {string} req.body.nome - Nome da nova versão da disciplina
 * @param {string} req.body.descricao - Descrição da nova versão (opcional)
 * @param {boolean} req.body.ativa - Status da disciplina (opcional)
 * @param {Array} req.body.assuntos - Lista de assuntos da disciplina
 * @param {boolean} req.body.copiarAssuntos - Se deve copiar os assuntos da versão anterior
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Nova versão da disciplina ou erro
 */
exports.criarVersaoDisciplina = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { nome, descricao, assuntos, ativa = true, copiarAssuntos = false } = req.body;
    
    // Verifica se a disciplina original existe
    const disciplinaOriginal = await Disciplina.findByPk(id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      transaction
    });
    
    if (!disciplinaOriginal) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Disciplina original não encontrada' });
    }
    
    // Determina se é a disciplina raiz ou uma versão
    const idOrigem = disciplinaOriginal.disciplina_origem_id || disciplinaOriginal.id;
    
    // Busca a última versão para incrementar
    const ultimaVersao = await Disciplina.findOne({
      where: sequelize.or(
        { id: idOrigem },
        { disciplina_origem_id: idOrigem }
      ),
      order: [['versao', 'DESC']],
      transaction
    });
    
    const novaVersao = ultimaVersao ? ultimaVersao.versao + 1 : 1;
    
    // Cria a nova versão da disciplina com o nome formatado
    const nomeBase = nome || disciplinaOriginal.nome;
    const nomeFormatado = `${nomeBase} (editada) v${novaVersao}`;
    
    const novaDisciplina = await Disciplina.create({
      nome: nomeFormatado,
      descricao: descricao || disciplinaOriginal.descricao,
      versao: novaVersao,
      ativa: ativa === false ? false : true,
      disciplina_origem_id: idOrigem
    }, { transaction });
    
    // Trata os assuntos
    if (copiarAssuntos && disciplinaOriginal.assuntos && disciplinaOriginal.assuntos.length > 0) {
      // Copia os assuntos da versão original
      const assuntosData = disciplinaOriginal.assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: novaDisciplina.id
      }));
      
      await Assunto.bulkCreate(assuntosData, { transaction });
    } else if (assuntos && Array.isArray(assuntos) && assuntos.length > 0) {
      // Usa os novos assuntos fornecidos
      const assuntosData = assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: novaDisciplina.id
      }));
      
      await Assunto.bulkCreate(assuntosData, { transaction });
    }
    
    await transaction.commit();
    
    // Retorna a nova versão da disciplina
    const novaVersaoCompleta = await Disciplina.findByPk(novaDisciplina.id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    res.status(201).json(novaVersaoCompleta);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar nova versão da disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao criar nova versão da disciplina',
      error: error.message 
    });
  }
};

/**
 * Lista todas as versões de uma disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de versões da disciplina
 */
exports.listarVersoesDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca a disciplina
    const disciplina = await Disciplina.findByPk(id);
    
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    // Determina a disciplina raiz
    const idOrigem = disciplina.disciplina_origem_id || disciplina.id;
    
    // Busca todas as versões, incluindo a original
    const versoes = await Disciplina.findAll({
      where: sequelize.or(
        { id: idOrigem },
        { disciplina_origem_id: idOrigem }
      ),
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      order: [['versao', 'ASC']]
    });
    
    res.status(200).json(versoes);
  } catch (error) {
    console.error('Erro ao listar versões da disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao listar versões da disciplina',
      error: error.message 
    });
  }
};

/**
 * Retorna a diferença entre duas versões de uma disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id1 - ID da primeira versão
 * @param {Number} req.params.id2 - ID da segunda versão
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Diferenças entre as versões
 */
exports.compararVersoesDisciplina = async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    
    // Busca as duas versões
    const disciplina1 = await Disciplina.findByPk(id1, {
      include: [{ model: Assunto, as: 'assuntos' }]
    });
    
    const disciplina2 = await Disciplina.findByPk(id2, {
      include: [{ model: Assunto, as: 'assuntos' }]
    });
    
    if (!disciplina1 || !disciplina2) {
      return res.status(404).json({ message: 'Uma ou ambas as disciplinas não foram encontradas' });
    }
    
    // Verifica se são versões da mesma disciplina
    const origem1 = disciplina1.disciplina_origem_id || disciplina1.id;
    const origem2 = disciplina2.disciplina_origem_id || disciplina2.id;
    
    if (origem1 !== origem2) {
      return res.status(400).json({ message: 'As disciplinas não são versões da mesma disciplina original' });
    }
    
    // Cria objeto de diferenças
    const diferencas = {
      metadados: {
        disciplina1: {
          id: disciplina1.id,
          versao: disciplina1.versao
        },
        disciplina2: {
          id: disciplina2.id,
          versao: disciplina2.versao
        }
      },
      campos: {},
      assuntos: {
        adicionados: [],
        removidos: [],
        mantidos: []
      }
    };
    
    // Compara campos básicos
    ['nome', 'descricao', 'ativa'].forEach(campo => {
      if (disciplina1[campo] !== disciplina2[campo]) {
        diferencas.campos[campo] = {
          antes: disciplina1[campo],
          depois: disciplina2[campo]
        };
      }
    });
    
    // Compara assuntos
    const assuntos1 = disciplina1.assuntos.map(a => a.nome);
    const assuntos2 = disciplina2.assuntos.map(a => a.nome);
    
    diferencas.assuntos.adicionados = assuntos2.filter(a => !assuntos1.includes(a));
    diferencas.assuntos.removidos = assuntos1.filter(a => !assuntos2.includes(a));
    diferencas.assuntos.mantidos = assuntos1.filter(a => assuntos2.includes(a));
    
    res.status(200).json(diferencas);
  } catch (error) {
    console.error('Erro ao comparar versões da disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao comparar versões da disciplina',
      error: error.message 
    });
  }
}; 