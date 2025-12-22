import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Column from './components/Column';
import ChatInterface from './components/ChatInterface';
import ReportsInterface from './components/ReportsInterface';
import SchedulingInterface from './components/SchedulingInterface';
import BroadcastInterface from './components/BroadcastInterface';
import ContactsInterface from './components/ContactsInterface';
import MediaInterface from './components/MediaInterface';
import NewInterface from './components/NewInterface';
import SettingsInterface from './components/SettingsInterface';
import LoginInterface from './components/LoginInterface';
import { INITIAL_DATA } from './constants';
import { Column as ColumnType, Contact } from './types';
import { Search, Wifi, WifiOff } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// URL do Backend
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

function AppContent() {
  const { isAuthenticated, token, socket } = useAuth();
  const [currentView, setCurrentView] = useState<'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings'>('kanban');
  const [columns, setColumns] = useState<ColumnType[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; sourceColId: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView('chat');
  };

  // --- Integração com Backend e Socket.io ---
  useEffect(() => {
    if (!isAuthenticated || !socket) return;

    // 1. Ouvir eventos do Socket
    const onConnect = () => {
      console.log('Conectado ao WebSocket!');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Desconectado do WebSocket');
      setIsConnected(false);
    };

    const onKanbanUpdate = (updatedData: ColumnType[]) => {
      setColumns(updatedData);
    };

    // Verificar status inicial
    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('connect_error', onDisconnect);
    socket.on('disconnect', onDisconnect);
    socket.on('kanban:updated', onKanbanUpdate);

    // 2. Buscar dados iniciais da API
    fetch(`${API_URL}/api/kanban`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 403 || res.status === 401) throw new Error('Auth Error');
        if (!res.ok) throw new Error('Falha ao buscar dados');
        return res.json();
      })
      .then(data => setColumns(data))
      .catch(err => {
        console.log('Erro ao buscar dados ou Backend offline:', err);
      });

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onDisconnect);
      socket.off('disconnect', onDisconnect);
      socket.off('kanban:updated', onKanbanUpdate);
    };
  }, [isAuthenticated, token, socket]);

  const handleDragStart = (cardId: string, sourceColId: string) => {
    setDraggedCard({ cardId, sourceColId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColId: string) => {
    if (!draggedCard) return;
    const { cardId, sourceColId } = draggedCard;

    if (sourceColId === targetColId) {
      setDraggedCard(null);
      return;
    }

    // Optimistic Update
    const oldColumns = [...columns];

    setColumns((prevColumns) => {
      const newColumns = JSON.parse(JSON.stringify(prevColumns));
      const sourceColIndex = newColumns.findIndex((col: ColumnType) => col.id === sourceColId);
      const targetColIndex = newColumns.findIndex((col: ColumnType) => col.id === targetColId);

      const sourceCol = newColumns[sourceColIndex];
      const targetCol = newColumns[targetColIndex];

      const cardIndex = sourceCol.items.findIndex((item: any) => item.id === cardId);
      const card = sourceCol.items[cardIndex];

      sourceCol.items.splice(cardIndex, 1);
      // sourceCol.count--; // Agora count é calculado no backend ou via length, mas otimista pode manter

      targetCol.items.unshift(card);
      // targetCol.count++;

      return newColumns;
    });

    if (isConnected) {
      fetch(`${API_URL}/api/kanban/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardId, sourceColId, targetColId })
      }).catch(err => {
        console.error('Erro ao sincronizar movimento:', err);
        setColumns(oldColumns);
        alert('Erro ao mover contato. Verifique sua conexão.');
      });
    }

    setDraggedCard(null);
  };

  const filteredColumns = useMemo(() => {
    if (!searchTerm) return columns;
    return columns.map((col) => ({
      ...col,
      items: col.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone.includes(searchTerm)
      ),
    }));
  }, [columns, searchTerm]);

  if (!isAuthenticated) {
    return <LoginInterface />;
  }

  return (
    <div className="flex h-screen bg-[#DFE3E5] overflow-hidden font-sans">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {currentView === 'kanban' ? (
          <>
            <div className="h-14 bg-[#F0F2F5] border-b border-gray-300 flex items-center px-4 justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-700">Kanban CRM</h1>
                <div title={isConnected ? "Conectado ao Servidor" : "Modo Offline (Dados Locais)"} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span className="font-medium">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar contatos..."
                  className="pl-9 pr-4 py-1.5 rounded-full bg-white border border-gray-300 text-sm focus:outline-none focus:border-emerald-500 w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
              <div className="flex h-full space-x-2">
                {filteredColumns.map((column) => (
                  <div
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(column.id)}
                    className="h-full"
                  >
                    <Column
                      column={column}
                      onDragStart={handleDragStart}
                      onContactClick={handleContactClick}
                    />
                  </div>
                ))}
                <div className="w-4 flex-shrink-0"></div>
              </div>
            </div>

            <div className="fixed bottom-6 right-6 z-50 animate-bounce-in pointer-events-none">
              <div className="bg-[#1f3b4d] text-white p-3 rounded-lg shadow-xl flex flex-col items-center cursor-pointer border-2 border-white/10 pointer-events-auto hover:scale-105 transition-transform transform origin-bottom-right">
                <span className="text-xl font-bold">+10.000</span>
                <span className="text-[10px] uppercase tracking-wider mb-1">Usuários</span>
                <div className="flex space-x-0.5 text-yellow-400 mb-1">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <div className="text-xs font-serif text-gray-300">Google Reviews</div>
              </div>
            </div>
          </>
        ) : currentView === 'chat' ? (
          <ChatInterface
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        ) : currentView === 'reports' ? (
          <ReportsInterface />
        ) : currentView === 'scheduling' ? (
          <SchedulingInterface />
        ) : currentView === 'broadcast' ? (
          <BroadcastInterface />
        ) : currentView === 'contacts' ? (
          <ContactsInterface />
        ) : currentView === 'media' ? (
          <MediaInterface />
        ) : currentView === 'new' ? (
          <NewInterface onNavigate={setCurrentView} />
        ) : (
          <SettingsInterface />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;