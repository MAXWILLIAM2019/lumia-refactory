import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import RegisterPlan from '../pages/RegisterPlan/RegisterPlan';
import ListPlans from '../pages/ListPlans/ListPlans';
import EditPlan from '../pages/EditPlan/EditPlan';
import Layout from '../components/Layout/Layout';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

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
          path="/"
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

        {/* Redireciona para login se a rota não existir */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 