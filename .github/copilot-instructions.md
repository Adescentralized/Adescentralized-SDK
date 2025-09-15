# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

Este é um projeto SDK para uma plataforma de anúncios com arquitetura híbrida que integra:

- **Backend Node.js/Express** com endpoints para servir anúncios e rastrear cliques
- **SDK JavaScript** leve para integração em sites de editores
- **Integração com Stellar Blockchain** para pagamentos automatizados
- **Base de dados SQLite** para armazenar campanhas, sites e métricas

## Padrões do Projeto

- Use ES6+ features quando apropriado
- Mantenha o SDK JavaScript o mais leve possível
- Priorize a simplicidade e performance
- Todos os endpoints devem ter tratamento de erros robusto
- Use async/await para operações assíncronas
- Implemente logging adequado para debug e monitoramento
- Mantenha a compatibilidade com diferentes navegadores no SDK

## Estrutura

- `/src` - Código fonte do backend
- `/public` - Arquivos estáticos incluindo o SDK JavaScript
- `/src/routes` - Definições das rotas da API
- `/src/services` - Lógica de negócio e integrações
- `/src/models` - Modelos de dados e esquemas do banco
