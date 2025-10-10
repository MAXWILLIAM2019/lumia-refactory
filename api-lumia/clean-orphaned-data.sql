-- ===========================================
-- SCRIPT PARA LIMPAR DADOS ÓRFÃOS (AMBIENTE DE TESTE)
-- ===========================================
-- Este script remove dados inconsistentes que podem causar
-- violações de constraints durante instanciação

-- 1. Remover metas órfãs (metas sem sprint correspondente)
DELETE FROM "Meta"
WHERE sprint_id NOT IN (SELECT id FROM "Sprints");

-- 2. Remover sprints órfãs (sprints sem plano correspondente)
DELETE FROM "Sprints"
WHERE plano_id NOT IN (SELECT id FROM "Plano");

-- 3. Remover associações aluno-plano órfãs (sem aluno ou plano)
DELETE FROM "AlunoPlanos"
WHERE idusuario NOT IN (SELECT idusuario FROM usuario)
   OR plano_id NOT IN (SELECT id FROM "Plano");

-- 4. Verificar se há outros dados órfãos
-- Metas sem MetaMestre
SELECT 'Meta sem MetaMestre' as tipo_inconsistencia,
       COUNT(*) as quantidade
FROM "Meta" m
LEFT JOIN "MetaMestre" mm ON m.meta_mestre_id = mm.id
WHERE mm.id IS NULL;

-- Sprints sem SprintMestre
SELECT 'Sprint sem SprintMestre' as tipo_inconsistencia,
       COUNT(*) as quantidade
FROM "Sprints" s
LEFT JOIN "SprintMestre" sm ON s.sprint_mestre_id = sm.id
WHERE sm.id IS NULL;

-- Planos sem PlanoMestre
SELECT 'Plano sem PlanoMestre' as tipo_inconsistencia,
       COUNT(*) as quantidade
FROM "Plano" p
LEFT JOIN "PlanosMestre" pm ON p.plano_mestre_id = pm.id
WHERE pm.id IS NULL;

-- 5. Resetar sequences se necessário (IDs começando do 1)
-- ALTER SEQUENCE "Meta_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "Sprints_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "Plano_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "AlunoPlanos_id_seq" RESTART WITH 1;

-- ===========================================
-- VERIFICAÇÃO FINAL
-- ===========================================

-- Contar registros em cada tabela após limpeza
SELECT 'Meta' as tabela, COUNT(*) as quantidade FROM "Meta"
UNION ALL
SELECT 'Sprints' as tabela, COUNT(*) as quantidade FROM "Sprints"
UNION ALL
SELECT 'Plano' as tabela, COUNT(*) as quantidade FROM "Plano"
UNION ALL
SELECT 'AlunoPlanos' as tabela, COUNT(*) as quantidade FROM "AlunoPlanos"
UNION ALL
SELECT 'MetaMestre' as tabela, COUNT(*) as quantidade FROM "MetaMestre"
UNION ALL
SELECT 'SprintMestre' as tabela, COUNT(*) as quantidade FROM "SprintMestre"
UNION ALL
SELECT 'PlanosMestre' as tabela, COUNT(*) as quantidade FROM "PlanosMestre";
