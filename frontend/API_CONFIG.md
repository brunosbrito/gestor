# Configuração da API

## URLs de API

### Desenvolvimento
- URL Local: `http://localhost:8000/api/v1`

### Produção
- URL Produção: `https://apigestorcustos.gmxindustrial.com.br/api/v1`

## Como Configurar

### 1. Arquivo .env
Crie um arquivo `.env` na raiz do projeto frontend:

```bash
# Para desenvolvimento
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Para produção
VITE_API_BASE_URL=https://apigestorcustos.gmxindustrial.com.br/api/v1
```

### 2. Configuração Automática
O sistema detecta automaticamente o ambiente:

- **Desenvolvimento** (`npm run dev`): usa `http://localhost:8000/api/v1`
- **Produção** (`npm run build`): usa `https://apigestorcustos.gmxindustrial.com.br/api/v1`

### 3. Arquivo de Configuração
O arquivo `src/config/api.ts` contém todas as configurações da API:

```typescript
export const getApiConfig = () => {
  const env = import.meta.env.MODE || 'development';

  const configs = {
    development: {
      BASE_URL: 'http://localhost:8000/api/v1',
    },
    production: {
      BASE_URL: 'https://apigestorcustos.gmxindustrial.com.br/api/v1',
    },
  };

  return configs[env] || configs.development;
};
```

## Login de Teste

### Credenciais
- **Email**: `admin@test.com`
- **Senha**: `admin123`
- **Username**: `admin` (também funciona)

### Teste via curl
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@test.com&password=admin123"
```

## Status do Sistema

✅ **CORS**: Configurado para permitir qualquer URL
✅ **Autenticação**: Login por email/username + senha funcionando
✅ **API Base URL**: Configurada para GMX Industrial
✅ **Frontend**: Usando configuração dinâmica da API
✅ **Backend**: Rodando em `http://localhost:8000`
✅ **Rota /me**: Funcionando corretamente