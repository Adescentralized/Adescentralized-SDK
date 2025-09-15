# 🚀 Stellar Ads SDK

Uma plataforma de anúncios descentralizada com pagamentos automatizados via Stellar Blockchain.

## 📋 Visão Geral

Este projeto implementa um SDK completo para uma plataforma de anúncios que integra:

- **Backend Node.js/Express** com endpoints para servir anúncios e rastrear cliques
- **SDK JavaScript** leve para integração em sites de editores
- **Integração com Stellar Blockchain** para pagamentos automatizados
- **Base de dados SQLite** para armazenar campanhas, sites e métricas

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Site Editor   │    │   Backend API   │    │ Stellar Network │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │    SDK    │◄─┼────┤  │    API    │◄─┼────┤  │ Payments  │  │
│  │   (JS)    │  │    │  │(Node.js)  │  │    │  │   (XLM)   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <seu-repositorio>
cd sdk

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar em modo desenvolvimento
npm run dev
```

### Teste da Aplicação

1. **Acesse a página de demonstração:**

   ```
   http://localhost:3000
   ```

2. **Teste os endpoints da API:**

   ```bash
   # Buscar anúncio
   curl "http://localhost:3000/api/ad?siteId=site_example_123"

   # Ver estatísticas
   curl "http://localhost:3000/api/stats"

   # Health check
   curl "http://localhost:3000/health"
   ```

## 💡 Como Integrar o SDK

### Para Editores (Donos de Sites)

#### Passo 1: Adicionar Container

```html
<!-- Container onde o anúncio será exibido -->
<div id="stellar-ad-container" style="width: 300px; height: 250px;"></div>
```

#### Passo 2: Incluir o SDK

```html
<!-- Substitua SEU_SITE_ID pelo seu ID real -->
<script src="https://api.sua-plataforma.com/sdk.js?siteId=SEU_SITE_ID"></script>
```

#### Pronto!

O anúncio será carregado automaticamente. Cliques são rastreados e pagamentos processados via Stellar.

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
# Configurações obrigatórias
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000
DATABASE_PATH=./database.sqlite

# Configurações Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
PLATFORM_SECRET_KEY=seu_stellar_secret_key_aqui
PLATFORM_PUBLIC_KEY=seu_stellar_public_key_aqui

# URLs e CORS
DEFAULT_CLICK_REDIRECT_URL=https://example.com
CORS_ORIGIN=*
```

### Stellar Blockchain

1. **Para desenvolvimento (Testnet):**

   - Use `STELLAR_NETWORK=testnet`
   - Crie contas de teste em: https://laboratory.stellar.org/

2. **Para produção (Mainnet):**
   - Use `STELLAR_NETWORK=mainnet`
   - Configure chaves reais da Stellar

## 📚 API Reference

### Endpoints Principais

#### `GET /api/ad`

Busca anúncio para um site específico.

**Parâmetros:**

- `siteId` (obrigatório): ID do site solicitante

**Resposta:**

```json
{
  "success": true,
  "ad": {
    "campaignId": "campaign_tech_001",
    "advertiserName": "TechStartup Inc",
    "imageUrl": "https://...",
    "clickUrl": "https://api.../api/click?campaignId=...",
    "costPerClick": 0.1
  }
}
```

#### `GET /api/click`

Rastreia cliques e processa pagamentos.

**Parâmetros:**

- `campaignId` (obrigatório): ID da campanha
- `siteId` (obrigatório): ID do site

**Resposta:** Redirecionamento HTTP 302

#### `GET /api/stats`

Retorna estatísticas da plataforma.

**Resposta:**

```json
{
  "success": true,
  "stats": {
    "totalClicks": 42,
    "totalRevenue": 4.2,
    "activeCampaigns": 5,
    "activeSites": 3
  }
}
```

## 📁 Estrutura do Projeto

```
sdk/
├── src/
│   ├── models/
│   │   └── database.js          # Modelo de dados SQLite
│   ├── routes/
│   │   └── adRoutes.js          # Rotas da API
│   └── services/
│       ├── adMatchingService.js # Lógica de matching de anúncios
│       └── stellarService.js    # Integração Stellar
├── public/
│   ├── sdk.js                   # SDK JavaScript
│   └── index.html               # Página de demonstração
├── index.js                     # Servidor principal
├── .env                         # Configurações
└── database.sqlite              # Banco SQLite (criado automaticamente)
```

## 🔧 Scripts NPM

```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Testes (a implementar)
npm test
```

## 💰 Fluxo de Pagamentos

1. **Clique no Anúncio:** Usuário clica no anúncio no site do editor
2. **Redirecionamento:** Usuário é redirecionado imediatamente para o anunciante
3. **Processamento Assíncrono:**
   - Clique é registrado no banco de dados
   - Pagamento é calculado (ex: 0.10 XLM)
   - Transação Stellar é criada:
     - 70% vai para o editor
     - 30% fica com a plataforma
4. **Confirmação:** Status do pagamento é atualizado

## 🔍 Monitoramento

### Logs

O sistema gera logs detalhados para:

- Solicitações de anúncios
- Cliques registrados
- Pagamentos processados
- Erros e exceções

### Métricas Disponíveis

- Total de cliques (24h)
- Receita total
- Campanhas ativas
- Sites ativos
- Taxa média por clique

## 🛡️ Segurança

### Medidas Implementadas

- **Helmet.js:** Proteção contra vulnerabilidades comuns
- **CORS:** Controle de origem cruzada
- **Rate Limiting:** Proteção contra spam (a implementar)
- **Validação:** Sanitização de inputs
- **Logging:** Rastreamento de atividades

### Stellar Blockchain

- Transações transparentes e imutáveis
- Sem necessidade de tokens proprietários
- Pagamentos diretos em XLM (Lumens)

## 🚀 Deploy

### Desenvolvimento Local

```bash
npm run dev
```

### Produção

```bash
# Configurar variáveis de ambiente de produção
export NODE_ENV=production
export STELLAR_NETWORK=mainnet

# Iniciar servidor
npm start
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 Roadmap

- [ ] **v1.1:** Sistema de autenticação para anunciantes
- [ ] **v1.2:** Dashboard web para gestão de campanhas
- [ ] **v1.3:** Algoritmos avançados de targeting
- [ ] **v1.4:** Suporte a múltiplos formatos de anúncios
- [ ] **v1.5:** Analytics avançados e relatórios
- [ ] **v2.0:** Integração com outros blockchains

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Issues:** Use o GitHub Issues para reportar bugs
- **Documentação:** Consulte este README e os comentários no código
- **Stellar:** [Documentação oficial da Stellar](https://developers.stellar.org/)

---

**Desenvolvido com ❤️ para a comunidade blockchain**
