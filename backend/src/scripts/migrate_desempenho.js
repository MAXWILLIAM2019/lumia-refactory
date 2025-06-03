const { Sequelize } = require('sequelize');
const sequelize = require('../db');

async function migrateDesempenho() {
  try {
    console.log('Iniciando migração do campo desempenho...');
    
    // Alterar o tipo da coluna desempenho
    await sequelize.query(`
      ALTER TABLE "Meta" 
      ALTER COLUMN "desempenho" TYPE DECIMAL(5,2) 
      USING desempenho::DECIMAL(5,2);
    `);
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    process.exit();
  }
}

migrateDesempenho(); 