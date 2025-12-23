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
async function getKanbanData(filters = {}) {
  const itemWhere = {};

  if (filters.startDate) {
    itemWhere.createdAt = {
      gte: new Date(filters.startDate)
    };
  }

  if (filters.endDate) {
    itemWhere.createdAt = {
      ...itemWhere.createdAt,
      lte: new Date(filters.endDate)
    };
  }

  const columns = await prisma.column.findMany({
    include: {
      items: {
        where: itemWhere,
        include: { tags: true },
        // Ordenar por updatedAt desc para que itens movidos/criados recentemente apareçam no topo
        orderBy: { updatedAt: 'desc' }
      }
    },
    // Ordenar colunas (definido na criação)
    orderBy: { order: 'asc' } // ou { order: 'asc' } se usarmos o campo order da coluna
  });

  return columns.map(col => ({
    ...col,
    count: col.items.length
  }));
}

// ... (Authentication Routes skip) ...

// ... (Protected Routes) ...

// 2. Obter todas as colunas e contatos (Kanban)
app.get('/api/kanban', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getKanbanData({ startDate, endDate });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// ... (Kanban move skip) ...

// ... (Create Contact etc skip) ...

// ... (Evolution Service skip) ...

// 6. Get messages for a contact
// ... (skip)

// 6.5 Mark messages as read
// ... (skip)

// 7. Get total message count (for dashboard)
app.get('/api/messages/count', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: endDate ? new Date(endDate) : undefined
      };
    }

    const count = await prisma.message.count({ where });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao contar mensagens' });
  }
});

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
    const { startDate, endDate } = req.query;
    const data = await getKanbanData({ startDate, endDate });
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

// 6. Get messages for a contact
app.get('/api/contacts/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { contactId: id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// 6.5 Mark messages as read
app.post('/api/contacts/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.update({
      where: { id },
      data: { unreadCount: 0 }
    });
    // Optionally update messages status to 'READ' if you have that field
    // await prisma.message.updateMany({
    //   where: { contactId: id, fromMe: false, status: { not: 'READ' } },
    //   data: { status: 'READ' }
    // });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Erro ao marcar como lido' });
  }
});

// 7. Get total message count (for dashboard)
app.get('/api/messages/count', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: endDate ? new Date(endDate) : undefined
      };
    }

    const count = await prisma.message.count({ where });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao contar mensagens' });
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
    // 2. Salvar no Banco
    const message = await prisma.message.create({
      data: {
        content: content || (mediaType === 'audio' ? 'Áudio enviado' : 'Mídia enviada'),
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        fromMe: true,
        contactId: contact.id
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

    let content = msgData.conversation || msgData.extendedTextMessage?.text;
    let mediaUrl = null;
    let mediaType = null;

    // Detecção básica de tipos de mídia (Evolution API v2)
    if (msgData.imageMessage) {
      mediaType = 'image';
      content = msgData.imageMessage.caption || 'Imagem recebida';
      // Tenta usar a URL se disponível (pode não funcionar se for URL interna do WA sem tratamento)
      // O ideal é a Evolution estar configurada para salvar e retornar URL pública ou Base64
      mediaUrl = msgData.imageMessage.url;
    } else if (msgData.videoMessage) {
      mediaType = 'video';
      content = msgData.videoMessage.caption || 'Vídeo recebido';
      mediaUrl = msgData.videoMessage.url;
    } else if (msgData.audioMessage) {
      mediaType = 'audio';
      content = 'Áudio recebido';
      mediaUrl = msgData.audioMessage.url;
    } else if (msgData.documentMessage) {
      mediaType = 'document';
      content = msgData.documentMessage.title || 'Documento recebido';
      mediaUrl = msgData.documentMessage.url;
    }

    if (!content && !mediaUrl) return res.sendStatus(200);

    // Extrair número do JID
    const phone = remoteJid.split('@')[0];

    // 1. Achar ou criar contato
    let contact = await prisma.contact.findFirst({
      where: { phone: { contains: phone } } // Busca simplificada
    });

    // Tentar buscar foto de perfil se não tiver ou se for novo
    let profilePicUrl = '';
    try {
      profilePicUrl = await evolutionService.fetchProfilePictureUrl(phone);
    } catch (err) {
      console.log('Falha ao buscar foto de perfil:', err.message);
    }

    if (!contact) {
      // Criar lead se não existir
      contact = await prisma.contact.create({
        data: {
          name: data.pushName || phone, // Usa o nome do WhatsApp ou o número
          phone: phone,
          columnId: 'leads', // Cai na coluna Leads
          avatarUrl: profilePicUrl || '',
          unreadCount: 1,
          status: 'online' // Assume online ao receber msg
        }
      });
    } else {
      // Atualizar contador de não lidas e mover para o topo
      // Opcional: Atualizar foto se mudou. Por enquanto atualizamos se estiver vazia.
      const updateData = {
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
        status: 'online'
      };
      if (profilePicUrl && !contact.avatarUrl) {
        updateData.avatarUrl = profilePicUrl;
      }

      await prisma.contact.update({
        where: { id: contact.id },
        data: updateData
      });
    }

    // 2. Salvar Mensagem
    const message = await prisma.message.create({
      data: {
        content: content || 'Mídia',
        mediaUrl: mediaUrl,
        mediaType: mediaType,
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

// --- Google Calendar Integration ---
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Rota para iniciar Auth
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: JSON.stringify({ token: req.query.token }) // Passar JWT do usuário para vincular no callback
  });
  res.redirect(url);
});

// Callback do Google
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query; // State contém o token JWT do usuário

  if (!state) return res.status(400).send('State missing (Auth Token necessary)');

  try {
    const { token: userJwt } = JSON.parse(state);

    // Verificar quem é o usuário
    let userId;
    try {
      const decoded = jwt.verify(userJwt, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {
      return res.status(401).send('Invalid User Token');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Salvar tokens no usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? tokens.expiry_date.toString() : null
      }
    });

    // Redirecionar de volta para o frontend
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${req.protocol}://${req.get('host')}/`
      : `${req.protocol}://${req.get('host').replace(':3001', ':5173')}/`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    res.status(500).send('Authentication failed');
  }
});

// Helper para pegar cliente autenticado
async function getGoogleClient(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.googleAccessToken) return null;

  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_type: 'offline',
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry ? parseInt(user.googleTokenExpiry) : null
  });

  // Auto refresh if needed (googleapis handles this if refresh_token is present)
  return client;
}

// Rota para listar eventos
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const client = await getGoogleClient(req.user.id);
    if (!client) return res.status(401).json({ error: 'Google Calendar not connected' });

    const { startDate } = req.query;
    // Default to 'now' if no startDate provided, OR allow fetching past events if we are doing reports?
    // If startDate is provided, use it. If not, maybe use 'now' as default or a fixed past date?
    // For scheduling interface, we usually want future, but maybe seeing the past is good.
    // Let's default to 'now' if no param, to preserve existing behavior for SchedulingInterface if it doesn't send params.
    // Wait, SchedulingInterface might want to see past appointments too if user navigates back?
    // Current SchedulingInterface doesn't send params and relies on default.
    // Let's set default timeMin to 1 month ago? Or keeping 'now' is safer for performance if we only care about upcoming?
    // I will use startDate if provided, else new Date().

    const timeMin = startDate ? new Date(startDate).toISOString() : (new Date()).toISOString();

    const calendar = google.calendar({ version: 'v3', auth: client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      maxResults: 50, // Increased from 20 to allow more data for reports
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description,
      location: event.location,
      status: event.status
    }));

    res.json(events);
  } catch (error) {
    console.error('Google Calendar API Error:', error);
    if (error.code === 401) {
      // Token expired or revoked
      return res.status(401).json({ error: 'Token expired', needsAuth: true });
    }
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Rota para criar evento
app.post('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const client = await getGoogleClient(req.user.id);
    if (!client) return res.status(401).json({ error: 'Google Calendar not connected' });

    const { title, description, startTime, endTime } = req.body;

    const calendar = google.calendar({ version: 'v3', auth: client });
    const event = {
      summary: title,
      description: description,
      start: { dateTime: new Date(startTime).toISOString() }, // '2023-01-01T10:00:00Z'
      end: { dateTime: new Date(endTime).toISOString() },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

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