import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  BarChart2,
  Calendar,
  Send,
  Users,
  Image as ImageIcon,
  Settings,
  PlusCircle,
  Menu,
  HelpCircle,
  Keyboard,
  Moon,
  ExternalLink,
  Zap,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeView: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings';
  onViewChange: (view: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen w-64 bg-[#111B21] flex flex-col py-6 px-4 flex-shrink-0 z-20 border-r border-gray-800">
      {/* Logo and Clock */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg mb-3">
          <span>CRM</span>
        </div>
        <div className="text-gray-400 text-xs">
          <div className="font-medium text-gray-300">{formatDate(currentTime)}</div>
          <div className="text-emerald-500 font-bold text-sm mt-0.5">{formatTime(currentTime)}</div>
        </div>
      </div>

      <nav className="flex flex-col space-y-2 flex-1">
        <NavItem
          icon={<BarChart2 size={20} />}
          label="Relatórios"
          active={activeView === 'reports'}
          onClick={() => onViewChange('reports')}
        />

        <NavItem
          icon={<MessageSquare size={20} />}
          label="Conversas"
          active={activeView === 'chat'}
          onClick={() => onViewChange('chat')}
        />

        <NavItem
          icon={<Calendar size={20} />}
          label="Agendamentos"
          active={activeView === 'scheduling'}
          onClick={() => onViewChange('scheduling')}
        />

        <NavItem
          icon={<Users size={20} />}
          label="Contatos"
          active={activeView === 'contacts'}
          onClick={() => onViewChange('contacts')}
        />
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors group"
        >
          <LogOut size={20} className="group-hover:text-red-500" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
        ? 'bg-[#00A884] text-white shadow-lg shadow-emerald-900/50'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default Sidebar;