# Sistema de Mentoria

Um sistema completo para gerenciamento de mentorias, com funcionalidades para cadastro de alunos, sprints e atividades.

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

- **Frontend**: Interface de usuário desenvolvida com React + Vite
- **Backend**: API RESTful desenvolvida com Node.js, Express e SQLite

## Tecnologias Principais

### Frontend
- React 18
- Vite
- React Router
- Axios
- React Quill (Editor de texto rico)
- @dnd-kit (Biblioteca para funcionalidade de arrastar e soltar)

### Backend
- Node.js
- Express
- Sequelize (ORM)
- SQLite (Banco de dados)

## Instalação e Execução

### Requisitos Prévios
- Node.js (v14+)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd sis-mentoria
   ```

2. **Instale as dependências do backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instale as dependências do frontend**
   ```bash
   cd ../frontend2
   npm install
   ```

4. **Inicie o backend**
   ```bash
   cd ../backend
   npm run dev
   ```

5. **Inicie o frontend (em outro terminal)**
   ```bash
   cd frontend2
   npm run dev
   ```

Após esses passos, o frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.

## Funcionalidades Principais

- Cadastro e gerenciamento de alunos
- Criação e edição de sprints
- Registro de atividades dentro das sprints
- Editor de texto avançado para conteúdo formatado
- Reordenação de sprints via arrastar e soltar (drag and drop)

## Uso do Editor de Texto Rich Text

O sistema conta com um editor de texto avançado (React Quill) para o campo "Comandos" nas atividades das sprints.

### Como Acessar o Editor

1. No cadastro ou edição de uma sprint, localize o campo "Comandos" dentro de uma atividade
2. Clique no campo para abrir o modal do editor de texto
3. Use a barra de ferramentas para formatar seu conteúdo:
   - Negrito, itálico, sublinhado
   - Diferentes níveis de títulos
   - Listas ordenadas e não ordenadas
   - Links
   - Alinhamento de texto
   - Citações

### Como Salvar e Visualizar

1. Após editar seu conteúdo, clique em "Salvar" para aplicar as alterações
2. Uma prévia do conteúdo formatado será exibida no campo "Comandos"
3. O conteúdo formatado será armazenado e exibido corretamente nas visualizações da sprint

## Funcionalidade de Reordenação de Sprints

O sistema permite reordenar as sprints dentro de cada plano de estudo usando a técnica de arrastar e soltar (drag and drop).

### Finalidade

A reordenação de sprints serve para definir a sequência em que as sprints devem ser executadas pelo aluno dentro de um plano de estudo. Isso permite que o administrador organize o fluxo de aprendizado de forma lógica e pedagógica, independentemente da ordem em que as sprints foram criadas.

### Como Utilizar

1. Na página de listagem de sprints, para cada plano com mais de uma sprint, um botão "Reordenar sprints" é exibido
2. Ao clicar neste botão, o modo de reordenação é ativado para aquele plano específico
3. Arraste as sprints pelo ícone "⠿" para reorganizá-las na ordem desejada
4. Após a reorganização, clique em "Salvar ordem" para persistir as alterações ou "Cancelar" para descartar

### Implementação Técnica

- **Frontend**: Utiliza a biblioteca @dnd-kit para implementar a funcionalidade de arrastar e soltar
- **Backend**: Armazena a posição de cada sprint em um campo `posicao` no banco de dados
- **API**: Endpoint `/api/sprints/reordenar` recebe um array com a nova ordem dos IDs das sprints

### Instalação das Dependências

Para projetos que desejam utilizar esta funcionalidade, instale as bibliotecas necessárias:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Possíveis Novos Locais de Utilização

Esta funcionalidade pode ser estendida para outras áreas do sistema:

1. **Reordenação de Metas dentro de uma Sprint**: Permitir reordenar as metas/atividades dentro de uma sprint para definir uma sequência pedagógica
2. **Reordenação de Planos de Estudo**: Permitir reordenar planos de estudo para alunos que seguem múltiplos planos
3. **Reordenação de Disciplinas**: Em módulos futuros que trabalhem com disciplinas, permitir reordenar disciplinas dentro de um curso

### Benefícios

- Interface intuitiva para organização de conteúdo
- Definição clara da sequência de aprendizado
- Flexibilidade para adaptar a ordem conforme necessário
- Feedback visual imediato das alterações

## Sistema de Paginação

O sistema implementa paginação em listagens com grande volume de dados, utilizando a biblioteca react-paginate.

### Finalidade

A paginação melhora significativamente a experiência do usuário e o desempenho da aplicação ao dividir grandes conjuntos de dados em páginas menores e mais gerenciáveis. Isso é especialmente importante em telas de listagem que podem conter centenas ou milhares de registros.

### Funcionalidades Implementadas

- Divisão de dados em páginas de tamanho configurável
- Navegação intuitiva entre páginas
- Indicação visual da página atual
- Compatibilidade com recursos de busca e filtragem
- Interface responsiva adaptável a diferentes tamanhos de tela

### Biblioteca Utilizada

```bash
npm install react-paginate --save
```

### Implementação Técnica

A paginação foi implementada inicialmente na tela de listagem de alunos e pode ser facilmente estendida para outras telas.

- **Componente**: Utiliza o `ReactPaginate` para renderizar os controles de navegação
- **Estado**: Gerencia a página atual e calcula os itens a serem exibidos
- **Integração**: Funciona tanto com dados carregados diretamente do backend quanto com dados filtrados no frontend

### Como Utilizar em Novos Componentes

1. **Importar a biblioteca:**
   ```jsx
   import ReactPaginate from 'react-paginate';
   ```

2. **Configurar os estados necessários:**
   ```jsx
   const [currentPage, setCurrentPage] = useState(0);
   const itemsPerPage = 50; // Ajuste conforme necessário
   ```

3. **Implementar a função de mudança de página:**
   ```jsx
   const handlePageChange = (selectedItem) => {
     setCurrentPage(selectedItem.selected);
     // Opcionalmente, role para o topo da lista
     if (document.querySelector('.listContainer')) {
       document.querySelector('.listContainer').scrollIntoView({ behavior: 'smooth' });
     }
   };
   ```

4. **Calcular os dados a serem exibidos:**
   ```jsx
   const pageCount = Math.ceil(totalItems.length / itemsPerPage);
   const displayedItems = totalItems.slice(
     currentPage * itemsPerPage,
     (currentPage + 1) * itemsPerPage
   );
   ```

5. **Renderizar o componente de paginação:**
   ```jsx
   <ReactPaginate
     previousLabel={"← Anterior"}
     nextLabel={"Próximo →"}
     pageCount={pageCount}
     onPageChange={handlePageChange}
     containerClassName={styles.pagination}
     previousLinkClassName={styles.paginationLink}
     nextLinkClassName={styles.paginationLink}
     disabledClassName={styles.paginationDisabled}
     activeClassName={styles.paginationActive}
     pageRangeDisplayed={3}
     marginPagesDisplayed={1}
     breakLabel={"..."}
     forcePage={currentPage}
   />
   ```

6. **Adicionar estilos CSS:**
   ```css
   .pagination {
     display: flex;
     list-style: none;
     padding: 0;
     margin: 20px 0;
     justify-content: center;
     gap: 8px;
   }
   
   .pagination li a {
     padding: 8px 12px;
     border-radius: 6px;
     cursor: pointer;
     background: #23283a;
     border: 1px solid #3b82f6;
     color: white;
     transition: all 0.2s;
   }
   
   .paginationActive a {
     background: #3b82f6;
     border-color: #1d4ed8;
     font-weight: 600;
   }
   ```

### Benefícios

- Melhora o desempenho ao renderizar apenas uma parte dos dados
- Reduz o tempo de carregamento inicial
- Proporciona uma interface mais limpa e organizada
- Facilita a navegação em grandes conjuntos de dados
- Compatível com funcionalidades de busca e filtragem

### Possíveis Melhorias Futuras

- Implementação de paginação no backend para conjuntos de dados muito grandes
- Opção para o usuário escolher o número de itens por página
- Navegação direta para uma página específica
- Persistência da página atual durante a navegação

## Documentação Adicional

Para mais detalhes sobre cada parte do sistema, consulte:

- [Documentação do Frontend](./frontend2/README.md)
- [Documentação do Backend](./backend/README.md)

## Perfis de Usuários do Sistema

O sistema de mentoria suporta diferentes perfis de usuários, cada um com funcionalidades e permissões específicas. Esta seção será atualizada à medida que novos perfis forem implementados.

### Perfis Atuais

#### 1. Administrador
- Acesso completo a todas as funcionalidades do sistema
- Gerenciamento de usuários (criar, editar, excluir)
- Criação e gerenciamento de planos de estudo
- Visualização de estatísticas e relatórios gerais
- Configuração das opções do sistema

#### 2. Mentor
- Criação e gerenciamento de sprints
- Acompanhamento dos alunos designados
- Avaliação de atividades realizadas
- Comunicação direta com alunos

#### 3. Aluno
- Visualização dos planos de estudo e sprints atribuídos
- Submissão de atividades para avaliação
- Acompanhamento do próprio progresso
- Comunicação com mentores

### Observações sobre os Perfis

- **Hierarquia de Permissões**: Cada perfil possui um conjunto específico de permissões, com o Administrador tendo o nível mais alto de acesso.
- **Personalização de Dashboards**: Cada perfil tem uma visualização personalizada do dashboard de acordo com suas necessidades e permissões.
- **Funcionalidades Específicas**: Certas funcionalidades são exclusivas para determinados perfis de usuário.
- **Extensibilidade**: O sistema foi projetado para acomodar facilmente novos perfis de usuários conforme a necessidade.

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença [INSERIR TIPO DE LICENÇA].

## Estrutura do Banco de Dados

### Tabela Sprints
A tabela `Sprints` armazena as sprints de estudo com as seguintes características:

- Cada sprint está associada a um único plano de estudo
- A posição da sprint dentro do plano é única (não pode haver duas sprints com a mesma posição no mesmo plano)
- A ordem das sprints é mantida através do campo `posicao`
- O status da sprint é atualizado automaticamente com base no progresso das metas

```sql
CREATE TABLE public."Sprints" (
    id serial4 NOT NULL,
    nome varchar(255) NOT NULL,
    "dataInicio" date NOT NULL,
    "dataFim" date NOT NULL,
    status public."enum_Sprints_status" DEFAULT 'Pendente'::"enum_Sprints_status" NOT NULL,
    posicao int4 DEFAULT 0 NOT NULL,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "PlanoId" int4 NOT NULL,
    CONSTRAINT "Sprints_pkey" PRIMARY KEY (id),
    CONSTRAINT plano_posicao_unique UNIQUE ("PlanoId", posicao),
    CONSTRAINT "Sprints_PlanoId_fkey" FOREIGN KEY ("PlanoId") REFERENCES public."Planos"(id) ON DELETE SET NULL ON UPDATE CASCADE
);
```

### Restrições Importantes
- A combinação de `PlanoId` e `posicao` deve ser única
- Cada sprint deve estar associada a um plano válido
- Ao excluir um plano, as sprints associadas terão seu `PlanoId` definido como NULL 

## Padrão de Rotas do Frontend (Axios)

O frontend utiliza uma instância do Axios configurada com o seguinte baseURL:

```
http://localhost:3000/api
```

**IMPORTANTE:**
- Todas as chamadas para a API devem ser feitas usando apenas o caminho relativo após `/api`.
- **Exemplo correto:**
  ```js
  axios.get('/disciplinas') // Vai para http://localhost:3000/api/disciplinas
  ```
- **Exemplo incorreto:**
  ```js
  axios.get('/api/disciplinas') // Vai para http://localhost:3000/api/api/disciplinas (DUPLICADO!)
  ```
- Esse padrão vale para **todas** as requisições do projeto.

Sempre consulte o arquivo `frontend2/src/services/api.js` para mais detalhes sobre a configuração do Axios. 