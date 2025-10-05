# Documentação do Módulo de Autenticação

## Visão Geral

O módulo de autenticação é responsável pelo controle de acesso ao sistema, gerenciando login, validação de tokens e impersonation. Este módulo está estável e **não deve ser alterado** sem uma revisão cuidadosa, pois é uma parte crítica do sistema que afeta todos os outros módulos.

## Endpoints

### POST `/auth/login`

**Descrição**: Realiza autenticação de usuários no sistema.

**Status**: ✅ Estável - Não alterar

**Parâmetros**:
```json
{
  "login": "string", // Email ou CPF do usuário
  "senha": "string", // Senha do usuário
  "grupo": "string"  // "aluno" ou "administrador"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt_token_aqui",
  "grupo": "aluno|administrador",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "login": "email@exemplo.com",
    // outros dados do usuário, sem a senha
  }
}
```

**Códigos de Erro**:
- `400 Bad Request`: Dados inválidos ou incompletos
- `401 Unauthorized`: Credenciais inválidas ou usuário inativo
- `500 Internal Server Error`: Erro interno no servidor

**Observações**: 
- Este endpoint é utilizado tanto pelo login de alunos quanto de administradores
- O frontend adiciona o campo `grupo` automaticamente dependendo da tela de login utilizada
- O token retornado deve ser incluído em todas as requisições subsequentes no header `Authorization: Bearer {token}`

### GET `/auth/me`

**Descrição**: Obtém os dados do usuário autenticado.

**Status**: ✅ Estável - Não alterar

**Autenticação**: Requer token JWT no header `Authorization: Bearer {token}`

**Resposta de Sucesso**:
```json
{
  "success": true,
  "message": "Dados do usuário obtidos com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "login": "email@exemplo.com",
    "grupo": {
      "id": 1,
      "nome": "aluno|administrador"
    }
    // outros dados do usuário, sem a senha
  }
}
```

**Códigos de Erro**:
- `401 Unauthorized`: Token inválido, expirado ou não fornecido
- `500 Internal Server Error`: Erro interno no servidor

**Observações**:
- Este endpoint é utilizado para verificar a autenticação e obter dados do usuário logado
- É chamado automaticamente após o login e quando o usuário acessa áreas protegidas

### POST `/auth/impersonate/:id`

**Descrição**: Permite que um administrador se passe por outro usuário.

**Status**: ✅ Estável - Não alterar

**Autenticação**: Requer token JWT de administrador no header `Authorization: Bearer {token}`

**Parâmetros de URL**:
- `id`: ID do usuário a ser impersonado

**Resposta de Sucesso**:
```json
{
  "success": true,
  "message": "Impersonation realizado com sucesso",
  "token": "jwt_token_impersonation",
  "usuario": {
    "id": 2,
    "nome": "Nome do Usuário Impersonado",
    "login": "aluno@exemplo.com",
    // outros dados do usuário impersonado
  }
}
```

**Códigos de Erro**:
- `401 Unauthorized`: Token inválido ou não fornecido
- `403 Forbidden`: Usuário não tem permissão para impersonar
- `404 Not Found`: Usuário a ser impersonado não encontrado
- `500 Internal Server Error`: Erro interno no servidor

**Observações**:
- Este endpoint é utilizado exclusivamente por administradores
- O token original do administrador deve ser armazenado para posterior restauração
- O frontend gerencia o estado de impersonation e os tokens correspondentes

## Implementação

### Arquivos Principais

- `backend/src/auth/controllers/autenticacaoController.ts`: Controlador de autenticação
- `backend/src/auth/services/servicoAutenticacao.ts`: Serviço de autenticação
- `backend/src/auth/guards/jwt-auth.guard.ts`: Guard para proteção de rotas
- `backend/src/auth/strategies/jwt.strategy.ts`: Estratégia JWT para Passport

### Fluxo de Autenticação

1. O usuário submete suas credenciais (login/senha/grupo)
2. O backend valida as credenciais e verifica o grupo do usuário
3. Se válido, gera um token JWT com as informações do usuário
4. O frontend armazena o token no localStorage
5. O token é enviado em todas as requisições subsequentes
6. O backend valida o token e extrai as informações do usuário

### Segurança

- Senhas são armazenadas com hash bcrypt
- Tokens JWT têm expiração configurável
- Tokens inválidos ou expirados são automaticamente rejeitados
- Impersonation é restrito a administradores e registrado em logs

## Integração com Frontend

O frontend utiliza o serviço `authService.js` para interagir com o módulo de autenticação:

- `loginAluno(credentials)`: Login específico para alunos
- `loginAdmin(credentials)`: Login específico para administradores
- `getToken()`: Obtém o token armazenado
- `isAuthenticated()`: Verifica se o usuário está autenticado
- `getUserRole()`: Obtém o papel do usuário autenticado

## Considerações para Manutenção

### ⚠️ IMPORTANTE: NÃO ALTERAR ESTE MÓDULO

Este módulo está estável e funciona corretamente com o frontend atual. Qualquer alteração pode quebrar a integração e causar problemas de autenticação. Se for absolutamente necessário fazer alterações:

1. Documente detalhadamente o motivo da alteração
2. Implemente controladores de redirecionamento para manter compatibilidade
3. Teste exaustivamente todas as funcionalidades afetadas
4. Atualize esta documentação

### Possíveis Melhorias Futuras (apenas após estabilização completa)

- Implementar refresh tokens para melhor experiência do usuário
- Adicionar autenticação de dois fatores para maior segurança
- Melhorar o sistema de permissões com controle mais granular
- Implementar rate limiting para prevenir ataques de força bruta

## Troubleshooting

### Problemas Comuns

1. **Token inválido ou expirado**
   - Verifique se o token está sendo enviado corretamente no header
   - Verifique se o token não expirou (padrão: 24 horas)
   - Tente fazer login novamente para obter um novo token

2. **Erro de CORS**
   - Verifique se o frontend está sendo servido da origem permitida
   - Verifique se os headers CORS estão configurados corretamente

3. **Usuário não autorizado para determinada ação**
   - Verifique se o usuário pertence ao grupo correto
   - Verifique se o endpoint está protegido pelo guard adequado

## Conclusão

O módulo de autenticação é uma parte crítica do sistema e deve ser tratado com cuidado. Ele está funcionando corretamente e não deve ser alterado sem uma necessidade clara e um plano de migração bem definido.
