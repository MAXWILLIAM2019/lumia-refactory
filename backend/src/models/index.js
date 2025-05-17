/**
 * Arquivo de índice para modelos
 * 
 * Este arquivo centraliza a exportação de todos os modelos
 * e garante que os relacionamentos sejam estabelecidos corretamente.
 */
const Plano = require('./Plano');
const Disciplina = require('./Disciplina');
const Assunto = require('./Assunto');

// Garante que os relacionamentos são estabelecidos
console.log('Configurando relacionamentos entre modelos...');

// Relacionamento Plano -> Disciplina
console.log('Configurando relacionamento Plano -> Disciplina');
Plano.hasMany(Disciplina, { 
  onDelete: 'CASCADE',
  foreignKey: 'PlanoId'
});
Disciplina.belongsTo(Plano, { 
  foreignKey: 'PlanoId' 
});

// Relacionamento Disciplina -> Assunto
console.log('Configurando relacionamento Disciplina -> Assunto');
Disciplina.hasMany(Assunto, { 
  onDelete: 'CASCADE',
  foreignKey: 'DisciplinaId'
});
Assunto.belongsTo(Disciplina, { 
  foreignKey: 'DisciplinaId'
});

console.log('Relacionamentos configurados com sucesso!');

// Exporte os modelos
module.exports = {
  Plano,
  Disciplina,
  Assunto
}; 