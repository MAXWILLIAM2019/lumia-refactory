import React, { useState } from 'react';
import api from '../../../services/api';
import { alunoService } from '../../../services/alunoService';

const AlterarSenhaTab = () => {
  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSenhaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Validações básicas
      if (!senhaData.senhaAtual) {
        throw new Error('Senha atual é obrigatória');
      }
      if (!senhaData.novaSenha) {
        throw new Error('Nova senha é obrigatória');
      }
      if (senhaData.novaSenha.length < 6) {
        throw new Error('Nova senha deve ter pelo menos 6 caracteres');
      }
      if (senhaData.novaSenha !== senhaData.confirmarSenha) {
        throw new Error('Confirmação de senha não confere');
      }

      // Buscar ID do usuário logado
      const response = await api.get('/auth/me');
      const userId = response.data.aluno?.id || response.data.usuario?.IdUsuario;
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Chamar serviço para alterar senha
      await alunoService.definirSenha(userId, {
        senhaAtual: senhaData.senhaAtual,
        novaSenha: senhaData.novaSenha
      });
      
      setMessage('Senha alterada com sucesso!');
      setSenhaData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      // Tratar erros específicos da API
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage('Erro ao alterar senha. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSenhaData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
    setMessage('');
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ 
        color: '#f9fafb', 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '24px',
        borderBottom: '2px solid #374151',
        paddingBottom: '12px'
      }}>
        Alterar senha
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Senha atual
        </label>
        <input
          type="password"
          name="senhaAtual"
          value={senhaData.senhaAtual}
          onChange={handleInputChange}
          placeholder="Digite sua senha atual"
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Nova senha
        </label>
        <input
          type="password"
          name="novaSenha"
          value={senhaData.novaSenha}
          onChange={handleInputChange}
          placeholder="Digite sua nova senha"
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        />
        <p style={{ 
          color: '#6b7280', 
          fontSize: '12px', 
          marginTop: '4px' 
        }}>
          Mínimo de 6 caracteres
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ 
          display: 'block', 
          color: '#d1d5db', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px' 
        }}>
          Confirmar nova senha
        </label>
        <input
          type="password"
          name="confirmarSenha"
          value={senhaData.confirmarSenha}
          onChange={handleInputChange}
          placeholder="Confirme sua nova senha"
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '16px'
          }}
        />
      </div>

      {message && (
        <div style={{ 
          marginBottom: '24px',
          padding: '12px 16px',
          backgroundColor: message.includes('sucesso') ? '#065f46' : '#7f1d1d',
          border: `1px solid ${message.includes('sucesso') ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          color: '#f9fafb',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        justifyContent: 'flex-end' 
      }}>
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#d1d5db',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: saving ? '#6b7280' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Alterando...' : 'Alterar senha'}
        </button>
      </div>
    </div>
  );
};

export default AlterarSenhaTab;

