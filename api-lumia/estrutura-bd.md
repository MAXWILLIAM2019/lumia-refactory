# Estrutura do Banco de Dados - Sistema de Mentoria

> **Arquivo temporário** para documentar a estrutura atual do banco durante a refatoração para NestJS + TypeScript

## 📋 Informações Gerais

- **SGBD**: PostgreSQL
- **ORM Atual**: Sequelize
- **ORM Novo**: TypeORM
- **Arquitetura**: Templates vs Instâncias

## 🗂️ Tabelas do Sistema

### Tabelas Mestre (Templates)

#### PlanosMestre
```sql
CREATE TABLE "PlanosMestre" (
	id serial4 NOT NULL,
	nome varchar(255) NOT NULL,
	cargo varchar(255) NOT NULL,
	descricao text NOT NULL,
	duracao int4 NOT NULL,
	versao varchar(10) DEFAULT '1.0' NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "PlanosMestre_pkey" PRIMARY KEY (id)
);
```

#### SprintsMestre
```sql
CREATE TABLE "SprintsMestre" (
	id serial4 NOT NULL,
	nome varchar(255) NOT NULL,
	posicao int4 DEFAULT 0 NOT NULL,
	descricao text NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	"PlanoMestreId" int4 NOT NULL,
	"dataInicio" date NULL,
	"dataFim" date NULL,
	status public."enum_SprintsMestre_status" DEFAULT 'Pendente' NOT NULL,
	CONSTRAINT "SprintsMestre_pkey" PRIMARY KEY (id),
	CONSTRAINT "SprintsMestre_PlanoMestreId_fkey" FOREIGN KEY ("PlanoMestreId") REFERENCES "PlanosMestre"(id)
);
```

#### MetasMestre
```sql
CREATE TABLE "MetasMestre" (
	id serial4 NOT NULL,
	disciplina varchar(255) NOT NULL,
	tipo public."enum_MetasMestre_tipo" NOT NULL,
	titulo varchar(255) NOT NULL,
	comandos varchar(255) NULL,
	link varchar(255) NULL,
	relevancia int4 NOT NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	"SprintMestreId" int4 NOT NULL,
	"tempoEstudado" varchar(255) DEFAULT '00:00' NULL,
	desempenho numeric(5, 2) DEFAULT 0 NULL,
	status public."enum_MetasMestre_status" DEFAULT 'Pendente' NOT NULL,
	"totalQuestoes" int4 DEFAULT 0 NULL,
	"questoesCorretas" int4 DEFAULT 0 NULL,
	posicao int4 DEFAULT 0 NOT NULL,
	CONSTRAINT "MetasMestre_pkey" PRIMARY KEY (id),
	CONSTRAINT "MetasMestre_SprintMestreId_fkey" FOREIGN KEY ("SprintMestreId") REFERENCES "SprintsMestre"(id)
);
```

### Tabelas de Instância (Dados do Aluno)

#### Planos
```sql
CREATE TABLE "Planos" (
	id serial4 NOT NULL,
	nome varchar(255) NOT NULL,
	cargo varchar(255) NOT NULL,
	descricao text NOT NULL,
	duracao int4 NOT NULL,
	plano_mestre_id int4 NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "Planos_pkey" PRIMARY KEY (id),
	CONSTRAINT "Planos_plano_mestre_id_fkey" FOREIGN KEY (plano_mestre_id) REFERENCES "PlanosMestre"(id)
);
```

#### Sprints
```sql
CREATE TABLE "Sprints" (
	id serial4 NOT NULL,
	nome varchar(255) NOT NULL,
	"dataInicio" date NOT NULL,
	"dataFim" date NOT NULL,
	status public."enum_Sprints_status" DEFAULT 'Pendente' NOT NULL,
	posicao int4 DEFAULT 0 NOT NULL,
	sprint_mestre_id int4 NULL,
	"PlanoId" int4 NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "Sprints_pkey" PRIMARY KEY (id),
	CONSTRAINT "Sprints_PlanoId_fkey" FOREIGN KEY ("PlanoId") REFERENCES "Plano"(id),
	CONSTRAINT "Sprints_sprint_mestre_id_fkey" FOREIGN KEY (sprint_mestre_id) REFERENCES sprint_mestres(id)
);
```

#### Metas
```sql
CREATE TABLE "Meta" (
	id serial4 NOT NULL,
	disciplina varchar(255) NOT NULL,
	tipo public."enum_Meta_tipo" NOT NULL,
	titulo varchar(255) NOT NULL,
	comandos varchar(255) NULL,
	link varchar(255) NULL,
	relevancia int4 NOT NULL,
	"tempoEstudado" varchar(255) DEFAULT '00:00' NULL,
	desempenho numeric(5, 2) DEFAULT 0 NULL,
	status public."enum_Meta_status" DEFAULT 'Pendente' NULL,
	"totalQuestoes" int4 DEFAULT 0 NULL,
	"questoesCorretas" int4 DEFAULT 0 NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	"SprintId" int4 NULL,
	meta_mestre_id int4 NULL,
	posicao int4 DEFAULT 0 NOT NULL,
	CONSTRAINT "Meta_pkey" PRIMARY KEY (id),
	CONSTRAINT "Meta_meta_mestre_fkey" FOREIGN KEY (meta_mestre_id) REFERENCES "MetasMestre"(id)
);
```

### Tabelas de Sistema

#### Usuario
```sql
CREATE TABLE usuario (
	idusuario serial4 NOT NULL,
	login varchar(120) NOT NULL,
	senha varchar(255) NOT NULL,
	situacao bool DEFAULT true NOT NULL,
	nome varchar(120) NULL,
	cpf varchar(14) NULL,
	grupo int4 NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT usuario_pkey PRIMARY KEY (idusuario),
	CONSTRAINT usuario_grupo_fkey FOREIGN KEY (grupo) REFERENCES grupo_usuario(idgrupo)
);
```

#### Grupo Usuario
```sql
CREATE TABLE grupo_usuario (
	idgrupo serial4 NOT NULL,
	nome varchar(50) NOT NULL,
	descricao varchar(255) NULL,
	CONSTRAINT grupo_usuario_pkey PRIMARY KEY (idgrupo)
);
```

#### Aluno Info
```sql
CREATE TABLE aluno_info (
	idalunoinfo serial4 NOT NULL,
	idusuario int4 NOT NULL,
	email varchar(120) NOT NULL,
	cpf varchar(14) NULL,
	data_nascimento date NULL,
	data_criacao timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	telefone varchar(20) NULL,
	status_cadastro public."enum_aluno_info_status_cadastro" DEFAULT 'PRE_CADASTRO' NOT NULL,
	status_pagamento public."enum_aluno_info_status_pagamento" DEFAULT 'PENDENTE' NOT NULL,
	cep varchar(9) NULL,
	asaas_external_reference varchar(100) NULL,
	biografia text NULL,
	formacao varchar(50) NULL,
	is_trabalhando bool DEFAULT false NOT NULL,
	is_aceita_termos bool DEFAULT false NOT NULL,
	notif_novidades_plataforma bool DEFAULT true NOT NULL,
	notif_mensagens_mentor bool DEFAULT true NOT NULL,
	notif_novo_material bool DEFAULT true NOT NULL,
	notif_atividades_simulados bool DEFAULT false NOT NULL,
	notif_mentorias bool DEFAULT false NOT NULL,
	CONSTRAINT aluno_info_pkey PRIMARY KEY (idalunoinfo)
);
```

#### Aluno Planos (Associação)
```sql
CREATE TABLE "AlunoPlanos" (
	"dataInicio" timestamptz NOT NULL,
	"dataPrevisaoTermino" timestamptz NULL,
	"dataConclusao" timestamptz NULL,
	progresso int4 DEFAULT 0 NOT NULL,
	status public."enum_AlunoPlanos_status" DEFAULT 'não iniciado' NOT NULL,
	observacoes text NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	idusuario int4 NOT NULL,
	"PlanoId" int4 NOT NULL,
	ativo bool NULL,
	CONSTRAINT "AlunoPlanos_pkey" PRIMARY KEY (idusuario, "PlanoId")
);
```

### Tabelas Auxiliares

#### Disciplinas
```sql
CREATE TABLE "Disciplinas" (
	id serial4 NOT NULL,
	nome varchar(255) NOT NULL,
	descricao text NULL,
	versao int4 DEFAULT 1 NOT NULL,
	ativa bool DEFAULT true NOT NULL,
	disciplina_origem_id int4 NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "Disciplinas_pkey" PRIMARY KEY (id)
);
```

#### Ranking Semanal
```sql
CREATE TABLE ranking_semanal (
	id_ranking serial4 NOT NULL,
	id_usuario int4 NOT NULL,
	nome_usuario varchar(100) NOT NULL,
	email_usuario varchar(120) NOT NULL,
	total_questoes int4 DEFAULT 0 NOT NULL,
	total_acertos int4 DEFAULT 0 NOT NULL,
	percentual_acerto numeric(5, 2) DEFAULT 0 NOT NULL,
	pontuacao_final numeric(8, 2) DEFAULT 0 NOT NULL,
	posicao int4 NULL,
	semana_inicio date NOT NULL,
	semana_fim date NOT NULL,
	ultima_atualizacao timestamptz NOT NULL,
	CONSTRAINT ranking_semanal_pkey PRIMARY KEY (id_ranking)
);
```

## 🔗 Relacionamentos

### Templates → Instâncias
- PlanoMestre 1:N Plano
- SprintMestre 1:N Sprint
- MetaMestre 1:N Meta

### Associações
- Usuario N:M Plano (via AlunoPlanos)
- Plano 1:N Sprint
- Sprint 1:N Meta
- Usuario 1:1 AlunoInfo
- Usuario 1:1 GrupoUsuario

## 📊 Enums Identificados

### Status de Planos
- `'não iniciado'`, `'em andamento'`, `'concluído'`, `'cancelado'`

### Status de Metas
- `'Pendente'`, `'Em Andamento'`, `'Concluída'`

### Tipos de Metas
- `'teoria'`, `'questoes'`, `'revisao'`, `'reforco'`

### Status de Cadastro
- `'PRE_CADASTRO'`, `'PAGAMENTO_PENDENTE'`, `'PAGAMENTO_CONFIRMADO'`, `'PLANO_ATRIBUIDO'`, `'ATIVO'`, `'COMPLETO'`, `'PENDENTE_VALIDACAO'`

## 📝 Notas de Migração

- [x] Mapear todas as tabelas atuais
- [ ] Definir entidades TypeORM
- [ ] Configurar relacionamentos
- [ ] Migrar dados existentes
- [ ] Validar integridade

---

## 📋 Estrutura Atual do Backend (Sequelize)

### 🏗️ Organização Atual:
```
backend/
├── src/
│   ├── controllers/          # Controllers (authController.js, etc.)
│   ├── services/            # Services (authService.js, etc.)
│   ├── models/              # Modelos Sequelize
│   ├── routes/              # Rotas da API
│   ├── middleware/          # Middlewares (auth.js, etc.)
│   ├── db/                  # Configuração do banco
│   └── index.js             # Arquivo principal
```

### 🔄 Rotas Identificadas:
- ✅ `/api/auth` - Autenticação (register, login, me, impersonate)
- ✅ `/api/alunos` - Gestão de alunos
- ✅ `/api/planos` - Gestão de planos
- ✅ `/api/planos-mestre` - Templates de planos
- ✅ `/api/sprints` - Gestão de sprints
- ✅ `/api/disciplinas` - Disciplinas
- ✅ `/api/aluno-plano` - Associação aluno-plano
- ✅ `/api/sprint-atual` - Sprint atual do aluno
- ✅ `/api/ranking` - Sistema de ranking

### 📊 Funcionalidades Atuais:
- ✅ **Autenticação JWT** com middleware
- ✅ **Sistema de grupos** (aluno, administrador)
- ✅ **Impersonação** para administradores
- ✅ **Swagger** documentação
- ✅ **Sistema de ranking** semanal
- ✅ **Arquitetura de templates** (mestre → instância)

### 🎯 Controllers Identificados:
- ✅ **authController** - Autenticação (register, login, me, impersonate)
- ✅ **alunoController** - CRUD de alunos, senhas, planos, sprints, notificações
- ✅ **planoController** - Listagem de planos (templates)
- ✅ **planoMestreController** - Gestão de templates de planos
- ✅ **sprintController** - Gestão de sprints (templates e instâncias)
- ✅ **rankingController** - Sistema de ranking semanal

### 🔧 Funcionalidades Específicas:
- ✅ **Gestão de senhas** (definir, gerar, alterar)
- ✅ **Configurações de notificação** por aluno
- ✅ **Busca de planos e sprints** por aluno
- ✅ **Criação de instâncias** a partir de templates
- ✅ **Sistema de posicionamento** para sprints e metas
- ✅ **Validações de telefone** e dados pessoais

---

**Status**: ✅ Estrutura atual mapeada - Migração para NestJS + TypeORM em andamento
