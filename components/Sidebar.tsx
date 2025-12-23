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
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeView: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings';
  onViewChange: (view: 'kanban' | 'chat' | 'reports' | 'scheduling' | 'broadcast' | 'contacts' | 'media' | 'new' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen w-14 bg-[#111B21] flex flex-col items-center py-4 space-y-6 flex-shrink-0 z-20 border-r border-gray-800">
      <div className="mb-2">
        {/* Logo simulation */}
        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-green-600 transition-colors" onClick={() => onViewChange('kanban')}>
          <span>CRM</span>
        </div>
      </div>

      <nav className="flex flex-col space-y-6 w-full items-center">
        <NavItem
          icon={<BarChart2 size={20} />}
          active={activeView === 'reports'}
          onClick={() => onViewChange('reports')}
          title="Relatórios"
        />

        <NavItem
          icon={<MessageSquare size={20} />}
          active={activeView === 'chat'}
          onClick={() => onViewChange('chat')}
          title="Conversas"
        />
        <NavItem
          icon={<Calendar size={20} />}
          active={activeView === 'scheduling'}
          onClick={() => onViewChange('scheduling')}
          title="Agendamentos"
        />

        <NavItem
          icon={<Users size={20} />}
          active={activeView === 'contacts'}
          onClick={() => onViewChange('contacts')}
          title="Contatos"
        />

      </nav>

      <div className="mt-auto pb-4 space-y-4 flex flex-col items-center relative" ref={menuRef}>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active = false, onClick, title }: { icon: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) => {
  return (
    <div
      onClick={onClick}
      title={title}
      className={`cursor-pointer p-2 rounded-lg transition-colors duration-200 ${active ? 'bg-[#00A884] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
    >
      {icon}
    </div>
  );
};

export default Sidebar;