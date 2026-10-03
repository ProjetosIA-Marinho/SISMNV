import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Folder,
  Users, 
  FileText, 
  Settings, 
  HelpCircle, 
  User, 
  Plus, 
  FileSpreadsheet,
  Coins,
  X,
  Mail,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from '../types';

interface SidebarProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  onNewDocument: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  isHighContrast: boolean;
  systemLogo?: string | null;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  onNewDocument,
  isOpen,
  isHighContrast,
  systemLogo
}: SidebarProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image error if systemLogo changes
  React.useEffect(() => {
    setImageError(false);
  }, [systemLogo]);

  const isExpanded = isOpen || isHovered;

  const documentationItems = [
    { id: 'overview' as Tab, label: 'Página Inicial', icon: LayoutDashboard, colorClass: 'text-zinc-400' },
    { id: 'documents' as Tab, label: 'Pastas', icon: Folder, colorClass: 'text-amber-500' }, // Default folder icon for directories (amber/yellow)
    { id: 'templates' as Tab, label: 'Documentos', icon: FileText, colorClass: 'text-blue-500' }, // File icon for document folders (blue)
    { id: 'members' as Tab, label: 'Membros', icon: Users, colorClass: 'text-zinc-400' },
  ];

  const financialItems = [
    { id: 'finance' as Tab, label: 'Financeiro', icon: Coins, colorClass: 'text-emerald-500' },
  ];

  const otherItems = [
    { id: 'settings' as Tab, label: 'Configurações', icon: Settings, colorClass: 'text-zinc-400' },
  ];

  const renderItem = (item: typeof documentationItems[0]) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setCurrentTab(item.id)}
        title={item.label}
        className={`w-full flex items-center rounded-xl transition-all cursor-pointer text-left ${
          isExpanded ? 'gap-3 px-4 py-3' : 'justify-center p-3'
        } ${
          isActive
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10'
            : isHighContrast 
              ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-medium'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'
        }`}
      >
        <Icon 
          size={18} 
          className={`${isActive ? 'text-white' : item.colorClass} shrink-0 transition-colors duration-200`} 
          style={!isActive && (item.id === 'documents' || item.id === 'templates' || item.id === 'finance') ? { color: '#9f9fa9' } : undefined}
        />
        {isExpanded && (
          <span className="text-xs tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 flex flex-col pt-8 pb-4 z-50 transition-all duration-300 ease-in-out border-r overflow-x-hidden ${
        isHighContrast 
          ? 'bg-white border-zinc-200 shadow-zinc-200/50' 
          : 'bg-zinc-950 border-zinc-800/80 shadow-black/60'
      } ${
        isExpanded ? 'w-[260px] shadow-2xl' : 'w-[72px] shadow-none'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`px-5 mb-8 flex items-center ${isExpanded ? 'justify-start gap-3' : 'justify-center'}`}>
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0 overflow-hidden relative">
          {systemLogo && !imageError ? (
            <img 
              src={systemLogo} 
              alt="Logo SISMNV" 
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <FileSpreadsheet size={18} />
          )}
        </div>
        {isExpanded && (
          <div className="whitespace-nowrap overflow-hidden transition-all duration-300">
            <h1 className={`text-lg font-bold tracking-tight transition-colors ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>SISMNV</h1>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Document Management</p>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className={`flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar ${isExpanded ? '' : 'px-2'}`}>
        {/* Section 1: Secretaria & Documentos */}
        {isExpanded && (
          <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap overflow-hidden">
            Secretaria e Documentação
          </div>
        )}
        <div className="space-y-1">
          {documentationItems.map(renderItem)}
        </div>

        {/* Visual Separation */}
        <div className={`my-3 border-t ${isHighContrast ? 'border-zinc-200' : 'border-zinc-900'}`} />

        {/* Section 2: Finanças */}
        {isExpanded && (
          <div 
            className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden"
            style={{ color: '#71717b' }}
          >
            Gestão Financeira
          </div>
        )}
        <div className="space-y-1">
          {financialItems.map(renderItem)}
        </div>

        {/* Visual Separation */}
        <div className={`my-3 border-t ${isHighContrast ? 'border-zinc-200' : 'border-zinc-900'}`} />

        {/* Section 3: Sistema */}
        {isExpanded && (
          <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap overflow-hidden">
            Sistema
          </div>
        )}
        <div className="space-y-1">
          {otherItems.map(renderItem)}
        </div>
      </nav>

      {/* Bottom Footer Items */}
      <div className={`px-3 pt-4 space-y-1.5 ${isExpanded ? '' : 'px-2'}`}>
        {/* New Document CTA Button */}
        <button
          onClick={onNewDocument}
          title="Novo Documento"
          className={`bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer mb-2 ${
            isExpanded ? 'w-full py-3 px-4' : 'w-11 h-11 mx-auto p-0'
          }`}
        >
          <Plus size={16} className="shrink-0" />
          {isExpanded && <span className="whitespace-nowrap overflow-hidden">Novo Documento</span>}
        </button>

        <button
          onClick={() => setShowSupportModal(true)}
          title="Suporte"
          className={`flex items-center rounded-xl transition-all text-left cursor-pointer ${
            isExpanded ? 'w-full gap-3 px-4 py-2.5' : 'w-11 h-11 mx-auto justify-center p-0'
          } ${
            isHighContrast 
              ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-medium' 
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'
          }`}
        >
          <HelpCircle size={18} className="shrink-0" />
          {isExpanded && <span className="text-xs font-medium tracking-wide whitespace-nowrap overflow-hidden">Suporte</span>}
        </button>
        <button
          onClick={() => setCurrentTab('settings')}
          title="Minha Conta"
          className={`flex items-center rounded-xl transition-all text-left cursor-pointer ${
            isExpanded ? 'w-full gap-3 px-4 py-2.5' : 'w-11 h-11 mx-auto justify-center p-0'
          } ${
            currentTab === 'settings'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10'
              : isHighContrast
                ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-medium'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'
          }`}
        >
          <User size={18} className={`${currentTab === 'settings' ? 'text-white' : 'text-zinc-400'} shrink-0`} />
          {isExpanded && <span className="text-xs tracking-wide whitespace-nowrap overflow-hidden">Minha Conta</span>}
        </button>
      </div>
      
      {/* Dynamic Support Modal dialog */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-left ${
                isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60 mb-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <HelpCircle size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Suporte Técnico</h3>
                </div>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Precisa de auxílio ou encontrou alguma inconsistência no SISMNV? Entre em contato direto com a nossa equipe especializada:
                </p>

                <div className="space-y-2.5">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">E-mail Principal</p>
                      <p className="text-xs font-semibold font-mono truncate text-indigo-400">suporte@sismnv.com</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Tempo de Resposta</p>
                      <p className="text-xs font-semibold text-zinc-300">Menos de 12 horas úteis</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
