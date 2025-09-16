const StellarSdk = require("@stellar/stellar-sdk");

class StellarService {
  constructor() {
    this.server = null;
    this.platformKeypair = null;
    this.initialized = false;
  }

  async initialize() {
    try {
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

      // Configurar keypair da plataforma
      if (process.env.PLATFORM_SECRET_KEY) {
        console.log(process.env.PLATFORM_SECRET_KEY)
        this.platformKeypair = StellarSdk.Keypair.fromSecret(
          process.env.PLATFORM_SECRET_KEY
        );
        console.log(
          `✅ Stellar conectado - Conta da plataforma: ${this.platformKeypair.publicKey()}`
        );
      } else {
        console.warn(
          "⚠️  PLATFORM_SECRET_KEY não configurada - funcionalidade de pagamentos desabilitada"
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error("❌ Erro ao inicializar Stellar SDK:", error);
      throw error;
    }
  }

  /**
   * Consulta o saldo XLM de uma conta Stellar
   */
  async getAccountBalance(publicKey) {
    try {
      if (!this.initialized || !this.server) {
        throw new Error("Stellar service não inicializado");
      }

      console.log(`🔍 Consultando saldo da conta: ${publicKey}`);

      const account = await this.server.loadAccount(publicKey);

      // Encontrar o saldo em XLM (native)
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === "native"
      );

      if (xlmBalance) {
        const balance = parseFloat(xlmBalance.balance);
        console.log(`💰 Saldo encontrado: ${balance} XLM`);
        return balance;
      }

      return 0;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`ℹ️  Conta ${publicKey} não encontrada na rede Stellar`);
        return null;
      }

      console.error(`❌ Erro ao consultar saldo de ${publicKey}:`, error);
      throw error;
    }
  }

  /**
   * Processa pagamento para clique de anúncio
   * Divide o valor entre editor (70%) e plataforma (30%) por padrão
   */
  async processClickPayment(campaignData, siteData, clickAmount, destinationWallet) {
    console.log( this.initialized, this.platformKeypair);
    if (!this.initialized || !this.platformKeypair) {
      throw new Error("Serviço Stellar não inicializado ou sem chave secreta");
    }

    try {
      // Calcular divisão do pagamento
      const siteRevenue = clickAmount * (siteData.revenue_share || 0.7);
      const platformRevenue = clickAmount - siteRevenue;

      console.log(
        `💰 Processando pagamento de ${clickAmount} XLM (${siteRevenue} para editor, ${platformRevenue} para plataforma)`
      );

      // Buscar conta da plataforma
      const platformAccount = await this.server.loadAccount(
        this.platformKeypair.publicKey()
      );

      // Criar transação com múltiplos pagamentos
      const transactionBuilder = new StellarSdk.TransactionBuilder(
        platformAccount,
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase:
            process.env.STELLAR_NETWORK === "mainnet"
              ? StellarSdk.Networks.PUBLIC
              : StellarSdk.Networks.TESTNET,
        }
      );

      console.log(siteData)
      // Pagamento para o editor (site)
      if (siteRevenue > 0) {
        transactionBuilder.addOperation(
          StellarSdk.Operation.payment({
            destination: siteData.stellar_public_key,
            asset: StellarSdk.Asset.native(),
            amount: siteRevenue.toFixed(7),
          })
        );
      }

      // Pagamento para a plataforma (não precisa, já sai da conta da plataforma)
      // if (platformRevenue > 0) {
      //   transactionBuilder.addOperation(
      //     StellarSdk.Operation.payment({
      //       destination: this.platformKeypair.publicKey(),
      //       asset: StellarSdk.Asset.native(),
      //       amount: platformRevenue.toFixed(7),
      //     })
      //   );
      // }

      // Adicionar memo com informações do clique
      transactionBuilder.addMemo(StellarSdk.Memo.text(`Ad click`));

      // Configurar timeout
      transactionBuilder.setTimeout(30);

      const transaction = transactionBuilder.build();

      // Em um ambiente real, você precisaria da assinatura do anunciante
      // Por enquanto, vamos simular que a plataforma tem autorização
      // transaction.sign(advertiserKeypair);

      // Assinar como plataforma (para teste)
      transaction.sign(this.platformKeypair);

      // Submeter transação
      const result = await this.server.submitTransaction(transaction);

      console.log(`✅ Pagamento processado com sucesso - TX: ${result.hash}`);

      return {
        success: true,
        transactionHash: result.hash,
        sitePayment: siteRevenue,
        platformPayment: platformRevenue,
        ledger: result.ledger,
      };
    } catch (error) {
      console.error("❌ Erro ao processar pagamento:", error);

      return {
        success: false,
        error: error.message,
        sitePayment: 0,
        platformPayment: 0,
      };
    }
  }

  /**
   * Processa pagamento de recompensa para usuário
   * Usado para pagamentos de impressões e bônus de cliques
   */
  async processUserRewardPayment(
    userStellarKey,
    rewardAmount,
    memo = "User reward"
  ) {
    if (!this.initialized || !this.platformKeypair) {
      throw new Error("Serviço Stellar não inicializado ou sem chave secreta");
    }

    try {
      console.log(
        `🎁 Processando recompensa de usuário: ${rewardAmount} XLM para ${userStellarKey}`
      );

      // Buscar conta da plataforma
      const platformAccount = await this.server.loadAccount(
        this.platformKeypair.publicKey()
      );

      // Criar transação de pagamento
      const transactionBuilder = new StellarSdk.TransactionBuilder(
        platformAccount,
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase:
            process.env.STELLAR_NETWORK === "mainnet"
              ? StellarSdk.Networks.PUBLIC
              : StellarSdk.Networks.TESTNET,
        }
      );

      // Pagamento para o usuário
      transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: userStellarKey,
          asset: StellarSdk.Asset.native(),
          amount: rewardAmount.toFixed(7),
        })
      );

      // Adicionar memo
      transactionBuilder.addMemo(StellarSdk.Memo.text(memo));

      // Configurar timeout
      transactionBuilder.setTimeout(30);

      const transaction = transactionBuilder.build();

      // Assinar como plataforma
      transaction.sign(this.platformKeypair);

      // Submeter transação
      const result = await this.server.submitTransaction(transaction);

      console.log(`✅ Recompensa processada com sucesso - TX: ${result.hash}`);

      return {
        success: true,
        transactionHash: result.hash,
        userPayment: rewardAmount,
        ledger: result.ledger,
      };
    } catch (error) {
      console.error("❌ Erro ao processar recompensa:", error);

      return {
        success: false,
        error: error.message,
        userPayment: 0,
      };
    }
  }

  /**
   * Envia pagamento direto para uma conta Stellar (usado para recompensas)
   */
  async sendPayment(destinationKey, amount, memo = "") {
    try {
      if (!this.initialized || !this.platformKeypair) {
        throw new Error(
          "Serviço Stellar não inicializado ou sem chave secreta"
        );
      }

      console.log(
        `💸 Enviando pagamento: ${amount} XLM para ${destinationKey}`
      );

      // Verificar se a conta de destino existe
      try {
        await this.server.loadAccount(destinationKey);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`🆕 Conta ${destinationKey} não existe, criando...`);

          // Criar conta com saldo mínimo
          const createAccountResult = await this.createAccount(destinationKey);
          if (!createAccountResult.success) {
            return { success: false, error: "Falha ao criar conta" };
          }
        } else {
          throw error;
        }
      }

      // Buscar conta da plataforma
      const platformAccount = await this.server.loadAccount(
        this.platformKeypair.publicKey()
      );

      // Construir transação
      const transaction = new StellarSdk.TransactionBuilder(platformAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase:
          process.env.STELLAR_NETWORK === "mainnet"
            ? StellarSdk.Networks.PUBLIC
            : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationKey,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        )
        .addMemo(StellarSdk.Memo.text(memo.substring(0, 28))) // Limit memo to 28 chars
        .setTimeout(30)
        .build();

      // Assinar transação
      transaction.sign(this.platformKeypair);

      // Submeter transação
      const result = await this.server.submitTransaction(transaction);

      console.log(`✅ Pagamento enviado com sucesso! TX: ${result.hash}`);

      return {
        success: true,
        transactionId: result.hash,
        amount: amount,
      };
    } catch (error) {
      console.error(`❌ Erro ao enviar pagamento:`, error);

      return {
        success: false,
        error: error.message || "Erro desconhecido no pagamento",
      };
    }
  }

  /**
   * Cria uma nova conta Stellar com o saldo mínimo necessário
   */
  async createAccount(newAccountKey) {
    try {
      console.log(`🆕 Criando nova conta Stellar: ${newAccountKey}`);

      const platformAccount = await this.server.loadAccount(
        this.platformKeypair.publicKey()
      );

      const transaction = new StellarSdk.TransactionBuilder(platformAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase:
          process.env.STELLAR_NETWORK === "mainnet"
            ? StellarSdk.Networks.PUBLIC
            : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination: newAccountKey,
            startingBalance: "1", // 1 XLM mínimo para criar conta
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(this.platformKeypair);
      const result = await this.server.submitTransaction(transaction);

      console.log(`✅ Conta criada com sucesso! TX: ${result.hash}`);

      return {
        success: true,
        transactionId: result.hash,
      };
    } catch (error) {
      console.error(`❌ Erro ao criar conta:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verifica se uma conta Stellar existe e tem fundos suficientes
   */
  async validateStellarAccount(publicKey, requiredAmount = 0) {
    try {
      const account = await this.server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === "native"
      );

      return {
        exists: true,
        balance: parseFloat(xlmBalance ? xlmBalance.balance : 0),
        hasSufficientFunds:
          parseFloat(xlmBalance ? xlmBalance.balance : 0) >= requiredAmount,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          exists: false,
          balance: 0,
          hasSufficientFunds: false,
        };
      }
      throw error;
    }
  }

  /**
   * Busca histórico de transações de uma conta
   */
  async getAccountTransactions(publicKey, limit = 10) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .order("desc")
        .limit(limit)
        .call();

      return transactions.records.map((tx) => ({
        hash: tx.hash,
        createdAt: tx.created_at,
        successful: tx.successful,
        operationCount: tx.operation_count,
        memo: tx.memo,
      }));
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      return [];
    }
  }

  /**
   * Consulta saldo de uma conta Stellar
   * @param {string} publicKey - Chave pública da conta
   * @returns {Promise<number|null>} Saldo em XLM ou null se conta não existir
   */
  async getAccountBalance(publicKey) {
    try {
      console.log(`🔍 Consultando saldo da conta: ${publicKey}`);

      const account = await this.server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === "native"
      );

      if (xlmBalance) {
        const balance = parseFloat(xlmBalance.balance);
        console.log(`💰 Saldo encontrado: ${balance} XLM`);
        return balance;
      }

      console.log(`ℹ️  Conta não possui saldo XLM`);
      return 0;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`ℹ️  Conta não encontrada na rede Stellar: ${publicKey}`);
        return null;
      }

      console.error(`❌ Erro ao consultar saldo:`, error);
      throw error;
    }
  }

  /**
   * Envia pagamento para uma conta específica
   * @param {string} destinationPublicKey - Chave pública de destino
   * @param {number} amount - Valor em XLM
   * @param {string} memo - Memo da transação
   * @returns {Promise<{success: boolean, transactionId?: string, error?: string}>}
   */
  async sendPayment(destinationPublicKey, amount, memo = "") {
    try {
      console.log(
        `💸 Enviando pagamento: ${amount} XLM para ${destinationPublicKey}`
      );

      // Carregar conta da plataforma
      const platformAccount = await this.server.loadAccount(
        this.platformKeypair.publicKey()
      );

      // Criar transação
      const transactionBuilder = new StellarSdk.TransactionBuilder(
        platformAccount,
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase:
            process.env.STELLAR_NETWORK === "mainnet"
              ? StellarSdk.Networks.PUBLIC
              : StellarSdk.Networks.TESTNET,
        }
      );

      // Adicionar operação de pagamento
      transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: amount.toFixed(7),
        })
      );

      // Adicionar memo se fornecido
      if (memo) {
        transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
      }

      // Configurar timeout
      transactionBuilder.setTimeout(30);

      const transaction = transactionBuilder.build();

      // Assinar transação
      transaction.sign(this.platformKeypair);

      // Submeter transação
      const result = await this.server.submitTransaction(transaction);

      console.log(`✅ Pagamento enviado com sucesso - TX: ${result.hash}`);

      return {
        success: true,
        transactionId: result.hash,
      };
    } catch (error) {
      console.error(`❌ Erro ao enviar pagamento:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Gera um novo keypair Stellar (para testes)
   */
  generateKeypair() {
    const keypair = StellarSdk.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Formata valor XLM para exibição
   */
  formatXLM(amount) {
    return `${parseFloat(amount).toFixed(7)} XLM`;
  }
}

module.exports = new StellarService();
