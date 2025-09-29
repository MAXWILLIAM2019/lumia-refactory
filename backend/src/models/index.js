/**
 * Arquivo de índice para modelos
 * 
 * Este arquivo centraliza a exportação de todos os modelos
 * e estabelece os relacionamentos da nova arquitetura de templates.
 * 
 * Arquitetura:
 * 1. Templates (Modelos Mestre):
 *    - PlanoMestre -> SprintMestre -> MetaMestre
 *    - Servem como base para criar instâncias personalizadas
 * 
 * 2. Instâncias:
 *    - Plano -> Sprint -> Meta
 *    - Cada instância mantém referência ao seu template
 *    - Permite customização individual sem afetar o template
 * 
 * 3. Disciplinas e Assuntos:
 *    - Vinculados diretamente às metas
 *    - Não seguem o padrão de templates
 *    - Suporte para importação via planilha
 */
const Plano = require('./Plano');
const Disciplina = require('./Disciplina');
const Assunto = require('./Assunto');
const Sprint = require('./Sprint');
const Meta = require('./Meta');
const AlunoPlano = require('./AlunoPlano');
const SprintAtual = require('./SprintAtual');
const Usuario = require('./Usuario');
const GrupoUsuario = require('./GrupoUsuario');
const AlunoInfo = require('./AlunoInfo');
const AdministradorInfo = require('./AdministradorInfo');

// Modelos Mestre (Templates)
const PlanoMestre = require('./PlanoMestre');
const SprintMestre = require('./SprintMestre');
const MetaMestre = require('./MetaMestre');

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

// Relacionamento Usuario -> Plano (via AlunoPlano)
console.log('Configurando relacionamento Usuario -> Plano via AlunoPlano');
// Relacionamento já configurado via AlunoPlano com IdUsuario

// Relacionamento Sprint -> SprintAtual
console.log('Configurando relacionamento Sprint -> SprintAtual');
Sprint.hasOne(SprintAtual, { foreignKey: 'SprintId' });
SprintAtual.belongsTo(Sprint, { foreignKey: 'SprintId' });

// Relacionamento Usuario -> GrupoUsuario
console.log('Configurando relacionamento Usuario -> GrupoUsuario');
Usuario.belongsTo(GrupoUsuario, { foreignKey: 'grupo', as: 'grupoUsuario' });
GrupoUsuario.hasMany(Usuario, { foreignKey: 'grupo', as: 'usuarios' });

// Relacionamento Usuario -> AlunoInfo (1:1)
console.log('Configurando relacionamento Usuario -> AlunoInfo');
Usuario.hasOne(AlunoInfo, { foreignKey: 'IdUsuario', as: 'alunoInfo' });
AlunoInfo.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuario' });

// Relacionamento Usuario -> AdministradorInfo (1:1)
console.log('Configurando relacionamento Usuario -> AdministradorInfo');
Usuario.hasOne(AdministradorInfo, { foreignKey: 'IdUsuario', as: 'adminInfo' });
AdministradorInfo.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuario' });

// Relacionamentos dos Modelos Mestre
console.log('Configurando relacionamentos dos modelos mestre...');

// PlanoMestre -> SprintMestre
PlanoMestre.hasMany(SprintMestre, {
  foreignKey: 'PlanoMestreId',
  as: 'sprintsMestre',
  onDelete: 'CASCADE'
});
SprintMestre.belongsTo(PlanoMestre, {
  foreignKey: 'PlanoMestreId',
  as: 'planoMestre'
});

// SprintMestre -> MetaMestre
SprintMestre.hasMany(MetaMestre, {
  foreignKey: 'SprintMestreId',
  as: 'metasMestre',
  onDelete: 'CASCADE'
});
MetaMestre.belongsTo(SprintMestre, {
  foreignKey: 'SprintMestreId',
  as: 'sprintMestre'
});

// Relacionamentos de referência: PlanoMestre -> Planos (instâncias)
PlanoMestre.hasMany(Plano, {
  foreignKey: 'plano_mestre_id',
  as: 'instancias'
});
Plano.belongsTo(PlanoMestre, {
  foreignKey: 'plano_mestre_id',
  as: 'planoMestre'
});

console.log('Relacionamentos configurados com sucesso!');

// Exporte os modelos
module.exports = {
  Plano,
  Disciplina,
  Assunto,
  Sprint,
  Meta,
  AlunoPlano,
  SprintAtual,
  Usuario,
  GrupoUsuario,
  AlunoInfo,
  AdministradorInfo,
  
  // Modelos Mestre
  PlanoMestre,
  SprintMestre,
  MetaMestre
}; 