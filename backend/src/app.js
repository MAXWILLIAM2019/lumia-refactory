const express = require('express');
const cors = require('cors');
const alunosRoutes = require('./routes/alunos');
const sprintRoutes = require('./routes/sprints');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/alunos', alunosRoutes);
app.use('/api/sprints', sprintRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app; 