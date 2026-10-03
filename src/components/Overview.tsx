import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ChevronRight, 
  ChevronLeft,
  FileCode, 
  Users, 
  Layers,
  ArrowRight,
  Scale,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Pencil,
  X
} from 'lucide-react';
import { Activity, Document, Member, Tab, CalendarEvent } from '../types';

interface OverviewProps {
  documents: Document[];
  members: Member[];
  activities: Activity[];
  setCurrentTab: (tab: Tab) => void;
  onSelectDocument: (doc: Document) => void;
  isHighContrast: boolean;
  calendarEvents: CalendarEvent[];
  onUpdateCalendarEvents: (events: CalendarEvent[]) => void;
}

export default function Overview({ 
  documents, 
  members = [],
  activities, 
  setCurrentTab,
  onSelectDocument,
  isHighContrast,
  calendarEvents = [],
  onUpdateCalendarEvents
}: OverviewProps) {

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 6, 14)); // July 14, 2026 (July is index 6)

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Selected events mapped from props
  const allEvents = calendarEvents;

  const currentMonthEvents = calendarEvents.filter(event => {
    const parts = event.date.split('-');
    if (parts.length === 3) {
      const evYear = parseInt(parts[0], 10);
      const evMonth = parseInt(parts[1], 10) - 1; // 0-indexed
      return evYear === year && evMonth === month;
    }
    return false;
  });

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  const daysArray = [];
  // Preceding empty slots
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Event Form / Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventFormTitle, setEventFormTitle] = useState('');
  const [eventFormDate, setEventFormDate] = useState('');
  const [eventFormTime, setEventFormTime] = useState('12:00');
  const [eventFormType, setEventFormType] = useState('assembly');

  const handleOpenAddEvent = (initialDateStr?: string) => {
    setEditingEvent(null);
    setEventFormTitle('');
    if (initialDateStr) {
      setEventFormDate(initialDateStr);
    } else {
      const formattedDayNum = '14';
      const formattedMonthNum = String(month + 1).padStart(2, '0');
      setEventFormDate(`${year}-${formattedMonthNum}-${formattedDayNum}`);
    }
    setEventFormTime('12:00');
    setEventFormType('assembly');
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setEventFormTitle(event.title);
    setEventFormDate(event.date);
    setEventFormTime(event.time);
    setEventFormType(event.type);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Deseja realmente excluir este evento?')) {
      onUpdateCalendarEvents(calendarEvents.filter(ev => ev.id !== eventId));
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormTitle.trim()) {
      alert('Por favor, informe o título do evento.');
      return;
    }
    if (!eventFormDate) {
      alert('Por favor, informe a data do evento.');
      return;
    }

    if (editingEvent) {
      // Edit existing event
      const updated = calendarEvents.map(ev => {
        if (ev.id === editingEvent.id) {
          return {
            ...ev,
            title: eventFormTitle,
            date: eventFormDate,
            time: eventFormTime,
            type: eventFormType
          };
        }
        return ev;
      });
      onUpdateCalendarEvents(updated);
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: `ev-${Date.now()}`,
        title: eventFormTitle,
        date: eventFormDate,
        time: eventFormTime,
        type: eventFormType
      };
      onUpdateCalendarEvents([...calendarEvents, newEvent]);
    }
    setShowEventModal(false);
  };

  // Templates Rápidos definitions
  const quickTemplates = [
    {
      title: 'Template de Ata',
      description: 'Ideal para reuniões semanais',
      color: 'text-indigo-400 bg-indigo-500/10',
      icon: Users,
      templateId: 'doc-1'
    },
    {
      title: 'Convocação',
      description: 'Comunicados formais e chamadas',
      color: 'text-pink-400 bg-pink-500/10',
      icon: Send,
      templateId: 'doc-2'
    },
    {
      title: 'Proposta Comercial',
      description: 'Estrutura para orçamentos e deals',
      color: 'text-amber-400 bg-amber-500/10',
      icon: FileCode,
      templateId: 'doc-3'
    }
  ];

  const handleLaunchTemplate = (templateId: string) => {
    const doc = documents.find(d => d.id === templateId) || documents[0];
    onSelectDocument(doc);
    setCurrentTab('editor');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto w-full font-sans"
    >
      {/* Overview Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 text-indigo-400">
          <Layers className="w-8 h-8 text-indigo-500" />
          <h2 className={`text-3xl font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>Página Inicial</h2>
        </div>
        <p className={`text-sm ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Acompanhe as atividades recentes e acesse os templates rápidos a partir daqui.
        </p>
      </div>

      {/* Visual Component: Membros, Quórum & Calendário Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Total de Membros */}
        <div className={`p-6 border rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
        }`}>
          {/* Decorative background shape */}
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Organização</span>
              <h3 className={`text-sm font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Membros Cadastrados</h3>
            </div>
            <div className={`p-2 rounded-xl ${isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800/60 text-zinc-400'}`}>
              <Users size={18} />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl font-black tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
              {members.length}
            </span>
            <span className="text-xs text-zinc-500 font-semibold">associados registrados</span>
          </div>

          <div className="mt-6 space-y-4">
            {/* Custom styled progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-green-500 uppercase tracking-wide">Ativos ({members.filter(m => m.status === 'Ativo').length})</span>
                <span className="text-zinc-400 uppercase tracking-wide">Inativos ({members.filter(m => m.status === 'Inativo').length})</span>
              </div>
              <div className={`h-2 rounded-full w-full overflow-hidden flex ${isHighContrast ? 'bg-zinc-100' : 'bg-zinc-950'}`}>
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${members.length > 0 ? (members.filter(m => m.status === 'Ativo').length / members.length) * 100 : 0}%` }}
                />
                <div 
                  className="bg-zinc-500 h-full transition-all duration-500" 
                  style={{ width: `${members.length > 0 ? (members.filter(m => m.status === 'Inativo').length / members.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* List cargos and their allocated members with photos */}
            <div className={`mt-4 pt-3 border-t border-dashed ${isHighContrast ? 'border-zinc-200' : 'border-zinc-800/80'} space-y-2.5`}>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Alocação por Cargos</span>
              <div className="space-y-2">
                {['Conselho Administrativo', 'Diretoria', 'Conselho Fiscal'].map(cargoName => {
                  const cargoMembers = members.filter(m => {
                    if (!m.cargo) return false;
                    if (Array.isArray(m.cargo)) {
                      return m.cargo.includes(cargoName);
                    }
                    return m.cargo.split(',').map(c => c.trim()).includes(cargoName);
                  });
                  if (cargoMembers.length === 0) return null;
                  return (
                    <div key={cargoName} className="flex items-center justify-between text-[10px] leading-tight">
                      <span className={`font-semibold shrink-0 max-w-[130px] truncate ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>{cargoName}</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {cargoMembers.map(m => (
                          <div 
                            key={m.id} 
                            className="relative group/avatar" 
                            title={m.funcao ? `${m.name} (${m.funcao})` : `${m.name} (${m.status})`}
                          >
                            {m.avatar ? (
                              <img
                                className={`inline-block h-6 w-6 rounded-full ring-2 ${
                                  isHighContrast ? 'ring-white' : 'ring-zinc-950'
                                } object-cover ${
                                  m.status === 'Inativo' ? 'opacity-40 grayscale' : ''
                                }`}
                                src={m.avatar}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`inline-block h-6 w-6 rounded-full ring-2 ${
                                isHighContrast ? 'ring-white' : 'ring-zinc-950'
                              } bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white ${
                                m.status === 'Inativo' ? 'opacity-40 grayscale' : ''
                              }`}>
                                {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-zinc-500 font-medium">Visualizar listagem completa:</span>
              <button 
                onClick={() => setCurrentTab('members')}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 hover:underline transition-all flex items-center gap-1 cursor-pointer"
              >
                Gerenciar Membros <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Quórum Necessário */}
        <div className={`p-6 border rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
        }`}>
          {/* Decorative background shape */}
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Estatuto & Votação</span>
              <h3 className={`text-sm font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Quórum Necessário</h3>
            </div>
            <div className={`p-2 rounded-xl ${isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800/60 text-zinc-400'}`}>
              <Scale size={18} />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl font-black tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
              {Math.ceil(members.filter(m => m.status === 'Ativo').length * 2 / 3)}
            </span>
            <span className="text-xs text-zinc-500 font-medium font-semibold">membros para 1ª convocação</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 pt-2">
            <div className={`p-2.5 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/50 border-zinc-800/40'}`}>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">1ª Convocação</p>
              <p className={`text-sm font-black mt-1 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-100'}`}>
                {Math.ceil(members.filter(m => m.status === 'Ativo').length * 2 / 3)} <span className="text-[10px] font-normal text-zinc-500">membros</span>
              </p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Mínimo 2/3 dos ativos</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/50 border-zinc-800/40'}`}>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">2ª Convocação</p>
              <p className={`text-sm font-black mt-1 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-100'}`}>
                {Math.ceil(members.filter(m => m.status === 'Ativo').length / 2) + 1} <span className="text-[10px] font-normal text-zinc-500">membros</span>
              </p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Maioria simples (50% + 1)</p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed mt-4">
            * Nota: O estatuto prevê início na segunda chamada com quórum simples.
          </p>
        </div>

        {/* Card 3: Calendário de Compromissos */}
        <div className="p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 bg-[#4f39f6] border border-[#4f39f6]/30 text-white">
          {/* Decorative background shape */}
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">Agenda Oficial</span>
                <h3 className="text-sm font-bold text-white">Calendário de Atividades</h3>
              </div>
              <div className="p-2 rounded-xl bg-white/10 text-white">
                <Calendar size={18} />
              </div>
            </div>

            {/* Month selector controls */}
            <div className="flex items-center justify-between mb-2">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft size={11} />
              </button>
              <span className="text-[11px] font-extrabold tracking-tight text-white">
                {monthNames[month]} de {year}
              </span>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                <span key={idx} className="text-[8px] font-black uppercase tracking-wider py-0.5 text-white/60">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysArray.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty-${idx}`} />;
                }

                // Check if this specific day is Today (July 14, 2026)
                const isToday = year === 2026 && month === 6 && dayNum === 14;
                
                // Formatted string to match event key
                const formattedDayNum = String(dayNum).padStart(2, '0');
                const formattedMonthNum = String(month + 1).padStart(2, '0');
                const dateKeyStr = `${year}-${formattedMonthNum}-${formattedDayNum}`;
                
                // Check if there is an event on this day
                const hasEvent = allEvents.some(event => event.date === dateKeyStr);

                return (
                  <div 
                    key={`day-${dayNum}`}
                    onClick={() => handleOpenAddEvent(dateKeyStr)}
                    className={`aspect-square text-[9px] font-bold rounded-lg flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                      isToday
                        ? 'bg-white text-[#4f39f6] shadow-md font-extrabold scale-105'
                        : hasEvent
                          ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                          : 'text-white/80 hover:bg-white/10'
                    }`}
                    title={isToday ? "Hoje (14 de Julho de 2026) - Clique para criar evento" : hasEvent ? "Dia de compromisso - Clique para criar evento" : "Clique para criar evento"}
                  >
                    <span>{dayNum}</span>
                    {hasEvent && !isToday && (
                      <span className="w-1 h-1 rounded-full bg-white absolute bottom-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of events for the month */}
          <div className="mt-4 pt-3 border-t border-dashed border-white/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest block">Eventos deste Mês</span>
              <button
                type="button"
                onClick={() => handleOpenAddEvent()}
                className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white hover:text-white/80 cursor-pointer transition-all"
              >
                <Plus size={8} /> Criar Evento
              </button>
            </div>
            {currentMonthEvents.length > 0 ? (
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {currentMonthEvents.map((ev, idx) => {
                  const evDay = ev.date.split('-')[2];
                  return (
                    <div 
                      key={ev.id || idx} 
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-between text-[8px] leading-tight transition-all group/item"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="px-1 py-0.2 rounded font-black font-mono shrink-0 bg-white/20 text-white">
                          {evDay}
                        </span>
                        <p className="font-semibold truncate text-white" title={ev.title}>
                          {ev.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                        <span className="text-white/60 font-bold font-mono text-[8px] flex items-center gap-0.5 mr-1">
                          <Clock size={8} /> {ev.time}
                        </span>
                        
                        {/* Edit Action Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditEvent(ev, e)}
                          className="p-0.5 rounded transition-all opacity-40 group-hover/item:opacity-100 hover:scale-110 cursor-pointer text-white hover:bg-white/20"
                          title="Editar evento"
                        >
                          <Pencil size={8} />
                        </button>
                        
                        {/* Delete Action Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEvent(ev.id, e)}
                          className="p-0.5 rounded transition-all opacity-40 group-hover/item:opacity-100 hover:scale-110 cursor-pointer text-white/85 hover:text-white hover:bg-white/20"
                          title="Excluir evento"
                        >
                          <Trash2 size={8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[9px] text-white/60 italic">Sem eventos agendados para este mês.</p>
            )}
          </div>
        </div>

      </div>

      {/* Main Dashboard Interactive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activities list/table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className={`text-lg font-bold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>Atividades Recentes</h3>
              <p className="text-xs text-zinc-500">Consultas e análises efetuadas nos workspaces recentes.</p>
            </div>
            <button 
              onClick={() => setCurrentTab('documents')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-all flex items-center gap-1 cursor-pointer"
            >
              Ver todas <ArrowRight size={12} />
            </button>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${
            isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/20 border-zinc-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`${
                    isHighContrast ? 'bg-zinc-50 text-zinc-600 border-b border-zinc-200' : 'bg-zinc-950/80 text-zinc-400 border-b border-zinc-800'
                  }`}>
                    <th className="px-6 py-4 text-[10px] font-semibold tracking-wider uppercase">Workspace</th>
                    <th className="px-6 py-4 text-[10px] font-semibold tracking-wider uppercase">Nome do Arquivo</th>
                    <th className="px-6 py-4 text-[10px] font-semibold tracking-wider uppercase">Editor</th>
                    <th className="px-6 py-4 text-[10px] font-semibold tracking-wider uppercase">Horário</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isHighContrast ? 'divide-zinc-200' : 'divide-zinc-800/60'}`}>
                  {activities.map((act) => (
                    <tr 
                      key={act.id} 
                      className={`transition-all duration-150 group cursor-pointer ${
                        isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-900/60'
                      }`}
                      onClick={() => {
                        const matchedDoc = documents.find(d => d.name.toLowerCase() === act.fileName.toLowerCase());
                        if (matchedDoc) {
                          onSelectDocument(matchedDoc);
                          setCurrentTab('editor');
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold tracking-wide ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                          {act.workspace}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md">
                            <FileCode size={13} />
                          </span>
                          <span className={`text-xs font-semibold group-hover:text-indigo-500 transition-colors ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                          }`}>
                            {act.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full ${act.editorBg} flex items-center justify-center text-[9px] font-bold text-white shadow-sm`}>
                            {act.editorInitials}
                          </div>
                          <span className={`text-xs group-hover:text-indigo-500 transition-colors ${
                            isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>{act.editorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                        {act.timeAgo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Templates Rápidos & Launcher card */}
        <div className="space-y-6">
          <h3 className={`text-lg font-bold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>Templates Rápidos</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {quickTemplates.map((template, idx) => {
              const IconComp = template.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => handleLaunchTemplate(template.templateId)}
                  className={`p-4 border hover:border-indigo-500/50 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 group shadow-sm ${
                    isHighContrast 
                      ? 'bg-white border-zinc-200 hover:shadow-md' 
                      : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 shadow-md'
                  }`}
                >
                  <div className={`w-11 h-11 ${template.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <IconComp size={18} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>{template.title}</h4>
                    <p className={`text-[10px] ${isHighContrast ? 'text-zinc-500' : 'text-zinc-500'} mt-0.5`}>{template.description}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Event Creation/Edition Modal */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Header */}
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
              }`}>
                <div className="flex items-center gap-2 text-purple-500">
                  <Calendar size={15} />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {editingEvent ? 'Editar Evento' : 'Novo Evento no Calendário'}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEvent} className="p-4 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Título do Evento</label>
                  <input
                    type="text"
                    value={eventFormTitle}
                    onChange={(e) => setEventFormTitle(e.target.value)}
                    placeholder="Ex: Assembleia de Moradores"
                    className={`w-full border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:border-purple-500' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-purple-500/80'
                    }`}
                    required
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Data</label>
                    <input
                      type="date"
                      value={eventFormDate}
                      onChange={(e) => setEventFormDate(e.target.value)}
                      className={`w-full border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all ${
                        isHighContrast 
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:border-purple-500' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-purple-500/80'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Horário</label>
                    <input
                      type="time"
                      value={eventFormTime}
                      onChange={(e) => setEventFormTime(e.target.value)}
                      className={`w-full border rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all ${
                        isHighContrast 
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:border-purple-500' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-purple-500/80'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Event Type */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Tipo de Compromisso</label>
                  <select
                    value={eventFormType}
                    onChange={(e) => setEventFormType(e.target.value)}
                    className={`w-full border rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 focus:border-purple-500' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-purple-500/80'
                    }`}
                  >
                    <option value="assembly">Assembleia Geral</option>
                    <option value="council">Reunião de Conselho</option>
                    <option value="admin">Administrativo / Contas</option>
                    <option value="planning">Planejamento</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      isHighContrast 
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200' 
                        : 'bg-zinc-850 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-bold shadow-md shadow-purple-600/10 hover:shadow-purple-500/20 transition-all"
                  >
                    {editingEvent ? 'Atualizar' : 'Salvar Evento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
