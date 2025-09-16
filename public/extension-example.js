/**
 * EXEMPLO DE EXTENSÃO STELLAR ADS
 * 
 * Este arquivo mostra como a extensão do navegador deve interagir com o SDK
 * A extensão deve injetar os dados da carteira no window e se comunicar com o SDK
 */

// Simulação da estrutura da extensão
class StellarAdsExtension {
  constructor() {
    this.version = "1.0.0";
    this.userWallet = null;
    this.isConnected = false;
  }

  /**
   * Inicializa a extensão e gera/carrega carteira do usuário
   */
  async initialize() {
    try {
      console.log("🔌 Inicializando extensão Stellar Ads...");

      // Tentar carregar carteira existente do storage da extensão
      const savedWallet = await this.loadWalletFromStorage();
      
      if (savedWallet) {
        this.userWallet = savedWallet;
        console.log("💳 Carteira existente carregada:", savedWallet.publicKey);
      } else {
        // Criar nova carteira
        this.userWallet = await this.createNewWallet();
        await this.saveWalletToStorage(this.userWallet);
        console.log("✨ Nova carteira criada:", this.userWallet.publicKey);
      }

      // Injetar dados no window para o SDK
      this.injectWalletData();
      
      this.isConnected = true;
      console.log("✅ Extensão Stellar Ads conectada!");

    } catch (error) {
      console.error("❌ Erro ao inicializar extensão:", error);
    }
  }

  /**
   * Gera nova carteira Stellar
   */
  async createNewWallet() {
    // Nota: Na extensão real, usar @stellar/stellar-sdk
    // Aqui é apenas um exemplo da estrutura
    const StellarSdk = window.StellarSdk || require('@stellar/stellar-sdk');
    
    const keypair = StellarSdk.Keypair.random();
    
    return {
      publicKey: keypair.publicKey(),
      privateKey: keypair.secret(), // NUNCA enviar isso para o backend!
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Carrega carteira do storage da extensão
   */
  async loadWalletFromStorage() {
    // Na extensão real, usar chrome.storage.sync ou chrome.storage.local
    // Aqui é apenas um exemplo
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['stellarWallet'], (result) => {
          resolve(result.stellarWallet || null);
        });
      } else {
        // Fallback para localStorage (para testes)
        const saved = localStorage.getItem('stellarAdsWallet');
        resolve(saved ? JSON.parse(saved) : null);
      }
    });
  }

  /**
   * Salva carteira no storage da extensão
   */
  async saveWalletToStorage(wallet) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ stellarWallet: wallet }, resolve);
      } else {
        // Fallback para localStorage (para testes)
        localStorage.setItem('stellarAdsWallet', JSON.stringify(wallet));
        resolve();
      }
    });
  }

  /**
   * Injeta dados da carteira no window para o SDK acessar
   */
  injectWalletData() {
    // Criar namespace da extensão no window
    window.stellarAdsExtension = {
      version: this.version,
      userWallet: {
        publicKey: this.userWallet.publicKey,
        // NUNCA expor a chave privada no window!
        createdAt: this.userWallet.createdAt
      },
      // Callbacks para o SDK
      onRewardReceived: this.onRewardReceived.bind(this),
      onWalletUpdated: this.onWalletUpdated.bind(this)
    };

    // Notificar o SDK se ele já estiver carregado
    if (window.StellarAdsSDK) {
      window.StellarAdsSDK.onExtensionReady(window.stellarAdsExtension);
    }

    console.log("📡 Dados da carteira injetados no window");
  }

  /**
   * Callback chamado pelo SDK quando usuário recebe recompensa
   */
  onRewardReceived(rewardData) {
    console.log("🎉 Recompensa recebida:", rewardData);
    
    // Atualizar UI da extensão
    this.updateExtensionBadge(`+${rewardData.amount} XLM`);
    
    // Mostrar notificação
    this.showNotification("Recompensa recebida!", `Você ganhou ${rewardData.amount} XLM`);
    
    // Salvar no histórico da extensão
    this.addToRewardHistory(rewardData);
  }

  /**
   * Callback chamado quando carteira é atualizada
   */
  onWalletUpdated(newBalance) {
    console.log("💰 Saldo atualizado:", newBalance);
    this.updateExtensionBadge(`${newBalance} XLM`);
  }

  /**
   * Atualiza badge da extensão
   */
  updateExtensionBadge(text) {
    if (typeof chrome !== 'undefined' && chrome.action) {
      chrome.action.setBadgeText({ text: text.substring(0, 4) });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    }
  }

  /**
   * Mostra notificação do sistema
   */
  showNotification(title, message) {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message
      });
    } else {
      // Fallback para notificação do navegador
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }
    }
  }

  /**
   * Adiciona recompensa ao histórico
   */
  addToRewardHistory(rewardData) {
    // Implementar storage do histórico de recompensas
    console.log("📝 Salvando no histórico:", rewardData);
  }

  /**
   * Obtém saldo atual da carteira
   */
  async getCurrentBalance() {
    // Na extensão real, consultar a rede Stellar
    // Aqui é apenas um exemplo
    try {
      const response = await fetch(`http://localhost:3000/api/user-balance?publicKey=${this.userWallet.publicKey}`);
      const data = await response.json();
      return data.success ? data.balance : 0;
    } catch (error) {
      console.error("Erro ao consultar saldo:", error);
      return 0;
    }
  }
}

// Exemplo de inicialização da extensão
// Na extensão real, isso seria executado quando a extensão é carregada
if (typeof window !== 'undefined') {
  // Simular extensão para testes
  const extension = new StellarAdsExtension();
  
  // Aguardar DOM carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      extension.initialize();
    });
  } else {
    extension.initialize();
  }
}

// Exportar para uso em environment Node.js (testes)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StellarAdsExtension;
}
