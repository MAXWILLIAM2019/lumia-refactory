/**
 * Arquivo de índice para modelos
 * 
 * Este arquivo centraliza a exportação de todos os modelos
 * e garante que os relacionamentos sejam estabelecidos corretamente.
 */
const Plano = require('./Plano');
const Disciplina = require('./Disciplina');
const Assunto = require('./Assunto');
const Aluno = require('./Aluno');
const Sprint = require('./Sprint');
const Meta = require('./Meta');
const AlunoPlano = require('./AlunoPlano');
const SprintAtual = require('./SprintAtual');

// Garante que os relacionamentos são estabelecidos
console.log('Configurando relacionamentos entre modelos...');

// Relacionamento Plano -> Disciplina
console.log('Configurando relacionamento Plano -> Disciplina');
Plano.belongsToMany(Disciplina, { 
  through: 'PlanoDisciplina',
  as: 'disciplinas'
});
Disciplina.belongsToMany(Plano, { 
  through: 'PlanoDisciplina',
  as: 'planos'
});

// Relacionamento Disciplina -> Assunto
console.log('Configurando relacionamento Disciplina -> Assunto');
Disciplina.hasMany(Assunto, { 
  onDelete: 'CASCADE',
  foreignKey: 'disciplinaId',
  as: 'assuntos'
});
Assunto.belongsTo(Disciplina, { 
  foreignKey: 'disciplinaId'
});

// Relacionamento Plano -> Sprint
console.log('Configurando relacionamento Plano -> Sprint');
Plano.hasMany(Sprint, {
  onDelete: 'SET NULL',
  as: 'sprints'
});
Sprint.belongsTo(Plano, {
  foreignKey: 'PlanoId'
});

// Relacionamento Sprint -> Meta
console.log('Configurando relacionamento Sprint -> Meta');
Sprint.hasMany(Meta, {
  onDelete: 'CASCADE',
  as: 'metas'
});
Meta.belongsTo(Sprint);

// Relacionamento Aluno -> Plano (via AlunoPlano)
console.log('Configurando relacionamento Aluno -> Plano');
Aluno.belongsToMany(Plano, { 
  through: AlunoPlano, 
  as: 'planos' 
});
Plano.belongsToMany(Aluno, { 
  through: AlunoPlano, 
  as: 'alunos' 
});

// Relacionamento Aluno -> SprintAtual
console.log('Configurando relacionamento Aluno -> SprintAtual');
Aluno.hasOne(SprintAtual, { foreignKey: 'AlunoId' });
SprintAtual.belongsTo(Aluno, { foreignKey: 'AlunoId' });

// Relacionamento Sprint -> SprintAtual
console.log('Configurando relacionamento Sprint -> SprintAtual');
Sprint.hasOne(SprintAtual, { foreignKey: 'SprintId' });
SprintAtual.belongsTo(Sprint, { foreignKey: 'SprintId' });

console.log('Relacionamentos configurados com sucesso!');

// Exporte os modelos
module.exports = {
  Plano,
  Disciplina,
  Assunto,
  Aluno,
  Sprint,
  Meta,
  AlunoPlano,
  SprintAtual
}; 