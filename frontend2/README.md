# Sistema de Mentoria - Frontend

Este é o frontend do Sistema de Mentoria, desenvolvido com React + Vite.

## Tecnologias Utilizadas

### Core
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [Vite](https://vitejs.dev/) - Build tool e servidor de desenvolvimento
- [React Router](https://reactrouter.com/) - Roteamento da aplicação
- [Axios](https://axios-http.com/) - Cliente HTTP para requisições à API

### UI/UX
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Flowbite](https://flowbite.com/) - Componentes UI baseados em Tailwind
- [React Icons](https://react-icons.github.io/react-icons/) - Biblioteca de ícones
- [React Quill](https://github.com/zenoamaro/react-quill) - Editor de texto rico

### Estado e Gerenciamento
- [React Context](https://reactjs.org/docs/context.html) - Gerenciamento de estado global
- [React Query](https://tanstack.com/query/latest) - Gerenciamento de estado do servidor e cache

## Instalação do React Quill

Para instalar o React Quill e suas dependências, execute:

```bash
npm install react-quill
```

### Configuração do React Quill

O React Quill já está configurado no projeto. A implementação principal está no componente `RegisterSprint.jsx`, que utiliza as seguintes configurações:

```jsx
// Importação do React Quill e seus estilos
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configuração da barra de ferramentas
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link'],
    ['clean']
  ],
};

// Formatos permitidos
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'code-block'
];

// Uso do componente
<ReactQuill
  value={editorContent}
  onChange={setEditorContent}
  modules={modules}
  formats={formats}
  placeholder="Digite as instruções ou comandos aqui..."
/>
```

### Integrando o React Quill em Novos Componentes

Para adicionar o editor Rich Text em novos componentes, siga estas etapas:

1. **Importar as dependências necessárias:**
   ```jsx
   import ReactQuill from 'react-quill';
   import 'react-quill/dist/quill.snow.css';
   ```

2. **Configurar os estados para gerenciar o conteúdo:**
   ```jsx
   const [editorContent, setEditorContent] = useState('');
   const [showTextEditor, setShowTextEditor] = useState(false);
   ```

3. **Adicionar a estrutura do modal:**
   ```jsx
   {showTextEditor && (
     <div className={styles.modalOverlay}>
       <div className={styles.textEditorModal}>
         <div className={styles.textEditorHeader}>
           <h3>Editor de Texto</h3>
           <button 
             className={styles.closeButton}
             onClick={() => setShowTextEditor(false)}
           >
             ×
           </button>
         </div>
         <div className={styles.textEditorContent}>
           <ReactQuill
             value={editorContent}
             onChange={setEditorContent}
             modules={modules}
             formats={formats}
             placeholder="Digite seu conteúdo aqui..."
           />
         </div>
         <div className={styles.textEditorFooter}>
           <button 
             className={styles.cancelButton}
             onClick={() => setShowTextEditor(false)}
           >
             Cancelar
           </button>
           <button 
             className={styles.saveButton}
             onClick={saveTextEditorContent}
           >
             Salvar
           </button>
         </div>
       </div>
     </div>
   )}
   ```

4. **Implementar funções para manipular o editor:**
   ```jsx
   const openTextEditor = (initialContent) => {
     setEditorContent(initialContent || '');
     setShowTextEditor(true);
   };

   const saveTextEditorContent = () => {
     // Verificar se o conteúdo não está vazio
     const editorElement = document.querySelector('.ql-editor');
     const isEmpty = editorElement?.innerHTML === '<p><br></p>';
     
     if (!isEmpty) {
       // Salvar o conteúdo onde for necessário
       // Exemplo: setFormData({...formData, descricao: editorContent});
     }
     
     setShowTextEditor(false);
   };
   ```

5. **Adicionar CSS necessário:**
   Copie os estilos relevantes do arquivo `RegisterSprint.module.css` para seu componente.

6. **Renderizar o conteúdo HTML:**
   ```jsx
   <div dangerouslySetInnerHTML={{ __html: conteudoHTML }} />
   ```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── layout/    # Componentes de layout (Sidebar, Header, etc)
│   │   └── ui/        # Componentes de UI (Badge, Button, etc)
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── styles/        # Estilos globais
│   ├── App.jsx        # Componente principal
│   └── main.jsx       # Ponto de entrada
```

## Editor de Texto Rich Text

O sistema implementa um editor de texto avançado baseado em React Quill para campos que necessitam de formatação rica, como o campo "Comandos" nas atividades das sprints.

### Funcionalidades do Editor

- Formatação de texto (negrito, itálico, sublinhado)
- Listas ordenadas e não ordenadas
- Títulos e subtítulos
- Links
- Alinhamento de texto
- Citações
- Visualização em tempo real

### Como Utilizar

1. **Acessando o Editor**:
   - No cadastro/edição de Sprints, ao clicar no campo "Comandos" de uma atividade
   - Um modal com o editor completo será exibido

2. **Editando o Conteúdo**:
   - Use a barra de ferramentas para aplicar formatações
   - O conteúdo é automaticamente renderizado em HTML
   - Clique em "Salvar" para aplicar as alterações ao campo

3. **Visualizando o Conteúdo**:
   - Na tela de cadastro/edição, uma prévia do conteúdo formatado é exibida
   - Na visualização das sprints, o conteúdo é renderizado com todas as formatações

### Implementação Técnica

- O editor é implementado como um modal que aparece ao clicar no campo
- Os estilos são definidos em CSS Modules, permitindo personalização completa
- O conteúdo HTML é armazenado no banco de dados e renderizado de forma segura na interface

## Endpoints da API

### Sprints
- `GET /api/sprints` - Listar todas as sprints
- `POST /api/sprints` - Criar nova sprint
- `GET /api/sprints/:id` - Buscar sprint por ID
- `PUT /api/sprints/:id` - Atualizar sprint
- `DELETE /api/sprints/:id` - Deletar sprint

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `POST /api/alunos` - Criar novo aluno
- `GET /api/alunos/:id` - Buscar aluno por ID
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

## Fluxo de Cadastro e Listagem de Alunos

### Visão Geral

O módulo de cadastro e listagem de alunos permite aos administradores gerenciar os participantes do sistema de mentoria. O fluxo implementa as operações CRUD completas, com foco em uma interface unificada que permite tanto o cadastro de novos alunos quanto a visualização dos registros existentes.

### Arquivos Principais

#### Frontend
- **Página**: `src/pages/RegisterStudent/RegisterStudent.jsx`
- **Estilos**: `src/pages/RegisterStudent/RegisterStudent.module.css`
- **Serviço**: `src/services/alunoService.js`
- **Config API**: `src/services/api.js`

#### Backend
- **Rotas**: `backend/src/routes/alunoRoutes.js`
- **Controlador**: `backend/src/controllers/alunoController.js`
- **Modelo**: `backend/src/models/Aluno.js`

### Funcionalidades

1. **Cadastro de Alunos**
   - Formulário com validação de campos obrigatórios
   - Verificação de dados únicos (email e CPF)
   - Feedback visual em caso de erros
   - Limpeza automática do formulário após cadastro bem-sucedido

2. **Listagem de Alunos**
   - Visualização em tabela com informações principais
   - Toggle para mostrar/ocultar a lista
   - Atualização automática após novo cadastro

### Fluxo de Dados

1. **Cadastro**:
   - Usuário preenche o formulário e submete
   - Frontend valida campos básicos (formato, obrigatoriedade)
   - `alunoService.cadastrarAluno()` envia dados para API
   - Backend valida regras de negócio (unicidade de email/CPF)
   - Retorna sucesso (aluno criado) ou erro (campo duplicado)
   - Frontend exibe feedback apropriado

2. **Listagem**:
   - Usuário clica no botão "Listar Alunos"
   - `alunoService.listarAlunos()` solicita dados
   - Backend consulta banco e retorna todos os registros
   - Frontend renderiza dados na tabela

### Diagrama de Sequência Simplificado

```
┌─────────┐          ┌───────────────┐          ┌────────────┐          ┌────────┐
│ Usuário │          │ Frontend (UI) │          │ API/Backend│          │ Banco  │
└────┬────┘          └───────┬───────┘          └─────┬──────┘          └───┬────┘
     │                       │                        │                     │
     │ Preenche formulário   │                        │                     │
     │─────────────────────>│                        │                     │
     │                       │                        │                     │
     │                       │ POST /api/alunos       │                     │
     │                       │───────────────────────>│                     │
     │                       │                        │ Valida e insere     │
     │                       │                        │────────────────────>│
     │                       │                        │                     │
     │                       │                        │ Resultado           │
     │                       │                        │<────────────────────│
     │                       │ Resposta               │                     │
     │                       │<───────────────────────│                     │
     │ Feedback              │                        │                     │
     │<───────────────────────                        │                     │
     │                       │                        │                     │
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção localmente

## Configuração do Ambiente

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Convenções de Código

- Componentes: PascalCase (ex: `Sidebar.jsx`)
- Funções: camelCase (ex: `handleSubmit`)
- Variáveis: camelCase (ex: `userData`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_URL`)

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se o backend está rodando
   - Confirme se as URLs da API estão corretas no `.env`

2. **Erro de Build**
   - Limpe o cache: `npm run clean`
   - Reinstale as dependências: `npm install`

3. **Erro de Dependências**
   - Delete `node_modules` e `package-lock.json`
   - Execute `npm install` novamente
