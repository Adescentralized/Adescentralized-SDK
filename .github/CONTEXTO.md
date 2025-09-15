# 📋 Contexto do Projeto: Stellar Ads SDK

## 🎯 Visão Geral do Projeto

O **Stellar Ads SDK** é uma plataforma de anúncios descentralizada que utiliza a blockchain Stellar para automatizar pagamentos entre anunciantes e editores de conteúdo. O sistema combina um backend robusto em Node.js com um SDK JavaScript leve para integração em sites de terceiros.

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **Backend API (Node.js/Express)**
   - Gerenciamento de campanhas publicitárias
   - Matching inteligente de anúncios
   - Rastreamento de cliques e impressões
   - Integração com Stellar para pagamentos automatizados

2. **SDK JavaScript**
   - Biblioteca leve para incorporação em sites
   - Carregamento assíncrono de anúncios
   - Sistema de tags personalizadas
   - Interface responsiva e cross-browser

3. **Sistema de Pagamentos (Stellar)**
   - Processamento automático de pagamentos em XLM
   - Divisão de receitas entre editores e plataforma
   - Transparência via blockchain pública

4. **Base de Dados (SQLite)**
   - Armazenamento de campanhas, sites e métricas
   - Índices otimizados para performance
   - Dados de exemplo para desenvolvimento

## 📁 Estrutura do Projeto

```
/
├── .github/
│   └── copilot-instructions.md    # Instruções para GitHub Copilot
├── src/                           # Código fonte do backend
│   ├── models/
│   │   └── database.js           # Modelo de dados e SQLite
│   ├── routes/
│   │   └── adRoutes.js           # Endpoints da API
│   └── services/
│       ├── adMatchingService.js   # Algoritmos de matching
│       └── stellarService.js      # Integração Stellar
├── public/                        # Arquivos estáticos
│   ├── sdk.js                    # SDK JavaScript
│   ├── index.html                # Página de demonstração
│   ├── news-site.html            # Exemplo de site de notícias
│   └── gerador-sdk.html          # Ferramenta de geração de código
├── index.js                      # Servidor principal
├── package.json                  # Configurações e dependências
└── README.md                     # Documentação principal
```

## 🔧 Tecnologias Utilizadas

### Backend
- **Express.js**: Framework web para Node.js
- **better-sqlite3**: Banco de dados SQLite para armazenamento
- **@stellar/stellar-sdk**: SDK oficial da Stellar
- **helmet**: Middleware de segurança
- **cors**: Controle de CORS para integração cross-origin
- **morgan**: Logging de requisições HTTP
- **uuid**: Geração de identificadores únicos

### Frontend/SDK
- **JavaScript Vanilla**: SDK sem dependências externas
- **HTML5/CSS3**: Interfaces de demonstração
- **Fetch API**: Comunicação com o backend

### Blockchain
- **Stellar Network**: Pagamentos em XLM (Lumens)
- **Testnet/Mainnet**: Suporte para ambas as redes

## 🎯 Funcionalidades Principais

### 1. Sistema de Matching Inteligente
- **Algoritmo Aleatório**: Distribuição uniforme entre campanhas
- **Algoritmo Ponderado**: Baseado em orçamento disponível
- **Matching por Tags**: Correspondência entre tags de campanha e site
- **Tags Personalizadas**: Sistema flexível de categorização

### 2. Rastreamento de Métricas
- **Impressões**: Visualizações de anúncios
- **Cliques**: Interações dos usuários
- **CTR (Click-Through Rate)**: Taxa de conversão
- **CPC (Cost Per Click)**: Custo médio por clique
- **Receita**: Valores transacionados

### 3. Gestão de Campanhas
- **Orçamento Controlado**: Limite de gastos por campanha
- **Status Ativo/Inativo**: Controle de disponibilidade
- **Múltiplos Anunciantes**: Suporte para diversos clientes
- **URLs de Destino**: Redirecionamentos personalizados

### 4. Sistema de Sites (Editores)
- **Revenue Share**: Divisão configurável de receitas
- **Domínios Específicos**: Controle por site
- **Chaves Stellar**: Pagamentos diretos para editores

## 🔄 Fluxo de Operação

### 1. Carregamento de Anúncios
```
Site Editor → SDK.js → API Backend → Matching Service → Campanha Selecionada → Anúncio Exibido
```

### 2. Processamento de Cliques
```
Usuário Clica → Redirecionamento Imediato → Registro Assíncrono → Pagamento Stellar → Atualização Métricas
```

### 3. Sistema de Pagamentos
```
Clique Registrado → Cálculo de Divisão → Transação Stellar → Editor (70%) + Plataforma (30%)
```

## 📊 Modelo de Dados

### Sites (Editores)
- **id**: Identificador único
- **name**: Nome do site
- **domain**: Domínio do site
- **stellar_public_key**: Chave pública para pagamentos
- **revenue_share**: Porcentagem de receita (padrão: 70%)

### Campanhas (Anunciantes)
- **id**: Identificador único
- **advertiser_name**: Nome do anunciante
- **advertiser_stellar_key**: Chave Stellar do anunciante
- **image_url**: URL da imagem do anúncio
- **target_url**: URL de destino do clique
- **budget_xlm**: Orçamento total em XLM
- **spent_xlm**: Valor já gasto
- **cost_per_click**: Valor pago por clique
- **tags**: Tags para matching (JSON)

### Cliques (Métricas)
- **id**: Identificador único
- **campaign_id**: Referência à campanha
- **site_id**: Referência ao site
- **clicked_at**: Timestamp do clique
- **ip_address**: IP do usuário
- **user_agent**: Navegador utilizado
- **payment_amount**: Valor do pagamento
- **payment_tx_hash**: Hash da transação Stellar
- **payment_status**: Status do pagamento

## 🚀 Endpoints da API

### GET /api/ad
- **Função**: Servir anúncios para sites
- **Parâmetros**: `siteId` (obrigatório), `tags` (opcional)
- **Resposta**: Dados do anúncio com URL de clique

### GET /api/click
- **Função**: Rastrear cliques e processar pagamentos
- **Parâmetros**: `campaignId`, `siteId`
- **Comportamento**: Redirecionamento imediato + processamento assíncrono

### GET /api/stats
- **Função**: Estatísticas de performance
- **Parâmetros**: `timeframe` (opcional, padrão: 24h)
- **Resposta**: Métricas completas de cliques e impressões

### GET /api/campaigns
- **Função**: Listar campanhas ativas
- **Resposta**: Array de campanhas disponíveis

### GET /api/sites
- **Função**: Listar sites cadastrados
- **Resposta**: Array de sites com informações básicas

## 🔒 Segurança e Performance

### Medidas de Segurança
- **Helmet.js**: Headers de segurança HTTP
- **CORS Configurado**: Controle de origem cruzada
- **Validação de Parâmetros**: Sanitização de entradas
- **Rate Limiting**: Proteção contra spam (implícito)

### Otimizações de Performance
- **Processamento Assíncrono**: Cliques não bloqueiam redirecionamentos
- **Índices de Banco**: Consultas otimizadas
- **WAL Mode**: SQLite em modo Write-Ahead Logging
- **Cache Control**: Headers de cache otimizados

## 🧪 Ambiente de Desenvolvimento

### Configuração Local
1. **Node.js 16+** instalado
2. **npm install** para dependências
3. **npm run dev** para servidor com nodemon
4. Banco SQLite criado automaticamente com dados de exemplo

### Dados de Exemplo
- **6 Campanhas**: Diferentes categorias e orçamentos
- **4 Sites**: Diversos domínios e revenue shares
- **Tags Variadas**: tecnologia, programação, startups, etc.

### Ferramentas de Debug
- **Morgan Logging**: Logs detalhados de requisições
- **Console Logs**: Rastreamento de matching e pagamentos
- **Health Check**: Endpoint `/health` para monitoramento

## 🎨 Interface do SDK

### Integração Simples
```html
<div id="stellar-ad-container" data-site-id="site_example_123" data-tags="tecnologia,programacao"></div>
<script src="http://localhost:3000/sdk.js"></script>
```

### Configuração Avançada
```javascript
window.StellarAdsConfig = {
  siteId: 'site_example_123',
  tags: ['tecnologia', 'programacao', 'startups'],
  containerId: 'meu-container-personalizado'
};
```

## 📈 Métricas e Analytics

### Dashboard de Estatísticas
- **Total de Cliques**: Contador global
- **Receita Total**: Soma em XLM
- **Campanhas Ativas**: Número atual
- **Sites Ativos**: Editores com tráfego
- **CTR Médio**: Taxa de conversão
- **CPC Médio**: Custo médio por clique

### Filtragem Temporal
- **24 horas** (padrão)
- **7 dias**
- **30 dias**
- **Personalizado**

## 🔮 Próximos Passos

### Funcionalidades Futuras
1. **Dashboard Administrativo**: Interface web para gestão
2. **API de Campanhas**: CRUD completo via API
3. **Relatórios Avançados**: Analytics detalhados
4. **Múltiplos Formatos**: Banners diferentes (728x90, 160x600)
5. **Targeting Geográfico**: Segmentação por localização
6. **A/B Testing**: Testes de diferentes criativos

### Melhorias Técnicas
1. **Redis Cache**: Cache distribuído
2. **Load Balancer**: Escalabilidade horizontal
3. **Monitoring**: Prometheus + Grafana
4. **CI/CD Pipeline**: Deploy automatizado
5. **Testes Unitários**: Cobertura completa
6. **Docker**: Containerização

## 💡 Casos de Uso

### Para Editores (Sites)
- Monetização de conteúdo sem intermediários
- Pagamentos instantâneos e transparentes
- Controle total sobre tipos de anúncios exibidos
- Revenue share configurável

### Para Anunciantes
- Pagamento apenas por cliques efetivos
- Targeting por tags e categorias
- Orçamento controlado e previsível
- Transparência via blockchain

### Para a Plataforma
- Modelo de negócio sustentável (30% dos cliques)
- Escalabilidade via blockchain
- Automatização completa de pagamentos
- Analytics em tempo real

---

**Data de Criação**: 15 de setembro de 2025
**Versão**: 1.0.0
**Ambiente**: Desenvolvimento/Testnet Stellar
