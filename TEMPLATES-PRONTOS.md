# 📦 Templates Prontos - Stellar Ads SDK

**Copie, cole e personalize**  
**Versão**: 1.0.0  
**Data**: 15 de setembro de 2025

## 📋 Templates Incluídos

1. [Template Básico](#template-básico)
2. [Blog Pessoal](#blog-pessoal)
3. [E-commerce](#e-commerce)
4. [Portal de Notícias](#portal-de-notícias)
5. [Landing Page](#landing-page)
6. [SPA/React](#spa-react)

---

## 🚀 Template Básico

### Integração Mínima (Copy & Paste)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Site com Stellar Ads</title>
</head>
<body>
    <!-- SEU CONTEÚDO AQUI -->
    <h1>Meu Site</h1>
    <p>Conteúdo interessante...</p>
    
    <!-- 👇 COLE ESTE CÓDIGO ONDE QUER O ANÚNCIO -->
    <div id="stellar-ad-container" 
         data-site-id="SUBSTITUIR_PELO_SEU_SITE_ID"
         data-tags="tecnologia,geral">
    </div>
    
    <!-- 👇 INCLUA ESTE SCRIPT NO FINAL DO BODY -->
    <script>
        window.StellarAdsConfig = {
            siteId: 'SUBSTITUIR_PELO_SEU_SITE_ID',
            debug: true // Remover em produção
        };
    </script>
    <script src="http://localhost:3000/sdk.js"></script>
    <!-- EM PRODUÇÃO: <script src="https://api.stellarads.com/sdk.js"></script> -->
</body>
</html>
```

---

## 📝 Blog Pessoal

### Template Completo para Blog

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Blog - Post Incrível</title>
    <style>
        /* Estilos básicos para o blog */
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header-ad { text-align: center; margin: 20px 0; }
        .content-ad { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .sidebar { float: right; width: 300px; margin-left: 20px; }
        .sidebar-ad { margin: 20px 0; }
        .rewards-display { 
            position: fixed; top: 20px; right: 20px; 
            background: #28a745; color: white; padding: 10px; 
            border-radius: 5px; font-weight: bold; z-index: 1000;
        }
        @media (max-width: 768px) { .sidebar { width: 100%; float: none; } }
    </style>
</head>
<body>
    <!-- Contador de Recompensas -->
    <div id="rewards-counter" class="rewards-display" style="display: none;">
        💰 <span id="total-earned">0</span> XLM ganhos!
    </div>

    <header>
        <h1>Meu Blog de Tecnologia</h1>
        
        <!-- Banner Header -->
        <div class="header-ad">
            <div id="header-banner" 
                 data-site-id="MEU_BLOG_TECH"
                 data-tags="tecnologia,programacao,blog"
                 data-max-width="728px"
                 data-theme="light">
            </div>
        </div>
    </header>

    <div class="content-wrapper">
        <!-- Sidebar (Desktop) -->
        <aside class="sidebar">
            <h3>Recomendados</h3>
            <div class="sidebar-ad">
                <div id="sidebar-ad-1" 
                     data-site-id="MEU_BLOG_TECH"
                     data-tags="cursos,livros,tecnologia"
                     data-max-width="300px">
                </div>
            </div>
            
            <div class="sidebar-ad">
                <div id="sidebar-ad-2" 
                     data-site-id="MEU_BLOG_TECH"
                     data-tags="ferramentas,produtividade"
                     data-max-width="300px">
                </div>
            </div>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="main-content">
            <article>
                <h2>Como Integrar o Stellar Ads SDK</h2>
                <p><em>Publicado em 15 de setembro de 2025</em></p>
                
                <p>Este é o início do meu artigo sobre integração...</p>
                
                <h3>Introdução</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                
                <!-- Anúncio no meio do conteúdo -->
                <div class="content-ad">
                    <div id="content-ad" 
                         data-site-id="MEU_BLOG_TECH"
                         data-tags="desenvolvimento,tutorial,programacao"
                         data-auto-refresh="false">
                    </div>
                </div>
                
                <h3>Passo a Passo</h3>
                <p>Continuação do artigo...</p>
                
                <h3>Conclusão</h3>
                <p>Artigo finalizado...</p>
            </article>
            
            <!-- Seção de Posts Relacionados -->
            <section class="related-posts">
                <h3>Posts Relacionados</h3>
                <div id="related-ad" 
                     data-site-id="MEU_BLOG_TECH"
                     data-tags="artigos,relacionados,{{ categoria_do_post }}"
                     data-custom-class="related-style">
                </div>
            </section>
        </main>
    </div>

    <footer>
        <p>&copy; 2025 Meu Blog. Powered by Stellar Ads.</p>
    </footer>

    <script>
        window.StellarAdsConfig = {
            siteId: 'MEU_BLOG_TECH', // 👈 SUBSTITUA PELO SEU ID
            
            // Configurações visuais
            theme: 'light',
            showPoweredBy: true,
            
            // Comportamento
            autoRefresh: true,
            refreshInterval: 45000, // 45 segundos
            
            // Callbacks para blog
            onRewardEarned: function(rewardData) {
                // Atualizar contador de recompensas
                const counter = document.getElementById('rewards-counter');
                const total = document.getElementById('total-earned');
                
                let currentTotal = parseFloat(total.textContent) || 0;
                currentTotal += rewardData.amount;
                
                total.textContent = currentTotal.toFixed(4);
                counter.style.display = 'block';
                
                // Animação de destaque
                counter.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    counter.style.animation = '';
                }, 500);
            },
            
            onAdLoaded: function(adData) {
                console.log('Anúncio carregado:', adData.advertiserName);
                
                // Analytics do blog
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'stellar_ad_loaded', {
                        'campaign_id': adData.campaignId,
                        'page_category': 'blog-post'
                    });
                }
            },
            
            onError: function(error) {
                console.warn('Stellar Ads:', error);
            }
        };
    </script>
    <script src="http://localhost:3000/sdk.js"></script>
    
    <style>
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    </style>
</body>
</html>
```

---

## 🛒 E-commerce

### Template para Loja Virtual

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore - Produto Incrível</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .product-info { padding: 20px; }
        .price { font-size: 2em; color: #e74c3c; font-weight: bold; }
        .recommendation-section { margin: 40px 0; padding: 20px; background: #f8f9fa; }
        .ad-product-card { 
            border: 2px solid #007bff; border-radius: 10px; padding: 20px; 
            text-align: center; background: white; margin: 20px 0;
        }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header da loja -->
        <header>
            <h1>TechStore</h1>
            <nav>
                <a href="#home">Home</a>
                <a href="#produtos">Produtos</a>
                <a href="#ofertas">Ofertas</a>
            </nav>
        </header>

        <!-- Banner promocional -->
        <div class="promo-banner">
            <div id="header-promo" 
                 data-site-id="TECHSTORE_2025"
                 data-tags="promocao,ofertas,tecnologia"
                 data-max-width="100%"
                 data-theme="commercial">
            </div>
        </div>

        <!-- Grade do produto -->
        <div class="product-grid">
            <!-- Galeria de imagens -->
            <div class="product-gallery">
                <img src="produto.jpg" alt="Produto" style="width: 100%;">
            </div>

            <!-- Informações do produto -->
            <div class="product-info">
                <h2>Smartphone Ultra Pro</h2>
                <div class="price">R$ 2.499,00</div>
                <p>Descrição incrível do produto...</p>
                
                <!-- Anúncio de produto relacionado -->
                <div class="recommendation-section">
                    <h3>🎯 Você também pode gostar:</h3>
                    <div id="related-product" 
                         data-site-id="TECHSTORE_2025"
                         data-tags="smartphones,acessorios,ofertas"
                         data-custom-class="ad-product-card">
                    </div>
                </div>
                
                <button class="buy-button">Comprar Agora</button>
            </div>
        </div>

        <!-- Seção de especificações -->
        <section class="specifications">
            <h3>Especificações Técnicas</h3>
            <!-- ... especificações ... -->
        </section>

        <!-- Produtos em promoção -->
        <section class="deals-section">
            <h3>⚡ Ofertas Relâmpago</h3>
            <div id="flash-deals" 
                 data-site-id="TECHSTORE_2025"
                 data-tags="ofertas,desconto,tecnologia,urgente"
                 data-refresh-interval="20000">
            </div>
        </section>

        <!-- Seção "Quem viu este produto também viu" -->
        <section class="also-viewed">
            <h3>Quem viu este produto também viu:</h3>
            <div id="also-viewed-ad" 
                 data-site-id="TECHSTORE_2025"
                 data-tags="recomendacoes,smartphones,similares">
            </div>
        </section>
    </div>

    <script>
        window.StellarAdsConfig = {
            siteId: 'TECHSTORE_2025', // 👈 SEU ID AQUI
            
            // Contexto de e-commerce
            ecommerceMode: true,
            productContext: {
                category: 'smartphones',
                brand: 'UltraPro',
                price: 2499.00,
                inStock: true
            },
            
            // Configurações por seção
            containerConfigs: {
                'header-promo': {
                    priority: 'high',
                    refreshInterval: 30000,
                    customTemplate: function(adData) {
                        return `
                            <div class="promo-header">
                                <div class="promo-badge">OFERTA ESPECIAL!</div>
                                <img src="${adData.imageUrl}" style="max-height: 80px;">
                                <div class="promo-text">
                                    <h4>${adData.advertiserName}</h4>
                                    <p>Ganhe ${adData.rewardAmount} XLM comprando!</p>
                                </div>
                            </div>
                        `;
                    }
                },
                
                'related-product': {
                    customTemplate: function(adData) {
                        return `
                            <div class="product-recommendation">
                                <div class="rec-badge">🎯 Recomendado</div>
                                <img src="${adData.imageUrl}" style="width: 100px; height: 100px; object-fit: cover;">
                                <h4>${adData.advertiserName}</h4>
                                <div class="reward-info">
                                    <span class="xlm-badge">+${adData.rewardAmount} XLM</span>
                                    <button class="quick-view-btn">Ver Oferta</button>
                                </div>
                            </div>
                        `;
                    }
                }
            },
            
            // Tracking de e-commerce
            onAdClicked: function(adData) {
                // Google Analytics E-commerce
                gtag('event', 'view_promotion', {
                    'promotion_id': adData.campaignId,
                    'promotion_name': adData.advertiserName,
                    'items': [{
                        'item_id': 'current-product',
                        'item_name': 'Smartphone Ultra Pro',
                        'item_category': 'smartphones',
                        'price': 2499.00,
                        'currency': 'BRL'
                    }]
                });
                
                // Tracking de intenção de compra
                fbq('track', 'ViewContent', {
                    content_type: 'product',
                    content_ids: [adData.campaignId],
                    value: adData.costPerClick,
                    currency: 'XLM'
                });
            },
            
            onRewardEarned: function(rewardData) {
                // Mostrar toast personalizado
                showEcommerceToast(
                    `💰 +${rewardData.amount} XLM ganhos!`,
                    'Acumule XLM comprando na nossa loja!'
                );
            }
        };
        
        // Toast personalizado para e-commerce
        function showEcommerceToast(title, subtitle) {
            const toast = document.createElement('div');
            toast.innerHTML = `
                <div style="
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 15px 20px; border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    max-width: 300px; animation: slideInRight 0.3s ease-out;
                ">
                    <div style="font-weight: bold; font-size: 16px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">${subtitle}</div>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
    </script>
    <script src="http://localhost:3000/sdk.js"></script>
    
    <style>
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .buy-button {
            background: #28a745; color: white; border: none;
            padding: 15px 30px; font-size: 18px; border-radius: 5px;
            cursor: pointer; width: 100%; margin-top: 20px;
        }
        
        .xlm-badge {
            background: #ffd700; color: #333; padding: 3px 8px;
            border-radius: 10px; font-size: 12px; font-weight: bold;
        }
    </style>
</body>
</html>
```

---

## 📰 Portal de Notícias

### Template para Site de Notícias

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal de Notícias - Última Hora</title>
    <style>
        body { font-family: 'Roboto', sans-serif; margin: 0; line-height: 1.6; }
        .header-bar { background: #1a237e; color: white; padding: 10px 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .news-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-top: 20px; }
        .main-content { background: white; padding: 20px; }
        .sidebar { background: #f8f9fa; padding: 20px; }
        .news-item { border-bottom: 1px solid #eee; padding: 20px 0; }
        .ad-banner { text-align: center; margin: 20px 0; }
        .breaking-news { background: #d32f2f; color: white; padding: 10px; margin: 10px 0; }
        @media (max-width: 768px) { .news-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <!-- Barra superior -->
    <div class="header-bar">
        <div class="container">
            <h1>🗞️ Portal Brasil Notícias</h1>
        </div>
    </div>

    <!-- Banner principal -->
    <div class="container">
        <div class="ad-banner">
            <div id="leaderboard-ad" 
                 data-site-id="PORTAL_NOTICIAS_BR"
                 data-tags="noticias,brasil,atualidades"
                 data-max-width="970px"
                 data-priority="high">
            </div>
        </div>
        
        <!-- Breaking news -->
        <div class="breaking-news">
            🚨 ÚLTIMA HORA: Notícia importante em desenvolvimento...
        </div>
    </div>

    <div class="container">
        <div class="news-grid">
            <!-- Conteúdo principal -->
            <main class="main-content">
                <article class="featured-article">
                    <h2>Título da Notícia Principal</h2>
                    <p><strong>15 de setembro, 2025</strong> - Lead da notícia...</p>
                    
                    <p>Primeiro parágrafo da notícia...</p>
                    
                    <!-- Ad no meio da matéria -->
                    <div class="ad-banner">
                        <div id="article-ad" 
                             data-site-id="PORTAL_NOTICIAS_BR"
                             data-tags="noticias,politica,economia"
                             data-auto-refresh="false">
                        </div>
                    </div>
                    
                    <p>Continuação da notícia...</p>
                    
                    <h3>Desdobramentos</h3>
                    <p>Mais detalhes da matéria...</p>
                </article>
                
                <!-- Feed de notícias -->
                <section class="news-feed">
                    <h3>Outras Notícias</h3>
                    
                    <div class="news-item">
                        <h4>Segunda notícia importante</h4>
                        <p>Resumo da segunda notícia...</p>
                    </div>
                    
                    <div class="news-item">
                        <h4>Terceira notícia</h4>
                        <p>Resumo da terceira notícia...</p>
                    </div>
                    
                    <!-- Ad entre notícias -->
                    <div class="ad-banner">
                        <div id="feed-ad" 
                             data-site-id="PORTAL_NOTICIAS_BR"
                             data-tags="servicos,utilidades,noticias"
                             data-native-style="true">
                        </div>
                    </div>
                    
                    <div class="news-item">
                        <h4>Quarta notícia</h4>
                        <p>Resumo da quarta notícia...</p>
                    </div>
                </section>
            </main>

            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="widget">
                    <h3>📈 Mais Lidas</h3>
                    <ul>
                        <li>Primeira mais lida</li>
                        <li>Segunda mais lida</li>
                        <li>Terceira mais lida</li>
                    </ul>
                </div>
                
                <!-- Ad sidebar -->
                <div class="widget">
                    <div id="sidebar-ad-1" 
                         data-site-id="PORTAL_NOTICIAS_BR"
                         data-tags="promocoes,servicos,utilidades"
                         data-max-width="300px"
                         data-sticky="true">
                    </div>
                </div>
                
                <div class="widget">
                    <h3>⚡ Recompensas XLM</h3>
                    <div id="rewards-widget">
                        <p>Você já ganhou:</p>
                        <div id="user-total" style="font-size: 24px; color: #1976d2;">
                            0.0000 XLM
                        </div>
                        <p><small>Continue lendo e ganhando!</small></p>
                    </div>
                </div>
                
                <!-- Segundo ad sidebar -->
                <div class="widget">
                    <div id="sidebar-ad-2" 
                         data-site-id="PORTAL_NOTICIAS_BR"
                         data-tags="educacao,cursos,noticias">
                    </div>
                </div>
            </aside>
        </div>
    </div>

    <!-- Footer -->
    <footer style="background: #333; color: white; padding: 20px 0; margin-top: 50px;">
        <div class="container">
            <!-- Footer ad -->
            <div class="ad-banner">
                <div id="footer-ad" 
                     data-site-id="PORTAL_NOTICIAS_BR"
                     data-tags="institucional,servicos,geral"
                     data-theme="dark">
                </div>
            </div>
            
            <p>&copy; 2025 Portal Brasil Notícias. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script>
        window.StellarAdsConfig = {
            siteId: 'PORTAL_NOTICIAS_BR', // 👈 SEU ID AQUI
            
            // Configurações para portal de notícias
            theme: 'news',
            autoRefresh: true,
            refreshInterval: 30000, // 30 segundos para notícias
            
            // Categorização automática baseada no conteúdo
            autoTagging: {
                enabled: true,
                extractFromTitle: true,
                extractFromContent: true,
                categories: ['politica', 'economia', 'esportes', 'tecnologia', 'internacional']
            },
            
            // Configurações específicas por posição
            containerConfigs: {
                'leaderboard-ad': {
                    priority: 'high',
                    refreshInterval: 45000,
                    showPoweredBy: false
                },
                
                'article-ad': {
                    autoRefresh: false, // Não refresh durante leitura
                    lazyLoad: true,
                    viewabilityThreshold: 0.7
                },
                
                'sidebar-ad-1': {
                    sticky: true,
                    refreshInterval: 60000
                },
                
                'feed-ad': {
                    nativeStyle: true,
                    customTemplate: function(adData) {
                        return `
                            <div class="native-news-ad">
                                <div class="ad-label">Conteúdo Patrocinado</div>
                                <div class="news-item" style="border: 2px solid #e3f2fd;">
                                    <h4>${adData.advertiserName}</h4>
                                    <p>Descoberta incrível que pode te interessar!</p>
                                    <div class="xlm-reward">💰 +${adData.rewardAmount} XLM</div>
                                </div>
                            </div>
                        `;
                    }
                }
            },
            
            // Sistema de recompensas para leitores
            onRewardEarned: function(rewardData) {
                // Atualizar widget de recompensas
                updateRewardsWidget(rewardData.amount);
                
                // Mostrar notificação discreta
                showNewsToast(`+${rewardData.amount} XLM por ler notícias!`);
                
                // Analytics para portal de notícias
                gtag('event', 'reader_reward', {
                    'reward_amount': rewardData.amount,
                    'content_category': getCurrentCategory(),
                    'reading_time': getReadingTime()
                });
            },
            
            onAdClicked: function(adData) {
                // Tracking específico para notícias
                gtag('event', 'news_ad_click', {
                    'campaign_id': adData.campaignId,
                    'article_category': getCurrentCategory(),
                    'ad_position': getAdPosition(adData.containerId)
                });
            }
        };
        
        // Funções auxiliares para portal de notícias
        function updateRewardsWidget(amount) {
            const widget = document.getElementById('user-total');
            if (widget) {
                let current = parseFloat(widget.textContent) || 0;
                current += amount;
                widget.textContent = current.toFixed(4) + ' XLM';
                
                // Animação de destaque
                widget.style.animation = 'glow 0.5s ease-out';
                setTimeout(() => widget.style.animation = '', 500);
            }
        }
        
        function showNewsToast(message) {
            const toast = document.createElement('div');
            toast.innerHTML = `
                <div style="
                    position: fixed; bottom: 20px; right: 20px; z-index: 10000;
                    background: #1976d2; color: white; padding: 12px 20px;
                    border-radius: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-size: 14px; animation: slideInUp 0.3s ease-out;
                ">📰 ${message}</div>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutDown 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        function getCurrentCategory() {
            // Detectar categoria da página atual
            const title = document.title.toLowerCase();
            if (title.includes('política')) return 'politica';
            if (title.includes('economia')) return 'economia';
            if (title.includes('esporte')) return 'esportes';
            return 'geral';
        }
        
        function getAdPosition(containerId) {
            const positions = {
                'leaderboard-ad': 'header',
                'article-ad': 'article-middle',
                'sidebar-ad-1': 'sidebar-top',
                'feed-ad': 'feed-inline',
                'footer-ad': 'footer'
            };
            return positions[containerId] || 'unknown';
        }
        
        function getReadingTime() {
            // Calcular tempo aproximado de leitura
            const article = document.querySelector('.featured-article');
            if (article) {
                const words = article.textContent.split(' ').length;
                return Math.ceil(words / 200); // 200 palavras por minuto
            }
            return 0;
        }
    </script>
    <script src="http://localhost:3000/sdk.js"></script>
    
    <style>
        @keyframes glow {
            0% { color: #1976d2; }
            50% { color: #ffd700; text-shadow: 0 0 10px #ffd700; }
            100% { color: #1976d2; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideOutDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
        
        .ad-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .xlm-reward {
            color: #1976d2;
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
        }
    </style>
</body>
</html>
```

---

## 🚀 Landing Page

### Template para Página de Captura

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page - Oferta Especial</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { text-align: center; color: white; padding: 50px 0; }
        .hero h1 { font-size: 3em; margin-bottom: 20px; }
        .cta-section { background: white; padding: 50px; border-radius: 20px; margin: 40px 0; }
        .benefits { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .benefit { text-align: center; padding: 20px; }
        .ad-section { margin: 40px 0; padding: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Seção Hero -->
        <section class="hero">
            <h1>🚀 Transforme Sua Vida Digital</h1>
            <p style="font-size: 1.3em; margin-bottom: 30px;">
                Descubra como ganhar dinheiro enquanto navega na internet
            </p>
            
            <!-- Banner de topo -->
            <div class="ad-section">
                <div id="hero-ad" 
                     data-site-id="LANDING_PAGE_2025"
                     data-tags="oportunidade,dinheiro,digital,novidade"
                     data-max-width="600px"
                     data-theme="hero">
                </div>
            </div>
        </section>

        <!-- Call to Action Principal -->
        <section class="cta-section">
            <h2 style="text-align: center; margin-bottom: 30px;">
                ⚡ Comece Agora e Ganhe Suas Primeiras Recompensas!
            </h2>
            
            <form style="text-align: center;">
                <input type="email" placeholder="Seu melhor e-mail" 
                       style="padding: 15px; font-size: 16px; width: 300px; margin-right: 10px; border: 1px solid #ccc; border-radius: 5px;">
                <button type="submit" 
                        style="padding: 15px 30px; font-size: 16px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    QUERO GANHAR XLM! 💰
                </button>
            </form>
            
            <p style="text-align: center; margin-top: 20px; color: #666;">
                <small>100% gratuito • Comece em 2 minutos • Sem pegadinhas</small>
            </p>
        </section>

        <!-- Seção de Benefícios -->
        <section class="benefits">
            <div class="benefit">
                <h3>💰 Renda Extra</h3>
                <p>Ganhe XLM (Stellar Lumens) apenas navegando e interagindo com conteúdo relevante.</p>
            </div>
            
            <div class="benefit">
                <h3>🚀 Fácil de Usar</h3>
                <p>Sistema simples e automático. Basta navegar normalmente e as recompensas chegam.</p>
            </div>
            
            <div class="benefit">
                <h3>🔒 100% Seguro</h3>
                <p>Powered by Stellar blockchain. Seus ganhos são transparentes e seguros.</p>
            </div>
        </section>

        <!-- Demonstração ao vivo -->
        <section class="demo-section" style="background: white; padding: 40px; border-radius: 15px; margin: 40px 0;">
            <h2 style="text-align: center; margin-bottom: 30px;">
                🎯 Veja Como Funciona (Demo ao Vivo)
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <div id="live-demo-counter" style="font-size: 2em; color: #28a745; font-weight: bold;">
                    0.0000 XLM ganhos
                </div>
                <p>👆 Contador em tempo real - você já está ganhando!</p>
            </div>
            
            <!-- Ad de demonstração -->
            <div id="demo-ad" 
                 data-site-id="LANDING_PAGE_2025"
                 data-tags="demonstracao,exemplo,tutorial,ganhar-dinheiro"
                 data-demo-mode="true">
            </div>
            
            <p style="text-align: center; margin-top: 20px;">
                ☝️ Interaja com este anúncio e veja suas recompensas aumentarem!
            </p>
        </section>

        <!-- Seção de prova social -->
        <section style="text-align: center; color: white; margin: 40px 0;">
            <h3>🌟 O que nossos usuários dizem:</h3>
            <blockquote style="font-style: italic; margin: 20px 0; font-size: 1.2em;">
                "Em 30 dias ganhei 50 XLM só navegando normalmente. Incrível!"<br>
                <strong>- Maria S., São Paulo</strong>
            </blockquote>
            
            <!-- Ad de testemunho -->
            <div id="testimonial-ad" 
                 data-site-id="LANDING_PAGE_2025"
                 data-tags="testemunho,sucesso,resultado,prova"
                 data-theme="testimonial">
            </div>
        </section>

        <!-- CTA Final -->
        <section class="cta-section">
            <h2 style="text-align: center; color: #e74c3c; margin-bottom: 20px;">
                ⏰ Oferta Por Tempo Limitado!
            </h2>
            
            <p style="text-align: center; font-size: 1.2em; margin-bottom: 30px;">
                Primeiros 1000 usuários ganham <strong>BÔNUS DE 1 XLM</strong> de boas-vindas!
            </p>
            
            <div style="text-align: center;">
                <button onclick="document.querySelector('input[type=email]').focus()" 
                        style="padding: 20px 40px; font-size: 20px; background: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(231,76,60,0.3);">
                    🎁 GARANTIR MEU BÔNUS AGORA!
                </button>
            </div>
        </section>
    </div>

    <script>
        window.StellarAdsConfig = {
            siteId: 'LANDING_PAGE_2025', // 👈 SEU ID AQUI
            
            // Configurações específicas para landing page
            landingPageMode: true,
            maxRewardsForDemo: 0.05, // Limitar recompensas na demo
            
            // Configurações por seção
            containerConfigs: {
                'hero-ad': {
                    priority: 'highest',
                    autoRefresh: false,
                    customTemplate: function(adData) {
                        return `
                            <div class="hero-ad-card">
                                <div class="opportunity-badge">🚀 OPORTUNIDADE ÚNICA</div>
                                <img src="${adData.imageUrl}" style="max-height: 120px; border-radius: 10px;">
                                <h3>${adData.advertiserName}</h3>
                                <p>Ganhe ${adData.rewardAmount} XLM clicando aqui!</p>
                                <div class="hero-cta">DESCOBRIR AGORA ➜</div>
                            </div>
                        `;
                    }
                },
                
                'demo-ad': {
                    demoMode: true,
                    autoRefresh: true,
                    refreshInterval: 20000,
                    showRewardAnimation: true
                }
            },
            
            // Contador de demonstração
            onRewardEarned: function(rewardData) {
                const counter = document.getElementById('live-demo-counter');
                if (counter) {
                    let current = parseFloat(counter.textContent.split(' ')[0]) || 0;
                    current += rewardData.amount;
                    counter.textContent = `${current.toFixed(4)} XLM ganhos`;
                    
                    // Animação de destaque
                    counter.style.animation = 'pulse 0.6s ease-out';
                    setTimeout(() => counter.style.animation = '', 600);
                    
                    // Confetti effect (biblioteca externa)
                    if (typeof confetti !== 'undefined') {
                        confetti({
                            particleCount: 50,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
                }
                
                // Mostrar toast motivacional
                showLandingToast(
                    `🎉 +${rewardData.amount} XLM`,
                    'Você está ganhando dinheiro!'
                );
                
                // Tracking para landing page
                gtag('event', 'landing_reward_earned', {
                    'reward_amount': rewardData.amount,
                    'demo_session': 'active',
                    'conversion_funnel': 'demo-interaction'
                });
            },
            
            onAdClicked: function(adData) {
                // Tracking específico para conversão
                gtag('event', 'landing_ad_click', {
                    'campaign_id': adData.campaignId,
                    'funnel_step': 'ad-interaction',
                    'potential_conversion': true
                });
                
                // Facebook Pixel para remarketing
                fbq('track', 'Lead', {
                    content_name: 'Landing Page Demo',
                    content_category': 'crypto-rewards',
                    value: adData.costPerClick,
                    currency: 'XLM'
                });
            }
        };
        
        // Toast para landing page
        function showLandingToast(title, subtitle) {
            const toast = document.createElement('div');
            toast.innerHTML = `
                <div style="
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    z-index: 10000; background: rgba(40, 167, 69, 0.95);
                    color: white; padding: 20px 30px; border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3); text-align: center;
                    animation: bounceIn 0.6s ease-out;
                ">
                    <div style="font-size: 24px; font-weight: bold;">${title}</div>
                    <div style="font-size: 16px; margin-top: 5px;">${subtitle}</div>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeOut 0.4s ease-in';
                setTimeout(() => toast.remove(), 400);
            }, 2500);
        }
        
        // Scroll tracking para otimização de conversão
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (depth > scrollDepth && depth % 25 === 0) {
                scrollDepth = depth;
                gtag('event', 'scroll_depth', {
                    'depth_percentage': depth,
                    'page_type': 'landing'
                });
            }
        });
    </script>
    <script src="http://localhost:3000/sdk.js"></script>
    
    <style>
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); color: #ffd700; }
            100% { transform: scale(1); }
        }
        
        @keyframes bounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            70% { transform: translate(-50%, -50%) scale(0.9); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .hero-ad-card {
            background: white; padding: 25px; border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); text-align: center;
            color: #333; max-width: 500px; margin: 0 auto;
        }
        
        .opportunity-badge {
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            color: white; padding: 5px 15px; border-radius: 20px;
            font-size: 12px; font-weight: bold; display: inline-block;
            margin-bottom: 15px;
        }
        
        .hero-cta {
            background: #007bff; color: white; padding: 12px 25px;
            border-radius: 25px; display: inline-block; margin-top: 15px;
            font-weight: bold; cursor: pointer; transition: all 0.3s ease;
        }
        
        .hero-cta:hover {
            background: #0056b3; transform: translateY(-2px);
        }
    </style>
</body>
</html>
```

---

## ⚡ Template React/SPA

### Componente React Completo

```jsx
// StellarAdsApp.jsx
import React, { useState, useEffect } from 'react';

const StellarAdsApp = () => {
    const [totalRewards, setTotalRewards] = useState(0);
    const [adStats, setAdStats] = useState({
        impressions: 0,
        clicks: 0,
        ctr: 0
    });

    useEffect(() => {
        // Configurar Stellar Ads
        window.StellarAdsConfig = {
            siteId: 'REACT_APP_2025', // 👈 SEU ID AQUI
            
            // SPA-specific configs
            spaMode: true,
            routeAware: true,
            
            onRewardEarned: (rewardData) => {
                setTotalRewards(prev => prev + rewardData.amount);
                
                // Toast notification
                showToast(`+${rewardData.amount} XLM ganhos!`);
            },
            
            onAdLoaded: (adData) => {
                setAdStats(prev => ({
                    ...prev,
                    impressions: prev.impressions + 1
                }));
            },
            
            onAdClicked: (adData) => {
                setAdStats(prev => ({
                    ...prev,
                    clicks: prev.clicks + 1,
                    ctr: ((prev.clicks + 1) / prev.impressions * 100).toFixed(2)
                }));
            }
        };

        // Load SDK
        const script = document.createElement('script');
        script.src = 'http://localhost:3000/sdk.js';
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (window.StellarAdsSDK) {
                window.StellarAdsSDK.destroy();
            }
            document.body.removeChild(script);
        };
    }, []);

    const showToast = (message) => {
        // Implement your toast notification
        console.log('Toast:', message);
    };

    const refreshAds = () => {
        if (window.StellarAdsSDK) {
            window.StellarAdsSDK.refreshAd();
        }
    };

    return (
        <div className="stellar-ads-app">
            {/* Header */}
            <header className="app-header">
                <h1>🚀 Minha App React</h1>
                <div className="rewards-display">
                    💰 {totalRewards.toFixed(4)} XLM
                </div>
            </header>

            {/* Main content */}
            <main className="main-content">
                {/* Hero section with ad */}
                <section className="hero">
                    <h2>Bem-vindo à Nossa Plataforma!</h2>
                    <div 
                        id="react-hero-ad"
                        data-site-id="REACT_APP_2025"
                        data-tags="react,spa,tecnologia,desenvolvimento"
                        data-theme="modern"
                    />
                </section>

                {/* Content with sidebar ad */}
                <div className="content-grid">
                    <div className="main-content-area">
                        <h3>Conteúdo Principal</h3>
                        <p>Este é o conteúdo principal da aplicação...</p>
                        
                        <div 
                            id="react-content-ad"
                            data-site-id="REACT_APP_2025"
                            data-tags="conteudo,artigo,leitura"
                            data-auto-refresh="true"
                        />
                        
                        <p>Mais conteúdo interessante...</p>
                    </div>

                    <aside className="sidebar">
                        <div className="widget">
                            <h4>📊 Estatísticas</h4>
                            <ul>
                                <li>Impressões: {adStats.impressions}</li>
                                <li>Cliques: {adStats.clicks}</li>
                                <li>CTR: {adStats.ctr}%</li>
                            </ul>
                            <button onClick={refreshAds}>
                                🔄 Atualizar Anúncios
                            </button>
                        </div>

                        <div 
                            id="react-sidebar-ad"
                            data-site-id="REACT_APP_2025"
                            data-tags="sidebar,recomendacoes,widgets"
                            data-max-width="280px"
                        />
                    </aside>
                </div>
            </main>

            <style jsx>{`
                .stellar-ads-app {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                .app-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .rewards-display {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                }
                
                .hero {
                    text-align: center;
                    padding: 40px 0;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 15px;
                    margin: 20px 0;
                }
                
                .content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                    margin-top: 30px;
                }
                
                .main-content-area {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .sidebar {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    height: fit-content;
                }
                
                .widget {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                .widget button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                
                .widget button:hover {
                    background: #0056b3;
                }
                
                @media (max-width: 768px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .app-header {
                        flex-direction: column;
                        gap: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default StellarAdsApp;
```

---

## 🎯 Resumo de Implementação

### Checklist Rápido

1. **✅ Escolha seu template** baseado no tipo de site
2. **✅ Substitua `SEU_SITE_ID`** pelo ID real fornecido
3. **✅ Ajuste as tags** de acordo com seu conteúdo
4. **✅ Personalize o CSS** para combinar com seu design
5. **✅ Teste em diferentes dispositivos**
6. **✅ Configure analytics** se necessário
7. **✅ Publique e monitore**

### URLs para Substituir em Produção

- **Desenvolvimento**: `http://localhost:3000/sdk.js`
- **Produção**: `https://api.stellarads.com/sdk.js`

### Suporte

- 📧 **Email**: support@stellarads.com
- 📚 **Docs**: [Documentação Completa](https://docs.stellarads.com)
- 💬 **Chat**: [Discord Community](https://discord.gg/stellarads)

---

**🎉 Pronto!** Agora você tem templates completos para qualquer tipo de site. Escolha o mais adequado, personalize e comece a monetizar com Stellar Ads!

*Templates atualizados em 15/09/2025 - v1.0.0*
