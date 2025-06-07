# Microserviço Mentor

Este serviço é responsável pelo cadastro de sprints e metas dos mentorados.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o serviço em modo desenvolvimento:
   ```bash
   npm run dev
   ```

O serviço estará disponível em `http://localhost:3000` (ou na porta definida no arquivo `.env`).

## Endpoints iniciais
- `GET /health` — Verifica se o serviço está online.

## Suporte para Conteúdo Rich Text (HTML)

O backend foi adaptado para armazenar e processar conteúdo HTML gerado pelo editor React Quill no frontend.

### Campos com Suporte a HTML

Atualmente, o campo `comandos` do modelo `Meta` suporta conteúdo formatado em HTML, permitindo:
- Formatação de texto (negrito, itálico, etc.)
- Listas ordenadas e não ordenadas
- Links
- Outros elementos HTML básicos

### Armazenamento e Segurança

- O conteúdo HTML é armazenado como string no banco de dados SQLite
- O backend preserva todas as tags HTML ao receber e enviar dados
- O frontend é responsável por renderizar o HTML de forma segura

### Considerações Técnicas

- Não há limite de tamanho para o campo, mas recomenda-se manter o conteúdo conciso
- O banco de dados SQLite suporta armazenamento eficiente de strings de qualquer tamanho
- Embora o campo aceite qualquer HTML, recomenda-se limitar às funcionalidades disponíveis no editor React Quill

## Estrutura de Modelos do Sistema

### Visão Geral dos Modelos

O sistema utiliza os seguintes modelos principais:

1. **Aluno** - Dados dos alunos mentorados
2. **Plano** - Planos de estudo disponíveis
3. **Sprint** - Ciclos de estudo dentro de um plano
4. **Meta** - Atividades a serem realizadas dentro de uma sprint
5. **Disciplina** - Áreas de conhecimento
6. **Assunto** - Tópicos específicos dentro de uma disciplina
7. **Administrador** - Usuários com acesso administrativo ao sistema

### Relacionamentos Principais

- Um **Plano** possui várias **Disciplinas**
- Uma **Disciplina** possui vários **Assuntos**
- Um **Plano** possui várias **Sprints**
- Uma **Sprint** possui várias **Metas**
- Um **Aluno** pode estar associado a vários **Planos**

## Módulo de Alunos

### Visão Geral
O módulo de alunos implementa as operações CRUD para gerenciar os registros de alunos no sistema de mentoria. O módulo usa o padrão MVC e implementa validações para garantir a integridade dos dados.

### Estrutura do Módulo

#### Modelo (Aluno.js)
- Representa a estrutura de dados do aluno no banco
- Campos principais: nome, email (único), cpf (único)
- Implementa validações para garantir dados válidos

#### Controlador (alunoController.js)
- Implementa a lógica de negócio para operações CRUD
- Trata erros e casos especiais (duplicidade, não encontrado)
- Retorna respostas padronizadas para a API

#### Rotas (alunoRoutes.js)
- Define os endpoints RESTful para acesso às funcionalidades
- Mapeia URLs para as funções do controlador

### Endpoints do Módulo

| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|-------------|
| GET | /api/alunos | Lista todos os alunos | 200, 500 |
| POST | /api/alunos | Cadastra novo aluno | 201, 400, 500 |
| GET | /api/alunos/:id | Busca aluno por ID | 200, 404, 500 |
| PUT | /api/alunos/:id | Atualiza aluno | 200, 404, 400 |
| DELETE | /api/alunos/:id | Remove aluno | 200, 404, 500 |

### Regras de Negócio
- Email e CPF são campos únicos (não podem ser duplicados)
- Todos os campos (nome, email, cpf) são obrigatórios
- Email deve ter formato válido

### Respostas e Tratamento de Erros

#### Sucesso
- **Listagem**: Array de objetos de alunos
- **Busca/Atualização**: Objeto com dados do aluno
- **Remoção**: Mensagem de confirmação

#### Erros
- **Duplicidade**: Status 400 com mensagem explicativa
- **Não encontrado**: Status 404 com mensagem "Aluno não encontrado"
- **Erro interno**: Status 500 com detalhes do erro (em desenvolvimento)

## Próximos passos
- Implementar sistema de autenticação mais robusto
- Adicionar relatórios de progresso dos alunos
- Desenvolver integração com calendário para agendamento de mentorias 