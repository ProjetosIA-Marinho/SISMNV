import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Trash2, 
  Edit, 
  Shield, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  Check,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Camera,
  User,
  Lock
} from 'lucide-react';
import { Member } from '../types';

function formatTempoNoCargo(dataInicio?: string, dataTermino?: string) {
  if (!dataInicio) return { period: 'Não definido', duration: 'Sem mandato' };
  
  const formatDateStr = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  try {
    const inicio = new Date(dataInicio);
    const fim = dataTermino ? new Date(dataTermino) : new Date();
    
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let durationText = '';
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      durationText = `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      if (months > 0) {
        durationText = `${months} ${months === 1 ? 'mês' : 'meses'}`;
      } else {
        durationText = `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
      }
    }
    
    return {
      period: `${formatDateStr(dataInicio)} ${dataTermino ? `até ${formatDateStr(dataTermino)}` : '(Atual)'}`,
      duration: durationText
    };
  } catch {
    return {
      period: `${formatDateStr(dataInicio)} ${dataTermino ? `até ${formatDateStr(dataTermino)}` : ''}`,
      duration: ''
    };
  }
}

interface MembersProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  searchQuery: string;
  isHighContrast: boolean;
}

export default function Members({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  searchQuery,
  isHighContrast
}: MembersProps) {
  const [selectedCargo, setSelectedCargo] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Modal states for adding or editing members
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberCargo, setMemberCargo] = useState<string>('Conselho Administrativo');
  const [memberCargos, setMemberCargos] = useState<string[]>(['Conselho Administrativo']);
  const [memberRole, setMemberRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [memberStatus, setMemberStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  
  // New requested fields
  const [memberCpf, setMemberCpf] = useState<string>('');
  const [memberEstadoCivil, setMemberEstadoCivil] = useState<'Solteiro' | 'Casado' | 'Divorciado' | 'União Estável' | 'Viúvo'>('Solteiro');
  const [memberNomeConjuge, setMemberNomeConjuge] = useState<string>('');
  const [memberDataNascimento, setMemberDataNascimento] = useState<string>('');
  const [memberTelefone, setMemberTelefone] = useState<string>('');
  const [memberRua, setMemberRua] = useState<string>('');
  const [memberNumero, setMemberNumero] = useState<string>('');
  const [memberBairro, setMemberBairro] = useState<string>('');
  const [memberCidade, setMemberCidade] = useState<string>('');
  const [memberCep, setMemberCep] = useState<string>('');
  const [memberDataInicio, setMemberDataInicio] = useState<string>('');
  const [memberDataTermino, setMemberDataTermino] = useState<string>('');
  const [memberAvatar, setMemberAvatar] = useState<string>('');
  const [memberFuncao, setMemberFuncao] = useState<string>('Presidente');

  // Synchronize memberFuncao when memberCargos changes using a primitive dependency string
  React.useEffect(() => {
    const cargosStr = memberCargos.join(',');
    if (cargosStr.includes('Conselho Administrativo') && !cargosStr.includes('Diretoria') && !cargosStr.includes('Conselho Fiscal')) {
      if (memberFuncao !== 'Presidente' && memberFuncao !== 'membro') {
        setMemberFuncao('Presidente');
      }
    } else if (cargosStr.includes('Diretoria') && !cargosStr.includes('Conselho Administrativo') && !cargosStr.includes('Conselho Fiscal')) {
      if (memberFuncao !== 'Pr. Presidente' && memberFuncao !== 'Vice-Presidente' && memberFuncao !== 'Tesoureiro' && memberFuncao !== 'Secretário') {
        setMemberFuncao('Pr. Presidente');
      }
    } else if (cargosStr.includes('Conselho Fiscal') && !cargosStr.includes('Conselho Administrativo') && !cargosStr.includes('Diretoria')) {
      if (memberFuncao !== 'Presidente' && memberFuncao !== 'membro') {
        setMemberFuncao('Presidente');
      }
    }
  }, [memberCargos.join(',')]);

  // Active form section tab (aesthetic indicator matching image layout)
  const [activeFormTab, setActiveFormTab] = useState<'geral' | 'endereco' | 'cargo'>('geral');

  // Filter members by query search, category cargo and status
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.cpf && member.cpf.includes(searchQuery)) ||
                          (member.cargo && member.cargo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCargo = selectedCargo === 'Todos' || member.cargo.includes(selectedCargo);
    
    const matchesStatus = selectedStatus === 'Todos' || 
                          (selectedStatus === 'Ativo' && member.status === 'Ativo') ||
                          (selectedStatus === 'Inativo' && member.status === 'Inativo');

    return matchesSearch && matchesCargo && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setMemberName('');
    setMemberEmail('');
    setMemberCargo('Conselho Administrativo');
    setMemberCargos(['Conselho Administrativo']);
    setMemberRole('Editor');
    setMemberStatus('Ativo');
    setMemberCpf('');
    setMemberEstadoCivil('Solteiro');
    setMemberNomeConjuge('');
    setMemberDataNascimento('');
    setMemberTelefone('');
    setMemberRua('');
    setMemberNumero('');
    setMemberBairro('');
    setMemberCidade('');
    setMemberCep('');
    setMemberDataInicio('');
    setMemberDataTermino('');
    setMemberAvatar('');
    setMemberFuncao('Presidente');
    setActiveFormTab('geral');
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      alert('Por favor, informe o nome e e-mail do membro.');
      return;
    }

    const randomSeed = Math.floor(Math.random() * 1000);
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: memberName,
      email: memberEmail,
      cargo: memberCargos.join(', '),
      nivelAcesso: memberRole,
      status: memberStatus,
      cpf: memberCpf,
      estadoCivil: memberEstadoCivil,
      nomeConjuge: memberNomeConjuge,
      dataNascimento: memberDataNascimento,
      telefone: memberTelefone,
      rua: memberRua,
      numero: memberNumero,
      bairro: memberBairro,
      cidade: memberCidade,
      cep: memberCep,
      dataInicio: memberDataInicio,
      dataTermino: memberDataTermino,
      avatar: memberAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
      funcao: memberFuncao
    };

    onAddMember(newMember);
    setShowAddModal(false);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setMemberName(member.name || '');
    setMemberEmail(member.email || '');
    setMemberCargo(member.cargo || 'Conselho Administrativo');
    const cargosFromMember = member.cargo
      ? member.cargo.split(', ').map(c => c.trim()).filter(Boolean)
      : ['Conselho Administrativo'];
    setMemberCargos(cargosFromMember);
    setMemberRole(member.nivelAcesso || 'Editor');
    setMemberStatus(member.status || 'Ativo');
    setMemberCpf(member.cpf || '');
    setMemberEstadoCivil(member.estadoCivil || 'Solteiro');
    setMemberNomeConjuge(member.nomeConjuge || '');
    setMemberDataNascimento(member.dataNascimento || '');
    setMemberTelefone(member.telefone || '');
    setMemberRua(member.rua || '');
    setMemberNumero(member.numero || '');
    setMemberBairro(member.bairro || '');
    setMemberCidade(member.cidade || '');
    setMemberCep(member.cep || '');
    setMemberDataInicio(member.dataInicio || '');
    setMemberDataTermino(member.dataTermino || '');
    setMemberAvatar(member.avatar || '');
    setMemberFuncao(member.funcao || 'Presidente');
    setActiveFormTab('geral');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated: Member = {
      ...editingMember,
      name: memberName,
      email: memberEmail,
      cargo: memberCargos.join(', '),
      nivelAcesso: memberRole,
      status: memberStatus,
      cpf: memberCpf,
      estadoCivil: memberEstadoCivil,
      nomeConjuge: memberNomeConjuge,
      dataNascimento: memberDataNascimento,
      telefone: memberTelefone,
      rua: memberRua,
      numero: memberNumero,
      bairro: memberBairro,
      cidade: memberCidade,
      cep: memberCep,
      dataInicio: memberDataInicio,
      dataTermino: memberDataTermino,
      avatar: memberAvatar || editingMember.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${memberName}`,
      funcao: memberFuncao
    };

    onEditMember(updated);
    setEditingMember(null);
  };

  const activeCount = members.filter(m => m.status === 'Ativo').length;
  const cargosList = ['Todos', 'Conselho Administrativo', 'Diretoria', 'Conselho Fiscal'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto w-full font-sans"
    >
      {/* Page header and Add button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className={`text-3xl font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>Membros da Equipe</h2>
          <p className={`text-sm ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>Gerencie os acessos e permissões dos usuários no SISMNV.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <UserPlus size={15} />
          Adicionar Novo Membro
        </button>
      </div>

      {/* Grid for Filter Controls & mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Members Stat Card */}
        <div className={`border p-5 rounded-2xl flex items-center gap-4 shadow-sm ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="w-11 h-11 bg-indigo-600/10 text-indigo-500 rounded-xl flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Membros</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>{members.length}</p>
          </div>
        </div>

        {/* Active Members Stat Card */}
        <div className={`border p-5 rounded-2xl flex items-center gap-4 shadow-sm ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="w-11 h-11 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Membros Ativos</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>{activeCount}</p>
          </div>
        </div>

        {/* Filter Cargo & Filter Status Dropdown Controls in single card */}
        <div className={`md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 border p-3.5 rounded-2xl shadow-sm ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-bold text-zinc-500 px-1 block mb-0.5 uppercase tracking-wide">Cargo</label>
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className={`w-full bg-transparent border-none focus:ring-0 text-xs focus:outline-none cursor-pointer ${
                isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
              }`}
            >
              {cargosList.map((cargo) => (
                <option key={cargo} value={cargo} className={isHighContrast ? 'bg-white text-zinc-800' : 'bg-zinc-900 text-zinc-300'}>
                  {cargo === 'Todos' ? 'Todos os Cargos' : cargo}
                </option>
              ))}
            </select>
          </div>
          <div className={`hidden sm:block w-px h-8 ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 px-1 block uppercase tracking-wide">Status</label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedStatus('Todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'Todos'
                    ? 'bg-indigo-600 text-white'
                    : isHighContrast
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-850 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('Ativo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'Ativo'
                    ? 'bg-green-600 text-white shadow-sm'
                    : isHighContrast
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-850 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('Inativo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'Inativo'
                    ? 'bg-zinc-600 text-white shadow-sm'
                    : isHighContrast
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-850 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Inativos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toolbar */}
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Listagem de Membros</p>
        <div className={`flex items-center rounded-full p-0.5 border h-8 overflow-hidden ${
          isHighContrast ? 'border-zinc-200 bg-zinc-100' : 'border-zinc-800 bg-zinc-950'
        }`}>
          {/* List button */}
          <button 
            type="button"
            onClick={() => setViewMode('list')}
            title="Visualizar em Lista"
            className={`h-full rounded-full px-3 flex items-center gap-1 cursor-pointer transition-all ${
              viewMode === 'list' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : isHighContrast 
                  ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Check size={11} className={`transition-all duration-200 ${viewMode === 'list' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
            <List size={13} />
          </button>
          {/* Grid button */}
          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            title="Visualizar em Grade"
            className={`h-full rounded-full px-3 flex items-center gap-1 cursor-pointer transition-all ${
              viewMode === 'grid' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : isHighContrast 
                  ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Check size={11} className={`transition-all duration-200 ${viewMode === 'grid' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* Main Members Listing Container */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${
        isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${
                  isHighContrast ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/80'
                }`}>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Membro</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Tempo no Cargo</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isHighContrast ? 'divide-zinc-200' : 'divide-zinc-800/60'}`}>
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className={`transition-all duration-200 group cursor-pointer ${
                      isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    {/* Name and Email avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                        }`}>
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-indigo-600">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className={`text-xs font-bold group-hover:text-indigo-500 transition-colors truncate ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                          }`}>
                            {member.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-medium truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Cargo */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>{member.cargo}</span>
                        {member.funcao && (
                          <span className="text-[10px] text-purple-500 font-extrabold uppercase tracking-wider mt-0.5">{member.funcao}</span>
                        )}
                      </div>
                    </td>

                    {/* Tempo no Cargo */}
                    <td className="px-6 py-4">
                      {(() => {
                        const tempo = formatTempoNoCargo(member.dataInicio, member.dataTermino);
                        return (
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                              {tempo.duration}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {tempo.period}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Status chip pill */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        member.status === 'Ativo'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : isHighContrast
                            ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
                        {member.status}
                      </span>
                    </td>

                    {/* Row Interactive actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isHighContrast ? 'text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                          }`}
                          title="Editar Membro"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir membro ${member.name}?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                          }`}
                          title="Remover Membro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
                      Nenhum membro encontrado correspondente aos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className={`flex flex-col border rounded-xl p-4 relative overflow-hidden group transition-all duration-300 shadow-sm ${
                    isHighContrast ? 'bg-zinc-50/50 border-zinc-200 hover:border-indigo-500' : 'bg-zinc-900/20 border-zinc-800/60 hover:border-indigo-500/50 hover:bg-zinc-900/30'
                  }`}
                >
                  {/* Status Badge in corner */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                      member.status === 'Ativo'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : isHighContrast
                          ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-800'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${member.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
                      {member.status}
                    </span>
                  </div>

                  {/* Avatar and Info */}
                  <div className="flex flex-col items-center text-center mt-2 space-y-2.5">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border p-0.5 flex-shrink-0 ${
                      isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                    }`}>
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-white bg-indigo-600 rounded-full">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="w-full overflow-hidden">
                      <h3 className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${
                        isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                      }`}>
                        {member.name}
                      </h3>
                      <p className="text-[9px] text-zinc-500 font-medium truncate mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Role and Cargo Information */}
                  <div className={`mt-4 pt-3 border-t flex flex-col gap-1.5 ${
                    isHighContrast ? 'border-zinc-200' : 'border-zinc-800/80'
                  }`}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 font-semibold uppercase tracking-wider">Cargo:</span>
                      <span className={`font-bold truncate max-w-[140px] text-right ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>{member.cargo}</span>
                    </div>
                    {member.funcao && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider">Função:</span>
                        <span className="font-extrabold text-purple-500 truncate max-w-[140px] text-right">{member.funcao}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions at the bottom */}
                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-end gap-1.5 ${
                    isHighContrast ? 'border-zinc-200' : 'border-zinc-800/80'
                  }`}>
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className={`p-1 rounded-lg transition-all ${
                        isHighContrast ? 'text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                      }`}
                      title="Editar Membro"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir membro ${member.name}?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      className={`p-1 rounded-lg transition-all ${
                        isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                      }`}
                      title="Remover Membro"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="col-span-full py-10 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  Nenhum membro encontrado correspondente aos filtros.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Footer page stats */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800/80'
        }`}>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            Mostrando {filteredMembers.length} de {members.length} membros
          </p>
          <div className="flex gap-2">
            <button className={`p-1.5 rounded-lg border transition-all ${
              isHighContrast ? 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100' : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}>
              <ChevronLeft size={16} />
            </button>
            <button className={`p-1.5 rounded-lg border transition-all ${
              isHighContrast ? 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100' : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mass Import and Access Log features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={`relative h-40 rounded-2xl overflow-hidden border p-6 flex items-center group cursor-pointer hover:border-indigo-500/50 transition-all shadow-sm lg:col-span-2 ${
          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="relative z-10 space-y-1.5">
            <h3 className={`text-base font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-100'}`}>Importação em Massa</h3>
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
              Precisa adicionar centenas de membros à equipe de uma só vez? Utilize nossa planilha padrão para importar via CSV de forma rápida.
            </p>
            <button 
              onClick={() => alert('Modelo de CSV de importação baixado na pasta de Downloads (Simulado).')}
              className="mt-3 text-xs font-bold text-indigo-500 flex items-center gap-1.5 group-hover:gap-3 transition-all"
            >
              Acessar Importador <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl flex flex-col justify-between shadow-xl shadow-indigo-600/5">
          <Shield className="w-10 h-10 text-white/40 stroke-1" />
          <div className="mt-4">
            <h3 className="text-base font-bold text-white">Logs de Acesso</h3>
            <p className="text-[11px] text-indigo-100 opacity-90 mt-1 leading-relaxed">
              Monitore de forma detalhada quem acessou o SISMNV e quais alterações de acesso foram homologadas.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showAddModal || !!editingMember) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => {
              setShowAddModal(false);
              setEditingMember(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* HEADER WITH TITLE & PILL TABS */}
              <div className={`p-6 border-b ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className={`text-xl font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                      {editingMember ? 'Configurações do Membro' : 'Novo Cadastro de Membro'}
                    </h3>
                    <p className={`text-xs ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Preencha os dados cadastrais, cargo e mandato vigentes.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMember(null);
                    }} 
                    className={`p-1.5 rounded-lg transition-all ${
                      isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* HORIZONTAL TAB PILLS */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('geral')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
                      activeFormTab === 'geral'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isHighContrast
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    Dados Pessoais
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('endereco')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
                      activeFormTab === 'endereco'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isHighContrast
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    Endereço
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('cargo')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer shrink-0 ${
                      activeFormTab === 'cargo'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isHighContrast
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    Cargo & Vigência
                  </button>
                </div>
              </div>

              {/* FORM BODY */}
              <form onSubmit={editingMember ? handleEditSubmit : handleAddSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
                  {/* TWO PANEL SPLIT */}
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT PANEL: TIMELINE STEPS */}
                    <div className="hidden md:flex flex-col gap-6 w-48 shrink-0 pr-4 border-r border-zinc-800/40">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fluxo de Cadastro</span>
                      </div>
                      
                      <div className="relative pl-6 flex-1 space-y-8">
                        {/* Line */}
                        <div className={`absolute left-1.5 top-1.5 bottom-1.5 w-0.5 ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
                        
                        {/* Step 1 */}
                        <div className="relative cursor-pointer group" onClick={() => setActiveFormTab('geral')}>
                          <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-zinc-950 transition-all ${
                            activeFormTab === 'geral' ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' : 'bg-zinc-600'
                          }`} />
                          <p className={`text-xs font-bold transition-colors ${
                            activeFormTab === 'geral' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
                          }`}>Dados Pessoais</p>
                          <p className="text-[9px] text-zinc-500">Nome, CPF e Contatos</p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="relative cursor-pointer group" onClick={() => setActiveFormTab('endereco')}>
                          <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-zinc-950 transition-all ${
                            activeFormTab === 'endereco' ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' : 'bg-zinc-600'
                          }`} />
                          <p className={`text-xs font-bold transition-colors ${
                            activeFormTab === 'endereco' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
                          }`}>Endereço</p>
                          <p className="text-[9px] text-zinc-500">Residência Completa</p>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="relative cursor-pointer group" onClick={() => setActiveFormTab('cargo')}>
                          <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-zinc-950 transition-all ${
                            activeFormTab === 'cargo' ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' : 'bg-zinc-600'
                          }`} />
                          <p className={`text-xs font-bold transition-colors ${
                            activeFormTab === 'cargo' ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
                          }`}>Cargo & Vigência</p>
                          <p className="text-[9px] text-zinc-500">Vigência de Mandato</p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: FORM FIELDS BY ACTIVE TAB */}
                    <div className="flex-1 min-w-0">
                      {/* DADOS PESSOAIS TAB */}
                      {activeFormTab === 'geral' && (
                        <div className="space-y-5 animate-fadeIn">
                          {/* Profile Avatar Frame from Image */}
                          <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/25 border-zinc-850'
                          }`}>
                            <div className="relative group shrink-0">
                              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/30 flex-shrink-0 ${
                                isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                              }`}>
                                <img 
                                  src={memberAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${memberName || 'default'}`} 
                                  alt="Avatar"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover rounded-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const seed = Math.floor(Math.random() * 2000);
                                  setMemberAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
                                }}
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                                title="Gerar outro avatar"
                              >
                                <Camera size={12} />
                              </button>
                            </div>
                            <div className="text-center sm:text-left space-y-0.5">
                              <p className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Avatar do Membro</p>
                              <p className="text-[10px] text-zinc-500 leading-relaxed">
                                Clique na câmera para alterar o avatar. Por padrão, geramos um modelo baseado no nome.
                              </p>
                            </div>
                          </div>

                          {/* Fields grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome Completo */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Nome Completo *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <User size={14} />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={memberName}
                                  onChange={(e) => setMemberName(e.target.value)}
                                  placeholder="Ex: João da Silva Marinho"
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                      : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* CPF */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">CPF *</label>
                              <input
                                type="text"
                                required
                                value={memberCpf}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length <= 11) {
                                    val = val.replace(/(\d{3})(\d)/, '$1.$2');
                                    val = val.replace(/(\d{3})(\d)/, '$1.$2');
                                    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                  }
                                  setMemberCpf(val.slice(0, 14));
                                }}
                                placeholder="000.000.000-00"
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                }`}
                              />
                            </div>

                            {/* Estado Civil */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Estado Civil *</label>
                              <select
                                value={memberEstadoCivil}
                                onChange={(e) => setMemberEstadoCivil(e.target.value as any)}
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all cursor-pointer ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                    : 'bg-zinc-950 border-zinc-800 text-white'
                                }`}
                              >
                                <option value="Solteiro">Solteiro(a)</option>
                                <option value="Casado">Casado(a)</option>
                                <option value="Divorciado">Divorciado(a)</option>
                                <option value="União Estável">União Estável</option>
                                <option value="Viúvo">Viúvo(a)</option>
                              </select>
                            </div>

                            {/* Nome do cônjuge (aparece condicionalmente) */}
                            <AnimatePresence>
                              {(memberEstadoCivil === 'Casado' || memberEstadoCivil === 'União Estável') && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="md:col-span-2 overflow-hidden"
                                >
                                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Nome do Cônjuge *</label>
                                  <input
                                    type="text"
                                    required
                                    value={memberNomeConjuge}
                                    onChange={(e) => setMemberNomeConjuge(e.target.value)}
                                    placeholder="Ex: Maria de Souza Marinho"
                                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                      isHighContrast 
                                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                    }`}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Data de Nascimento */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Data de Nascimento *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <Calendar size={14} />
                                </div>
                                <input
                                  type="date"
                                  required
                                  value={memberDataNascimento}
                                  onChange={(e) => setMemberDataNascimento(e.target.value)}
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Telefone */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Telefone *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <Phone size={14} />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={memberTelefone}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 11) {
                                      val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
                                      val = val.replace(/(\d{5})(\d)/, '$1-$2');
                                    }
                                    setMemberTelefone(val.slice(0, 15));
                                  }}
                                  placeholder="(00) 00000-0000"
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                      : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* E-mail (com selo de verificação de e-mail ativo idêntico ao layout da imagem) */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">E-mail Corporativo *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <Mail size={14} />
                                </div>
                                <input
                                  type="email"
                                  required
                                  value={memberEmail}
                                  onChange={(e) => setMemberEmail(e.target.value)}
                                  placeholder="joao.marinho@empresa.com"
                                  className={`w-full border rounded-xl pl-9 pr-28 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                      : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                  }`}
                                />
                                {memberEmail.includes('@') && (
                                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[9px] font-bold text-green-500">
                                    <CheckCircle size={11} />
                                    <span>E-mail Ativo</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ENDEREÇO TAB */}
                      {activeFormTab === 'endereco' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* CEP */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">CEP *</label>
                              <input
                                type="text"
                                required
                                value={memberCep}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length <= 8) {
                                    val = val.replace(/(\d{5})(\d)/, '$1-$2');
                                  }
                                  setMemberCep(val.slice(0, 9));
                                }}
                                placeholder="00000-000"
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                }`}
                              />
                            </div>

                            {/* Rua */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Rua / Logradouro *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <MapPin size={14} />
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={memberRua}
                                  onChange={(e) => setMemberRua(e.target.value)}
                                  placeholder="Ex: Avenida Paulista, Rua da Bahia"
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                      : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Nº */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Número *</label>
                              <input
                                type="text"
                                required
                                value={memberNumero}
                                onChange={(e) => setMemberNumero(e.target.value)}
                                placeholder="Ex: 1000, Ap 52"
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                }`}
                              />
                            </div>

                            {/* Bairro */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Bairro *</label>
                              <input
                                type="text"
                                required
                                value={memberBairro}
                                onChange={(e) => setMemberBairro(e.target.value)}
                                placeholder="Ex: Centro, Savassi"
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                }`}
                              />
                            </div>

                            {/* Cidade */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Cidade *</label>
                              <input
                                type="text"
                                required
                                value={memberCidade}
                                onChange={(e) => setMemberCidade(e.target.value)}
                                placeholder="Ex: São Paulo, Belo Horizonte"
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-650'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CARGO & PERÍODO TAB */}
                      {activeFormTab === 'cargo' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cargo Checkboxes for Multi-Selection */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-2">
                                Cargo / Órgão Coletivo * (Selecione um ou mais)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Conselho Administrativo', 'Diretoria', 'Conselho Fiscal'].map((cargoOpt) => {
                                  const isSelected = memberCargos.includes(cargoOpt);
                                  return (
                                    <button
                                      key={cargoOpt}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          if (memberCargos.length > 1) {
                                            setMemberCargos(memberCargos.filter(c => c !== cargoOpt));
                                          } else {
                                            alert('Selecione pelo menos um cargo.');
                                          }
                                        } else {
                                          setMemberCargos([...memberCargos, cargoOpt]);
                                        }
                                      }}
                                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-500'
                                          : isHighContrast
                                            ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                                        isSelected
                                          ? 'bg-indigo-600 border-indigo-600 text-white'
                                          : isHighContrast
                                            ? 'border-zinc-300'
                                            : 'border-zinc-700'
                                      }`}>
                                        {isSelected && <Check size={10} className="stroke-[3]" />}
                                      </div>
                                      <span className="text-xs font-semibold">{cargoOpt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Data de Início */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Data de Início de Exercício *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <Calendar size={14} />
                                </div>
                                <input
                                  type="date"
                                  required
                                  value={memberDataInicio}
                                  onChange={(e) => setMemberDataInicio(e.target.value)}
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Data de Término */}
                            <div>
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Data de Término do Mandato *</label>
                              <div className="relative">
                                <div className="absolute left-3 top-2.5 text-zinc-500">
                                  <Calendar size={14} />
                                </div>
                                <input
                                  type="date"
                                  required
                                  value={memberDataTermino}
                                  onChange={(e) => setMemberDataTermino(e.target.value)}
                                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all ${
                                    isHighContrast 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                      : 'bg-zinc-950 border-zinc-800 text-white'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Função */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Função *</label>
                              <select
                                value={memberFuncao}
                                onChange={(e) => setMemberFuncao(e.target.value)}
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all cursor-pointer ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                    : 'bg-zinc-950 border-zinc-800 text-white'
                                }`}
                              >
                                {memberCargos.includes('Conselho Administrativo') && (
                                  <optgroup label="Conselho Administrativo">
                                    <option value="Presidente">Presidente</option>
                                    <option value="membro">membro</option>
                                  </optgroup>
                                )}
                                {memberCargos.includes('Diretoria') && (
                                  <optgroup label="Diretoria">
                                    <option value="Pr. Presidente">Pr. Presidente</option>
                                    <option value="Vice-Presidente">Vice-Presidente</option>
                                    <option value="Tesoureiro">Tesoureiro</option>
                                    <option value="Secretário">Secretário</option>
                                  </optgroup>
                                )}
                                {memberCargos.includes('Conselho Fiscal') && (
                                  <optgroup label="Conselho Fiscal">
                                    <option value="Presidente">Presidente</option>
                                    <option value="membro">membro</option>
                                  </optgroup>
                                )}
                                {memberCargos.length === 0 && (
                                  <>
                                    <option value="Presidente">Presidente</option>
                                    <option value="membro">membro</option>
                                    <option value="Pr. Presidente">Pr. Presidente</option>
                                    <option value="Vice-Presidente">Vice-Presidente</option>
                                    <option value="Tesoureiro">Tesoureiro</option>
                                    <option value="Secretário">Secretário</option>
                                  </>
                                )}
                              </select>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-zinc-500 block mb-1">Situação Cadastral *</label>
                              <select
                                value={memberStatus}
                                onChange={(e) => setMemberStatus(e.target.value as any)}
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-all cursor-pointer ${
                                  isHighContrast 
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-950' 
                                    : 'bg-zinc-950 border-zinc-800 text-white'
                                }`}
                              >
                                <option value="Ativo">Ativo (Em Exercício de Função)</option>
                                <option value="Inativo">Inativo (Mandato Expirado / Afastado)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMember(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-indigo-600/10 active:scale-98 transition-all cursor-pointer"
                  >
                    {editingMember ? 'Salvar Alterações' : 'Salvar Membro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
