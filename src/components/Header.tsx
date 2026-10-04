import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Laptop, 
  Globe, 
  Info, 
  Menu, 
  Contrast, 
  Sun, 
  Moon, 
  LogOut,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab, AuthUser } from '../types';

interface HeaderProps {
  currentTab: Tab;
  setCurrentTab?: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onToggleSidebar: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  systemLogo?: string | null;
  currentUser?: AuthUser | null;
  onUpdateUserProfile?: (updatedUser: Partial<AuthUser>) => void;
  onLogout?: () => void;
}

export default function Header({ 
  currentTab, 
  setCurrentTab,
  searchQuery, 
  setSearchQuery, 
  onAnalyze,
  isAnalyzing,
  onToggleSidebar,
  isHighContrast,
  onToggleHighContrast,
  systemLogo,
  currentUser,
  onUpdateUserProfile,
  onLogout
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const handleOpenPasswordModal = () => {
    setShowProfileMenu(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassError(null);
    setPassSuccess(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (!currentPass) {
      setPassError('Por favor, informe sua senha atual.');
      return;
    }
    if (!newPass || newPass.length < 6) {
      setPassError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('A confirmação não coincide com a nova senha.');
      return;
    }

    setIsSubmittingPass(true);
    setTimeout(() => {
      setIsSubmittingPass(false);
      setPassSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess(false);
      }, 2000);
    }, 600);
  };

  // Map tabs to beautiful translated breadcrumbs
  const getBreadcrumbs = () => {
    const sectionColorClass = isHighContrast ? 'text-zinc-500 hover:text-zinc-700' : 'text-zinc-500 hover:text-zinc-300';
    const activeColorClass = isHighContrast ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-semibold';
    const dividerColorClass = isHighContrast ? 'text-zinc-300' : 'text-zinc-700';

    switch (currentTab) {
      case 'overview':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>SISMNV</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Página Inicial</span>
          </>
        );
      case 'documents':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Assembléias</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Pastas</span>
          </>
        );
      case 'members':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Organização</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Membros</span>
          </>
        );
      case 'templates':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Biblioteca</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Documentos</span>
          </>
        );
      case 'editor':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Ferramentas</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Editor de Atas</span>
          </>
        );
      case 'settings':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Sistema</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Configurações</span>
          </>
        );
      case 'finance':
        return (
          <>
            <span className={`transition-colors ${sectionColorClass}`}>Gestão</span>
            <span className={`${dividerColorClass} text-xs font-semibold mx-1`}>/</span>
            <span className={`${activeColorClass} text-xs tracking-wider uppercase`}>Financeiro</span>
          </>
        );
      default:
        return <span className={activeColorClass}>SISMNV</span>;
    }
  };

  const getPlaceholderText = () => {
    switch (currentTab) {
      case 'members':
        return 'Procurar membros da equipe...';
      case 'documents':
        return 'Procurar documentos, pastas ou tags...';
      case 'finance':
        return 'Procurar transações, contas ou categorias...';
      default:
        return 'Procurar no SISMNV...';
    }
  };

  return (
    <header className={`flex justify-between items-center w-full px-8 h-20 sticky top-0 z-40 transition-colors duration-300 ${
      isHighContrast ? 'bg-white' : 'bg-zinc-950'
    }`}>
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1 font-sans text-xs font-medium">
        <button 
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg transition-all mr-1 flex items-center justify-center cursor-pointer ${
            isHighContrast ? 'text-zinc-600 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-500 hover:text-indigo-400 hover:bg-zinc-900'
          }`}
          title="Alternar barra lateral"
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-1 text-[11px]">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Interactive Global Search Input */}
      <div className="flex-1 max-w-lg px-8 md:block hidden">
        <div className="relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getPlaceholderText()}
            className={`w-full border focus:border-indigo-500/80 rounded-xl py-2 pl-10 pr-4 text-xs placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none ${
              isHighContrast 
                ? 'bg-zinc-50 border-zinc-200 text-zinc-950 hover:bg-zinc-100/50' 
                : 'bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-200'
            }`}
          />
        </div>
      </div>

      {/* Utility Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Analyze AI Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 tracking-wide active:scale-98 transition-all cursor-pointer ${
            isAnalyzing 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20'
          }`}
        >
          <Sparkles size={14} className={isAnalyzing ? "animate-pulse" : "animate-spin-slow"} />
          {isAnalyzing ? 'Analisando...' : 'Analisar IA'}
        </button>

        {/* Theme Toggle Button (Light/Dark Mode) */}
        <button
          onClick={onToggleHighContrast}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            isHighContrast 
              ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' 
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
          title={isHighContrast ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
        >
          {isHighContrast ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl transition-all relative cursor-pointer ${
              isHighContrast ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50 text-left ${
                  isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-sans">Notificações</h4>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Marcar como lidas
                  </button>
                </div>
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  <div className="text-xs p-2 rounded-xl bg-indigo-600/5 border border-indigo-500/10">
                    <p className="font-bold">Ata Consolidada com Sucesso</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">A assembleia ordinária foi auditada em conformidade.</p>
                    <span className="text-[8px] text-zinc-600 mt-1 block">Há 5 min</span>
                  </div>
                  <div className="text-xs p-2 rounded-xl bg-zinc-800/45 border border-zinc-800/60">
                    <p className="font-semibold">Nova Categoria Adicionada</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Nova categoria de dízimo e ofertas adicionada no financeiro.</p>
                    <span className="text-[8px] text-zinc-600 mt-1 block">Há 1 hora</span>
                  </div>
                  <div className="text-xs p-2 rounded-xl bg-zinc-800/45 border border-zinc-800/60">
                    <p className="font-semibold">Cadastro Atualizado</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Informações do conselho administrativo foram validadas.</p>
                    <span className="text-[8px] text-zinc-600 mt-1 block">Há 2 horas</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`w-px h-8 mx-1 md:block hidden ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`} />

        {/* User Profile Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-1 transition-all cursor-pointer ${
              isHighContrast ? 'hover:bg-zinc-100' : 'hover:bg-zinc-900/60'
            }`}
          >
            <div className="text-right lg:block hidden">
              <p className={`text-xs font-semibold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                {currentUser?.name || 'Admin User'}
              </p>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wide">
                {currentUser?.role || 'Administrador'}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-full overflow-hidden p-0.5 ${isHighContrast ? 'border border-zinc-200 bg-zinc-50' : 'border border-zinc-800 bg-zinc-900'}`}>
              <img
                src={currentUser?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCxBAshwmUynhjtsH0L8ebm92U3El4HH-3A00rJylXxlQuL0uGPeeWORWgxNzOAEmJE6MK7GyaSybaqE_II6ITA0atSLAEh_KMtsCC5T5hdyGh0vw5CFdb_FGN29Jt0jAwgQBIaQpfNxRWjzykYlLb2bwOvPGreTFjPKxRNYeOe7MA2-tr89WCtq2cDJKCA1JOb4DWq1kNvNqFOH3ORegq2nL8-ibRGtWHDBDZNjmnYSfpDfalXirFvog"}
                alt={currentUser?.name || "Profile User"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </button>

          {showProfileMenu && (
            <div className={`absolute right-0 mt-2 w-60 border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
              isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <div className={`px-4 py-2.5 border-b flex items-center gap-2.5 ${isHighContrast ? 'border-zinc-100' : 'border-zinc-800'}`}>
                {systemLogo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-indigo-500/30">
                    <img src={systemLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-indigo-500/30">
                    <img 
                      src={currentUser?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCxBAshwmUynhjtsH0L8ebm92U3El4HH-3A00rJylXxlQuL0uGPeeWORWgxNzOAEmJE6MK7GyaSybaqE_II6ITA0atSLAEh_KMtsCC5T5hdyGh0vw5CFdb_FGN29Jt0jAwgQBIaQpfNxRWjzykYlLb2bwOvPGreTFjPKxRNYeOe7MA2-tr89WCtq2cDJKCA1JOb4DWq1kNvNqFOH3ORegq2nL8-ibRGtWHDBDZNjmnYSfpDfalXirFvog"} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {currentUser?.name || 'Administrador'}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate font-mono">
                    {currentUser?.email || 'projetosia.marinho@gmail.com'}
                  </p>
                </div>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 ${
                    isHighContrast ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Info size={14} className="text-indigo-400" /> SISMNV v1.2.0 • Online
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); alert('Chave de API do Gemini gerenciada no painel de segredos.'); }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 ${
                    isHighContrast ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Laptop size={14} className="text-indigo-400" /> Inteligência Artificial Ativa
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (setCurrentTab) setCurrentTab('settings');
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 ${
                    isHighContrast ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Camera size={14} className="text-indigo-400" /> Alterar Foto de Perfil
                </button>
                <button
                  onClick={handleOpenPasswordModal}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 ${
                    isHighContrast ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <KeyRound size={14} className="text-amber-400" /> Alterar Minha Senha
                </button>
              </div>

              {onLogout && (
                <div className={`pt-1 mt-1 border-t ${isHighContrast ? 'border-zinc-100' : 'border-zinc-800'}`}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut size={14} className="text-red-400" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Change Password Modal Dialog */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 sm:p-7 text-left ${
                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60 mb-5">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight font-sans">Alterar Senha de Acesso</h3>
                    <p className="text-[10px] text-zinc-500">Mantenha sua conta corporativa protegida</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {passSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 className="text-base font-bold">Senha Alterada com Sucesso!</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Sua nova credencial foi atualizada e está pronta para uso no próximo acesso.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {passError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2.5 text-xs">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                      <span className="leading-tight">{passError}</span>
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Senha Atual
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="Digite sua senha atual"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                          isHighContrast
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                          isHighContrast
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Repita a nova senha"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                          isHighContrast
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isHighContrast ? 'border-zinc-200 hover:bg-zinc-100' : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPass}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingPass ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Salvar Nova Senha'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
