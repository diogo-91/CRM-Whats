import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  BarChart2,
  Calendar,
  Users,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings';
  onViewChange: (view: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings') => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const datePart = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timePart = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${datePart} - ${timePart}`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 
        w-64 bg-[#111B21] flex flex-col py-6 px-4 flex-shrink-0 z-50 border-r border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo and Clock */}
        <div className="mb-8 pl-1 flex justify-between items-start">
          <div>
            <h1 className="text-white font-bold text-lg mb-1">CRM - WHATSAPP</h1>
            <p className="text-gray-400 text-[10px] font-medium capitalize whitespace-nowrap overflow-hidden text-ellipsis">
              {formatDateTime(currentTime)}
            </p>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col space-y-2 flex-1">
          <NavItem
            icon={<BarChart2 size={20} />}
            label="Relatórios"
            active={activeView === 'reports'}
            onClick={() => { onViewChange('reports'); onClose(); }}
          />

          <NavItem
            icon={<MessageSquare size={20} />}
            label="Conversas"
            active={activeView === 'chat'}
            onClick={() => { onViewChange('chat'); onClose(); }}
          />

          <NavItem
            icon={<Calendar size={20} />}
            label="Agendamentos"
            active={activeView === 'scheduling'}
            onClick={() => { onViewChange('scheduling'); onClose(); }}
          />

          <NavItem
            icon={<Users size={20} />}
            label="Contatos"
            active={activeView === 'contacts'}
            onClick={() => { onViewChange('contacts'); onClose(); }}
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
    </>
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