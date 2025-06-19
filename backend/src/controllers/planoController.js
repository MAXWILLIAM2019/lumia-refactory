// Importar modelos mestre ao invés dos modelos de instância
const { PlanoMestre, SprintMestre, MetaMestre, Plano, Disciplina, Assunto, Sprint, Meta } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

// Listar todos os planos mestre
const listarPlanos = async (req, res) => {
  try {
    console.log('1. Iniciando listagem de planos mestre (transparente)');
    
    // Verifica se os modelos estão disponíveis
    console.log('2. Verificando modelos disponíveis:', 
      'PlanoMestre:', !!PlanoMestre, 
      'Disciplina:', !!Disciplina, 
      'Assunto:', !!Assunto
    );
    
    // Tenta primeiro verificar se a tabela existe/está acessível
    try {
      console.log('3. Verificando acesso à tabela PlanosMestre');
      const testQuery = await PlanoMestre.findOne();
      console.log('4. Teste de acesso à tabela bem-sucedido:', !!testQuery);
    } catch (tableError) {
      console.error('5. Erro ao acessar tabela PlanosMestre:', tableError);
      return res.status(500).json({ 
        error: 'Erro ao acessar tabela de planos', 
        details: tableError.message 
      });
    }
    
    // Tenta fazer a consulta principal
    console.log('6. Executando consulta principal');
    const planosMestre = await PlanoMestre.findAll({
      where: { ativo: true }, // Só buscar planos mestre ativos
      order: [['nome', 'ASC']] // Ordenar por nome
    });
    
    console.log('7. Consulta concluída, número de planos mestres encontrados:', planosMestre?.length || 0);
    
    // Se não houver planos, retorna um array vazio em vez de null/undefined
    if (!planosMestre || planosMestre.length === 0) {
      console.log('8. Nenhum plano mestre encontrado, retornando array vazio');
      return res.json([]);
    }
    
    // Transformar PlanoMestre para o formato esperado pelo frontend
    // O frontend espera o mesmo formato que os planos normais
    const planosFormatados = planosMestre.map(planoMestre => ({
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio, pode ser implementado depois se necessário
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    }));
    
    console.log('9. Planos mestres encontrados e formatados, retornando dados');
    res.json(planosFormatados);
  } catch (error) {
    console.error('10. Erro ao listar planos mestres:', error);
    console.error('11. Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao listar planos', details: error.message });
  }
};

// Buscar um plano mestre específico
const buscarPlanoPorId = async (req, res) => {
  try {
    const planoMestre = await PlanoMestre.findByPk(req.params.id);

    if (!planoMestre) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio, pode ser implementado depois se necessário
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    res.json(planoFormatado);
  } catch (error) {
    console.error('Erro ao buscar plano mestre:', error);
    res.status(500).json({ error: 'Erro ao buscar plano', details: error.message });
  }
};

// Criar um novo plano mestre
const criarPlano = async (req, res) => {
  try {
    console.log('1. Recebendo dados do plano mestre:', req.body);
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !cargo || !descricao || !duracao) {
      console.log('2. Campos obrigatórios faltando:', { nome, cargo, descricao, duracao });
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Por enquanto, vamos ignorar as disciplinas para manter a simplicidade
    // Pode ser implementado depois se necessário
    if (disciplinas && Array.isArray(disciplinas) && disciplinas.length > 0) {
      console.log('3. Disciplinas fornecidas serão ignoradas por enquanto na migração inicial');
    }

    console.log('4. Criando plano mestre...');
    // Cria o plano mestre
    const planoMestre = await PlanoMestre.create({
      nome,
      cargo,
      descricao,
      duracao,
      versao: '1.0',
      ativo: true
    });

    console.log('5. Plano mestre criado:', planoMestre.toJSON());

    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    console.log('6. Plano mestre criado com sucesso e formatado para o frontend');
    res.status(201).json(planoFormatado);
  } catch (error) {
    console.error('7. Erro ao criar plano mestre:', error);
    res.status(500).json({ error: 'Erro ao criar plano', details: error.message });
  }
};

// Atualizar um plano mestre
const atualizarPlano = async (req, res) => {
  try {
    console.log('1. Iniciando atualização do plano mestre');
    console.log('2. ID recebido:', req.params.id);
    console.log('3. Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    console.log('4. Buscando plano mestre no banco...');
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      console.log('5. Plano mestre não encontrado');
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    console.log('6. Plano mestre encontrado:', planoMestre.toJSON());

    console.log('7. Atualizando dados do plano mestre...');
    // Atualiza o plano mestre
    await planoMestre.update({
      nome,
      cargo,
      descricao,
      duracao
    });
    console.log('8. Dados do plano mestre atualizados');

    // Por enquanto, ignorar disciplinas na migração inicial
    if (disciplinas && Array.isArray(disciplinas)) {
      console.log('9. Disciplinas fornecidas serão ignoradas por enquanto na migração inicial');
    }

    console.log('9. Formatando plano mestre atualizado...');
    // Transformar PlanoMestre para o formato esperado pelo frontend
    const planoFormatado = {
      id: planoMestre.id,
      nome: planoMestre.nome,
      cargo: planoMestre.cargo,
      descricao: planoMestre.descricao,
      duracao: planoMestre.duracao,
      disciplinas: [], // Por enquanto vazio
      createdAt: planoMestre.createdAt,
      updatedAt: planoMestre.updatedAt
    };

    console.log('10. Plano mestre atualizado e formatado para o frontend');
    res.json(planoFormatado);
  } catch (error) {
    console.error('11. Erro ao atualizar plano mestre:', error);
    console.error('12. Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar plano', details: error.message });
  }
};

// Excluir um plano mestre
const excluirPlano = async (req, res) => {
  try {
    const { id } = req.params;

    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Marcar como inativo ao invés de excluir fisicamente (soft delete)
    // Isso preserva a integridade referencial com instâncias já criadas
    await planoMestre.update({ ativo: false });

    res.json({ message: 'Plano excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir plano mestre:', error);
    res.status(500).json({ error: 'Erro ao excluir plano', details: error.message });
  }
};

// Rota de teste
const testarRota = (req, res) => {
  res.json({ message: 'Rota de planos funcionando!' });
};

// Buscar disciplinas de um plano mestre específico
const buscarDisciplinasPorPlano = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Buscando disciplinas do plano mestre ${id}`);

    // Verifica se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Por enquanto, retornar array vazio na migração inicial
    // Pode ser implementado depois se necessário
    console.log(`Retornando disciplinas vazias para o plano mestre ${id} (migração inicial)`);
    res.json([]);
  } catch (error) {
    console.error('Erro ao buscar disciplinas do plano mestre:', error);
    res.status(500).json({ error: 'Erro ao buscar disciplinas do plano', details: error.message });
  }
};

// Buscar sprints de um plano mestre específico
const buscarSprintsPorPlano = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Buscando sprints do plano mestre ID ${id}`);
    
    // Verificar se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(id);
    if (!planoMestre) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    
    // Buscar sprints mestre do plano mestre com suas metas mestre
    const sprintsMestre = await SprintMestre.findAll({
      where: { PlanoMestreId: id },
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre',
          order: [['id', 'ASC']]
        }
      ],
      order: [
        ['posicao', 'ASC'],
        ['nome', 'ASC']
      ]
    });
    
    // Transformar SprintMestre para o formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestre.map(sprintMestre => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: id, // Manter compatibilidade com frontend
      posicao: sprintMestre.posicao,
                  dataInicio: sprintMestre.dataInicio,
            dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id,
        posicao: metaMestre.posicao
      })),
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    console.log(`${sprintsFormatadas.length} sprints mestre encontradas para o plano mestre ID ${id}`);
    
    res.json(sprintsFormatadas);
  } catch (error) {
    console.error('Erro ao buscar sprints do plano mestre:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar sprints do plano', 
      details: error.message 
    });
  }
};

module.exports = {
  listarPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  excluirPlano,
  testarRota,
  buscarDisciplinasPorPlano,
  buscarSprintsPorPlano
}; 