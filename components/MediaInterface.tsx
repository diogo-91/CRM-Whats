import React, { useState } from 'react';
import {
    Image as ImageIcon,
    FileText,
    Music,
    Video,
    Upload,
    Search,
    Grid,
    List,
    MoreVertical,
    Trash2,
    Download,
    Filter,
    CheckCircle2
} from 'lucide-react';

interface MediaItem {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'audio';
    url: string;
    size: string;
    date: string;
    dimensions?: string; // for images/videos
}

// Mock Data
const INITIAL_MEDIA: MediaItem[] = [
    { id: '1', name: 'Proposta_Comercial.pdf', type: 'document', url: '', size: '2.4 MB', date: '01/12/2023' },
    { id: '2', name: 'Banner_Promo_Natal.png', type: 'image', url: 'https://picsum.photos/400/300?random=10', size: '1.2 MB', date: '02/12/2023', dimensions: '1920x1080' },
    { id: '3', name: 'Audio_Cliente_01.mp3', type: 'audio', url: '', size: '450 KB', date: '02/12/2023' },
    { id: '4', name: 'Demo_Produto_v2.mp4', type: 'video', url: '', size: '15.6 MB', date: '03/12/2023' },
    { id: '5', name: 'Contrato_Assinado.pdf', type: 'document', url: '', size: '1.1 MB', date: '04/12/2023' },
    { id: '6', name: 'Foto_Perfil_Nova.jpg', type: 'image', url: 'https://picsum.photos/400/300?random=11', size: '3.5 MB', date: '05/12/2023', dimensions: '1024x1024' },
    { id: '7', name: 'Catalogo_2024.pdf', type: 'document', url: '', size: '8.4 MB', date: '06/12/2023' },
    { id: '8', name: 'Logo_Vetorial.svg', type: 'image', url: 'https://picsum.photos/400/300?random=12', size: '200 KB', date: '07/12/2023' },
    { id: '9', name: 'Tutorial_Sistema.mp4', type: 'video', url: '', size: '45.2 MB', date: '08/12/2023' },
    { id: '10', name: 'Recibo_Pagamento.pdf', type: 'document', url: '', size: '150 KB', date: '08/12/2023' },
];

const MediaInterface: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'document' | 'audio'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const filteredMedia = mediaItems.filter(item => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const toggleSelect = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDeleteSelected = () => {
        if (confirm(`Excluir ${selectedItems.length} arquivos selecionados?`)) {
            setMediaItems(mediaItems.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
        }
    };

    const handleUpload = () => {
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            const newFile: MediaItem = {
                id: Date.now().toString(),
                name: `Upload_Novo_${mediaItems.length + 1}.${activeTab === 'image' ? 'jpg' : 'pdf'}`,
                type: activeTab === 'all' ? 'document' : activeTab,
                url: activeTab === 'image' ? 'https://picsum.photos/400/300?random=' + Date.now() : '',
                size: '0 KB',
                date: new Date().toLocaleDateString('pt-BR')
            };
            setMediaItems([newFile, ...mediaItems]);
            setIsUploading(false);
        }, 1500);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon size={24} className="text-purple-500" />;
            case 'video': return <Video size={24} className="text-pink-500" />;
            case 'audio': return <Music size={24} className="text-yellow-500" />;
            default: return <FileText size={24} className="text-blue-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#DFE3E5]">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Galeria de Mídia</h1>
                    <p className="text-sm text-gray-500">Gerencie arquivos, documentos e imagens ({mediaItems.length} total)</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar arquivos..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-[#00A884] hover:bg-[#008f6f] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Upload size={18} />
                        )}
                        <span className="hidden md:inline">{isUploading ? 'Enviando...' : 'Carregar'}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <div className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Bibliotecas</h3>
                    <div className="space-y-1">
                        {[
                            { id: 'all', label: 'Todos os Arquivos', icon: <Grid size={18} /> },
                            { id: 'image', label: 'Imagens', icon: <ImageIcon size={18} /> },
                            { id: 'document', label: 'Documentos', icon: <FileText size={18} /> },
                            { id: 'video', label: 'Vídeos', icon: <Video size={18} /> },
                            { id: 'audio', label: 'Áudios', icon: <Music size={18} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {tab.id === 'all' ? mediaItems.length : mediaItems.filter(i => i.type === tab.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-blue-800">Armazenamento</span>
                                <span className="text-xs text-blue-600">75%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <p className="text-[10px] text-blue-500">7.5 GB de 10 GB usados</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F2F5]">
                    {/* Toolbar */}
                    <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {selectedItems.length > 0 ? (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2">
                                    <span className="font-semibold text-emerald-600">{selectedItems.length} selecionado(s)</span>
                                    <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline">
                                        <Trash2 size={14} /> Excluir
                                    </button>
                                    <button onClick={() => setSelectedItems([])} className="text-gray-400 hover:text-gray-600 text-xs">Cancelar</button>
                                </div>
                            ) : (
                                <span>Exibindo {filteredMedia.length} arquivos</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content Grid/List */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <Search size={32} />
                                </div>
                                <p>Nenhum arquivo encontrado.</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col space-y-2"}>
                                {filteredMedia.map(item => (
                                    <MediaCard
                                        key={item.id}
                                        item={item}
                                        viewMode={viewMode}
                                        selected={selectedItems.includes(item.id)}
                                        onToggle={() => toggleSelect(item.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MediaCardProps {
    item: MediaItem;
    viewMode: 'grid' | 'list';
    selected: boolean;
    onToggle: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, viewMode, selected, onToggle }) => {

    if (viewMode === 'list') {
        return (
            <div
                onClick={onToggle}
                className={`flex items-center p-3 bg-white rounded-lg border hover:shadow-sm cursor-pointer transition-all ${selected ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}
            >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        getIconComponent(item.type)
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.size} • {item.date}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded">{item.type}</span>
                    {selected && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onToggle}
            className={`group bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md relative ${selected ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-gray-200'}`}
        >
            <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="transform scale-150 text-gray-400 group-hover:text-gray-600 transition-colors">
                        {getIconComponent(item.type)}
                    </div>
                )}

                {/* Selection Overlay */}
                <div className={`absolute inset-0 bg-black/10 transition-opacity flex items-start justify-end p-2 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-emerald-500 border-emerald-500' : 'bg-white/80 border-gray-400'}`}>
                        {selected && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                    <h4 className="text-xs font-medium text-gray-800 truncate pr-2" title={item.name}>{item.name}</h4>
                    <MoreVertical size={14} className="text-gray-400 hover:text-gray-600" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>{item.size}</span>
                    <span>{item.date}</span>
                </div>
            </div>
        </div>
    );
};

const getIconComponent = (type: string) => {
    switch (type) {
        case 'image': return <ImageIcon size={24} />;
        case 'video': return <Video size={24} />;
        case 'audio': return <Music size={24} />;
        default: return <FileText size={24} />;
    }
};

export default MediaInterface;