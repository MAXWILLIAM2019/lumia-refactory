import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Planos */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Planos</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gerencie os planos de estudo e disciplinas
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate('/planos/cadastrar')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cadastrar Plano
              </button>
              <button
                onClick={() => navigate('/planos')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ver Planos
              </button>
            </div>
          </div>
        </div>

        {/* Card de Sprints */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Sprints</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gerencie as sprints e atividades
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate('/sprints/cadastrar')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cadastrar Sprint
              </button>
              <button
                onClick={() => navigate('/sprints')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ver Sprints
              </button>
            </div>
          </div>
        </div>

        {/* Card de Alunos */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Alunos</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gerencie os alunos e suas atividades
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate('/alunos/cadastrar')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cadastrar Aluno
              </button>
              <button
                onClick={() => navigate('/alunos')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver Alunos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 