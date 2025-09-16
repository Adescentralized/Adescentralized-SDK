# Guia de Integração: SDK + Extensão do Navegador

Este guia explica como integrar o SDK Stellar Ads com a extensão do navegador para criar um sistema completo de recompensas em criptomoedas.

## 📋 Visão Geral

A arquitetura funciona da seguinte forma:

1. **Extensão do Navegador** - Gerencia a carteira Stellar do usuário
2. **SDK JavaScript** - Carrega anúncios e detecta a carteira da extensão
3. **Backend Node.js** - Processa impressões, cliques e envia recompensas
4. **Rede Stellar** - Processa os pagamentos em XLM

## 🔧 Como Funciona

### Fluxo de Integração

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Extensão     │    │       SDK       │    │     Backend     │
│   (Carteira)    │◄──►│   (Anúncios)    │◄──►│   (Payments)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                        ┌─────────────────┐
                        │ Stellar Network │
                        │   (Blockchain)  │
                        └─────────────────┘
```

### 1. Extensão do Navegador

A extensão é responsável por:
- Gerar/carregar carteira Stellar do usuário
- Injetar dados da carteira no `window` do navegador
- Receber callbacks do SDK sobre recompensas
- Mostrar notificações e atualizar UI

#### Estrutura da Extensão

```javascript
// Dados injetados no window
window.stellarAdsExtension = {
  version: "1.0.0",
  userWallet: {
    publicKey: "GCRA5QT7SCL73IZYYYVXE53OSPPB233DM3SDGGW2HBTV43PVDRYS3PIV",
    createdAt: "2025-09-16T10:30:00.000Z"
    // NUNCA expor a chave privada!
  },
  onRewardReceived: (rewardData) => { /* callback */ },
  onWalletUpdated: (newBalance) => { /* callback */ }
};
```

#### Implementação Mínima

```javascript
class StellarAdsExtension {
  async initialize() {
    // Gerar ou carregar carteira
    this.userWallet = await this.getOrCreateWallet();
    
    // Injetar no window
    window.stellarAdsExtension = {
      userWallet: {
        publicKey: this.userWallet.publicKey,
        createdAt: this.userWallet.createdAt
      },
      onRewardReceived: this.onRewardReceived.bind(this)
    };
    
    // Notificar SDK se já estiver carregado
    if (window.StellarAdsSDK) {
      window.StellarAdsSDK.onExtensionReady(window.stellarAdsExtension);
    }
  }
  
  onRewardReceived(reward) {
    // Mostrar notificação
    chrome.notifications.create({
      type: 'basic',
      title: 'Recompensa Recebida!',
      message: `Você ganhou ${reward.amount} XLM`
    });
  }
}
```

### 2. SDK JavaScript

O SDK foi modificado para:
- Detectar automaticamente a extensão
- Incluir dados da carteira nas requisições
- Processar recompensas em tempo real
- Mostrar informações personalizadas

#### Uso do SDK

```html
<!-- Método 1: Via HTML -->
<div id="stellar-ad-container" 
     data-site-id="meu-site-123" 
     data-tags="tech,crypto,news">
</div>
<script src="https://api.sua-plataforma.com/sdk.js"></script>

<!-- Método 2: Via JavaScript -->
<script>
window.StellarAdsConfig = {
  siteId: 'meu-site-123',
  tags: ['tech', 'crypto', 'news'],
  containerId: 'meu-container-custom'
};
</script>
<script src="https://api.sua-plataforma.com/sdk.js"></script>
```

### 3. Backend (APIs)

Novas rotas implementadas:

#### `POST /api/user-wallet`
Registra carteira do usuário
```javascript
{
  "publicKey": "GCRA5QT7SCL73IZYYYVXE53OSPPB233DM3SDGGW2HBTV43PVDRYS3PIV"
}
```

#### `GET /api/user-balance?publicKey=...`
Consulta saldo da carteira
```javascript
{
  "success": true,
  "balance": 1.2345,
  "publicKey": "GCRA5..."
}
```

#### `POST /api/impression` (Modificada)
Registra impressão com dados da carteira
```javascript
{
  "campaignId": "camp-123",
  "siteId": "site-456",
  "userPublicKey": "GCRA5...", // Novo campo
  "hasWallet": true           // Novo campo
}
```

Resposta inclui recompensa:
```javascript
{
  "success": true,
  "message": "Impressão registrada",
  "userReward": {              // Novo campo
    "amount": 0.001,
    "transactionId": "abc123...",
    "type": "impression"
  }
}
```

## 🚀 Como Implementar

### Passo 1: Criar a Extensão

1. Crie o manifest da extensão:
```json
{
  "manifest_version": 3,
  "name": "Stellar Ads Wallet",
  "version": "1.0.0",
  "description": "Ganhe XLM visualizando anúncios",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ],
  "permissions": ["storage", "notifications"]
}
```

2. Implemente o content script (`content.js`):
```javascript
// Use o código do exemplo extension-example.js
// Adapte para suas necessidades específicas
```

### Passo 2: Integrar o SDK

1. Configure o SDK no seu site:
```html
<div id="stellar-ad-container" data-site-id="SEU_SITE_ID"></div>
<script src="https://sua-api.com/sdk.js"></script>
```

2. O SDK detectará automaticamente a extensão

### Passo 3: Configurar Backend

1. Configure as variáveis de ambiente:
```env
STELLAR_NETWORK=testnet
PLATFORM_SECRET_KEY=sua_chave_secreta_stellar
```

2. Execute o servidor:
```bash
npm start
```

## 📊 Monitoramento

### Logs do Sistema

O sistema produz logs detalhados:

```
🔍 Solicitação de anúncio para site: demo-site
💳 Carteira do usuário encontrada: GCRA5...
📊 Registrando impressão - Com carteira
💰 Recompensa processada: 0.001 XLM
✅ Pagamento enviado! TX: abc123...
```

### Métricas Disponíveis

- Usuários com carteira vs sem carteira
- Taxa de recompensas processadas
- Volume total de XLM distribuído
- Impressões e cliques por site

## 🔒 Segurança

### Boas Práticas

1. **NUNCA** exponha chaves privadas no `window`
2. **SEMPRE** valide dados no backend
3. **LIMITE** recompensas por tempo (cooldown)
4. **MONITORE** transações suspeitas
5. **USE** HTTPS em produção

### Validação de Carteiras

```javascript
// No backend, sempre validar formato da chave
function isValidStellarKey(key) {
  return /^G[A-Z0-9]{55}$/.test(key);
}
```

## 📱 Demonstração

Acesse a página de demo incluída no projeto:
`http://localhost:3000/sdk-extension-demo.html`

Esta página mostra:
- Status da extensão em tempo real
- Simulação de impressões e cliques
- Processamento de recompensas
- Logs do sistema

## 🔧 Troubleshooting

### Extensão não detectada
- Verifique se `window.stellarAdsExtension` existe
- Confirme que a extensão está instalada e ativa
- Verifique o console para erros

### Recompensas não processadas
- Confirme configuração das chaves Stellar
- Verifique saldo da conta da plataforma
- Analise logs do backend para erros

### Performance
- Use debounce para evitar requisições excessivas
- Implemente cache local na extensão
- Monitore uso de CPU/memória

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Teste com a página de demonstração
3. Consulte a documentação da API Stellar
4. Abra uma issue no repositório

---

**Nota**: Este sistema está em desenvolvimento. Use apenas em ambiente de teste com a rede Stellar Testnet.
