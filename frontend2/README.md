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

## Endpoints da API

### Sprints
- `