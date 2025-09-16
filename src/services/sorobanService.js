const { exec } = require("child_process");
const { promisify } = require("util");
const crypto = require("crypto");

const execAsync = promisify(exec);

class SorobanService {
  constructor() {
    this.network = process.env.SOROBAN_NETWORK || "testnet";
    this.verifierRegistryId = process.env.VERIFIER_REGISTRY_ID;
    this.adVaultId = process.env.ADVAULT_ID;
    this.tokenId = process.env.TOKEN_ID;
    this.adminSource = process.env.ADMIN_SOURCE || "admin";
    this.verifierSource = process.env.VERIFIER_SOURCE || "verifier";
    this.initialized = false;
  }

  async initialize() {
    try {
      // Verificar se os contratos estão configurados
      if (!this.verifierRegistryId || !this.adVaultId || !this.tokenId) {
        console.warn("⚠️  Contratos Soroban não configurados completamente");
        console.log("Variáveis necessárias:");
        console.log("- VERIFIER_REGISTRY_ID:", !!this.verifierRegistryId);
        console.log("- ADVAULT_ID:", !!this.adVaultId);
        console.log("- TOKEN_ID:", !!this.tokenId);
        return;
      }

      console.log("✅ Soroban Service inicializado");
      console.log(`📋 Network: ${this.network}`);
      console.log(`🏛️  Verifier Registry: ${this.verifierRegistryId}`);
      console.log(`🏦 AdVault: ${this.adVaultId}`);
      console.log(`🪙 Token: ${this.tokenId}`);

      this.initialized = true;
    } catch (error) {
      console.error("❌ Erro ao inicializar Soroban Service:", error);
      throw error;
    }
  }

  /**
   * Executa comando Stellar CLI
   */
  async executeStellarCommand(command) {
    try {
      console.log(`🚀 Executando: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes("warning")) {
        console.error("⚠️  Stderr:", stderr);
      }
      
      console.log("✅ Resultado:", stdout);
      return { success: true, result: stdout.trim(), error: null };
    } catch (error) {
      console.error("❌ Erro na execução:", error);
      return { success: false, result: null, error: error.message };
    }
  }

  /**
   * Gera IDs únicos para campanhas e eventos
   */
  generateId() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  /**
   * Gera nonce único para anti-replay
   */
  generateNonce() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  // ========== VERIFIER REGISTRY METHODS ==========

  /**
   * Inicializa o Verifier Registry
   */
  async initVerifierRegistry(owner) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.verifierRegistryId}" -- init --owner ${owner}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Adiciona um verifier autorizado
   */
  async addVerifier(verifierAddress) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.verifierRegistryId}" -- add_verifier --v ${verifierAddress}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Define status de um publisher
   */
  async setPublisherStatus(publisherAddress, allowed) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.verifierRegistryId}" -- set_publisher_status ` +
                   `--p ${publisherAddress} --allowed ${allowed}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Verifica se um endereço é verifier autorizado
   */
  async isVerifier(verifierAddress) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.verifierRegistryId}" -- is_verifier --v ${verifierAddress}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Verifica se um publisher está permitido
   */
  async isPublisherAllowed(publisherAddress) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.verifierRegistryId}" -- is_publisher_allowed --p ${publisherAddress}`;

    return await this.executeStellarCommand(command);
  }

  // ========== ADVAULT METHODS ==========

  /**
   * Inicializa o AdVault
   */
  async initAdVault(config) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const {
      admin,
      pricePerEvent = 10000000, // 1 ADVT = 10^7
      splitPublisherBps = 6000, // 60%
      splitViewerBps = 3000, // 30%
      feeBps = 1000 // 10%
    } = config;

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- init ` +
                   `--admin ${admin} ` +
                   `--token "${this.tokenId}" ` +
                   `--verifier_registry "${this.verifierRegistryId}" ` +
                   `--price_per_event ${pricePerEvent} ` +
                   `--split_publisher_bps ${splitPublisherBps} ` +
                   `--split_viewer_bps ${splitViewerBps} ` +
                   `--fee_bps ${feeBps}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Obtém configuração atual do AdVault
   */
  async getConfig() {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- get_config`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Cria uma nova campanha
   */
  async createCampaign(advertiserSource, campaignId, advertiserAddress, initialDeposit) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${advertiserSource} ` +
                   `--id "${this.adVaultId}" -- create_campaign ` +
                   `--campaign_id "${campaignId}" ` +
                   `--advertiser ${advertiserAddress} ` +
                   `--initial_deposit ${initialDeposit}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Deposita orçamento adicional numa campanha
   */
  async deposit(fromSource, campaignId, fromAddress, amount) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${fromSource} ` +
                   `--id "${this.adVaultId}" -- deposit ` +
                   `--campaign_id "${campaignId}" ` +
                   `--from ${fromAddress} ` +
                   `--amount ${amount}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Submete um evento (click/impression) e processa pagamentos
   */
  async submitEvent(eventData) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const {
      eventId,
      campaignId,
      publisherAddress,
      viewerAddress,
      eventKind,
      timestamp,
      nonce
    } = eventData;

    // Construir attestation object
    const attestation = JSON.stringify({
      event_id: eventId,
      campaign_id: campaignId,
      publisher: publisherAddress,
      viewer: viewerAddress,
      event_kind: eventKind,
      timestamp: timestamp,
      nonce: nonce
    });

    const command = `stellar contract invoke --network ${this.network} --source ${this.verifierSource} ` +
                   `--id "${this.adVaultId}" -- submit_event ` +
                   `--att '${attestation}' ` +
                   `--verifier ${this.verifierSource}`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Pausa o protocolo
   */
  async pauseProtocol() {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- pause_protocol`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Despausa o protocolo
   */
  async unpauseProtocol() {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- unpause_protocol`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Fecha uma campanha
   */
  async closeCampaign(campaignId, reason) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- close_campaign ` +
                   `--campaign_id "${campaignId}" ` +
                   `--reason "${reason}"`;

    return await this.executeStellarCommand(command);
  }

  /**
   * Reembolsa orçamento não gasto
   */
  async refundUnspent(campaignId, toAddress) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.adVaultId}" -- refund_unspent ` +
                   `--campaign_id "${campaignId}" ` +
                   `--to ${toAddress}`;

    return await this.executeStellarCommand(command);
  }

  // ========== TOKEN METHODS ==========

  /**
   * Minta tokens para um endereço
   */
  async mintTokens(toAddress, amount) {
    if (!this.initialized) {
      throw new Error("Soroban Service não inicializado");
    }

    const command = `stellar contract invoke --network ${this.network} --source ${this.adminSource} ` +
                   `--id "${this.tokenId}" -- mint ` +
                   `--to ${toAddress} ` +
                   `--amount ${amount}`;

    return await this.executeStellarCommand(command);
  }

  // ========== UTILITY METHODS ==========

  /**
   * Processa evento de clique via Soroban
   */
  async processClickEvent(campaignData, siteData, viewerAddress, clickAmount) {
    try {
      console.log(`🎯 Processando clique via Soroban - Campanha: ${campaignData.id}`);

      const eventData = {
        eventId: this.generateId(),
        campaignId: campaignData.soroban_campaign_id || campaignData.id,
        publisherAddress: siteData.stellar_public_key,
        viewerAddress: viewerAddress,
        eventKind: "click",
        timestamp: Math.floor(Date.now() / 1000),
        nonce: this.generateNonce()
      };

      const result = await this.submitEvent(eventData);

      if (result.success) {
        console.log(`✅ Clique processado via Soroban - Event ID: ${eventData.eventId}`);
        
        // Tentar extrair valores pagos do resultado
        let paidPublisher = 0;
        let paidViewer = 0;
        let paidFee = 0;

        try {
          // O resultado pode conter os valores pagos
          const resultData = JSON.parse(result.result);
          if (Array.isArray(resultData) && resultData.length >= 3) {
            paidPublisher = resultData[0];
            paidViewer = resultData[1];
            paidFee = resultData[2];
          }
        } catch (parseError) {
          console.warn("⚠️  Não foi possível parsear valores pagos:", parseError);
        }

        return {
          success: true,
          eventId: eventData.eventId,
          paidPublisher,
          paidViewer,
          paidFee,
          transactionResult: result.result
        };
      } else {
        console.error(`❌ Erro ao processar clique via Soroban:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error("❌ Erro no processamento do clique:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa evento de impressão via Soroban
   */
  async processImpressionEvent(campaignData, siteData, viewerAddress) {
    try {
      console.log(`👁️  Processando impressão via Soroban - Campanha: ${campaignData.id}`);

      const eventData = {
        eventId: this.generateId(),
        campaignId: campaignData.soroban_campaign_id || campaignData.id,
        publisherAddress: siteData.stellar_public_key,
        viewerAddress: viewerAddress,
        eventKind: "impression",
        timestamp: Math.floor(Date.now() / 1000),
        nonce: this.generateNonce()
      };

      const result = await this.submitEvent(eventData);

      if (result.success) {
        console.log(`✅ Impressão processada via Soroban - Event ID: ${eventData.eventId}`);
        
        // Tentar extrair valores pagos do resultado
        let paidPublisher = 0;
        let paidViewer = 0;
        let paidFee = 0;

        try {
          const resultData = JSON.parse(result.result);
          if (Array.isArray(resultData) && resultData.length >= 3) {
            paidPublisher = resultData[0];
            paidViewer = resultData[1];
            paidFee = resultData[2];
          }
        } catch (parseError) {
          console.warn("⚠️  Não foi possível parsear valores pagos:", parseError);
        }

        return {
          success: true,
          eventId: eventData.eventId,
          paidPublisher,
          paidViewer,
          paidFee,
          transactionResult: result.result
        };
      } else {
        console.error(`❌ Erro ao processar impressão via Soroban:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error("❌ Erro no processamento da impressão:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Converte valor XLM para menor unidade do token (assumindo 7 casas decimais)
   */
  xlmToTokenUnits(xlmAmount) {
    return Math.floor(xlmAmount * 10000000); // 10^7
  }

  /**
   * Converte menor unidade do token para XLM
   */
  tokenUnitsToXlm(tokenUnits) {
    return tokenUnits / 10000000; // 10^7
  }
}

module.exports = new SorobanService();
