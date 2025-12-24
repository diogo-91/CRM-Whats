import React, { useState } from 'react';
import {
    User,
    Smartphone,
    Bell,
    Shield,
    CreditCard,
    Bot,
    LogOut,
    QrCode,
    Wifi,
    Check,
    Save
} from 'lucide-react';

const SettingsInterface: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'connection' | 'notifications' | 'integrations'>('profile');
    const [loading, setLoading] = useState(false);

    // Form States (Simulation)
    const [name, setName] = useState('Hebrain Admin');
    const [status, setStatus] = useState('Disponível para negócios 💼');
    const [apiKey, setApiKey] = useState('sk-........................');

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="flex flex-col h-full bg-[#DFE3E5] overflow-hidden">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm z-10">
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
                <p className="text-sm text-gray-500">Gerencie sua conta, dispositivos e preferências do sistema.</p>
            </div>

            <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full p-6 gap-6">

                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <nav className="flex flex-col p-2 space-y-1">
                            <SettingsTab
                                active={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                                icon={<User size={18} />}
                                label="Meu Perfil"
                            />
                            <SettingsTab
                                active={activeTab === 'connection'}
                                onClick={() => setActiveTab('connection')}
                                icon={<Smartphone size={18} />}
                                label="Conexão WhatsApp"
                            />
                            <SettingsTab
                                active={activeTab === 'notifications'}
                                onClick={() => setActiveTab('notifications')}
                                icon={<Bell size={18} />}
                                label="Notificações"
                            />
                            <SettingsTab
                                active={activeTab === 'integrations'}
                                onClick={() => setActiveTab('integrations')}
                                icon={<Bot size={18} />}
                                label="IA & Integrações"
                            />
                            <div className="h-px bg-gray-100 my-2"></div>
                            <SettingsTab
                                active={false}
                                onClick={() => alert('Saindo...')}
                                icon={<LogOut size={18} />}
                                label="Sair da Conta"
                                variant="danger"
                            />
                        </nav>
                    </div>

                    <div className="mt-6 bg-[#e3f2fd] p-4 rounded-xl border border-blue-100">
                        <h4 className="text-blue-800 font-bold text-sm mb-1">Plano Profissional</h4>
                        <p className="text-blue-600 text-xs mb-3">Sua assinatura renova em 12/01/2024.</p>
                        <button className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium border border-blue-200 shadow-sm hover:bg-blue-50">
                            Gerenciar Assinatura
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto animate-in fade-in slide-in-from-right-4">

                    {activeTab === 'profile' && (
                        <div className="p-8 max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Meu Perfil</h2>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative">
                                    <img src="https://picsum.photos/200/200?random=1" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50" alt="Profile" />
                                    <button className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white hover:bg-emerald-600 transition-colors">
                                        <User size={14} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                                    <p className="text-gray-500 text-sm">Administrador</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value="admin@crm.com"
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recado (Status)</label>
                                    <input
                                        type="text"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <SaveButton loading={loading} onClick={handleSave} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'connection' && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Conexão WhatsApp</h2>

                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <Wifi size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            Conectado
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        </h3>
                                        <p className="text-sm text-gray-600">Sessão ativa: iPhone 14 Pro Max • Bateria: 82%</p>
                                    </div>
                                </div>
                                <button className="text-red-600 text-sm font-medium hover:underline">
                                    Desconectar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-4">Informações da Sessão</h4>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex justify-between border-b border-gray-50 pb-2">
                                            <span>Número</span>
                                            <span className="font-medium">+55 31 9999-9999</span>
                                        </li>
                                        <li className="flex justify-between border-b border-gray-50 pb-2">
                                            <span>Versão Web</span>
                                            <span className="font-medium">2.3000.10</span>
                                        </li>
                                        <li className="flex justify-between border-b border-gray-50 pb-2">
                                            <span>Plataforma</span>
                                            <span className="font-medium">CRM Cloud API</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                    <QrCode size={64} className="text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 text-center">Para conectar um novo aparelho,<br />desconecte o atual primeiro.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-8 max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Preferências de Notificação</h2>

                            <div className="space-y-6">
                                <NotificationToggle title="Novas Mensagens" description="Receber notificações quando chegar uma nova mensagem." defaultChecked />
                                <NotificationToggle title="Leads Atribuídos" description="Notificar quando um novo lead for atribuído a mim." defaultChecked />
                                <NotificationToggle title="Lembretes de Agenda" description="Alertas sobre reuniões e agendamentos próximos." defaultChecked />
                                <NotificationToggle title="Sons do Sistema" description="Tocar sons ao enviar/receber mensagens." defaultChecked={false} />

                                <div className="pt-4 flex justify-end">
                                    <SaveButton loading={loading} onClick={handleSave} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="p-8 max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Inteligência Artificial & API</h2>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                                        <Bot size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Google Gemini AI</h3>
                                        <p className="text-sm text-gray-500">Motor de sugestões de resposta inteligente.</p>
                                    </div>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono text-sm"
                                    />
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                                        Verificar
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Sua chave é armazenada de forma segura e usada apenas para gerar sugestões.</p>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-bold text-gray-800 mb-4">Webhooks</h3>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Webhook URL</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ativo</span>
                                    </div>
                                    <code className="block w-full bg-white p-2 rounded border border-gray-200 text-xs text-gray-600 font-mono break-all">
                                        https://api.crm.com/v1/webhook/listener/8f92-23a...
                                    </code>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <SaveButton loading={loading} onClick={handleSave} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const SettingsTab = ({ active, onClick, icon, label, variant = 'default' }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left
            ${variant === 'danger' ? 'text-red-600 hover:bg-red-50' :
                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}
        `}
    >
        {icon}
        {label}
    </button>
);

const NotificationToggle = ({ title, description, defaultChecked }: any) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-start justify-between">
            <div>
                <h4 className="text-sm font-medium text-gray-800">{title}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
};

const SaveButton = ({ loading, onClick }: any) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="bg-[#00A884] hover:bg-[#008f6f] text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
    >
        {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        ) : (
            <Check size={18} />
        )}
        Salvar Alterações
    </button>
);

export default SettingsInterface;