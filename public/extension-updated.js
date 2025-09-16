/**
 * Exemplo de como a extensão Stellar Wallet deve interagir com o SDK
 * Este arquivo mostra a interface que a extensão deve implementar
 * Baseado na interface fornecida pelo desenvolvedor da extensão
 */

// Simulação da extensão sendo injetada no window
(function() {
  'use strict';

  // Simular dados da carteira (em produção, isso vem da extensão real)
  const mockWalletData = {
    publicKey: 'GCDZ4ZTAJDIQXF3FGPCBCJXN2X4DF7L4IVITMPPYFUZHVP6OX23ATAWZ',
    balance: { native: '10.5000000' },
    isConnected: false
  };

  // Interface que a extensão deve implementar (conforme fornecida pelo desenvolvedor)
  window.stellarWallet = {
    /**
     * Conectar com a carteira do usuário
     * @returns {Promise<{publicKey: string}>}
     */
    connect: async function() {
      console.log('🔌 [Extension] Conectando com a carteira...');
      
      // Simular prompt do usuário para conectar
      return new Promise((resolve, reject) => {
        // Em produção, isso seria um popup/modal da extensão
        const userAccepted = confirm('Conectar carteira Stellar com este site?');
        
        if (userAccepted) {
          mockWalletData.isConnected = true;
          console.log('✅ [Extension] Carteira conectada:', mockWalletData.publicKey);
          resolve({
            publicKey: mockWalletData.publicKey
          });
        } else {
          reject(new Error('Usuário negou a conexão'));
        }
      });
    },

    /**
     * Obter saldo da carteira
     * @returns {Promise<{native: string}>}
     */
    getBalance: async function() {
      if (!mockWalletData.isConnected) {
        throw new Error('Carteira não conectada');
      }

      console.log('💰 [Extension] Consultando saldo...');
      
      // Simular consulta ao Stellar Horizon
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('💰 [Extension] Saldo obtido:', mockWalletData.balance.native, 'XLM');
          resolve(mockWalletData.balance);
        }, 500);
      });
    },

    /**
     * Enviar pagamento
     * @param {string} destination - Chave pública de destino
     * @param {string} amount - Valor em XLM
     * @param {string} memo - Memo da transação
     * @returns {Promise<{transactionHash: string}>}
     */
    sendPayment: async function(destination, amount, memo) {
      if (!mockWalletData.isConnected) {
        throw new Error('Carteira não conectada');
      }

      console.log('💸 [Extension] Enviando pagamento:', {
        to: destination,
        amount: amount + ' XLM',
        memo: memo
      });

      // Simular transação
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% de sucesso
          
          if (success) {
            const txHash = 'mock_' + Math.random().toString(36).substr(2, 9);
            
            // Atualizar saldo local
            mockWalletData.balance.native = (parseFloat(mockWalletData.balance.native) - parseFloat(amount)).toFixed(7);
            
            console.log('✅ [Extension] Pagamento enviado:', txHash);
            resolve({
              transactionHash: txHash
            });
          } else {
            reject(new Error('Falha na transação'));
          }
        }, 1000);
      });
    },

    /**
     * Verificar se a carteira está conectada
     * @returns {boolean}
     */
    isConnected: function() {
      return mockWalletData.isConnected;
    },

    /**
     * Desconectar carteira
     */
    disconnect: function() {
      mockWalletData.isConnected = false;
      console.log('🔌 [Extension] Carteira desconectada');
    }
  };

  // Escutar eventos de recompensa do SDK
  window.addEventListener('stellarRewardReceived', function(event) {
    const rewardData = event.detail;
    console.log('🎉 [Extension] Recompensa recebida:', rewardData);
    
    // Atualizar saldo local
    mockWalletData.balance.native = (
      parseFloat(mockWalletData.balance.native) + parseFloat(rewardData.amount)
    ).toFixed(7);
    
    // Mostrar notificação na extensão (simulado)
    if (Notification.permission === 'granted') {
      new Notification('Stellar Ads - Recompensa Recebida!', {
        body: `Você ganhou ${rewardData.amount} XLM`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      });
    }
  });

  // Solicitar permissão para notificações
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Notificar o SDK quando a extensão estiver pronta
  window.dispatchEvent(new CustomEvent('stellarWalletReady', {
    detail: {
      version: '1.0.0',
      ready: true
    }
  }));

  console.log('🔌 [Extension] Stellar Wallet Extension carregada');
})();

// Exemplo de uso da interface (como o desenvolvedor da extensão forneceu)
/*
// Detect extension
if (window.stellarWallet) {
  // Connect to wallet
  const account = await window.stellarWallet.connect();
  console.log('Connected:', account.publicKey);
  
  // Get balance
  const balance = await window.stellarWallet.getBalance();
  console.log('Balance:', balance.native + ' XLM');
  
  // Send payment
  const result = await window.stellarWallet.sendPayment(
    'GCKF...', '10.0', 'Payment memo'
  );
  console.log('Transaction:', result.transactionHash);
}
*/
