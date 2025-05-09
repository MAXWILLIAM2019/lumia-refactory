import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import RegisterPlan from '../pages/RegisterPlan/RegisterPlan';
import ListPlans from '../pages/ListPlans/ListPlans';
import EditPlan from '../pages/EditPlan/EditPlan';
import Layout from '../components/Layout/Layout';
import authService from '../services/authService';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  console.log('Verificando autenticação:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('Usuário autenticado, renderizando rota protegida');
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Rotas de Planos */}
        <Route
          path="/planos/cadastrar"
          element={
            <PrivateRoute>
              <RegisterPlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/planos"
          element={
            <PrivateRoute>
              <ListPlans />
            </PrivateRoute>
          }
        />
        <Route
          path="/planos/editar/:id"
          element={
            <PrivateRoute>
              <EditPlan />
            </PrivateRoute>
          }
        />

        {/* Rotas de Sprints */}
        <Route
          path="/sprints/cadastrar"
          element={
            <PrivateRoute>
              <div>Cadastrar Sprint (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/sprints"
          element={
            <PrivateRoute>
              <div>Listar Sprints (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/sprints/editar/:id"
          element={
            <PrivateRoute>
              <div>Editar Sprint (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />

        {/* Rotas de Alunos */}
        <Route
          path="/alunos/cadastrar"
          element={
            <PrivateRoute>
              <div>Cadastrar Aluno (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/alunos"
          element={
            <PrivateRoute>
              <div>Listar Alunos (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/alunos/editar/:id"
          element={
            <PrivateRoute>
              <div>Editar Aluno (em desenvolvimento)</div>
            </PrivateRoute>
          }
        />

        {/* Redireciona a raiz para o dashboard se autenticado, senão para login */}
        <Route
          path="/"
          element={
            <Navigate to={authService.isAuthenticated() ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Redireciona qualquer rota não definida para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 