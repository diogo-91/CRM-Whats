import React, { useState } from 'react';
import { 
  MessageSquare, 
  UserPlus, 
  Calendar, 
  Send, 
  ArrowRight, 
  StickyNote,
  Phone,
  Zap
} from 'lucide-react';

interface NewInterfaceProps {
    onNavigate: (view: any) => void;
}

const NewInterface: React.FC<NewInterfaceProps> = ({ onNavigate }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');

  const handleQuickChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (phoneNumber) {
          // In a real app, this would start a chat session
          alert(`Iniciando conversa com ${phoneNumber}`);
          onNavigate('chat');
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#DFE3E5] overflow-y-auto">
        <div className="flex-1 max-w-5xl mx-auto w-full p-8">
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Criação</h1>
                <p className="text-gray-500">O que você gostaria de fazer hoje?</p>
            </div>

            {/* Quick Chat Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-bottom-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Iniciar Conversa Rápida</h2>
                        <p className="text-sm text-gray-500 mb-4">Envie uma mensagem para um número sem precisar adicionar aos contatos.</p>
                        
                        <form onSubmit={handleQuickChat} className="flex gap-3 max-w-lg">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">+55</span>
                                <input 
                                    type="tel" 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    placeholder="(00) 00000-0000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="bg-[#00A884] hover:bg-[#008f6f] text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                Iniciar <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ActionCard 
                    title="Novo Contato" 
                    description="Adicione um cliente à sua base." 
                    icon={<UserPlus size={24} />} 
                    color="text-blue-500" 
                    bg="bg-blue-50"
                    onClick={() => onNavigate('contacts')}
                />
                <ActionCard 
                    title="Agendar Reunião" 
                    description="Marque um compromisso no calendário." 
                    icon={<Calendar size={24} />} 
                    color="text-purple-500" 
                    bg="bg-purple-50"
                    onClick={() => onNavigate('scheduling')}
                />
                <ActionCard 
                    title="Criar Disparo" 
                    description="Envie mensagens em massa." 
                    icon={<Send size={24} />} 
                    color="text-orange-500" 
                    bg="bg-orange-50"
                    onClick={() => onNavigate('broadcast')}
                />
            </div>

            {/* Quick Note Area */}
            <div className="bg-[#fff9c4] rounded-2xl p-6 shadow-sm border border-yellow-200 relative group animate-in slide-in-from-bottom-8">
                <div className="flex items-center gap-2 text-yellow-800 mb-3 font-bold">
                    <StickyNote size={20} />
                    <h3>Bloco de Notas Rápido</h3>
                </div>
                <textarea 
                    className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-700 placeholder-yellow-700/50 min-h-[100px]"
                    placeholder="Digite uma anotação rápida aqui..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs font-bold text-yellow-800 hover:text-yellow-900 uppercase">Salvar Nota</button>
                </div>
            </div>

        </div>
    </div>
  );
};

const ActionCard = ({ title, description, icon, color, bg, onClick }: any) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
    >
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
    </div>
);

export default NewInterface;