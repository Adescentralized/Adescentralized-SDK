const Database = require("better-sqlite3");
const path = require("path");

class DatabaseModel {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const dbPath = process.env.DATABASE_PATH || "/tmp/stellar_ads.sqlite";
    console.log(`Conectando ao banco de dados: ${dbPath}`);

    this.db = new Database(dbPath);

    // Habilitar WAL mode para melhor performance
    this.db.pragma("journal_mode = WAL");

    await this.createTables();
    await this.migrateExistingTables();
    await this.insertSampleData();

    console.log("✅ Banco de dados configurado com sucesso");
  }

  async createTables() {
    // Tabela de sites (editores)
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS sites (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                domain TEXT NOT NULL,
                stellar_public_key TEXT NOT NULL,
                revenue_share REAL NOT NULL DEFAULT 0.7,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Tabela de campanhas (anunciantes)
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT PRIMARY KEY,
                advertiser_name TEXT NOT NULL,
                advertiser_stellar_key TEXT NOT NULL,
                image_url TEXT NOT NULL,
                target_url TEXT NOT NULL,
                budget_xlm REAL NOT NULL,
                spent_xlm REAL NOT NULL DEFAULT 0,
                cost_per_click REAL NOT NULL,
                active BOOLEAN NOT NULL DEFAULT 1,
                tags TEXT, -- JSON array de tags para matching
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Tabela de cliques (métricas)
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS clicks (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                site_id TEXT NOT NULL,
                clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                payment_amount REAL NOT NULL,
                payment_tx_hash TEXT,
                payment_status TEXT DEFAULT 'pending', -- pending, completed, failed
                FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
                FOREIGN KEY (site_id) REFERENCES sites(id)
            )
        `);

    // Tabela de impressões (com pagamentos para usuários)
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS impressions (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                site_id TEXT NOT NULL,
                served_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                user_fingerprint TEXT, -- fingerprint único do usuário
                payment_amount REAL DEFAULT 0, -- pagamento para o usuário por visualização
                payment_tx_hash TEXT,
                payment_status TEXT DEFAULT 'pending',
                FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
                FOREIGN KEY (site_id) REFERENCES sites(id)
            )
        `);

    // Tabela de recompensas de usuários (controle de limite temporal)
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_rewards (
                id TEXT PRIMARY KEY,
                user_fingerprint TEXT NOT NULL,
                site_id TEXT NOT NULL,
                last_reward_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_impressions INTEGER DEFAULT 0,
                total_clicks INTEGER DEFAULT 0,
                total_earned_xlm REAL DEFAULT 0,
                stellar_public_key TEXT, -- chave Stellar do usuário (opcional)
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_fingerprint, site_id)
            )
        `);

    // Criar índices após criação das tabelas
    this.createIndexes();
  }

  async migrateExistingTables() {
    // Método simplificado - agora que temos banco limpo, só criar índices se necessário
    console.log("📦 Verificando necessidade de migração...");
    console.log("✅ Banco atualizado com nova estrutura");
  }

  createIndexes() {
    try {
      // Índices para performance
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_clicks_campaign_id ON clicks(campaign_id)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_clicks_site_id ON clicks(site_id)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_impressions_campaign_id ON impressions(campaign_id)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_impressions_site_id ON impressions(site_id)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_impressions_user_fingerprint ON impressions(user_fingerprint)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_user_rewards_fingerprint ON user_rewards(user_fingerprint)`
      );
      this.db.exec(
        `CREATE INDEX IF NOT EXISTS idx_user_rewards_last_reward ON user_rewards(last_reward_at)`
      );

      console.log("✅ Índices criados com sucesso");
    } catch (error) {
      console.warn("⚠️  Aviso ao criar índices:", error.message);
    }
  }

  async insertSampleData() {
    // Verificar se já existem dados
    const existingSites = this.db
      .prepare("SELECT COUNT(*) as count FROM sites")
      .get();

    if (existingSites.count > 0) {
      console.log("Dados de exemplo já existem, pulando inserção...");
      return;
    }

    console.log("Inserindo dados de exemplo...");

    // Sites de exemplo
    const insertSite = this.db.prepare(`
            INSERT INTO sites (id, name, domain, stellar_public_key, revenue_share)
            VALUES (?, ?, ?, ?, ?)
        `);

    // Site 1 - Blog do Desenvolvedor
    insertSite.run(
      "site_example_123",
      "Blog do Desenvolvedor",
      "blog-dev.exemplo.com",
      "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUIUZQE2E5NEJWCJEUKID27KDOMBC",
      0.7
    );

    // Site 2 - Portal de Notícias
    insertSite.run(
      "site_news_portal",
      "TechNews Portal",
      "technews.exemplo.com",
      "GBSTRH4QOTWKVA7FL2VQ2ZWVKWJ5OIQFHZNQQG4VN5SGSXHGZ4DTKQPW",
      0.75
    );

    // Site 3 - Blog Pessoal
    insertSite.run(
      "site_blog_ana",
      "Blog da Ana Costa",
      "anacosta.blog.com",
      "GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM",
      0.8
    );

    // Site 4 - Revista Tech
    insertSite.run(
      "site_tech_magazine",
      "Tech Magazine",
      "techmagazine.exemplo.com",
      "GAEDTJ4PPEFVW5XV2NPFVYXHG77KBSPBD7DEYU5GKYQKDKJXWP2P7E5X",
      0.65
    );

    // Campanhas de exemplo
    const insertCampaign = this.db.prepare(`
            INSERT INTO campaigns (id, advertiser_name, advertiser_stellar_key, image_url, target_url, budget_xlm, cost_per_click, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

    // Campanha 1 - TechStartup
    insertCampaign.run(
      "campaign_tech_001",
      "TechStartup Inc",
      "GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM",
      "https://picsum.photos/300/250?random=1",
      "https://techstartup.exemplo.com",
      100.0,
      0.2, // Aumentado para permitir recompensas de 10% = 0.02 XLM
      JSON.stringify(["tecnologia", "programacao", "startups"])
    );

    // Campanha 2 - Crypto Exchange
    insertCampaign.run(
      "campaign_crypto_002",
      "CryptoExchange Pro",
      "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUIUZQE2E5NEJWCJEUKID27KDOMBC",
      "https://picsum.photos/300/250?random=2",
      "https://cryptoexchange.exemplo.com",
      250.0,
      0.25,
      JSON.stringify(["crypto", "blockchain", "trading"])
    );

    // Campanha 3 - E-learning
    insertCampaign.run(
      "campaign_elearning_003",
      "CodeAcademy Plus",
      "GBSTRH4QOTWKVA7FL2VQ2ZWVKWJ5OIQFHZNQQG4VN5SGSXHGZ4DTKQPW",
      "https://picsum.photos/300/250?random=3",
      "https://codeacademy.exemplo.com",
      150.0,
      0.12,
      JSON.stringify(["educacao", "programacao", "cursos"])
    );

    // Campanha 4 - SaaS Tool
    insertCampaign.run(
      "campaign_saas_004",
      "ProjectManager Pro",
      "GAEDTJ4PPEFVW5XV2NPFVYXHG77KBSPBD7DEYU5GKYQKDKJXWP2P7E5X",
      "https://picsum.photos/300/250?random=4",
      "https://projectmanager.exemplo.com",
      300.0,
      0.2,
      JSON.stringify(["produtividade", "gestao", "saas"])
    );

    // Campanha 5 - Hardware Store
    insertCampaign.run(
      "campaign_hardware_005",
      "TechGear Store",
      "GCZJM35NKGVK47BB4SPBDV25477PZYIYPVVG453LPYFNXLS3FGHDXOCM",
      "https://picsum.photos/300/250?random=5",
      "https://techgear.exemplo.com",
      200.0,
      0.18,
      JSON.stringify(["hardware", "tecnologia", "loja"])
    );

    // Campanha 6 - Cloud Services
    insertCampaign.run(
      "campaign_cloud_006",
      "CloudHost Solutions",
      "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUIUZQE2E5NEJWCJEUKID27KDOMBC",
      "https://picsum.photos/300/250?random=6",
      "https://cloudhost.exemplo.com",
      400.0,
      0.3,
      JSON.stringify(["cloud", "hosting", "infraestrutura"])
    );

    console.log("✅ Dados de exemplo inseridos");
  }

  // Métodos para operações CRUD

  getSite(siteId) {
    return this.db.prepare("SELECT * FROM sites WHERE id = ?").get(siteId);
  }

  getActiveCampaigns() {
    return this.db
      .prepare(
        "SELECT * FROM campaigns WHERE active = 1 AND budget_xlm > spent_xlm"
      )
      .all();
  }

  getCampaign(campaignId) {
    return this.db
      .prepare("SELECT * FROM campaigns WHERE id = ?")
      .get(campaignId);
  }

  recordClick(clickData) {
    const insertClick = this.db.prepare(`
            INSERT INTO clicks (id, campaign_id, site_id, ip_address, user_agent, payment_amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

    return insertClick.run(
      clickData.id,
      clickData.campaignId,
      clickData.siteId,
      clickData.ipAddress,
      clickData.userAgent,
      clickData.paymentAmount
    );
  }

  recordImpression(impressionData) {
    const insertImpression = this.db.prepare(`
            INSERT INTO impressions (id, campaign_id, site_id, ip_address, user_agent, user_fingerprint, payment_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

    return insertImpression.run(
      impressionData.id,
      impressionData.campaignId,
      impressionData.siteId,
      impressionData.ipAddress,
      impressionData.userAgent,
      impressionData.userFingerprint,
      impressionData.paymentAmount || 0
    );
  }

  updateClickPaymentStatus(clickId, txHash, status) {
    const updateClick = this.db.prepare(`
            UPDATE clicks 
            SET payment_tx_hash = ?, payment_status = ?
            WHERE id = ?
        `);

    return updateClick.run(txHash, status, clickId);
  }

  updateCampaignSpent(campaignId, amount) {
    const updateCampaign = this.db.prepare(`
            UPDATE campaigns 
            SET spent_xlm = spent_xlm + ?
            WHERE id = ?
        `);

    return updateCampaign.run(amount, campaignId);
  }

  // Métodos para gerenciar recompensas de usuários

  /**
   * Verifica se um usuário pode receber recompensas (limite de 6 horas)
   */
  canUserReceiveRewards(userFingerprint, siteId) {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const userReward = this.db
      .prepare(
        `
            SELECT * FROM user_rewards 
            WHERE user_fingerprint = ? AND site_id = ?
            AND last_reward_at > ?
        `
      )
      .get(userFingerprint, siteId, sixHoursAgo);

    return !userReward; // Se não encontrou registro recente, pode receber recompensas
  }

  /**
   * Cria ou atualiza registro de recompensas do usuário
   */
  updateUserRewards(userFingerprint, siteId, earnedAmount, isClick = false) {
    // Verificar se já existe registro
    const existing = this.db
      .prepare(
        `
            SELECT * FROM user_rewards 
            WHERE user_fingerprint = ? AND site_id = ?
        `
      )
      .get(userFingerprint, siteId);

    if (existing) {
      // Atualizar registro existente
      const updateUser = this.db.prepare(`
                UPDATE user_rewards 
                SET last_reward_at = CURRENT_TIMESTAMP,
                    total_impressions = total_impressions + ?,
                    total_clicks = total_clicks + ?,
                    total_earned_xlm = total_earned_xlm + ?
                WHERE user_fingerprint = ? AND site_id = ?
            `);

      return updateUser.run(
        isClick ? 0 : 1, // incrementa impressões se não for clique
        isClick ? 1 : 0, // incrementa cliques se for clique
        earnedAmount,
        userFingerprint,
        siteId
      );
    } else {
      // Criar novo registro
      const { v4: uuidv4 } = require("uuid");
      const insertUser = this.db.prepare(`
                INSERT INTO user_rewards (id, user_fingerprint, site_id, total_impressions, total_clicks, total_earned_xlm)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

      return insertUser.run(
        uuidv4(),
        userFingerprint,
        siteId,
        isClick ? 0 : 1,
        isClick ? 1 : 0,
        earnedAmount
      );
    }
  }

  /**
   * Obtém estatísticas do usuário
   */
  getUserStats(userFingerprint, siteId) {
    return this.db
      .prepare(
        `
            SELECT * FROM user_rewards 
            WHERE user_fingerprint = ? AND site_id = ?
        `
      )
      .get(userFingerprint, siteId);
  }

  /**
   * Atualiza status de pagamento de impressão
   */
  updateImpressionPaymentStatus(impressionId, txHash, status) {
    const updateImpression = this.db.prepare(`
            UPDATE impressions 
            SET payment_tx_hash = ?, payment_status = ?
            WHERE id = ?
        `);

    return updateImpression.run(txHash, status, impressionId);
  }

  /**
   * Obtém configurações de recompensas do sistema
   */
  getRewardSettings() {
    return {
      impressionReward: 0.001, // XLM por impressão
      clickRewardPercentage: 10, // % do valor do clique
      cooldownHours: 6, // Horas entre recompensas
      minClickValue: 0.1, // Valor mínimo do clique para recompensas
    };
  }

  // Método para estatísticas
  getClickStats(timeframe = "24 hours") {
    const sql = `
            SELECT 
                COUNT(*) as total_clicks,
                SUM(payment_amount) as total_revenue,
                COUNT(DISTINCT campaign_id) as active_campaigns,
                COUNT(DISTINCT site_id) as active_sites
            FROM clicks 
            WHERE clicked_at > datetime('now', '-${timeframe}')
        `;

    return this.db.prepare(sql).get();
  }

  // Método para estatísticas completas (cliques + impressões)
  getCompleteStats(timeframe = "24 hours") {
    // Estatísticas de cliques
    const clickStats = this.db
      .prepare(
        `
            SELECT 
                COUNT(*) as total_clicks,
                SUM(payment_amount) as total_revenue,
                COUNT(DISTINCT campaign_id) as campaigns_with_clicks,
                COUNT(DISTINCT site_id) as sites_with_clicks
            FROM clicks 
            WHERE clicked_at > datetime('now', '-${timeframe}')
        `
      )
      .get();

    // Estatísticas de impressões
    const impressionStats = this.db
      .prepare(
        `
            SELECT 
                COUNT(*) as total_impressions,
                COUNT(DISTINCT campaign_id) as campaigns_with_impressions,
                COUNT(DISTINCT site_id) as sites_with_impressions
            FROM impressions 
            WHERE served_at > datetime('now', '-${timeframe}')
        `
      )
      .get();

    // Campanhas ativas
    const activeCampaigns = this.db
      .prepare(
        `
            SELECT COUNT(*) as count 
            FROM campaigns 
            WHERE active = 1 AND budget_xlm > spent_xlm
        `
      )
      .get();

    return {
      clicks: {
        total: clickStats.total_clicks || 0,
        revenue: parseFloat(clickStats.total_revenue || 0),
        campaigns: clickStats.campaigns_with_clicks || 0,
        sites: clickStats.sites_with_clicks || 0,
      },
      impressions: {
        total: impressionStats.total_impressions || 0,
        campaigns: impressionStats.campaigns_with_impressions || 0,
        sites: impressionStats.sites_with_impressions || 0,
      },
      general: {
        activeCampaigns: activeCampaigns.count || 0,
        ctr:
          impressionStats.total_impressions > 0
            ? (
                (clickStats.total_clicks / impressionStats.total_impressions) *
                100
              ).toFixed(2)
            : 0,
        averageCPC:
          clickStats.total_clicks > 0
            ? (clickStats.total_revenue / clickStats.total_clicks).toFixed(4)
            : 0,
      },
      timeframe,
    };
  }
}

module.exports = new DatabaseModel();
