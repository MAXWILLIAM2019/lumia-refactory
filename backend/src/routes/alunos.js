const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao listar alunos' });
  }
});

// Cadastrar novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, email, cpf } = req.body;

    if (!nome || !email || !cpf) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const alunoExistente = await prisma.aluno.findFirst({
      where: { cpf }
    });

    if (alunoExistente) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        email,
        cpf
      }
    });

    res.status(201).json(aluno);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

module.exports = router; 