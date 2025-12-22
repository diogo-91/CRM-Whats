import React from 'react';
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock, 
  Download, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock Data
const WEEKLY_DATA = [
  { name: 'Seg', mensagens: 4000, leads: 240 },
  { name: 'Ter', mensagens: 3000, leads: 139 },
  { name: 'Qua', mensagens: 2000, leads: 980 },
  { name: 'Qui', mensagens: 2780, leads: 390 },
  { name: 'Sex', mensagens: 1890, leads: 480 },
  { name: 'Sáb', mensagens: 2390, leads: 380 },
  { name: 'Dom', mensagens: 3490, leads: 430 },
];

const LEAD_STATUS_DATA = [
  { name: 'Novos Leads', value: 400, color: '#059669' }, // emerald-600
  { name: 'Em Negociação', value: 300, color: '#0d9488' }, // teal-600
  { name: 'Aguardando', value: 300, color: '#eab308' }, // yellow-500
  { name: 'Fechados', value: 200, color: '#0f766e' }, // teal-700
];

const RESPONSE_TIME_DATA = [
    { time: '08:00', valor: 2 },
    { time: '10:00', valor: 5 },
    { time: '12:00', valor: 15 },
    { time: '14:00', valor: 8 },
    { time: '16:00', valor: 4 },
    { time: '18:00', valor: 10 },
];

const ReportsInterface: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F0F2F5] overflow-y-auto custom-scrollbar p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatórios Gerenciais</h1>
            <p className="text-sm text-gray-500">Visão geral do desempenho da sua equipe e engajamento.</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
                <Calendar size={16} />
                Últimos 7 dias
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
            value="19.5k" 
            change="+12.5%" 
            icon={<MessageCircle size={20} className="text-white" />} 
            color="bg-blue-500"
            trend="up"
        />
        <StatCard 
            title="Novos Leads" 
            value="1,234" 
            change="+3.2%" 
            icon={<Users size={20} className="text-white" />} 
            color="bg-emerald-500"
            trend="up"
        />
        <StatCard 
            title="Vendas Convertidas" 
            value="R$ 45.2k" 
            change="-2.4%" 
            icon={<DollarSign size={20} className="text-white" />} 
            color="bg-teal-600"
            trend="down"
        />
        <StatCard 
            title="Tempo Médio Resp." 
            value="4m 12s" 
            change="-15%" 
            subtext="(Melhoria)"
            icon={<Clock size={20} className="text-white" />} 
            color="bg-purple-500"
            trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700">Volume de Mensagens vs. Leads</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Mensagens</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-teal-700"></div> Leads</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WEEKLY_DATA} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#F3F4F6'}}
                        />
                        <Bar dataKey="mensagens" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="leads" fill="#0F766E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-2">Status dos Leads</h3>
            <p className="text-xs text-gray-400 mb-6">Distribuição atual do pipeline</p>
            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={LEAD_STATUS_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {LEAD_STATUS_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold text-gray-800">1.2k</span>
                    <span className="text-xs text-gray-500">Total</span>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                {LEAD_STATUS_DATA.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{Math.round((item.value / 1200) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Team Performance Table (Simulated) */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Desempenho da Equipe</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Atendente</th>
                            <th className="px-4 py-3">Conversas</th>
                            <th className="px-4 py-3">Tempo Médio</th>
                            <th className="px-4 py-3 rounded-r-lg">Avaliação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Hebrain', chats: 145, time: '3m 20s', rating: 4.9 },
                            { name: 'Sarah', chats: 132, time: '4m 10s', rating: 4.8 },
                            { name: 'Miguel', chats: 98, time: '5m 05s', rating: 4.5 },
                        ].map((agent, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                                        {agent.name.charAt(0)}
                                    </div>
                                    {agent.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{agent.chats}</td>
                                <td className="px-4 py-3 text-gray-600">{agent.time}</td>
                                <td className="px-4 py-3 text-emerald-600 font-bold flex items-center gap-1">
                                    {agent.rating} ★
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         {/* Response Time Trend */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Tempo de Resposta (Hoje)</h3>
            <p className="text-xs text-gray-400 mb-4">Média em minutos por hora do dia</p>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RESPONSE_TIME_DATA}>
                         <defs>
                            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="valor" stroke="#8884d8" fillOpacity={1} fill="url(#colorValor)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ title, value, change, icon, color, trend, subtext }: any) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
                <h4 className="text-2xl font-bold text-gray-800 mb-1">{value}</h4>
                <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {change}
                    {subtext && <span className="text-gray-400 font-normal ml-1">{subtext}</span>}
                </div>
            </div>
            <div className={`p-3 rounded-lg ${color} shadow-lg shadow-${color.replace('bg-', '')}/30`}>
                {icon}
            </div>
        </div>
    );
};

export default ReportsInterface;
