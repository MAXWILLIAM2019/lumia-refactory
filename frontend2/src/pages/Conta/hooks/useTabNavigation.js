import { useState } from 'react';

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState('dados-perfil');

  const tabs = [
    { id: 'dados-perfil', label: 'Dados de perfil' },
    { id: 'alterar-senha', label: 'Alterar senha' },
    { id: 'notificacoes', label: 'Notificações' },
    { id: 'bagagem-conteudo', label: 'Bagagem de conteúdo' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return {
    activeTab,
    tabs,
    handleTabChange
  };
};

