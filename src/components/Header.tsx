import React, { useState } from 'react';
import { Search, Bell, Sparkles, Laptop, Globe, Info, Menu, Contrast, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab, AuthUser } from '../types';

interface HeaderProps {
  currentTab: Tab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onToggleSidebar: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  systemLogo?: string | null;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export default function Header({ 
  currentTab, 
  searchQuery, 
  setSearchQuery, 
  onAnalyze,
  isAnalyzing,
  onToggleSidebar,
  isHighContrast,
  onToggleHighContrast,
  systemLogo,
  currentUser,
  onLogout
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
                  onClick={() => { setShowProfileMenu(false); alert('Serviço hospedado e protegido por Vercel / Cloud.'); }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 ${
                    isHighContrast ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Globe size={14} className="text-indigo-400" /> Servidor Seguro (SSL)
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
    </header>
  );
}
