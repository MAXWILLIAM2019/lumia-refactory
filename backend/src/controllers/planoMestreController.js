const { PlanoMestre, SprintMestre, MetaMestre, Plano, Sprint, Meta, AlunoPlano } = require('../models');

/**
 * Controller para gerenciamento de Planos Mestre
 * Responsável pelas operações CRUD dos templates de planos
 */

/**
 * Lista todos os planos mestre ativos
 */
exports.listarPlanosMestre = async (req, res) => {
  try {
    console.log('Buscando planos mestre...');
    
    const planosMestre = await PlanoMestre.findAll({
      where: { ativo: true },
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }],
      order: [['nome', 'ASC']]
    });
    
    console.log(`${planosMestre.length} planos mestre encontrados`);
    res.json(planosMestre);
  } catch (error) {
    console.error('Erro ao listar planos mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao listar planos mestre',
      error: error.message 
    });
  }
};

/**
 * Busca um plano mestre específico por ID
 */
exports.buscarPlanoMestrePorId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Buscando plano mestre ID: ${id}`);
    
    const planoMestre = await PlanoMestre.findByPk(id, {
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }]
    });
    
    if (!planoMestre) {
      return res.status(404).json({ message: 'Plano mestre não encontrado' });
    }
    
    console.log(`Plano mestre encontrado: ${planoMestre.nome}`);
    res.json(planoMestre);
  } catch (error) {
    console.error('Erro ao buscar plano mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar plano mestre',
      error: error.message 
    });
  }
};

/**
 * Cria um novo plano mestre
 */
exports.criarPlanoMestre = async (req, res) => {
  try {
    const { nome, cargo, descricao, duracao, versao } = req.body;
    
    console.log('Criando novo plano mestre:', nome);
    
    const novoPlanoMestre = await PlanoMestre.create({
      nome,
      cargo,
      descricao,
      duracao,
      versao: versao || '1.0',
      ativo: true
    });
    
    console.log(`Plano mestre criado com ID: ${novoPlanoMestre.id}`);
    res.status(201).json(novoPlanoMestre);
  } catch (error) {
    console.error('Erro ao criar plano mestre:', error);
    res.status(500).json({ 
      message: 'Erro ao criar plano mestre',
      error: error.message 
    });
  }
};

/**
 * Cria uma instância personalizada de um plano mestre para um aluno
 */
exports.criarInstancia = async (req, res) => {
  try {
    const { planoMestreId, idUsuario, dataInicio, status, observacoes } = req.body;

    console.log('Criando instância do plano mestre:', { planoMestreId, idUsuario });

    // Validar dados obrigatórios
    if (!planoMestreId || !idUsuario) {
      return res.status(400).json({
        message: 'planoMestreId e idUsuario são obrigatórios'
      });
    }

    // Buscar o plano mestre com suas sprints e metas
    const planoMestre = await PlanoMestre.findByPk(planoMestreId, {
      include: [{
        model: SprintMestre,
        as: 'sprintsMestre',
        include: [{
          model: MetaMestre,
          as: 'metasMestre'
        }],
        order: [['posicao', 'ASC']]
      }]
    });

    if (!planoMestre) {
      return res.status(404).json({
        message: 'Plano mestre não encontrado'
      });
    }

    console.log(`Plano mestre encontrado: ${planoMestre.nome}`);

    // Criar uma transação para garantir consistência
    const sequelize = require('../db');
    const transaction = await sequelize.transaction();

    try {
      // 1. Criar o plano personalizado baseado no mestre
      const novoPlano = await Plano.create({
        nome: planoMestre.nome,
        cargo: planoMestre.cargo,
        descricao: planoMestre.descricao || `Plano personalizado baseado em: ${planoMestre.nome}`,
        duracao: planoMestre.duracao,
        plano_mestre_id: planoMestreId
      }, { transaction });

      console.log(`Plano criado com ID: ${novoPlano.id}`);

      // 2. Criar as sprints baseadas nas sprints mestre
      let dataInicioAtual = new Date(dataInicio || new Date());
      
      for (const sprintMestre of planoMestre.sprintsMestre) {
        console.log(`Criando sprint: ${sprintMestre.nome}`);
        
        // Calcular data de fim baseada na duração em dias
        const dataFimAtual = new Date(dataInicioAtual);
        // Calcular duração baseada nas datas da sprint mestre ou usar 7 dias como padrão
        const duracaoDias = sprintMestre.dataInicio && sprintMestre.dataFim 
          ? Math.ceil((new Date(sprintMestre.dataFim) - new Date(sprintMestre.dataInicio)) / (1000 * 60 * 60 * 24))
          : 7;
        dataFimAtual.setDate(dataFimAtual.getDate() + duracaoDias);
        
        const novaSprint = await Sprint.create({
          nome: sprintMestre.nome,
          dataInicio: dataInicioAtual,
          dataFim: dataFimAtual,
          posicao: sprintMestre.posicao || 0,
          PlanoId: novoPlano.id,
          sprint_mestre_id: sprintMestre.id
        }, { transaction });
        
        // Próxima sprint começa no dia seguinte ao fim da atual
        dataInicioAtual = new Date(dataFimAtual);
        dataInicioAtual.setDate(dataInicioAtual.getDate() + 1);

        // 3. Criar as metas baseadas nas metas mestre
        for (const metaMestre of sprintMestre.metasMestre) {
          console.log(`Criando meta: ${metaMestre.titulo}`);
          
          // Validar o tipo da meta - converter para os valores aceitos pelo ENUM
          let tipoMeta = metaMestre.tipo;
          const tiposValidos = ['teoria', 'questoes', 'revisao', 'reforco'];
          if (!tiposValidos.includes(tipoMeta)) {
            tipoMeta = 'teoria'; // Valor padrão se o tipo não for válido
          }
          
          await Meta.create({
            disciplina: metaMestre.disciplina,
            tipo: tipoMeta,
            titulo: metaMestre.titulo,
            comandos: metaMestre.comandos,
            link: metaMestre.link,
            relevancia: metaMestre.relevancia,
            SprintId: novaSprint.id,
            meta_mestre_id: metaMestre.id
          }, { transaction });
        }
      }

      // 4. Associar o plano ao aluno
      await AlunoPlano.create({
        IdUsuario: idUsuario,
        PlanoId: novoPlano.id,
        dataInicio: dataInicio || new Date(),
        status: status || 'não iniciado',
        observacoes: observacoes || ''
      }, { transaction });

      // Confirmar a transação
      await transaction.commit();

      console.log('Instância criada com sucesso');
      
      res.status(201).json({
        message: 'Plano personalizado criado com sucesso',
        plano: {
          id: novoPlano.id,
          nome: novoPlano.nome,
          cargo: novoPlano.cargo,
          template_origem_id: planoMestreId
        }
      });

    } catch (error) {
      // Reverter a transação em caso de erro
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar instância do plano mestre:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  listarPlanosMestre: exports.listarPlanosMestre,
  buscarPlanoMestrePorId: exports.buscarPlanoMestrePorId,
  criarPlanoMestre: exports.criarPlanoMestre,
  criarInstancia: exports.criarInstancia
}; 