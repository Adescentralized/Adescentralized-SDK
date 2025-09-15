const express = require("express");
const { v4: uuidv4 } = require("uuid");
const database = require("../models/database");
const adMatchingService = require("../services/adMatchingService");
const stellarService = require("../services/stellarService");

const router = express.Router();

/**
 * GET /api/ad - Endpoint para servir anúncios
 * Parâmetros:
 *   - siteId (obrigatório)
 *   - tags (opcional) - tags separadas por vírgula para matching personalizado
 */
router.get("/ad", async (req, res) => {
  try {
    const { siteId, tags } = req.query;

    // Validação de parâmetros
    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: "Parâmetro siteId é obrigatório",
      });
    }

    // Processar tags se fornecidas
    let customTags = [];
    if (tags) {
      customTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      console.log(
        `🏷️  Tags personalizadas recebidas: [${customTags.join(", ")}]`
      );
    }

    // Extrair contexto da requisição
    const context = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      timestamp: new Date().toISOString(),
      customTags, // Adicionar tags personalizadas ao contexto
    };

    console.log(`🔍 Solicitação de anúncio para site: ${siteId}`);

    // Buscar anúncio usando o serviço de matching com tags personalizadas
    const adResult = await adMatchingService.findAdForSite(
      siteId,
      "weighted",
      context
    );

    if (!adResult) {
      return res.json({
        success: false,
        message: "Nenhum anúncio disponível no momento",
      });
    }

    // Registrar impressão assíncronamente (não bloquear resposta)
    setImmediate(() => {
      adMatchingService.recordImpression(
        adResult.ad.campaignId,
        siteId,
        context
      );
    });

    // Responder com dados do anúncio
    res.json(adResult);
  } catch (error) {
    console.error("Erro no endpoint /api/ad:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/click - Endpoint para rastrear cliques e processar pagamentos
 * Parâmetros: campaignId, siteId (obrigatórios)
 */
router.get("/click", async (req, res) => {
  try {
    const { campaignId, siteId } = req.query;

    // Validação de parâmetros
    if (!campaignId || !siteId) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros campaignId e siteId são obrigatórios",
      });
    }

    console.log(
      `👆 Clique registrado - Campanha: ${campaignId}, Site: ${siteId}`
    );

    // Buscar dados da campanha e do site
    const campaign = database.getCampaign(campaignId);
    const site = database.getSite(siteId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campanha não encontrada",
      });
    }

    if (!site) {
      return res.status(404).json({
        success: false,
        error: "Site não encontrado",
      });
    }

    // Extrair contexto da requisição
    const context = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      timestamp: new Date().toISOString(),
    };

    // RESPOSTA IMEDIATA: Redirecionar usuário para a URL de destino
    // Isso garante a melhor experiência do usuário
    res.redirect(302, campaign.target_url);

    // PROCESSAMENTO ASSÍNCRONO: Registrar clique e processar pagamento
    // Isso acontece em segundo plano, sem impactar a experiência do usuário
    setImmediate(async () => {
      try {
        await processClickAsync(campaign, site, context);
      } catch (error) {
        console.error("Erro no processamento assíncrono do clique:", error);
      }
    });
  } catch (error) {
    console.error("Erro no endpoint /api/click:", error);

    // Mesmo em caso de erro, redirecionar para uma URL padrão
    const defaultUrl =
      process.env.DEFAULT_CLICK_REDIRECT_URL || "https://example.com";
    res.redirect(302, defaultUrl);
  }
});

/**
 * Função assíncrona para processar clique e pagamento
 */
async function processClickAsync(campaign, site, context) {
  try {
    const clickId = uuidv4();
    const clickAmount = campaign.cost_per_click;

    // 1. Processar recompensa para usuário
    const userRewardResult = await adMatchingService.processClickWithUserReward(
      campaign.id,
      site.id,
      context
    );

    // 2. Registrar clique no banco de dados
    const clickData = {
      id: clickId,
      campaignId: campaign.id,
      siteId: site.id,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      paymentAmount: clickAmount,
    };

    database.recordClick(clickData);
    console.log(`💾 Clique registrado no banco: ${clickId}`);

    // 3. Processar pagamento via Stellar (se configurado)
    if (stellarService.initialized) {
      console.log(`💳 Processando pagamento de ${clickAmount} XLM...`);

      const paymentResult = await stellarService.processClickPayment(
        campaign,
        site,
        clickAmount
      );

      // 4. Atualizar status do pagamento no banco
      if (paymentResult.success) {
        database.updateClickPaymentStatus(
          clickId,
          paymentResult.transactionHash,
          "completed"
        );

        // Atualizar gastos da campanha
        database.updateCampaignSpent(campaign.id, clickAmount);

        console.log(
          `✅ Pagamento concluído - TX: ${paymentResult.transactionHash}`
        );
      } else {
        database.updateClickPaymentStatus(clickId, null, "failed");
        console.error(`❌ Falha no pagamento: ${paymentResult.error}`);
      }
    } else {
      console.log("⚠️  Stellar não configurado - pagamento não processado");
      database.updateClickPaymentStatus(clickId, null, "skipped");
    }

    console.log(`🎯 Processamento do clique ${clickId} concluído`);

    // Log das recompensas do usuário
    if (userRewardResult && userRewardResult.userReward > 0) {
      console.log(
        `🎁 Usuário recebeu ${userRewardResult.userReward} XLM como recompensa`
      );
    }
  } catch (error) {
    console.error("Erro no processamento assíncrono:", error);
  }
}

/**
 * GET /api/stats - Endpoint para estatísticas (opcional, para monitoramento)
 */
router.get("/stats", (req, res) => {
  try {
    const { timeframe = "24 hours" } = req.query;

    const stats = adMatchingService.getPerformanceStats(timeframe);

    if (!stats) {
      return res.status(500).json({
        success: false,
        error: "Erro ao obter estatísticas",
      });
    }

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/stats:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/validate-site - Endpoint para validar configuração de site (opcional)
 */
router.post("/validate-site", (req, res) => {
  try {
    const { siteId, stellarPublicKey } = req.body;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: "siteId é obrigatório",
      });
    }

    const site = database.getSite(siteId);

    if (!site) {
      return res.status(404).json({
        success: false,
        error: "Site não encontrado",
      });
    }

    // Validar chave Stellar se fornecida
    let stellarValid = true;
    if (stellarPublicKey && stellarService.initialized) {
      try {
        stellarService.validateStellarAccount(stellarPublicKey);
      } catch (error) {
        stellarValid = false;
      }
    }

    res.json({
      success: true,
      site: {
        id: site.id,
        name: site.name,
        domain: site.domain,
        revenueShare: site.revenue_share,
      },
      stellar: {
        configured: !!site.stellar_public_key,
        valid: stellarValid,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/validate-site:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/impression - Endpoint para registrar impressões (visualizações)
 * Parâmetros: campaignId, siteId (obrigatórios)
 */
router.post("/impression", (req, res) => {
  try {
    const { campaignId, siteId } = req.body;

    // Validação de parâmetros
    if (!campaignId || !siteId) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros campaignId e siteId são obrigatórios",
      });
    }

    // Extrair contexto da requisição
    const context = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
      timestamp: new Date().toISOString(),
    };

    console.log(
      `👁️  Impressão registrada - Campanha: ${campaignId}, Site: ${siteId}`
    );

    // Registrar impressão assíncronamente
    setImmediate(() => {
      adMatchingService.recordImpression(campaignId, siteId, context);
    });

    // Resposta rápida
    res.json({
      success: true,
      message: "Impressão registrada",
    });
  } catch (error) {
    console.error("Erro no endpoint /api/impression:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/sites - Endpoint para listar sites cadastrados (para administração)
 */
router.get("/sites", (req, res) => {
  try {
    const sites = database.db
      .prepare("SELECT id, name, domain, revenue_share FROM sites")
      .all();

    res.json({
      success: true,
      sites: sites,
      total: sites.length,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/sites:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/campaigns - Endpoint para listar campanhas disponíveis
 */
router.get("/campaigns", async (req, res) => {
  try {
    console.log("📋 Solicitação de lista de campanhas");

    // Buscar todas as campanhas ativas
    const campaigns = database.getActiveCampaigns();

    if (!campaigns || campaigns.length === 0) {
      return res.json({
        success: true,
        campaigns: [],
        total: 0,
        message: "Nenhuma campanha ativa encontrada",
      });
    }

    // Preparar dados das campanhas (sem informações sensíveis)
    const campaignList = campaigns.map((campaign) => ({
      id: campaign.id,
      advertiser_name: campaign.advertiser_name,
      cost_per_click: campaign.cost_per_click,
      budget_xlm: campaign.budget_xlm,
      spent_xlm: campaign.spent_xlm,
      remaining_budget: campaign.budget_xlm - campaign.spent_xlm,
      tags: campaign.tags,
      active: campaign.active,
    }));

    console.log(`✅ Retornando ${campaignList.length} campanhas ativas`);

    res.json({
      success: true,
      campaigns: campaignList,
      total: campaignList.length,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/campaigns:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/user-rewards - Endpoint para verificar recompensas do usuário
 * Parâmetros: siteId (obrigatório)
 */
router.get("/user-rewards", (req, res) => {
  try {
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: "Parâmetro siteId é obrigatório",
      });
    }

    // Extrair contexto da requisição
    const context = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    // Gerar fingerprint do usuário
    const crypto = require("crypto");
    const fingerprint = [
      context.ip || "unknown",
      context.userAgent || "unknown",
    ].join("|");
    const userFingerprint = crypto
      .createHash("sha256")
      .update(fingerprint)
      .digest("hex");

    // Verificar se usuário pode receber recompensas
    const canReceiveRewards = database.canUserReceiveRewards(
      userFingerprint,
      siteId
    );

    // Obter estatísticas do usuário
    const userStats = database.getUserStats(userFingerprint, siteId) || {
      total_impressions: 0,
      total_clicks: 0,
      total_earned_xlm: 0,
      last_reward_at: null,
    };

    // Calcular tempo restante até próxima recompensa
    let nextRewardIn = 0;
    if (!canReceiveRewards && userStats.last_reward_at) {
      const lastReward = new Date(userStats.last_reward_at);
      const sixHoursLater = new Date(lastReward.getTime() + 6 * 60 * 60 * 1000);
      const now = new Date();
      nextRewardIn = Math.max(
        0,
        Math.ceil((sixHoursLater - now) / (60 * 1000))
      ); // em minutos
    }

    console.log(
      `💎 Consulta de recompensas - Usuário: ${userFingerprint.substring(
        0,
        8
      )}...`
    );

    res.json({
      success: true,
      userRewards: {
        canReceiveRewards,
        nextRewardInMinutes: nextRewardIn,
        statistics: {
          totalImpressions: userStats.total_impressions,
          totalClicks: userStats.total_clicks,
          totalEarnedXLM: parseFloat(userStats.total_earned_xlm || 0),
          lastRewardAt: userStats.last_reward_at,
        },
        rewardRates: {
          impressionReward: 0.001, // XLM por impressão
          clickRewardPercentage: 10, // % do valor do clique
        },
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/user-rewards:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

module.exports = router;
