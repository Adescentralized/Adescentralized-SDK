const sorobanService = require("./sorobanService");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

class SorobanContractsService {
  constructor() {
    this.contracts = {
      verifierRegistry: process.env.VERIFIER_REGISTRY_CONTRACT_ID,
      adVault: process.env.ADVAULT_CONTRACT_ID,
      token: process.env.TOKEN_CONTRACT_ID,
    };
    
    // URLs da API dos contratos na AWS
    this.contractsApiUrl = process.env.SOROBAN_CONTRACTS_API_URL || 'http://ec2-52-90-24-12.compute-1.amazonaws.com/contracts';
    this.applicationApiUrl = process.env.APPLICATION_API_URL || 'http://ec2-52-90-24-12.compute-1.amazonaws.com';
    
    this.adminKeypair = null;
    this.verifierKeypair = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Verificar conectividade com a API dos contratos
      console.log(`${this.contractsApiUrl}/contracts/health`)
      const healthResponse = await fetch(`${this.contractsApiUrl}/contracts/health`);
      if (!healthResponse.ok) {
        throw new Error(`API dos contratos não disponível: ${healthResponse.status}`);
      }
      
      console.log("✅ Conectado à API dos contratos na AWS");
      
      // Inicializar keypairs se fornecidos (para fallback local)
      if (process.env.ADMIN_SECRET_KEY) {
        this.adminKeypair = sorobanService.server.Keypair.fromSecret(
          process.env.ADMIN_SECRET_KEY
        );
      }
      
      if (process.env.VERIFIER_SECRET_KEY) {
        this.verifierKeypair = sorobanService.server.Keypair.fromSecret(
          process.env.VERIFIER_SECRET_KEY
        );
      }

      this.initialized = true;
      console.log("✅ SorobanContractsService inicializado");
    } catch (error) {
      console.error("❌ Erro ao inicializar SorobanContractsService:", error);
      throw error;
    }
  }

  // ============= UTILITY METHODS FOR API CALLS =============

  /**
   * Faz uma chamada HTTP para a API dos contratos
   */
  async callContractsApi(endpoint, method = 'GET', data = null) {
    try {
      const url = `${this.contractsApiUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true, data: result };
    } catch (error) {
      console.error(`Erro na chamada da API: ${endpoint}`, error);
      return { success: false, error: error.message };
    }
  }

  // ============= VERIFIER REGISTRY METHODS =============

  /**
   * Inicializa o registry e define o owner
   */
  async initVerifierRegistry(ownerAddress) {
    try {
      const result = await this.callContractsApi('/init', 'POST', {
        ownerAddress
      });

      if (result.success) {
        console.log("✅ Verifier Registry inicializado via AWS");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao inicializar Verifier Registry:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Autoriza um endereço a atuar como verifier
   */
  async addVerifier(verifierAddress) {
    try {
      const result = await this.callContractsApi('/add_verifier', 'POST', {
        verifierAddress
      });

      if (result.success) {
        console.log(`✅ Verifier ${verifierAddress} adicionado via AWS`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao adicionar verifier:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Liga/Desliga um publisher na allow-list
   */
  async setPublisherStatus(publisherAddress, allowed) {
    try {
      const result = await this.callContractsApi('/set_publisher_status', 'POST', {
        publisherAddress,
        allowed
      });

      if (result.success) {
        console.log(`✅ Publisher ${publisherAddress} ${allowed ? 'habilitado' : 'desabilitado'} via AWS`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao definir status do publisher:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Checa se um endereço é verifier autorizado
   */
  async isVerifier(verifierAddress) {
    try {
      const result = await this.callContractsApi(`/verifier-registry/is-verifier?verifierAddress=${verifierAddress}`);

      return result.success ? 
        { success: true, isVerifier: result.data.isVerifier } : 
        result;
    } catch (error) {
      console.error("❌ Erro ao verificar verifier:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Checa se um publisher está permitido
   */
  async isPublisherAllowed(publisherAddress) {
    try {
      const result = await this.callContractsApi(`/verifier-registry/is-publisher-allowed?publisherAddress=${publisherAddress}`);

      return result.success ? 
        { success: true, isAllowed: result.data.isAllowed } : 
        result;
    } catch (error) {
      console.error("❌ Erro ao verificar publisher:", error);
      return { success: false, error: error.message };
    }
  }

  // ============= ADVAULT METHODS =============

  /**
   * Configura o protocolo AdVault (token, registry, preço e splits)
   */
  async initAdVault(config) {
    try {
      const result = await this.callContractsApi('/advault/init', 'POST', config);

      if (result.success) {
        console.log("✅ AdVault inicializado via AWS");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao inicializar AdVault:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retorna a configuração atual do AdVault
   */
  async getAdVaultConfig() {
    try {
      const result = await this.callContractsApi('/get_config');

      return result.success ? 
        { success: true, config: result.data } : 
        result;
    } catch (error) {
      console.error("❌ Erro ao obter configuração do AdVault:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cria campanha e já deposita orçamento inicial
   */
  async createCampaign(campaignId, advertiserAddress, initialDeposit, advertiserKeypair) {
    try {
      const result = await this.callContractsApi('/create_campaign', 'POST', {
        campaignId,
        advertiserAddress,
        initialDeposit,
        // Nota: Em produção, o advertiserSecretKey seria passado de forma segura
        advertiserSecretKey: advertiserKeypair ? advertiserKeypair.secret() : null
      });

      if (result.success) {
        console.log(`✅ Campanha ${campaignId} criada via AWS com depósito inicial de ${initialDeposit}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao criar campanha:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deposita mais orçamento numa campanha
   */
  async depositToCampaign(campaignId, fromAddress, amount, fromKeypair) {
    try {
      const result = await this.callContractsApi('/deposit', 'POST', {
        campaignId,
        fromAddress,
        amount,
        fromSecretKey: fromKeypair ? fromKeypair.secret() : null
      });

      if (result.success) {
        console.log(`✅ Depósito de ${amount} realizado via AWS na campanha ${campaignId}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao depositar na campanha:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Registra um evento e faz os pagamentos automáticos
   */
  async submitEvent(attestation) {
    try {
      const result = await this.callContractsApi('/submit_event', 'POST', {
        campaignId: attestation.campaign_id,
        publisherAddress: attestation.publisher,
        viewerAddress: attestation.viewer,
        eventKind: attestation.event_kind
      });

      if (result.success && result.data.payments) {
        const { payments } = result.data;
        console.log(`✅ Evento submetido via AWS - Publisher: ${payments.publisher}, Viewer: ${payments.viewer}, Fee: ${payments.fee}`);
        
        return {
          success: true,
          payments: {
            publisher: payments.publisher,
            viewer: payments.viewer,
            fee: payments.fee,
          },
        };
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao submeter evento:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pausa o protocolo
   */
  async pauseProtocol() {
    try {
      const result = await this.callContractsApi('/pause_protocol', 'POST');

      if (result.success) {
        console.log("✅ Protocolo pausado via AWS");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao pausar protocolo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Despausa o protocolo
   */
  async unpauseProtocol() {
    try {
      const result = await this.callContractsApi('/unpause_protocol', 'POST');

      if (result.success) {
        console.log("✅ Protocolo despausado via AWS");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao despausar protocolo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fecha uma campanha
   */
  async closeCampaign(campaignId, reason) {
    try {
      const result = await this.callContractsApi('/close_campaign', 'POST', {
        campaignId,
        reason
      });

      if (result.success) {
        console.log(`✅ Campanha ${campaignId} fechada via AWS: ${reason}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao fechar campanha:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reembolsa orçamento não gasto de uma campanha
   */
  async refundUnspent(campaignId, toAddress) {
    try {
      const result = await this.callContractsApi('/refund_unspent', 'POST', {
        campaignId,
        toAddress
      });

      if (result.success) {
        console.log(`✅ Reembolso da campanha ${campaignId} via AWS para ${toAddress}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao reembolsar campanha:", error);
      return { success: false, error: error.message };
    }
  }

  // ============= TOKEN METHODS =============

  /**
   * Mint tokens para um endereço
   */
  async mintTokens(toAddress, amount) {
    try {
      const result = await this.callContractsApi('/mint', 'POST', {
        toAddress,
        amount
      });

      if (result.success) {
        console.log(`✅ Tokens mintados via AWS: ${amount} para ${toAddress}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erro ao mintar tokens:", error);
      return { success: false, error: error.message };
    }
  }

  // ============= UTILITY METHODS =============

  /**
   * Gera um ID de campanha único
   */
  generateCampaignId() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  /**
   * Gera um event ID único
   */
  generateEventId() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  /**
   * Gera um nonce único para anti-replay
   */
  generateNonce() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  /**
   * Cria uma attestation para um evento
   */
  createAttestation(eventData) {
    const {
      campaignId,
      publisherAddress,
      viewerAddress,
      eventKind,
      timestamp,
    } = eventData;

    return {
      event_id: this.generateEventId(),
      campaign_id: campaignId,
      publisher: publisherAddress,
      viewer: viewerAddress,
      event_kind: eventKind,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      nonce: this.generateNonce(),
    };
  }

  /**
   * Converte valores para a menor unidade do token (assumindo 7 decimais)
   */
  toTokenUnits(amount) {
    return Math.floor(amount * 10000000); // 10^7 para 7 decimais
  }

  /**
   * Converte da menor unidade do token para valor legível
   */
  fromTokenUnits(amount) {
    return amount / 10000000; // 10^7 para 7 decimais
  }
}

module.exports = new SorobanContractsService();
