-- Script para renomear constraints dos templates para nomes consistentes com tabelas *Mestre
-- Este script é SEGURO e não afeta dados existentes nem funcionalidade

-- ===== PLANOS MESTRE =====
-- Renomear primary key
ALTER TABLE "PlanosMestre" 
RENAME CONSTRAINT "PlanosTemplate_pkey" TO "PlanosMestre_pkey";

-- ===== SPRINTS MESTRE =====
-- Renomear primary key  
ALTER TABLE "SprintsMestre" 
RENAME CONSTRAINT "SprintsTemplate_pkey" TO "SprintsMestre_pkey";

-- ===== METAS MESTRE =====
-- Renomear primary key
ALTER TABLE "MetasMestre" 
RENAME CONSTRAINT "MetasTemplate_pkey" TO "MetasMestre_pkey";

-- Renomear check constraint de relevância
ALTER TABLE "MetasMestre" 
RENAME CONSTRAINT "MetasTemplate_relevancia_check" TO "MetasMestre_relevancia_check";

-- ===== VERIFICAÇÃO =====
-- Listar todas as constraints das tabelas *Mestre para confirmar
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('PlanosMestre', 'SprintsMestre', 'MetasMestre')
)
ORDER BY conrelid, conname;

-- Verificar se ainda existem constraints com nome *Template*
SELECT 
    conname as constraint_name,
    relname as table_name
FROM pg_constraint c
JOIN pg_class r ON c.conrelid = r.oid
WHERE conname LIKE '%Template%';

PRINT 'Script executado com sucesso! Constraints renomeadas para manter consistência.'; 