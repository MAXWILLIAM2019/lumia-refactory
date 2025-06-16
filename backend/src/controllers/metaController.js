const { MetaMestre, Meta } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

/**
 * Controller de MetaMestre e Meta
 * ATENÇÃO: Este controller gerencia tanto templates (mestre) quanto instâncias.
 * Algumas funções são específicas para módulos do sistema e NÃO devem ser alteradas
 * sem consulta prévia ao time de desenvolvimento.
 */

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Cria uma nova meta mestre
 * Esta função é específica para o template de plano e é usada apenas na interface do administrador
 * 
 * Gerenciamento de Posições:
 * - Ao criar uma única meta, busca a última posição na sprint e incrementa
 * - Diferente da criação em lote (createSprint), aqui é seguro consultar o banco
 *   pois estamos criando apenas uma meta por vez
 * - Se não houver metas na sprint, começa com posição 1
 * 
 * Exemplo:
 * Estado Inicial:
 * - Meta A (pos: 1)
 * - Meta B (pos: 2)
 * 
 * Nova Meta:
 * - Consulta última posição (2)
 * - Nova meta recebe posição 3
 */
exports.createMeta = async (req, res) => {
  try {
    const { disciplina, tipo, titulo, comandos, link, relevancia, sprintId } = req.body;

    // Verificar se o sprintId foi fornecido
    if (!sprintId) {
      return res.status(400).json({ message: 'É necessário associar a meta a uma sprint' });
    }

    // Determinar a próxima posição disponível para esta sprint
    const ultimaMetaMestre = await MetaMestre.findOne({
      where: { SprintMestreId: sprintId },
      order: [['posicao', 'DESC']]
    });
    
    const proximaPosicao = ultimaMetaMestre ? ultimaMetaMestre.posicao + 1 : 1;

    // Criar a meta mestre
    const metaMestre = await MetaMestre.create({
      disciplina,
      tipo,
      titulo,
      comandos,
      link,
      relevancia,
      SprintMestreId: sprintId,
      posicao: proximaPosicao
    });

    res.status(201).json(metaMestre);
  } catch (error) {
    console.error('Erro ao criar meta mestre:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Reordena as metas mestre de uma sprint mestre
 * Esta função é específica para templates e é usada apenas na interface do administrador
 * 
 * Gerenciamento de Posições:
 * - Recebe um array com a nova ordem dos IDs das metas
 * - Atualiza as posições em uma única transação para garantir consistência
 * - Posições são atribuídas sequencialmente (1, 2, 3, etc.) baseado na ordem do array
 * 
 * Validações:
 * - Verifica se todas as metas pertencem à sprint informada
 * - Garante que todas as metas da sprint estão presentes no array
 * 
 * Exemplo:
 * Estado Inicial:
 * - Meta A (id: 1, pos: 1)
 * - Meta B (id: 2, pos: 2)
 * - Meta C (id: 3, pos: 3)
 * 
 * Requisição:
 * ordemMetas = [2, 3, 1]
 * 
 * Resultado:
 * - Meta B (id: 2, pos: 1)
 * - Meta C (id: 3, pos: 2)
 * - Meta A (id: 1, pos: 3)
 */
exports.reordenarMetasMestre = async (req, res) => {
  const { sprintId, ordemMetas } = req.body;
  
  if (!sprintId || !ordemMetas || !Array.isArray(ordemMetas) || ordemMetas.length === 0) {
    return res.status(400).json({ message: 'Dados inválidos. sprintId e ordemMetas (array) são necessários' });
  }
  
  try {
    // Verificar se todas as metas mestre pertencem à sprint mestre
    const metasMestre = await MetaMestre.findAll({
      where: { SprintMestreId: sprintId }
    });
    
    const metaMestreIds = metasMestre.map(m => m.id);
    
    for (const id of ordemMetas) {
      if (!metaMestreIds.includes(id)) {
        return res.status(400).json({ 
          message: `Meta com ID ${id} não pertence à sprint ${sprintId}` 
        });
      }
    }
    
    // Verificar se todos os IDs de metas mestre da sprint estão na ordemMetas
    if (new Set([...metaMestreIds]).size !== new Set([...ordemMetas]).size) {
      return res.status(400).json({ 
        message: 'A lista de metas fornecida não contém todas as metas da sprint'
      });
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < ordemMetas.length; i++) {
        await MetaMestre.update(
          { posicao: i + 1 },
          { 
            where: { id: ordemMetas[i] },
            transaction: t
          }
        );
      }
    });
    
    // Retornar as metas mestres reordenadas
    const metasMestreAtualizadas = await MetaMestre.findAll({
      where: { SprintMestreId: sprintId },
      order: [['posicao', 'ASC']]
    });
    
    res.json(metasMestreAtualizadas);
  } catch (error) {
    console.error('Erro ao reordenar metas mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de alunos (Planos de Estudo)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Cria uma nova meta (instância)
 * Esta função é específica para instâncias de plano e é usada apenas na interface do aluno/mentor
 */
exports.createMetaInstancia = async (req, res) => {
  try {
    const { disciplina, tipo, titulo, comandos, link, relevancia, sprintId } = req.body;

    // Verificar se o sprintId foi fornecido
    if (!sprintId) {
      return res.status(400).json({ message: 'É necessário associar a meta a uma sprint' });
    }

    // Determinar a próxima posição disponível para esta sprint
    const ultimaMeta = await Meta.findOne({
      where: { SprintId: sprintId },
      order: [['posicao', 'DESC']]
    });
    
    const proximaPosicao = ultimaMeta ? ultimaMeta.posicao + 1 : 1;

    // Criar a meta
    const meta = await Meta.create({
      disciplina,
      tipo,
      titulo,
      comandos,
      link,
      relevancia,
      SprintId: sprintId,
      posicao: proximaPosicao
    });

    res.status(201).json(meta);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * ATENÇÃO: Função utilizada no módulo de alunos (Planos de Estudo)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Reordena as metas de uma sprint
 * Esta função é específica para instâncias e é usada apenas na interface do aluno/mentor
 */
exports.reordenarMetas = async (req, res) => {
  const { sprintId, ordemMetas } = req.body;
  
  if (!sprintId || !ordemMetas || !Array.isArray(ordemMetas) || ordemMetas.length === 0) {
    return res.status(400).json({ message: 'Dados inválidos. sprintId e ordemMetas (array) são necessários' });
  }
  
  try {
    // Verificar se todas as metas pertencem à sprint
    const metas = await Meta.findAll({
      where: { SprintId: sprintId }
    });
    
    const metaIds = metas.map(m => m.id);
    
    for (const id of ordemMetas) {
      if (!metaIds.includes(id)) {
        return res.status(400).json({ 
          message: `Meta com ID ${id} não pertence à sprint ${sprintId}` 
        });
      }
    }
    
    // Verificar se todos os IDs de metas da sprint estão na ordemMetas
    if (new Set([...metaIds]).size !== new Set([...ordemMetas]).size) {
      return res.status(400).json({ 
        message: 'A lista de metas fornecida não contém todas as metas da sprint'
      });
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < ordemMetas.length; i++) {
        await Meta.update(
          { posicao: i + 1 },
          { 
            where: { id: ordemMetas[i] },
            transaction: t
          }
        );
      }
    });
    
    // Retornar as metas reordenadas
    const metasAtualizadas = await Meta.findAll({
      where: { SprintId: sprintId },
      order: [['posicao', 'ASC']]
    });
    
    res.json(metasAtualizadas);
  } catch (error) {
    console.error('Erro ao reordenar metas:', error);
    res.status(500).json({ message: error.message });
  }
}; 