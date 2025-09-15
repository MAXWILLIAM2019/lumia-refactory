import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useUsuarioData = () => {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    biografia: '',
    formacao: '',
    isTrabalhando: false,
    isAceitaTermos: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsuarioInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const responseData = response.data;
      
      // O backend retorna os dados em responseData.aluno para alunos
      const dadosUsuario = responseData.aluno || responseData.usuario;
      
      if (!dadosUsuario) {
        setMessage('Erro: Dados do usuário não encontrados');
        return;
      }
      
      setUsuario(dadosUsuario);
      setFormData({
        nome: dadosUsuario?.nome || '',
        email: dadosUsuario?.email || '',
        telefone: dadosUsuario?.telefone || '',
        biografia: dadosUsuario?.biografia || '',
        formacao: dadosUsuario?.formacao || '',
        isTrabalhando: dadosUsuario?.isTrabalhando || false,
        isAceitaTermos: dadosUsuario?.isAceitaTermos || false
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setMessage('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Mapear dados para o formato esperado pelo backend
      const dadosParaEnviar = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        biografia: formData.biografia,
        formacao: formData.formacao,
        isTrabalhando: formData.isTrabalhando,
        isAceitaTermos: formData.isAceitaTermos
      };

      await api.put(`/alunos/${usuario.id}`, dadosParaEnviar);
      setMessage('Dados salvos com sucesso!');
      
      // Recarregar dados do usuário
      await fetchUsuarioInfo();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      setMessage('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        biografia: usuario.biografia || '',
        formacao: usuario.formacao || '',
        isTrabalhando: usuario.isTrabalhando || false,
        isAceitaTermos: usuario.isAceitaTermos || false
      });
    }
    setMessage('');
  };

  useEffect(() => {
    fetchUsuarioInfo();
  }, []);

  return {
    usuario,
    formData,
    loading,
    saving,
    message,
    handleSave,
    handleCancel,
    handleInputChange
  };
};
