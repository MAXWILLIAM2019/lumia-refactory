import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDatabaseSchema1759784069711 implements MigrationInterface {
    name = 'InitialDatabaseSchema1759784069711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se o banco já tem dados (tabelas já existem)
        const tablesExist = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'usuario'
        `);

        if (tablesExist[0].count > 0) {
            console.log('Banco já possui estrutura. Pulando criação inicial.');
            return;
        }

        // Criar enum para status de cadastro
        await queryRunner.query(`
            CREATE TYPE "StatusCadastro" AS ENUM('PRE_CADASTRO', 'APROVADO', 'REPROVADO', 'CANCELADO')
        `);

        // Criar enum para status de pagamento
        await queryRunner.query(`
            CREATE TYPE "StatusPagamento" AS ENUM('PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO')
        `);

        // Criar tabela grupo_usuario
        await queryRunner.query(`
            CREATE TABLE "grupo_usuario" (
                "idgrupo" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "descricao" character varying,
                CONSTRAINT "PK_grupo_usuario" PRIMARY KEY ("idgrupo")
            )
        `);

        // Criar tabela usuario
        await queryRunner.query(`
            CREATE TABLE "usuario" (
                "idusuario" SERIAL NOT NULL,
                "login" character varying(120) NOT NULL,
                "senha" character varying(255),
                "situacao" boolean NOT NULL DEFAULT true,
                "nome" character varying(120),
                "cpf" character varying(14),
                "grupo" integer NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_usuario" PRIMARY KEY ("idusuario"),
                CONSTRAINT "UQ_usuario_login" UNIQUE ("login"),
                CONSTRAINT "UQ_usuario_cpf" UNIQUE ("cpf")
            )
        `);

        // Criar tabela administrador_info
        await queryRunner.query(`
            CREATE TABLE "administrador_info" (
                "id" SERIAL NOT NULL,
                "id_usuario" integer NOT NULL,
                "nome" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "cpf" character varying(11),
                "telefone" character varying(15),
                "departamento" character varying(100),
                "cargo" character varying(100),
                "data_criacao" TIMESTAMP WITH TIME ZONE,
                "ativo" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_administrador_info" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_administrador_info_id_usuario" UNIQUE ("id_usuario"),
                CONSTRAINT "UQ_administrador_info_email" UNIQUE ("email")
            )
        `);

        // Criar tabela aluno_info
        await queryRunner.query(`
            CREATE TABLE "aluno_info" (
                "idalunoinfo" SERIAL NOT NULL,
                "idusuario" integer NOT NULL,
                "email" character varying(120) NOT NULL,
                "cpf" character varying(14),
                "data_nascimento" date,
                "data_criacao" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "telefone" character varying(20),
                "status_cadastro" "StatusCadastro" NOT NULL DEFAULT 'PRE_CADASTRO',
                "status_pagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
                "cep" character varying(9),
                "biografia" text,
                "formacao" character varying(50),
                "is_trabalhando" boolean NOT NULL DEFAULT false,
                "is_aceita_termos" boolean NOT NULL DEFAULT false,
                "notif_novidades_plataforma" boolean NOT NULL DEFAULT true,
                "notif_mensagens_mentor" boolean NOT NULL DEFAULT true,
                "notif_novo_material" boolean NOT NULL DEFAULT true,
                "notif_atividades_simulados" boolean NOT NULL DEFAULT false,
                "notif_mentorias" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_aluno_info" PRIMARY KEY ("idalunoinfo"),
                CONSTRAINT "UQ_aluno_info_idusuario" UNIQUE ("idusuario")
            )
        `);

        // Criar tabela PlanosMestre
        await queryRunner.query(`
            CREATE TABLE "PlanosMestre" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "cargo" character varying NOT NULL,
                "descricao" text NOT NULL,
                "duracao" integer NOT NULL,
                "versao" character varying NOT NULL DEFAULT '1.0',
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_PlanosMestre" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela Disciplinas
        await queryRunner.query(`
            CREATE TABLE "Disciplinas" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "descricao" text,
                "disciplina_origem_id" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_Disciplinas" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela Assuntos
        await queryRunner.query(`
            CREATE TABLE "Assuntos" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "descricao" text,
                "disciplinaId" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_Assuntos" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela SprintsMestre
        await queryRunner.query(`
            CREATE TABLE "SprintsMestre" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "posicao" integer NOT NULL,
                "descricao" text,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "plano_mestre_id" integer NOT NULL,
                "data_inicio" date,
                "data_fim" date,
                "status" character varying NOT NULL DEFAULT 'Pendente',
                CONSTRAINT "PK_SprintsMestre" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela MetasMestre
        await queryRunner.query(`
            CREATE TABLE "MetasMestre" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "descricao" text,
                "tipo" character varying NOT NULL,
                "valor_alvo" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "SprintMestreId" integer,
                CONSTRAINT "PK_MetasMestre" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela Plano
        await queryRunner.query(`
            CREATE TABLE "Plano" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "dataInicio" date NOT NULL,
                "dataConclusaoEsperada" date NOT NULL,
                "observacoes" text,
                "planoMestreId" integer NOT NULL,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_Plano" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela AlunoPlanos
        await queryRunner.query(`
            CREATE TABLE "AlunoPlanos" (
                "id" SERIAL NOT NULL,
                "alunoId" integer NOT NULL,
                "planoId" integer NOT NULL,
                "dataAtribuicao" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_AlunoPlanos" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela Sprints
        await queryRunner.query(`
            CREATE TABLE "Sprints" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "dataInicio" date NOT NULL,
                "dataConclusaoEsperada" date NOT NULL,
                "observacoes" text,
                "planoId" integer NOT NULL,
                "sprintMestreId" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_Sprints" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela Meta
        await queryRunner.query(`
            CREATE TABLE "Meta" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "valorAtual" integer NOT NULL DEFAULT 0,
                "valorAlvo" integer NOT NULL,
                "dataConclusao" date,
                "sprintId" integer NOT NULL,
                "meta_mestre" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_Meta" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela PlanoDisciplina
        await queryRunner.query(`
            CREATE TABLE "PlanoDisciplina" (
                "id" SERIAL NOT NULL,
                "planoId" integer NOT NULL,
                "disciplinaId" integer NOT NULL,
                "ordem" integer,
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_PlanoDisciplina" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela SprintAtual
        await queryRunner.query(`
            CREATE TABLE "SprintAtual" (
                "id" SERIAL NOT NULL,
                "alunoId" integer NOT NULL,
                "sprintId" integer NOT NULL,
                "dataInicio" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ativo" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_SprintAtual" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_SprintAtual_alunoId" UNIQUE ("alunoId")
            )
        `);

        // Criar tabela ranking_semanal
        await queryRunner.query(`
            CREATE TABLE "ranking_semanal" (
                "id" SERIAL NOT NULL,
                "id_usuario" integer NOT NULL,
                "semana_inicio" date NOT NULL,
                "pontuacao_total" integer NOT NULL DEFAULT 0,
                "posicao" integer,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ranking_semanal" PRIMARY KEY ("id")
            )
        `);

        // Criar view vw_desempenho_alunos (se existir)
        await queryRunner.query(`
            CREATE OR REPLACE VIEW "vw_desempenho_alunos" AS
            SELECT
                u.idusuario,
                u.nome,
                u.login,
                COUNT(m.id) as metas_concluidas,
                COUNT(m.id) FILTER (WHERE m."dataConclusao" IS NOT NULL) as metas_no_prazo,
                ROUND(
                    (COUNT(m.id) FILTER (WHERE m."dataConclusao" IS NOT NULL)::decimal /
                     NULLIF(COUNT(m.id), 0)) * 100, 2
                ) as percentual_prazo
            FROM usuario u
            LEFT JOIN "SprintAtual" sa ON sa."alunoId" = u.idusuario AND sa.ativo = true
            LEFT JOIN "Meta" m ON m."sprintId" = sa."sprintId" AND m.ativo = true
            WHERE u.grupo = 1
            GROUP BY u.idusuario, u.nome, u.login
        `);

        // Adicionar foreign keys
        await queryRunner.query(`
            ALTER TABLE "usuario" ADD CONSTRAINT "usuario_grupo_fkey" FOREIGN KEY ("grupo") REFERENCES "grupo_usuario"("idgrupo") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "administrador_info" ADD CONSTRAINT "fk_administrador_info_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("idusuario") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "aluno_info" ADD CONSTRAINT "fk_aluno_info_usuario" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Disciplinas" ADD CONSTRAINT "Disciplinas_disciplina_origem_id_fkey" FOREIGN KEY ("disciplina_origem_id") REFERENCES "Disciplinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Assuntos" ADD CONSTRAINT "Assuntos_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "SprintsMestre" ADD CONSTRAINT "SprintsMestre_PlanoMestreId_fkey" FOREIGN KEY ("plano_mestre_id") REFERENCES "PlanosMestre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "MetasMestre" ADD CONSTRAINT "MetasMestre_SprintMestreId_fkey" FOREIGN KEY ("SprintMestreId") REFERENCES "SprintsMestre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Plano" ADD CONSTRAINT "Plano_planoMestreId_fkey" FOREIGN KEY ("planoMestreId") REFERENCES "PlanosMestre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "AlunoPlanos" ADD CONSTRAINT "AlunoPlanos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "AlunoPlanos" ADD CONSTRAINT "AlunoPlanos_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Sprints" ADD CONSTRAINT "Sprints_PlanoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Sprints" ADD CONSTRAINT "Sprints_sprintMestreId_fkey" FOREIGN KEY ("sprintMestreId") REFERENCES "SprintsMestre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Meta" ADD CONSTRAINT "Meta_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprints"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "Meta" ADD CONSTRAINT "Meta_meta_mestre_fkey" FOREIGN KEY ("meta_mestre") REFERENCES "MetasMestre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "PlanoDisciplina" ADD CONSTRAINT "PlanoDisciplina_PlanoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "PlanoDisciplina" ADD CONSTRAINT "PlanoDisciplina_DisciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "SprintAtual" ADD CONSTRAINT "SprintAtual_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "SprintAtual" ADD CONSTRAINT "SprintAtual_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprints"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "ranking_semanal" ADD CONSTRAINT "ranking_semanal_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Inserir dados iniciais
        await queryRunner.query(`
            INSERT INTO "grupo_usuario" ("nome", "descricao") VALUES
            ('aluno', 'Usuário aluno do sistema'),
            ('administrador', 'Usuário administrador do sistema')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys
        await queryRunner.query(`ALTER TABLE "ranking_semanal" DROP CONSTRAINT "ranking_semanal_id_usuario_fkey"`);
        await queryRunner.query(`ALTER TABLE "SprintAtual" DROP CONSTRAINT "SprintAtual_sprintId_fkey"`);
        await queryRunner.query(`ALTER TABLE "SprintAtual" DROP CONSTRAINT "SprintAtual_alunoId_fkey"`);
        await queryRunner.query(`ALTER TABLE "PlanoDisciplina" DROP CONSTRAINT "PlanoDisciplina_DisciplinaId_fkey"`);
        await queryRunner.query(`ALTER TABLE "PlanoDisciplina" DROP CONSTRAINT "PlanoDisciplina_PlanoId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Meta" DROP CONSTRAINT "Meta_meta_mestre_fkey"`);
        await queryRunner.query(`ALTER TABLE "Meta" DROP CONSTRAINT "Meta_sprintId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Sprints" DROP CONSTRAINT "Sprints_sprintMestreId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Sprints" DROP CONSTRAINT "Sprints_PlanoId_fkey"`);
        await queryRunner.query(`ALTER TABLE "AlunoPlanos" DROP CONSTRAINT "AlunoPlanos_planoId_fkey"`);
        await queryRunner.query(`ALTER TABLE "AlunoPlanos" DROP CONSTRAINT "AlunoPlanos_alunoId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Plano" DROP CONSTRAINT "Plano_planoMestreId_fkey"`);
        await queryRunner.query(`ALTER TABLE "MetasMestre" DROP CONSTRAINT "MetasMestre_SprintMestreId_fkey"`);
        await queryRunner.query(`ALTER TABLE "SprintsMestre" DROP CONSTRAINT "SprintsMestre_PlanoMestreId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Assuntos" DROP CONSTRAINT "Assuntos_disciplinaId_fkey"`);
        await queryRunner.query(`ALTER TABLE "Disciplinas" DROP CONSTRAINT "Disciplinas_disciplina_origem_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "aluno_info" DROP CONSTRAINT "fk_aluno_info_usuario"`);
        await queryRunner.query(`ALTER TABLE "administrador_info" DROP CONSTRAINT "fk_administrador_info_usuario"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "usuario_grupo_fkey"`);

        // Remover view
        await queryRunner.query(`DROP VIEW IF EXISTS "vw_desempenho_alunos"`);

        // Remover tabelas
        await queryRunner.query(`DROP TABLE "ranking_semanal"`);
        await queryRunner.query(`DROP TABLE "SprintAtual"`);
        await queryRunner.query(`DROP TABLE "PlanoDisciplina"`);
        await queryRunner.query(`DROP TABLE "Meta"`);
        await queryRunner.query(`DROP TABLE "Sprints"`);
        await queryRunner.query(`DROP TABLE "AlunoPlanos"`);
        await queryRunner.query(`DROP TABLE "Plano"`);
        await queryRunner.query(`DROP TABLE "MetasMestre"`);
        await queryRunner.query(`DROP TABLE "SprintsMestre"`);
        await queryRunner.query(`DROP TABLE "Assuntos"`);
        await queryRunner.query(`DROP TABLE "Disciplinas"`);
        await queryRunner.query(`DROP TABLE "PlanosMestre"`);
        await queryRunner.query(`DROP TABLE "aluno_info"`);
        await queryRunner.query(`DROP TABLE "administrador_info"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TABLE "grupo_usuario"`);

        // Remover enums
        await queryRunner.query(`DROP TYPE "StatusPagamento"`);
        await queryRunner.query(`DROP TYPE "StatusCadastro"`);
    }

}
