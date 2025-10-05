const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1127',
    database: 'mentoring'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se a tabela administrador_info existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'administrador_info'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Tabela administrador_info existe');
      
      // Verificar estrutura da tabela
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'administrador_info'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Estrutura da tabela administrador_info:');
      structure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ Tabela administrador_info NÃO existe');
    }

    // Verificar se a tabela aluno_info existe
    const alunoResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'aluno_info'
    `);

    if (alunoResult.rows.length > 0) {
      console.log('✅ Tabela aluno_info existe');
    } else {
      console.log('❌ Tabela aluno_info NÃO existe');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();

