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

// Garante que os relacionamentos são estabelecidos
console.log('Configurando relacionamentos entre modelos...');

// Relacionamento Plano -> Disciplina (antiga implementação onde disciplina pertencia a um plano)
console.log('Configurando relacionamento Plano -> Disciplina (associação via tabela intermediária)');

// Criamos uma tabela intermediária PlanoDisciplina para permitir
// que uma disciplina possa ser usada em múltiplos planos
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
console.log('Configurando relacionamento Aluno -> Plano (via AlunoPlano)');
// Nota: As relações estão definidas no arquivo AlunoPlano.js

console.log('Relacionamentos configurados com sucesso!');

// Exporte os modelos
module.exports = {
  Plano,
  Disciplina,
  Assunto,
  Aluno,
  Sprint,
  Meta,
  AlunoPlano
}; 