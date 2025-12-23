import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Video,
    Phone,
    MapPin,
    Plus,
    Calendar as CalendarIcon,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Appointment } from '../types';
import { useAuth } from '../context/AuthContext';

// Mock Initial Data
const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: '1',
        title: 'Demo do Produto',
        contactName: 'Leandro Bossa',
        date: new Date(), // Today
        startTime: '10:00',
        endTime: '11:00',
        type: 'demo',
        status: 'confirmed',
        notes: 'Apresentar módulo de relatórios.'
    },
    {
        id: '2',
        title: 'Reunião de Alinhamento',
        contactName: 'Lili Clínica',
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        startTime: '14:30',
        endTime: '15:30',
        type: 'meeting',
        status: 'pending'
    },
    {
        id: '3',
        title: 'Call de Feedback',
        contactName: 'Marcelo Alvaro',
        date: new Date(), // Today
        startTime: '16:00',
        endTime: '16:30',
        type: 'call',
        status: 'confirmed'
    }
];

const SchedulingInterface: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
    const [showModal, setShowModal] = useState(false);
    const { token } = useAuth();
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    // Fetch Google Events
    const fetchGoogleEvents = async () => {
        try {
            setSyncStatus('syncing');
            const res = await fetch(`${API_URL}/api/calendar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const gEvents = await res.json();
                console.log('Google Events:', gEvents);
                const mappedEvents: Appointment[] = gEvents.map((ev: any) => ({
                    id: ev.id,
                    title: ev.title || 'Sem título',
                    contactName: ev.description || 'Google Calendar',
                    date: new Date(ev.start),
                    startTime: new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'meeting',
                    status: 'confirmed',
                    notes: ev.description
                }));
                setAppointments([...INITIAL_APPOINTMENTS, ...mappedEvents]);
                setSyncStatus('success');
                setLastSyncTime(new Date());
            } else {
                setSyncStatus('error');
            }
        } catch (err) {
            console.error(err);
            setSyncStatus('error');
        }
    };

    useEffect(() => {
        if (token) {
            fetchGoogleEvents();
            // Auto-refresh a cada 1 minuto
            const interval = setInterval(() => {
                fetchGoogleEvents();
            }, 60000); // 60000ms = 1 minuto

            return () => clearInterval(interval);
        }
    }, [token, API_URL]);

    const handleGoogleConnect = () => {
        window.location.href = `${API_URL}/auth/google?token=${token}`;
    };

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter(apt => isSameDay(new Date(apt.date), date));
    };

    const renderCalendarDays = () => {
        const days = [];
        const emptyDays = firstDayOfMonth;

        // Empty cells for previous month
        for (let i = 0; i < emptyDays; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = isSameDay(dateToCheck, new Date());
            const isSelected = isSameDay(dateToCheck, selectedDate);
            const dayAppointments = getAppointmentsForDate(dateToCheck);

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(dateToCheck)}
                    className={`h-28 border-2 p-3 cursor-pointer transition-all duration-200 relative group rounded-lg
            ${isSelected ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-lg scale-105' : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}
          `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`
                text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all
                ${isToday ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg scale-110' : isSelected ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'}
            `}>
                            {day}
                        </span>
                        {dayAppointments.length > 0 && (
                            <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold shadow-md">
                                {dayAppointments.length}
                            </span>
                        )}
                    </div>

                    <div className="mt-2 space-y-1">
                        {dayAppointments.slice(0, 2).map((apt, idx) => (
                            <div key={idx} className="text-[10px] truncate px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border-l-3 border-l-blue-500 font-medium shadow-sm hover:shadow-md transition-shadow">
                                <span className="font-bold text-blue-600">{apt.startTime}</span> {apt.title}
                            </div>
                        ))}
                        {dayAppointments.length > 2 && (
                            <div className="text-[10px] text-purple-600 pl-2 font-semibold">
                                + {dayAppointments.length - 2} mais
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="flex-1 flex h-full bg-[#DFE3E5] overflow-hidden">

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl shadow-lg border border-emerald-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white rounded-xl p-1.5 shadow-md">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-emerald-50 rounded-lg transition-all hover:scale-110">
                                <ChevronLeft size={20} className="text-emerald-600" />
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-emerald-50 rounded-lg transition-all hover:scale-110">
                                <ChevronRight size={20} className="text-emerald-600" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <CalendarIcon size={28} className="text-emerald-600" />
                                {monthNames[currentDate.getMonth()]}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500 font-medium">{currentDate.getFullYear()}</p>
                                {syncStatus !== 'idle' && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-300">•</span>
                                        {syncStatus === 'syncing' && (
                                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                Sincronizando...
                                            </span>
                                        )}
                                        {syncStatus === 'success' && lastSyncTime && (
                                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 size={12} />
                                                Sincronizado {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {syncStatus === 'error' && (
                                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                <XCircle size={12} />
                                                Erro na sincronização
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleGoogleConnect}
                            className="bg-white border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google" className="w-5 h-5" />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sincronizar Google</span>
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                            <Plus size={20} />
                            Novo Agendamento
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 flex-1 flex flex-col overflow-hidden">
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar p-2 gap-2 bg-gradient-to-br from-gray-50 to-blue-50">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>

            {/* Side Panel - Agenda Details */}
            <div className="w-[350px] bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-10">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Agenda do Dia</h3>
                    <p className="text-emerald-600 font-medium flex items-center gap-2 mt-1">
                        <CalendarIcon size={16} />
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {getAppointmentsForDate(selectedDate).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <CalendarIcon size={24} />
                            </div>
                            <p>Sem agendamentos</p>
                            <button onClick={() => setShowModal(true)} className="text-sm text-[#00A884] font-medium mt-2 hover:underline">
                                Adicionar agora
                            </button>
                        </div>
                    ) : (
                        getAppointmentsForDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(apt => (
                            <AppointmentCard key={apt.id} appointment={apt} />
                        ))
                    )}
                </div>
            </div>

            {/* Modal - Quick Add (Visual Only for Demo) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Novo Agendamento</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" placeholder="Ex: Reunião de Vendas" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" placeholder="Nome do contato" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
                                    <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue={selectedDate.toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Hora</label>
                                    <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-white bg-[#00A884] hover:bg-[#008f6f] rounded-lg text-sm font-medium transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone size={14} className="text-blue-500" />;
            case 'demo': return <Video size={14} className="text-purple-500" />;
            default: return <MapPin size={14} className="text-orange-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                </button>
            </div>

            <h4 className="font-bold text-gray-800 text-sm mb-1">{appointment.title}</h4>
            <p className="text-xs text-gray-500 mb-3">{appointment.contactName}</p>

            <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-gray-400" />
                    {appointment.startTime} - {appointment.endTime}
                </div>
                <div className="h-3 w-[1px] bg-gray-300"></div>
                <div className="flex items-center gap-1.5 capitalize">
                    {getTypeIcon(appointment.type)}
                    {appointment.type}
                </div>
            </div>

            {appointment.notes && (
                <p className="text-[11px] text-gray-400 mt-3 italic border-t border-gray-50 pt-2">
                    "{appointment.notes}"
                </p>
            )}
        </div>
    );
};

export default SchedulingInterface;