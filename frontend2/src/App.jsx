// Importações dos componentes e bibliotecas necessárias
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import RegisterSprint from './pages/RegisterSprint/RegisterSprint';
import Sprints from './pages/Sprints/Sprints';
import RegisterStudent from './pages/RegisterStudent/RegisterStudent';
import RegisterPlan from './pages/RegisterPlan/RegisterPlan';
import ListPlans from './pages/ListPlans/ListPlans';
import EditPlan from './pages/EditPlan/EditPlan';
import Layout from './components/Layout/Layout';
import './App.css';

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
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register-sprint" element={<RegisterSprint />} />
          <Route path="/edit-sprint/:id" element={<RegisterSprint />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/register-plan" element={<RegisterPlan />} />
          <Route path="/planos" element={<ListPlans />} />
          <Route path="/planos/cadastrar" element={<RegisterPlan />} />
          <Route path="/planos/editar/:id" element={<EditPlan />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
