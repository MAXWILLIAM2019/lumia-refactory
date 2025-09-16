-- =====================================================
-- RANKING SIMPLES - VIEW + JOB 3X AO DIA
-- =====================================================

-- 1. TABELA SIMPLES PARA RANKING SEMANAL
-- Armazena apenas o ranking atual da semana
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

-- 2. VIEW PARA CÁLCULO DE DESEMPENHO
-- Calcula em tempo real baseado nas metas concluídas dos alunos
-- CADEIA: Usuario -> AlunoPlano -> Plano -> Sprint -> Meta

-- Primeiro, remove a view existente se houver
DROP VIEW IF EXISTS public.vw_desempenho_alunos;

-- Cria a nova view (conforme estrutura real do banco)
CREATE VIEW public.vw_desempenho_alunos AS
SELECT 
    u.idusuario,
    u.nome AS nome_usuario,
    u.login AS email_usuario,
    COALESCE(SUM(m."totalQuestoes"), 0::bigint) AS total_questoes,
    COALESCE(SUM(m."questoesCorretas"), 0::bigint) AS total_acertos,
    CASE
        WHEN COALESCE(SUM(m."totalQuestoes"), 0::bigint) > 0 
        THEN ROUND(
            COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 100.0 / 
            COALESCE(SUM(m."totalQuestoes"), 1::bigint)::numeric, 2
        )
        ELSE 0.00
    END AS percentual_acerto,
    -- Fórmula de pontuação: (acertos * 10) + (percentual * 0.5) + (quantidade * 0.1)
    ROUND(
        COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 10.0 +
        CASE
            WHEN COALESCE(SUM(m."totalQuestoes"), 0::bigint) > 0 
            THEN COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 100.0 / 
                 COALESCE(SUM(m."totalQuestoes"), 1::bigint)::numeric * 0.5
            ELSE 0.00
        END + 
        COALESCE(SUM(m."totalQuestoes"), 0::bigint)::numeric * 0.1, 2
    ) AS pontuacao_final
FROM public.usuario u
LEFT JOIN public."AlunoPlanos" ap ON u.idusuario = ap.idusuario AND ap.ativo = true
LEFT JOIN public."Planos" p ON ap."PlanoId" = p.id
LEFT JOIN public."Sprints" s ON p.id = s."PlanoId"
LEFT JOIN public."Meta" m ON s.id = m."SprintId" 
    AND m.status = 'Concluída'::"enum_Meta_status"
    AND m."updatedAt" >= DATE_TRUNC('week'::text, CURRENT_DATE::timestamp with time zone)
    AND m."updatedAt" < (DATE_TRUNC('week'::text, CURRENT_DATE::timestamp with time zone) + '7 days'::interval)
WHERE u.situacao = true
GROUP BY u.idusuario, u.nome, u.login
HAVING COALESCE(SUM(m."totalQuestoes"), 0::bigint) > 0
ORDER BY 
    ROUND(
        COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 10.0 +
        CASE
            WHEN COALESCE(SUM(m."totalQuestoes"), 0::bigint) > 0 
            THEN COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 100.0 / 
                 COALESCE(SUM(m."totalQuestoes"), 1::bigint)::numeric * 0.5
            ELSE 0.00
        END + 
        COALESCE(SUM(m."totalQuestoes"), 0::bigint)::numeric * 0.1, 2
    ) DESC, 
    COALESCE(SUM(m."totalQuestoes"), 0::bigint) DESC, 
    CASE
        WHEN COALESCE(SUM(m."totalQuestoes"), 0::bigint) > 0 
        THEN ROUND(
            COALESCE(SUM(m."questoesCorretas"), 0::bigint)::numeric * 100.0 / 
            COALESCE(SUM(m."totalQuestoes"), 1::bigint)::numeric, 2
        )
        ELSE 0.00
    END DESC;

-- 3. FUNÇÃO PARA ATUALIZAR RANKING
-- Função que será chamada pelo job 3x ao dia
-- DROP FUNCTION public.atualizar_ranking_semanal();

CREATE OR REPLACE FUNCTION public.atualizar_ranking_semanal()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    v_semana_inicio DATE;
    v_semana_fim DATE;
    v_posicao_atual INTEGER := 1;
    aluno_record RECORD;
BEGIN
    -- Calcula início e fim da semana atual
    v_semana_inicio := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    v_semana_fim := (v_semana_inicio + INTERVAL '6 days')::DATE;
    
    -- Limpa ranking da semana atual
    DELETE FROM public.ranking_semanal 
    WHERE ranking_semanal.semana_inicio = v_semana_inicio;
    
    -- Insere novos dados baseados na view
    FOR aluno_record IN 
        SELECT * FROM public.vw_desempenho_alunos
    LOOP
        INSERT INTO public.ranking_semanal (
            id_usuario,
            nome_usuario,
            email_usuario,
            total_questoes,
            total_acertos,
            percentual_acerto,
            pontuacao_final,
            posicao,
            semana_inicio,
            semana_fim,
            ultima_atualizacao
        ) VALUES (
            aluno_record.idusuario,
            aluno_record.nome_usuario,
            aluno_record.email_usuario,
            aluno_record.total_questoes,
            aluno_record.total_acertos,
            aluno_record.percentual_acerto,
            aluno_record.pontuacao_final,
            v_posicao_atual,
            v_semana_inicio,
            v_semana_fim,
            CURRENT_TIMESTAMP
        );
        
        v_posicao_atual := v_posicao_atual + 1;
    END LOOP;
    
    -- Log da atualização
    RAISE NOTICE 'Ranking atualizado: % alunos, semana % a %', 
        v_posicao_atual - 1, v_semana_inicio, v_semana_fim;
END;
$function$;

-- 4. FUNÇÃO PARA LIMPEZA SEMANAL
-- Função que será chamada toda segunda-feira para limpar dados antigos
-- DROP FUNCTION public.limpar_ranking_antigo();

CREATE OR REPLACE FUNCTION public.limpar_ranking_antigo()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Remove rankings de semanas anteriores (mantém apenas 2 semanas)
    DELETE FROM public.ranking_semanal 
    WHERE semana_inicio < DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week';
    
    -- Log da limpeza
    RAISE NOTICE 'Ranking antigo limpo em %', CURRENT_TIMESTAMP;
END;
$function$;

-- 5. ÍNDICES PARA PERFORMANCE
-- Índices para otimizar consultas da view e tabela

-- Índice para consultas por semana
CREATE INDEX IF NOT EXISTS idx_ranking_semana_inicio 
ON public.ranking_semanal(semana_inicio);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_ranking_id_usuario 
ON public.ranking_semanal(id_usuario);

-- Índice para ordenação por posição
CREATE INDEX IF NOT EXISTS idx_ranking_posicao 
ON public.ranking_semanal(semana_inicio, posicao);

-- Índice para consultas por pontuação
CREATE INDEX IF NOT EXISTS idx_ranking_pontuacao 
ON public.ranking_semanal(semana_inicio, pontuacao_final DESC);

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.ranking_semanal IS 'Tabela para armazenar o ranking semanal dos alunos baseado no desempenho nas metas';
COMMENT ON VIEW public.vw_desempenho_alunos IS 'View para calcular o desempenho dos alunos em tempo real baseado nas metas concluídas';
COMMENT ON FUNCTION public.atualizar_ranking_semanal() IS 'Função para atualizar o ranking semanal baseado na view de desempenho';
COMMENT ON FUNCTION public.limpar_ranking_antigo() IS 'Função para limpar rankings de semanas anteriores, mantendo apenas 2 semanas de histórico';

-- 7. EXEMPLO DE USO
-- Para testar o sistema, execute:
-- SELECT public.atualizar_ranking_semanal();
-- SELECT * FROM public.ranking_semanal ORDER BY posicao;
-- SELECT * FROM public.vw_desempenho_alunos;

-- =====================================================
-- FIM DA ESTRUTURA DE RANKING SIMPLES
-- =====================================================

