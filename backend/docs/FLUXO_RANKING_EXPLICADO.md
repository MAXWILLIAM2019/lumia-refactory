# 🔄 Fluxo Completo do Sistema de Ranking - A "Mágica" Explicada

## 🎯 Visão Geral do Fluxo

O sistema de ranking funciona em **3 níveis**:
1. **Nível de Aplicação** (Node.js + node-cron)
2. **Nível de Banco** (PostgreSQL + Funções)
3. **Nível de Dados** (View + Tabelas)

## 🏗️ Arquitetura do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DO RANKING                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   APLICAÇÃO     │    │     BANCO       │    │     DADOS       │
│   (Node.js)     │    │  (PostgreSQL)   │    │   (Tabelas)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Inicia Scheduler   │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Agenda Jobs        │                       │
         │    (08:00, 14:00,     │                       │
         │     20:00, 02:00)     │                       │
         │                       │                       │
         │ 3. Executa Job        │                       │
         ├──────────────────────►│ 4. Chama Função       │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 5. Consulta View      │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 6. Calcula Ranking    │
         │                       │    e Atualiza Tabela  │
         │                       │                       │
         │ 7. Recebe Resultado   │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 8. Log Estatísticas   │                       │
         │                       │                       │
```

## 🚀 1. Nível de Aplicação (Node.js)

### **Classe: `JobScheduler`** (`backend/src/jobs/scheduler.js`)

```javascript
class JobScheduler {
  iniciar() {
    // Job 1: Atualização 3x ao dia
    const rankingJob1 = cron.schedule('0 8 * * *', async () => {
      await rankingJob.executarAtualizacao();
    });
    
    const rankingJob2 = cron.schedule('0 14 * * *', async () => {
      await rankingJob.executarAtualizacao();
    });
    
    const rankingJob3 = cron.schedule('0 20 * * *', async () => {
      await rankingJob.executarAtualizacao();
    });
    
    // Job 2: Limpeza semanal
    const limpezaJob = cron.schedule('0 2 * * 1', async () => {
      await rankingJob.executarLimpeza();
    });
  }
}
```

**Responsabilidades:**
- ✅ **Agendar jobs** com node-cron
- ✅ **Controlar execução** (evitar sobreposição)
- ✅ **Gerenciar timezone** (America/Sao_Paulo)
- ✅ **Log de execução** e status

### **Classe: `RankingJob`** (`backend/src/jobs/rankingJob.js`)

```javascript
class RankingJob {
  async executarAtualizacao() {
    // 1. Verifica se já está rodando
    if (this.isRunning) return;
    
    // 2. Marca como executando
    this.isRunning = true;
    
    // 3. Chama função PostgreSQL
    await db.query('SELECT public.atualizar_ranking_semanal()');
    
    // 4. Log de estatísticas
    await this.logEstatisticas();
    
    // 5. Libera execução
    this.isRunning = false;
  }
}
```

**Responsabilidades:**
- ✅ **Executar atualização** do ranking
- ✅ **Chamar funções** PostgreSQL
- ✅ **Controlar concorrência** (evitar jobs simultâneos)
- ✅ **Log de performance** e estatísticas
- ✅ **Tratamento de erros**

## 🗄️ 2. Nível de Banco (PostgreSQL)

### **Função: `atualizar_ranking_semanal()`**

```sql
CREATE OR REPLACE FUNCTION public.atualizar_ranking_semanal()
RETURNS void AS $$
DECLARE
    v_semana_inicio DATE;
    v_semana_fim DATE;
    v_posicao_atual INTEGER := 1;
    aluno_record RECORD;
BEGIN
    -- 1. Calcula período da semana
    v_semana_inicio := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    v_semana_fim := (v_semana_inicio + INTERVAL '6 days')::DATE;
    
    -- 2. Limpa ranking atual
    DELETE FROM public.ranking_semanal 
    WHERE ranking_semanal.semana_inicio = v_semana_inicio;
    
    -- 3. Consulta view e insere novos dados
    FOR aluno_record IN 
        SELECT * FROM public.vw_desempenho_alunos
    LOOP
        INSERT INTO public.ranking_semanal (
            id_usuario, nome_usuario, email_usuario,
            total_questoes, total_acertos, percentual_acerto, pontuacao_final,
            posicao, semana_inicio, semana_fim, ultima_atualizacao
        ) VALUES (
            aluno_record.idusuario, aluno_record.nome_usuario, aluno_record.email_usuario,
            aluno_record.total_questoes, aluno_record.total_acertos,
            aluno_record.percentual_acerto, aluno_record.pontuacao_final,
            v_posicao_atual, v_semana_inicio, v_semana_fim, CURRENT_TIMESTAMP
        );
        
        v_posicao_atual := v_posicao_atual + 1;
    END LOOP;
    
    -- 4. Log de sucesso
    RAISE NOTICE 'Ranking atualizado: % alunos, semana % a %', 
        v_posicao_atual - 1, v_semana_inicio, v_semana_fim;
END;
$$ LANGUAGE plpgsql;
```

**Responsabilidades:**
- ✅ **Calcular período** da semana atual
- ✅ **Limpar dados** antigos da semana
- ✅ **Consultar view** para obter desempenho
- ✅ **Inserir novos dados** na tabela
- ✅ **Calcular posições** do ranking
- ✅ **Log de execução** no PostgreSQL

### **Função: `limpar_ranking_antigo()`**

```sql
CREATE OR REPLACE FUNCTION public.limpar_ranking_antigo()
RETURNS void AS $$
BEGIN
    -- Remove rankings de semanas anteriores (mantém apenas 2 semanas)
    DELETE FROM public.ranking_semanal 
    WHERE semana_inicio < DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week';
    
    RAISE NOTICE 'Ranking antigo limpo em %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

**Responsabilidades:**
- ✅ **Limpar dados** antigos (manter apenas 2 semanas)
- ✅ **Liberar espaço** no banco
- ✅ **Log de limpeza**

## 📊 3. Nível de Dados (View + Tabelas)

### **View: `vw_desempenho_alunos`**

```sql
CREATE VIEW public.vw_desempenho_alunos AS
SELECT 
    u.idusuario,
    u.nome as nome_usuario,
    u.login as email_usuario,
    COALESCE(SUM(m."totalQuestoes"), 0) as total_questoes,
    COALESCE(SUM(m."questoesCorretas"), 0) as total_acertos,
    CASE 
        WHEN COALESCE(SUM(m."totalQuestoes"), 0) > 0 
        THEN ROUND(
            (COALESCE(SUM(m."questoesCorretas"), 0) * 100.0) / 
            COALESCE(SUM(m."totalQuestoes"), 1), 2
        )
        ELSE 0.00
    END as percentual_acerto,
    ROUND(
        (COALESCE(SUM(m."questoesCorretas"), 0) * 10.0) + 
        (CASE 
            WHEN COALESCE(SUM(m."totalQuestoes"), 0) > 0 
            THEN (COALESCE(SUM(m."questoesCorretas"), 0) * 100.0) / 
            COALESCE(SUM(m."totalQuestoes"), 1) * 0.5
            ELSE 0.00
        END) +
        (COALESCE(SUM(m."totalQuestoes"), 0) * 0.1), 2
    ) as pontuacao_final
FROM public.usuario u
LEFT JOIN public."AlunoPlanos" ap ON u.idusuario = ap.idusuario AND ap.ativo = true
LEFT JOIN public."Planos" p ON ap."PlanoId" = p.id
LEFT JOIN public."Sprints" s ON p.id = s."PlanoId"
LEFT JOIN public."Meta" m ON s.id = m."SprintId" 
    AND m.status = 'Concluída'
    AND m."updatedAt" >= DATE_TRUNC('week', CURRENT_DATE)
    AND m."updatedAt" < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
WHERE u.situacao = true
GROUP BY u.idusuario, u.nome, u.login
HAVING COALESCE(SUM(m."totalQuestoes"), 0) > 0
ORDER BY pontuacao_final DESC, total_questoes DESC, percentual_acerto DESC;
```

**Responsabilidades:**
- ✅ **Calcular métricas** em tempo real
- ✅ **Filtrar por semana** atual
- ✅ **Aplicar fórmula** de pontuação
- ✅ **Ordenar por desempenho**
- ✅ **Filtrar apenas** alunos ativos com atividades

### **Tabela: `ranking_semanal`**

```sql
CREATE TABLE public.ranking_semanal (
    id_ranking SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES public.usuario(idusuario) ON DELETE CASCADE,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(120) NOT NULL,
    total_questoes INTEGER DEFAULT 0,
    total_acertos INTEGER DEFAULT 0,
    percentual_acerto DECIMAL(5,2) DEFAULT 0.00,
    pontuacao_final DECIMAL(8,2) DEFAULT 0.00,
    posicao INTEGER,
    semana_inicio DATE NOT NULL,
    semana_fim DATE NOT NULL,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, semana_inicio)
);
```

**Responsabilidades:**
- ✅ **Armazenar ranking** calculado
- ✅ **Manter histórico** semanal
- ✅ **Permitir consultas** rápidas
- ✅ **Garantir unicidade** por usuário/semana

## ⚡ 4. Fluxo Detalhado de Execução

### **Cenário: Job executando às 14:00**

```
1. 🕐 14:00:00 - node-cron dispara o job
   └─ JobScheduler.executarAtualizacao()

2. 🔍 14:00:01 - Verifica se já está rodando
   └─ if (this.isRunning) return;

3. 🔒 14:00:02 - Marca como executando
   └─ this.isRunning = true;

4. 📞 14:00:03 - Chama função PostgreSQL
   └─ db.query('SELECT public.atualizar_ranking_semanal()')

5. 🗄️ 14:00:04 - PostgreSQL executa função
   └─ atualizar_ranking_semanal()

6. 📅 14:00:05 - Calcula período da semana
   └─ semana_inicio = '2025-09-15', semana_fim = '2025-09-21'

7. 🗑️ 14:00:06 - Limpa ranking atual
   └─ DELETE FROM ranking_semanal WHERE semana_inicio = '2025-09-15'

8. 📊 14:00:07 - Consulta view para obter desempenho
   └─ SELECT * FROM vw_desempenho_alunos

9. 🧮 14:00:08 - View calcula métricas em tempo real
   └─ total_questoes, total_acertos, percentual_acerto, pontuacao_final

10. 📝 14:00:09 - Insere novos dados na tabela
    └─ INSERT INTO ranking_semanal (posicao, dados...)

11. ✅ 14:00:10 - Função retorna sucesso
    └─ RAISE NOTICE 'Ranking atualizado: 1 alunos'

12. 📈 14:00:11 - Node.js loga estatísticas
    └─ await this.logEstatisticas()

13. 🔓 14:00:12 - Libera execução
    └─ this.isRunning = false;

14. 🎉 14:00:13 - Job concluído
    └─ console.log('✅ Ranking atualizado com sucesso em 1300ms')
```

## 🎯 5. Pontos de Monitoramento

### **Nível de Aplicação**
```javascript
// Logs de execução
console.log('⏰ Executando job de ranking (14:00)...');
console.log('✅ Ranking atualizado com sucesso em 1300ms');

// Estatísticas
console.log('📊 Estatísticas do ranking:');
console.log('   • Total de alunos: 1');
console.log('   • Pontuação média: 47.57');
console.log('   • Total de questões: 9');
```

### **Nível de Banco**
```sql
-- Logs PostgreSQL
RAISE NOTICE 'Ranking atualizado: % alunos, semana % a %', 
    v_posicao_atual - 1, v_semana_inicio, v_semana_fim;

RAISE NOTICE 'Ranking antigo limpo em %', CURRENT_TIMESTAMP;
```

### **Nível de Dados**
```sql
-- Verificação manual
SELECT COUNT(*) as total_alunos, 
       AVG(pontuacao_final) as pontuacao_media
FROM ranking_semanal 
WHERE semana_inicio = DATE_TRUNC('week', CURRENT_DATE)::DATE;
```

## 🚀 6. Vantagens do Fluxo

### **Separação de Responsabilidades**
- ✅ **Aplicação**: Agendamento e controle
- ✅ **Banco**: Cálculo e persistência
- ✅ **Dados**: Consulta e performance

### **Performance**
- ✅ **View otimizada** com índices
- ✅ **Cálculo em tempo real** no banco
- ✅ **Jobs não bloqueantes**
- ✅ **Limpeza automática**

### **Manutenibilidade**
- ✅ **Código modular** e organizado
- ✅ **Logs detalhados** em cada nível
- ✅ **Fácil debug** e monitoramento
- ✅ **Escalável** para milhares de alunos

## 🎯 7. Resumo da "Mágica"

A "mágica" acontece na **integração dos 3 níveis**:

1. **Node.js** agenda e controla a execução
2. **PostgreSQL** calcula e persiste os dados
3. **View** fornece métricas em tempo real

**Resultado**: Sistema automático, performático e escalável que mantém o ranking sempre atualizado! 🎯

## 📊 8. Status Atual do Sistema

### **✅ Implementado e Funcionando:**
- View `vw_desempenho_alunos` calculando corretamente
- Tabela `ranking_semanal` populada com dados reais
- Função `atualizar_ranking_semanal()` executando sem erros
- API `/api/ranking` retornando dados corretos
- Fórmula de pontuação aplicada: (acertos × 10) + (percentual × 0.5) + (quantidade × 0.1)

### **🔄 Em Desenvolvimento:**
- Jobs automatizados com node-cron (comentados temporariamente)
- Scheduler para execução 3x ao dia
- Limpeza automática semanal

### **📈 Dados de Teste:**
- **1 aluno** no ranking: "Aluno teste"
- **9 questões** totais, **3 acertos**
- **33.33%** de acerto
- **47.57 pontos** finais
- **Semana**: 15-21 de setembro de 2025

