# 🎯 Configuração do n8n - Mensagens Enviadas

## Problema
As mensagens **recebidas** aparecem no CRM ✅  
As mensagens **enviadas** pelo agente IA não aparecem ❌

## Solução

Adicione **1 node HTTP Request** no seu workflow do n8n, logo após enviar a mensagem via Evolution API.

---

## 📍 Onde Adicionar

```
[Webhook Evolution] 
    ↓
[Agente IA]
    ↓
[HTTP Request - Enviar via Evolution API] ← Você já tem
    ↓
[HTTP Request - Notificar CRM] ← ADICIONE ESTE NODE
```

---

## ⚙️ Configuração do Node

### **Node Type**: HTTP Request

### **Settings**:
- **Name**: `Notificar CRM - Mensagem Enviada`
- **Method**: `POST`
- **URL**: `{{$env.CRM_URL}}/api/webhooks/n8n-sent`

### **Headers**:
```
Content-Type: application/json
```

### **Body** (escolha uma opção):

#### **Opção A: Se você já tem o contactId**
```json
{
  "contactId": "{{ $json.contactId }}",
  "content": "{{ $json.mensagemEnviada }}",
  "messageId": "msg_{{ $now }}",
  "timestamp": "{{ $now }}"
}
```

#### **Opção B: Se você só tem o telefone** (Recomendado)

Adicione **2 nodes** em sequência:

**Node 1: HTTP Request - Buscar Contact ID**
- **Method**: `GET`
- **URL**: `{{$env.CRM_URL}}/api/contacts/search?phone={{ $json.phone }}`
- **Save response**: Sim

**Node 2: HTTP Request - Notificar CRM**
- **Method**: `POST`
- **URL**: `{{$env.CRM_URL}}/api/webhooks/n8n-sent`
- **Body**:
```json
{
  "contactId": "{{ $node['HTTP Request - Buscar Contact ID'].json.id }}",
  "content": "{{ $json.mensagemEnviada }}",
  "messageId": "msg_{{ $now }}",
  "timestamp": "{{ $now }}"
}
```

---

## 🔧 Variáveis de Ambiente no n8n

Adicione no n8n (Settings → Environment Variables):

```env
CRM_URL=http://localhost:3001
```

(ou a URL do seu CRM em produção)

---

## 📝 Exemplo Completo de Payload

O n8n deve enviar para `POST /api/webhooks/n8n-sent`:

```json
{
  "contactId": "cm5bj9xyz000...",
  "content": "Olá! Como posso ajudar?",
  "messageId": "msg_1703434800000",
  "timestamp": "2024-12-24T11:00:00.000Z"
}
```

---

## ✅ Resultado

Após adicionar o node, quando o agente IA enviar uma mensagem:

1. ✅ Mensagem é enviada via Evolution API
2. ✅ n8n notifica o CRM
3. ✅ CRM salva no banco de dados
4. ✅ CRM emite via Socket.io
5. ✅ **Mensagem aparece na interface em tempo real!**

---

## 🧪 Teste Rápido

Depois de configurar, teste enviando uma mensagem pelo WhatsApp e veja se a resposta do agente IA aparece no CRM.

![Resultado esperado](C:/Users/Tutta/.gemini/antigravity/brain/a0c47ecf-e81f-454a-a5ae-b7b538bb7acf/uploaded_image_1766574613303.png)

A mensagem enviada pelo agente deve aparecer do lado direito (verde) na conversa.
