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

  /**
   * Detecta a URL base da API baseada no contexto
   */
  function detectApiBaseUrl() {
    // Se estamos em um Live Server ou ambiente similar, usar localhost:3000
    if (
      window.location.port === "5500" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:3000";
    }
    // Caso contrário, usar o mesmo servidor
    return window.location.protocol + "//" + window.location.host;
  }

  // Namespace global para evitar conflitos
  window.StellarAdsSDK = window.StellarAdsSDK || {};

  /**
   * Função principal de inicialização
   */
  function initializeStellarAds() {
    try {
      log("Inicializando Stellar Ads SDK...");

      // 1. Obter configuração (siteId e tags)
      const config = extractConfiguration();
      if (!config.siteId) {
        logError(
          "siteId não encontrado. Configure via data-site-id ou window.StellarAdsConfig"
        );
        return;
      }

      // 2. Verificar se o container existe
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

      // 3. Buscar e renderizar anúncio com tags personalizadas
      fetchAndRenderAd(config.siteId, container, config.tags);
    } catch (error) {
      logError("Erro na inicialização:", error);
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
  function fetchWithTimeout(url, timeout) {
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

      // Link principal
      const adLink = document.createElement("a");
      adLink.href = adData.clickUrl;
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
      adImage.src = adData.imageUrl;
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

      // Enviar requisição para registrar a impressão
      const impressionData = {
        campaignId: adData.campaignId,
        siteId: config.siteId,
      };

      if (!config.siteId) {
        logError("Não foi possível obter siteId para tracking de impressão");
        return;
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
            log(
              "👁️  Impressão registrada no servidor para campanha:",
              adData.campaignId
            );
          } else {
            logError("Aviso: Falha ao registrar impressão no servidor");
          }
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
   * Verifica e exibe recompensas do usuário
   */
  function checkAndDisplayUserRewards(container) {
    try {
      const config = extractConfiguration();

      if (!config.siteId) {
        return;
      }

      // Buscar informações de recompensas do usuário
      fetch(
        `${CONFIG.API_BASE_URL}/api/user-rewards?siteId=${encodeURIComponent(
          config.siteId
        )}`,
        {
          method: "GET",
          credentials: "omit",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.userRewards) {
            displayUserRewardsInfo(container, data.userRewards);
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
   * Exibe informações de recompensas do usuário
   */
  function displayUserRewardsInfo(container, rewardsData) {
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

      if (rewardsData.canReceiveRewards) {
        infoText = `
          💰 Ganhe ${
            rewardsData.rewardRates.impressionReward
          } XLM visualizando + ${
          rewardsData.rewardRates.clickRewardPercentage
        }% por clique!<br>
          📊 Total ganho: ${rewardsData.statistics.totalEarnedXLM.toFixed(
            4
          )} XLM
        `;
      } else {
        const hoursLeft = Math.ceil(rewardsData.nextRewardInMinutes / 60);
        infoText = `
          ⏰ Próxima recompensa em ~${hoursLeft}h<br>
          📊 Total ganho: ${rewardsData.statistics.totalEarnedXLM.toFixed(
            4
          )} XLM
        `;
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
          rewardsInfo.style.bottom = "-65px";
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
    version: "1.0.0",
    debug: CONFIG.DEBUG,
    reinitialize: initializeStellarAds,
    config: CONFIG,
  };
})();
