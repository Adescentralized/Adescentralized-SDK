# Comandos e Procedimentos Essenciais - Stellar Ads SDK

## 🚀 Comandos de Inicialização

### **Iniciar Sistema Completo**
```bash
# Navegar para o diretório
cd /home/inteli/Documentos/sdk

# Instalar dependências (primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Verificar se está rodando
curl http://localhost:3000/health
```

### **Verificações Pós-Inicialização**
```bash
# Testar endpoint de anúncios
curl "http://localhost:3000/api/ad?siteId=site_example_123&tags=tecnologia"

# Verificar recompensas de usuário
curl "http://localhost:3000/api/user-rewards?siteId=site_example_123"

# Listar sites disponíveis
curl "http://localhost:3000/api/sites"

# Listar campanhas ativas
curl "http://localhost:3000/api/campaigns"
```

## 🔄 Comandos de Manutenção

### **Reset do Banco de Dados**
```bash
# Parar o servidor (Ctrl+C)
# Remover banco existente
rm /tmp/stellar_ads.sqlite

# Reiniciar servidor (recria banco automaticamente)
npm run dev
```

### **Verificar Logs do Sistema**
```bash
# Monitorar logs em tempo real (se houver arquivo de log)
tail -f logs.txt

# Verificar processos Node.js rodando
ps aux | grep node

# Verificar porta 3000 em uso
lsof -i :3000
```

### **Backup Essencial**
```bash
# Criar backup completo
mkdir -p ~/backup/stellar-ads-$(date +%Y%m%d)
cp -r /home/inteli/Documentos/sdk ~/backup/stellar-ads-$(date +%Y%m%d)/
cp /tmp/stellar_ads.sqlite ~/backup/stellar-ads-$(date +%Y%m%d)/

# Backup apenas da configuração
cp .env ~/backup/stellar-ads-config-$(date +%Y%m%d).env
```

## 💰 Comandos Stellar

### **Verificar Saldos das Contas**
```bash
# Conta da plataforma
curl -s "https://horizon-testnet.stellar.org/accounts/GCEK6LAV4CYV2OBVRHMCBY3E4M3ZQKVJI2THH3ZDZGPHN4O3V6TPT5EF" | grep -A 3 '"balance"'

# Para verificar qualquer conta (substitua CHAVE_PUBLICA)
curl -s "https://horizon-testnet.stellar.org/accounts/CHAVE_PUBLICA" | grep -A 3 '"balance"'
```

### **Financiar Contas no Testnet**
```bash
# Financiar conta via Friendbot (testnet)
curl "https://friendbot.stellar.org?addr=CHAVE_PUBLICA_AQUI"
```

### **Verificar Transações Recentes**
```bash
# Últimas transações da conta da plataforma
curl -s "https://horizon-testnet.stellar.org/accounts/GCEK6LAV4CYV2OBVRHMCBY3E4M3ZQKVJI2THH3ZDZGPHN4O3V6TPT5EF/transactions?limit=5&order=desc"
```

## 🧪 Comandos de Teste

### **Testes Manuais de API**
```bash
# Simular impressão
curl -X POST "http://localhost:3000/api/impression" \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"campaign_elearning_003","siteId":"site_example_123","fingerprint":"test_user_123"}'

# Simular clique
curl "http://localhost:3000/api/click?campaignId=campaign_elearning_003&siteId=site_example_123&t=$(date +%s)000"

# Validar site
curl -X POST "http://localhost:3000/api/validate-site" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_example_123"}'
```

### **Verificar Estado das Recompensas**
```bash
# Ver estatísticas gerais
curl "http://localhost:3000/api/stats" | python3 -m json.tool

# Verificar recompensas específicas
curl "http://localhost:3000/api/user-rewards?siteId=site_example_123&fingerprint=test_user_123"
```

## 🔧 Comandos de Debug

### **Verificar Configurações**
```bash
# Mostrar variáveis de ambiente (cuidado com chaves!)
grep -E "STELLAR_|PLATFORM_|SITE" .env

# Verificar estrutura do banco
sqlite3 /tmp/stellar_ads.sqlite ".schema"

# Contar registros nas tabelas
sqlite3 /tmp/stellar_ads.sqlite "SELECT 'sites:', COUNT(*) FROM sites; SELECT 'campaigns:', COUNT(*) FROM campaigns; SELECT 'impressions:', COUNT(*) FROM impressions;"
```

### **Diagnóstico de Problemas**
```bash
# Verificar se dependências estão instaladas
npm list --depth=0

# Verificar versão do Node.js
node --version

# Testar conectividade com Stellar testnet
curl -s "https://horizon-testnet.stellar.org/" | head -20

# Verificar se porta está livre
netstat -tlnp | grep :3000
```

## 📊 Comandos de Monitoramento

### **Performance do Sistema**
```bash
# Uso de memória do processo Node.js
ps aux | grep node | grep -v grep

# Espaço em disco
df -h /tmp/

# Tamanho do banco de dados
ls -lh /tmp/stellar_ads.sqlite
```

### **Logs e Estatísticas**
```bash
# Contar impressões por campanha
sqlite3 /tmp/stellar_ads.sqlite "SELECT campaign_id, COUNT(*) as impressions FROM impressions GROUP BY campaign_id;"

# Ver últimas impressões
sqlite3 /tmp/stellar_ads.sqlite "SELECT campaign_id, site_id, created_at FROM impressions ORDER BY created_at DESC LIMIT 10;"

# Verificar recompensas totais por usuário
sqlite3 /tmp/stellar_ads.sqlite "SELECT user_fingerprint, SUM(reward_amount) as total FROM user_rewards GROUP BY user_fingerprint;"
```

## 🎯 URLs Importantes

### **Interfaces de Teste**
- Demo Principal: `http://localhost:3000/rewards-demo.html`
- Página Inicial: `http://localhost:3000/index.html`
- Gerador SDK: `http://localhost:3000/gerador-sdk.html`
- Health Check: `http://localhost:3000/health`

### **Stellar Tools**
- Laboratory: `https://laboratory.stellar.org`
- Testnet Explorer: `https://stellar.expert/explorer/testnet`
- Friendbot (funding): `https://friendbot.stellar.org`

## 🚨 Procedimentos de Emergência

### **Sistema Não Responde**
```bash
# Matar processo Node.js
pkill -f "node index.js"

# Verificar se porta está livre
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### **Banco de Dados Corrompido**
```bash
# Backup antes de resetar
cp /tmp/stellar_ads.sqlite ~/stellar_ads_backup.sqlite

# Resetar banco
rm /tmp/stellar_ads.sqlite
npm run dev
```

### **Problemas com Stellar**
```bash
# Verificar conectividade
ping horizon-testnet.stellar.org

# Verificar se contas existem
curl -s "https://horizon-testnet.stellar.org/accounts/GCEK6LAV4CYV2OBVRHMCBY3E4M3ZQKVJI2THH3ZDZGPHN4O3V6TPT5EF" | grep account_id
```

## 📋 Checklist de Deploy

### **Antes de Subir em Produção**
- [ ] Alterar `STELLAR_NETWORK` para `mainnet` no `.env`
- [ ] Gerar novas chaves para mainnet
- [ ] Financiar contas com XLM real
- [ ] Configurar domínio e SSL
- [ ] Implementar rate limiting
- [ ] Configurar monitoramento
- [ ] Backup automático do banco
- [ ] Logs estruturados
- [ ] Testes automatizados

### **Configurações de Produção**
```bash
# Variáveis de ambiente para produção
export NODE_ENV=production
export STELLAR_NETWORK=mainnet
export PORT=3000
```

---

**💡 Dica**: Sempre mantenha este arquivo atualizado com novos comandos e procedimentos descobertos durante o uso do sistema.
