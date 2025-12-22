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
            <MessageSquare size={18} fill="currentColor" />
         </div>
      </div>

      <nav className="flex flex-col space-y-6 w-full items-center">
        <NavItem 
            icon={<MessageSquare size={20} />} 
            active={activeView === 'chat'} 
            onClick={() => onViewChange('chat')}
            title="Conversas"
        />
        <NavItem 
            icon={<LayoutDashboard size={20} />} 
            active={activeView === 'kanban'} 
            onClick={() => onViewChange('kanban')}
            title="Kanban"
        />
        <NavItem 
            icon={<BarChart2 size={20} />} 
            active={activeView === 'reports'} 
            onClick={() => onViewChange('reports')} 
            title="Relatórios" 
        />
        <NavItem 
            icon={<Calendar size={20} />} 
            active={activeView === 'scheduling'} 
            onClick={() => onViewChange('scheduling')} 
            title="Agendamentos" 
        />
        <NavItem 
            icon={<Send size={20} />} 
            active={activeView === 'broadcast'} 
            onClick={() => onViewChange('broadcast')} 
            title="Disparos" 
        />
        <NavItem 
            icon={<Users size={20} />} 
            active={activeView === 'contacts'} 
            onClick={() => onViewChange('contacts')} 
            title="Contatos" 
        />
        <NavItem 
            icon={<ImageIcon size={20} />} 
            active={activeView === 'media'} 
            onClick={() => onViewChange('media')} 
            title="Mídia" 
        />
        <NavItem 
            icon={<PlusCircle size={20} />} 
            active={activeView === 'new'} 
            onClick={() => onViewChange('new')} 
            title="Novo" 
        />
      </nav>

      <div className="mt-auto pb-4 space-y-4 flex flex-col items-center relative" ref={menuRef}>
        
        {/* Utility Menu Popover */}
        {isMenuOpen && (
            <div className="absolute left-12 bottom-14 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-left-4 origin-bottom-left">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Utilidades</p>
                </div>
                
                <div className="p-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors">
                        <HelpCircle size={16} className="text-blue-500" /> 
                        <span>Central de Ajuda</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors">
                        <Keyboard size={16} className="text-purple-500" /> 
                        <span>Atalhos de Teclado</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors">
                        <Moon size={16} className="text-gray-500" /> 
                        <div className="flex-1 flex justify-between items-center">
                            <span>Modo Escuro</span>
                            <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-0 top-0 border border-gray-300"></div>
                            </div>
                        </div>
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors">
                        <Zap size={16} className="text-yellow-500" /> 
                        <span>Novidades da Versão</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto">NEW</span>
                    </button>
                    <a href="#" className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors group">
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-emerald-500" /> 
                        <span>Documentação API</span>
                    </a>
                </div>
            </div>
        )}

        {/* The Green Menu Button */}
        <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-8 h-8 rounded flex items-center justify-center text-white cursor-pointer transition-all shadow-sm
                ${isMenuOpen ? 'bg-emerald-700 scale-95 ring-2 ring-emerald-500 ring-offset-1 ring-offset-[#111B21]' : 'bg-emerald-600 hover:bg-emerald-500'}
            `}
        >
            <Menu size={16} />
        </div>

        <NavItem 
            icon={<Settings size={20} />} 
            active={activeView === 'settings'} 
            onClick={() => onViewChange('settings')} 
            title="Configurações" 
        />
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