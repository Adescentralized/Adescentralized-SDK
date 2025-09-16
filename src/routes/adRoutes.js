const express = require("express");
const { v4: uuidv4 } = require("uuid");
const database = require("../models/database");
const adMatchingService = require("../services/adMatchingService");
const stellarService = require("../services/stellarService");
const sorobanService = require("../services/sorobanService");
const sorobanContractsService = require("../services/sorobanContractsService");

const router = express.Router();

// ============= CONTRATOS SOROBAN ENDPOINTS =============

// ========== VERIFIER REGISTRY ENDPOINTS ==========

/**
 * POST /api/soroban/verifier-registry/init
 * Inicializa o registry e define o owner
 */
router.post("/soroban/verifier-registry/init", async (req, res) => {
  try {
    const { ownerAddress } = req.body;

    if (!ownerAddress) {
      return res.status(400).json({
        success: false,
        error: "ownerAddress é obrigatório",
      });
    }

    const result = await sorobanContractsService.initVerifierRegistry(ownerAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Verifier Registry inicializado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/verifier-registry/init:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/verifier-registry/add-verifier
 * Autoriza um endereço a atuar como verifier
 */
router.post("/soroban/verifier-registry/add-verifier", async (req, res) => {
  try {
    const { verifierAddress } = req.body;

    if (!verifierAddress) {
      return res.status(400).json({
        success: false,
        error: "verifierAddress é obrigatório",
      });
    }

    const result = await sorobanContractsService.addVerifier(verifierAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Verifier adicionado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/verifier-registry/add-verifier:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/verifier-registry/set-publisher-status
 * Liga/Desliga um publisher na allow-list
 */
router.post("/soroban/verifier-registry/set-publisher-status", async (req, res) => {
  try {
    const { publisherAddress, allowed } = req.body;

    if (!publisherAddress || typeof allowed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "publisherAddress e allowed (boolean) são obrigatórios",
      });
    }

    const result = await sorobanContractsService.setPublisherStatus(publisherAddress, allowed);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: `Publisher ${allowed ? 'habilitado' : 'desabilitado'} com sucesso`,
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/verifier-registry/set-publisher-status:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/soroban/verifier-registry/is-verifier
 * Checa se um endereço é verifier autorizado
 */
router.get("/soroban/verifier-registry/is-verifier", async (req, res) => {
  try {
    const { verifierAddress } = req.query;

    if (!verifierAddress) {
      return res.status(400).json({
        success: false,
        error: "verifierAddress é obrigatório",
      });
    }

    const result = await sorobanContractsService.isVerifier(verifierAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: {
        verifierAddress,
        isVerifier: result.isVerifier,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/verifier-registry/is-verifier:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/soroban/verifier-registry/is-publisher-allowed
 * Checa se um publisher está permitido
 */
router.get("/soroban/verifier-registry/is-publisher-allowed", async (req, res) => {
  try {
    const { publisherAddress } = req.query;

    if (!publisherAddress) {
      return res.status(400).json({
        success: false,
        error: "publisherAddress é obrigatório",
      });
    }

    const result = await sorobanContractsService.isPublisherAllowed(publisherAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: {
        publisherAddress,
        isAllowed: result.isAllowed,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/verifier-registry/is-publisher-allowed:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// ========== ADVAULT ENDPOINTS ==========

/**
 * POST /api/soroban/advault/init
 * Configura o protocolo (token, registry, preço e splits)
 */
router.post("/soroban/advault/init", async (req, res) => {
  try {
    const {
      adminAddress,
      tokenAddress,
      verifierRegistryAddress,
      pricePerEvent,
      splitPublisherBps,
      splitViewerBps,
      feeBps,
    } = req.body;

    // Validação básica
    if (!adminAddress || !tokenAddress || !verifierRegistryAddress || 
        !pricePerEvent || !splitPublisherBps || !splitViewerBps || !feeBps) {
      return res.status(400).json({
        success: false,
        error: "Todos os parâmetros são obrigatórios",
      });
    }

    const config = {
      adminAddress,
      tokenAddress,
      verifierRegistryAddress,
      pricePerEvent: sorobanContractsService.toTokenUnits(pricePerEvent),
      splitPublisherBps,
      splitViewerBps,
      feeBps,
    };

    const result = await sorobanContractsService.initAdVault(config);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "AdVault inicializado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/init:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/soroban/advault/config
 * Retorna a configuração atual
 */
router.get("/soroban/advault/config", async (req, res) => {
  try {
    const result = await sorobanContractsService.getAdVaultConfig();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: result.config,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/config:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/create-campaign
 * Cria campanha e já deposita orçamento inicial
 */
router.post("/soroban/advault/create-campaign", async (req, res) => {
  try {
    const { advertiserAddress, initialDeposit, advertiserSecretKey } = req.body;

    if (!advertiserAddress || !initialDeposit || !advertiserSecretKey) {
      return res.status(400).json({
        success: false,
        error: "advertiserAddress, initialDeposit e advertiserSecretKey são obrigatórios",
      });
    }

    // Gerar ID único para a campanha
    const campaignId = sorobanContractsService.generateCampaignId();

    // Criar keypair do advertiser
    const advertiserKeypair = sorobanService.server.Keypair.fromSecret(advertiserSecretKey);

    const result = await sorobanContractsService.createCampaign(
      campaignId,
      advertiserAddress,
      sorobanContractsService.toTokenUnits(initialDeposit),
      advertiserKeypair
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Campanha criada com sucesso",
      data: {
        campaignId,
        ...result,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/create-campaign:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/deposit
 * Deposita mais orçamento numa campanha
 */
router.post("/soroban/advault/deposit", async (req, res) => {
  try {
    const { campaignId, fromAddress, amount, fromSecretKey } = req.body;

    if (!campaignId || !fromAddress || !amount || !fromSecretKey) {
      return res.status(400).json({
        success: false,
        error: "campaignId, fromAddress, amount e fromSecretKey são obrigatórios",
      });
    }

    // Criar keypair do depositante
    const fromKeypair = sorobanService.server.Keypair.fromSecret(fromSecretKey);

    const result = await sorobanContractsService.depositToCampaign(
      campaignId,
      fromAddress,
      sorobanContractsService.toTokenUnits(amount),
      fromKeypair
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Depósito realizado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/deposit:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/submit-event
 * Registra um evento atestado por verifier e faz os pagamentos
 */
router.post("/soroban/advault/submit-event", async (req, res) => {
  try {
    const { campaignId, publisherAddress, viewerAddress, eventKind } = req.body;

    if (!campaignId || !publisherAddress || !viewerAddress || !eventKind) {
      return res.status(400).json({
        success: false,
        error: "campaignId, publisherAddress, viewerAddress e eventKind são obrigatórios",
      });
    }

    // Criar attestation
    const attestation = sorobanContractsService.createAttestation({
      campaignId,
      publisherAddress,
      viewerAddress,
      eventKind,
    });

    const result = await sorobanContractsService.submitEvent(attestation);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Evento registrado e pagamentos processados",
      data: {
        eventId: attestation.event_id,
        attestation,
        payments: result.payments,
      },
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/submit-event:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/pause
 * Pausa o protocolo
 */
router.post("/soroban/advault/pause", async (req, res) => {
  try {
    const result = await sorobanContractsService.pauseProtocol();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Protocolo pausado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/pause:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/unpause
 * Despausa o protocolo
 */
router.post("/soroban/advault/unpause", async (req, res) => {
  try {
    const result = await sorobanContractsService.unpauseProtocol();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Protocolo despausado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/unpause:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/close-campaign
 * Fecha uma campanha
 */
router.post("/soroban/advault/close-campaign", async (req, res) => {
  try {
    const { campaignId, reason } = req.body;

    if (!campaignId || !reason) {
      return res.status(400).json({
        success: false,
        error: "campaignId e reason são obrigatórios",
      });
    }

    const result = await sorobanContractsService.closeCampaign(campaignId, reason);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Campanha fechada com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/close-campaign:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/soroban/advault/refund-unspent
 * Reembolsa orçamento não gasto de uma campanha
 */
router.post("/soroban/advault/refund-unspent", async (req, res) => {
  try {
    const { campaignId, toAddress } = req.body;

    if (!campaignId || !toAddress) {
      return res.status(400).json({
        success: false,
        error: "campaignId e toAddress são obrigatórios",
      });
    }

    const result = await sorobanContractsService.refundUnspent(campaignId, toAddress);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Reembolso realizado com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/advault/refund-unspent:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// ========== TOKEN ENDPOINTS ==========

/**
 * POST /api/soroban/token/mint
 * Mint tokens para um endereço
 */
router.post("/soroban/token/mint", async (req, res) => {
  try {
    const { toAddress, amount } = req.body;

    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "toAddress e amount são obrigatórios",
      });
    }

    const result = await sorobanContractsService.mintTokens(
      toAddress,
      sorobanContractsService.toTokenUnits(amount)
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: "Tokens mintados com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/soroban/token/mint:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

// ============= ENDPOINTS EXISTENTES =============

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
    const { campaignId, siteId, destinationWallet } = req.query;

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
        await processClickAsync(campaign, site, context, destinationWallet);
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
async function processClickAsync(campaign, site, context, destinationWallet) {
  try {
    const clickId = uuidv4();
    const clickAmount = campaign.cost_per_click;

    // 1. Processar recompensa para usuário
    const userRewardResult = await adMatchingService.processClickWithUserReward(
      campaign.id,
      site.id,
      context,
      destinationWallet
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
        clickAmount,
        destinationWallet
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
 * Parâmetros: campaignId, siteId, userPublicKey (opcional), publisherAddress (opcional)
 */
router.post("/impression", async (req, res) => {
  try {
    const { campaignId, siteId, userPublicKey, publisherAddress } = req.body;

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
      walletPublicKey: userPublicKey,
      publisherAddress,
    };

    console.log(
      `📊 Registrando impressão - Campanha: ${campaignId}, Site: ${siteId}, Usuário: ${
        userPublicKey ? "Com carteira" : "Sem carteira"
      }`
    );

    // Registrar impressão no banco de dados local
    await adMatchingService.recordImpression(campaignId, siteId, context);

    let response = {
      success: true,
      message: "Impressão registrada com sucesso",
    };

    // Se temos carteira do usuário e endereço do publisher, processar via Soroban
    if (userPublicKey && publisherAddress) {
      try {
        console.log(`🔗 Processando impressão via Soroban - Viewer: ${userPublicKey}, Publisher: ${publisherAddress}`);
        
        const attestation = sorobanContractsService.createAttestation({
          campaignId,
          publisherAddress,
          viewerAddress: userPublicKey,
          eventKind: "impression",
        });

        const eventResult = await sorobanContractsService.submitEvent(attestation);

        if (eventResult.success) {
          response.sorobanPayment = {
            eventProcessed: true,
            eventId: attestation.event_id,
            payments: eventResult.payments,
            viewerReward: sorobanContractsService.fromTokenUnits(eventResult.payments.viewer),
            publisherReward: sorobanContractsService.fromTokenUnits(eventResult.payments.publisher),
            protocolFee: sorobanContractsService.fromTokenUnits(eventResult.payments.fee),
          };
          
          console.log(
            `💰 Pagamentos Soroban processados - Viewer: ${response.sorobanPayment.viewerReward} ADVT, Publisher: ${response.sorobanPayment.publisherReward} ADVT`
          );
        } else {
          console.warn("Falha ao processar evento no Soroban:", eventResult.error);
          response.warning = "Impressão registrada, mas pagamento Soroban falhou";
        }
      } catch (sorobanError) {
        console.error("Erro ao processar evento Soroban:", sorobanError);
        response.warning = "Impressão registrada, mas erro no processamento Soroban";
        // Continuar sem falhar a impressão
      }
    } else if (userPublicKey) {
      // Fallback para o sistema legado se não tiver publisherAddress
      try {
        const rewardResult = await processUserImpressionReward(
          userPublicKey,
          campaignId,
          siteId
        );

        if (rewardResult.eligible) {
          response.userReward = {
            amount: rewardResult.amount,
            transactionId: rewardResult.transactionId,
            type: "impression",
            system: "stellar_legacy",
          };
          console.log(
            `💰 Recompensa legada processada para usuário ${userPublicKey}: ${rewardResult.amount} XLM`
          );
        }
      } catch (rewardError) {
        console.error("Erro ao processar recompensa legada:", rewardError);
      }
    }

    res.json(response);
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
 * POST /api/sites - Endpoint para cadastrar novo site
 * Parâmetros: name (obrigatório), domain (obrigatório), revenueShare (opcional), stellarPublicKey (opcional)
 */
router.post("/sites", async (req, res) => {
  try {
    const { name, domain, revenueShare = 0.7, stellarPublicKey } = req.body;

    // Validação de parâmetros obrigatórios
    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros name e domain são obrigatórios",
      });
    }

    // Validar revenue share (deve estar entre 0 e 1)
    if (revenueShare < 0 || revenueShare > 1) {
      return res.status(400).json({
        success: false,
        error: "revenueShare deve estar entre 0 e 1 (exemplo: 0.7 para 70%)",
      });
    }

    // Gerar ID único para o site
    const siteId = `site_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

    const siteData = {
      id: siteId,
      name: name.trim(),
      domain: domain.toLowerCase().trim(),
      stellarPublicKey,
      revenueShare
    };

    // Criar site usando método do database
    const newSite = database.createSite(siteData);

    console.log(`🌐 Novo site cadastrado: ${name} (${domain}) - ID: ${siteId}`);

    res.status(201).json({
      success: true,
      site: {
        id: newSite.id,
        name: newSite.name,
        domain: newSite.domain,
        revenueShare: newSite.revenue_share,
        stellarPublicKey: newSite.stellar_public_key || null,
        createdAt: newSite.created_at
      },
      message: "Site cadastrado com sucesso",
    });

  } catch (error) {
    console.error("Erro no endpoint POST /api/sites:", error);
    
    // Tratamento específico para erro de domínio duplicado
    if (error.message.includes("Já existe um site")) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

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

/**
 * POST /api/user-wallet - Endpoint para registrar/atualizar carteira do usuário
 */
router.post("/user-wallet", async (req, res) => {
  try {
    const { publicKey } = req.body;

    // Validação de parâmetros
    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: "Parâmetro publicKey é obrigatório",
      });
    }

    console.log(`🔑 Registrando carteira do usuário: ${publicKey}`);

    // Registrar/atualizar carteira no banco de dados
    const db = await database.getConnection();

    // Verificar se carteira já existe
    const existingWallet = await db.get(
      `SELECT * FROM user_wallets WHERE public_key = ?`,
      [publicKey]
    );

    if (existingWallet) {
      // Atualizar timestamp da última atividade
      await db.run(
        `UPDATE user_wallets SET last_seen = CURRENT_TIMESTAMP WHERE public_key = ?`,
        [publicKey]
      );
      console.log(`📝 Carteira atualizada: ${publicKey}`);
    } else {
      // Criar nova entrada para a carteira
      await db.run(
        `INSERT INTO user_wallets (public_key, created_at, last_seen) 
         VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [publicKey]
      );
      console.log(`✅ Nova carteira registrada: ${publicKey}`);
    }

    res.json({
      success: true,
      message: "Carteira registrada com sucesso",
    });
  } catch (error) {
    console.error("Erro no endpoint /api/user-wallet:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/user-balance - Endpoint para verificar saldo de uma carteira
 */
router.get("/user-balance", async (req, res) => {
  try {
    const { publicKey } = req.query;

    // Validação de parâmetros
    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: "Parâmetro publicKey é obrigatório",
      });
    }

    console.log(`💰 Verificando saldo da carteira: ${publicKey}`);

    // Consultar saldo via Stellar
    const balance = await stellarService.getAccountBalance(publicKey);

    if (balance !== null) {
      res.json({
        success: true,
        balance: balance,
        publicKey: publicKey,
      });
    } else {
      res.json({
        success: false,
        message: "Conta não encontrada na rede Stellar",
        publicKey: publicKey,
      });
    }
  } catch (error) {
    console.error("Erro no endpoint /api/user-balance:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
});

/**
 * Processa recompensa de impressão para usuário
 */
async function processUserImpressionReward(userPublicKey, campaignId, siteId) {
  try {
    // Verificar elegibilidade do usuário para recompensa
    const db = await database.getConnection();

    // Verificar última recompensa do usuário (limite de tempo)
    const lastReward = await db.get(
      `SELECT created_at FROM user_rewards 
       WHERE user_public_key = ? AND type = 'impression'
       ORDER BY created_at DESC LIMIT 1`,
      [userPublicKey]
    );

    // Aplicar limite de 1 recompensa por impressão a cada 10 minutos
    if (lastReward) {
      const lastRewardTime = new Date(lastReward.created_at);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      if (lastRewardTime > tenMinutesAgo) {
        return { eligible: false, reason: "cooldown" };
      }
    }

    // Definir valor da recompensa
    const rewardAmount = 0.001; // 0.001 XLM por impressão

    // Buscar informações da campanha para pagamento
    const campaign = await db.get(`SELECT * FROM campaigns WHERE id = ?`, [
      campaignId,
    ]);

    if (!campaign || campaign.status !== "active") {
      return { eligible: false, reason: "campaign_inactive" };
    }

    // Processar pagamento via Stellar
    const paymentResult = await stellarService.sendPayment(
      userPublicKey,
      rewardAmount,
      `Recompensa por visualizar anúncio - Campanha ${campaignId}`
    );

    if (paymentResult.success) {
      // Registrar recompensa no banco de dados
      await db.run(
        `INSERT INTO user_rewards 
         (user_public_key, campaign_id, site_id, type, amount, transaction_id, created_at)
         VALUES (?, ?, ?, 'impression', ?, ?, CURRENT_TIMESTAMP)`,
        [
          userPublicKey,
          campaignId,
          siteId,
          rewardAmount,
          paymentResult.transactionId,
        ]
      );

      return {
        eligible: true,
        amount: rewardAmount,
        transactionId: paymentResult.transactionId,
      };
    } else {
      return { eligible: false, reason: "payment_failed" };
    }
  } catch (error) {
    console.error("Erro ao processar recompensa de impressão:", error);
    return { eligible: false, reason: "error" };
  }
}

/**
 * Busca informações de recompensas do usuário
 */
async function getUserRewardsInfo(siteId, userPublicKey) {
  try {
    const db = await database.getConnection();

    let canReceiveRewards = false;
    let nextRewardInMinutes = 0;
    let userStats = {
      total_impressions: 0,
      total_clicks: 0,
      total_earned_xlm: 0,
      last_reward_at: null,
    };

    if (userPublicKey) {
      // Buscar estatísticas do usuário
      const stats = await db.get(
        `SELECT 
           COUNT(CASE WHEN type = 'impression' THEN 1 END) as total_impressions,
           COUNT(CASE WHEN type = 'click' THEN 1 END) as total_clicks,
           COALESCE(SUM(amount), 0) as total_earned_xlm,
           MAX(created_at) as last_reward_at
         FROM user_rewards 
         WHERE user_public_key = ?`,
        [userPublicKey]
      );

      if (stats) {
        userStats = stats;
      }

      // Verificar se pode receber recompensa (última recompensa > 10 minutos)
      if (userStats.last_reward_at) {
        const lastRewardTime = new Date(userStats.last_reward_at);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        if (lastRewardTime <= tenMinutesAgo) {
          canReceiveRewards = true;
        } else {
          const nextReward = new Date(
            lastRewardTime.getTime() + 10 * 60 * 1000
          );
          nextRewardInMinutes = Math.ceil(
            (nextReward - Date.now()) / (60 * 1000)
          );
        }
      } else {
        canReceiveRewards = true;
      }
    }

    return {
      canReceiveRewards,
      nextRewardInMinutes,
      statistics: {
        totalImpressions: userStats.total_impressions || 0,
        totalClicks: userStats.total_clicks || 0,
        totalEarnedXLM: parseFloat(userStats.total_earned_xlm || 0),
        lastRewardAt: userStats.last_reward_at,
      },
      rewardRates: {
        impressionReward: 0.001, // XLM por impressão
        clickRewardPercentage: 10, // % do valor do clique
      },
    };
  } catch (error) {
    console.error("Erro ao buscar informações de recompensas:", error);
    throw error;
  }
}

// ========== NOVOS ENDPOINTS ==========

/**
 * GET /api/click-soroban - Endpoint para rastrear cliques com processamento via Soroban
 * Parâmetros: campaignId, siteId, userPublicKey, publisherAddress (obrigatórios)
 */
router.get("/click-soroban", async (req, res) => {
  try {
    const { campaignId, siteId, userPublicKey, publisherAddress } = req.query;

    // Validação de parâmetros
    if (!campaignId || !siteId || !userPublicKey || !publisherAddress) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros campaignId, siteId, userPublicKey e publisherAddress são obrigatórios",
      });
    }

    console.log(
      `👆 Clique Soroban registrado - Campanha: ${campaignId}, Site: ${siteId}, Viewer: ${userPublicKey}, Publisher: ${publisherAddress}`
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
      userPublicKey,
      publisherAddress,
    };

    // RESPOSTA IMEDIATA: Redirecionar usuário para a URL de destino
    res.redirect(302, campaign.target_url);

    // PROCESSAMENTO ASSÍNCRONO: Via Soroban
    setImmediate(async () => {
      try {
        await processClickSorobanAsync(campaign, site, context);
      } catch (error) {
        console.error("Erro no processamento Soroban do clique:", error);
      }
    });
  } catch (error) {
    console.error("Erro no endpoint /api/click-soroban:", error);

    // Redirecionar mesmo em caso de erro
    const defaultUrl = process.env.DEFAULT_CLICK_REDIRECT_URL || "https://example.com";
    res.redirect(302, defaultUrl);
  }
});

/**
 * Função assíncrona para processar clique via Soroban
 */
async function processClickSorobanAsync(campaign, site, context) {
  try {
    const clickId = uuidv4();

    // 1. Registrar clique no banco de dados local
    const clickData = {
      id: clickId,
      campaignId: campaign.id,
      siteId: site.id,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      paymentAmount: campaign.cost_per_click,
      userPublicKey: context.userPublicKey,
      publisherAddress: context.publisherAddress,
      system: "soroban",
    };

    database.recordClick(clickData);
    console.log(`💾 Clique Soroban registrado no banco: ${clickId}`);

    // 2. Processar via contratos Soroban
    console.log(`🔗 Processando clique via Soroban - Viewer: ${context.userPublicKey}, Publisher: ${context.publisherAddress}`);
    
    const attestation = sorobanContractsService.createAttestation({
      campaignId: campaign.id,
      publisherAddress: context.publisherAddress,
      viewerAddress: context.userPublicKey,
      eventKind: "click",
    });

    const eventResult = await sorobanContractsService.submitEvent(attestation);

    if (eventResult.success) {
      const { payments } = eventResult;
      
      // 3. Atualizar banco com resultados do Soroban
      database.updateClickPaymentStatus(
        clickId,
        attestation.event_id, // Usar event_id como referência da transação
        "completed"
      );

      // Atualizar gastos da campanha (converter de token units para valor)
      const totalCost = sorobanContractsService.fromTokenUnits(
        payments.publisher + payments.viewer + payments.fee
      );
      database.updateCampaignSpent(campaign.id, totalCost);

      console.log(
        `💰 Clique Soroban processado com sucesso - Event: ${attestation.event_id}, ` +
        `Publisher: ${sorobanContractsService.fromTokenUnits(payments.publisher)} ADVT, ` +
        `Viewer: ${sorobanContractsService.fromTokenUnits(payments.viewer)} ADVT, ` +
        `Fee: ${sorobanContractsService.fromTokenUnits(payments.fee)} ADVT`
      );

      console.log(`✅ Total gasto na campanha atualizado: ${totalCost} ADVT`);
    } else {
      console.error(`❌ Falha ao processar clique Soroban: ${eventResult.error}`);
      
      // Marcar como falhado no banco
      database.updateClickPaymentStatus(clickId, null, "failed");
    }
  } catch (error) {
    console.error("Erro no processamento assíncrono do clique Soroban:", error);
  }
}

module.exports = router;
