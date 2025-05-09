import React from 'react';
import AppRoutes from './routes';

/**
 * Componente principal da aplicação
 * Define as rotas e a estrutura base do app
 * 
 * Rotas disponíveis:
 * - /: Dashboard principal
 * - /register-sprint: Cadastro de sprints
 * - /edit-sprint/:id: Edição de sprint específica
 * - /sprints: Listagem de sprints
 * - /register-student: Cadastro de alunos
 * - /register-plan: Cadastro de planos
 * - /planos: Listagem de planos
 * - /planos/cadastrar: Cadastro de planos (rota alternativa)
 * - /planos/editar/:id: Edição de plano específico
 */
function App() {
  return <AppRoutes />;
}

export default App;
