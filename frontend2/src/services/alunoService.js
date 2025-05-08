const API_URL = 'http://localhost:3000/api';

export const alunoService = {
  async cadastrarAluno(alunoData) {
    try {
      const response = await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alunoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar aluno');
      }

      return data;
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      throw error;
    }
  },

  async listarAlunos() {
    try {
      const response = await fetch(`${API_URL}/alunos`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar alunos');
      }

      return data;
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  },

  async buscarAlunoPorId(id) {
    try {
      const response = await fetch(`${API_URL}/alunos/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar aluno');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }
  }
}; 