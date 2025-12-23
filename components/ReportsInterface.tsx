import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    MessageCircle,
    Clock,
    Download,
    Calendar,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
    totalMessages: number;
    totalContacts: number;
    totalAppointments: number;
    avgResponseTime: string;
}

interface CalendarStat {
    name: string;
    value: number;
    color: string;
}

const ReportsInterface: React.FC = () => {
    const { token } = useAuth();
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

    const [stats, setStats] = useState<DashboardStats>({
        totalMessages: 0,
        totalContacts: 0,
        totalAppointments: 0,
        avgResponseTime: '0s'
    });

    const [calendarStats, setCalendarStats] = useState<CalendarStat[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDashboardData = async () => {
        if (!token) return;

        try {
            setIsLoading(true);

            let totalMessages = 0;
            let totalContacts = 0;
            let totalAppointments = 0;

            // Fetch total messages count
            try {
                const messagesRes = await fetch(`${API_URL}/api/messages/count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (messagesRes.ok) {
                    const { count } = await messagesRes.json();
                    totalMessages = count;
                }
            } catch (err) {
                console.error('Error fetching messages count:', err);
            }

            // Fetch total contacts count
            try {
                const contactsRes = await fetch(`${API_URL}/api/kanban`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (contactsRes.ok) {
                    const kanbanData = await contactsRes.json();
                    totalContacts = kanbanData.reduce((sum: number, col: any) => sum + (col.items?.length || 0), 0);
                }
            } catch (err) {
                console.error('Error fetching contacts:', err);
            }

            // Fetch Google Calendar events
            try {
                const calendarRes = await fetch(`${API_URL}/api/calendar`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (calendarRes.ok) {
                    const events = await calendarRes.json();
                    totalAppointments = events.length;

                    // Group events by status/type for the chart
                    const today = new Date();
                    const upcoming = events.filter((e: any) => new Date(e.start) > today).length;
                    const past = events.filter((e: any) => new Date(e.start) <= today).length;
                    const thisWeek = events.filter((e: any) => {
                        const eventDate = new Date(e.start);
                        const weekFromNow = new Date();
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        return eventDate > today && eventDate <= weekFromNow;
                    }).length;

                    setCalendarStats([
                        { name: 'Próximos 7 dias', value: thisWeek, color: '#059669' },
                        { name: 'Futuros', value: upcoming - thisWeek, color: '#0d9488' },
                        { name: 'Realizados', value: past, color: '#6B7280' }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching calendar events:', err);
                setCalendarStats([]);
            }

            setStats({
                totalMessages,
                totalContacts,
                totalAppointments,
                avgResponseTime: '< 1m'
            });

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh a cada 10 segundos
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 10000);

        return () => clearInterval(interval);
    }, [token]);

    const totalAppointments = calendarStats.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex-1 flex flex-col h-full bg-[#F0F2F5] overflow-y-auto custom-scrollbar p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Relatórios Gerenciais</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">Visão geral em tempo real</p>
                        {lastUpdate && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Atualizado {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        {isLoading && (
                            <RefreshCw size={12} className="text-blue-600 animate-spin" />
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
                        <Calendar size={16} />
                        Tempo Real
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#00A884] text-white rounded-lg text-sm hover:bg-[#008f6f] font-medium shadow-sm transition-colors">
                        <Download size={16} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total de Mensagens"
                    value={stats.totalMessages.toLocaleString()}
                    icon={<MessageCircle size={20} className="text-white" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total de Contatos"
                    value={stats.totalContacts.toLocaleString()}
                    icon={<Users size={20} className="text-white" />}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Agendamentos"
                    value={stats.totalAppointments.toLocaleString()}
                    icon={<Calendar size={20} className="text-white" />}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Tempo Médio Resp."
                    value={stats.avgResponseTime}
                    icon={<Clock size={20} className="text-white" />}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Pie Chart - Calendar Appointments */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-2">Agendamentos Google Calendar</h3>
                    <p className="text-xs text-gray-400 mb-6">Distribuição por período</p>
                    <div className="flex-1 min-h-[250px] relative">
                        {totalAppointments > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={calendarStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {calendarStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="text-3xl font-bold text-gray-800">{totalAppointments}</span>
                                    <span className="text-xs text-gray-500">Total</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-400">
                                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhum agendamento</p>
                                    <p className="text-xs">Conecte seu Google Calendar</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {totalAppointments > 0 && (
                        <div className="mt-6 space-y-3">
                            {calendarStats.map((item) => (
                                <div key={item.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-800 font-semibold">{item.value}</span>
                                        <span className="text-gray-400 text-xs">({totalAppointments > 0 ? Math.round((item.value / totalAppointments) * 100) : 0}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Activity Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4">Resumo de Atividades</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Mensagens Enviadas</p>
                                    <p className="text-xs text-gray-500">Total de interações</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{stats.totalMessages}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                    <Users size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Contatos Ativos</p>
                                    <p className="text-xs text-gray-500">No pipeline</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-emerald-600">{stats.totalContacts}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Tempo de Resposta</p>
                                    <p className="text-xs text-gray-500">Média estimada</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

// Helper Component for Stats
const StatCard = ({ title, value, icon, color }: any) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
                <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
            </div>
            <div className={`p-3 rounded-lg ${color} shadow-lg`}>
                {icon}
            </div>
        </div>
    );
};

export default ReportsInterface;
