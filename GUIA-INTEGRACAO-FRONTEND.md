# 🚀 Guia de Integração Frontend - Stellar Ads SDK

**Versão**: 1.0.0  
**Data**: 15 de setembro de 2025  
**Compatibilidade**: Todos os navegadores modernos

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Integração Básica](#integração-básica)
3. [Configuração Avançada](#configuração-avançada)
4. [Personalização Visual](#personalização-visual)
5. [Gerenciamento de Eventos](#gerenciamento-de-eventos)
6. [Monitoramento e Analytics](#monitoramento-e-analytics)
7. [Troubleshooting](#troubleshooting)
8. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O **Stellar Ads SDK** é uma biblioteca JavaScript leve (~17KB) que permite integrar anúncios contextualizados em qualquer site. Os usuários ganham recompensas em XLM (Stellar Lumens) por visualizações e cliques, criando um modelo de monetização inovador e descentralizado.

### ✨ Características Principais:
- 🎯 **Matching inteligente** por tags/categorias
- 💰 **Recompensas automáticas** em criptomoeda
- 🔄 **Carregamento assíncrono** sem bloquear o site
- 📱 **Responsivo** para todos os dispositivos
- 🔒 **Seguro** com proteção anti-fraude
- ⚡ **Performance otimizada** com cache inteligente

---

## 🚀 Integração Básica

### Método 1: Integração HTML Simples (Recomendado)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Meu Site</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <!-- Seu conteúdo aqui -->
    <h1>Meu Blog Incrível</h1>
    <p>Conteúdo interessante...</p>

    <!-- Container do anúncio -->
    <div id="stellar-ad-container" 
         data-site-id="SEU_SITE_ID_AQUI" 
         data-tags="tecnologia,programacao,startups">
    </div>

    <!-- SDK Script -->
    <script src="https://sua-api.com/sdk.js"></script>
</body>
</html>
```

### Método 2: Integração JavaScript Programática

```html
<!-- Container vazio -->
<div id="meu-container-ads"></div>

<script>
// Configuração global antes de carregar o SDK
window.StellarAdsConfig = {
    siteId: 'SEU_SITE_ID_AQUI',
    tags: ['tecnologia', 'programacao', 'startups'],
    containerId: 'meu-container-ads',
    apiUrl: 'https://sua-api.com',
    debug: false // true para logs detalhados
};
</script>
<script src="https://sua-api.com/sdk.js"></script>
```

---

## ⚙️ Configuração Avançada

### Parâmetros de Configuração Completos

```javascript
window.StellarAdsConfig = {
    // === OBRIGATÓRIOS ===
    siteId: 'site_exemplo_123',              // ID do seu site
    
    // === OPCIONAIS ===
    tags: ['tech', 'crypto', 'dev'],         // Tags para matching
    containerId: 'stellar-ad-container',     // ID do container
    apiUrl: 'https://api.stellarads.com',    // URL da API
    
    // === CONFIGURAÇÕES VISUAIS ===
    theme: 'light',                          // 'light', 'dark', 'auto'
    maxWidth: '300px',                       // Largura máxima
    borderRadius: '8px',                     // Border radius
    showPoweredBy: true,                     // Mostrar "Powered by Stellar Ads"
    
    // === COMPORTAMENTO ===
    autoRefresh: true,                       // Auto-renovar anúncios
    refreshInterval: 30000,                  // Intervalo em ms (30s)
    enableRewards: true,                     // Sistema de recompensas
    clickOpenNewTab: true,                   // Abrir cliques em nova aba
    
    // === DEBUGGING ===
    debug: false,                            // Logs detalhados
    testMode: false,                         // Modo de teste (sem pagamentos)
    
    // === CALLBACKS ===
    onAdLoaded: function(adData) {
        console.log('Anúncio carregado:', adData);
    },
    onAdClicked: function(adData) {
        console.log('Anúncio clicado:', adData);
    },
    onRewardEarned: function(rewardData) {
        console.log('Recompensa recebida:', rewardData);
    },
    onError: function(error) {
        console.error('Erro no SDK:', error);
    }
};
```

### Configuração por Data Attributes

```html
<div id="stellar-ad-container"
     data-site-id="site_exemplo_123"
     data-tags="tecnologia,programacao,startups"
     data-theme="dark"
     data-max-width="400px"
     data-auto-refresh="true"
     data-refresh-interval="45000"
     data-debug="false">
</div>
```

---

## 🎨 Personalização Visual

### CSS Customizado

```css
/* Container principal */
.stellar-ad-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.stellar-ad-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

/* Imagem do anúncio */
.stellar-ad-image {
    border-radius: 8px;
    max-width: 100%;
    height: auto;
    object-fit: cover;
}

/* Texto do anúncio */
.stellar-ad-title {
    font-size: 1.2em;
    font-weight: bold;
    color: #333;
    margin: 10px 0 5px 0;
}

.stellar-ad-description {
    color: #666;
    font-size: 0.9em;
    line-height: 1.4;
}

/* Botão de ação */
.stellar-ad-cta {
    background: #00d2ff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 15px;
    transition: background 0.3s ease;
}

.stellar-ad-cta:hover {
    background: #00b8e6;
}

/* Contador de recompensas */
.stellar-rewards-display {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid #ffd700;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 0.8em;
    color: #b8860b;
    margin-top: 10px;
    text-align: center;
}

/* Tema escuro */
[data-theme="dark"] .stellar-ad-container {
    background: #1a1a1a;
    color: #ffffff;
}

[data-theme="dark"] .stellar-ad-title {
    color: #ffffff;
}

[data-theme="dark"] .stellar-ad-description {
    color: #cccccc;
}
```

### Templates Customizados

```javascript
// Definir template customizado
window.StellarAdsConfig = {
    siteId: 'seu_site',
    customTemplate: function(adData) {
        return `
            <div class="meu-ad-customizado">
                <div class="ad-header">
                    <span class="ad-category">${adData.category || 'Anúncio'}</span>
                    <span class="ad-rewards">+${adData.rewardAmount} XLM</span>
                </div>
                <img src="${adData.imageUrl}" alt="${adData.advertiserName}" class="ad-image">
                <div class="ad-content">
                    <h3 class="ad-title">${adData.advertiserName}</h3>
                    <p class="ad-description">${adData.description || 'Clique para saber mais'}</p>
                    <button class="ad-button" onclick="StellarAdsSDK.clickAd('${adData.campaignId}')">
                        Visitar Site
                    </button>
                </div>
            </div>
        `;
    }
};
```

---

## 🔄 Gerenciamento de Eventos

### Eventos Disponíveis

```javascript
// Escutar todos os eventos do SDK
document.addEventListener('stellarAds:loaded', function(event) {
    console.log('SDK carregado:', event.detail);
});

document.addEventListener('stellarAds:adRequested', function(event) {
    console.log('Solicitando anúncio...', event.detail);
});

document.addEventListener('stellarAds:adLoaded', function(event) {
    console.log('Anúncio carregado:', event.detail);
    // event.detail contém: { campaignId, advertiserName, imageUrl, clickUrl }
});

document.addEventListener('stellarAds:adClicked', function(event) {
    console.log('Anúncio clicado:', event.detail);
    // Integrar com Google Analytics, Facebook Pixel, etc.
    gtag('event', 'stellar_ad_click', {
        'campaign_id': event.detail.campaignId,
        'advertiser': event.detail.advertiserName
    });
});

document.addEventListener('stellarAds:rewardEarned', function(event) {
    console.log('Recompensa recebida:', event.detail);
    // event.detail contém: { amount, type, total }
    
    // Mostrar notificação personalizada
    showNotification(`Você ganhou ${event.detail.amount} XLM!`);
});

document.addEventListener('stellarAds:error', function(event) {
    console.error('Erro no SDK:', event.detail);
    // Implementar fallback ou log de erro
});
```

### Controle Programático

```javascript
// Aguardar o SDK estar carregado
window.addEventListener('load', function() {
    if (window.StellarAdsSDK) {
        
        // Buscar novo anúncio manualmente
        StellarAdsSDK.refreshAd();
        
        // Pausar auto-refresh
        StellarAdsSDK.pauseAutoRefresh();
        
        // Retomar auto-refresh
        StellarAdsSDK.resumeAutoRefresh();
        
        // Obter dados do usuário
        StellarAdsSDK.getUserRewards().then(rewards => {
            console.log('Recompensas do usuário:', rewards);
            document.getElementById('user-balance').textContent = 
                `${rewards.totalEarnedXLM} XLM`;
        });
        
        // Configurar tags dinamicamente
        StellarAdsSDK.setTags(['nova-tag', 'categoria-dinamica']);
        
        // Obter estatísticas
        StellarAdsSDK.getStats().then(stats => {
            console.log('Estatísticas:', stats);
        });
    }
});
```

---

## 📊 Monitoramento e Analytics

### Integração com Google Analytics

```javascript
window.StellarAdsConfig = {
    siteId: 'seu_site',
    onAdLoaded: function(adData) {
        // Tracking de impressão
        gtag('event', 'stellar_ad_impression', {
            'campaign_id': adData.campaignId,
            'advertiser': adData.advertiserName,
            'custom_parameter_1': 'valor'
        });
    },
    onAdClicked: function(adData) {
        // Tracking de clique
        gtag('event', 'stellar_ad_click', {
            'campaign_id': adData.campaignId,
            'advertiser': adData.advertiserName,
            'value': adData.costPerClick
        });
    },
    onRewardEarned: function(rewardData) {
        // Tracking de recompensa
        gtag('event', 'stellar_reward_earned', {
            'reward_amount': rewardData.amount,
            'reward_type': rewardData.type, // 'impression' ou 'click'
            'value': rewardData.amount
        });
    }
};
```

### Integração com Facebook Pixel

```javascript
window.StellarAdsConfig = {
    siteId: 'seu_site',
    onAdClicked: function(adData) {
        // Facebook Pixel
        fbq('trackCustom', 'StellarAdClick', {
            campaign_id: adData.campaignId,
            advertiser: adData.advertiserName,
            value: adData.costPerClick,
            currency: 'XLM'
        });
    }
};
```

### Dashboard Personalizado

```html
<div id="stellar-dashboard">
    <div class="stat-card">
        <h3>Suas Recompensas</h3>
        <div id="total-earned">0 XLM</div>
    </div>
    <div class="stat-card">
        <h3>Anúncios Visualizados</h3>
        <div id="total-impressions">0</div>
    </div>
    <div class="stat-card">
        <h3>Cliques Realizados</h3>
        <div id="total-clicks">0</div>
    </div>
</div>

<script>
function updateDashboard() {
    StellarAdsSDK.getUserRewards().then(data => {
        document.getElementById('total-earned').textContent = 
            `${data.totalEarnedXLM} XLM`;
        document.getElementById('total-impressions').textContent = 
            data.totalImpressions;
        document.getElementById('total-clicks').textContent = 
            data.totalClicks;
    });
}

// Atualizar a cada 30 segundos
setInterval(updateDashboard, 30000);
updateDashboard(); // Atualização inicial
</script>
```

---

## 🔧 Troubleshooting

### Problemas Comuns e Soluções

#### 1. **SDK não carrega**
```javascript
// Verificar se o SDK foi carregado
setTimeout(() => {
    if (!window.StellarAdsSDK) {
        console.error('SDK não carregou. Verificar:');
        console.error('1. URL do script está correta?');
        console.error('2. Não há bloqueadores de anúncio ativos?');
        console.error('3. Conexão com internet está funcionando?');
        
        // Fallback manual
        loadStellarSDKFallback();
    }
}, 5000);

function loadStellarSDKFallback() {
    // Implementar carregamento alternativo ou conteúdo fallback
}
```

#### 2. **Anúncios não aparecem**
```javascript
window.StellarAdsConfig = {
    siteId: 'seu_site',
    debug: true, // Ativar logs detalhados
    onError: function(error) {
        console.error('Erro detalhado:', error);
        
        // Verificações comuns
        if (error.includes('siteId')) {
            console.error('❌ siteId inválido ou não configurado');
        }
        if (error.includes('container')) {
            console.error('❌ Container não encontrado no DOM');
        }
        if (error.includes('network')) {
            console.error('❌ Erro de conectividade com API');
        }
    }
};
```

#### 3. **Problemas de CORS**
```javascript
// Se hospedar o SDK no seu próprio domínio
window.StellarAdsConfig = {
    siteId: 'seu_site',
    apiUrl: 'https://api.stellarads.com', // API externa
    corsMode: 'cors', // Forçar modo CORS
    credentials: 'same-origin'
};
```

#### 4. **Performance Issues**
```javascript
// Configuração otimizada para performance
window.StellarAdsConfig = {
    siteId: 'seu_site',
    
    // Reduzir frequência de refresh
    autoRefresh: true,
    refreshInterval: 60000, // 1 minuto em vez de 30s
    
    // Cache agressivo
    cacheAds: true,
    cacheTimeout: 300000, // 5 minutos
    
    // Lazy loading
    lazyLoad: true,
    loadOnScroll: true,
    
    // Pré-carregar próximo anúncio
    preloadNext: true
};
```

### Debugging Avançado

```javascript
// Habilitar modo debug completo
localStorage.setItem('stellar-ads-debug', 'true');

// Logs personalizados
window.StellarAdsConfig = {
    siteId: 'seu_site',
    debug: true,
    customLogger: function(level, message, data) {
        // Enviar logs para seu sistema de monitoramento
        if (level === 'error') {
            sendToLogService('stellar-ads-error', { message, data });
        }
        
        console[level](`[StellarAds] ${message}`, data);
    }
};
```

---

## 💡 Exemplos Práticos

### 1. Blog Pessoal com Sidebar

```html
<!DOCTYPE html>
<html>
<head>
    <title>Meu Blog</title>
    <style>
        .container { display: flex; max-width: 1200px; margin: 0 auto; }
        .content { flex: 2; padding: 20px; }
        .sidebar { flex: 1; padding: 20px; }
        .ad-section { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <main class="content">
            <h1>Meu Artigo Incrível</h1>
            <p>Conteúdo do blog...</p>
        </main>
        
        <aside class="sidebar">
            <!-- Anúncio 1: Tecnologia -->
            <div class="ad-section">
                <div id="sidebar-ad-1" 
                     data-site-id="meu_blog_123"
                     data-tags="tecnologia,programacao">
                </div>
            </div>
            
            <!-- Anúncio 2: Lifestyle -->
            <div class="ad-section">
                <div id="sidebar-ad-2" 
                     data-site-id="meu_blog_123"
                     data-tags="lifestyle,saude">
                </div>
            </div>
        </aside>
    </div>

    <script>
        window.StellarAdsConfig = {
            siteId: 'meu_blog_123',
            theme: 'light',
            maxWidth: '280px',
            onRewardEarned: function(reward) {
                // Mostrar notificação toast
                showToast(`+${reward.amount} XLM ganhos!`);
            }
        };
    </script>
    <script src="https://api.stellarads.com/sdk.js"></script>
</body>
</html>
```

### 2. Site de Notícias com Múltiplas Zonas

```html
<!-- Header Banner -->
<div id="header-banner" 
     data-site-id="news_portal_456"
     data-tags="noticias,politica"
     data-max-width="728px"
     data-theme="light">
</div>

<article>
    <h1>Notícia Importante</h1>
    
    <!-- Anúncio no meio do conteúdo -->
    <div id="content-ad" 
         data-site-id="news_portal_456"
         data-tags="noticias,economia"
         data-auto-refresh="false">
    </div>
    
    <p>Mais conteúdo da notícia...</p>
</article>

<!-- Footer -->
<div id="footer-ad" 
     data-site-id="news_portal_456"
     data-tags="servicos,utilidades"
     data-theme="dark">
</div>

<script>
window.StellarAdsConfig = {
    siteId: 'news_portal_456',
    
    // Configuração específica por container
    containerConfigs: {
        'header-banner': {
            refreshInterval: 45000,
            showPoweredBy: false
        },
        'content-ad': {
            autoRefresh: false,
            clickOpenNewTab: true
        },
        'footer-ad': {
            refreshInterval: 60000,
            theme: 'dark'
        }
    }
};
</script>
```

### 3. E-commerce com Recomendações

```html
<div class="product-page">
    <div class="product-info">
        <!-- Informações do produto -->
    </div>
    
    <div class="recommendations">
        <h3>Produtos Relacionados</h3>
        <div id="related-products-ad" 
             data-site-id="loja_tech_789"
             data-tags="hardware,tecnologia,loja"
             data-custom-class="product-style">
        </div>
    </div>
</div>

<script>
window.StellarAdsConfig = {
    siteId: 'loja_tech_789',
    
    // Template customizado para produtos
    customTemplate: function(adData) {
        return `
            <div class="product-ad-card">
                <div class="product-badge">Recomendado</div>
                <img src="${adData.imageUrl}" class="product-image">
                <div class="product-info">
                    <h4>${adData.advertiserName}</h4>
                    <div class="product-reward">
                        <span class="xlm-icon">✦</span>
                        Ganhe ${adData.rewardAmount} XLM
                    </div>
                    <button class="product-cta">Ver Oferta</button>
                </div>
            </div>
        `;
    },
    
    onAdClicked: function(adData) {
        // Tracking de conversão para e-commerce
        gtag('event', 'purchase_intent', {
            'campaign_id': adData.campaignId,
            'value': adData.costPerClick,
            'currency': 'XLM'
        });
    }
};
</script>
```

### 4. SPA (Single Page Application)

```javascript
// React/Vue/Angular exemplo
class StellarAdsComponent {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
    }
    
    mount() {
        // Configurar SDK dinamicamente
        window.StellarAdsConfig = {
            ...this.config,
            containerId: this.containerId
        };
        
        // Inicializar SDK
        if (window.StellarAdsSDK) {
            StellarAdsSDK.init();
        }
    }
    
    unmount() {
        // Limpar quando componente é removido
        if (window.StellarAdsSDK) {
            StellarAdsSDK.destroy(this.containerId);
        }
    }
    
    updateTags(newTags) {
        if (window.StellarAdsSDK) {
            StellarAdsSDK.setTags(newTags, this.containerId);
            StellarAdsSDK.refreshAd(this.containerId);
        }
    }
}

// Uso em framework
const adComponent = new StellarAdsComponent('my-ad-container', {
    siteId: 'spa_site_999',
    tags: ['tecnologia', 'dev'],
    autoRefresh: false // Controle manual em SPAs
});

// Lifecycle hooks
componentDidMount() {
    adComponent.mount();
}

componentWillUnmount() {
    adComponent.unmount();
}
```

---

## 🔒 Segurança e Boas Práticas

### Validação de Domínio
```javascript
// Validar se o SDK está sendo usado no domínio correto
window.StellarAdsConfig = {
    siteId: 'seu_site',
    allowedDomains: ['meusite.com', 'www.meusite.com'],
    strictDomainCheck: true
};
```

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://api.stellarads.com; 
               img-src 'self' https: data:; 
               connect-src 'self' https://api.stellarads.com;">
```

### Rate Limiting
```javascript
window.StellarAdsConfig = {
    siteId: 'seu_site',
    rateLimiting: {
        maxRequestsPerMinute: 10,
        maxClicksPerHour: 100
    }
};
```

---

## 📞 Suporte e Recursos

### Links Úteis
- **API Documentation**: `https://docs.stellarads.com`
- **Dashboard**: `https://dashboard.stellarads.com`
- **Status Page**: `https://status.stellarads.com`
- **GitHub Issues**: `https://github.com/stellarads/sdk/issues`

### Suporte Técnico
- **Email**: support@stellarads.com
- **Discord**: [Stellar Ads Community](https://discord.gg/stellarads)
- **Documentação**: Este documento + API docs

### Checklist de Implementação

- [ ] ✅ Site ID obtido e configurado
- [ ] ✅ Container HTML adicionado
- [ ] ✅ Tags de matching configuradas
- [ ] ✅ SDK script incluído
- [ ] ✅ Testes realizados em diferentes dispositivos
- [ ] ✅ Analytics/tracking configurado
- [ ] ✅ Estilização CSS personalizada aplicada
- [ ] ✅ Callbacks de eventos implementados
- [ ] ✅ Error handling configurado
- [ ] ✅ Performance otimizada

---

**🚀 Parabéns!** Agora você tem tudo o que precisa para integrar o Stellar Ads SDK ao seu site e começar a monetizar com criptomoedas!

Para mais informações técnicas, consulte nossa [documentação completa da API](https://docs.stellarads.com).

---

*Documento atualizado em 15/09/2025 - Versão 1.0.0*
