# Sistema de Mentoria - Frontend

Este é o frontend do Sistema de Mentoria, desenvolvido com React + Vite.

## Tecnologias Utilizadas

### Core
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [Vite](https://vitejs.dev/) - Build tool e servidor de desenvolvimento
- [React Router](https://reactrouter.com/) - Roteamento da aplicação
- [Axios](https://axios-http.com/) - Cliente HTTP para requisições à API
- [Recharts](https://recharts.org/) - Biblioteca para visualização de gráficos

### UI/UX
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Flowbite](https://flowbite.com/) - Componentes UI baseados em Tailwind
- [React Icons](https://react-icons.github.io/react-icons/) - Biblioteca de ícones
- [React Quill](https://github.com/zenoamaro/react-quill) - Editor de texto rico
- [React Paginate](https://github.com/AdeleD/react-paginate) - Componente de paginação

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

## Funcionalidade de Drag and Drop (Arrastar e Soltar)

O sistema implementa uma funcionalidade de arrastar e soltar (drag and drop) para permitir a reordenação visual de sprints dentro de cada plano de estudo. Esta implementação usa a biblioteca @dnd-kit, que oferece uma API moderna e flexível para interações de arrastar e soltar.

### Funcionalidades Implementadas

- Reordenação de sprints dentro de cada plano por arrastar e soltar
- Indicador visual da ordem atual (números sequenciais)
- Feedback visual durante o arrasto
- Persistência da ordem no backend
- Controles para salvar ou cancelar as alterações

### Bibliotecas Utilizadas

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- **@dnd-kit/core**: Funcionalidades básicas de drag and drop
- **@dnd-kit/sortable**: Utilitários específicos para listas ordenáveis
- **@dnd-kit/utilities**: Funções auxiliares para transformações CSS

### Principais Componentes

#### 1. SortableItem
Componente que renderiza um item arrastável individual (uma sprint):

```jsx
function SortableItem({ sprint, index }) {
  const {
    attributes,  // Atributos para o elemento arrastável
    listeners,   // Listeners para eventos de arrastar/soltar
    setNodeRef,  // Função para definir a referência DOM
    transform,   // Transformação durante arrasto
    transition,  // Transição de animação
  } = useSortable({ id: sprint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // outros estilos...
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Alça de arrasto */}
        <div {...listeners}>⠿</div>
        
        {/* Número indicador e conteúdo */}
        <div>{index + 1}</div>
        <div>{sprint.nome}</div>
        {/* ... */}
      </div>
    </div>
  );
}
```

#### 2. Contexto DND

```jsx
<DndContext 
  sensors={sensors} 
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext 
    items={sprints.map(sprint => sprint.id)} 
    strategy={verticalListSortingStrategy}
  >
    <div className={styles.sortableList}>
      {sprints.map((sprint, index) => (
        <SortableItem key={sprint.id} sprint={sprint} index={index} />
      ))}
    </div>
  </SortableContext>
</DndContext>
```

### Manipulação de Eventos

```jsx
// Handler para quando um item é arrastado e solto
const handleDragEnd = (event, planoId, sprints) => {
  const { active, over } = event;
  
  if (!over || active.id === over.id) return;
  
  // Encontrar índices no array
  const oldIndex = sprints.findIndex(sprint => sprint.id === active.id);
  const newIndex = sprints.findIndex(sprint => sprint.id === over.id);
  
  // Reordenar o array usando a função arrayMove do @dnd-kit
  const newSprints = arrayMove(sprints, oldIndex, newIndex);
  
  // Atualizar posições
  newSprints.forEach((sprint, index) => {
    sprint.posicao = index + 1;
  });
  
  // Atualizar o estado
  setSprints(/* ... */);
};
```

### Persistência no Backend

A funcionalidade de reordenação utiliza um endpoint específico para salvar a nova ordem:

```jsx
// No frontend (service)
async reordenarSprints(planoId, ordemSprints) {
  const response = await api.post('/sprints/reordenar', {
    planoId,
    ordemSprints
  });
  return response.data;
}

// No componente
const handleSalvarReordenacao = async () => {
  const ordemSprints = sprints.map(sprint => sprint.id);
  await sprintService.reordenarSprints(planoId, ordemSprints);
};
```

### Integrando a Funcionalidade em Novos Componentes

Para implementar a funcionalidade de arrastar e soltar em novos contextos:

1. **Instalar as dependências**:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Importar bibliotecas necessárias**:
   ```jsx
   import {
     DndContext, closestCenter, KeyboardSensor, PointerSensor,
     useSensor, useSensors
   } from '@dnd-kit/core';
   import {
     arrayMove, SortableContext, sortableKeyboardCoordinates,
     useSortable, verticalListSortingStrategy
   } from '@dnd-kit/sortable';
   import { CSS } from '@dnd-kit/utilities';
   ```

3. **Criar um componente SortableItem**:
   ```jsx
   function SortableItem({ item, index }) {
     const { attributes, listeners, setNodeRef, transform, transition } = 
       useSortable({ id: item.id });
       
     // Implementar o JSX para renderizar o item arrastável
   }
   ```

4. **Configurar o contexto DND**:
   ```jsx
   const sensors = useSensors(
     useSensor(PointerSensor),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
   );
   
   // No JSX do componente
   <DndContext 
     sensors={sensors}
     collisionDetection={closestCenter}
     onDragEnd={handleDragEnd}
   >
     <SortableContext 
       items={itens.map(item => item.id)}
       strategy={verticalListSortingStrategy}
     >
       {/* Renderizar itens arrastáveis */}
     </SortableContext>
   </DndContext>
   ```

5. **Implementar a função handleDragEnd**:
   ```jsx
   const handleDragEnd = (event) => {
     const { active, over } = event;
     
     if (!over || active.id === over.id) return;
     
     // Lógica para reordenar os itens
   };
   ```

### Estilos Recomendados

Para uma experiência visual consistente, adicione os seguintes estilos:

```css
.sortableList {
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.dragging {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background: #f9fafb;
  border: 1px solid #60a5fa;
  z-index: 999;
}

.dragHandle {
  cursor: grab;
  /* outros estilos */
}

.dragHandle:active {
  cursor: grabbing;
}
```

## Sistema de Paginação

O sistema utiliza a biblioteca React Paginate para implementar paginação eficiente e amigável ao usuário em listagens com grande volume de dados.

### Instalação

```bash
npm install react-paginate --save
```

### Implementação

A paginação foi inicialmente implementada na tela de listagem de alunos (RegisterStudent.jsx) e pode ser facilmente estendida para outras listagens no sistema.

#### Configuração Básica

```jsx
import ReactPaginate from 'react-paginate';

// Estados para controlar a paginação
const [currentPage, setCurrentPage] = useState(0);
const itemsPerPage = 50; // Número de itens por página

// Função para mudar de página
const handlePageChange = (selectedItem) => {
  setCurrentPage(selectedItem.selected);
  // Rolar de volta ao topo da lista
  if (document.querySelector(`.${styles.tableContainer}`)) {
    document.querySelector(`.${styles.tableContainer}`).scrollIntoView({ behavior: 'smooth' });
  }
};

// Calcular os dados a exibir na página atual
const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
const displayedItems = filteredItems.slice(
  currentPage * itemsPerPage,
  (currentPage + 1) * itemsPerPage
);
```

#### Renderização do Componente

```jsx
{pageCount > 1 && (
  <div className={styles.paginationContainer}>
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
      breakClassName={styles.paginationBreak}
      forcePage={currentPage}
    />
    <div className={styles.paginationInfo}>
      Mostrando {filteredItems.length > 0 ? currentPage * itemsPerPage + 1 : 0} a {Math.min((currentPage + 1) * itemsPerPage, filteredItems.length)} de {filteredItems.length} itens
    </div>
  </div>
)}
```

#### Estilos CSS

```css
.paginationContainer {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination li {
  display: inline-flex;
}

.pagination li a {
  padding: 8px 12px;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  background: #23283a;
  border: 1px solid #3b82f6;
  text-decoration: none;
  user-select: none;
}

.pagination li a:hover {
  background: #3b82f6;
}

.paginationActive a {
  background: #3b82f6 !important;
  border-color: #1d4ed8 !important;
  font-weight: 600;
}

.paginationDisabled a {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.paginationBreak a {
  background: transparent !important;
  border: none !important;
  color: #9ca3af !important;
  font-weight: bold;
}
```

### Integração com Busca

A paginação funciona perfeitamente com recursos de busca e filtro:

```jsx
// Reset da página quando o termo de busca muda
useEffect(() => {
  setCurrentPage(0);
}, [searchTerm]);

// Filtragem dos dados
const filteredItems = items.filter(item => {
  const termLower = searchTerm.toLowerCase();
  return item.name.toLowerCase().includes(termLower);
});
```

### Considerações de Desempenho

- Esta implementação realiza paginação no frontend, o que é ideal para conjuntos de dados menores.
- Para conjuntos muito grandes de dados, considere implementar paginação no backend, onde apenas os dados da página atual são carregados por vez.

### Acessibilidade

O componente React Paginate oferece suporte a recursos de acessibilidade, incluindo:
- Navegação por teclado
- ARIA labels
- Contraste de cores adequado (com nosso tema personalizado)

### Responsividade

Os estilos CSS implementados garantem que a paginação funcione bem em dispositivos móveis:

```css
@media (max-width: 768px) {
  .pagination {
    gap: 4px;
  }
  
  .pagination li a {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
}
```

## Endpoints da API

### Sprints
- `

## Instalação de dependências

Para instalar todas as dependências do projeto, execute:

```bash
npm install
```

## Instalação do Recharts

O projeto utiliza a biblioteca [Recharts](https://recharts.org/) para visualização de gráficos e estatísticas.

Para instalar o Recharts, execute o comando abaixo dentro da pasta `frontend2`:

```bash
npm install recharts
```

## Como usar o Recharts

Após a instalação, você pode importar os componentes do Recharts normalmente nos seus arquivos React:

```jsx
import { PieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

Veja a [documentação oficial](https://recharts.org/en-US/examples) para exemplos de uso.

## Rodando o projeto

Para iniciar o frontend em modo de desenvolvimento:

```bash
npm start
```

Acesse em: http://localhost:3000