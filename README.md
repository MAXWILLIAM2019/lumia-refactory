# Sistema de Mentoria - API Backend

API REST completa para gerenciamento de mentorias baseado em arquitetura de templates vs instâncias, desenvolvida com NestJS + TypeORM. Permite que administradores criem planos mestre reutilizáveis que podem ser instanciados para múltiplos alunos, com acompanhamento avançado de progresso e sistema de ranking semanal.

## Arquitetura do Sistema

### Conceito: Templates vs Instâncias

O sistema trabalha com duas camadas distintas:

#### Templates (Modelos Mestre)
- **PlanoMestre**: Templates de planos criados por administradores
- **SprintMestre**: Templates de sprints dentro dos planos mestre
- **MetaMestre**: Templates de metas dentro das sprints mestre

#### Instâncias (Dados do Aluno)
- **Plano**: Instância personalizada de um PlanoMestre para um aluno específico
- **Sprint**: Instância de SprintMestre com datas e progresso real
- **Meta**: Instância de MetaMestre com dados de execução e performance

### Benefícios da Arquitetura

- **Reutilização**: Um template pode gerar múltiplas instâncias
- **Consistência**: Todos os alunos recebem a mesma estrutura base
- **Flexibilidade**: Instâncias podem ser personalizadas individualmente
- **Manutenção**: Atualizações nos templates não afetam instâncias existentes
- **Escalabilidade**: Suporte a milhares de alunos com performance otimizada

## Fluxo de Trabalho

### 1. Administrador - Criação de Templates

```
Admin cria PlanoMestre → Admin adiciona SprintsMestre → Admin define MetasMestre → Template pronto para uso
```

### 2. Aluno - Recebimento de Instância

```
Admin associa aluno ao PlanoMestre → Sistema cria instâncias automáticas → Aluno recebe Plano personalizado → Sprints com datas calculadas → Metas prontas para execução
```

## Estrutura do Banco de Dados

### Tabelas Mestre (Templates)

#### PlanosMestre
```sql
CREATE TABLE public."PlanosMestre" (
  id serial4 PRIMARY KEY,
  nome varchar(255) NOT NULL,
  cargo varchar(255) NOT NULL,
  descricao text NOT NULL,
  duracao int4 NOT NULL,
  versao varchar(10) DEFAULT '1.0',
  ativo boolean DEFAULT true,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
```

#### SprintsMestre  
```sql
CREATE TABLE public."SprintsMestre" (
  id serial4 PRIMARY KEY,
  nome varchar(255) NOT NULL,
  "dataInicio" date NULL,                    -- Opcional para templates
  "dataFim" date NULL,                       -- Opcional para templates
  status enum DEFAULT 'Pendente',           -- Compatibilidade frontend
  posicao int4 DEFAULT 0,
  descricao text NULL,                       -- Específico para templates
  "PlanoMestreId" int4 NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
```

#### MetasMestre
```sql
CREATE TABLE public."MetasMestre" (
  id serial4 PRIMARY KEY,
  disciplina varchar(255) NOT NULL,
  tipo enum('teoria','questoes','revisao','reforco') NOT NULL,
  titulo varchar(255) NOT NULL,
  comandos varchar(255) NULL,
  link varchar(255) NULL,
  relevancia int4 CHECK (relevancia >= 1 AND relevancia <= 5),
  "tempoEstudado" varchar(255) DEFAULT '00:00',
  desempenho numeric(5,2) DEFAULT 0,
  status enum DEFAULT 'Pendente',
  "totalQuestoes" int4 DEFAULT 0,
  "questoesCorretas" int4 DEFAULT 0,
  "SprintMestreId" int4 NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
```

### Tabelas de Instância (Dados do Aluno)

#### Planos, Sprints, Meta
- Estrutura **idêntica** às tabelas mestre
- Campos adicionais: referência ao template de origem
- Datas e progresso **obrigatórios** para instâncias

## APIs Principais

### Templates (Administrador)

#### Planos Mestre
```http
GET    /planos          # Listar templates
POST   /planos          # Criar template
GET    /planos/:id      # Buscar template específico
PUT    /planos/:id      # Atualizar template
DELETE /planos/:id      # Excluir template (soft delete)
```

#### Sprints Mestre  
```http
GET    /sprints         # Listar templates de sprint
POST   /sprints         # Criar template de sprint
GET    /sprints/:id     # Buscar template específico
PUT    /sprints/:id     # Atualizar template
DELETE /sprints/:id     # Excluir template
PUT    /sprints/reordenar # Reordenar sprints
```

#### Metas Mestre
```http
PUT    /sprints/metas/:id # Atualizar meta específica
```

### Instâncias (Sistema)

#### Criação Automática de Instâncias
```http
POST /planos-mestre/criar-instancia
{
  "planoMestreId": 1,
  "idUsuario": 123,
  "dataInicio": "2024-01-01",
  "status": "não iniciado",
  "observacoes": "Plano personalizado para João"
}
```

**Processo automático:**
1. ✅ Cria instância do Plano baseada no PlanoMestre
2. ✅ Cria instâncias de todas as Sprints do template  
3. ✅ Calcula datas automaticamente baseado na duração
4. ✅ Cria instâncias de todas as Metas de cada Sprint
5. ✅ Associa o plano ao aluno via tabela `AlunoPlano`

## Tecnologias

### Backend (API)
- **Node.js 18+** + **NestJS Framework**
- **TypeORM** com **PostgreSQL**
- **JWT** para autenticação
- **bcrypt** para criptografia
- **Swagger/OpenAPI** para documentação
- **Docker** para containerização
- **Jest** para testes
- **ESLint + Prettier** para qualidade de código

### Arquitetura
- **Clean Architecture** com separação de camadas
- **Domain-Driven Design (DDD)** principles
- **SOLID** principles aplicados
- **Repository Pattern** para acesso a dados
- **CQRS** pattern em algumas operações

## Instalação e Execução

### Pré-requisitos
- **Node.js 18+**
- **PostgreSQL 13+**
- **npm** ou **yarn**
- **Docker** (opcional, para containerização)

### Setup Completo

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd lumia-refactory
   ```

2. **Instale as dependências**
   ```bash
   cd api-lumia
   npm install
   ```

3. **Configure o banco PostgreSQL**
   ```bash
   # Crie um banco PostgreSQL
   createdb lumia_mentoria
   ```

4. **Configure variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite as configurações no arquivo .env
   ```

5. **Execute as migrações do banco**
   ```bash
   # Executa migrações TypeORM
   npm run migration:run
   ```

6. **Inicie o servidor**
   ```bash
   # Modo desenvolvimento
   npm run start:dev

   # Ou modo produção
   npm run build
   npm run start:prod
   ```

### Estrutura de .env

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lumia_mentoria
DB_USER=seu_usuario
DB_PASS=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt_super_segura_muito_longa
JWT_EXPIRES_IN=24h

# Swagger
SWAGGER_TITLE=Sistema de Mentoria API
SWAGGER_DESCRIPTION=API para gerenciamento de mentorias
SWAGGER_VERSION=1.0
```

## Fluxo de Uso Completo

### Para Administradores

#### 1. Criar Template de Plano
```javascript
// Frontend: Cadastro de Plano Mestre
const novoPlano = {
  nome: "Preparatório ENEM 2024",
  cargo: "Vestibulando",  
  descricao: "Plano completo para preparação ENEM",
  duracao: 12 // meses
};

// API automaticamente cria na tabela PlanosMestre
```

#### 2. Criar Template de Sprint
```javascript
// Frontend: Cadastro de Sprint Mestre
const novaSprint = {
  nome: "Sprint 1 - Matemática Básica",
  dataInicio: "2024-01-01", // Opcional para template
  dataFim: "2024-01-15",     // Opcional para template
  planoId: 1,                // ID do PlanoMestre
  metas: [
    {
      disciplina: "Matemática",
      tipo: "teoria",
      titulo: "Álgebra Linear",
      relevancia: 5,
      tempoEstudado: "02:00",
      totalQuestoes: 50
    }
  ]
};

// API cria SprintMestre + MetasMestre automaticamente
```

#### 3. Associar Aluno ao Template
```javascript
// Frontend: Associação Aluno → Plano Mestre
const associacao = {
  planoMestreId: 1,
  idUsuario: 123,
  dataInicio: "2024-01-01"
};

// API cria TODAS as instâncias automaticamente:
// - 1 Plano (instância)
// - N Sprints (instâncias com datas calculadas)  
// - M Metas (instâncias prontas para uso)
```

### Para Alunos

#### 1. Acessar Plano Personalizado
- ✅ Recebe plano já instanciado
- ✅ Sprints com datas calculadas
- ✅ Metas prontas para execução
- ✅ Acompanhamento de progresso

#### 2. Executar Sprints e Metas
- ✅ Marcar metas como concluídas
- ✅ Registrar tempo estudado
- ✅ Atualizar desempenho
- ✅ Visualizar progresso geral

## Sistema de Autenticação

### Arquitetura Centralizada

#### Tabela Principal - `usuario`
```sql
CREATE TABLE usuario (
  idusuario serial PRIMARY KEY,
  nome varchar(255) NOT NULL,
  cpf varchar(14) UNIQUE,
  login varchar(50) UNIQUE NOT NULL,
  senha varchar(255) NOT NULL,
  grupo int4 REFERENCES grupo_usuario(idgrupo),
  situacao boolean DEFAULT true
);
```

#### Tabelas Complementares
- **`aluno_info`**: Dados específicos de alunos
- **`administrador_info`**: Dados específicos de administradores  
- **`grupo_usuario`**: Definição de perfis/roles

### Endpoints de Autenticação

```http
POST /auth/register    # Registro de usuário
POST /auth/login       # Login unificado  
POST /auth/verify      # Validação de token
```

## Casos de Uso Práticos

### Cenário 1: Preparatório para Concurso

**Admin cria template:**
- PlanoMestre: "Preparatório TRT 2024" 
- 20 SprintsMestre (uma por semana)
- 200+ MetasMestre (teoria + questões)

**Sistema instancia para 1000 alunos:**
- 1000 Planos personalizados
- 20.000 Sprints (20 x 1000)  
- 200.000+ Metas executáveis

### Cenário 2: Curso de Programação

**Admin cria template:**
- PlanoMestre: "Full Stack Developer"
- 16 SprintsMestre (4 meses)
- MetasMestre com projetos práticos

**Alunos recebem:**
- Cronograma personalizado
- Projetos progressivos
- Acompanhamento individual

## Padrões e Boas Práticas

### Compatibilidade Frontend
- ✅ **Zero Breaking Changes**: Frontend usa mesmas rotas
- ✅ **Transparência**: Admin não percebe diferença na interface
- ✅ **Simetria**: Templates e instâncias têm estruturas idênticas

### Performance
- ✅ **Lazy Loading**: Instâncias criadas sob demanda
- ✅ **Índices Otimizados**: Consultas rápidas mesmo com milhares de registros
- ✅ **Soft Delete**: Preserva integridade referencial

### Escalabilidade  
- ✅ **Templates Reutilizáveis**: Um template → Infinitos alunos
- ✅ **Versioning**: Controle de versões dos templates
- ✅ **Isolamento**: Instâncias independentes

## Comandos Úteis

### Desenvolvimento
```bash
# Servidor
npm run start:dev        # Inicia em modo desenvolvimento (com hot reload)
npm run start:debug      # Inicia em modo debug
npm run start:prod       # Inicia em modo produção
npm run build           # Build para produção

# Banco de Dados
npm run migration:run   # Executa migrações pendentes
npm run migration:generate # Gera nova migração baseada em mudanças
npm run migration:create # Cria arquivo de migração vazio
npm run migration:revert # Reverte última migração

# Testes
npm run test            # Executa testes unitários
npm run test:cov        # Executa testes com relatório de cobertura
npm run test:e2e        # Executa testes end-to-end
npm run test:watch      # Executa testes em modo watch

# Qualidade de Código
npm run lint            # Executa ESLint
npm run lint:fix        # Executa ESLint e corrige problemas automáticos
npm run format          # Executa Prettier para formatação
```

### Docker (Opcional)
```bash
# Build da imagem
docker build -t lumia-mentoria-api .

# Executa container
docker run -p 3000:3000 lumia-mentoria-api

# Com Docker Compose
docker-compose up -d
```

## Documentação Adicional

### Estrutura de Arquivos
```
lumia-refactory/
├── api-lumia/                          # Backend API (NestJS)
│   ├── src/
│   │   ├── modules/                    # Módulos do NestJS
│   │   │   ├── auth/                   # Autenticação JWT
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── guards/
│   │   │   │   ├── strategies/
│   │   │   │   └── dto/
│   │   │   ├── usuarios/               # Gestão de usuários
│   │   │   ├── alunos/                 # Funcionalidades de alunos
│   │   │   ├── planos/                 # Templates e instâncias
│   │   │   ├── sprints/                # Gestão de sprints
│   │   │   ├── metas/                  # Gestão de metas
│   │   │   ├── disciplinas/            # Disciplinas acadêmicas
│   │   │   ├── ranking/                # Sistema de ranking
│   │   │   ├── sprint-atual/           # Sprint atual do aluno
│   │   │   ├── aluno-plano/            # Associação aluno-plano
│   │   │   └── database/               # Configuração do banco
│   │   ├── common/                     # Código compartilhado
│   │   │   ├── decorators/             # Decorators customizados
│   │   │   ├── guards/                 # Guards de segurança
│   │   │   ├── interceptors/           # Interceptors
│   │   │   ├── pipes/                  # Pipes de validação
│   │   │   ├── enums/                  # Enums do sistema
│   │   │   └── filters/                # Exception filters
│   │   ├── entities/                   # Entidades TypeORM
│   │   ├── dto/                        # Data Transfer Objects
│   │   └── utils/                      # Utilitários
│   ├── database/
│   │   └── migrations/                 # Migrações TypeORM
│   ├── test/                          # Testes
│   ├── docs/                          # Documentação adicional
│   ├── .eslintrc.js                   # Config ESLint
│   ├── .prettierrc                    # Config Prettier
│   ├── jest.config.js                 # Config Jest
│   ├── tsconfig.json                  # Config TypeScript
│   ├── package.json                   # Dependências
│   └── nest-cli.json                  # Config NestJS CLI
├── .gitignore                         # Git ignore
└── README.md                          # Esta documentação
```

### Relacionamentos Principais
```sql
-- Templates
PlanoMestre 1:N SprintMestre 1:N MetaMestre

-- Instâncias  
Plano 1:N Sprint 1:N Meta

-- Referências Template → Instância
PlanoMestre 1:N Plano (via plano_mestre_id)
SprintMestre 1:N Sprint (via sprint_mestre_id) 
MetaMestre 1:N Meta (via meta_mestre_id)

-- Associação Aluno ← → Plano
Usuario N:M Plano (via AlunoPlano)
```

##  Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)  
5. Abra um Pull Request

##  Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

##  Status do Projeto

### ✅ Implementado (Backend API)
- **Arquitetura de Templates vs Instâncias completa**
- **Sistema de autenticação JWT com guards baseados em roles**
- **APIs RESTful com NestJS + TypeORM**
- **Criação automática de instâncias a partir de templates**
- **Sistema de ranking semanal automático**
- **Controle de acesso baseado em roles (admin/aluno)**
- **Documentação Swagger/OpenAPI automática**
- **Migrações TypeORM para controle de schema**
- **Validação de dados com class-validator**
- **Testes unitários e e2e com Jest**
- **Princípios SOLID aplicados na arquitetura**
- **Clean Architecture com separação de camadas**

###  Em Desenvolvimento
- **Dashboard administrativo avançado**
- **Relatórios e analytics detalhados**
- **Sistema de notificações push**
- **Cache com Redis para performance**
- **Logs estruturados com Winston**
- **Monitoramento com health checks**

###  Roadmap Futuro
- **API Gateway para microserviços**
- **Integração com SSO corporativo**
- **Sistema de certificações digitais**
- **Gamificação e sistema de badges**
- **IA para recomendações personalizadas**
- **Mobile API otimizada**
- **Webhooks para integrações externas**

---

**Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.** 

## 📝 Padronização de Terminologia

### Nomenclatura Unificada
Para manter consistência e clareza no sistema, adotamos os seguintes termos padrão:

#### Backend (API)
- **Templates**: Modelos reutilizáveis (PlanoMestre, SprintMestre, MetaMestre)
- **Instâncias**: Dados específicos do aluno criados a partir de templates
- **Metas**: Tarefas/objetivos que o aluno precisa completar
- **Guards**: Controle de acesso baseado em roles (admin/aluno)

#### Benefícios da Padronização
✅ **Consistência**: Mesma terminologia em todo o sistema
✅ **Clareza**: Evita confusão entre diferentes termos
✅ **Manutenção**: Facilita futuras atualizações
✅ **UX**: Melhora a experiência do usuário com termos consistentes 

## 📚 Diretrizes de Desenvolvimento

###  Objetivo
Este documento estabelece as diretrizes fundamentais para o desenvolvimento do Sistema de Mentoria, visando criar um código educacional, limpo, compreensível e sustentável, priorizando o uso do idioma português.

### 🧹 Fundamentos Gerais

#### 1. Código Limpo e Legível
- Escreva código pensando na compreensão de outros desenvolvedores
- Use nomes descritivos em português para:
  ```javascript
  ✅ Bom exemplo:
  function calcularMediaFinal() { ... }
  const alunoAprovado = true;
  const mensagemErro = "Dados inválidos";

  ❌ Evitar:
  function calcAvg() { ... }
  const x1 = true;
  const flagOk = "invalid";
  ```
- Mantenha funções curtas e com responsabilidade única
- Evite duplicação de código (princípio DRY)
- Priorize soluções simples e claras

#### 2. Uso do Português no Código
- Utilize português para:
  - Nomes de variáveis, funções e classes
  - Comentários e documentação
  - Mensagens de erro e logs
- Exceções permitidas:
  - Palavras-chave da linguagem (if, return, function)
  - Termos técnicos consagrados sem boa tradução

#### 3. Comentários Significativos
```javascript
// ✅ Bom exemplo:
// Calcula o percentual de progresso considerando apenas metas ativas
function calcularProgressoMetas(metas) { ... }

// ❌ Evitar:
// Função que calcula
function calc() { ... }
```

#### 4. Organização do Projeto
- Estrutura de diretórios clara e lógica
- Separação de responsabilidades
- Modularização adequada do código

#### 5. Gestão de Dependências
- Priorize recursos nativos
- Adicione bibliotecas apenas quando necessário
- Documente o motivo de cada dependência

### 🧱 Princípios SOLID

#### S - Princípio da Responsabilidade Única
```javascript
// ✅ Bom exemplo:
class GerenciadorMetas {
    async buscarMeta(id) { ... }
    async salvarMeta(meta) { ... }
}

class CalculadoraProgresso {
    calcularPercentualConcluido(metas) { ... }
}

// ❌ Evitar:
class Meta {
    buscarDoBanco() { ... }
    calcularProgresso() { ... }
    enviarEmail() { ... }
}
```

#### O - Princípio Aberto/Fechado
```javascript
// ✅ Bom exemplo:
class ValidadorMeta {
    validar(meta) {
        // Lógica base de validação
    }
}

class ValidadorMetaAvancada extends ValidadorMeta {
    validar(meta) {
        super.validar(meta);
        // Validações adicionais
    }
}
```

#### L - Princípio da Substituição de Liskov
```javascript
// ✅ Bom exemplo:
class Meta {
    async concluir() { ... }
}

class MetaComPrazo extends Meta {
    async concluir() {
        // Mantém o comportamento base
        await super.concluir();
        // Adiciona verificação de prazo
    }
}
```

#### I - Princípio da Segregação de Interface
```javascript
// ✅ Bom exemplo:
interface GerenciadorMetas {
    buscarMeta(id: number): Promise<Meta>;
    salvarMeta(meta: Meta): Promise<void>;
}

interface RelatorioMetas {
    gerarRelatorioProgresso(): Promise<Relatorio>;
}
```

#### D - Princípio da Inversão de Dependência
```javascript
// ✅ Bom exemplo:
interface RepositorioMetas {
    buscar(id: number): Promise<Meta>;
}

class ServicoMetas {
    constructor(private repositorio: RepositorioMetas) {}
}
```

### 📝 Convenções de Código

#### Nomenclatura
- Classes: substantivos no singular, primeira letra maiúscula
  - `class PlanoMentoria {}`
- Interfaces: prefixo I + substantivo
  - `interface IGerenciadorMetas {}`
- Métodos: verbos no infinitivo
  - `calcularProgresso()`
- Variáveis: substantivos descritivos
  - `const totalMetasConcluidas = 0`

#### Estrutura de Arquivos
```
src/
  dominio/
    entidades/
      Meta.ts
      Plano.ts
    servicos/
      GerenciadorMetas.ts
  infraestrutura/
    repositorios/
      RepositorioMetas.ts
  interfaces/
    controllers/
      MetasController.ts
```

### 🔍 Revisão de Código
Antes de cada commit, verifique:
- ✅ Código está em português (exceto exceções definidas)
- ✅ Funções têm responsabilidade única
- ✅ Nomes são claros e descritivos
- ✅ Comentários são relevantes
- ✅ Princípios SOLID foram aplicados
- ✅ Não há duplicação de código

##  Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)  
5. Abra um Pull Request

##  Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

##  Status do Projeto

### ✅ Implementado (Backend API)
- **Arquitetura de Templates vs Instâncias completa**
- **Sistema de autenticação JWT com guards baseados em roles**
- **APIs RESTful com NestJS + TypeORM**
- **Criação automática de instâncias a partir de templates**
- **Sistema de ranking semanal automático**
- **Controle de acesso baseado em roles (admin/aluno)**
- **Documentação Swagger/OpenAPI automática**
- **Migrações TypeORM para controle de schema**
- **Validação de dados com class-validator**
- **Testes unitários e e2e com Jest**
- **Princípios SOLID aplicados na arquitetura**
- **Clean Architecture com separação de camadas**

###  Em Desenvolvimento
- **Dashboard administrativo avançado**
- **Relatórios e analytics detalhados**
- **Sistema de notificações push**
- **Cache com Redis para performance**
- **Logs estruturados com Winston**
- **Monitoramento com health checks**

###  Roadmap Futuro
- **API Gateway para microserviços**
- **Integração com SSO corporativo**
- **Sistema de certificações digitais**
- **Gamificação e sistema de badges**
- **IA para recomendações personalizadas**
- **Mobile API otimizada**
- **Webhooks para integrações externas**

---

**Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.** 

## 📝 Padronização de Terminologia

### Nomenclatura Unificada
Para manter consistência e clareza no sistema, adotamos os seguintes termos padrão:

#### Backend (API)
- **Templates**: Modelos reutilizáveis (PlanoMestre, SprintMestre, MetaMestre)
- **Instâncias**: Dados específicos do aluno criados a partir de templates
- **Metas**: Tarefas/objetivos que o aluno precisa completar
- **Guards**: Controle de acesso baseado em roles (admin/aluno)

#### Benefícios da Padronização
✅ **Consistência**: Mesma terminologia em todo o sistema
✅ **Clareza**: Evita confusão entre diferentes termos
✅ **Manutenção**: Facilita futuras atualizações
✅ **UX**: Melhora a experiência do usuário com termos consistentes 