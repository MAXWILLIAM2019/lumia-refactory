-- Script para renomear sequences dos templates para nomes consistentes com tabelas *Mestre
-- Este script é SEGURO e não afeta dados existentes nem valores atuais das sequences

-- 1. Renomear as sequences
ALTER SEQUENCE "MetasTemplate_id_seq" RENAME TO "MetasMestre_id_seq";
ALTER SEQUENCE "SprintsTemplate_id_seq" RENAME TO "SprintsMestre_id_seq";
ALTER SEQUENCE "PlanosTemplate_id_seq" RENAME TO "PlanosMestre_id_seq";

-- 2. Atualizar as tabelas para usar os novos nomes das sequences
ALTER TABLE "MetasMestre" ALTER COLUMN id SET DEFAULT nextval('"MetasMestre_id_seq"'::regclass);
ALTER TABLE "SprintsMestre" ALTER COLUMN id SET DEFAULT nextval('"SprintsMestre_id_seq"'::regclass);
ALTER TABLE "PlanosMestre" ALTER COLUMN id SET DEFAULT nextval('"PlanosMestre_id_seq"'::regclass);

-- Verificar se tudo funcionou corretamente
SELECT 
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE sequencename LIKE '%Mestre%';

-- Verificar as tabelas
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('PlanosMestre', 'SprintsMestre', 'MetasMestre')
AND column_name = 'id'; 