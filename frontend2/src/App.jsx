import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import RegisterSprint from './pages/RegisterSprint/RegisterSprint';
import Sprints from './pages/Sprints/Sprints';
import RegisterStudent from './pages/RegisterStudent/RegisterStudent';
import RegisterPlan from './pages/RegisterPlan/RegisterPlan';
import Layout from './components/Layout/Layout';
import './App.css';

/**
 * Componente principal da aplicação
 * Define as rotas e a estrutura base do app
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
