# Microserviço Mentor

Este serviço é responsável pelo cadastro de sprints e atividades dos mentorados.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o serviço em modo desenvolvimento:
   ```bash
   npm run dev
   ```

O serviço estará disponível em `http://localhost:3001` (ou na porta definida no arquivo `.env`).

## Endpoints iniciais
- `GET /health` — Verifica se o serviço está online.

## Próximos passos
- Implementar rotas para cadastro de sprint e atividades. 