# Guia de Integração Frontend - Stellar Ads SDK

## Índice
1. [Visão Geral](#visão-geral)
2. [Instalação e Setup Básico](#instalação-e-setup-básico)
3. [Configuração do Site](#configuração-do-site)
4. [Implementação Básica](#implementação-básica)
5. [Configurações Avançadas](#configurações-avançadas)
6. [Sistema de Recompensas](#sistema-de-recompensas)
7. [Monitoramento e Analytics](#monitoramento-e-analytics)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Exemplos Práticos](#exemplos-práticos)
10. [Troubleshooting](#troubleshooting)

## Visão Geral

O Stellar Ads SDK é uma solução completa de publicidade que integra pagamentos automatizados em XLM (Stellar Lumens) com um sistema de recompensas para usuários. O SDK é leve, fácil de integrar e compatível com qualquer site ou aplicação web.

### Características Principais
- **Matching Inteligente**: Anúncios são exibidos baseados no contexto da página
- **Pagamentos Automáticos**: Transações em XLM são processadas automaticamente
- **Sistema de Recompensas**: Usuários ganham XLM por interagir com anúncios
- **Analytics Integrado**: Métricas detalhadas de impressões e cliques
- **Compatibilidade Universal**: Funciona em qualquer site moderno

## Instalação e Setup Básico

### 1. Incluir o SDK
```html
<!DOCTYPE html>
<html>
<head>
    <title>Meu Site</title>
</head>
<body>
    <!-- Seu conteúdo aqui -->
    
    <!-- Incluir o SDK antes do fechamento do body -->
    <script src="https://seu-dominio.com/sdk.js"></script>
</body>
</html>
```

### 2. Configuração Mínima
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Configuração básica do SDK
    StellarAdsSDK.init({
        apiBaseUrl: 'http://localhost:3000',
        siteUrl: window.location.origin,
        userId: 'user-' + Math.random().toString(36).substr(2, 9)
    });
});
</script>
```

## Configuração do Site

### Registrar seu Site na Plataforma

Antes de usar o SDK, você precisa registrar seu site. Isso pode ser feito via API:

```javascript
// Exemplo de registro de site
fetch('http://localhost:3000/api/sites', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Meu Site de Notícias',
        url: 'https://meusite.com',
        category: 'news',
        stellarPublicKey: 'SUA_CHAVE_PUBLICA_STELLAR'
    })
})
.then(response => response.json())
.then(data => console.log('Site registrado:', data));
```

## Implementação Básica

### 1. Container para Anúncios
```html
<!-- Container onde o anúncio será exibido -->
<div id="stellar-ad-container" 
     data-ad-placement="banner-top"
     data-ad-size="728x90">
    <!-- O anúncio será carregado aqui -->
</div>
```

### 2. Inicialização do SDK
```javascript
document.addEventListener('DOMContentLoaded', function() {
    StellarAdsSDK.init({
        apiBaseUrl: 'http://localhost:3000',
        siteUrl: window.location.origin,
        userId: generateUserId(),
        
        // Configurações opcionais
        autoLoad: true,
        enableRewards: true,
        rewardCooldown: 300000, // 5 minutos em ms
        
        // Callbacks
        onAdLoaded: function(adData) {
            console.log('Anúncio carregado:', adData);
        },
        onAdClicked: function(adData) {
            console.log('Anúncio clicado:', adData);
        },
        onRewardEarned: function(reward) {
            console.log('Recompensa ganha:', reward);
            showRewardNotification(reward);
        },
        onError: function(error) {
            console.error('Erro no SDK:', error);
        }
    });
});

function generateUserId() {
    let userId = localStorage.getItem('stellar-ads-user-id');
    if (!userId) {
        userId = 'user-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('stellar-ads-user-id', userId);
    }
    return userId;
}
```

### 3. Carregamento Manual de Anúncios
```javascript
// Carregar anúncio específico
StellarAdsSDK.loadAd({
    container: 'stellar-ad-container',
    placement: 'banner-top',
    keywords: ['tecnologia', 'javascript'],
    size: '728x90'
});

// Carregar múltiplos anúncios
StellarAdsSDK.loadMultipleAds([
    {
        container: 'ad-sidebar',
        placement: 'sidebar',
        size: '300x250'
    },
    {
        container: 'ad-footer',
        placement: 'footer',
        size: '728x90'
    }
]);
```

## Configurações Avançadas

### 1. Configuração de Targeting
```javascript
StellarAdsSDK.init({
    apiBaseUrl: 'http://localhost:3000',
    siteUrl: window.location.origin,
    userId: generateUserId(),
    
    // Configurações de targeting
    targeting: {
        keywords: ['tecnologia', 'programação', 'javascript'],
        category: 'tech',
        language: 'pt-BR',
        geolocation: true // Permitir geolocalização para targeting
    },
    
    // Configurações de exibição
    display: {
        animateIn: true,
        fadeInDuration: 500,
        respectUserPrefs: true, // Respeitar preferências de cookies
        lazyLoad: true
    },
    
    // Configurações de recompensas
    rewards: {
        enabled: true,
        cooldown: 300000, // 5 minutos
        minimumViewTime: 3000, // 3 segundos
        showNotifications: true
    }
});
```

### 2. Configuração de Múltiplos Containers
```html
<!-- Diferentes posicionamentos -->
<div id="ad-header" data-ad-placement="header" data-ad-size="728x90"></div>
<div id="ad-sidebar" data-ad-placement="sidebar" data-ad-size="300x250"></div>
<div id="ad-content" data-ad-placement="in-content" data-ad-size="336x280"></div>
<div id="ad-footer" data-ad-placement="footer" data-ad-size="728x90"></div>

<script>
// Auto-detectar e carregar em todos os containers
StellarAdsSDK.autoLoadAds({
    selector: '[id^="ad-"]',
    respectViewport: true,
    lazyLoad: true,
    viewportOffset: 100 // Carregar quando estiver 100px da viewport
});
</script>
```

## Sistema de Recompensas

### 1. Interface de Recompensas
```html
<!-- Widget de recompensas -->
<div id="rewards-widget">
    <div id="rewards-balance">
        <span>Saldo: </span>
        <span id="current-balance">0 XLM</span>
    </div>
    <div id="rewards-actions">
        <button id="check-balance">Verificar Saldo</button>
        <button id="withdraw-rewards">Sacar Recompensas</button>
    </div>
</div>

<script>
// Gerenciar interface de recompensas
class RewardsManager {
    constructor() {
        this.init();
    }
    
    init() {
        document.getElementById('check-balance').addEventListener('click', () => {
            this.checkBalance();
        });
        
        document.getElementById('withdraw-rewards').addEventListener('click', () => {
            this.withdrawRewards();
        });
        
        // Atualizar saldo a cada 30 segundos
        setInterval(() => this.checkBalance(), 30000);
    }
    
    async checkBalance() {
        try {
            const response = await fetch(`http://localhost:3000/api/user-rewards?userId=${StellarAdsSDK.getUserId()}`);
            const data = await response.json();
            
            document.getElementById('current-balance').textContent = `${data.totalRewards} XLM`;
            
            return data;
        } catch (error) {
            console.error('Erro ao verificar saldo:', error);
        }
    }
    
    async withdrawRewards() {
        const userPublicKey = prompt('Digite sua chave pública Stellar:');
        if (!userPublicKey) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/withdraw-rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: StellarAdsSDK.getUserId(),
                    publicKey: userPublicKey
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Recompensas sacadas com sucesso! Hash da transação: ${result.transactionHash}`);
                this.checkBalance(); // Atualizar saldo
            } else {
                alert('Erro ao sacar recompensas: ' + result.error);
            }
        } catch (error) {
            console.error('Erro ao sacar recompensas:', error);
            alert('Erro ao sacar recompensas. Tente novamente.');
        }
    }
}

// Inicializar gerenciador de recompensas
const rewardsManager = new RewardsManager();
</script>
```

### 2. Notificações de Recompensas
```css
/* Estilos para notificações */
.reward-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInRight 0.5s ease-out;
    font-family: Arial, sans-serif;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.reward-notification.fadeOut {
    animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
```

```javascript
function showRewardNotification(reward) {
    const notification = document.createElement('div');
    notification.className = 'reward-notification';
    notification.innerHTML = `
        <strong>🎉 Recompensa Ganha!</strong><br>
        +${reward.amount} XLM por clique em anúncio
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}
```

## Monitoramento e Analytics

### 1. Tracking Customizado
```javascript
// Configurar eventos customizados
StellarAdsSDK.on('impression', function(data) {
    // Enviar para Google Analytics
    gtag('event', 'ad_impression', {
        'ad_id': data.adId,
        'campaign_id': data.campaignId,
        'placement': data.placement
    });
    
    // Enviar para sistema próprio de analytics
    sendToAnalytics('ad_impression', data);
});

StellarAdsSDK.on('click', function(data) {
    gtag('event', 'ad_click', {
        'ad_id': data.adId,
        'campaign_id': data.campaignId,
        'placement': data.placement,
        'reward_earned': data.rewardEarned
    });
    
    sendToAnalytics('ad_click', data);
});

function sendToAnalytics(event, data) {
    fetch('/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event: event,
            data: data,
            timestamp: Date.now(),
            page: window.location.pathname
        })
    });
}
```

### 2. Dashboard de Métricas
```javascript
// Criar dashboard simples de métricas
class AdsDashboard {
    constructor() {
        this.createDashboard();
        this.startTracking();
    }
    
    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'ads-dashboard';
        dashboard.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif; z-index: 9999;">
                <h4 style="margin: 0 0 10px 0;">Métricas de Anúncios</h4>
                <div>Impressões: <span id="impressions-count">0</span></div>
                <div>Cliques: <span id="clicks-count">0</span></div>
                <div>Recompensas: <span id="rewards-count">0 XLM</span></div>
                <div>CTR: <span id="ctr-rate">0%</span></div>
                <button onclick="this.parentElement.style.display='none'" style="margin-top: 10px; padding: 5px 10px;">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(dashboard);
    }
    
    startTracking() {
        let impressions = 0;
        let clicks = 0;
        let rewards = 0;
        
        StellarAdsSDK.on('impression', () => {
            impressions++;
            this.updateDashboard(impressions, clicks, rewards);
        });
        
        StellarAdsSDK.on('click', (data) => {
            clicks++;
            if (data.rewardEarned) {
                rewards += parseFloat(data.rewardAmount || 0);
            }
            this.updateDashboard(impressions, clicks, rewards);
        });
    }
    
    updateDashboard(impressions, clicks, rewards) {
        document.getElementById('impressions-count').textContent = impressions;
        document.getElementById('clicks-count').textContent = clicks;
        document.getElementById('rewards-count').textContent = rewards.toFixed(4) + ' XLM';
        
        const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : 0;
        document.getElementById('ctr-rate').textContent = ctr + '%';
    }
}

// Ativar apenas em desenvolvimento
if (window.location.hostname === 'localhost') {
    new AdsDashboard();
}
```

## Tratamento de Erros

### 1. Error Handling Robusto
```javascript
StellarAdsSDK.init({
    // ... outras configurações
    
    onError: function(error, context) {
        console.error('Erro no Stellar Ads SDK:', error);
        
        // Log estruturado do erro
        const errorLog = {
            error: error.message,
            stack: error.stack,
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        // Enviar erro para serviço de logging
        fetch('/api/log-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorLog)
        }).catch(e => console.error('Falha ao enviar log de erro:', e));
        
        // Fallback gracioso
        handleSDKError(error, context);
    }
});

function handleSDKError(error, context) {
    switch (context) {
        case 'ad-load':
            // Mostrar placeholder ou anúncio padrão
            showFallbackAd();
            break;
            
        case 'reward-claim':
            // Informar usuário sobre erro na recompensa
            showErrorMessage('Erro ao processar recompensa. Tente novamente.');
            break;
            
        case 'network':
            // Tentar reconectar após delay
            setTimeout(() => {
                StellarAdsSDK.reconnect();
            }, 5000);
            break;
            
        default:
            console.warn('Erro não tratado:', error);
    }
}

function showFallbackAd() {
    const containers = document.querySelectorAll('[id^="ad-"], .stellar-ad-container');
    containers.forEach(container => {
        if (container.innerHTML.trim() === '') {
            container.innerHTML = `
                <div style="background: #f5f5f5; padding: 20px; text-align: center; border: 1px dashed #ccc;">
                    <p>Publicidade</p>
                    <small>Anúncio temporariamente indisponível</small>
                </div>
            `;
        }
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff6b6b; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10001;">
            ${message}
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}
```

## Exemplos Práticos

### 1. Blog/Site de Notícias
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notícias Tech - Com Stellar Ads</title>
    <style>
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .ad-banner {
            margin: 20px 0;
            text-align: center;
        }
        .ad-sidebar {
            float: right;
            width: 300px;
            margin: 0 0 20px 20px;
        }
        .rewards-widget {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="rewards-widget">
        <div>💰 Seus XLM: <span id="balance">0</span></div>
        <button onclick="checkRewards()">Verificar</button>
    </div>
    
    <div class="article-container">
        <header>
            <!-- Banner superior -->
            <div id="ad-header" class="ad-banner" data-ad-placement="header" data-ad-size="728x90"></div>
        </header>
        
        <article>
            <!-- Sidebar ad -->
            <div id="ad-sidebar" class="ad-sidebar" data-ad-placement="sidebar" data-ad-size="300x250"></div>
            
            <h1>Nova Tecnologia Revoluciona o Mercado</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            
            <!-- Ad no meio do conteúdo -->
            <div id="ad-content" class="ad-banner" data-ad-placement="in-content" data-ad-size="336x280"></div>
            
            <p>Mais conteúdo aqui...</p>
        </article>
        
        <footer>
            <!-- Banner inferior -->
            <div id="ad-footer" class="ad-banner" data-ad-placement="footer" data-ad-size="728x90"></div>
        </footer>
    </div>
    
    <script src="http://localhost:3000/sdk.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            StellarAdsSDK.init({
                apiBaseUrl: 'http://localhost:3000',
                siteUrl: window.location.origin,
                userId: generateUserId(),
                
                targeting: {
                    keywords: ['tecnologia', 'inovação', 'startup'],
                    category: 'tech'
                },
                
                onRewardEarned: function(reward) {
                    updateBalance();
                    showRewardNotification(reward);
                }
            });
        });
        
        async function checkRewards() {
            try {
                const response = await fetch(`http://localhost:3000/api/user-rewards?userId=${StellarAdsSDK.getUserId()}`);
                const data = await response.json();
                document.getElementById('balance').textContent = data.totalRewards;
            } catch (error) {
                console.error('Erro ao verificar recompensas:', error);
            }
        }
        
        function generateUserId() {
            let userId = localStorage.getItem('stellar-ads-user-id');
            if (!userId) {
                userId = 'user-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('stellar-ads-user-id', userId);
            }
            return userId;
        }
    </script>
</body>
</html>
```

### 2. E-commerce
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Loja Online - Com Stellar Ads</title>
</head>
<body>
    <header>
        <div id="ad-header" data-ad-placement="header" data-ad-size="728x90"></div>
    </header>
    
    <main class="product-grid">
        <!-- Produtos aqui -->
        <div class="product">Produto 1</div>
        <div class="product">Produto 2</div>
        
        <!-- Ad entre produtos -->
        <div id="ad-product-grid" data-ad-placement="product-grid" data-ad-size="300x250"></div>
        
        <div class="product">Produto 3</div>
        <div class="product">Produto 4</div>
    </main>
    
    <script src="http://localhost:3000/sdk.js"></script>
    <script>
        StellarAdsSDK.init({
            apiBaseUrl: 'http://localhost:3000',
            siteUrl: window.location.origin,
            userId: generateUserId(),
            
            targeting: {
                keywords: ['compras', 'produtos', 'ofertas'],
                category: 'ecommerce'
            },
            
            // Configurações específicas para e-commerce
            rewards: {
                enabled: true,
                cooldown: 600000, // 10 minutos para evitar spam
                minimumViewTime: 5000 // 5 segundos
            }
        });
    </script>
</body>
</html>
```

## Troubleshooting

### Problemas Comuns

#### 1. Anúncios não carregam
```javascript
// Debug de carregamento
StellarAdsSDK.debug = true; // Ativar logs detalhados

// Verificar se o site está registrado
fetch('http://localhost:3000/api/validate-site?url=' + encodeURIComponent(window.location.origin))
    .then(response => response.json())
    .then(data => {
        if (!data.isValid) {
            console.error('Site não registrado na plataforma');
        }
    });
```

#### 2. Recompensas não funcionam
```javascript
// Verificar configuração de recompensas
console.log('Configuração de recompensas:', StellarAdsSDK.getConfig().rewards);

// Verificar cooldown
const lastReward = localStorage.getItem('stellar-ads-last-reward');
if (lastReward) {
    const timeSince = Date.now() - parseInt(lastReward);
    console.log('Tempo desde última recompensa:', timeSince / 1000, 'segundos');
}
```

#### 3. Problemas de CORS
```javascript
// Se estiver rodando em domínio diferente, configure CORS
// No backend (index.js), adicione:
app.use(cors({
    origin: ['http://localhost:3000', 'https://seudominio.com'],
    credentials: true
}));
```

### Logs e Debugging

```javascript
// Ativar modo debug
StellarAdsSDK.debug = true;

// Obter logs detalhados
const logs = StellarAdsSDK.getLogs();
console.table(logs);

// Limpar logs
StellarAdsSDK.clearLogs();

// Status do SDK
const status = StellarAdsSDK.getStatus();
console.log('Status do SDK:', status);
```

## Próximos Passos

### 1. Migração para Produção
- Alterar `apiBaseUrl` para URL de produção
- Configurar chaves Stellar mainnet
- Implementar rate limiting
- Configurar monitoramento

### 2. Otimizações
- Lazy loading de anúncios
- Caching de configurações
- Compressão do SDK
- CDN para distribuição

### 3. Integrações Avançadas
- Google Analytics 4
- Facebook Pixel
- Custom events
- A/B testing

---

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se o site está registrado
3. Teste em modo debug
4. Entre em contato com suporte técnico

## Changelog

- **v1.0.0**: Versão inicial com funcionalidades básicas
- **v1.1.0**: Adicionado sistema de recompensas
- **v1.2.0**: Melhorias na performance e debugging

---

*Este documento será atualizado conforme novas funcionalidades forem adicionadas ao SDK.*
