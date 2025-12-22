import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Search,
  Play,
  BarChart,
  Edit3,
  Trash2,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import { Broadcast } from '../types';

// Mock Data
const INITIAL_BROADCASTS: Broadcast[] = [
  {
    id: '1',
    name: 'Promoção Black Friday',
    message: 'Olá {{nome}}, aproveite nossas ofertas exclusivas de Black Friday com até 50% de desconto! Responda "QUERO" para ver o catálogo.',
    targetTags: ['Leads', 'Clientes'],
    status: 'completed',
    scheduledDate: '2023-11-24 09:00',
    stats: { total: 1500, sent: 1500, delivered: 1480, read: 1200, replied: 350 }
  },
  {
    id: '2',
    name: 'Lembrete de Renovação',
    message: 'Oi {{nome}}, notamos que sua assinatura vence em breve. Renove hoje e ganhe 1 mês grátis!',
    targetTags: ['Clientes'],
    status: 'sending',
    stats: { total: 500, sent: 230, delivered: 200, read: 50, replied: 5 }
  },
  {
    id: '3',
    name: 'Boas Festas',
    message: 'Desejamos a você e sua família um Feliz Natal e um próspero Ano Novo! 🎄✨',
    targetTags: ['Todos'],
    status: 'scheduled',
    scheduledDate: '2023-12-24 10:00',
    stats: { total: 2000, sent: 0, delivered: 0, read: 0, replied: 0 }
  }
];

const BroadcastInterface: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(INITIAL_BROADCASTS);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedBroadcast(null);
    setFormName('');
    setFormMessage('');
    setFormTags([]);
  };

  const handleSelectBroadcast = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
    setIsCreating(false);
  };

  const handleSaveBroadcast = () => {
    const newBroadcast: Broadcast = {
      id: Date.now().toString(),
      name: formName || 'Nova Campanha',
      message: formMessage,
      targetTags: formTags,
      status: 'scheduled',
      scheduledDate: new Date().toLocaleString(),
      stats: { total: 100, sent: 0, delivered: 0, read: 0, replied: 0 }
    };
    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsCreating(false);
    setSelectedBroadcast(newBroadcast);
  };

  const toggleTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter(t => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const filteredBroadcasts = broadcasts.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#DFE3E5] overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-[350px] bg-white border-r border-gray-200 flex flex-col h-full z-10">
        <div className="p-4 border-b border-gray-200 bg-[#F0F2F5]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Disparos em Massa</h2>
                <button 
                    onClick={handleCreateNew}
                    className="bg-[#00A884] hover:bg-[#008f6f] text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="Nova Campanha"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar campanhas..." 
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredBroadcasts.map(broadcast => (
                <div 
                    key={broadcast.id}
                    onClick={() => handleSelectBroadcast(broadcast)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedBroadcast?.id === broadcast.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{broadcast.name}</h3>
                        <StatusBadge status={broadcast.status} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{broadcast.message}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Users size={12} /> {broadcast.stats.total}
                        </span>
                        <span>{broadcast.scheduledDate?.split(' ')[0]}</span>
                    </div>
                    
                    {/* Progress Mini Bar */}
                    {broadcast.status === 'sending' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                                className="bg-emerald-500 h-1.5 rounded-full" 
                                style={{ width: `${(broadcast.stats.sent / broadcast.stats.total) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#efeae2] relative flex flex-col h-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>
        
        {isCreating ? (
            <div className="z-10 flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                {/* Editor */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Nova Campanha</h3>
                        <button onClick={handleSaveBroadcast} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2">
                            <Send size={16} /> Agendar Disparo
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Campanha</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                                placeholder="Ex: Promoção de Natal"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Público Alvo (Tags)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['Leads', 'Clientes', 'Vip', 'Inativos', 'Novos'].map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formTags.includes(tag) ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                                <span className="text-xs text-gray-400">Variáveis: {'{{nome}}'}, {'{{telefone}}'}</span>
                             </div>
                             <div className="relative">
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none h-40 resize-none font-sans"
                                    placeholder="Digite sua mensagem aqui..."
                                    value={formMessage}
                                    onChange={(e) => setFormMessage(e.target.value)}
                                ></textarea>
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                     <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Inserir Imagem">
                                         <ImageIcon size={18} />
                                     </button>
                                </div>
                             </div>
                             <p className="text-xs text-gray-500 mt-2 text-right">{formMessage.length} caracteres</p>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="w-[320px] hidden lg:flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 delay-150">
                    <div className="mockup-phone border-gray-800 border-[10px] rounded-[2.5rem] h-[600px] w-[300px] bg-black shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-20"></div>
                        <div className="w-full h-full bg-[#efeae2] relative flex flex-col">
                             <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>
                             
                             {/* Phone Header */}
                             <div className="bg-[#008069] h-16 w-full flex items-center px-4 pt-4 z-10 text-white shadow-sm">
                                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                                <div className="flex-1">
                                    <div className="h-2 w-20 bg-white/40 rounded mb-1"></div>
                                    <div className="h-1.5 w-12 bg-white/40 rounded"></div>
                                </div>
                             </div>

                             {/* Message Bubble */}
                             <div className="p-4 flex-1 overflow-y-auto">
                                 {formMessage && (
                                    <div className="flex justify-end mb-4">
                                        <div className="bg-[#E7FFDB] p-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%] text-[13px] text-gray-800 relative pb-5">
                                            <p className="whitespace-pre-line leading-relaxed">
                                                {formMessage.replace('{{nome}}', 'João Silva').replace('{{telefone}}', '(31) 9999-9999')}
                                            </p>
                                            <span className="text-[10px] text-gray-400 absolute bottom-1 right-2 flex items-center gap-1">
                                                10:30 <CheckCircle2 size={10} className="text-blue-500" />
                                            </span>
                                        </div>
                                    </div>
                                 )}
                             </div>
                             
                             {/* Phone Footer */}
                             <div className="h-12 bg-[#F0F2F5] w-full flex items-center px-2 z-10">
                                 <div className="w-full h-8 bg-white rounded-full"></div>
                             </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-4 font-medium">Pré-visualização</p>
                </div>
            </div>
        ) : selectedBroadcast ? (
            <div className="z-10 flex-1 p-6 overflow-y-auto">
                {/* Stats Dashboard for Campaign */}
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* Header Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{selectedBroadcast.name}</h2>
                                <StatusBadge status={selectedBroadcast.status} />
                            </div>
                            <p className="text-gray-500 text-sm mb-4">Agendado para: {selectedBroadcast.scheduledDate}</p>
                            <div className="flex gap-2">
                                {selectedBroadcast.targetTags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {selectedBroadcast.status !== 'completed' && selectedBroadcast.status !== 'sending' && (
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                                    <Edit3 size={20} />
                                </button>
                            )}
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Funnel Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatBox 
                            label="Total Contatos" 
                            value={selectedBroadcast.stats.total} 
                            icon={<Users size={20} className="text-blue-500" />} 
                            bg="bg-blue-50"
                        />
                        <StatBox 
                            label="Entregues" 
                            value={selectedBroadcast.stats.delivered} 
                            subVal={`${Math.round((selectedBroadcast.stats.delivered / selectedBroadcast.stats.total) * 100)}%`}
                            icon={<CheckCircle2 size={20} className="text-emerald-500" />} 
                            bg="bg-emerald-50"
                        />
                        <StatBox 
                            label="Lidos" 
                            value={selectedBroadcast.stats.read} 
                            subVal={`${Math.round((selectedBroadcast.stats.read / selectedBroadcast.stats.total) * 100)}%`}
                            icon={<CheckCircle2 size={20} className="text-blue-400" />} 
                            bg="bg-blue-50"
                        />
                         <StatBox 
                            label="Respostas" 
                            value={selectedBroadcast.stats.replied} 
                            subVal={`${Math.round((selectedBroadcast.stats.replied / selectedBroadcast.stats.total) * 100)}%`}
                            icon={<CheckCircle2 size={20} className="text-purple-500" />} 
                            bg="bg-purple-50"
                        />
                    </div>

                    {/* Progress Visual */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <BarChart size={20} /> Progresso do Disparo
                        </h3>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                                    Concluído
                                </span>
                                </div>
                                <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-emerald-600">
                                    {Math.round((selectedBroadcast.stats.sent / selectedBroadcast.stats.total) * 100)}%
                                </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
                                <div style={{ width: `${(selectedBroadcast.stats.sent / selectedBroadcast.stats.total) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000 ease-out"></div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                             <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                 <p className="text-xs text-gray-500">Mensagem Original:</p>
                                 <p className="text-sm text-gray-800 italic mt-1">"{selectedBroadcast.message}"</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center justify-center text-gray-400">
                                 <p className="text-xs">Visualização Gráfica Indisponível</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 z-10">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                     <Send size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-700 mb-2">Selecione uma Campanha</h2>
                 <p className="text-gray-500 max-w-md">
                     Escolha uma campanha do histórico ao lado para ver detalhes ou inicie um novo disparo em massa.
                 </p>
                 <button onClick={handleCreateNew} className="mt-6 bg-[#00A884] text-white px-6 py-2.5 rounded-lg hover:bg-[#008f6f] shadow-sm transition-transform hover:scale-105">
                     Criar Novo Disparo
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatusBadge = ({ status }: { status: string }) => {
    const config = {
        draft: { color: 'bg-gray-100 text-gray-600', icon: <Edit3 size={12} />, label: 'Rascunho' },
        scheduled: { color: 'bg-blue-100 text-blue-700', icon: <Clock size={12} />, label: 'Agendado' },
        sending: { color: 'bg-yellow-100 text-yellow-700', icon: <Play size={12} />, label: 'Enviando' },
        completed: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} />, label: 'Concluído' },
    }[status] || { color: 'bg-gray-100', icon: null, label: status };

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${config.color}`}>
            {config.icon} {config.label}
        </span>
    );
};

const StatBox = ({ label, value, icon, bg, subVal }: any) => (
    <div className={`p-4 rounded-xl border border-gray-100 bg-white flex items-center justify-between`}>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h4 className="text-xl font-bold text-gray-800">{value}</h4>
                {subVal && <span className="text-xs font-medium text-gray-400">{subVal}</span>}
            </div>
        </div>
        <div className={`p-2 rounded-lg ${bg}`}>
            {icon}
        </div>
    </div>
);

export default BroadcastInterface;