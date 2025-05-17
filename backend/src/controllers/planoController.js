const { Plano, Disciplina, Assunto } = require('../models');

// Listar todos os planos
const listarPlanos = async (req, res) => {
  try {
    console.log('1. Iniciando listagem de planos');
    
    // Verifica se os modelos estão disponíveis
    console.log('2. Verificando modelos disponíveis:', 
      'Plano:', !!Plano, 
      'Disciplina:', !!Disciplina, 
      'Assunto:', !!Assunto
    );
    
    // Tenta primeiro verificar se a tabela existe/está acessível
    try {
      console.log('3. Verificando acesso à tabela Planos');
      const testQuery = await Plano.findOne();
      console.log('4. Teste de acesso à tabela bem-sucedido:', !!testQuery);
    } catch (tableError) {
      console.error('5. Erro ao acessar tabela Planos:', tableError);
      return res.status(500).json({ 
        error: 'Erro ao acessar tabela de planos', 
        details: tableError.message 
      });
    }
    
    // Tenta fazer a consulta principal
    console.log('6. Executando consulta principal');
    const planos = await Plano.findAll({
      include: [
        {
          model: Disciplina,
          include: [Assunto],
          required: false // Torna o JOIN em LEFT JOIN para evitar exclusão de planos sem disciplinas
        }
      ]
    });
    
    console.log('7. Consulta concluída, número de planos encontrados:', planos?.length || 0);
    
    // Se não houver planos, retorna um array vazio em vez de null/undefined
    if (!planos || planos.length === 0) {
      console.log('8. Nenhum plano encontrado, retornando array vazio');
      return res.json([]);
    }
    
    console.log('9. Planos encontrados, retornando dados');
    res.json(planos);
  } catch (error) {
    console.error('10. Erro ao listar planos:', error);
    console.error('11. Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao listar planos', details: error.message });
  }
};

// Buscar um plano específico
const buscarPlanoPorId = async (req, res) => {
  try {
    const plano = await Plano.findByPk(req.params.id, {
      include: [
        {
          model: Disciplina,
          include: [Assunto]
        }
      ]
    });

    if (!plano) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    res.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ error: 'Erro ao buscar plano', details: error.message });
  }
};

// Criar um novo plano
const criarPlano = async (req, res) => {
  try {
    console.log('1. Recebendo dados do plano:', req.body);
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !cargo || !descricao || !duracao) {
      console.log('2. Campos obrigatórios faltando:', { nome, cargo, descricao, duracao });
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Validação das disciplinas
    if (!disciplinas || !Array.isArray(disciplinas) || disciplinas.length === 0) {
      console.log('3. Disciplinas inválidas:', disciplinas);
      return res.status(400).json({ error: 'É necessário adicionar pelo menos uma disciplina' });
    }

    // Validação dos assuntos
    for (const disciplina of disciplinas) {
      if (!disciplina.assuntos || !Array.isArray(disciplina.assuntos) || disciplina.assuntos.length === 0) {
        console.log('3.1. Assuntos inválidos para disciplina:', disciplina.nome);
        return res.status(400).json({ 
          error: `É necessário adicionar pelo menos um assunto para a disciplina ${disciplina.nome}` 
        });
      }

      for (const assunto of disciplina.assuntos) {
        if (!assunto.nome || typeof assunto.nome !== 'string' || assunto.nome.trim() === '') {
          console.log('3.2. Nome do assunto inválido:', assunto);
          return res.status(400).json({ 
            error: `O nome do assunto não pode estar vazio na disciplina ${disciplina.nome}` 
          });
        }
      }
    }

    console.log('4. Criando plano...');
    // Cria o plano
    const plano = await Plano.create({
      nome,
      cargo,
      descricao,
      duracao
    });

    console.log('5. Plano criado:', plano.toJSON());

    // Cria as disciplinas e assuntos
    console.log('6. Criando disciplinas e assuntos...');
    for (const disciplina of disciplinas) {
      console.log('6.1. Criando disciplina:', disciplina.nome);
      const disciplinaCriada = await Disciplina.create({
        nome: disciplina.nome,
        PlanoId: plano.id
      });

      console.log('6.2. Criando assuntos para disciplina:', disciplina.nome);
      console.log('6.3. Assuntos a serem criados:', disciplina.assuntos);
      
      for (const assunto of disciplina.assuntos) {
        console.log('6.4. Criando assunto:', assunto.nome);
        await Assunto.create({
          nome: assunto.nome,
          DisciplinaId: disciplinaCriada.id
        });
      }
    }

    // Retorna o plano criado com suas disciplinas e assuntos
    console.log('7. Buscando plano completo...');
    const planoCompleto = await Plano.findByPk(plano.id, {
      include: [
        {
          model: Disciplina,
          include: [Assunto]
        }
      ]
    });

    console.log('8. Plano completo criado:', planoCompleto.toJSON());
    res.status(201).json(planoCompleto);
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao criar plano',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Atualizar um plano
const atualizarPlano = async (req, res) => {
  try {
    console.log('1. Iniciando atualização do plano');
    console.log('2. ID recebido:', req.params.id);
    console.log('3. Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    const { nome, cargo, descricao, duracao, disciplinas } = req.body;

    console.log('4. Buscando plano no banco...');
    const plano = await Plano.findByPk(id);
    if (!plano) {
      console.log('5. Plano não encontrado');
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    console.log('6. Plano encontrado:', plano.toJSON());

    console.log('7. Atualizando dados do plano...');
    // Atualiza o plano
    await plano.update({
      nome,
      cargo,
      descricao,
      duracao
    });
    console.log('8. Dados do plano atualizados');

    // Se houver disciplinas, atualiza elas
    if (disciplinas && Array.isArray(disciplinas)) {
      console.log('9. Atualizando disciplinas...');
      // Remove disciplinas antigas
      await Disciplina.destroy({ where: { PlanoId: id } });
      console.log('10. Disciplinas antigas removidas');

      // Cria novas disciplinas
      for (const disciplina of disciplinas) {
        console.log('11. Criando disciplina:', disciplina.nome);
        const disciplinaCriada = await Disciplina.create({
          nome: disciplina.nome,
          PlanoId: id
        });

        if (disciplina.assuntos && Array.isArray(disciplina.assuntos)) {
          console.log('12. Criando assuntos para disciplina:', disciplina.nome);
          for (const assunto of disciplina.assuntos) {
            await Assunto.create({
              nome: assunto.nome,
              DisciplinaId: disciplinaCriada.id
            });
          }
        }
      }
      console.log('13. Disciplinas e assuntos atualizados');
    }

    console.log('14. Buscando plano atualizado...');
    // Retorna o plano atualizado
    const planoAtualizado = await Plano.findByPk(id, {
      include: [
        {
          model: Disciplina,
          include: [Assunto]
        }
      ]
    });
    console.log('15. Plano atualizado:', planoAtualizado.toJSON());

    res.json(planoAtualizado);
  } catch (error) {
    console.error('16. Erro ao atualizar plano:', error);
    console.error('17. Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar plano', details: error.message });
  }
};

// Excluir um plano
const excluirPlano = async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await Plano.findByPk(id);
    if (!plano) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Exclui o plano (as disciplinas e assuntos serão excluídos em cascata)
    await plano.destroy();

    res.json({ message: 'Plano excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({ error: 'Erro ao excluir plano', details: error.message });
  }
};

// Rota de teste
const testarRota = (req, res) => {
  res.json({ message: 'Rota de planos funcionando!' });
};

module.exports = {
  listarPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  excluirPlano,
  testarRota
}; 