const database = require("../models/database");
const StellarSdk = require("@stellar/stellar-sdk");

class AdMatchingService {
  constructor() {
    this.algorithms = {
      random: this.randomMatching.bind(this),
      weighted: this.weightedMatching.bind(this),
      tagged: this.taggedMatching.bind(this),
    };

    // Configurar rede Stellar
    if (process.env.STELLAR_NETWORK === "mainnet") {
      StellarSdk.Networks.PUBLIC;
      this.server = new StellarSdk.Horizon.Server(
        "https://horizon.stellar.org"
      );
    } else {
      StellarSdk.Networks.TESTNET;
      this.server = new StellarSdk.Horizon.Server(
        process.env.STELLAR_HORIZON_URL ||
          "https://horizon-testnet.stellar.org"
      );
    }
    this.platformKeypair = StellarSdk.Keypair.fromSecret(
      process.env.PLATFORM_SECRET_KEY
    );
    this.initialized = false;
  }
  
  /**
   * Encontra         console.log(
          `💰 Usuário ${(userPublicKey || userFingerprint).substring(
            0,
            8
          )}... ganhou ${impressionReward} XLM por visualização`
        );

        // Processar pagamento assíncrono (se Stellar estiver configurado)
        setImmediate(() => {
          this.processImpressionPayment(impressionData, context);
        });
      } else if (userPublicKey && !canReceiveRewards) {
        console.log(
          `⏰ Usuário ${userPublicKey.substring(
            0,
            8
          )}... deve aguardar 6 horas para nova recompensa`
        );ara um site específico
   * @param {string} siteId - ID do site solicitante
   * @param {string} algorithm - Algoritmo de matching a usar ('random', 'weighted', 'tagged')
   * @param {object} context - Contexto adicional (IP, user-agent, etc.)
   */
  async findAdForSite(siteId, algorithm = "random", context = {}) {
    try {
      // Verificar se o site existe
      const site = database.getSite(siteId);
      if (!site) {
        console.warn(`Site não encontrado: ${siteId}`);
        return null;
      }

      // Buscar campanhas ativas
      const activeCampaigns = database.getActiveCampaigns();

      if (!activeCampaigns || activeCampaigns.length === 0) {
        console.warn("Nenhuma campanha ativa encontrada");
        return null;
      }

      console.log(
        `🎯 Procurando anúncio para site ${site.name} (${activeCampaigns.length} campanhas disponíveis)`
      );

      // Aplicar algoritmo de matching
      const matchingFunction =
        this.algorithms[algorithm] || this.algorithms.random;
      const selectedCampaign = matchingFunction(activeCampaigns, site, context);

      if (!selectedCampaign) {
        console.warn("Nenhum anúncio selecionado pelo algoritmo de matching");
        return null;
      }

      // Preparar resposta com URLs completas
      const adResponse = this.prepareAdResponse(
        selectedCampaign,
        site,
        context
      );

      console.log(
        `✅ Anúncio selecionado: ${selectedCampaign.advertiser_name} (${selectedCampaign.id})`
      );

      return adResponse;
    } catch (error) {
      console.error("Erro no matching de anúncios:", error);
      return null;
    }
  }

  /**
   * Algoritmo de matching aleatório simples
   */
  randomMatching(campaigns, site, context) {
    const randomIndex = Math.floor(Math.random() * campaigns.length);
    return campaigns[randomIndex];
  }

  /**
   * Algoritmo de matching ponderado por orçamento disponível e tags personalizadas
   */
  weightedMatching(campaigns, site, context) {
    const customTags = context.customTags || [];

    // Se tags personalizadas foram fornecidas, priorizar campanhas que fazem match
    if (customTags.length > 0) {
      console.log(
        `🏷️  Aplicando matching com tags personalizadas: [${customTags.join(
          ", "
        )}]`
      );
      return this.tagAwareWeightedMatching(
        campaigns,
        site,
        context,
        customTags
      );
    }

    // Matching ponderado tradicional baseado apenas no orçamento
    const weightedCampaigns = [];

    campaigns.forEach((campaign) => {
      const remainingBudget = campaign.budget_xlm - campaign.spent_xlm;
      const weight = Math.max(1, Math.floor(remainingBudget * 10)); // Peso baseado no orçamento

      for (let i = 0; i < weight; i++) {
        weightedCampaigns.push(campaign);
      }
    });

    const randomIndex = Math.floor(Math.random() * weightedCampaigns.length);
    return weightedCampaigns[randomIndex];
  }

  /**
   * Algoritmo de matching ponderado que considera tags personalizadas
   */
  tagAwareWeightedMatching(campaigns, site, context, customTags) {
    const weightedCampaigns = [];

    campaigns.forEach((campaign) => {
      const remainingBudget = campaign.budget_xlm - campaign.spent_xlm;
      let baseWeight = Math.max(1, Math.floor(remainingBudget * 10));

      // Calcular score de match das tags
      let tagMatchScore = this.calculateTagMatchScore(campaign, customTags);

      // Se houve match de tags, aumentar significativamente o peso
      if (tagMatchScore > 0) {
        baseWeight = baseWeight * (2 + tagMatchScore); // Multiplicador baseado no score
        console.log(
          `🎯 Campanha "${campaign.advertiser_name}" teve match de tags (score: ${tagMatchScore}), peso: ${baseWeight}`
        );
      }

      // Adicionar a campanha com o peso calculado
      for (let i = 0; i < Math.floor(baseWeight); i++) {
        weightedCampaigns.push(campaign);
      }
    });

    if (weightedCampaigns.length === 0) {
      console.warn("Nenhuma campanha com peso válido encontrada");
      return campaigns[Math.floor(Math.random() * campaigns.length)];
    }

    const randomIndex = Math.floor(Math.random() * weightedCampaigns.length);
    return weightedCampaigns[randomIndex];
  }

  /**
   * Calcula score de match entre tags da campanha e tags personalizadas
   */
  calculateTagMatchScore(campaign, customTags) {
    if (!campaign.tags || customTags.length === 0) {
      return 0;
    }

    let campaignTags = [];
    try {
      campaignTags = JSON.parse(campaign.tags);
    } catch (error) {
      console.warn(`Erro ao parsear tags da campanha ${campaign.id}:`, error);
      return 0;
    }

    // Normalizar tags para comparação (lowercase, trim)
    const normalizedCampaignTags = campaignTags.map((tag) =>
      tag.toLowerCase().trim()
    );
    const normalizedCustomTags = customTags.map((tag) =>
      tag.toLowerCase().trim()
    );

    // Contar matches exatos
    let exactMatches = 0;
    let partialMatches = 0;

    for (const customTag of normalizedCustomTags) {
      if (normalizedCampaignTags.includes(customTag)) {
        exactMatches++;
      } else {
        // Verificar matches parciais (uma tag contém a outra)
        for (const campaignTag of normalizedCampaignTags) {
          if (
            campaignTag.includes(customTag) ||
            customTag.includes(campaignTag)
          ) {
            partialMatches++;
            break; // Evitar contar o mesmo match múltiplas vezes
          }
        }
      }
    }

    // Score: matches exatos valem mais que parciais
    const score = exactMatches * 2 + partialMatches * 1;

    if (score > 0) {
      console.log(`📊 Tags da campanha: [${campaignTags.join(", ")}]`);
      console.log(`📊 Tags customizadas: [${customTags.join(", ")}]`);
      console.log(
        `📊 Score: ${exactMatches} exact + ${partialMatches} partial = ${score}`
      );
    }

    return score;
  }

  /**
   * Algoritmo de matching baseado em tags (mais sofisticado)
   */
  taggedMatching(campaigns, site, context) {
    // Para implementação futura: matching baseado em tags do site e da campanha
    // Por enquanto, usa o algoritmo ponderado
    return this.weightedMatching(campaigns, site, context);
  }

  /**
   * Prepara a resposta do anúncio com URLs completas
   */
  prepareAdResponse(campaign, site, context) {
    const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";

    // Construir URL de click tracking
    const clickTrackingParams = new URLSearchParams({
      campaignId: campaign.id,
      siteId: site.id,
      // Adicionar timestamp para evitar cache
      t: Date.now(),
    });

    const clickUrl = `${apiBaseUrl}/api/click?${clickTrackingParams.toString()}`;

    return {
      success: true,
      ad: {
        campaignId: campaign.id,
        advertiserName: campaign.advertiser_name,
        imageUrl: campaign.image_url,
        clickUrl: clickUrl,
        costPerClick: campaign.cost_per_click,
      },
      site: {
        id: site.id,
        name: site.name,
      },
    };
  }

  /**
   * Registra uma impressão de anúncio com pagamento para usuário
   */
  async recordImpression(campaignId, siteId, context = {}) {
    try {
      const { v4: uuidv4 } = require("uuid");

      // Gerar fingerprint do usuário baseado em IP + User-Agent ou usar public key
      const userPublicKey = context.walletPublicKey || null;
      const userFingerprint =
        userPublicKey || this.generateUserFingerprint(context);

      // Verificar se usuário pode receber recompensas (limite de 6 horas)
      const canReceiveRewards = userPublicKey
        ? database.canUserReceiveRewards(userPublicKey, siteId)
        : false;

      // Definir valor da recompensa por impressão (apenas para usuários com carteira)
      const impressionReward = canReceiveRewards ? 0.001 : 0; // 0.001 XLM por impressão

      const impressionData = {
        id: uuidv4(),
        campaignId,
        siteId,
        ipAddress: context.ip || null,
        userAgent: context.userAgent || null,
        userFingerprint,
        paymentAmount: impressionReward,
      };

      database.recordImpression(impressionData);

      // Se há carteira e pode receber recompensas, registrar a recompensa
      // if (userPublicKey && canReceiveRewards && impressionReward > 0) {
        // Registrar recompensa no novo sistema
        database.recordUserReward(
          userPublicKey,
          campaignId,
          siteId,
          "impression",
          impressionReward
        );

        database.updateWalletStats(userPublicKey, impressionReward);

        console.log(
          `� Usuário ${userFingerprint.substring(
            0,
            8
          )}... ganhou ${impressionReward} XLM por visualização`
        );

        // Processar pagamento assíncrono (se Stellar estiver configurado)
        setImmediate(() => {
          this.processImpressionPayment(impressionData, context);
        });
      // } else if (!canReceiveRewards) {
      //   console.log(
      //     `⏰ Usuário ${userFingerprint.substring(
      //       0,
      //       8
      //     )}... deve aguardar 6 horas para nova recompensa`
      //   );
      // }

      console.log(
        `�📊 Impressão registrada: Campanha ${campaignId} no site ${siteId} (recompensa: ${impressionReward} XLM)`
      );

      return impressionData.id;
    } catch (error) {
      console.error("Erro ao registrar impressão:", error);
      return null;
    }
  }

  /**
   * Gera fingerprint único do usuário baseado em características disponíveis
   */
  generateUserFingerprint(context) {
    const crypto = require("crypto");

    const fingerprint = [
      context.ip || "unknown",
      context.userAgent || "unknown",
    ].join("|");

    return crypto.createHash("sha256").update(fingerprint).digest("hex");
  }

  /**
   * Processa pagamento de impressão para usuário
   */
  async processImpressionPayment(impressionData, context) {
    try {
      const stellarService = require("./stellarService");

      if (!stellarService.initialized) {
        console.log(
          "⚠️  Stellar não configurado - pagamento de impressão não processado"
        );
        database.updateImpressionPaymentStatus(
          impressionData.id,
          null,
          "skipped"
        );
        return;
      }

      // Em um ambiente real, você precisaria da chave pública Stellar do usuário
      // Por enquanto, vamos apenas simular o processo
      console.log(
        `💳 Processamento de pagamento de impressão: ${impressionData.paymentAmount} XLM`
      );

      // Marcar como processado (simulação)
      database.updateImpressionPaymentStatus(
        impressionData.id,
        "simulated_tx",
        "completed"
      );
    } catch (error) {
      console.error("Erro no pagamento de impressão:", error);
      database.updateImpressionPaymentStatus(impressionData.id, null, "failed");
    }
  }

  /**
   * Processa clique com recompensa para usuário
   */
  async processClickWithUserReward(campaignId, siteId, context = {}, destinationWallet) {
    try {
      const { v4: uuidv4 } = require("uuid");

      // Gerar fingerprint do usuário
      const userFingerprint = this.generateUserFingerprint(context);

      // Verificar se usuário pode receber recompensas
      const canReceiveRewards = database.canUserReceiveRewards(
        userFingerprint,
        siteId
      );

      // Buscar dados da campanha
      const campaign = database.getCampaign(campaignId);
      if (!campaign) {
        throw new Error("Campanha não encontrada");
      }

      // Definir recompensa para usuário por clique (10% do valor do clique)
      const userReward = canReceiveRewards ? campaign.cost_per_click * 0.1 : 0;

      console.log(
        `👆 Processando clique com recompensa - Usuário: ${userFingerprint.substring(
          0,
          8
        )}... (${userReward} XLM)`
      );

      // Se usuário pode receber recompensas
      if (canReceiveRewards && userReward > 0) {
        const platformAccount = await this.server.loadAccount(
          this.platformKeypair.publicKey()
        );

        const transaction = new StellarSdk.TransactionBuilder(
          platformAccount,
          {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase:
              process.env.STELLAR_NETWORK === "mainnet"
                ? StellarSdk.Networks.PUBLIC
                : StellarSdk.Networks.TESTNET,
          }
        ).addOperation(
          StellarSdk.Operation.payment({
            destination: destinationWallet,
            asset: StellarSdk.Asset.native(),
            amount: 0.15.toFixed(7), // 15% do valor do clique para o usuário
          })
        ).addMemo(StellarSdk.Memo.text("Ganhou grana pai".substring(0, 28))) // Limit memo to 28 chars
          .setTimeout(30)
          .build();
        
        // Assinar transação
        transaction.sign(this.platformKeypair);
  
        // Submeter transação
        const result = await this.server.submitTransaction(transaction);
        
        // console.log(database)
        // // Atualizar registro de recompensas do usuário
        // database.updateUserRewards(userFingerprint, siteId, userReward, true);

        console.log(
          `💰 Usuário ${userFingerprint.substring(
            0,
            8
          )}... ganhou ${userReward} XLM por clique!`
        );
      } else if (!canReceiveRewards) {
        console.log(
          `⏰ Usuário ${userFingerprint.substring(
            0,
            8
          )}... deve aguardar 6 horas para nova recompensa`
        );
      }

      return {
        userFingerprint,
        canReceiveRewards,
        userReward,
      };
    } catch (error) {
      console.error("Erro no processamento de clique com recompensa:", error);
      return null;
    }
  }

  /**
   * Obtém estatísticas de performance de anúncios (completas)
   */
  getPerformanceStats(timeframe = "24 hours") {
    try {
      const stats = database.getCompleteStats(timeframe);
      return stats;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      return null;
    }
  }

  /**
   * Valida se uma campanha pode ser exibida
   */
  validateCampaign(campaign) {
    if (!campaign.active) {
      return { valid: false, reason: "Campanha inativa" };
    }

    if (campaign.budget_xlm <= campaign.spent_xlm) {
      return { valid: false, reason: "Orçamento esgotado" };
    }

    if (!campaign.image_url || !campaign.target_url) {
      return { valid: false, reason: "Dados de campanha incompletos" };
    }

    return { valid: true };
  }
}

module.exports = new AdMatchingService();
