/**
 * Script de Seed para inicializar o banco de dados com dados padrão para testes
 * 
 * Este script cria:
 * 1. Um administrador (maxwilliam0440@gmail.com, senha: 123)
 * 2. Uma disciplina "Direito Administrativo"
 * 3. Um assunto "Princípios Administrativos" para a disciplina
 * 4. Um aluno padrão para testes (aluno@teste.com, senha: 123)
 * 5. Um plano de estudo
 * 6. Uma sprint para o plano
 * 7. Associa o aluno ao plano
 */
const bcrypt = require('bcryptjs');
const { Administrador, Disciplina, Assunto, Aluno, Plano, Sprint, Meta, AlunoPlano } = require('../models');
const sequelize = require('../db');

/**
 * Função principal que executa as operações de seed
 */
async function seed() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Verificar conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso.');

    // Criar administrador padrão
    await criarAdministrador();

    // Criar disciplina e assunto
    const disciplina = await criarDisciplinaComAssunto();

    // Criar aluno padrão
    const aluno = await criarAluno();

    // Criar plano e sprint
    const plano = await criarPlanoComSprint(disciplina);

    // Associar aluno ao plano
    await associarAlunoPlano(aluno, plano);

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
  }
}

/**
 * Cria um administrador padrão para testes
 */
async function criarAdministrador() {
  try {
    const email = 'maxwilliam0440@gmail.com';
    const adminExistente = await Administrador.findOne({ where: { email } });

    if (adminExistente) {
      console.log('Administrador padrão já existe.');
      return;
    }

    const senhaCriptografada = await bcrypt.hash('123', 10);
    
    await Administrador.create({
      nome: 'Max William',
      email,
      senha: senhaCriptografada,
      cargo: 'Administrador Teste'
    });

    console.log('Administrador padrão criado com sucesso.');
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    throw error;
  }
}

/**
 * Cria uma disciplina com um assunto para testes
 * @returns {Object} A disciplina criada
 */
async function criarDisciplinaComAssunto() {
  try {
    const nomeDisciplina = 'Direito Administrativo';
    let disciplina = await Disciplina.findOne({
      where: { nome: nomeDisciplina }
    });

    if (disciplina) {
      console.log('Disciplina padrão já existe.');
      
      // Verificar se o assunto existe
      const assuntoExistente = await Assunto.findOne({
        where: { 
          disciplinaId: disciplina.id,
          nome: 'Princípios Administrativos'
        }
      });
      
      if (!assuntoExistente) {
        // Criar apenas o assunto se a disciplina já existir
        await Assunto.create({
          nome: 'Princípios Administrativos',
          disciplinaId: disciplina.id
        });
        console.log('Assunto padrão criado com sucesso.');
      } else {
        console.log('Assunto padrão já existe.');
      }
      
      return disciplina;
    }

    // Criar a disciplina e o assunto
    disciplina = await Disciplina.create({
      nome: nomeDisciplina,
      descricao: 'Disciplina para testes sobre Direito Administrativo',
      cargaHoraria: 60,
      ativa: true
    });

    await Assunto.create({
      nome: 'Princípios Administrativos',
      disciplinaId: disciplina.id
    });

    console.log('Disciplina e assunto padrão criados com sucesso.');
    return disciplina;
  } catch (error) {
    console.error('Erro ao criar disciplina e assunto:', error);
    throw error;
  }
}

/**
 * Cria um aluno padrão para testes
 * @returns {Object} O aluno criado
 */
async function criarAluno() {
  try {
    const email = 'aluno@teste.com';
    let aluno = await Aluno.findOne({ where: { email } });

    if (aluno) {
      console.log('Aluno padrão já existe.');
      return aluno;
    }

    const senhaCriptografada = await bcrypt.hash('123', 10);
    
    aluno = await Aluno.create({
      nome: 'Aluno Teste',
      email,
      cpf: '12345678900',
      senha: senhaCriptografada
    });

    console.log('Aluno padrão criado com sucesso.');
    return aluno;
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    throw error;
  }
}

/**
 * Cria um plano com uma sprint para testes
 * @param {Object} disciplina - A disciplina a ser associada ao plano
 * @returns {Object} O plano criado
 */
async function criarPlanoComSprint(disciplina) {
  try {
    const nomePlano = 'Plano de Estudos para Concursos';
    let plano = await Plano.findOne({ where: { nome: nomePlano } });

    if (plano) {
      console.log('Plano padrão já existe.');

      // Verificar se já tem sprint
      const sprintExistente = await Sprint.findOne({
        where: { PlanoId: plano.id }
      });

      if (!sprintExistente) {
        await criarSprint(plano.id);
      } else {
        console.log('Sprint padrão já existe.');
      }

      // Verificar se a disciplina já está associada ao plano
      const disciplinaAssociada = await plano.hasDisciplina(disciplina);
      if (!disciplinaAssociada) {
        await plano.addDisciplina(disciplina);
        console.log('Disciplina associada ao plano com sucesso.');
      }

      return plano;
    }

    // Criar o plano
    plano = await Plano.create({
      nome: nomePlano,
      cargo: 'Analista Judiciário',
      descricao: 'Plano de estudos para concursos na área jurídica',
      duracao: 6 // 6 meses
    });

    // Associar a disciplina ao plano
    await plano.addDisciplina(disciplina);

    // Criar uma sprint para o plano
    await criarSprint(plano.id);

    console.log('Plano padrão criado com sucesso.');
    return plano;
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    throw error;
  }
}

/**
 * Cria uma sprint para um plano
 * @param {number} planoId - ID do plano
 */
async function criarSprint(planoId) {
  try {
    const hoje = new Date();
    const fimSprint = new Date();
    fimSprint.setDate(hoje.getDate() + 14); // Sprint de 2 semanas

    const sprint = await Sprint.create({
      nome: 'Sprint 1',
      dataInicio: hoje,
      dataFim: fimSprint,
      PlanoId: planoId,
      status: 'Em Andamento',
      posicao: 1
    });

    // Criar algumas metas para a sprint
    await Meta.create({
      disciplina: 'Direito Administrativo',
      tipo: 'teoria',
      titulo: 'Estudar Princípios Administrativos',
      relevancia: 5,
      SprintId: sprint.id,
      status: 'Pendente'
    });

    await Meta.create({
      disciplina: 'Direito Administrativo',
      tipo: 'questoes',
      titulo: 'Resolver questões de Princípios Administrativos',
      relevancia: 4,
      SprintId: sprint.id,
      status: 'Pendente',
      totalQuestoes: 20,
      questoesCorretas: 0
    });
    
    // Meta já concluída
    await Meta.create({
      disciplina: 'Direito Administrativo',
      tipo: 'teoria',
      titulo: 'Ler material sobre Organização Administrativa',
      comandos: 'Ler páginas 45-60 do manual',
      relevancia: 5,
      SprintId: sprint.id,
      status: 'Concluída',
      tempoEstudado: '02:30',
      desempenho: 90
    });
    
    // Meta em andamento
    await Meta.create({
      disciplina: 'Direito Administrativo',
      tipo: 'revisao',
      titulo: 'Revisar Atos Administrativos',
      relevancia: 3,
      SprintId: sprint.id,
      status: 'Em Andamento',
      tempoEstudado: '01:15',
      desempenho: 75
    });
    
    // Meta com link
    await Meta.create({
      disciplina: 'Direito Administrativo',
      tipo: 'reforco',
      titulo: 'Exercícios complementares',
      comandos: 'Assistir vídeo e fazer os exercícios propostos',
      link: 'https://www.youtube.com/watch?v=exemplo',
      relevancia: 2,
      SprintId: sprint.id,
      status: 'Pendente'
    });

    console.log('Sprint e metas padrão criadas com sucesso.');
  } catch (error) {
    console.error('Erro ao criar sprint:', error);
    throw error;
  }
}

/**
 * Associa um aluno a um plano
 * @param {Object} aluno - O aluno
 * @param {Object} plano - O plano
 */
async function associarAlunoPlano(aluno, plano) {
  try {
    // Verificar se já existe associação
    const associacaoExistente = await AlunoPlano.findOne({
      where: {
        alunoId: aluno.id,
        planoId: plano.id
      }
    });

    if (associacaoExistente) {
      console.log('Associação aluno-plano já existe.');
      return;
    }

    const hoje = new Date();
    const previsaoTermino = new Date();
    previsaoTermino.setMonth(hoje.getMonth() + plano.duracao);

    await AlunoPlano.create({
      alunoId: aluno.id,
      planoId: plano.id,
      dataInicio: hoje,
      dataPrevisaoTermino: previsaoTermino,
      status: 'em andamento',
      progresso: 0
    });

    console.log('Aluno associado ao plano com sucesso.');
  } catch (error) {
    console.error('Erro ao associar aluno ao plano:', error);
    throw error;
  }
}

// Exportar a função para ser usada no arquivo de inicialização
module.exports = seed; 