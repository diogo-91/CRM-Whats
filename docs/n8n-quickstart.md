# Integração n8n - Guia Rápido

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

**No CRM** (`.env`):
```env
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/crm-send
```

**No n8n** (Settings → Environment Variables):
```env
EVOLUTION_API_URL=https://evolution-evolution-api.wz7hqa.easypanel.host
EVOLUTION_API_TOKEN=429683C4C977415CAAFCCE10F7D57E11
EVOLUTION_INSTANCE=clinica
CRM_URL=http://seu-crm.com:3001
```

### 2. Importar Workflows no n8n

1. **Workflow de Envio**: Importe `docs/n8n-workflow-send.json`
   - Este workflow recebe mensagens do CRM e envia via WhatsApp
   
2. **Workflow de Recebimento**: Importe `docs/n8n-workflow-receive.json`
   - Este workflow recebe mensagens do WhatsApp e notifica o CRM

### 3. Configurar Evolution API

Configure o webhook da Evolution API para apontar para o n8n:
```
https://seu-n8n.com/webhook/evolution-incoming
```

### 4. Ativar Workflows

No n8n, ative ambos os workflows clicando em "Active" no canto superior direito.

---

## 📋 Endpoints Criados

### CRM → n8n (Envio)
- **Endpoint**: `POST /api/messages`
- **Autenticação**: Bearer Token
- **Comportamento**: Envia para n8n ao invés de Evolution API diretamente

### n8n → CRM (Confirmação)
- **Endpoint**: `POST /api/webhooks/n8n-sent`
- **Autenticação**: Nenhuma
- **Comportamento**: Salva mensagem enviada no banco e exibe no CRM

### Evolution → CRM (Recebimento)
- **Endpoint**: `POST /api/webhooks/evolution`
- **Autenticação**: Nenhuma
- **Comportamento**: Já existente, continua funcionando

---

## 🔄 Fluxos

### Envio (Operador → WhatsApp)
```
CRM → n8n → Evolution API → WhatsApp
         ↓
    Confirma para CRM
```

### Recebimento (WhatsApp → CRM)
```
WhatsApp → Evolution API → n8n → CRM
                             ↓
                        Agente IA (opcional)
```

---

## ✅ Checklist de Configuração

- [ ] Variáveis de ambiente configuradas no CRM
- [ ] Variáveis de ambiente configuradas no n8n
- [ ] Workflow de envio importado e ativado
- [ ] Workflow de recebimento importado e ativado
- [ ] Webhook da Evolution API configurado
- [ ] Testado envio de mensagem
- [ ] Testado recebimento de mensagem

---

## 🧪 Testes

### Teste 1: Enviar Mensagem
1. Abra o CRM
2. Selecione um contato
3. Envie uma mensagem
4. Verifique no n8n se o workflow foi executado
5. Confirme que a mensagem chegou no WhatsApp
6. Verifique se a mensagem apareceu no CRM como enviada

### Teste 2: Receber Mensagem
1. Envie uma mensagem do WhatsApp
2. Verifique no n8n se o workflow foi executado
3. Confirme que a mensagem apareceu no CRM

---

## 🐛 Troubleshooting

### Mensagens não aparecem no CRM

**Verificar:**
1. Console do navegador (F12) → procure por erros de Socket.io
2. Logs do servidor CRM → procure por `[CRM]`
3. Execuções do n8n → verifique se há erros

**Soluções:**
- Confirme que `N8N_WEBHOOK_URL` está correto no `.env`
- Verifique se os workflows estão ativos no n8n
- Teste os endpoints manualmente (veja `docs/n8n-setup.md`)

### Timeout ao enviar

**Causa:** n8n demorando mais de 10 segundos para processar

**Solução:** Aumente o timeout em `server/index.js` linha ~434:
```javascript
timeout: 30000  // 30 segundos
```

### Mensagens duplicadas

**Causa:** n8n enviando múltiplas confirmações

**Solução:** O sistema já previne duplicatas via `messageId`. Verifique se o n8n está gerando IDs únicos.

---

## 📚 Documentação Completa

Para detalhes completos, consulte:
- **Setup Completo**: `docs/n8n-setup.md`
- **Workflow de Envio**: `docs/n8n-workflow-send.json`
- **Workflow de Recebimento**: `docs/n8n-workflow-receive.json`

---

## 🤖 Adicionando Agente IA

Para adicionar processamento de IA no n8n:

1. No workflow de recebimento, adicione um node "AI Agent" após "Notificar CRM - Mensagem Recebida"
2. Configure seu agente (OpenAI, Anthropic, etc.)
3. Conecte a saída do agente a um node HTTP Request para enviar resposta
4. Adicione outro HTTP Request para notificar o CRM da resposta enviada

Exemplo de configuração está em `docs/n8n-setup.md`.
