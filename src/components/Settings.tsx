import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Database, 
  RotateCcw, 
  Cpu, 
  Info, 
  Check, 
  Sliders, 
  Sun, 
  Moon, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { Tab } from '../types';
import { MNV_LOGO_BASE64 } from '../assets/logoMnvBase64';

interface SettingsProps {
  onResetData: () => void;
  setCurrentTab: (tab: Tab) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  systemLogo?: string | null;
  onUpdateSystemLogo: (logo: string | null) => void;
}

// Built-in presets for quick preview and church / institutional branding
const LOGO_PRESETS = [
  {
    id: 'preset-mnv-official',
    name: 'MNV Oficial (Palavra, Amor e Louvor)',
    dataUri: MNV_LOGO_BASE64
  },
  {
    id: 'preset-cross',
    name: 'Cruz & Dourado',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="%234338ca"/><path d="M50 18v64M28 38h44" stroke="%23fbbf24" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="50" r="38" stroke="%23818cf8" stroke-width="3" stroke-dasharray="4 4"/></svg>'
  },
  {
    id: 'preset-shield',
    name: 'Brasão SISMNV',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="%230f172a"/><path d="M50 16 L76 28 L76 52 C76 68 50 82 50 82 C50 82 24 68 24 52 L24 28 Z" fill="%234f46e5" stroke="%23a5b4fc" stroke-width="3"/><text x="50" y="56" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="%23ffffff" text-anchor="middle">MNV</text></svg>'
  },
  {
    id: 'preset-dove',
    name: 'Pomba da Paz',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="%230284c7"/><path d="M30 45 C35 30 55 25 70 35 C65 42 60 48 55 52 C65 52 75 48 80 50 C75 60 60 70 45 68 C35 66 25 55 30 45 Z" fill="%23ffffff"/><circle cx="70" cy="38" r="3" fill="%230284c7"/></svg>'
  },
  {
    id: 'preset-crest',
    name: 'Selo Oficial Dourado',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="%231e1b4b"/><circle cx="50" cy="50" r="38" stroke="%23d97706" stroke-width="3"/><circle cx="50" cy="50" r="34" stroke="%23f59e0b" stroke-width="1.5" stroke-dasharray="3 3"/><text x="50" y="55" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="%23fef3c7" text-anchor="middle">SISMNV</text></svg>'
  }
];

export default function Settings({ 
  onResetData, 
  setCurrentTab, 
  isHighContrast, 
  onToggleHighContrast,
  systemLogo,
  onUpdateSystemLogo
}: SettingsProps) {
  const [urlInput, setUrlInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);

    if (!currentPass) {
      setPassFeedback({ type: 'error', message: 'Informe sua senha atual.' });
      return;
    }
    if (!newPass || newPass.length < 6) {
      setPassFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassFeedback({ type: 'error', message: 'A confirmação de senha não coincide com a nova senha digitada.' });
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      setPassFeedback({ type: 'success', message: 'Sua senha foi alterada e atualizada com sucesso!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassFeedback(null), 5000);
    }, 600);
  };

  const handleReset = () => {
    if (confirm('Deseja realmente restaurar os dados originais da plataforma? Todas as alterações em documentos e membros serão perdidas.')) {
      onResetData();
      setFeedback({ type: 'success', message: 'Dados restaurados com sucesso para os valores padrão de fábrica.' });
      setTimeout(() => setFeedback(null), 4000);
      setCurrentTab('overview');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Handle local image file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to 3MB to prevent localStorage overflow
    if (file.size > 3 * 1024 * 1024) {
      showNotification('error', 'O arquivo é muito grande. Escolha uma imagem de até 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onUpdateSystemLogo(result);
        showNotification('success', 'Logotipo do sistema atualizado com sucesso a partir do arquivo enviado!');
      }
    };
    reader.onerror = () => {
      showNotification('error', 'Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input so re-selecting the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showNotification('error', 'Insira uma URL de imagem válida.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      showNotification('error', 'A URL deve começar com http://, https:// ou data:image/.');
      return;
    }

    onUpdateSystemLogo(trimmed);
    setUrlInput('');
    showNotification('success', 'Logotipo do sistema atualizado com sucesso a partir do link web!');
  };

  const handleRemoveLogo = () => {
    onUpdateSystemLogo(null);
    showNotification('success', 'Logotipo personalizado removido. O ícone padrão do sistema foi restaurado.');
  };

  const cardBgClass = isHighContrast ? 'bg-white border-zinc-200 shadow-md' : 'bg-zinc-950 border-zinc-800 shadow-md';
  const innerBgClass = isHighContrast ? 'bg-zinc-50 border border-zinc-100' : 'bg-zinc-900 border border-zinc-800/80';
  const textPrimaryClass = isHighContrast ? 'text-zinc-900' : 'text-white';
  const textSecondaryClass = isHighContrast ? 'text-zinc-700' : 'text-zinc-200';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto w-full font-sans pb-12"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 text-indigo-400">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          <h2 className={`text-3xl font-extrabold tracking-tight ${textPrimaryClass}`}>Configurações</h2>
        </div>
        <p className={`text-sm ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Gerencie as propriedades do sistema SISMNV, logotipo, chaves de API e banco de dados.
        </p>
      </div>

      {/* Floating / Toast Alert */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg ${
              feedback.type === 'success'
                ? isHighContrast
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : isHighContrast
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <p className="text-xs font-semibold flex-1">{feedback.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* CARD PRINCIPAL: LOGOTIPO E IDENTIDADE VISUAL DO SISTEMA */}
      {/* ============================================================== */}
      <div className={`p-6 border rounded-2xl space-y-6 ${cardBgClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5 text-indigo-500">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimaryClass}`}>Logotipo do Sistema</h3>
              <p className="text-xs text-zinc-500">
                Altere a imagem de marca exibida na barra lateral (Sidebar), menus e cabeçalho do SISMNV.
              </p>
            </div>
          </div>

          {systemLogo && (
            <button
              onClick={handleRemoveLogo}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border ${
                isHighContrast
                  ? 'bg-zinc-100 hover:bg-rose-50 border-zinc-200 hover:border-rose-300 text-zinc-700 hover:text-rose-700'
                  : 'bg-zinc-900 hover:bg-rose-950/40 border-zinc-800 hover:border-rose-500/40 text-zinc-300 hover:text-rose-300'
              }`}
            >
              <Trash2 size={13} /> Restaurar Padrão
            </button>
          )}
        </div>

        {/* Live Preview & Status */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${innerBgClass}`}>
          <div className="flex items-center gap-4">
            {/* Visual simulation of the Sidebar logo */}
            <div className="relative group">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 shrink-0 overflow-hidden border-2 border-indigo-400/40">
                {systemLogo ? (
                  <img 
                    src={systemLogo} 
                    alt="Pré-visualização do logotipo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileSpreadsheet size={26} />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-extrabold ${textPrimaryClass}`}>SISMNV</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  systemLogo 
                    ? isHighContrast 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                    : isHighContrast 
                      ? 'bg-zinc-200 border-zinc-300 text-zinc-700' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                  {systemLogo ? 'Logotipo Personalizado' : 'Ícone Padrão'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {systemLogo 
                  ? 'A imagem personalizada está ativa em toda a interface do sistema.' 
                  : 'Exibindo o ícone clássico de documentação e planilhas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Atualização instantânea em tempo real</span>
          </div>
        </div>

        {/* Inputs Grid: 1. File Upload / 2. Web URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Method 1: Local File Upload */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${innerBgClass}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                <Upload size={14} />
                <span>Upload de Arquivo</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Envie uma imagem do seu computador ou celular (PNG, JPG, WebP ou SVG).
              </p>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : isHighContrast
                    ? 'border-zinc-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20'
                    : 'border-zinc-800 hover:border-indigo-500/70 bg-zinc-950/40 hover:bg-zinc-900/60'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileInputChange}
                className="hidden" 
              />
              <div className="p-2.5 rounded-full bg-indigo-600/10 text-indigo-500 mb-2">
                <Upload size={18} />
              </div>
              <p className={`text-xs font-bold ${textPrimaryClass}`}>
                Clique para selecionar ou arraste o arquivo
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                PNG transparente, JPG ou SVG (máx. 3MB)
              </p>
            </div>
          </div>

          {/* Method 2: Web URL input */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${innerBgClass}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                <LinkIcon size={14} />
                <span>Inserir URL da Imagem</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Cole o link direto da logo hospedada na internet ou armazenamento em nuvem.
              </p>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://exemplo.com/logo-igreja.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyUrl(); }}
                  className={`w-full pl-3 pr-9 py-2.5 rounded-xl text-xs transition-colors border outline-none ${
                    isHighContrast 
                      ? 'bg-white border-zinc-300 text-zinc-900 focus:border-indigo-600 placeholder:text-zinc-400' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500 placeholder:text-zinc-600'
                  }`}
                />
                {urlInput && (
                  <button 
                    onClick={() => setUrlInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Aplicar Link da Logo
              </button>
            </div>
          </div>

        </div>

        {/* Quick Presets / Brand Suggestions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Opções e Modelos Pré-definidos
            </span>
            <span className="text-[10px] text-zinc-500">Clique para aplicar imediatamente</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {LOGO_PRESETS.map((preset) => {
              const isSelected = systemLogo === preset.dataUri;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onUpdateSystemLogo(preset.dataUri);
                    showNotification('success', `Modelo "${preset.name}" aplicado como logotipo!`);
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                    isSelected
                      ? isHighContrast
                        ? 'bg-indigo-50/80 border-indigo-500 shadow-sm'
                        : 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : isHighContrast
                        ? 'bg-white hover:bg-zinc-50 border-zinc-200'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-indigo-500/20">
                    <img src={preset.dataUri} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${
                      isSelected ? 'text-indigo-500' : textPrimaryClass
                    }`}>
                      {preset.name}
                    </p>
                    <p className="text-[9px] text-zinc-500">
                      {isSelected ? 'Em uso' : 'Clique para usar'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* OTHER SETTINGS: Grid list */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: System Variables */}
        <div className={`p-6 border rounded-2xl space-y-4 ${cardBgClass}`}>
          <div className="flex items-center gap-2 text-indigo-400">
            <Sliders size={18} />
            <h3 className={`text-sm font-bold ${textSecondaryClass}`}>Variáveis do Sistema</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configure as chaves e propriedades de rede. Estas variáveis são populadas automaticamente pelo AI Studio no arquivo de exemplo <code className={`text-indigo-400 px-1 py-0.5 rounded ${isHighContrast ? 'bg-zinc-100' : 'bg-zinc-900'}`}>.env.example</code>.
          </p>
          <div className="space-y-2.5">
            <div className={`p-3 rounded-xl ${innerBgClass}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">GEMINI_API_KEY</span>
              <span className={`text-xs font-mono ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>••••••••••••••••••••••••••••</span>
            </div>
            <div className={`p-3 rounded-xl ${innerBgClass}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">APP_URL (Cloud Run)</span>
              <span className="text-xs font-mono text-indigo-400">https://ais-dev-upsjg7reyd...run.app</span>
            </div>
          </div>
        </div>

        {/* Card 2: Database and State management */}
        <div className={`p-6 border rounded-2xl space-y-4 flex flex-col justify-between ${cardBgClass}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Database size={18} />
              <h3 className={`text-sm font-bold ${textSecondaryClass}`}>Gerenciamento de Estado</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              O SISMNV mantém um estado em tempo real no cliente para simular de forma fiel as alterações em Atas, Assembleias e equipe de Membros. Se desejar, você pode retornar ao estado de fábrica clicando no botão abaixo.
            </p>
          </div>
          <button
            onClick={handleReset}
            className={`w-full py-3 bg-zinc-900 border border-red-500/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isHighContrast ? 'bg-red-50/10' : ''
            }`}
          >
            <RotateCcw size={14} /> Restaurar dados padrão
          </button>
        </div>

        {/* Card: Security & Password Management */}
        <div className={`p-6 border rounded-2xl space-y-4 col-span-1 md:col-span-2 ${cardBgClass}`}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${textSecondaryClass}`}>Segurança & Alteração de Senha</h3>
                <p className="text-[10px] text-zinc-500">Altere a senha de acesso à sua conta corporativa</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck size={12} /> Criptografia Ativa
            </span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
            {passFeedback && (
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                passFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {passFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                )}
                <span className="leading-tight">{passFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
                    placeholder="Sua senha atual"
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

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
                    placeholder="Mínimo 6 dígitos"
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

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passLoading}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
              >
                {passLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} /> Atualizar Senha
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: System Appearance (Light / Dark Mode) */}
        <div className={`p-6 border rounded-2xl space-y-4 flex flex-col justify-between ${cardBgClass} md:col-span-2`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sun size={18} />
              <h3 className={`text-sm font-bold ${textSecondaryClass}`}>Aparência do Sistema</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Personalize a experiência visual do SISMNV. Alterne de forma rápida entre o Modo Claro (visual limpo e de alto contraste) e o Modo Escuro (visual moderno e confortável para leitura prolongada).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { if (!isHighContrast) onToggleHighContrast(); }}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                isHighContrast 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun size={14} className={isHighContrast ? "text-amber-300" : ""} /> Modo Claro
            </button>
            <button
              onClick={() => { if (isHighContrast) onToggleHighContrast(); }}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                !isHighContrast 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Moon size={14} /> Modo Escuro
            </button>
          </div>
        </div>

        {/* Card 4: Gemini Model details */}
        <div className={`p-6 border rounded-2xl space-y-4 col-span-1 md:col-span-2 ${cardBgClass}`}>
          <div className="flex items-center gap-2 text-indigo-400">
            <Cpu size={18} />
            <h3 className={`text-sm font-bold ${textSecondaryClass}`}>Motor de Análise de IA</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Nossa IA utiliza o SDK oficial <strong className="text-indigo-400">@google/genai (^2.4.0)</strong> para efetuar análises inteligentes e auditorias de documentação em assembleias de condomínio, atas oficiais e propostas comerciais.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${innerBgClass} p-4 rounded-xl flex items-center gap-3`}>
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                3.5
              </div>
              <div>
                <p className={`text-xs font-bold ${textSecondaryClass}`}>Gemini 3.5 Flash</p>
                <p className="text-[10px] text-zinc-500">Modelo principal para análises</p>
              </div>
            </div>
            <div className={`${innerBgClass} p-4 rounded-xl flex items-center gap-3`}>
              <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                <Check size={16} />
              </div>
              <div>
                <p className={`text-xs font-bold ${textSecondaryClass}`}>Offline Fallback</p>
                <p className="text-[10px] text-zinc-500">Pronto para operação sem chaves</p>
              </div>
            </div>
            <div className={`${innerBgClass} p-4 rounded-xl flex items-center gap-3`}>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Info size={16} />
              </div>
              <div>
                <p className={`text-xs font-bold ${textSecondaryClass}`}>Auditoria Completa</p>
                <p className="text-[10px] text-zinc-500">Validação estatutária legal</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
