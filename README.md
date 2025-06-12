# Sistema de Mentoria - Arquitetura de Templates

Um sistema completo para gerenciamento de mentorias baseado em **templates reutilizáveis**, permitindo que administradores criem planos mestre que podem ser instanciados para múltiplos alunos com funcionalidades avançadas de acompanhamento e progresso.

## 🏗️ Arquitetura do Sistema

### Conceito: Templates vs Instâncias

O sistema trabalha com duas camadas distintas:

#### 🎯 **Templates (Modelos Mestre)**
- **PlanoMestre**: Templates de planos criados por administradores
- **SprintMestre**: Templates de sprints dentro dos planos mestre  
- **MetaMestre**: Templates de metas dentro das sprints mestre

#### 👥 **Instâncias (Dados do Aluno)**
- **Plano**: Instância personalizada de um PlanoMestre para um aluno específico
- **Sprint**: Instância de SprintMestre com datas e progresso real
- **Meta**: Instância de MetaMestre com dados de execução e performance

### Benefícios da Arquitetura

✅ **Reutilização**: Um template pode gerar múltiplas instâncias  
✅ **Consistência**: Todos os alunos recebem a mesma estrutura base  
✅ **Flexibilidade**: Instâncias podem ser personalizadas individualmente  
✅ **Manutenção**: Atualizações nos templates não afetam instâncias existentes  
✅ **Escalabilidade**: Suporte a milhares de alunos com performance otimizada

## 🚀 Fluxo de Trabalho

### 1. Administrador - Criação de Templates

```
Admin cria PlanoMestre → Admin adiciona SprintsMestre → Admin define MetasMestre → Template pronto para uso
```

### 2. Aluno - Recebimento de Instância

```
Admin associa aluno ao PlanoMestre → Sistema cria instâncias automáticas → Aluno recebe Plano personalizado → Sprints com datas calculadas → Metas prontas para execução
```

## 📊 Estrutura do Banco de Dados

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

## 🔌 APIs Principais

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

## 💻 Tecnologias

### Frontend
- **React 18** + **Vite**
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Quill** para editor de texto rico
- **@dnd-kit** para drag and drop

### Backend
- **Node.js** + **Express**
- **Sequelize ORM** com **PostgreSQL**
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **CORS** e **dotenv**

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v14+)
- PostgreSQL
- npm ou yarn

### Setup Completo

1. **Clone e instale dependências**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd sis-mentoria
   
   # Backend
   cd backend
   npm install
   
   # Frontend  
   cd ../frontend2
   npm install
   ```

2. **Configure o banco PostgreSQL**
   ```bash
   # Crie um banco PostgreSQL
   createdb sis_mentoria
   ```

3. **Configure variáveis de ambiente**
   ```bash
   cd backend
   cp .env.example .env
   # Edite as configurações do banco
   ```

4. **Execute as migrações do banco**
   ```bash
   # As tabelas serão criadas automaticamente pelo Sequelize
   npm run dev
   ```

5. **Inicie os serviços**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend2  
   npm run dev
   ```

### Estrutura de .env

```env
# JWT
JWT_SECRET=sua_chave_secreta_jwt_super_segura

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_mentoria
DB_USER=seu_usuario
DB_PASS=sua_senha

# Servidor
PORT=3000
NODE_ENV=development
```

## 📋 Fluxo de Uso Completo

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

## 🔐 Sistema de Autenticação

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

## 🏃‍♂️ Casos de Uso Práticos

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

## 🚨 Padrões e Boas Práticas

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

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia backend em modo desenvolvimento
npm run start           # Inicia backend em produção

# Frontend
npm run dev             # Inicia frontend
npm run build           # Build para produção
npm run preview         # Preview do build

# Banco de Dados
npm run db:sync         # Sincroniza modelos com banco
npm run db:reset        # Reset completo do banco
```

## 📚 Documentação Adicional

### Estrutura de Arquivos
```
sis-mentoria/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── planoController.js      # Templates de planos
│   │   │   ├── sprintController.js     # Templates de sprints  
│   │   │   ├── planoMestreController.js # Criação de instâncias
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── PlanoMestre.js          # Modelo template
│   │   │   ├── SprintMestre.js         # Modelo template
│   │   │   ├── MetaMestre.js           # Modelo template
│   │   │   ├── Plano.js                # Modelo instância
│   │   │   ├── Sprint.js               # Modelo instância  
│   │   │   ├── Meta.js                 # Modelo instância
│   │   │   └── ...
│   │   └── routes/
├── frontend2/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegisterPlan.jsx        # Cadastro de templates
│   │   │   ├── RegisterSprint.jsx      # Cadastro de templates
│   │   │   └── ...
│   │   └── pages/
└── README.md
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

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)  
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 🎯 Status do Projeto

### ✅ Implementado
- [x] **Arquitetura de Templates completa**
- [x] **Sistema de autenticação centralizado**
- [x] **APIs para criação de templates**
- [x] **Criação automática de instâncias**  
- [x] **Frontend compatível (zero breaking changes)**
- [x] **Banco harmonizado e otimizado**

### 🚧 Em Desenvolvimento
- [ ] **Dashboard de progresso avançado**
- [ ] **Relatórios e analytics**  
- [ ] **Sistema de notificações**
- [ ] **Mobile responsivo**

### 🔮 Roadmap Futuro
- [ ] **Integração com SSO corporativo**
- [ ] **Sistema de certificações**
- [ ] **Gamificação e badges**
- [ ] **IA para recomendações personalizadas**

---

**Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.** 