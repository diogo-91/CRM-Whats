import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Configuração do CORS
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Frontend (Vite build)
app.use(express.static(path.join(__dirname, '../dist')));
// Servir arquivos de upload
app.use('/uploads', express.static(uploadDir));

// Configuração do Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-fallback';

// --- Middleware de Autenticação ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Helper Functions ---
async function getKanbanData() {
  const columns = await prisma.column.findMany({
    include: {
      items: {
        include: { tags: true },
        // Ordenar por updatedAt desc para que itens movidos/criados recentemente apareçam no topo
        orderBy: { updatedAt: 'desc' }
      }
    },
    // Ordenar colunas (definido na criação)
    orderBy: { order: 'asc' } // ou { order: 'asc' } se usarmos o campo order da coluna
  });

  // Mapear para garantir formato compatível com frontend se necessário (mas Prisma retorna objeto compatível praticamente)
  // O frontend espera: { id, title, count, items: [...] }
  // Prisma retorna: { id, title, items: [...], ... }
  // Precisamos adicionar 'count' manualmente ou o frontend usa items.length?
  // Frontend no Column.tsx usa column.items.length geralmente, ou column.count.
  // data.js tinha 'count'. Vamos verificar se frontend usa 'count'.
  // server/index.js original decrementava count.
  // Vamos computar count.
  return columns.map(col => ({
    ...col,
    count: col.items.length
  }));
}

// --- Rotas de Autenticação ---

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Dados incompletos' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(403).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no login' });
  }
});


// --- Rotas da API (Protegidas) ---

// 1. Rota de Teste
app.get('/', (req, res) => {
  res.send('ZapFlow API (Auth Secured) is running 🚀');
});

// Endpoint Temporário para Limpeza
app.get('/api/dangerous/cleanup-fakes', async (req, res) => {
  const FAKE_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'];
  try {
    await prisma.tag.deleteMany({ where: { contactId: { in: FAKE_IDS } } });
    const { count } = await prisma.contact.deleteMany({ where: { id: { in: FAKE_IDS } } });
    res.json({ message: `Limpeza concluída. ${count} contatos falsos removidos.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Obter todas as colunas e contatos (Kanban)
app.get('/api/kanban', authenticateToken, async (req, res) => {
  try {
    const data = await getKanbanData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// 3. Atualizar posição do card (Drag & Drop)
app.post('/api/kanban/move', authenticateToken, async (req, res) => {
  const { cardId, targetColId } = req.body;
  // sourceColId não é estritamente necessário se apenas mudamos o columnId do contato

  try {
    // Atualiza a coluna do contato
    await prisma.contact.update({
      where: { id: cardId },
      data: {
        columnId: targetColId,
        // O update atualiza 'updatedAt' automaticamente, jogando para o topo devido ao sort
      }
    });

    // Busca dados atualizados para emitir via socket
    const updatedData = await getKanbanData();
    io.emit('kanban:updated', updatedData);

    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao mover card' });
  }
});

// 4. Criar novo contato
app.post('/api/contacts', authenticateToken, async (req, res) => {
  const newContact = req.body;

  try {
    // Encontra coluna padrão (Leads ou a primeira)
    // Se o frontend mandar columnId, usamos. Senão, 'leads'.
    let targetColId = 'leads';
    const leadCol = await prisma.column.findUnique({ where: { id: 'leads' } });
    if (!leadCol) {
      const firstCol = await prisma.column.findFirst();
      if (firstCol) targetColId = firstCol.id;
    }

    // Cria no banco
    const created = await prisma.contact.create({
      data: {
        id: newContact.id, // Se frontend manda ID. Senão removemos para auto-gen. Frontend manda UUID?
        // O frontend parece mandar id (Step 21 data.js tem ids '1', '2'...).
        // Se frontend gerar UUID, ok. Se não, Prisma gera.
        // Vamos assumir que frontend pode não mandar
        name: newContact.name,
        phone: newContact.phone,
        avatarUrl: newContact.avatarUrl,
        status: newContact.status || 'offline',
        columnId: targetColId,
        // Tags precisarão ser criadas separadamente ou via nested write
        tags: {
          create: newContact.tags?.map(t => ({ color: t.color, label: t.label })) || []
        }
      },
      include: { tags: true }
    });

    const updatedData = await getKanbanData();
    io.emit('kanban:updated', updatedData);

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar contato' });
  }
});

// Endpoint de Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  // Retorna URL relativa
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, mimetype: req.file.mimetype });
});

import { evolutionService } from './services/evolutionService.js';

// ... existing code ...

// --- Rotas de Mensagem (WhatsApp) ---

// Obter histórico de mensagens
app.get('/api/contacts/:id/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { contactId: req.params.id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Enviar Mensagem
app.post('/api/messages', authenticateToken, async (req, res) => {
  const { contactId, content, mediaUrl, mediaType } = req.body;

  try {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return res.status(404).json({ error: 'Contato não encontrado' });

    // 1. Enviar via Evolution API
    if (mediaUrl) {
      // Construct full URL if it's a relative local upload
      const fullOne = mediaUrl.startsWith('http') ? mediaUrl : `${req.protocol}://${req.get('host')}${mediaUrl}`;
      await evolutionService.sendMedia(contact.phone, fullOne, mediaType, content);
    } else {
      await evolutionService.sendMessage(contact.phone, content);
    }

    // 2. Salvar no Banco
    const message = await prisma.message.create({
      data: {
        content: content || (mediaType === 'audio' ? 'Áudio enviado' : 'Mídia enviada'),
        fromMe: true,
        contactId: contact.id
        // TODO: add mediaUrl/mediaType columns to Message model if needed. 
        // For now storing text representation or relying on content.
        // Ideally we should update schema to store mediaUrl.
      }
    });

    // Atualizar timestamp do contato para subir no Kanban
    await prisma.contact.update({
      where: { id: contact.id },
      data: { updatedAt: new Date() }
    });

    // 3. Emitir para Frontend
    console.log('Emitindo mensagem via socket:', { ...message, contactId: contact.id });
    io.emit('message:new', { ...message, contactId: contact.id });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Webhook (Receber Mensagens da Evolution)
// URL para configurar na Evolution: http://SEU_IP_OU_TUNNEL:3001/api/webhooks/evolution
app.post('/api/webhooks/evolution', async (req, res) => {
  // Evolution envia payload com dados da mensagem
  console.log('--- EXECUTANDO WEBHOOK EVOLUTION ---');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (!req.body) {
    console.log('Webhook recebido sem corpo (body empty)');
    return res.sendStatus(200);
  }

  const { data, sender, eventType, event } = req.body;

  if (!data && !eventType && !event) {
    console.log('Payload do webhook inválido ou incompleto');
    return res.sendStatus(200);
  }

  // Verificar se é evento de mensagem recebida
  const currentEvent = eventType || event;
  if (currentEvent !== 'MESSAGES_UPSERT' && currentEvent !== 'messages.upsert') {
    return res.sendStatus(200); // Ignorar outros eventos por enquanto
  }

  const msgData = data.message || data;
  if (!msgData || data.key.fromMe) return res.sendStatus(200);

  try {
    const remoteJid = data.key.remoteJid; // ex: 553199999999@s.whatsapp.net
    const content = msgData.conversation || msgData.extendedTextMessage?.text;

    if (!content) return res.sendStatus(200);

    // Extrair número do JID
    const phone = remoteJid.split('@')[0];

    // 1. Achar ou criar contato
    let contact = await prisma.contact.findFirst({
      where: { phone: { contains: phone } } // Busca simplificada
    });

    if (!contact) {
      // Criar lead se não existir
      contact = await prisma.contact.create({
        data: {
          name: data.pushName || phone,
          phone: phone,
          columnId: 'leads', // Cai na coluna Leads
          avatarUrl: '', // Evolution pode mandar foto, implementar depois
          unreadCount: 1
        }
      });
    } else {
      // Atualizar contador de não lidas e mover para o topo
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          unreadCount: { increment: 1 },
          updatedAt: new Date() // Força reordenação no Kanban
        }
      });
    }

    // 2. Salvar Mensagem
    const message = await prisma.message.create({
      data: {
        content,
        fromMe: false,
        contactId: contact.id
      }
    });

    // 3. Emitir Socket
    io.emit('message:new', { ...message, contactId: contact.id });
    io.emit('kanban:updated', await getKanbanData());

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
});

// --- Socket.io Eventos ---
// --- Socket.io Eventos ---
io.on('connection', (socket) => {
  console.log('Um usuário conectou:', socket.id);

  socket.on('disconnect', () => {
    console.log('Usuário desconectou');
  });
});

// Iniciar Servidor
// --- Catch-all para Frontend (SPA) ---
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`SERVER (Auth) RODANDO NA PORTA ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});