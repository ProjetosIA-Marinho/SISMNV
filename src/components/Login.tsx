import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  X,
  UserCheck,
  Building2,
  FileCheck2
} from 'lucide-react';
import { AuthUser } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  systemLogo?: string | null;
}

interface DemoProfile {
  name: string;
  email: string;
  role: string;
  accessLevel: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  badge: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    name: 'Admin User',
    email: 'projetosia.marinho@gmail.com',
    role: 'Administrador Geral',
    accessLevel: 'Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxBAshwmUynhjtsH0L8ebm92U3El4HH-3A00rJylXxlQuL0uGPeeWORWgxNzOAEmJE6MK7GyaSybaqE_II6ITA0atSLAEh_KMtsCC5T5hdyGh0vw5CFdb_FGN29Jt0jAwgQBIaQpfNxRWjzykYlLb2bwOvPGreTFjPKxRNYeOe7MA2-tr89WCtq2cDJKCA1JOb4DWq1kNvNqFOH3ORegq2nL8-ibRGtWHDBDZNjmnYSfpDfalXirFvog',
    badge: 'Acesso Total'
  },
  {
    name: 'Ítalo Diego Mariano',
    email: 'italo.marinho@sismnv.com',
    role: 'Pr. Presidente',
    accessLevel: 'Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA',
    badge: 'Presidência'
  },
  {
    name: 'Mariana Oliveira',
    email: 'mariana.o@auraquery.com',
    role: 'Diretoria / Secretária',
    accessLevel: 'Editor',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArGVb-uVa1SdApjoN4NypDZY3tFdPAec9sCR0leIXlRcNtjo28RNCYfsAb_bKvjw0FR2vPBoKV5gnEDld7Nu2YbHtUchYOw_AJYFGq4xgrFIVTUo0AcUN2XmJKXwALBfzIzXO_AyfDhQFynyHDZl2Z8aeIRDNrS2P0ofgKn84XoNLPa0ZXAaPLe4OpEa9-hx8kT_CBd7xpCqt_gCnA-S1rlQoH687iJj0Rr55-PZai2j-3k3y3eep8hA',
    badge: 'Editor de Atas'
  }
];

export default function Login({ 
  onLogin, 
  isHighContrast, 
  onToggleHighContrast, 
  systemLogo 
}: LoginProps) {
  const [email, setEmail] = useState('projetosia.marinho@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Por favor, informe seu e-mail ou usuário.');
      return;
    }

    if (!password) {
      setError('Por favor, digite sua senha de acesso.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating against credentials
    setTimeout(() => {
      setIsLoading(false);
      
      // Match predefined demo profile or create personalized session
      const matchedProfile = DEMO_PROFILES.find(
        p => p.email.toLowerCase() === trimmedEmail.toLowerCase()
      );

      const authenticatedUser: AuthUser = matchedProfile ? {
        id: matchedProfile.email,
        name: matchedProfile.name,
        email: matchedProfile.email,
        role: matchedProfile.role,
        accessLevel: matchedProfile.accessLevel,
        avatar: matchedProfile.avatar,
        rememberMe
      } : {
        id: `user-${Date.now()}`,
        name: trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: trimmedEmail,
        role: 'Administrador do Sistema',
        accessLevel: 'Admin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxBAshwmUynhjtsH0L8ebm92U3El4HH-3A00rJylXxlQuL0uGPeeWORWgxNzOAEmJE6MK7GyaSybaqE_II6ITA0atSLAEh_KMtsCC5T5hdyGh0vw5CFdb_FGN29Jt0jAwgQBIaQpfNxRWjzykYlLb2bwOvPGreTFjPKxRNYeOe7MA2-tr89WCtq2cDJKCA1JOb4DWq1kNvNqFOH3ORegq2nL8-ibRGtWHDBDZNjmnYSfpDfalXirFvog',
        rememberMe
      };

      onLogin(authenticatedUser);
    }, 600);
  };

  const handleSelectProfile = (profile: DemoProfile) => {
    setEmail(profile.email);
    setPassword('admin123');
    setError(null);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 800);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden transition-colors duration-300 select-none ${
      isHighContrast ? 'bg-zinc-100 text-zinc-900' : 'bg-[#090a0f] text-zinc-100'
    }`}>
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isHighContrast ? 'bg-indigo-300' : 'bg-indigo-600'
        }`} />
        <div className={`absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isHighContrast ? 'bg-violet-300' : 'bg-violet-700'
        }`} />
        <div className={`absolute -bottom-40 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-15 ${
          isHighContrast ? 'bg-blue-300' : 'bg-blue-600'
        }`} />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${isHighContrast ? '#000' : '#fff'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Bar with Theme Toggle */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-indigo-600 flex items-center justify-center p-0.5 border border-indigo-400/30">
            {systemLogo ? (
              <img src={systemLogo} alt="SISMNV Logo" className="w-full h-full object-cover rounded-[10px]" />
            ) : (
              <Building2 className="text-white w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider font-sans bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                SISMNV
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                v1.2.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 tracking-wide">Sistema Integrado de Gestão & Atas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHighContrast}
            title={isHighContrast ? 'Modo Escuro' : 'Modo Claro'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-medium ${
              isHighContrast 
                ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm' 
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800 shadow-lg shadow-black/40'
            }`}
          >
            {isHighContrast ? <Moon size={16} className="text-indigo-600" /> : <Sun size={16} className="text-amber-400" />}
            <span className="hidden sm:inline">{isHighContrast ? 'Modo Escuro' : 'Modo Claro'}</span>
          </button>
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className={`p-8 sm:p-9 rounded-3xl border shadow-2xl backdrop-blur-xl relative transition-all ${
            isHighContrast 
              ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/40' 
              : 'bg-zinc-900/85 border-zinc-800/80 text-zinc-100 shadow-black/80'
          }`}>
            
            {/* Header Icon and Title */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight font-sans">
                Acesse sua Conta
              </h1>
              <p className={`text-xs mt-1.5 max-w-xs mx-auto ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Digite suas credenciais para gerenciar assembleias, documentos e finanças corporativas.
              </p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2.5 text-xs"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-tight">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold uppercase tracking-wider ${
                  isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                }`}>
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: admin@sismnv.com"
                    autoComplete="email"
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium border outline-none transition-all ${
                      isHighContrast
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-semibold uppercase tracking-wider ${
                    isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                  }`}>
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSubmitted(false);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className={`w-full pl-10 pr-11 py-3 rounded-xl text-xs font-medium border outline-none transition-all ${
                      isHighContrast
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                  />
                  <span className={isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}>
                    Lembrar minhas credenciais
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Section */}
            <div className="mt-7 pt-6 border-t border-zinc-800/60">
              <p className={`text-[11px] font-semibold text-center uppercase tracking-wider mb-3 ${
                isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
              }`}>
                Acesso Rápido para Demonstração
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PROFILES.map((profile) => {
                  const isSelected = email.toLowerCase() === profile.email.toLowerCase();
                  return (
                    <button
                      key={profile.email}
                      type="button"
                      onClick={() => handleSelectProfile(profile)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected 
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30' 
                          : isHighContrast 
                            ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700' 
                            : 'bg-zinc-950/40 border-zinc-800 hover:bg-zinc-800/50 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover shrink-0" 
                        />
                        <span className="text-[11px] font-bold truncate">{profile.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-[9px] font-medium opacity-70 truncate block">{profile.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Ambiente criptografado e auditado com IA</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-zinc-500">
        <p>© 2026 SISMNV • Todos os direitos reservados • Sistema Corporativo</p>
      </footer>

      {/* Forgot Password Modal Dialog */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                  <KeyRound size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Recuperação de Acesso</h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {forgotSubmitted ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold">Instruções Enviadas!</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Enviamos um link com código de redefinição para <strong className="text-zinc-200 font-mono">{forgotEmail}</strong>. Verifique sua caixa de entrada.
                  </p>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Informe seu e-mail cadastrado. Enviaremos um link de segurança para redefinir sua senha imediatamente.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu-email@dominio.com"
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                          isHighContrast
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-100 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isHighContrast ? 'border-zinc-200 hover:bg-zinc-100' : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Enviar Link'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
