/**
 * Stellar Ads SDK
 * SDK JavaScript leve para integração de anúncios em sites de editores
 *
 * Uso:
 * 1. Incluir <div id="stellar-ad-container" data-site-id="SEU_SITE_ID" data-tags="tag1,tag2,tag3"></div> no HTML
 * 2. Incluir <script src="https://api.sua-plataforma.com/sdk.js"></script>
 *
 * Ou configurar via JavaScript:
 * window.StellarAdsConfig = {
 *   siteId: 'SEU_SITE_ID',
 *   tags: ['tecnologia', 'programacao', 'startups'],
 *   containerId: 'meu-container-personalizado' // opcional
 * };
 */

(function () {
  "use strict";

  // Configuração padrão
  const CONFIG = {
    CONTAINER_ID: "stellar-ad-container",
    API_BASE_URL: detectApiBaseUrl(),
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 2,
    DEBUG: true, // Ativando debug temporariamente
  };

  let adImpressao = ""

  /**
   * Detecta a URL base da API baseada no contexto
   */
  function detectApiBaseUrl() {
    return "http://localhost:3000";
  }

  // Namespace global para evitar conflitos
  window.StellarAdsSDK = window.StellarAdsSDK || {};

  /**
   * Nova classe para interface com a extensão Stellar usando postMessage
   */
  class StellarWalletInterface {
    constructor() {
      this.isConnected = false;
      this.currentAccount = null;
      this.debug = CONFIG.DEBUG;

      if (this.debug) {
        console.log("[StellarSDK] StellarWalletInterface criada");
      }
    }

    async connect() {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout - extension not responding"));
        }, 10000);

        window.postMessage(
          {
            type: "STELLAR_WALLET_REQUEST",
            method: "connect",
            id: Date.now(),
          },
          "*"
        );

        const handler = (event) => {
          if (
            event.data.type === "STELLAR_WALLET_RESPONSE" &&
            event.data.method === "connect"
          ) {
            clearTimeout(timeout);
            window.removeEventListener("message", handler);

            if (event.data.success) {
              this.isConnected = true;
              this.currentAccount = event.data.data.publicKey;

              if (this.debug) {
                console.log(
                  "[StellarSDK] Carteira conectada:",
                  event.data.data
                );
              }

              resolve(event.data.data);
            } else {
              reject(new Error(event.data.error));
            }
          }
        };

        window.addEventListener("message", handler);
      });
    }

    async getBalance() {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Balance request timeout"));
        }, 5000); // Aumentar timeout para 5 segundos

        if (this.debug) {
          console.log("[StellarSDK] Enviando requisição getBalance...");
        }

        window.postMessage(
          {
            type: "STELLAR_WALLET_REQUEST",
            method: "getBalance",
            id: Date.now(),
          },
          "*"
        );

        const handler = (event) => {
          if (
            event.data.type === "STELLAR_WALLET_RESPONSE" &&
            event.data.method === "getBalance"
          ) {
            if (this.debug) {
              console.log(
                "[StellarSDK] Resposta getBalance recebida:",
                event.data
              );
            }

            clearTimeout(timeout);
            window.removeEventListener("message", handler);

            if (event.data.success) {
              const balanceData = event.data.data?.balance || event.data.data;
              resolve(balanceData);
            } else {
              reject(new Error(event.data.error));
            }
          }
        };

        window.addEventListener("message", handler);
      });
    }

    async sendPayment(destination, amount, memo) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Payment request timeout"));
        }, 30010);

        window.postMessage(
          {
            type: "STELLAR_WALLET_REQUEST",
            method: "sendPayment",
            data: { destination, amount, memo },
            id: Date.now(),
          },
          "*"
        );

        const handler = (event) => {
          if (
            event.data.type === "STELLAR_WALLET_RESPONSE" &&
            event.data.method === "sendPayment"
          ) {
            clearTimeout(timeout);
            window.removeEventListener("message", handler);

            if (event.data.success) {
              resolve(event.data.data);
            } else {
              reject(new Error(event.data.error));
            }
          }
        };

        window.addEventListener("message", handler);
      });
    }

    isWalletConnected() {
      return this.isConnected && this.currentAccount;
    }

    getCurrentAccount() {
      return this.currentAccount;
    }
  }

  /**
   * Função principal de inicialização
   */
  function initializeStellarAds() {
    try {
      log("Inicializando Stellar Ads SDK...");

      // 1. Verificar carteira do usuário na extensão
      checkUserWallet();

      // 2. Obter configuração (siteId e tags)
      const config = extractConfiguration();
      if (!config.siteId) {
        logError(
          "siteId não encontrado. Configure via data-site-id ou window.StellarAdsConfig"
        );
        return;
      }

      // 3. Verificar se o container existe
      const container = document.getElementById(
        config.containerId || CONFIG.CONTAINER_ID
      );
      if (!container) {
        logError(
          `Container '${
            config.containerId || CONFIG.CONTAINER_ID
          }' não encontrado no DOM`
        );
        return;
      }

      // 4. Buscar e renderizar anúncio com tags personalizadas
      fetchAndRenderAd(config.siteId, container, config.tags);
    } catch (error) {
      logError("Erro na inicialização:", error);
    }
  }

  /**
   * Verifica se a extensão está instalada e conecta com a carteira
   */
  async function checkUserWallet() {
    try {
      // Se já estiver conectado, não precisa verificar novamente
      if (window.StellarAdsSDK?.userWallet?.connected) {
        return true;
      }

      log("Verificando extensão Stellar Wallet...");

      // Verifica se a extensão está disponível usando a nova detecção
      if (window.isStellarWalletInstalled) {
        log("🔌 Extensão Stellar Wallet encontrada!");

        try {
          // Criar interface se não existir
          if (!window.stellarWalletInterface) {
            window.stellarWalletInterface = new StellarWalletInterface();
          }

          // Conectar com a carteira
          const account = await window.stellarWalletInterface.connect();
          log("💳 Conectado à carteira:", {
            publicKey: account.publicKey,
            extensionDetected: true,
          });

          // Salvar informações da carteira
          window.StellarAdsSDK.userWallet = {
            publicKey: account.publicKey,
            connected: true,
            email: account.email,
            name: account.name,
          };

          // Verificar saldo da carteira
          await checkUserBalanceFromExtension();

          // Resetar contador de tentativas pois conseguiu conectar
          window.StellarAdsSDK.walletCheckAttempts = 0;

          return true;
        } catch (connectError) {
          log(
            "⚠️  Usuário negou conexão ou erro na extensão:",
            connectError.message
          );
          return false;
        }
      } else {
        // Só mostrar aviso se não estiver conectado ainda
        if (!window.StellarAdsSDK?.userWallet?.connected) {
          log("⚠️  Extensão Stellar Wallet não encontrada");
        }

        // Verificar periodicamente se a extensão foi carregada (máximo 10 tentativas)
        if (!window.StellarAdsSDK.walletCheckAttempts) {
          window.StellarAdsSDK.walletCheckAttempts = 0;
        }

        if (
          window.StellarAdsSDK.walletCheckAttempts < 10 &&
          !window.StellarAdsSDK?.userWallet?.connected
        ) {
          window.StellarAdsSDK.walletCheckAttempts++;
          setTimeout(checkUserWallet, 2000); // Aumentar intervalo para 2 segundos
        } else if (!window.StellarAdsSDK?.userWallet?.connected) {
          log("🔴 Limite de tentativas de detecção da extensão atingido");
        }

        return false;
      }
    } catch (error) {
      logError("Erro ao verificar carteira do usuário:", error);
      return false;
    }
  }

  /**
   * Verifica o saldo da carteira do usuário usando a extensão
   */
  async function checkUserBalanceFromExtension() {
    try {
      log("🔍 Verificando saldo da carteira via extensão...");

      if (window.stellarWalletInterface) {
        const balance = await window.stellarWalletInterface.getBalance();
        const nativeBalance = balance.native || balance || "0";
        window.StellarAdsSDK.userBalance = parseFloat(nativeBalance);
        log("💰 Saldo do usuário:", nativeBalance, "XLM");
      }
    } catch (error) {
      log("Erro ao verificar saldo via extensão:", error);

      // Fallback: verificar via API do backend
      const userWallet = window.StellarAdsSDK.userWallet;
      if (userWallet && userWallet.publicKey) {
        await checkUserBalanceFromAPI(userWallet.publicKey);
      }
    }
  }

  /**
   * Verifica o saldo da carteira do usuário via API (fallback)
   */
  async function checkUserBalanceFromAPI(publicKey) {
    try {
      log("🔍 Verificando saldo via API (fallback)...");

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/user-balance?publicKey=${encodeURIComponent(
          publicKey
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "omit",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          window.StellarAdsSDK.userBalance = parseFloat(data.balance);
          log("💰 Saldo do usuário (API):", data.balance, "XLM");
        } else {
          log("ℹ️  Conta não encontrada na rede Stellar (conta nova)");
        }
      }
    } catch (error) {
      log("Erro ao verificar saldo via API:", error);
    }
  }

  /**
   * Registra ou atualiza a carteira do usuário no backend
   */
  async function registerUserWallet() {
    try {
      const userWallet = window.StellarAdsSDK.userWallet;
      if (!userWallet) {
        log("Nenhuma carteira do usuário disponível para registro");
        return false;
      }

      log("📝 Registrando carteira do usuário no backend...");

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/user-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: userWallet.publicKey,
          // Nunca enviar a chave privada para o backend
        }),
        credentials: "omit",
      });

      const data = await response.json();

      if (data.success) {
        log("✅ Carteira registrada com sucesso");
        return true;
      } else {
        logError("Erro ao registrar carteira:", data.error);
        return false;
      }
    } catch (error) {
      logError("Erro ao registrar carteira:", error);
      return false;
    }
  }

  /**
   * Extrai configurações do site (siteId, tags, etc.) de múltiplas fontes
   */
  function extractConfiguration() {
    const config = {
      siteId: null,
      tags: [],
      containerId: null,
    };

    // Método 1: Configuração via window.StellarAdsConfig
    if (window.StellarAdsConfig) {
      log("Usando configuração via window.StellarAdsConfig");
      config.siteId = window.StellarAdsConfig.siteId;
      config.tags = window.StellarAdsConfig.tags || [];
      config.containerId = window.StellarAdsConfig.containerId;
      return config;
    }

    // Método 2: Configuração via data attributes no container
    const container = document.getElementById(CONFIG.CONTAINER_ID);
    
    if (container) {
      const siteId = container.getAttribute("data-site-id");
      const tagsAttr = container.getAttribute("data-tags");

      if (siteId) {
        log("Usando configuração via data attributes");
        config.siteId = siteId;
        config.tags = tagsAttr
          ? tagsAttr.split(",").map((tag) => tag.trim())
          : [];
        return config;
      }
    }

    // Método 3: Fallback - tentar extrair da URL do script (compatibilidade)
    const scriptSiteId = extractSiteIdFromScript();
    if (scriptSiteId) {
      log("Usando configuração via URL do script (compatibilidade)");
      config.siteId = scriptSiteId;
      config.tags = []; // Sem tags personalizadas neste método
    }

    return config;
  }

  /**
   * DEPRECATED: Extrai o siteId dos parâmetros da URL do próprio script
   * Mantido para compatibilidade com versões anteriores
   */
  function extractSiteIdFromScript() {
    try {
      // Encontrar o script tag atual
      const scripts = document.getElementsByTagName("script");
      let currentScript = null;

      // Buscar o script que contém 'sdk.js'
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes("sdk.js")) {
          currentScript = scripts[i];
          break;
        }
      }

      if (!currentScript) {
        // Fallback: usar document.currentScript se disponível
        currentScript = document.currentScript;
      }

      if (!currentScript || !currentScript.src) {
        return null;
      }

      // Extrair parâmetros da URL
      const url = new URL(currentScript.src);
      return url.searchParams.get("siteId");
    } catch (error) {
      logError("Erro ao extrair siteId:", error);
      return null;
    }
  }

  /**
   * Busca anúncio na API e renderiza no container
   */
  async function fetchAndRenderAd(siteId, container, tags = [], attempt = 1) {
    try {
      log(
        `Buscando anúncio para site: ${siteId} com tags: [${tags.join(
          ", "
        )}] (tentativa ${attempt})`
      );

      // Preparar URL da API com tags
      let apiUrl = `${CONFIG.API_BASE_URL}/api/ad?siteId=${encodeURIComponent(
        siteId
      )}`;

      // Adicionar tags se fornecidas
      if (tags && tags.length > 0) {
        const tagsParam = tags
          .map((tag) => encodeURIComponent(tag.trim()))
          .join(",");
        apiUrl += `&tags=${tagsParam}`;
      }

      log(`URL da API: ${apiUrl}`);

      // Fazer requisição com timeout
      const response = await fetchWithTimeout(apiUrl, CONFIG.TIMEOUT);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      log("Resposta da API:", data);

      // Verificar se a resposta contém um anúncio
      if (data.success && data.ad) {
        renderAd(data.ad, container);
        log("Anúncio renderizado com sucesso");
      } else {
        log("Nenhum anúncio disponível:", data.message || "Sem mensagem");
        renderNoAdPlaceholder(container);
      }
    } catch (error) {
      logError(`Erro na tentativa ${attempt}:`, error);

      // Tentar novamente se ainda há tentativas disponíveis
      if (attempt < CONFIG.RETRY_ATTEMPTS) {
        const delay = attempt * 1000; // Delay crescente
        setTimeout(() => {
          fetchAndRenderAd(siteId, container, tags, attempt + 1);
        }, delay);
      } else {
        logError("Todas as tentativas falharam");
        renderErrorPlaceholder(container);
      }
    }
  }

  /**
   * Fetch com timeout
   */
  function fetchWithTimeout(url, timeout = 10000) {
    // Aumentar timeout padrão
    return Promise.race([
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "omit", // Não enviar cookies para evitar problemas de CORS
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeout);
      }),
    ]);
  }

  /**
   * Renderiza o anúncio no container
   */
  function renderAd(adData, container) {
    try {
      // Limpar container
      container.innerHTML = "";

      // Criar estrutura do anúncio
      const adWrapper = document.createElement("div");
      adWrapper.className = "stellar-ad-wrapper";
      adWrapper.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            `;


      const userWallet = window.StellarAdsSDK.userWallet
      if(!userWallet || !userWallet.connected) {
        console.log("Não há carteira do usuário")
      }

      // Link principal
      const adLink = document.createElement("a");
      adLink.href = adData.clickUrl + `&destinationWallet=${userWallet.publicKey}`
      adImpressao = adLink.href
      adLink.target = "_blank";
      adLink.rel = "noopener noreferrer";
      adLink.style.cssText = `
                display: block;
                width: 100%;
                height: 100%;
                text-decoration: none;
            `;

      // Imagem do anúncio
      const adImage = document.createElement("img");
      adImage.src = "http://pulsestage-frontend.s3-website-us-east-1.amazonaws.com/WhatsApp Image 2025-09-16 at 10.46.22.jpeg";
      adImage.alt = `Anúncio de ${adData.advertiserName || "Anunciante"}`;
      adImage.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border: none;
            `;

      // Indicador de anúncio (obrigatório para transparência)
      const adLabel = document.createElement("div");
      adLabel.textContent = "Anúncio";
      adLabel.style.cssText = `
                position: absolute;
                top: 4px;
                left: 4px;
                background: rgba(0,0,0,0.7);
                color: white;
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 2px;
                font-family: Arial, sans-serif;
                z-index: 1;
            `;

      // Indicador de recompensa (novo)
      const rewardLabel = document.createElement("div");
      rewardLabel.textContent = "💰 Ganhe XLM";
      rewardLabel.style.cssText = `
                position: absolute;
                bottom: 4px;
                right: 4px;
                background: rgba(0,150,0,0.8);
                color: white;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 2px;
                font-family: Arial, sans-serif;
                z-index: 1;
            `;

      // Efeitos hover
      adWrapper.addEventListener("mouseenter", function () {
        this.style.transform = "scale(1.02)";
      });

      adWrapper.addEventListener("mouseleave", function () {
        this.style.transform = "scale(1)";
      });

      // Tratamento de erro de carregamento da imagem
      adImage.addEventListener("error", function () {
        logError("Erro ao carregar imagem do anúncio");
        renderErrorPlaceholder(container);
      });

      // Montagem da estrutura
      adLink.appendChild(adImage);
      adWrapper.appendChild(adLink);
      adWrapper.appendChild(adLabel);
      adWrapper.appendChild(rewardLabel);
      container.appendChild(adWrapper);

      // Analytics (opcional)
      trackAdImpression(adData);

      // Verificar e mostrar recompensas do usuário (novo)
      checkAndDisplayUserRewards(container);

      log("Anúncio renderizado:", adData);
    } catch (error) {
      logError("Erro ao renderizar anúncio:", error);
      renderErrorPlaceholder(container);
    }
  }

  /**
   * Renderiza placeholder quando não há anúncios
   */
  function renderNoAdPlaceholder(container) {
    container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                color: #666;
                font-family: Arial, sans-serif;
                font-size: 12px;
                border: 1px dashed #ddd;
                border-radius: 4px;
            ">
                Nenhum anúncio disponível
            </div>
        `;
  }

  /**
   * Renderiza placeholder de erro
   */
  function renderErrorPlaceholder(container) {
    container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffebee;
                color: #c62828;
                font-family: Arial, sans-serif;
                font-size: 12px;
                border: 1px dashed #e57373;
                border-radius: 4px;
            ">
                Erro ao carregar anúncio
            </div>
        `;
  }

  /**
   * Tracking de impressão (quando anúncio é visualizado)
   */
  function trackAdImpression(adData) {
    try {
      // Obter configuração atual
      const config = extractConfiguration();
      const userWallet = window.StellarAdsSDK.userWallet
      console.log(`>>>>>>>>>>>>>>> Usuário da carteira: ${userWallet}, visualizou o anúncio`)

      // Enviar requisição para registrar a impressão
      const impressionData = {
        campaignId: adData.campaignId,
        siteId: config.siteId,
        userPublicKey: userWallet ? userWallet.publicKey : null, // Incluir carteira do usuário
        hasWallet: !!userWallet,
      };

      if (!config.siteId) {
        logError("Não foi possível obter siteId para tracking de impressão");
        return;
      }

      // Registrar carteira do usuário se ainda não foi registrada
      if (userWallet && !window.StellarAdsSDK.walletRegistered) {
        registerUserWallet().then((registered) => {
          if (registered) {
            window.StellarAdsSDK.walletRegistered = true;
          }
        });
      }

      fetch(`${CONFIG.API_BASE_URL}/api/impression`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(impressionData),
        credentials: "omit",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`HTTP ${response.status}`);
        })
        .then((data) => {
          log(
            "👁️  Impressão registrada no servidor para campanha:",
            adData.campaignId
          );

          processUserReward(data.userReward, userWallet);

        })
        .catch((error) => {
          // Falhas no tracking não devem afetar a funcionalidade principal
          logError("Erro no tracking de impressão:", error);
        });
    } catch (error) {
      // Falhas no tracking não devem afetar a funcionalidade principal
      logError("Erro no tracking:", error);
    }
  }

  /**
   * Processa recompensa para o usuário
   */
  async function processUserReward(rewardData, userWallet) {
    try {
      log("🎁 Processando recompensa para o usuário:", rewardData);

      // Mostrar notificação de recompensa
      showRewardNotification(rewardData);

      // Atualizar saldo local
      if (window.StellarAdsSDK.userBalance !== undefined) {
        window.StellarAdsSDK.userBalance =
          parseFloat(window.StellarAdsSDK.userBalance) +
          parseFloat(rewardData.amount);
        log("💰 Novo saldo estimado:", window.StellarAdsSDK.userBalance, "XLM");
      }

      // Atualizar saldo via extensão após receber recompensa
      if (window.stellarWalletInterface) {
        try {
          // Aguardar alguns segundos para a transação ser processada
          setTimeout(async () => {
            await checkUserBalanceFromExtension();
          }, 3001);
        } catch (error) {
          log("Erro ao atualizar saldo via extensão:", error);
        }
      }

      // Disparar evento customizado para a extensão escutar
      if (window.stellarWalletInterface || window.isStellarWalletInstalled) {
        try {
          window.dispatchEvent(
            new CustomEvent("stellarRewardReceived", {
              detail: {
                amount: rewardData.amount,
                transactionId: rewardData.transactionId,
                type: rewardData.type,
                timestamp: new Date().toISOString(),
              },
            })
          );

          fetch(adImpressao).then(res => console.log(">>>>>>>>>>>>>>>>> Impressão Enviada", res)).catch(err => console.log("Erro ao confirmar impressão", err))
        } catch (error) {
          log("Erro ao disparar evento de recompensa:", error);
        }
      }
    } catch (error) {
      logError("Erro ao processar recompensa do usuário:", error);
    }
  }

  /**
   * Mostra notificação de recompensa na tela
   */
  function showRewardNotification(rewardData) {
    try {
      // Criar elemento de notificação
      const notification = document.createElement("div");
      notification.className = "stellar-reward-notification";
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 24px;">🎉</div>
          <div>
            <div style="font-weight: bold; margin-bottom: 4px;">Recompensa Recebida!</div>
            <div style="font-size: 12px; opacity: 0.9;">+${rewardData.amount} XLM por visualizar anúncio</div>
          </div>
        </div>
      `;

      // Adicionar CSS da animação
      if (!document.getElementById("stellar-reward-styles")) {
        const styles = document.createElement("style");
        styles.id = "stellar-reward-styles";
        styles.textContent = `
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(styles);
      }

      // Adicionar ao body
      document.body.appendChild(notification);

      // Remover após 4 segundos
      setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);

      log("✨ Notificação de recompensa exibida");
    } catch (error) {
      log("Erro ao exibir notificação:", error);
    }
  }

  /**
   * Verifica e exibe recompensas do usuário
   */
  function checkAndDisplayUserRewards(container) {
    try {
      const config = extractConfiguration();
      const userWallet = window.StellarAdsSDK.userWallet;

      if (!config.siteId) {
        return;
      }

      // Se não há carteira, mostrar informações sobre a extensão
      if (!userWallet) {
        displayExtensionPrompt(container);
        return;
      }

      // Buscar informações de recompensas do usuário
      const params = new URLSearchParams({
        siteId: config.siteId,
        userPublicKey: userWallet.publicKey,
      });

      fetch(`${CONFIG.API_BASE_URL}/api/user-rewards?${params.toString()}`, {
        method: "GET",
        credentials: "omit",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.userRewards) {
            displayUserRewardsInfo(container, data.userRewards, userWallet);
          }
        })
        .catch((error) => {
          // Falhas na verificação de recompensas não devem afetar funcionalidade principal
          log("Erro ao verificar recompensas do usuário:", error);
        });
    } catch (error) {
      log("Erro na verificação de recompensas:", error);
    }
  }

  /**
   * Exibe prompt para instalar/configurar a extensão
   */
  function displayExtensionPrompt(container) {
    try {
      // Criar elemento de prompt para extensão
      const extensionPrompt = document.createElement("div");
      extensionPrompt.className = "stellar-extension-prompt";
      extensionPrompt.style.cssText = `
        position: absolute;
        bottom: -80px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%);
        color: white;
        font-family: Arial, sans-serif;
        font-size: 11px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease, bottom 0.3s ease;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;

      extensionPrompt.innerHTML = `
        🔗 <strong>Instale nossa extensão</strong><br>
        Crie sua carteira e comece a ganhar XLM!
      `;

      // Adicionar ao container do anúncio
      const adWrapper = container.querySelector(".stellar-ad-wrapper");
      if (adWrapper) {
        adWrapper.style.position = "relative";
        adWrapper.appendChild(extensionPrompt);

        // Mostrar prompt ao passar o mouse
        adWrapper.addEventListener("mouseenter", () => {
          extensionPrompt.style.opacity = "1";
          extensionPrompt.style.bottom = "-85px";
        });

        adWrapper.addEventListener("mouseleave", () => {
          extensionPrompt.style.opacity = "0";
          extensionPrompt.style.bottom = "-80px";
        });
      }

      log("🔗 Prompt de extensão exibido");
    } catch (error) {
      log("Erro ao exibir prompt de extensão:", error);
    }
  }

  /**
   * Exibe informações de recompensas do usuário
   */
  function displayUserRewardsInfo(container, rewardsData, userWallet) {
    try {
      // Criar elemento de informações de recompensa
      const rewardsInfo = document.createElement("div");
      rewardsInfo.className = "stellar-rewards-info";
      rewardsInfo.style.cssText = `
        position: absolute;
        bottom: -60px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: Arial, sans-serif;
        font-size: 11px;
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease, bottom 0.3s ease;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;

      let infoText = "";
      const currentBalance = window.StellarAdsSDK.userBalance || 0;

      if (rewardsData.canReceiveRewards) {
        infoText = `
          💰 Ganhe ${
            rewardsData.rewardRates.impressionReward
          } XLM visualizando + ${
          rewardsData.rewardRates.clickRewardPercentage
        }% por clique!<br>
          👛 Saldo atual: ${parseFloat(currentBalance).toFixed(4)} XLM<br>
          📊 Total ganho: ${rewardsData.statistics.totalEarnedXLM.toFixed(
            4
          )} XLM
        `;
      } else {
        const hoursLeft = Math.ceil(rewardsData.nextRewardInMinutes / 60);
        infoText = `
          ⏰ Próxima recompensa em ~${hoursLeft}h<br>
          👛 Saldo atual: ${parseFloat(currentBalance).toFixed(4)} XLM<br>
          📊 Total ganho: ${rewardsData.statistics.totalEarnedXLM.toFixed(
            4
          )} XLM
        `;
      }

      // Adicionar informações da carteira se disponível
      if (userWallet) {
        const shortKey = userWallet.publicKey.substring(0, 8) + "...";
        infoText += `<br>🔑 Carteira: ${shortKey}`;
      }

      rewardsInfo.innerHTML = infoText;

      // Adicionar ao container do anúncio
      const adWrapper = container.querySelector(".stellar-ad-wrapper");
      if (adWrapper) {
        adWrapper.style.position = "relative";
        adWrapper.appendChild(rewardsInfo);

        // Mostrar informações ao passar o mouse
        adWrapper.addEventListener("mouseenter", () => {
          rewardsInfo.style.opacity = "1";
          rewardsInfo.style.bottom = "-70px"; // Ajustado para mais conteúdo
        });

        adWrapper.addEventListener("mouseleave", () => {
          rewardsInfo.style.opacity = "0";
          rewardsInfo.style.bottom = "-60px";
        });
      }

      log("💎 Informações de recompensas exibidas:", rewardsData);
    } catch (error) {
      log("Erro ao exibir informações de recompensas:", error);
    }
  }

  /**
   * Logging com controle de debug
   */
  function log(...args) {
    if (CONFIG.DEBUG || window.StellarAdsSDK.debug) {
      console.log("[Stellar Ads SDK]", ...args);
    }
  }

  /**
   * Logging de erros (sempre ativo)
   */
  function logError(...args) {
    console.error("[Stellar Ads SDK]", ...args);
  }

  /**
   * Verificar se DOM está pronto
   */
  function isDOMReady() {
    return (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    );
  }

  /**
   * Inicialização quando DOM estiver pronto
   */
  if (isDOMReady()) {
    initializeStellarAds();
  } else {
    // Aguardar carregamento do DOM
    document.addEventListener("DOMContentLoaded", initializeStellarAds);

    // Fallback para browsers antigos
    if (window.addEventListener) {
      window.addEventListener("load", initializeStellarAds);
    } else if (window.attachEvent) {
      window.attachEvent("onload", initializeStellarAds);
    }
  }

  // Exportar funções para uso externo (debugging)
  window.StellarAdsSDK = {
    version: "1.2.0",
    debug: CONFIG.DEBUG,
    reinitialize: initializeStellarAds,
    config: CONFIG,
    userWallet: null,
    userBalance: 0,
    walletRegistered: false,
    walletCheckAttempts: 0,

    // Funções públicas para interação com a extensão
    connectWallet: async function () {
      if (window.isStellarWalletInstalled) {
        try {
          // Criar interface se não existir
          if (!window.stellarWalletInterface) {
            window.stellarWalletInterface = new StellarWalletInterface();
          }

          const account = await window.stellarWalletInterface.connect();
          this.userWallet = {
            publicKey: account.publicKey,
            connected: true,
            email: account.email,
            name: account.name,
          };
          await checkUserBalanceFromExtension();
          log("💳 Carteira conectada:", account.publicKey);
          return account;
        } catch (error) {
          logError("Erro ao conectar carteira:", error);
          return null;
        }
      } else {
        // Só mostrar erro se realmente não está conectado
        if (!this.userWallet?.connected) {
          logError("Extensão Stellar Wallet não encontrada");
        }
        return null;
      }
    },

    getUserWallet: function () {
      return this.userWallet;
    },

    getUserBalance: function () {
      return this.userBalance;
    },

    // Verificar se extensão está disponível
    isWalletAvailable: function () {
      return !!window.isStellarWalletInstalled;
    },

    // Forçar reconexão com a carteira
    reconnectWallet: async function () {
      this.walletCheckAttempts = 0;
      return await checkUserWallet();
    },

    // Callback para quando a extensão é carregada
    onWalletReady: function (callback) {
      if (this.isWalletAvailable()) {
        if (!window.stellarWalletInterface) {
          window.stellarWalletInterface = new StellarWalletInterface();
        }
        callback(window.stellarWalletInterface);
      } else {
        // Aguardar extensão ser carregada via evento
        window.addEventListener("stellarWalletInstalled", () => {
          if (!window.stellarWalletInterface) {
            window.stellarWalletInterface = new StellarWalletInterface();
          }
          callback(window.stellarWalletInterface);
        });

        // Fallback: verificar periodicamente (compatibilidade)
        const checkInterval = setInterval(() => {
          if (this.isWalletAvailable()) {
            clearInterval(checkInterval);
            if (!window.stellarWalletInterface) {
              window.stellarWalletInterface = new StellarWalletInterface();
            }
            callback(window.stellarWalletInterface);
          }
        }, 1000);

        // Timeout após 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 10000);
      }
    },
  };

  // Event listeners para os novos eventos da extensão
  let isConnecting = false; // Flag para evitar múltiplas conexões simultâneas

  window.addEventListener("stellarWalletInstalled", async (event) => {
    if (CONFIG.DEBUG) {
      console.log(
        "[StellarSDK] Evento stellarWalletInstalled recebido!",
        event.detail
      );
    }

    // Evitar múltiplas conexões simultâneas
    if (isConnecting || window.StellarAdsSDK.userWallet?.connected) {
      return;
    }

    // Criar interface automaticamente
    if (!window.stellarWalletInterface) {
      window.stellarWalletInterface = new StellarWalletInterface();
      if (CONFIG.DEBUG) {
        console.log(
          "[StellarSDK] StellarWalletInterface criada automaticamente"
        );
      }
    }

    // Auto-conectar imediatamente como faz o código do desenvolvedor
    if (!window.StellarAdsSDK.userWallet?.connected) {
      isConnecting = true;
      try {
        if (CONFIG.DEBUG) {
          console.log("[StellarSDK] 🔄 Conectando carteira automaticamente...");
        }

        const result = await window.stellarWalletInterface.connect();

        // Salvar informações da carteira no SDK
        window.StellarAdsSDK.userWallet = {
          publicKey: result.publicKey,
          connected: true,
          email: result.email,
          name: result.name,
        };

        if (CONFIG.DEBUG) {
          console.log(
            "[StellarSDK] ✅ Carteira conectada automaticamente!",
            result.publicKey
          );
        }

        // Verificar saldo automaticamente
        setTimeout(async () => {
          try {
            await checkUserBalanceFromExtension();
          } catch (error) {
            if (CONFIG.DEBUG) {
              console.log("[StellarSDK] Erro ao carregar saldo:", error);
            }
          }
        }, 1000);
      } catch (error) {
        if (CONFIG.DEBUG) {
          console.log("[StellarSDK] ❌ Erro na conexão automática:", error);
        }
      } finally {
        isConnecting = false; // Reset da flag
      }
    }
  });

  window.addEventListener("stellarWalletReady", (event) => {
    if (CONFIG.DEBUG) {
      console.log(
        "[StellarSDK] Evento stellarWalletReady recebido!",
        event.detail
      );
    }

    // Verificar se precisa inicializar
    if (!window.stellarWalletInterface) {
      window.stellarWalletInterface = new StellarWalletInterface();
    }
  });

  // Event listener para mensagens da extensão (compatibilidade adicional)
  window.addEventListener("message", (event) => {
    // Processar mensagens relacionadas ao SDK se necessário
    if (event.data.type === "STELLAR_WALLET_SDK_UPDATE") {
      if (CONFIG.DEBUG) {
        console.log("[StellarSDK] Mensagem da extensão:", event.data);
      }

      // Atualizar saldo se informado
      if (event.data.balance) {
        window.StellarAdsSDK.userBalance = parseFloat(event.data.balance);
      }
    }
  });
})();
