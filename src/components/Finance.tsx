import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowDownLeft, 
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw, 
  CreditCard, 
  Plus, 
  Trash2, 
  Tags, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Building2, 
  X, 
  Search,
  DollarSign,
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRightLeft,
  Check,
  Edit3,
  Camera,
  Upload,
  Eye,
  LayoutGrid,
  List,
  Download,
  FileSpreadsheet,
  Loader2,
  Scale,
  Landmark,
  Layers,
  PieChart,
  ShieldCheck,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Wifi,
  SlidersHorizontal,
  Lock,
  Unlock,
  Users,
  UserCheck,
  UserPlus,
  Contact,
  Phone,
  Mail,
  BookmarkPlus,
  BookmarkCheck,
  Zap,
  BarChart3,
  Activity,
  Percent,
  TrendingDown,
  MoreVertical
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';
import * as XLSX from 'xlsx';
import type { BankAccount, BankAccountType, TransactionCategory, Transaction, Transfer, FixedAsset, CreditCard, FinancialEntity } from '../types';
import { MNV_LOGO_BASE64 } from '../assets/logoMnvBase64';
import { BulkImportModal } from './BulkImportModal';
import { BulkCategoryImportModal } from './BulkCategoryImportModal';
import { BulkTransferImportModal } from './BulkTransferImportModal';

export const isLightCardColor = (color?: string) => {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  if (
    c === '#ffffff' || 
    c === '#fff' || 
    c === '#f4f4f5' || 
    c === '#f8fafc' || 
    c === '#fafafa' || 
    c === '#e4e4e7' || 
    c === '#e2e8f0' ||
    c === '#f1f5f9' ||
    c.startsWith('from-white') || 
    c.startsWith('bg-white') || 
    c.includes('white') || 
    c.includes('zinc-100') || 
    c.includes('gray-100')
  ) {
    return true;
  }
  if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
    let hex = c.substring(1);
    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 155;
    }
  }
  return false;
};

export const INITIAL_CREDIT_CARDS: CreditCard[] = [
  {
    id: 'card-cora',
    name: 'Cora Corporativo',
    cardholderName: 'FINANCEIRO MNV',
    lastFourDigits: '0447',
    brand: 'visa',
    bankName: 'Cora',
    bankAccountId: 'acc-6',
    limit: 20000,
    usedLimit: 0,
    closingDay: 8,
    dueDay: 15,
    color: '#ffffff',
    status: 'active',
    notes: 'Cartão Cora Corporativo'
  },
  {
    id: 'card-1',
    name: 'Itaú Corporate Black',
    cardholderName: 'MINISTÉRIO NOVA VIDA',
    lastFourDigits: '8842',
    brand: 'mastercard',
    bankName: 'Itaú Unibanco',
    bankAccountId: 'acc-2',
    limit: 25000,
    usedLimit: 4850.30,
    closingDay: 20,
    dueDay: 28,
    color: 'from-zinc-950 via-neutral-900 to-black',
    status: 'active',
    notes: 'Cartão corporativo para despesas ministeriais e compras da diretoria'
  },
  {
    id: 'card-2',
    name: 'Nubank Ultravioleta PJ',
    cardholderName: 'MINISTÉRIO NOVA VIDA',
    lastFourDigits: '3419',
    brand: 'mastercard',
    bankName: 'Nubank',
    bankAccountId: 'acc-6',
    limit: 12000,
    usedLimit: 1920.00,
    closingDay: 15,
    dueDay: 22,
    color: 'from-purple-950 via-indigo-950 to-zinc-950',
    status: 'active',
    notes: 'Assinaturas de software, mídias e serviços digitais'
  },
  {
    id: 'card-3',
    name: 'Bradesco Visa Infinite',
    cardholderName: 'MINISTÉRIO NOVA VIDA',
    lastFourDigits: '6014',
    brand: 'visa',
    bankName: 'Banco Bradesco',
    bankAccountId: 'acc-4',
    limit: 18000,
    usedLimit: 0,
    closingDay: 5,
    dueDay: 12,
    color: 'from-rose-950 via-red-950 to-zinc-950',
    status: 'active',
    notes: 'Cartão para manutenção predial e contingências'
  }
];

export const INITIAL_FINANCIAL_ENTITIES: FinancialEntity[] = [
  // Favorecidos / Fornecedores (Quem irá receber)
  {
    id: 'ent-1',
    name: 'CPFL Companhia Paulista de Força e Luz',
    type: 'recebedor',
    document: '02.429.980/0001-40',
    category: 'cat-5',
    subcategory: 'Energia Elétrica',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'débito automático',
    phone: '0800 010 1010',
    notes: 'Concessionária de energia elétrica do templo sede'
  },
  {
    id: 'ent-2',
    name: 'SAEP - Serviço de Água e Esgoto de Pirassununga',
    type: 'recebedor',
    document: '45.123.456/0001-78',
    category: 'cat-5',
    subcategory: 'Saneamento Água',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'débito automático',
    phone: '(19) 3565-9000',
    notes: 'Abastecimento de água e saneamento'
  },
  {
    id: 'ent-3',
    name: 'Imobiliária Central (Aluguel Templo)',
    type: 'recebedor',
    document: '12.345.678/0001-90',
    category: 'cat-4',
    subcategory: 'Sede Principal',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'transferência',
    phone: '(19) 3561-1234',
    notes: 'Locação predial templo sede - vencimento dia 10'
  },
  {
    id: 'ent-4',
    name: 'Pr. Ítalo Diego Mariano Da Silva Marinho',
    type: 'ambos',
    document: '123.456.789-00',
    category: 'cat-6',
    subcategory: 'Prebenda Pastoral',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'pix',
    phone: '(19) 99876-5432',
    notes: 'Pastor Presidente e dízimos/ofertas ministeriais'
  },
  {
    id: 'ent-5',
    name: 'Supermercado Paulistão Ltda',
    type: 'recebedor',
    document: '55.666.777/0001-88',
    category: 'cat-7',
    subcategory: 'Cestas Básicas',
    defaultAccountId: 'acc-1',
    defaultPaymentMethod: 'pix',
    notes: 'Alimentos para cestas básicas da Ação Social'
  },
  {
    id: 'ent-6',
    name: 'Livraria e Distribuidora Cristã Fonte de Vida',
    type: 'recebedor',
    category: 'cat-7',
    defaultPaymentMethod: 'boleto',
    notes: 'Materiais de estudo, revistas de EBD e Bíblias'
  },
  {
    id: 'ent-7',
    name: 'Posto São Pedro de Pirassununga',
    type: 'recebedor',
    category: 'cat-7',
    defaultPaymentMethod: 'cartão',
    notes: 'Combustível da Van e veículos ministeriais'
  },
  // Pagadores / Contribuintes / Doadores (Quem irá pagar)
  {
    id: 'ent-8',
    name: 'Dízimos Culto Geral (Membros Diversos)',
    type: 'pagador',
    category: 'cat-1',
    subcategory: 'Membros',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'pix',
    notes: 'Entrada coletiva de dízimos nos cultos'
  },
  {
    id: 'ent-9',
    name: 'Ofertas Voluntárias dos Cultos',
    type: 'pagador',
    category: 'cat-2',
    subcategory: 'Culto de Domingo',
    defaultAccountId: 'acc-1',
    defaultPaymentMethod: 'dinheiro',
    notes: 'Coleta de ofertas dos cultos de domingo e semanais'
  },
  {
    id: 'ent-10',
    name: 'Patrícia Gonçalves Rombe Marinho',
    type: 'ambos',
    document: '234.567.890-11',
    category: 'cat-1',
    subcategory: 'Membros',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'pix',
    phone: '(19) 98765-4321',
    notes: 'Tesoureira do Ministério e doadora'
  },
  {
    id: 'ent-11',
    name: 'Ricardo Silva',
    type: 'pagador',
    category: 'cat-1',
    subcategory: 'Membros',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'pix',
    notes: 'Membro do Conselho'
  },
  {
    id: 'ent-12',
    name: 'Mariana Oliveira',
    type: 'pagador',
    category: 'cat-1',
    subcategory: 'Membros',
    defaultAccountId: 'acc-2',
    defaultPaymentMethod: 'pix'
  },
  {
    id: 'ent-13',
    name: 'Campanha Missionária Sertão & África',
    type: 'pagador',
    category: 'cat-3',
    subcategory: 'Projetos Globais',
    defaultAccountId: 'acc-1',
    defaultPaymentMethod: 'pix',
    notes: 'Doações direcionadas às missões'
  }
];

export function CreditCardBrandLogo({ brand, size = 28, isLight = false }: { brand?: string; size?: number; isLight?: boolean }) {
  const b = (brand || '').toLowerCase();
  if (b === 'visa') {
    return (
      <span className={`font-black italic tracking-tighter font-sans text-sm select-none ${isLight ? 'text-zinc-950 font-black' : 'text-white drop-shadow'}`}>
        VISA
      </span>
    );
  }
  if (b === 'mastercard') {
    return (
      <div className="flex items-center -space-x-2 select-none drop-shadow">
        <div className="w-5 h-5 rounded-full bg-red-600/90 shadow-inner" />
        <div className="w-5 h-5 rounded-full bg-amber-400/90 shadow-inner mix-blend-screen" />
      </div>
    );
  }
  if (b === 'elo') {
    return (
      <div className={`flex items-center gap-0.5 font-black text-xs tracking-tight select-none ${isLight ? 'text-zinc-950' : 'text-white drop-shadow'}`}>
        <span className="text-yellow-500">e</span>
        <span className="text-red-500">l</span>
        <span className="text-sky-500">o</span>
      </div>
    );
  }
  if (b === 'amex') {
    return (
      <span className={`font-black text-[9px] tracking-widest border px-1 py-0.5 rounded select-none ${
        isLight ? 'text-sky-950 border-sky-500/60 bg-sky-100 font-extrabold' : 'text-sky-200 border-sky-400/50 bg-sky-950/70'
      }`}>
        AMEX
      </span>
    );
  }
  if (b === 'hipercard') {
    return (
      <span className="font-black text-[10px] text-red-500 italic tracking-tighter select-none">
        HIPERCARD
      </span>
    );
  }
  return <CreditCard size={size * 0.65} className={isLight ? 'text-zinc-800' : 'text-zinc-300'} />;
}

export const getAccountTypeLabel = (type?: BankAccountType | string) => {
  switch (type) {
    case 'caixa_fisico':
      return 'Caixa Físico';
    case 'conta_corrente':
      return 'Conta Corrente';
    case 'conta_poupanca':
      return 'Conta Poupança';
    case 'conta_investimento':
      return 'Conta Investimento';
    default:
      return 'Conta Corrente';
  }
};

function BankLogo({ bankName, imageUrl, size = 32 }: { bankName: string; imageUrl?: string; size?: number }) {
  if (imageUrl) {
    return (
      <div 
        className="rounded-full overflow-hidden border border-zinc-700/50 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <img src={imageUrl} alt={bankName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }
  const normalized = bankName.toLowerCase();
  let bg = 'bg-zinc-800';
  let fg = 'text-white';
  let content: React.ReactNode = bankName.charAt(0).toUpperCase();

  if (normalized.includes('itau') || normalized.includes('itaú')) {
    bg = 'bg-[#ec7000]';
    fg = 'text-white font-black';
    content = (
      <div className="flex flex-col items-center justify-center leading-none">
        <span className="text-[13px] font-black">i</span>
        <span className="text-[5px] tracking-widest font-bold">ITAÚ</span>
      </div>
    );
  } else if (normalized.includes('caixa')) {
    bg = 'bg-[#005c9a]';
    fg = 'text-white font-black';
    content = (
      <div className="relative flex items-center justify-center w-full h-full">
        <span className="text-[11px] font-black italic">X</span>
        <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#f29100]" />
      </div>
    );
  } else if (normalized.includes('cora')) {
    bg = 'bg-[#6b1236]';
    fg = 'text-white font-extrabold';
    content = <span className="text-[9px] font-black tracking-tighter">cora</span>;
  } else if (normalized.includes('nubank')) {
    bg = 'bg-[#820ad1]';
    fg = 'text-white font-bold';
    content = <span className="text-[10px] font-black">Nu</span>;
  } else if (normalized.includes('bradesco')) {
    bg = 'bg-[#cc092f]';
    fg = 'text-white font-black';
    content = <span className="text-[10px] font-black">B</span>;
  } else if (normalized.includes('brasil') || normalized.includes('banco do brasil') || normalized.includes('bb')) {
    bg = 'bg-[#fcf300]';
    fg = 'text-[#0038a8] font-extrabold';
    content = <span className="text-[10px] font-black">BB</span>;
  } else if (normalized.includes('inter')) {
    bg = 'bg-[#ff7a00]';
    fg = 'text-white font-black';
    content = <span className="text-[10px] font-black">I</span>;
  } else if (normalized.includes('santander')) {
    bg = 'bg-[#ec0000]';
    fg = 'text-white font-black';
    content = <span className="text-[10px]">S</span>;
  } else if (normalized.includes('dinheiro') || normalized.includes('espécie') || normalized.includes('espece')) {
    bg = 'bg-emerald-600';
    fg = 'text-white font-black';
    content = <span className="text-[11px] font-mono">$</span>;
  }

  return (
    <div 
      className={`rounded-lg ${bg} ${fg} flex items-center justify-center shadow-inner shrink-0 select-none overflow-hidden font-bold`}
      style={{ width: size, height: size }}
    >
      {content}
    </div>
  );
}

function MNVLogo({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`shrink-0 flex items-center justify-center overflow-hidden rounded-full ${className}`}
    >
      <img
        src={MNV_LOGO_BASE64}
        alt="Logo Ministério Nova Vida"
        style={{ width: size, height: size }}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

interface FinanceProps {
  isHighContrast: boolean;
  searchQuery: string;
}

export default function Finance({ isHighContrast, searchQuery }: FinanceProps) {
  // --- SUB-TABS NAVIGATION ---
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'transactions' | 'cards' | 'accounts' | 'categories' | 'reports'>('dashboard');
  const [categoryViewMode, setCategoryViewMode] = useState<'list' | 'grid'>('grid');

  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((a: BankAccount) => ({
          ...a,
          accountType: a.accountType || (a.name.toLowerCase().includes('caixa') ? 'caixa_fisico' : a.name.toLowerCase().includes('poupança') ? 'conta_poupanca' : a.name.toLowerCase().includes('invest') ? 'conta_investimento' : 'conta_corrente'),
          initialBalanceDate: a.initialBalanceDate || '2026-01-01'
        }));
        if (mapped.length === 3 && mapped.every((a: BankAccount) => ['acc-1', 'acc-2', 'acc-3'].includes(a.id))) {
          return [
            ...mapped,
            { id: 'acc-4', name: 'Movimento Bradesco', bankName: 'Banco Bradesco', agency: '0456', accountNumber: '78901-2', initialBalance: 8720, currentBalance: 8720, accountType: 'conta_corrente', initialBalanceDate: '2026-01-01' },
            { id: 'acc-5', name: 'Reserva Santander', bankName: 'Banco Santander', agency: '3344', accountNumber: '55667-8', initialBalance: 18900, currentBalance: 18900, accountType: 'conta_investimento', initialBalanceDate: '2026-01-01' },
            { id: 'acc-6', name: 'Conta Digital Nubank', bankName: 'Nubank', agency: '0001', accountNumber: '99887-1', initialBalance: 4350, currentBalance: 4350, accountType: 'conta_corrente', initialBalanceDate: '2026-01-01' },
          ];
        }
        return mapped;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'acc-1', name: 'Caixa Geral', bankName: 'Dinheiro em Espécie', agency: '0000', accountNumber: '001', initialBalance: 1500, currentBalance: 1500, accountType: 'caixa_fisico', initialBalanceDate: '2026-01-01' },
      { id: 'acc-2', name: 'Conta Principal Itaú', bankName: 'Itaú Unibanco', agency: '1234', accountNumber: '56789-0', initialBalance: 12450.50, currentBalance: 12450.50, accountType: 'conta_corrente', initialBalanceDate: '2026-01-01' },
      { id: 'acc-3', name: 'Poupança Caixa', bankName: 'Caixa Econômica', agency: '4321', accountNumber: '102030-4', initialBalance: 35000, currentBalance: 35000, accountType: 'conta_poupanca', initialBalanceDate: '2026-01-01' },
      { id: 'acc-4', name: 'Movimento Bradesco', bankName: 'Banco Bradesco', agency: '0456', accountNumber: '78901-2', initialBalance: 8720, currentBalance: 8720, accountType: 'conta_corrente', initialBalanceDate: '2026-01-01' },
      { id: 'acc-5', name: 'Reserva Santander', bankName: 'Banco Santander', agency: '3344', accountNumber: '55667-8', initialBalance: 18900, currentBalance: 18900, accountType: 'conta_investimento', initialBalanceDate: '2026-01-01' },
      { id: 'acc-6', name: 'Conta Digital Nubank', bankName: 'Nubank', agency: '0001', accountNumber: '99887-1', initialBalance: 4350, currentBalance: 4350, accountType: 'conta_corrente', initialBalanceDate: '2026-01-01' },
    ];
  });

  // --- CREDIT CARDS STATE ---
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_credit_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some((c: any) => c.id === 'card-cora' || c.lastFourDigits === '0447')) {
            return [...INITIAL_CREDIT_CARDS.filter(ic => ic.id === 'card-cora'), ...parsed];
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CREDIT_CARDS;
  });

  useEffect(() => {
    localStorage.setItem('admmnv_finance_credit_cards', JSON.stringify(creditCards));
  }, [creditCards]);

  // --- FINANCIAL ENTITIES STATE (FAVORECIDOS / QUEM RECEBE & PAGADORES / QUEM PAGA) ---
  const [financialEntities, setFinancialEntities] = useState<FinancialEntity[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_entities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FINANCIAL_ENTITIES;
  });

  useEffect(() => {
    localStorage.setItem('admmnv_finance_entities', JSON.stringify(financialEntities));
  }, [financialEntities]);

  // Modals & filters for entities (Favorecidos / Pagadores)
  const [showEntitiesManagerModal, setShowEntitiesManagerModal] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<FinancialEntity | null>(null);
  const [entityFilterType, setEntityFilterType] = useState<'todos' | 'recebedor' | 'pagador'>('todos');
  const [entitySearchQuery, setEntitySearchQuery] = useState('');

  // Form states for Entity
  const [entityFormName, setEntityFormName] = useState('');
  const [entityFormType, setEntityFormType] = useState<'recebedor' | 'pagador' | 'ambos'>('recebedor');
  const [entityFormDocument, setEntityFormDocument] = useState('');
  const [entityFormCategory, setEntityFormCategory] = useState('');
  const [entityFormSubcategory, setEntityFormSubcategory] = useState('');
  const [entityFormAccountId, setEntityFormAccountId] = useState('');
  const [entityFormPaymentMethod, setEntityFormPaymentMethod] = useState<'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | ''>('pix');
  const [entityFormPhone, setEntityFormPhone] = useState('');
  const [entityFormEmail, setEntityFormEmail] = useState('');
  const [entityFormNotes, setEntityFormNotes] = useState('');

  // Dropdown / quick feedback states for transaction modal
  const [showEntitySuggestions, setShowEntitySuggestions] = useState(false);
  const [entityQuickSuccessMsg, setEntityQuickSuccessMsg] = useState<string | null>(null);

  // Dashboard Bank Accounts Horizontal View state
  const [accountsViewMode, setAccountsViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [dashSelectedCardIndex, setDashSelectedCardIndex] = useState(0);
  const accountsScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollAccountsLeft, setCanScrollAccountsLeft] = useState(false);
  const [canScrollAccountsRight, setCanScrollAccountsRight] = useState(false);

  const checkAccountsScroll = () => {
    if (!accountsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = accountsScrollRef.current;
    setCanScrollAccountsLeft(scrollLeft > 10);
    setCanScrollAccountsRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollAccounts = (direction: 'left' | 'right') => {
    if (!accountsScrollRef.current) return;
    const scrollAmount = 300;
    accountsScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAccountsScroll();
    }, 60);
    const handleResize = () => checkAccountsScroll();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [accounts, activeSubTab, accountsViewMode]);

  const [categories, setCategories] = useState<TransactionCategory[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cat-1', code: '1.01', name: 'Dízimos', type: 'entrada', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20', subcategories: ['Membros', 'Visitantes', 'Transferências Online', 'PIX'], group: 'Receitas', mainCategory: 'Receitas', parentCategory: 'Dízimos e Ofertas', description: 'Arrecadação regular de dízimos dos membros e congregados' },
      { id: 'cat-2', code: '1.02', name: 'Ofertas Regulares', type: 'entrada', color: 'bg-green-500/15 text-green-500 border-green-500/20', subcategories: ['Culto de Domingo', 'Culto de Ensino', 'Círculo de Oração'], group: 'Receitas', mainCategory: 'Receitas', parentCategory: 'Dízimos e Ofertas', description: 'Ofertas voluntárias recolhidas durante os cultos e reuniões' },
      { id: 'cat-3', code: '1.03', name: 'Ofertas de Missões', type: 'entrada', color: 'bg-teal-500/15 text-teal-500 border-teal-500/20', subcategories: ['Sertão', 'Projetos Globais', 'Missão Urbana'], group: 'Receitas', mainCategory: 'Receitas', parentCategory: 'Dízimos e Ofertas', description: 'Ofertas e doações com destinação para evangelização e missões' },
      { id: 'cat-4', code: '2.01', name: 'Aluguel do Templo', type: 'saida', color: 'bg-red-500/15 text-red-500 border-red-500/20', subcategories: ['Sede Principal', 'Estacionamento'], group: 'Despesas Fixas', mainCategory: 'Despesas Fixas', parentCategory: 'Despesas Operacionais', description: 'Locação predial do templo e dependências anexas' },
      { id: 'cat-5', code: '2.02', name: 'Energia & Água', type: 'saida', color: 'bg-amber-500/15 text-amber-500 border-amber-500/20', subcategories: ['Energia Elétrica', 'Saneamento Água'], group: 'Despesas Variáveis', mainCategory: 'Despesas Variáveis', parentCategory: 'Utilidades e Consumo', description: 'Contas de consumo elétrico e abastecimento de água' },
      { id: 'cat-6', code: '2.03', name: 'Salários & Prebendas', type: 'saida', color: 'bg-rose-500/15 text-rose-500 border-rose-500/20', subcategories: ['Prebenda Pastoral', 'Zeladoria', 'Secretaria'], group: 'Despesas Fixas', mainCategory: 'Despesas Fixas', parentCategory: 'Pessoal e Pastoral', description: 'Remunerações pastorais, encargos e pessoal de apoio' },
      { id: 'cat-7', code: '3.01', name: 'Ação Social', type: 'saida', color: 'bg-sky-500/15 text-sky-500 border-sky-500/20', subcategories: ['Cestas Básicas', 'Medicamentos', 'Ajuda de Custo'], group: 'Despesas Variáveis', mainCategory: 'Despesas Variáveis', parentCategory: 'Departamentos e Ministérios', description: 'Auxílio a famílias em vulnerabilidade e projetos beneficentes' },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_transactions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tx-1', description: 'Dízimo Dominical Unificado', value: 3450, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-07-12', observation: 'Dízimos cultos de domingo' },
      { id: 'tx-2', description: 'Oferta Especial Culto de Missões', value: 850, type: 'entrada', categoryId: 'cat-3', subcategory: 'Projetos Globais', accountId: 'acc-1', date: '2026-07-12', observation: 'Destinado ao projeto África' },
      { id: 'tx-3', description: 'Pagamento Aluguel Julho', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-07-10' },
      { id: 'tx-4', description: 'Fatura de Energia Elétrica', value: 432.80, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-07-08' },
      { id: 'tx-5', description: 'Cesta Básica Ação Social', value: 350, type: 'saida', categoryId: 'cat-7', subcategory: 'Cestas Básicas', accountId: 'acc-1', date: '2026-07-05', observation: 'Ajuda de custo família necessitada' },
      
      // Histórico de dízimos, ofertas e despesas para completar 12 meses
      // Junho 2026
      { id: 'tx-jun-1', description: 'Dízimos Gerais Junho', value: 3200, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-06-15' },
      { id: 'tx-jun-2', description: 'Ofertas Regulares Junho', value: 900, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-06-20' },
      { id: 'tx-jun-3', description: 'Aluguel do Templo Junho', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-06-10' },
      { id: 'tx-jun-4', description: 'Energia Elétrica Junho', value: 380, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-06-08' },
      
      // Maio 2026
      { id: 'tx-mai-1', description: 'Dízimos Gerais Maio', value: 4100, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-05-15' },
      { id: 'tx-mai-2', description: 'Ofertas Regulares Maio', value: 1200, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-05-20' },
      { id: 'tx-mai-3', description: 'Aluguel do Templo Maio', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-05-10' },
      { id: 'tx-mai-4', description: 'Energia Elétrica Maio', value: 410, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-05-08' },
      
      // Abril 2026
      { id: 'tx-abr-1', description: 'Dízimos Gerais Abril', value: 3800, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-04-15' },
      { id: 'tx-abr-2', description: 'Ofertas Regulares Abril', value: 800, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-04-20' },
      { id: 'tx-abr-3', description: 'Aluguel do Templo Abril', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-04-10' },
      { id: 'tx-abr-4', description: 'Energia Elétrica Abril', value: 390, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-04-08' },

      // Março 2026
      { id: 'tx-mar-1', description: 'Dízimos Gerais Março', value: 3500, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-03-15' },
      { id: 'tx-mar-2', description: 'Ofertas Regulares Março', value: 950, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-03-20' },
      { id: 'tx-mar-3', description: 'Aluguel do Templo Março', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-03-10' },
      { id: 'tx-mar-4', description: 'Energia Elétrica Março', value: 420, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-03-08' },

      // Fevereiro 2026
      { id: 'tx-fev-1', description: 'Dízimos Gerais Fevereiro', value: 3100, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-02-15' },
      { id: 'tx-fev-2', description: 'Ofertas Regulares Fevereiro', value: 750, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-02-20' },
      { id: 'tx-fev-3', description: 'Aluguel do Templo Fevereiro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-02-10' },
      { id: 'tx-fev-4', description: 'Energia Elétrica Fevereiro', value: 350, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-02-08' },

      // Janeiro 2026
      { id: 'tx-jan-1', description: 'Dízimos Gerais Janeiro', value: 4500, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2026-01-15' },
      { id: 'tx-jan-2', description: 'Ofertas Regulares Janeiro', value: 1100, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2026-01-20' },
      { id: 'tx-jan-3', description: 'Aluguel do Templo Janeiro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2026-01-10' },
      { id: 'tx-jan-4', description: 'Energia Elétrica Janeiro', value: 450, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2026-01-08' },

      // Dezembro 2025
      { id: 'tx-dez-1', description: 'Dízimos Especiais Dezembro', value: 5200, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-12-15' },
      { id: 'tx-dez-2', description: 'Ofertas de Natal', value: 1500, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-12-24' },
      { id: 'tx-dez-3', description: 'Aluguel do Templo Dezembro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-12-10' },
      { id: 'tx-dez-4', description: 'Energia Elétrica Dezembro', value: 480, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-12-08' },

      // Novembro 2025
      { id: 'tx-nov-1', description: 'Dízimos Novembro', value: 3400, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-11-15' },
      { id: 'tx-nov-2', description: 'Ofertas Regulares Novembro', value: 850, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-11-20' },
      { id: 'tx-nov-3', description: 'Aluguel do Templo Novembro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-11-10' },
      { id: 'tx-nov-4', description: 'Energia Elétrica Novembro', value: 400, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-11-08' },

      // Outubro 2025
      { id: 'tx-out-1', description: 'Dízimos Outubro', value: 3700, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-10-15' },
      { id: 'tx-out-2', description: 'Ofertas Regulares Outubro', value: 900, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-10-20' },
      { id: 'tx-out-3', description: 'Aluguel do Templo Outubro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-10-10' },
      { id: 'tx-out-4', description: 'Energia Elétrica Outubro', value: 390, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-10-08' },

      // Setembro 2025
      { id: 'tx-set-1', description: 'Dízimos Setembro', value: 3600, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-09-15' },
      { id: 'tx-set-2', description: 'Ofertas Regulares Setembro', value: 780, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-09-20' },
      { id: 'tx-set-3', description: 'Aluguel do Templo Setembro', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-09-10' },
      { id: 'tx-set-4', description: 'Energia Elétrica Setembro', value: 370, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-09-08' },

      // Agosto 2025
      { id: 'tx-ago-1', description: 'Dízimos Agosto', value: 3300, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-08-15' },
      { id: 'tx-ago-2', description: 'Ofertas Regulares Agosto', value: 820, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-08-20' },
      { id: 'tx-ago-3', description: 'Aluguel do Templo Agosto', value: 2500, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-08-10' },
      { id: 'tx-ago-4', description: 'Energia Elétrica Agosto', value: 410, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-08-08' },

      // Julho 2025
      { id: 'tx-jul25-1', description: 'Dízimos Julho', value: 3500, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-07-15' },
      { id: 'tx-jul25-2', description: 'Ofertas Regulares Julho', value: 800, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-07-20' },
      { id: 'tx-jul25-3', description: 'Aluguel do Templo Julho', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-07-10' },
      { id: 'tx-jul25-4', description: 'Energia Elétrica Julho', value: 380, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-07-08' },

      // Junho 2025
      { id: 'tx-jun25-1', description: 'Dízimos Junho', value: 3100, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-06-15' },
      { id: 'tx-jun25-2', description: 'Ofertas Regulares Junho', value: 850, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-06-20' },
      { id: 'tx-jun25-3', description: 'Aluguel do Templo Junho', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-06-10' },
      { id: 'tx-jun25-4', description: 'Energia Elétrica Junho', value: 360, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-06-08' },

      // Maio 2025
      { id: 'tx-mai25-1', description: 'Dízimos Maio', value: 3900, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-05-15' },
      { id: 'tx-mai25-2', description: 'Ofertas Regulares Maio', value: 1100, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-05-20' },
      { id: 'tx-mai25-3', description: 'Aluguel do Templo Maio', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-05-10' },
      { id: 'tx-mai25-4', description: 'Energia Elétrica Maio', value: 390, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-05-08' },

      // Abril 2025
      { id: 'tx-abr25-1', description: 'Dízimos Abril', value: 3600, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-04-15' },
      { id: 'tx-abr25-2', description: 'Ofertas Regulares Abril', value: 750, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-04-20' },
      { id: 'tx-abr25-3', description: 'Aluguel do Templo Abril', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-04-10' },
      { id: 'tx-abr25-4', description: 'Energia Elétrica Abril', value: 370, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-04-08' },

      // Março 2025
      { id: 'tx-mar25-1', description: 'Dízimos Março', value: 3300, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-03-15' },
      { id: 'tx-mar25-2', description: 'Ofertas Regulares Março', value: 900, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-03-20' },
      { id: 'tx-mar25-3', description: 'Aluguel do Templo Março', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-03-10' },
      { id: 'tx-mar25-4', description: 'Energia Elétrica Março', value: 400, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-03-08' },

      // Fevereiro 2025
      { id: 'tx-fev25-1', description: 'Dízimos Fevereiro', value: 2900, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-02-15' },
      { id: 'tx-fev25-2', description: 'Ofertas Regulares Fevereiro', value: 700, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-02-20' },
      { id: 'tx-fev25-3', description: 'Aluguel do Templo Fevereiro', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-02-10' },
      { id: 'tx-fev25-4', description: 'Energia Elétrica Fevereiro', value: 340, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-02-08' },

      // Janeiro 2025
      { id: 'tx-jan25-1', description: 'Dízimos Janeiro', value: 4200, type: 'entrada', categoryId: 'cat-1', subcategory: 'Membros', accountId: 'acc-2', date: '2025-01-15' },
      { id: 'tx-jan25-2', description: 'Ofertas Regulares Janeiro', value: 1000, type: 'entrada', categoryId: 'cat-2', subcategory: 'Culto de Domingo', accountId: 'acc-1', date: '2025-01-20' },
      { id: 'tx-jan25-3', description: 'Aluguel do Templo Janeiro', value: 2400, type: 'saida', categoryId: 'cat-4', subcategory: 'Sede Principal', accountId: 'acc-2', date: '2025-01-10' },
      { id: 'tx-jan25-4', description: 'Energia Elétrica Janeiro', value: 420, type: 'saida', categoryId: 'cat-5', subcategory: 'Energia Elétrica', accountId: 'acc-2', date: '2025-01-08' }
    ];
  });

  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_transfers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tf-1', sourceAccountId: 'acc-1', destinationAccountId: 'acc-2', value: 1000, date: '2026-07-13', observation: 'Depósito de dinheiro do caixa em conta' },
      { id: 'tf-2', sourceAccountId: 'acc-2', destinationAccountId: 'acc-3', value: 2000, date: '2026-07-11', observation: 'Aporte poupança reformas' }
    ];
  });

  // --- ATIVOS IMOBILIZADOS / PATRIMÔNIO (PARA BALANÇO PATRIMONIAL) ---
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem('admmnv_finance_fixed_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'fa-1', name: 'Templo Sede (Imóvel & Terreno Próprio)', category: 'Imóveis e Terrenos', acquisitionValue: 580000, currentValue: 650000, acquisitionDate: '2023-03-15', description: 'Edificação principal com 480m²' },
      { id: 'fa-2', name: 'Van Renault Master 16L', category: 'Veículos', acquisitionValue: 160000, currentValue: 135000, acquisitionDate: '2024-05-10', description: 'Transporte ministerial e ação social' },
      { id: 'fa-3', name: 'Sistema de Som e Instrumentos Musicais', category: 'Equipamentos e Instrumentos', acquisitionValue: 52000, currentValue: 45000, acquisitionDate: '2024-11-20', description: 'Mesa digital Behringer X32, microfones, bateria eletrônica e teclado Roland' },
      { id: 'fa-4', name: 'Climatização e Iluminação Cênica', category: 'Mobiliário e TI', acquisitionValue: 38000, currentValue: 32000, acquisitionDate: '2025-02-18', description: '4 aparelhos inverter 60k BTU e canhões LED' },
      { id: 'fa-5', name: 'Mobiliário e 250 Cadeiras Estofadas', category: 'Mobiliário e TI', acquisitionValue: 30000, currentValue: 26000, acquisitionDate: '2024-08-12', description: 'Cadeiras acolchoadas, púlpito e mesa de apoio' },
      { id: 'fa-6', name: 'Equipamentos de Transmissão e Informática', category: 'Mobiliário e TI', acquisitionValue: 24000, currentValue: 21500, acquisitionDate: '2025-06-05', description: '2 Câmeras 4K Sony, switcher Blackmagic e PC de transmissão' }
    ];
  });

  // --- BALANÇO PATRIMONIAL FILTERS & MODAL STATE ---
  const [balancoBaseYear, setBalancoBaseYear] = useState<string>('2025');
  const [balancoCompYear, setBalancoCompYear] = useState<string>('2024');
  const [balancoPeriodScope, setBalancoPeriodScope] = useState<string>('all');
  const [balancoCompareEnabled, setBalancoCompareEnabled] = useState<boolean>(true);
  const [showAddAssetModal, setShowAddAssetModal] = useState<boolean>(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetFormName, setAssetFormName] = useState<string>('');
  const [assetFormCategory, setAssetFormCategory] = useState<FixedAsset['category']>('Imóveis e Terrenos');
  const [assetFormAcqValue, setAssetFormAcqValue] = useState<string>('');
  const [assetFormCurValue, setAssetFormCurValue] = useState<string>('');
  const [assetFormDate, setAssetFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assetFormDesc, setAssetFormDesc] = useState<string>('');

  // --- DEMONSTRATIVO (DRE / FLUXO DE CAIXA) STATE ---
  const [dreSelectedYear, setDreSelectedYear] = useState<string>('2026');
  const [dreExpandedCategories, setDreExpandedCategories] = useState<Record<string, boolean>>({});
  const [dreExpandAll, setDreExpandAll] = useState<boolean>(true);

  // --- DASHBOARD FILTER STATE ---
  const [dashSelectedYear, setDashSelectedYear] = useState<string>('all');
  const [dashSelectedMonth, setDashSelectedMonth] = useState<string>('all');
  const [showPrintReportModal, setShowPrintReportModal] = useState<boolean>(false);
  const [showPrintBalancoModal, setShowPrintBalancoModal] = useState<boolean>(false);
  const [showPrintDREModal, setShowPrintDREModal] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isGeneratingBalancoPDF, setIsGeneratingBalancoPDF] = useState<boolean>(false);
  const [isGeneratingDREPDF, setIsGeneratingDREPDF] = useState<boolean>(false);

  const monthsList = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const availableDashYears = Array.from(new Set([
    new Date().getFullYear().toString(),
    ...transactions.map(t => t.date.substring(0, 4))
  ])).sort().reverse();

  // --- LOCALSTORAGE SYNC ---
  useEffect(() => { localStorage.setItem('admmnv_finance_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('admmnv_finance_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('admmnv_finance_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('admmnv_finance_transfers', JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { localStorage.setItem('admmnv_finance_fixed_assets', JSON.stringify(fixedAssets)); }, [fixedAssets]);

  // --- DYNAMIC BALANCE RECALCULATION ---
  useEffect(() => {
    const updatedAccounts = accounts.map(acc => {
      let balance = Number(acc.initialBalance);
      
      transactions.forEach(tx => {
        if (tx.accountId === acc.id) {
          if (tx.type === 'entrada') balance += tx.value;
          else balance -= tx.value;
        }
      });

      transfers.forEach(tf => {
        if (tf.sourceAccountId === acc.id) balance -= tf.value;
        if (tf.destinationAccountId === acc.id) balance += tf.value;
      });

      return { ...acc, currentBalance: balance };
    });

    if (JSON.stringify(updatedAccounts) !== JSON.stringify(accounts)) {
      setAccounts(updatedAccounts);
    }
  }, [transactions, transfers]);

  // --- FINANCIAL CALCULATIONS REMOVED TO BE MOVED BELOW STATE DECLARATIONS ---

  // --- MODAL STATE ---
  const [showTxModal, setShowTxModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showBulkCategoryImportModal, setShowBulkCategoryImportModal] = useState(false);
  const [showBulkTransferImportModal, setShowBulkTransferImportModal] = useState(false);
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<{
    count: number;
    totalReceitas: number;
    totalDespesas: number;
  } | null>(null);
  const [categoryImportSuccessMsg, setCategoryImportSuccessMsg] = useState<{
    count: number;
    subcategoriesCount: number;
  } | null>(null);
  const [transferImportSuccessMsg, setTransferImportSuccessMsg] = useState<{
    count: number;
    totalValue: number;
  } | null>(null);

  const handleBulkImportCategories = (updatedCategories: TransactionCategory[], _mergeStrategy: 'merge' | 'replace') => {
    setCategories(updatedCategories);
    const totalSubs = updatedCategories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
    setCategoryImportSuccessMsg({
      count: updatedCategories.length,
      subcategoriesCount: totalSubs
    });
    setTimeout(() => {
      setCategoryImportSuccessMsg(null);
    }, 7000);
  };

  const handleBulkImportTransactions = (newTxs: Transaction[]) => {
    setTransactions(prev => [...newTxs, ...prev]);
    const totalReceitas = newTxs.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0);
    const totalDespesas = newTxs.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0);
    setBulkImportSuccessMsg({
      count: newTxs.length,
      totalReceitas,
      totalDespesas
    });
    setTimeout(() => {
      setBulkImportSuccessMsg(null);
    }, 7000);
  };

  const handleBulkImportTransfers = (newTransfers: Transfer[]) => {
    setTransfers(prev => [...newTransfers, ...prev]);
    const totalValue = newTransfers.reduce((sum, t) => sum + t.value, 0);
    setTransferImportSuccessMsg({
      count: newTransfers.length,
      totalValue
    });
    setTimeout(() => {
      setTransferImportSuccessMsg(null);
    }, 7000);
  };

  // --- EDITING & FILTER STATES FOR TRANSACTIONS ---
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txSelectedYear, setTxSelectedYear] = useState<string>('all');
  const [txSelectedMonth, setTxSelectedMonth] = useState<string>('all');
  const [txSelectedPeriod, setTxSelectedPeriod] = useState<string>('all');
  const [txStartDateFilter, setTxStartDateFilter] = useState<string>('');
  const [txEndDateFilter, setTxEndDateFilter] = useState<string>('');
  const [txSelectedAccountId, setTxSelectedAccountId] = useState<string>('all');
  const [txSelectedCategoryId, setTxSelectedCategoryId] = useState<string>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');
  const [txFilterType, setTxFilterType] = useState<'all' | 'entrada' | 'saida' | 'transfer'>('all');
  const [txSortOrder, setTxSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Search query within transactions tab
  const [txSearchQuery, setTxSearchQuery] = useState<string>('');

  // Categories Tab Search & Filters State
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'entrada' | 'saida' | 'ambas'>('all');
  const [categoryGroupFilter, setCategoryGroupFilter] = useState<string>('all');

  // --- PAGINATION & BULK SELECTION FOR TRANSACTIONS ---
  const [txCurrentPage, setTxCurrentPage] = useState<number>(1);
  const [txItemsPerPage, setTxItemsPerPage] = useState<number>(25);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Reset page to 1 whenever filters or search change
  useEffect(() => {
    setTxCurrentPage(1);
  }, [
    searchQuery,
    txSearchQuery,
    txFilterType,
    txSelectedAccountId,
    txSelectedCategoryId,
    txStatusFilter,
    txSelectedYear,
    txSelectedMonth,
    txSelectedPeriod,
    txStartDateFilter,
    txEndDateFilter,
    txSortOrder,
    txItemsPerPage
  ]);

  // Clean up selection if transactions change
  useEffect(() => {
    setSelectedTxIds(prev => prev.filter(id => transactions.some(t => t.id === id)));
  }, [transactions]);

  // --- BULK SELECTION FOR CATEGORIES ---
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Clean up category selection if categories change
  useEffect(() => {
    setSelectedCategoryIds(prev => prev.filter(id => categories.some(c => c.id === id)));
  }, [categories]);

  // --- FORM STATES ---
  const [txDescription, setTxDescription] = useState('');
  const [txValue, setTxValue] = useState('');
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txSubcategory, setTxSubcategory] = useState('');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txObservation, setTxObservation] = useState('');

  // --- NEW FORM STATES FOR ENTRADA/SAIDA ---
  const [txRecebido, setTxRecebido] = useState<'sim' | 'nao'>('sim');
  const [txRecebidoDe, setTxRecebidoDe] = useState('');
  const [txDataRecebido, setTxDataRecebido] = useState(new Date().toISOString().split('T')[0]);
  const [txDataLancamento, setTxDataLancamento] = useState(new Date().toISOString().split('T')[0]);
  const [txParcelamento, setTxParcelamento] = useState<'sim' | 'nao' | 'recorrente'>('nao');
  const [txFrequenciaParcelas, setTxFrequenciaParcelas] = useState<'anual' | 'mensal' | 'quinzenal' | 'semanal' | 'diario' | ''>('mensal');
  const [txNumeroParcelas, setTxNumeroParcelas] = useState('1');
  const [txParcelaAtual, setTxParcelaAtual] = useState('1');
  const [txFormaPagamento, setTxFormaPagamento] = useState<'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | ''>('pix');
  const [txCreditCardId, setTxCreditCardId] = useState('');

  const [txPago, setTxPago] = useState<'sim' | 'nao'>('sim');
  const [txVaiPagarQuem, setTxVaiPagarQuem] = useState('');
  const [txDataVencimento, setTxDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  
  // --- CREDIT CARDS FORM & FILTER STATES ---
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardCardholderName, setCardCardholderName] = useState('MINISTÉRIO NOVA VIDA');
  const [cardLastFourDigits, setCardLastFourDigits] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outro'>('mastercard');
  const [cardBankName, setCardBankName] = useState('');
  const [cardBankAccountId, setCardBankAccountId] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardUsedLimit, setCardUsedLimit] = useState('0');
  const [cardClosingDay, setCardClosingDay] = useState('20');
  const [cardDueDay, setCardDueDay] = useState('28');
  const [cardColor, setCardColor] = useState('from-zinc-950 via-neutral-900 to-black');
  const [cardImage, setCardImage] = useState('');
  const [cardStatus, setCardStatus] = useState<'active' | 'blocked' | 'inactive'>('active');
  const [cardNotes, setCardNotes] = useState('');
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardBrandFilter, setCardBrandFilter] = useState('todos');
  const [cardFilterByAccount, setCardFilterByAccount] = useState('todos');
  const [cardTxSelectedYear, setCardTxSelectedYear] = useState<string>('all');
  const [cardTxSelectedMonth, setCardTxSelectedMonth] = useState<string>('all');
  const [cardTxSelectedCardId, setCardTxSelectedCardId] = useState<string>('all');
  const [cardTxStatusFilter, setCardTxStatusFilter] = useState<string>('all');
  const [cardTxSearchQuery, setCardTxSearchQuery] = useState<string>('');
  const [selectedCardForView, setSelectedCardForView] = useState<CreditCard | null>(null);
  const [selectedCardPreviewImage, setSelectedCardPreviewImage] = useState<string | null>(null);
  const [selectedCardForExpense, setSelectedCardForExpense] = useState<CreditCard | null>(null);

  // --- DASHBOARD ACCOUNT EVOLUTION CHART STATE (Overview Statistic) ---
  const [dashEvolutionAccountId, setDashEvolutionAccountId] = useState<string>('all');
  const [dashEvolutionTimeframe, setDashEvolutionTimeframe] = useState<'1S' | '1M' | '1A' | 'TOTAL'>('1M');
  const [dashEvolutionHoverIdx, setDashEvolutionHoverIdx] = useState<number | null>(null);
  
  const [txReceiptImage, setTxReceiptImage] = useState<string | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Erro ao acessar a câmera:', err);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões de acesso à câmera do seu navegador.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setTxReceiptImage(dataUrl);
      }
      stopCamera();
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTxReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!showTxModal) {
      stopCamera();
    }
  }, [showTxModal]);
  
  const [closeOnSave, setCloseOnSave] = useState(true);
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');
  const [inlineCategorySubcategories, setInlineCategorySubcategories] = useState('');

  const [showInlineSubcategory, setShowInlineSubcategory] = useState(false);
  const [inlineSubcategoryName, setInlineSubcategoryName] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTfSuggestions, setShowTfSuggestions] = useState(false);
  const [autoFillFeedback, setAutoFillFeedback] = useState<string | null>(null);

  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accName, setAccName] = useState('');
  const [accBankName, setAccBankName] = useState('');
  const [accAgency, setAccAgency] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accInitialBalance, setAccInitialBalance] = useState('');
  const [accImage, setAccImage] = useState('');
  const [accType, setAccType] = useState<BankAccountType>('conta_corrente');
  const [accInitialBalanceDate, setAccInitialBalanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [tfSourceId, setTfSourceId] = useState('');
  const [tfDestId, setTfDestId] = useState('');
  const [tfValue, setTfValue] = useState('');
  const [tfDate, setTfDate] = useState(new Date().toISOString().split('T')[0]);
  const [tfObservation, setTfObservation] = useState('');
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  const [catCode, setCatCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'entrada' | 'saida' | 'ambas'>('entrada');
  const [catColor, setCatColor] = useState('emerald');
  const [catMainCategory, setCatMainCategory] = useState<'Despesas Fixas' | 'Despesas Variáveis' | 'Investimentos' | 'Receitas' | string>('Despesas Fixas');
  const [catParentCategory, setCatParentCategory] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSubcategories, setCatSubcategories] = useState<string[]>([]);
  const [modalNewSubcategory, setModalNewSubcategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [analyticsFilter, setAnalyticsFilter] = useState<'entrada' | 'saida' | 'saldo'>('entrada');

  const [newSubcategoryName, setNewSubcategoryName] = useState<Record<string, string>>({});

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningNote?: string;
    confirmButtonText?: string;
    onConfirm: () => void;
  } | null>(null);

  // --- REPORTS FILTER STATE ---
  const [reportType, setReportType] = useState<'demonstrativo' | 'balanco_patrimonial'>('demonstrativo');

  // Dynamic available years for Balanço Patrimonial comparison
  const balancoAvailableYears = React.useMemo(() => {
    const years = new Set<string>();
    transactions.forEach(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      if (d && d.length >= 4) years.add(d.substring(0, 4));
    });
    transfers.forEach(tf => {
      if (tf.date && tf.date.length >= 4) years.add(tf.date.substring(0, 4));
    });
    fixedAssets.forEach(fa => {
      if (fa.acquisitionDate && fa.acquisitionDate.length >= 4) years.add(fa.acquisitionDate.substring(0, 4));
    });
    years.add('2026');
    years.add('2025');
    years.add('2024');
    return Array.from(years).sort().reverse();
  }, [transactions, transfers, fixedAssets]);

  // --- DEMONSTRATIVO (DRE / FLUXO DE CAIXA) CALCULATION HOOK ---
  const dreCalculations = React.useMemo(() => {
    const DRE_MONTHS_LIST = [
      { key: '01', label: 'Jan', name: 'Janeiro' },
      { key: '02', label: 'Fev', name: 'Fevereiro' },
      { key: '03', label: 'Mar', name: 'Março' },
      { key: '04', label: 'Abr', name: 'Abril' },
      { key: '05', label: 'Mai', name: 'Maio' },
      { key: '06', label: 'Jun', name: 'Junho' },
      { key: '07', label: 'Jul', name: 'Julho' },
      { key: '08', label: 'Ago', name: 'Agosto' },
      { key: '09', label: 'Set', name: 'Setembro' },
      { key: '10', label: 'Out', name: 'Outubro' },
      { key: '11', label: 'Nov', name: 'Novembro' },
      { key: '12', label: 'Dez', name: 'Dezembro' }
    ];

    const cutoffYearStart = `${dreSelectedYear}-01-01`;

    let yearInitialCash = 0;
    accounts.forEach(acc => {
      let b = Number(acc.initialBalance);
      transactions.forEach(t => {
        const d = t.dataRecebido || t.dataLancamento || t.date;
        if (t.accountId === acc.id && d < cutoffYearStart) {
          if (t.type === 'entrada') b += t.value;
          else b -= t.value;
        }
      });
      transfers.forEach(tf => {
        if (tf.date < cutoffYearStart) {
          if (tf.destinationAccountId === acc.id) b += tf.value;
          if (tf.sourceAccountId === acc.id) b -= tf.value;
        }
      });
      yearInitialCash += b;
    });

    const monthlyInflow = Array(12).fill(0);
    const monthlyOutflow = Array(12).fill(0);

    transactions.forEach(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      if (d && d.startsWith(`${dreSelectedYear}-`)) {
        const mIdx = parseInt(d.substring(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          if (t.type === 'entrada') monthlyInflow[mIdx] += t.value;
          else if (t.type === 'saida') monthlyOutflow[mIdx] += t.value;
        }
      }
    });

    const monthlyResult = monthlyInflow.map((inf, idx) => inf - monthlyOutflow[idx]);
    const monthlyStartCash = Array(12).fill(0);
    const monthlyEndCash = Array(12).fill(0);

    for (let i = 0; i < 12; i++) {
      monthlyStartCash[i] = i === 0 ? yearInitialCash : monthlyEndCash[i - 1];
      monthlyEndCash[i] = monthlyStartCash[i] + monthlyResult[i];
    }

    const totalInflowYear = monthlyInflow.reduce((a, b) => a + b, 0);
    const totalOutflowYear = monthlyOutflow.reduce((a, b) => a + b, 0);
    const totalResultYear = totalInflowYear - totalOutflowYear;
    const endCashYear = monthlyEndCash[11];

    const incomeCategories = categories
      .filter(c => c.type === 'entrada' || c.type === 'ambas' || 
        transactions.some(t => t.categoryId === c.id && t.type === 'entrada' && (t.dataRecebido || t.dataLancamento || t.date).startsWith(`${dreSelectedYear}-`))
      )
      .map(cat => {
        const months = Array(12).fill(0);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'entrada') {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) {
              const mIdx = parseInt(d.substring(5, 7), 10) - 1;
              if (mIdx >= 0 && mIdx < 12) months[mIdx] += t.value;
            }
          }
        });
        const total = months.reduce((a, b) => a + b, 0);

        const subNames = new Set<string>(cat.subcategories || []);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'entrada' && t.subcategory) {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) subNames.add(t.subcategory);
          }
        });

        const subs = Array.from(subNames).map(sub => {
          const subMonths = Array(12).fill(0);
          transactions.forEach(t => {
            if (t.categoryId === cat.id && t.type === 'entrada' && t.subcategory === sub) {
              const d = t.dataRecebido || t.dataLancamento || t.date;
              if (d && d.startsWith(`${dreSelectedYear}-`)) {
                const mIdx = parseInt(d.substring(5, 7), 10) - 1;
                if (mIdx >= 0 && mIdx < 12) subMonths[mIdx] += t.value;
              }
            }
          });
          const subTotal = subMonths.reduce((a, b) => a + b, 0);
          return { name: sub, months: subMonths, total: subTotal };
        }).filter(s => s.total > 0 || (cat.subcategories && cat.subcategories.includes(s.name)));

        return {
          ...cat,
          months,
          total,
          subcategoriesList: subs
        };
      })
      .filter(c => c.total > 0 || (c.type === 'entrada'));

    const expenseCategories = categories
      .filter(c => c.type === 'saida' || c.type === 'ambas' || 
        transactions.some(t => t.categoryId === c.id && t.type === 'saida' && (t.dataLancamento || t.date).startsWith(`${dreSelectedYear}-`))
      )
      .map(cat => {
        const months = Array(12).fill(0);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'saida') {
            const d = t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) {
              const mIdx = parseInt(d.substring(5, 7), 10) - 1;
              if (mIdx >= 0 && mIdx < 12) months[mIdx] += t.value;
            }
          }
        });
        const total = months.reduce((a, b) => a + b, 0);

        const subNames = new Set<string>(cat.subcategories || []);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'saida' && t.subcategory) {
            const d = t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) subNames.add(t.subcategory);
          }
        });

        const subs = Array.from(subNames).map(sub => {
          const subMonths = Array(12).fill(0);
          transactions.forEach(t => {
            if (t.categoryId === cat.id && t.type === 'saida' && t.subcategory === sub) {
              const d = t.dataLancamento || t.date;
              if (d && d.startsWith(`${dreSelectedYear}-`)) {
                const mIdx = parseInt(d.substring(5, 7), 10) - 1;
                if (mIdx >= 0 && mIdx < 12) subMonths[mIdx] += t.value;
              }
            }
          });
          const subTotal = subMonths.reduce((a, b) => a + b, 0);
          return { name: sub, months: subMonths, total: subTotal };
        }).filter(s => s.total > 0 || (cat.subcategories && cat.subcategories.includes(s.name)));

        return {
          ...cat,
          months,
          total,
          subcategoriesList: subs
        };
      })
      .filter(c => c.total > 0 || (c.type === 'saida'));

    return {
      DRE_MONTHS_LIST,
      yearInitialCash,
      monthlyInflow,
      monthlyOutflow,
      monthlyResult,
      monthlyStartCash,
      monthlyEndCash,
      totalInflowYear,
      totalOutflowYear,
      totalResultYear,
      endCashYear,
      incomeCategories,
      expenseCategories
    };
  }, [dreSelectedYear, accounts, transactions, transfers, categories]);

  const getBalancoPeriodDateRange = (year: string, scope: string) => {
    if (scope === 'all') {
      return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Exercício de ${year} (Ano Completo)` };
    }
    if (scope === '1s') {
      return { start: `${year}-01-01`, end: `${year}-06-30`, label: `1º Semestre de ${year} (Jan - Jun)` };
    }
    if (scope === '2s') {
      return { start: `${year}-07-01`, end: `${year}-12-31`, label: `2º Semestre de ${year} (Jul - Dez)` };
    }
    if (scope === '1t') {
      return { start: `${year}-01-01`, end: `${year}-03-31`, label: `1º Trimestre de ${year} (Jan - Mar)` };
    }
    if (scope === '2t') {
      return { start: `${year}-04-01`, end: `${year}-06-30`, label: `2º Trimestre de ${year} (Abr - Jun)` };
    }
    if (scope === '3t') {
      return { start: `${year}-07-01`, end: `${year}-09-30`, label: `3º Trimestre de ${year} (Jul - Set)` };
    }
    if (scope === '4t') {
      return { start: `${year}-10-01`, end: `${year}-12-31`, label: `4º Trimestre de ${year} (Out - Dez)` };
    }
    const monthNames: Record<string, string> = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    return { start: `${year}-${scope}-01`, end: `${year}-${scope}-31`, label: `${monthNames[scope] || scope} de ${year}` };
  };

  const getPeriodClosingDescription = (year: string, scope: string) => {
    if (scope === 'all') return `31 DE DEZEMBRO DE ${year}`;
    if (scope === '1s') return `30 DE JUNHO DE ${year}`;
    if (scope === '2s') return `31 DE DEZEMBRO DE ${year}`;
    if (scope === '1t') return `31 DE MARÇO DE ${year}`;
    if (scope === '2t') return `30 DE JUNHO DE ${year}`;
    if (scope === '3t') return `30 DE SETEMBRO DE ${year}`;
    if (scope === '4t') return `31 DE DEZEMBRO DE ${year}`;
    const monthEndMap: Record<string, string> = {
      '01': `31 DE JANEIRO DE ${year}`,
      '02': `28 DE FEVEREIRO DE ${year}`,
      '03': `31 DE MARÇO DE ${year}`,
      '04': `30 DE ABRIL DE ${year}`,
      '05': `31 DE MAIO DE ${year}`,
      '06': `30 DE JUNHO DE ${year}`,
      '07': `31 DE JULHO DE ${year}`,
      '08': `31 DE AGOSTO DE ${year}`,
      '09': `30 DE SETEMBRO DE ${year}`,
      '10': `31 DE OUTUBRO DE ${year}`,
      '11': `30 DE NOVEMBRO DE ${year}`,
      '12': `31 DE DEZEMBRO DE ${year}`
    };
    return monthEndMap[scope] || `31 DE DEZEMBRO DE ${year}`;
  };

  const getAccountBalanceAtDate = (accId: string, cutoffDate: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 0;
    let bal = Number(acc.initialBalance);
    transactions.forEach(t => {
      const txDate = t.dataRecebido || t.dataLancamento || t.date;
      if (t.accountId === accId && txDate <= cutoffDate) {
        if (t.type === 'entrada') bal += t.value;
        else bal -= t.value;
      }
    });
    transfers.forEach(tf => {
      if (tf.date <= cutoffDate) {
        if (tf.destinationAccountId === accId) bal += tf.value;
        if (tf.sourceAccountId === accId) bal -= tf.value;
      }
    });
    return bal;
  };

  // --- FINANCIAL CALCULATIONS ---
  const filteredDashboardTxs = transactions.filter(tx => {
    const effectiveDate = tx.type === 'entrada'
      ? (tx.dataRecebido || tx.dataLancamento || tx.date)
      : (tx.dataVencimento || tx.dataLancamento || tx.date);

    if (activeSubTab === 'dashboard') {
      const txYear = effectiveDate.substring(0, 4);
      const txMonth = effectiveDate.substring(5, 7);
      if (dashSelectedYear !== 'all' && txYear !== dashSelectedYear) return false;
      if (dashSelectedMonth !== 'all' && txMonth !== dashSelectedMonth) return false;
    } else if (activeSubTab === 'transactions') {
      const category = categories.find(c => c.id === tx.categoryId);
      const account = accounts.find(a => a.id === tx.accountId);
      const term = searchQuery.toLowerCase();
      const matchesSearch = tx.description.toLowerCase().includes(term) ||
        (category && category.name.toLowerCase().includes(term)) ||
        (account && account.name.toLowerCase().includes(term)) ||
        (tx.subcategory && tx.subcategory.toLowerCase().includes(term)) ||
        tx.value.toString().includes(term);

      if (!matchesSearch) return false;

      // Filter by Account
      if (txSelectedAccountId !== 'all' && tx.accountId !== txSelectedAccountId) {
        return false;
      }

      // Filter by Year
      if (txSelectedYear !== 'all') {
        const txYear = effectiveDate.substring(0, 4);
        if (txYear !== txSelectedYear) return false;
      }

      // Filter by Month
      if (txSelectedMonth !== 'all') {
        const txMonth = effectiveDate.substring(5, 7);
        if (txMonth !== txSelectedMonth) return false;
      }

      // Filter by Period
      if (txSelectedPeriod !== 'all') {
        if (txSelectedPeriod === 'custom') {
          if (txStartDateFilter && effectiveDate < txStartDateFilter) return false;
          if (txEndDateFilter && effectiveDate > txEndDateFilter) return false;
        } else {
          const txDateObj = new Date(effectiveDate + 'T00:00:00');
          const now = new Date();
          const diffTime = now.getTime() - txDateObj.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (txSelectedPeriod === '7d' && (diffDays > 7 || diffDays < 0)) return false;
          if (txSelectedPeriod === '30d' && (diffDays > 30 || diffDays < 0)) return false;
          if (txSelectedPeriod === '90d' && (diffDays > 90 || diffDays < 0)) return false;
        }
      }
    }
    return true;
  });

  const totalInflow = filteredDashboardTxs.filter(tx => tx.type === 'entrada').reduce((sum, tx) => sum + tx.value, 0);
  const totalOutflow = filteredDashboardTxs.filter(tx => tx.type === 'saida').reduce((sum, tx) => sum + tx.value, 0);
  const netCashFlow = totalInflow - totalOutflow;

  const getAccountRealBalance = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 0;
    let bal = Number(acc.initialBalance || 0);
    transactions.forEach(t => {
      if (t.accountId === accId) {
        if (t.type === 'entrada') bal += t.value;
        else bal -= t.value;
      }
    });
    transfers.forEach(tf => {
      if (tf.destinationAccountId === accId) bal += tf.value;
      if (tf.sourceAccountId === accId) bal -= tf.value;
    });
    return bal;
  };

  const totalBankBalance = accounts.reduce((sum, acc) => sum + getAccountRealBalance(acc.id), 0);

  const getCardInvoiceForPeriod = (cardId: string) => {
    const cardTxs = transactions.filter(t => {
      const isThisCard = (t.creditCardId === cardId) || (t.formaPagamento === 'cartão' && t.creditCardId === cardId);
      if (!isThisCard) return false;
      if (t.type !== 'saida') return false;
      
      const effDate = t.dataVencimento || t.dataLancamento || t.date;
      const txYear = effDate.substring(0, 4);
      const txMonth = effDate.substring(5, 7);
      
      if (dashSelectedYear !== 'all' && txYear !== dashSelectedYear) return false;
      if (dashSelectedMonth !== 'all' && txMonth !== dashSelectedMonth) return false;
      
      return true;
    });
    
    const total = cardTxs.reduce((sum, t) => sum + t.value, 0);
    const card = creditCards.find(c => c.id === cardId);
    if (total === 0 && dashSelectedMonth === 'all' && dashSelectedYear === 'all' && card?.usedLimit) {
      return card.usedLimit;
    }
    return total;
  };

  // --- MINDMAP DATA & BRANCHES CALCULATIONS ---
  const totalDespesasFixas = filteredDashboardTxs
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Despesas Fixas';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const totalDespesasVariaveis = filteredDashboardTxs
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Despesas Variáveis';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const totalInvestimentos = filteredDashboardTxs
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Investimentos';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const totalOutros = filteredDashboardTxs
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.mainCategory === 'Receitas';
    })
    .reduce((sum, t) => sum + t.value, 0);

  const receitaComprometidaPct = totalInflow > 0 
    ? Math.min(100, Math.round(((totalDespesasFixas + totalDespesasVariaveis) / totalInflow) * 100))
    : 0;

  // Investment sub-branches
  const investmentCats = categories.filter(c => c.mainCategory === 'Investimentos');
  const rawInvBranches = investmentCats.map(c => ({
    name: c.name,
    val: filteredDashboardTxs.filter(t => t.categoryId === c.id).reduce((sum, t) => sum + t.value, 0)
  }));
  const investmentBranches = [...rawInvBranches];
  const defaultInvs = ['Nubank', 'CDB IPCA', 'Ações', 'Fundos FII'];
  while (investmentBranches.length < 3) {
    const currentNames = investmentBranches.map(b => b.name);
    const nextDefault = defaultInvs.find(d => !currentNames.includes(d)) || 'Outros Inv';
    investmentBranches.push({ name: nextDefault, val: 0 });
  }

  // Variable expenses sub-branches
  const variableCats = categories.filter(c => c.mainCategory === 'Despesas Variáveis');
  const rawVarBranches = variableCats.map(c => ({
    name: c.name,
    val: filteredDashboardTxs.filter(t => t.categoryId === c.id).reduce((sum, t) => sum + t.value, 0)
  }));
  const variableBranches = [...rawVarBranches];
  const defaultVars = ['Supermercado', 'Lazer & Viagens', 'Transporte/Uber', 'Restaurante'];
  while (variableBranches.length < 3) {
    const currentNames = variableBranches.map(b => b.name);
    const nextDefault = defaultVars.find(d => !currentNames.includes(d)) || 'Outras Desp';
    variableBranches.push({ name: nextDefault, val: 0 });
  }

  // --- FORM SUBMISSIONS ---
  const handleCreateInlineCategory = () => {
    if (!inlineCategoryName.trim()) return;
    const subsArray = inlineCategorySubcategories
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const colorsList: Record<string, string> = {
      emerald: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      blue: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
      purple: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
      amber: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
      rose: 'bg-rose-500/15 text-rose-500 border-rose-500/20',
      sky: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
      indigo: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20',
    };
    const typeColors = txType === 'entrada' ? ['emerald', 'blue', 'indigo'] : ['rose', 'amber', 'sky'];
    const randomColor = typeColors[Math.floor(Math.random() * typeColors.length)];
    const newCatId = `cat-${Date.now()}`;
    const newCat: TransactionCategory = {
      id: newCatId,
      name: inlineCategoryName.trim(),
      type: txType,
      color: colorsList[randomColor] || colorsList.emerald,
      subcategories: subsArray,
      mainCategory: txType === 'entrada' ? 'Receitas' : 'Despesas Variáveis'
    };
    setCategories([...categories, newCat]);
    setTxCategoryId(newCatId);
    setTxSubcategory(subsArray[0] || '');
    setInlineCategoryName('');
    setInlineCategorySubcategories('');
    setShowInlineCategory(false);
  };

  const applySmartAutoFill = (match: Transaction) => {
    setTxDescription(match.description);
    if (match.value !== undefined && match.value !== null) {
      setTxValue(match.value.toString());
    }
    if (match.categoryId) {
      setTxCategoryId(match.categoryId);
    }
    setTxSubcategory(match.subcategory || '');
    if (match.accountId) {
      setTxAccountId(match.accountId);
    }
    if (match.formaPagamento) {
      setTxFormaPagamento(match.formaPagamento);
    }
    if (match.creditCardId) {
      setTxCreditCardId(match.creditCardId);
    }
    if (match.observation) {
      setTxObservation(match.observation);
    }
    if (txType === 'entrada') {
      if (match.recebidoDe) {
        setTxRecebidoDe(match.recebidoDe);
      }
    } else {
      if (match.vaiPagarQuem) {
        setTxVaiPagarQuem(match.vaiPagarQuem);
      }
    }
    // IMPORTANTE (conforme solicitado):
    // Os campos data (dataLancamento, dataRecebido, dataVencimento),
    // status de pagamento (pago, recebido) e parcelamento (parcelamento, numeroParcelas, parcelaAtual, frequenciaParcelas)
    // permanecem inalterados e NÃO são sobrescritos.

    setShowSuggestions(false);
    setAutoFillFeedback(`Dados preenchidos com base no lançamento anterior de "${match.description}"!`);
    setTimeout(() => {
      setAutoFillFeedback(null);
    }, 4500);
  };

  const resetTxForm = () => {
    setTxDescription('');
    setTxValue('');
    setTxType('entrada');
    setTxCategoryId('');
    setTxSubcategory('');
    setTxAccountId('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxObservation('');
    
    // new fields reset
    setTxRecebido('sim');
    setTxRecebidoDe('');
    setTxDataRecebido(new Date().toISOString().split('T')[0]);
    setTxDataLancamento(new Date().toISOString().split('T')[0]);
    setTxParcelamento('nao');
    setTxFrequenciaParcelas('mensal');
    setTxNumeroParcelas('1');
    setTxParcelaAtual('1');
    setTxFormaPagamento('pix');
    setTxCreditCardId('');
    setTxPago('sim');
    setTxVaiPagarQuem('');
    setTxDataVencimento(new Date().toISOString().split('T')[0]);
    setTxReceiptImage(null);
    setShowInlineCategory(false);
    setInlineCategoryName('');
    setInlineCategorySubcategories('');
    setShowInlineSubcategory(false);
    setInlineSubcategoryName('');
    setShowSuggestions(false);
    setAutoFillFeedback(null);
  };

  const calculateInstallmentDate = (baseDateStr: string, index: number, freq: string = 'mensal') => {
    if (!baseDateStr || index === 0) return baseDateStr;
    const parts = baseDateStr.split('-');
    if (parts.length < 3) return baseDateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed (0 to 11)
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return baseDateStr;

    if (freq === 'diario') {
      const d = new Date(year, month, day);
      d.setDate(d.getDate() + index);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (freq === 'semanal') {
      const d = new Date(year, month, day);
      d.setDate(d.getDate() + index * 7);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (freq === 'quinzenal') {
      const d = new Date(year, month, day);
      d.setDate(d.getDate() + index * 15);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (freq === 'anual') {
      const targetYear = year + index;
      const targetMonth = month;
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(day, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
    } else {
      // mensal (default)
      const totalMonths = month + index;
      const targetYear = year + Math.floor(totalMonths / 12);
      const targetMonth = totalMonths % 12;
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(day, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(txValue);
    if (!txDescription.trim() || isNaN(valueNum) || valueNum <= 0 || !txCategoryId || !txAccountId) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const isParcelado = txParcelamento === 'sim';
    const isRecorrente = txParcelamento === 'recorrente';
    const curParcelaNum = isParcelado ? (parseInt(txParcelaAtual) || 1) : 1;
    const totalParcelasNum = isParcelado 
      ? (parseInt(txNumeroParcelas) || 1) 
      : isRecorrente 
      ? (parseInt(txNumeroParcelas) || 12) 
      : 1;

    if (editingTx) {
      const effectiveDate = txType === 'entrada' 
        ? (txDataRecebido || txDataLancamento) 
        : (txDataVencimento || txDataLancamento);

      const updatedTx: Transaction = {
        ...editingTx,
        description: txDescription,
        value: valueNum,
        type: txType,
        categoryId: txCategoryId,
        subcategory: txSubcategory || undefined,
        accountId: txAccountId,
        date: effectiveDate,
        observation: txObservation.trim() || undefined,
        recebido: txType === 'entrada' ? txRecebido : undefined,
        recebidoDe: txType === 'entrada' ? txRecebidoDe : undefined,
        dataRecebido: txType === 'entrada' ? txDataRecebido : undefined,
        dataLancamento: txDataLancamento,
        parcelamento: txParcelamento,
        frequenciaParcelas: (isParcelado || isRecorrente) ? (txFrequenciaParcelas || 'mensal') : undefined,
        numeroParcelas: (isParcelado || isRecorrente) ? totalParcelasNum : undefined,
        parcelaAtual: isParcelado ? curParcelaNum : (isRecorrente ? (editingTx.parcelaAtual || 1) : undefined),
        formaPagamento: txFormaPagamento || undefined,
        creditCardId: txFormaPagamento === 'cartão' && txCreditCardId ? txCreditCardId : undefined,
        pago: txType === 'saida' ? txPago : undefined,
        vaiPagarQuem: txType === 'saida' ? txVaiPagarQuem : undefined,
        dataVencimento: txType === 'saida' ? txDataVencimento : undefined,
        receiptImage: txReceiptImage || undefined,
      };

      // If user converted a single tx into parcelado or recorrente with multiple occurrences, generate subsequent
      let newExtraTxs: Transaction[] = [];
      const remainingCount = (isParcelado || isRecorrente) && totalParcelasNum > curParcelaNum
        ? (totalParcelasNum - curParcelaNum)
        : 0;

      if (remainingCount > 0 && editingTx.parcelamento === 'nao') {
        const baseTimestamp = Date.now();
        for (let i = 1; i <= remainingCount; i++) {
          const installmentIndex = curParcelaNum + i;
          const installmentLancamentoDate = calculateInstallmentDate(txDataLancamento, i, txFrequenciaParcelas || 'mensal');
          const installmentRecebidoDate = txDataRecebido ? calculateInstallmentDate(txDataRecebido, i, txFrequenciaParcelas || 'mensal') : undefined;
          const installmentVencimentoDate = txDataVencimento ? calculateInstallmentDate(txDataVencimento, i, txFrequenciaParcelas || 'mensal') : undefined;
          const futureEffectiveDate = txType === 'entrada' ? (installmentRecebidoDate || installmentLancamentoDate) : (installmentVencimentoDate || installmentLancamentoDate);

          newExtraTxs.push({
            id: `tx-${baseTimestamp}-${i}`,
            description: txDescription,
            value: valueNum,
            type: txType,
            categoryId: txCategoryId,
            subcategory: txSubcategory || undefined,
            accountId: txAccountId,
            date: futureEffectiveDate,
            observation: txObservation.trim() || undefined,
            recebido: txType === 'entrada' ? 'nao' : undefined,
            recebidoDe: txType === 'entrada' ? txRecebidoDe : undefined,
            dataRecebido: txType === 'entrada' ? installmentRecebidoDate : undefined,
            dataLancamento: installmentLancamentoDate,
            parcelamento: txParcelamento,
            frequenciaParcelas: txFrequenciaParcelas || 'mensal',
            numeroParcelas: totalParcelasNum,
            parcelaAtual: installmentIndex,
            formaPagamento: txFormaPagamento || undefined,
            creditCardId: txFormaPagamento === 'cartão' && txCreditCardId ? txCreditCardId : undefined,
            pago: txType === 'saida' ? 'nao' : undefined,
            vaiPagarQuem: txType === 'saida' ? txVaiPagarQuem : undefined,
            dataVencimento: txType === 'saida' ? installmentVencimentoDate : undefined,
            receiptImage: undefined,
          });
        }
      }

      setTransactions(transactions.map(t => t.id === editingTx.id ? updatedTx : t).concat(newExtraTxs));
      setEditingTx(null);
    } else {
      if ((isParcelado || isRecorrente) && totalParcelasNum > 1) {
        const remainingCount = isParcelado ? Math.max(1, totalParcelasNum - curParcelaNum + 1) : totalParcelasNum;
        const newInstallmentTxs: Transaction[] = [];
        const baseTimestamp = Date.now();

        for (let i = 0; i < remainingCount; i++) {
          const installmentIndex = isParcelado ? (curParcelaNum + i) : (i + 1);
          const installmentLancamentoDate = calculateInstallmentDate(txDataLancamento, i, txFrequenciaParcelas || 'mensal');
          const installmentRecebidoDate = txDataRecebido ? calculateInstallmentDate(txDataRecebido, i, txFrequenciaParcelas || 'mensal') : undefined;
          const installmentVencimentoDate = txDataVencimento ? calculateInstallmentDate(txDataVencimento, i, txFrequenciaParcelas || 'mensal') : undefined;
          const effectiveDate = txType === 'entrada' ? (installmentRecebidoDate || installmentLancamentoDate) : (installmentVencimentoDate || installmentLancamentoDate);

          newInstallmentTxs.push({
            id: `tx-${baseTimestamp}-${i}`,
            description: txDescription,
            value: valueNum,
            type: txType,
            categoryId: txCategoryId,
            subcategory: txSubcategory || undefined,
            accountId: txAccountId,
            date: effectiveDate,
            observation: txObservation.trim() || undefined,
            recebido: txType === 'entrada' ? (i === 0 ? txRecebido : 'nao') : undefined,
            recebidoDe: txType === 'entrada' ? txRecebidoDe : undefined,
            dataRecebido: txType === 'entrada' ? (i === 0 ? txDataRecebido : installmentRecebidoDate) : undefined,
            dataLancamento: installmentLancamentoDate,
            parcelamento: txParcelamento,
            frequenciaParcelas: txFrequenciaParcelas || 'mensal',
            numeroParcelas: totalParcelasNum,
            parcelaAtual: installmentIndex,
            formaPagamento: txFormaPagamento || undefined,
            creditCardId: txFormaPagamento === 'cartão' && txCreditCardId ? txCreditCardId : undefined,
            pago: txType === 'saida' ? (i === 0 ? txPago : 'nao') : undefined,
            vaiPagarQuem: txType === 'saida' ? txVaiPagarQuem : undefined,
            dataVencimento: txType === 'saida' ? (i === 0 ? txDataVencimento : installmentVencimentoDate) : undefined,
            receiptImage: i === 0 ? (txReceiptImage || undefined) : undefined,
          });
        }
        setTransactions(prev => [...newInstallmentTxs, ...prev]);
      } else {
        const effectiveDate = txType === 'entrada' ? (txDataRecebido || txDataLancamento) : (txDataVencimento || txDataLancamento);
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          description: txDescription,
          value: valueNum,
          type: txType,
          categoryId: txCategoryId,
          subcategory: txSubcategory || undefined,
          accountId: txAccountId,
          date: effectiveDate,
          observation: txObservation.trim() || undefined,
          recebido: txType === 'entrada' ? txRecebido : undefined,
          recebidoDe: txType === 'entrada' ? txRecebidoDe : undefined,
          dataRecebido: txType === 'entrada' ? txDataRecebido : undefined,
          dataLancamento: txDataLancamento,
          parcelamento: txParcelamento,
          frequenciaParcelas: (isParcelado || isRecorrente) ? txFrequenciaParcelas : undefined,
          numeroParcelas: (isParcelado || isRecorrente) ? totalParcelasNum : undefined,
          parcelaAtual: isParcelado ? curParcelaNum : (isRecorrente ? 1 : undefined),
          formaPagamento: txFormaPagamento || undefined,
          creditCardId: txFormaPagamento === 'cartão' && txCreditCardId ? txCreditCardId : undefined,
          pago: txType === 'saida' ? txPago : undefined,
          vaiPagarQuem: txType === 'saida' ? txVaiPagarQuem : undefined,
          dataVencimento: txType === 'saida' ? txDataVencimento : undefined,
          receiptImage: txReceiptImage || undefined,
        };
        setTransactions(prev => [newTx, ...prev]);
      }
    }
    
    if (closeOnSave) {
      setShowTxModal(false);
      resetTxForm();
    } else {
      // Save and continue: only reset text fields, keep modal open
      setTxDescription('');
      setTxValue('');
      setTxObservation('');
      setTxRecebidoDe('');
      setTxVaiPagarQuem('');
      setTxReceiptImage(null);
    }
  };

  // --- FINANCIAL ENTITY (FAVORECIDOS / PAGADORES) HANDLERS ---
  const handleSelectEntity = (ent: FinancialEntity) => {
    if (txType === 'entrada') {
      setTxRecebidoDe(ent.name);
    } else {
      setTxVaiPagarQuem(ent.name);
    }
    setShowEntitySuggestions(false);

    // Auto-fill default presets if configured
    let appliedDetails: string[] = [];
    if (ent.category) {
      setTxCategoryId(ent.category);
      const catObj = categories.find(c => c.id === ent.category);
      if (catObj) appliedDetails.push(`Categoria: ${catObj.name}`);
    }
    if (ent.subcategory) {
      setTxSubcategory(ent.subcategory);
      appliedDetails.push(`Subcategoria: ${ent.subcategory}`);
    }
    if (ent.defaultAccountId) {
      setTxAccountId(ent.defaultAccountId);
      const accObj = accounts.find(a => a.id === ent.defaultAccountId);
      if (accObj) appliedDetails.push(`Conta: ${accObj.name}`);
    }
    if (ent.defaultPaymentMethod) {
      setTxFormaPagamento(ent.defaultPaymentMethod);
      appliedDetails.push(`Forma: ${ent.defaultPaymentMethod.toUpperCase()}`);
    }

    if (appliedDetails.length > 0) {
      setAutoFillFeedback(`Dados preenchidos do cadastro de "${ent.name}": ${appliedDetails.join(' • ')}`);
      setTimeout(() => setAutoFillFeedback(null), 4000);
    }
  };

  const handleQuickSaveCurrentEntity = () => {
    const nameToSave = (txType === 'entrada' ? txRecebidoDe : txVaiPagarQuem).trim();
    if (!nameToSave) return;

    const exists = financialEntities.some(e => e.name.toLowerCase() === nameToSave.toLowerCase());
    if (exists) {
      setEntityQuickSuccessMsg(`"${nameToSave}" já está salvo nos seus cadastros.`);
      setTimeout(() => setEntityQuickSuccessMsg(null), 3000);
      return;
    }

    const newEnt: FinancialEntity = {
      id: `ent-${Date.now()}`,
      name: nameToSave,
      type: txType === 'entrada' ? 'pagador' : 'recebedor',
      category: txCategoryId || undefined,
      subcategory: txSubcategory || undefined,
      defaultAccountId: txAccountId || undefined,
      defaultPaymentMethod: txFormaPagamento || undefined,
      createdAt: new Date().toISOString()
    };

    setFinancialEntities(prev => [newEnt, ...prev]);
    setEntityQuickSuccessMsg(`"${nameToSave}" gravado com sucesso para preenchimento rápido!`);
    setTimeout(() => setEntityQuickSuccessMsg(null), 4000);
  };

  const resetEntityForm = () => {
    setEditingEntity(null);
    setEntityFormName('');
    setEntityFormType(txType === 'entrada' ? 'pagador' : 'recebedor');
    setEntityFormDocument('');
    setEntityFormCategory('');
    setEntityFormSubcategory('');
    setEntityFormAccountId('');
    setEntityFormPaymentMethod('pix');
    setEntityFormPhone('');
    setEntityFormEmail('');
    setEntityFormNotes('');
  };

  const handleOpenAddEntityModal = (prefillName?: string, defaultType?: 'recebedor' | 'pagador' | 'ambos') => {
    resetEntityForm();
    if (prefillName) setEntityFormName(prefillName);
    if (defaultType) setEntityFormType(defaultType);
    else setEntityFormType(txType === 'entrada' ? 'pagador' : 'recebedor');
    if (txCategoryId) setEntityFormCategory(txCategoryId);
    if (txSubcategory) setEntityFormSubcategory(txSubcategory);
    if (txAccountId) setEntityFormAccountId(txAccountId);
    if (txFormaPagamento) setEntityFormPaymentMethod(txFormaPagamento);
    setShowEntityModal(true);
  };

  const handleEditEntity = (ent: FinancialEntity) => {
    setEditingEntity(ent);
    setEntityFormName(ent.name);
    setEntityFormType(ent.type);
    setEntityFormDocument(ent.document || '');
    setEntityFormCategory(ent.category || '');
    setEntityFormSubcategory(ent.subcategory || '');
    setEntityFormAccountId(ent.defaultAccountId || '');
    setEntityFormPaymentMethod(ent.defaultPaymentMethod || 'pix');
    setEntityFormPhone(ent.phone || '');
    setEntityFormEmail(ent.email || '');
    setEntityFormNotes(ent.notes || '');
    setShowEntityModal(true);
  };

  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityFormName.trim()) return;

    if (editingEntity) {
      setFinancialEntities(prev => prev.map(item => item.id === editingEntity.id ? {
        ...item,
        name: entityFormName.trim(),
        type: entityFormType,
        document: entityFormDocument.trim() || undefined,
        category: entityFormCategory || undefined,
        subcategory: entityFormSubcategory || undefined,
        defaultAccountId: entityFormAccountId || undefined,
        defaultPaymentMethod: entityFormPaymentMethod || undefined,
        phone: entityFormPhone.trim() || undefined,
        email: entityFormEmail.trim() || undefined,
        notes: entityFormNotes.trim() || undefined
      } : item));
    } else {
      const newEnt: FinancialEntity = {
        id: `ent-${Date.now()}`,
        name: entityFormName.trim(),
        type: entityFormType,
        document: entityFormDocument.trim() || undefined,
        category: entityFormCategory || undefined,
        subcategory: entityFormSubcategory || undefined,
        defaultAccountId: entityFormAccountId || undefined,
        defaultPaymentMethod: entityFormPaymentMethod || undefined,
        phone: entityFormPhone.trim() || undefined,
        email: entityFormEmail.trim() || undefined,
        notes: entityFormNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      };
      setFinancialEntities(prev => [newEnt, ...prev]);

      if (showTxModal) {
        if (entityFormType === 'pagador' || (entityFormType === 'ambos' && txType === 'entrada')) {
          setTxRecebidoDe(newEnt.name);
        } else {
          setTxVaiPagarQuem(newEnt.name);
        }
      }
    }

    setShowEntityModal(false);
    resetEntityForm();
  };

  const handleDeleteEntity = (id: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Contato / Favorecido',
      description: `Tem certeza que deseja excluir "${name}" da lista de contatos salvos?`,
      confirmButtonText: 'Excluir Contato',
      onConfirm: () => {
        setFinancialEntities(prev => prev.filter(e => e.id !== id));
        setDeleteConfirmState(null);
      }
    });
  };

  // --- CREDIT CARD HANDLERS ---
  const resetCardForm = () => {
    setEditingCard(null);
    setCardName('');
    setCardCardholderName('MINISTÉRIO NOVA VIDA');
    setCardLastFourDigits('');
    setCardBrand('mastercard');
    setCardBankName('');
    setCardBankAccountId('');
    setCardLimit('');
    setCardUsedLimit('0');
    setCardClosingDay('20');
    setCardDueDay('28');
    setCardColor('from-zinc-950 via-neutral-900 to-black');
    setCardImage('');
    setCardStatus('active');
    setCardNotes('');
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardName(card.name);
    setCardCardholderName(card.cardholderName || 'MINISTÉRIO NOVA VIDA');
    setCardLastFourDigits(card.lastFourDigits);
    setCardBrand(card.brand || 'mastercard');
    setCardBankName(card.bankName);
    setCardBankAccountId(card.bankAccountId || '');
    setCardLimit(card.limit.toString());
    setCardUsedLimit((card.usedLimit || 0).toString());
    setCardClosingDay((card.closingDay || 20).toString());
    setCardDueDay((card.dueDay || 28).toString());
    setCardColor(card.color || 'from-zinc-950 via-neutral-900 to-black');
    setCardImage(card.image || '');
    setCardStatus(card.status || 'active');
    setCardNotes(card.notes || '');
    setShowCardModal(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Tem certeza que deseja remover este cartão de crédito?')) {
      setCreditCards(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const handleToggleCardStatus = (cardId: string) => {
    setCreditCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          status: c.status === 'blocked' ? 'active' : 'blocked'
        };
      }
      return c;
    }));
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(cardLimit);
    const usedLimitNum = parseFloat(cardUsedLimit) || 0;
    const closingNum = parseInt(cardClosingDay) || 20;
    const dueNum = parseInt(cardDueDay) || 28;

    if (!cardName.trim() || !cardBankName.trim() || isNaN(limitNum) || limitNum < 0) {
      alert('Por favor, preencha os campos obrigatórios do cartão (Nome, Banco e Limite).');
      return;
    }

    const cardData: CreditCard = {
      id: editingCard ? editingCard.id : `card-${Date.now()}`,
      name: cardName.trim(),
      cardholderName: cardCardholderName.trim() || 'MINISTÉRIO NOVA VIDA',
      lastFourDigits: cardLastFourDigits.trim().replace(/\D/g, '').slice(-4) || '0000',
      brand: cardBrand,
      bankName: cardBankName.trim(),
      bankAccountId: cardBankAccountId || undefined,
      limit: limitNum,
      usedLimit: usedLimitNum,
      closingDay: Math.min(31, Math.max(1, closingNum)),
      dueDay: Math.min(31, Math.max(1, dueNum)),
      color: cardColor,
      image: cardImage.trim() || undefined,
      status: cardStatus,
      notes: cardNotes.trim() || undefined
    };

    if (editingCard) {
      setCreditCards(prev => prev.map(c => c.id === editingCard.id ? cardData : c));
    } else {
      setCreditCards(prev => [...prev, cardData]);
    }

    setShowCardModal(false);
    resetCardForm();
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initialNum = parseFloat(accInitialBalance);
    if (!accName.trim() || !accBankName.trim() || !accNumber.trim() || isNaN(initialNum)) {
      return;
    }

    const resolvedDate = accInitialBalanceDate.trim() || new Date().toISOString().split('T')[0];

    if (editingAccount) {
      // Editing existing account
      const updatedAccounts = accounts.map(a => {
        if (a.id === editingAccount.id) {
          const initialDiff = initialNum - a.initialBalance;
          return {
            ...a,
            name: accName.trim(),
            bankName: accBankName.trim(),
            agency: accAgency.trim() || '0000',
            accountNumber: accNumber.trim(),
            initialBalance: initialNum,
            currentBalance: a.currentBalance + initialDiff,
            image: accImage.trim() || undefined,
            accountType: accType,
            initialBalanceDate: resolvedDate
          };
        }
        return a;
      });
      setAccounts(updatedAccounts);
    } else {
      // Creating new account
      const newAcc: BankAccount = {
        id: `acc-${Date.now()}`,
        name: accName.trim(),
        bankName: accBankName.trim(),
        agency: accAgency.trim() || '0000',
        accountNumber: accNumber.trim(),
        initialBalance: initialNum,
        currentBalance: initialNum,
        image: accImage.trim() || undefined,
        accountType: accType,
        initialBalanceDate: resolvedDate
      };
      setAccounts([...accounts, newAcc]);
    }

    setShowAccountModal(false);
    setEditingAccount(null);

    // Reset Form
    setAccName('');
    setAccBankName('');
    setAccAgency('');
    setAccNumber('');
    setAccInitialBalance('');
    setAccImage('');
    setAccType('conta_corrente');
    setAccInitialBalanceDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccBankName(acc.bankName);
    setAccAgency(acc.agency);
    setAccNumber(acc.accountNumber);
    setAccInitialBalance(acc.initialBalance.toString());
    setAccImage(acc.image || '');
    setAccType((acc.accountType as BankAccountType) || 'conta_corrente');
    setAccInitialBalanceDate(acc.initialBalanceDate || new Date().toISOString().split('T')[0]);
    setShowAccountModal(true);
  };

  const handleOpenNewTransfer = () => {
    setEditingTransfer(null);
    setTfSourceId('');
    setTfDestId('');
    setTfValue('');
    setTfDate(new Date().toISOString().split('T')[0]);
    setTfObservation('');
    setShowTransferModal(true);
  };

  const handleEditTransfer = (tf: Transfer) => {
    setEditingTransfer(tf);
    setTfSourceId(tf.sourceAccountId);
    setTfDestId(tf.destinationAccountId);
    setTfValue(tf.value.toString());
    setTfDate(tf.date);
    setTfObservation(tf.observation || '');
    setShowTransferModal(true);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(tfValue);
    if (!tfSourceId || !tfDestId || isNaN(valNum) || valNum <= 0) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (tfSourceId === tfDestId) {
      alert('A conta de origem não pode ser igual à de destino.');
      return;
    }

    if (editingTransfer) {
      const updatedTransfer: Transfer = {
        ...editingTransfer,
        sourceAccountId: tfSourceId,
        destinationAccountId: tfDestId,
        value: valNum,
        date: tfDate,
        observation: tfObservation.trim() || undefined
      };
      setTransfers(transfers.map(t => t.id === editingTransfer.id ? updatedTransfer : t));
    } else {
      const newTransfer: Transfer = {
        id: `tf-${Date.now()}`,
        sourceAccountId: tfSourceId,
        destinationAccountId: tfDestId,
        value: valNum,
        date: tfDate,
        observation: tfObservation.trim() || undefined
      };
      setTransfers([newTransfer, ...transfers]);
    }

    setShowTransferModal(false);
    setEditingTransfer(null);

    // Reset Form
    setTfSourceId('');
    setTfDestId('');
    setTfValue('');
    setTfDate(new Date().toISOString().split('T')[0]);
    setTfObservation('');
  };

  const handleOpenCategoryModal = (cat?: TransactionCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatCode(cat.code || '');
      setCatName(cat.name);
      setCatType(cat.type);
      setCatSubcategories(cat.subcategories || []);
      setCatParentCategory(cat.parentCategory || '');
      setCatDescription(cat.description || '');
      let foundColor = 'emerald';
      if (cat.color.includes('blue')) foundColor = 'blue';
      else if (cat.color.includes('purple')) foundColor = 'purple';
      else if (cat.color.includes('amber')) foundColor = 'amber';
      else if (cat.color.includes('rose')) foundColor = 'rose';
      else if (cat.color.includes('sky')) foundColor = 'sky';
      else if (cat.color.includes('indigo')) foundColor = 'indigo';
      setCatColor(foundColor);
      setCatMainCategory(cat.mainCategory || cat.group || 'Despesas Fixas');
    } else {
      setEditingCategory(null);
      setCatCode(`${categories.length + 1}`.padStart(2, '0'));
      setCatName('');
      setCatType('entrada');
      setCatColor('emerald');
      setCatParentCategory('');
      setCatDescription('');
      setCatSubcategories([]);
      setCatMainCategory('Receitas');
    }
    setModalNewSubcategory('');
    setShowCategoryModal(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const colors: Record<string, string> = {
      emerald: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      blue: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
      purple: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
      amber: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
      rose: 'bg-rose-500/15 text-rose-500 border-rose-500/20',
      sky: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
      indigo: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20',
    };

    if (editingCategory) {
      setCategories(categories.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            code: catCode.trim() || undefined,
            name: catName.trim(),
            type: catType,
            color: colors[catColor] || colors.emerald,
            group: catMainCategory,
            mainCategory: catMainCategory as any,
            parentCategory: catParentCategory.trim() || undefined,
            description: catDescription.trim() || undefined,
            subcategories: catSubcategories,
          };
        }
        return c;
      }));
      setEditingCategory(null);
    } else {
      const newCat: TransactionCategory = {
        id: `cat-${Date.now()}`,
        code: catCode.trim() || `${categories.length + 1}`.padStart(2, '0'),
        name: catName.trim(),
        type: catType,
        color: colors[catColor] || colors.emerald,
        group: catMainCategory,
        mainCategory: catMainCategory as any,
        parentCategory: catParentCategory.trim() || undefined,
        description: catDescription.trim() || undefined,
        subcategories: catSubcategories,
      };
      setCategories([...categories, newCat]);
    }

    setShowCategoryModal(false);

    // Reset Form
    setCatCode('');
    setCatName('');
    setCatType('entrada');
    setCatColor('emerald');
    setCatParentCategory('');
    setCatDescription('');
    setCatSubcategories([]);
    setModalNewSubcategory('');
  };

  const handleAddSubcategory = (categoryId: string) => {
    const name = newSubcategoryName[categoryId];
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const currentSubs = cat.subcategories || [];
        if (currentSubs.includes(trimmed)) {
          return cat;
        }
        return {
          ...cat,
          subcategories: [...currentSubs, trimmed]
        };
      }
      return cat;
    }));

    setNewSubcategoryName({
      ...newSubcategoryName,
      [categoryId]: ''
    });
  };

  const handleDeleteSubcategory = (categoryId: string, subName: string) => {
    const cat = categories.find(c => c.id === categoryId);
    const catName = cat ? cat.name : 'Categoria';
    const linkedTxs = transactions.filter(t => t.categoryId === categoryId && t.subcategory === subName);

    setDeleteConfirmState({
      isOpen: true,
      title: `Excluir Subcategoria: "${subName}"`,
      description: `Tem certeza que deseja excluir a subcategoria "${subName}" da categoria "${catName}"?`,
      warningNote: linkedTxs.length > 0 
        ? `Existem ${linkedTxs.length} lançamento(s) financeiro(s) vinculado(s) a esta subcategoria. Os lançamentos continuarão existindo e o campo de subcategoria será desvinculado.`
        : undefined,
      confirmButtonText: 'Excluir Subcategoria',
      onConfirm: () => {
        setCategories(prev => prev.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              subcategories: (c.subcategories || []).filter(s => s !== subName)
            };
          }
          return c;
        }));

        setTransactions(prev => prev.map(t => {
          if (t.categoryId === categoryId && t.subcategory === subName) {
            return { ...t, subcategory: undefined };
          }
          return t;
        }));

        setCatSubcategories(prev => prev.filter(s => s !== subName));

        if (editingCategory && editingCategory.id === categoryId) {
          setEditingCategory({
            ...editingCategory,
            subcategories: (editingCategory.subcategories || []).filter(s => s !== subName)
          });
        }

        setDeleteConfirmState(null);
      }
    });
  };

  // --- DELETES ---
  const handleDeleteTx = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Lançamento Financeiro',
      description: tx 
        ? `Tem certeza que deseja excluir o lançamento "${tx.description}" no valor de ${formatCurrency(tx.value)}?`
        : 'Tem certeza que deseja excluir este lançamento financeiro?',
      confirmButtonText: 'Excluir Lançamento',
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        setDeleteConfirmState(null);
      }
    });
  };

  const handleDeleteTransfer = (id: string) => {
    const tf = transfers.find(t => t.id === id);
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Transferência entre Contas',
      description: tf 
        ? `Tem certeza que deseja excluir a transferência no valor de ${formatCurrency(tf.value)}?`
        : 'Tem certeza que deseja excluir esta transferência?',
      confirmButtonText: 'Excluir Transferência',
      onConfirm: () => {
        setTransfers(prev => prev.filter(t => t.id !== id));
        setDeleteConfirmState(null);
      }
    });
  };

  const handleDeleteAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const linked = transactions.some(t => t.accountId === id) || transfers.some(tf => tf.sourceAccountId === id || tf.destinationAccountId === id);
    if (linked) {
      setDeleteConfirmState({
        isOpen: true,
        title: 'Não é possível excluir conta',
        description: `A conta "${acc.name}" possui transações ou transferências vinculadas. Para manter a integridade dos seus saldos e relatórios contábeis, contas com histórico ativo não podem ser deletadas.`,
        confirmButtonText: 'Entendido',
        onConfirm: () => setDeleteConfirmState(null)
      });
      return;
    }

    setDeleteConfirmState({
      isOpen: true,
      title: `Excluir Conta: "${acc.name}"`,
      description: `Tem certeza que deseja excluir a conta bancária "${acc.name}" (${acc.bankName})?`,
      confirmButtonText: 'Excluir Conta',
      onConfirm: () => {
        setAccounts(prev => prev.filter(a => a.id !== id));
        setDeleteConfirmState(null);
      }
    });
  };

  const handleOpenAddAssetModal = (asset?: FixedAsset) => {
    if (asset) {
      setEditingAssetId(asset.id);
      setAssetFormName(asset.name);
      setAssetFormCategory(asset.category);
      setAssetFormAcqValue(asset.acquisitionValue.toString());
      setAssetFormCurValue(asset.currentValue.toString());
      setAssetFormDate(asset.acquisitionDate);
      setAssetFormDesc(asset.description || '');
    } else {
      setEditingAssetId(null);
      setAssetFormName('');
      setAssetFormCategory('Imóveis e Terrenos');
      setAssetFormAcqValue('');
      setAssetFormCurValue('');
      setAssetFormDate(new Date().toISOString().split('T')[0]);
      setAssetFormDesc('');
    }
    setShowAddAssetModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFormName.trim()) return;
    const acqVal = parseFloat(assetFormAcqValue.replace(/\./g, '').replace(',', '.')) || 0;
    const curVal = parseFloat(assetFormCurValue.replace(/\./g, '').replace(',', '.')) || acqVal;

    if (editingAssetId) {
      setFixedAssets(prev => prev.map(a => a.id === editingAssetId ? {
        ...a,
        name: assetFormName.trim(),
        category: assetFormCategory,
        acquisitionValue: acqVal,
        currentValue: curVal,
        acquisitionDate: assetFormDate,
        description: assetFormDesc.trim() || undefined
      } : a));
    } else {
      const newAsset: FixedAsset = {
        id: `fa-${Date.now()}`,
        name: assetFormName.trim(),
        category: assetFormCategory,
        acquisitionValue: acqVal,
        currentValue: curVal,
        acquisitionDate: assetFormDate,
        description: assetFormDesc.trim() || undefined
      };
      setFixedAssets(prev => [...prev, newAsset]);
    }
    setShowAddAssetModal(false);
  };

  const handleDeleteAsset = (id: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Bem Patrimonial',
      description: `Tem certeza que deseja excluir o bem "${name}" do patrimônio imobilizado da igreja?`,
      confirmButtonText: 'Sim, Excluir Bem',
      onConfirm: () => {
        setFixedAssets(prev => prev.filter(a => a.id !== id));
        setDeleteConfirmState(null);
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const linkedTxs = transactions.filter(t => t.categoryId === id);

    setDeleteConfirmState({
      isOpen: true,
      title: `Excluir Categoria: "${cat.name}"`,
      description: `Tem certeza que deseja excluir a categoria "${cat.name}"?`,
      warningNote: linkedTxs.length > 0
        ? `Esta categoria possui ${linkedTxs.length} lançamento(s) financeiro(s) registrado(s). Ao confirmar a exclusão, os lançamentos serão preservados e sua categoria será movida para "Outros".`
        : `Todas as suas subcategorias (${cat.subcategories?.length || 0}) também serão removidas.`,
      confirmButtonText: 'Excluir Categoria',
      onConfirm: () => {
        let nextCategories = categories.filter(c => c.id !== id);

        if (linkedTxs.length > 0) {
          let fallbackCat = nextCategories.find(c => c.name.toLowerCase() === 'outros');
          if (!fallbackCat) {
            fallbackCat = {
              id: `cat-outros-${Date.now()}`,
              name: 'Outros',
              type: 'ambas',
              color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
              subcategories: [],
              mainCategory: 'Despesas Variáveis'
            };
            nextCategories.push(fallbackCat);
          }

          const fallbackId = fallbackCat.id;
          setTransactions(prev => prev.map(t => {
            if (t.categoryId === id) {
              return {
                ...t,
                categoryId: fallbackId,
                subcategory: undefined
              };
            }
            return t;
          }));
        }

        setCategories(nextCategories);
        setShowCategoryModal(false);
        setEditingCategory(null);
        setDeleteConfirmState(null);
      }
    });
  };

  // --- FILTERS AND CHARTS ---
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getMonthlyChartData = () => {
    const list = [];
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Check if a specific year is selected with 'all' months -> show all 12 months (Jan..Dez) of that year
    if (dashSelectedYear !== 'all' && dashSelectedMonth === 'all') {
      const y = parseInt(dashSelectedYear, 10);
      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        const periodStr = `${y}-${mStr}`;
        const label = `${monthLabels[m - 1]} ${String(y).substring(2)}`;
        
        const monthTxs = transactions.filter(t => {
          const effDate = t.type === 'entrada'
            ? (t.dataRecebido || t.dataLancamento || t.date)
            : (t.dataVencimento || t.dataLancamento || t.date);
          return effDate.startsWith(periodStr);
        });
        
        const inflows = monthTxs.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0);
        const outflows = monthTxs.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0);
        list.push({ label, inflows, outflows, rawPeriod: periodStr, monthNum: mStr, year: y });
      }
    } else {
      // 12-month trailing window based on selection
      let endYear: number;
      let endMonth: number; // 0-indexed
      
      if (dashSelectedYear !== 'all' && dashSelectedMonth !== 'all') {
        endYear = parseInt(dashSelectedYear, 10);
        endMonth = parseInt(dashSelectedMonth, 10) - 1;
      } else if (dashSelectedYear === 'all' && dashSelectedMonth !== 'all') {
        const yearsWithTx = transactions.map(t => parseInt(t.date.substring(0, 4), 10));
        endYear = yearsWithTx.length > 0 ? Math.max(...yearsWithTx) : new Date().getFullYear();
        endMonth = parseInt(dashSelectedMonth, 10) - 1;
      } else {
        const txDates = transactions.map(t => t.date).sort();
        const latestDate = txDates.length > 0 ? txDates[txDates.length - 1] : new Date().toISOString().split('T')[0];
        endYear = parseInt(latestDate.substring(0, 4), 10);
        endMonth = parseInt(latestDate.substring(5, 7), 10) - 1;
      }
      
      for (let i = 11; i >= 0; i--) {
        const d = new Date(endYear, endMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const mStr = String(m + 1).padStart(2, '0');
        const periodStr = `${y}-${mStr}`;
        const label = `${monthLabels[m]} ${String(y).substring(2)}`;
        
        const monthTxs = transactions.filter(t => {
          const effDate = t.type === 'entrada'
            ? (t.dataRecebido || t.dataLancamento || t.date)
            : (t.dataVencimento || t.dataLancamento || t.date);
          return effDate.startsWith(periodStr);
        });
        
        const inflows = monthTxs.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.value, 0);
        const outflows = monthTxs.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.value, 0);
        list.push({ label, inflows, outflows, rawPeriod: periodStr, monthNum: mStr, year: y });
      }
    }
    
    return list;
  };

  const chartData = getMonthlyChartData();
  const maxChartVal = Math.max(...chartData.map(d => Math.max(d.inflows, d.outflows)), 1000);

  // --- DONUT CHART DATA & CALCULATIONS (Analytics) ---
  const getDonutData = () => {
    const colors = ['#C084FC', '#FDBA74', '#86EFAC']; // Lavender (#C084FC), Peach (#FDBA74), Mint (#86EFAC)
    const textClasses = ['text-purple-400', 'text-amber-300', 'text-emerald-400'];
    const bgClasses = ['bg-purple-400', 'bg-amber-300', 'bg-emerald-400'];

    if (analyticsFilter === 'saldo') {
      const totalSum = totalInflow + totalOutflow + Math.abs(netCashFlow) || 1;
      const val1 = Math.round((totalInflow / totalSum) * 100);
      const val2 = Math.round((totalOutflow / totalSum) * 100);
      const val3 = Math.round((Math.max(0, netCashFlow) / totalSum) * 100);

      const targetSum = 82;
      return [
        { name: 'Receitas', value: val1, color: colors[0], textClass: textClasses[0], bgClass: bgClasses[0], displayPercent: Math.max(Math.round((val1 / 100) * targetSum), 5) },
        { name: 'Saídas', value: val2, color: colors[1], textClass: textClasses[1], bgClass: bgClasses[1], displayPercent: Math.max(Math.round((val2 / 100) * targetSum), 5) },
        { name: 'Saldo Líquido', value: val3, color: colors[2], textClass: textClasses[2], bgClass: bgClasses[2], displayPercent: Math.max(Math.round((val3 / 100) * targetSum), 5) }
      ];
    }

    const isEntrada = analyticsFilter === 'entrada';
    const filteredCats = categories.filter(cat => {
      if (isEntrada) return cat.type === 'entrada';
      return cat.type === 'saida';
    });

    const catAmounts = filteredCats.map(cat => {
      const amt = filteredDashboardTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
      return { cat, amt };
    }).sort((a, b) => b.amt - a.amt);

    const total = catAmounts.reduce((sum, c) => sum + c.amt, 0);

    if (total === 0) {
      if (isEntrada) {
        return [
          { name: 'Dízimos', value: 50, color: colors[0], textClass: textClasses[0], bgClass: bgClasses[0], displayPercent: 50 },
          { name: 'Ofertas', value: 30, color: colors[1], textClass: textClasses[1], bgClass: bgClasses[1], displayPercent: 30 },
          { name: 'Outros', value: 20, color: colors[2], textClass: textClasses[2], bgClass: bgClasses[2], displayPercent: 20 }
        ];
      } else {
        return [
          { name: 'Aluguel', value: 50, color: colors[0], textClass: textClasses[0], bgClass: bgClasses[0], displayPercent: 50 },
          { name: 'Energia', value: 30, color: colors[1], textClass: textClasses[1], bgClass: bgClasses[1], displayPercent: 30 },
          { name: 'Ação Social', value: 20, color: colors[2], textClass: textClasses[2], bgClass: bgClasses[2], displayPercent: 20 }
        ];
      }
    }

    const top3 = catAmounts.slice(0, 3).map((item, idx) => {
      const pct = Math.round((item.amt / total) * 100);
      return {
        name: item.cat.name,
        value: pct,
        color: colors[idx] || '#cbd5e1',
        textClass: textClasses[idx] || 'text-zinc-400',
        bgClass: bgClasses[idx] || 'bg-zinc-400'
      };
    });

    const sumVal = top3.reduce((s, x) => s + x.value, 0) || 1;
    const targetSum = 82; // leaving ~18% for empty space
    return top3.map(item => ({
      ...item,
      displayPercent: Math.max(Math.round((item.value / sumVal) * targetSum), 5)
    }));
  };

  const donutSegments = getDonutData();
  const d1 = donutSegments[0] || { name: 'Dízimos', value: 50, color: '#C084FC', displayPercent: 50, bgClass: 'bg-purple-400' };
  const d2 = donutSegments[1] || { name: 'Ofertas', value: 30, color: '#FDBA74', displayPercent: 30, bgClass: 'bg-amber-300' };
  const d3 = donutSegments[2] || { name: 'Ação Social', value: 20, color: '#86EFAC', displayPercent: 20, bgClass: 'bg-emerald-400' };

  const donutR = 40;
  const donutC = 2 * Math.PI * donutR; // ~251.32

  const s1Width = (donutC * d1.displayPercent) / 100;
  const s2Width = (donutC * d2.displayPercent) / 100;
  const s3Width = (donutC * d3.displayPercent) / 100;

  const s1Offset = 0;
  const s2Offset = -s1Width;
  const s3Offset = -(s1Width + s2Width);

  const centerPercent = analyticsFilter === 'entrada'
    ? (totalInflow + totalOutflow > 0 ? Math.round((totalInflow / (totalInflow + totalOutflow)) * 100) : 100)
    : analyticsFilter === 'saida'
    ? (totalInflow + totalOutflow > 0 ? Math.round((totalOutflow / (totalInflow + totalOutflow)) * 100) : 0)
    : (totalInflow > 0 ? Math.max(0, Math.round((netCashFlow / totalInflow) * 100)) : 100);

  const centerLabel = analyticsFilter === 'entrada'
    ? 'Receitas'
    : analyticsFilter === 'saida'
    ? 'Despesas'
    : 'Saldo';

  // --- FILTERED LIST FOR TRANSACTION TAB ---

  const filteredTransactions = transactions.filter(tx => {
    const category = categories.find(c => c.id === tx.categoryId);
    const account = accounts.find(a => a.id === tx.accountId);
    const term = (txSearchQuery || searchQuery || '').trim().toLowerCase();
    
    if (term) {
      const matchesSearch = tx.description.toLowerCase().includes(term) ||
        (category && category.name.toLowerCase().includes(term)) ||
        (account && account.name.toLowerCase().includes(term)) ||
        (tx.subcategory && tx.subcategory.toLowerCase().includes(term)) ||
        (tx.recebidoDe && tx.recebidoDe.toLowerCase().includes(term)) ||
        (tx.vaiPagarQuem && tx.vaiPagarQuem.toLowerCase().includes(term)) ||
        (tx.observacao && tx.observacao.toLowerCase().includes(term)) ||
        (tx.documentNumber && tx.documentNumber.toLowerCase().includes(term)) ||
        tx.value.toString().includes(term);

      if (!matchesSearch) return false;
    }

    if (txFilterType === 'entrada' && tx.type !== 'entrada') return false;
    if (txFilterType === 'saida' && tx.type !== 'saida') return false;
    if (txFilterType === 'transfer') return false;

    // Filter by Account
    if (txSelectedAccountId !== 'all' && tx.accountId !== txSelectedAccountId) {
      return false;
    }

    // Filter by Category
    if (txSelectedCategoryId !== 'all' && tx.categoryId !== txSelectedCategoryId) {
      return false;
    }

    // Filter by Recebido / Pago Status
    if (txStatusFilter !== 'all') {
      const isEntrada = tx.type === 'entrada';
      const isDone = isEntrada ? (tx.recebido !== 'nao') : (tx.pago !== 'nao');

      if (txStatusFilter === 'recebido_sim') {
        if (!isEntrada || tx.recebido === 'nao') return false;
      } else if (txStatusFilter === 'recebido_nao') {
        if (!isEntrada || tx.recebido !== 'nao') return false;
      } else if (txStatusFilter === 'pago_sim') {
        if (isEntrada || tx.pago === 'nao') return false;
      } else if (txStatusFilter === 'pago_nao') {
        if (isEntrada || tx.pago !== 'nao') return false;
      } else if (txStatusFilter === 'concluido') {
        if (!isDone) return false;
      } else if (txStatusFilter === 'pendente') {
        if (isDone) return false;
      }
    }

    // Filter by Effective Date
    const effectiveDate = tx.type === 'entrada' 
      ? (tx.dataRecebido || tx.dataLancamento || tx.date) 
      : (tx.dataVencimento || tx.dataLancamento || tx.date);

    // Filter by Year
    if (txSelectedYear !== 'all') {
      const txYear = effectiveDate.substring(0, 4);
      if (txYear !== txSelectedYear) return false;
    }

    // Filter by Month
    if (txSelectedMonth !== 'all') {
      const txMonth = effectiveDate.substring(5, 7);
      if (txMonth !== txSelectedMonth) return false;
    }

    // Filter by Period
    if (txSelectedPeriod !== 'all') {
      if (txSelectedPeriod === 'custom') {
        if (txStartDateFilter && effectiveDate < txStartDateFilter) return false;
        if (txEndDateFilter && effectiveDate > txEndDateFilter) return false;
      } else {
        const txDateObj = new Date(effectiveDate + 'T00:00:00');
        const now = new Date();
        const diffTime = now.getTime() - txDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (txSelectedPeriod === '7d' && (diffDays > 7 || diffDays < 0)) return false;
        if (txSelectedPeriod === '30d' && (diffDays > 30 || diffDays < 0)) return false;
        if (txSelectedPeriod === '90d' && (diffDays > 90 || diffDays < 0)) return false;
      }
    }

    return true;
  });

  const filteredTransfers = transfers.filter(tf => {
    const src = accounts.find(a => a.id === tf.sourceAccountId);
    const dest = accounts.find(a => a.id === tf.destinationAccountId);
    const term = (txSearchQuery || searchQuery || '').trim().toLowerCase();
    
    if (term) {
      const matchesSearch = (tf.observation && tf.observation.toLowerCase().includes(term)) ||
        (src && src.name.toLowerCase().includes(term)) ||
        (dest && dest.name.toLowerCase().includes(term)) ||
        tf.value.toString().includes(term);

      if (!matchesSearch) return false;
    }

    // Filter by Account
    if (txSelectedAccountId !== 'all' && tf.sourceAccountId !== txSelectedAccountId && tf.destinationAccountId !== txSelectedAccountId) {
      return false;
    }

    // Filter by Year
    if (txSelectedYear !== 'all') {
      const tfYear = tf.date.substring(0, 4);
      if (tfYear !== txSelectedYear) return false;
    }

    // Filter by Month
    if (txSelectedMonth !== 'all') {
      const tfMonth = tf.date.substring(5, 7);
      if (tfMonth !== txSelectedMonth) return false;
    }

    // Filter by Period
    if (txSelectedPeriod !== 'all') {
      if (txSelectedPeriod === 'custom') {
        if (txStartDateFilter && tf.date < txStartDateFilter) return false;
        if (txEndDateFilter && tf.date > txEndDateFilter) return false;
      } else {
        const tfDateObj = new Date(tf.date + 'T00:00:00');
        const now = new Date();
        const diffTime = now.getTime() - tfDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (txSelectedPeriod === '7d' && (diffDays > 7 || diffDays < 0)) return false;
        if (txSelectedPeriod === '30d' && (diffDays > 30 || diffDays < 0)) return false;
        if (txSelectedPeriod === '90d' && (diffDays > 90 || diffDays < 0)) return false;
      }
    }

    return true;
  });

  // --- FILTERED CATEGORIES FOR CATEGORIES TAB ---
  const availableCategoryGroups = React.useMemo(() => {
    const groups = new Set<string>();
    categories.forEach(c => {
      if (c.group) groups.add(c.group);
      if (c.mainCategory) groups.add(c.mainCategory);
    });
    return Array.from(groups).filter(Boolean);
  }, [categories]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter(cat => {
      // 1. Search Query
      if (categorySearchQuery.trim()) {
        const term = categorySearchQuery.trim().toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(term);
        const matchesCode = (cat.code || '').toLowerCase().includes(term);
        const matchesDesc = (cat.description || '').toLowerCase().includes(term);
        const matchesGroup = (cat.group || '').toLowerCase().includes(term) || (cat.mainCategory || '').toLowerCase().includes(term);
        const matchesParent = (cat.parentCategory || '').toLowerCase().includes(term);
        const matchesSubs = (cat.subcategories || []).some(s => s.toLowerCase().includes(term));
        if (!matchesName && !matchesCode && !matchesDesc && !matchesGroup && !matchesParent && !matchesSubs) {
          return false;
        }
      }

      // 2. Type Filter
      if (categoryTypeFilter !== 'all') {
        if (cat.type !== categoryTypeFilter && cat.type !== 'ambas') return false;
      }

      // 3. Group Filter
      if (categoryGroupFilter !== 'all') {
        if (cat.group !== categoryGroupFilter && cat.mainCategory !== categoryGroupFilter) return false;
      }

      return true;
    });
  }, [categories, categorySearchQuery, categoryTypeFilter, categoryGroupFilter]);

  const displayTransactions = React.useMemo(() => {
    if (!txSortOrder) return filteredTransactions;
    return [...filteredTransactions].sort((a, b) => {
      const dateA = (a.type === 'entrada' ? (a.dataRecebido || a.date) : (a.dataLancamento || a.date)) || a.date || '';
      const dateB = (b.type === 'entrada' ? (b.dataRecebido || b.date) : (b.dataLancamento || b.date)) || b.date || '';
      if (txSortOrder === 'asc') {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
  }, [filteredTransactions, txSortOrder]);

  // Pagination computations for transactions table
  const totalTxPages = Math.max(1, Math.ceil(displayTransactions.length / txItemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, txCurrentPage), totalTxPages);

  const paginatedTransactions = React.useMemo(() => {
    const start = (validCurrentPage - 1) * txItemsPerPage;
    return displayTransactions.slice(start, start + txItemsPerPage);
  }, [displayTransactions, validCurrentPage, txItemsPerPage]);

  // Selection states & helpers for bulk deletion
  const isAllPageSelected = React.useMemo(() => {
    if (paginatedTransactions.length === 0) return false;
    return paginatedTransactions.every(tx => selectedTxIds.includes(tx.id));
  }, [paginatedTransactions, selectedTxIds]);

  const isSomePageSelected = React.useMemo(() => {
    if (paginatedTransactions.length === 0) return false;
    return paginatedTransactions.some(tx => selectedTxIds.includes(tx.id)) && !isAllPageSelected;
  }, [paginatedTransactions, selectedTxIds, isAllPageSelected]);

  const isAllFilteredSelected = React.useMemo(() => {
    if (displayTransactions.length === 0) return false;
    return displayTransactions.every(tx => selectedTxIds.includes(tx.id));
  }, [displayTransactions, selectedTxIds]);

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedTransactions.map(t => t.id));
      setSelectedTxIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedTransactions.map(t => t.id);
      setSelectedTxIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectAllFiltered = () => {
    setSelectedTxIds(displayTransactions.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTxIds([]);
  };

  const toggleSelectTx = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteTx = () => {
    if (selectedTxIds.length === 0) return;
    const count = selectedTxIds.length;
    const totalValue = transactions
      .filter(t => selectedTxIds.includes(t.id))
      .reduce((sum, t) => sum + t.value, 0);

    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Lançamentos em Massa',
      description: `Tem certeza que deseja excluir permanentemente os ${count} lançamentos selecionados?`,
      warningNote: `Valor total dos lançamentos a serem excluídos: ${formatCurrency(totalValue)}. Esta ação não poderá ser desfeita.`,
      confirmButtonText: `Excluir ${count} Lançamento(s)`,
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => !selectedTxIds.includes(t.id)));
        setSelectedTxIds([]);
        setDeleteConfirmState(null);
      }
    });
  };

  // Selection states & helpers for category bulk deletion
  const isAllCategoriesSelected = React.useMemo(() => {
    if (categories.length === 0) return false;
    return categories.every(cat => selectedCategoryIds.includes(cat.id));
  }, [categories, selectedCategoryIds]);

  const isSomeCategoriesSelected = React.useMemo(() => {
    if (categories.length === 0) return false;
    return categories.some(cat => selectedCategoryIds.includes(cat.id)) && !isAllCategoriesSelected;
  }, [categories, selectedCategoryIds, isAllCategoriesSelected]);

  const toggleSelectAllCategories = () => {
    if (isAllCategoriesSelected) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map(c => c.id));
    }
  };

  const toggleSelectCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearCategorySelection = () => {
    setSelectedCategoryIds([]);
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCategoryIds.length === 0) return;
    const count = selectedCategoryIds.length;
    const selectedCats = categories.filter(c => selectedCategoryIds.includes(c.id));
    const linkedTxs = transactions.filter(t => selectedCategoryIds.includes(t.categoryId));
    const totalSubs = selectedCats.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);

    setDeleteConfirmState({
      isOpen: true,
      title: 'Excluir Categorias em Massa',
      description: `Tem certeza que deseja excluir permanentemente as ${count} categorias selecionadas?`,
      warningNote: linkedTxs.length > 0
        ? `Atenção: Existem ${linkedTxs.length} lançamento(s) financeiro(s) vinculado(s) a estas categorias. Ao confirmar a exclusão, os lançamentos serão preservados e movidos para a categoria padrão "Outros". Além disso, ${totalSubs} subcategoria(s) associada(s) serão removidas.`
        : `Todas as suas ${totalSubs} subcategorias associadas também serão removidas. Esta ação não poderá ser desfeita.`,
      confirmButtonText: `Excluir ${count} Categoria(s)`,
      onConfirm: () => {
        let nextCategories = categories.filter(c => !selectedCategoryIds.includes(c.id));

        if (linkedTxs.length > 0) {
          let fallbackCat = nextCategories.find(c => c.name.toLowerCase() === 'outros');
          if (!fallbackCat) {
            fallbackCat = {
              id: `cat-outros-${Date.now()}`,
              name: 'Outros',
              type: 'ambas',
              color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
              subcategories: [],
              mainCategory: 'Despesas Variáveis'
            };
            nextCategories.push(fallbackCat);
          }

          const fallbackId = fallbackCat.id;
          setTransactions(prev => prev.map(t => {
            if (selectedCategoryIds.includes(t.categoryId)) {
              return {
                ...t,
                categoryId: fallbackId,
                subcategory: undefined
              };
            }
            return t;
          }));
        }

        setCategories(nextCategories);
        setSelectedCategoryIds([]);
        setDeleteConfirmState(null);
      }
    });
  };

  const displayTransfers = React.useMemo(() => {
    if (!txSortOrder) return filteredTransfers;
    return [...filteredTransfers].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (txSortOrder === 'asc') {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
  }, [filteredTransfers, txSortOrder]);

  const handlePrint = () => {
    setShowPrintDREModal(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintBalanco = () => {
    setShowPrintBalancoModal(true);
    // Allow modal DOM element to mount cleanly, then trigger print dialog immediately
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportDREExcel = () => {
    try {
      const DRE_MONTHS_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const cutoff = `${dreSelectedYear}-01-01`;
      
      let initialCash = 0;
      accounts.forEach(acc => {
        let b = Number(acc.initialBalance);
        transactions.forEach(t => {
          const d = t.dataRecebido || t.dataLancamento || t.date;
          if (t.accountId === acc.id && d < cutoff) {
            if (t.type === 'entrada') b += t.value;
            else b -= t.value;
          }
        });
        transfers.forEach(tf => {
          if (tf.date < cutoff) {
            if (tf.destinationAccountId === acc.id) b += tf.value;
            if (tf.sourceAccountId === acc.id) b -= tf.value;
          }
        });
        initialCash += b;
      });

      const monthInflow = Array(12).fill(0);
      const monthOutflow = Array(12).fill(0);

      transactions.forEach(t => {
        const d = t.dataRecebido || t.dataLancamento || t.date;
        if (d && d.startsWith(`${dreSelectedYear}-`)) {
          const mIdx = parseInt(d.substring(5, 7), 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            if (t.type === 'entrada') monthInflow[mIdx] += t.value;
            else if (t.type === 'saida') monthOutflow[mIdx] += t.value;
          }
        }
      });

      const monthResult = monthInflow.map((inf, idx) => inf - monthOutflow[idx]);
      const startCashMonth = Array(12).fill(0);
      const endCashMonth = Array(12).fill(0);

      for (let i = 0; i < 12; i++) {
        startCashMonth[i] = i === 0 ? initialCash : endCashMonth[i - 1];
        endCashMonth[i] = startCashMonth[i] + monthResult[i];
      }

      const totalInflowYear = monthInflow.reduce((a, b) => a + b, 0);
      const totalOutflowYear = monthOutflow.reduce((a, b) => a + b, 0);
      const totalResultYear = totalInflowYear - totalOutflowYear;
      const endCashTotal = endCashMonth[11];

      const rows: Array<Record<string, any>> = [];

      // Institucional
      rows.push({
        'Estrutura / Categoria / Subcategoria': 'MINISTÉRIO NOVA VIDA - CNPJ: 62.471.271-0001-82',
        ...Object.fromEntries(DRE_MONTHS_NAMES.map(m => [m, ''])),
        'Total Exercício': `Exercício de ${dreSelectedYear}`
      });
      rows.push({
        'Estrutura / Categoria / Subcategoria': 'DEMONSTRATIVO DE RESULTADO (DRE) E FLUXO DE CAIXA MÊS A MÊS',
        ...Object.fromEntries(DRE_MONTHS_NAMES.map(m => [m, ''])),
        'Total Exercício': ''
      });
      rows.push({});

      // 1. Saldo Inicial
      const startCashRow: Record<string, any> = {
        'Estrutura / Categoria / Subcategoria': 'SALDO INICIAL DE CAIXA / DISPONIBILIDADES'
      };
      DRE_MONTHS_NAMES.forEach((m, idx) => {
        startCashRow[m] = startCashMonth[idx];
      });
      startCashRow['Total Exercício'] = initialCash;
      rows.push(startCashRow);
      rows.push({});

      // 2. Receitas
      rows.push({
        'Estrutura / Categoria / Subcategoria': '1. RECEITAS OPERACIONAIS (+)',
        ...Object.fromEntries(DRE_MONTHS_NAMES.map(m => [m, ''])),
        'Total Exercício': ''
      });

      // Income categories
      const incomeCategories = categories.filter(c => 
        c.type === 'entrada' || c.type === 'ambas' || 
        transactions.some(t => t.categoryId === c.id && t.type === 'entrada' && (t.dataRecebido || t.dataLancamento || t.date).startsWith(`${dreSelectedYear}-`))
      );

      incomeCategories.forEach(cat => {
        const catMonths = Array(12).fill(0);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'entrada') {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) {
              const mIdx = parseInt(d.substring(5, 7), 10) - 1;
              if (mIdx >= 0 && mIdx < 12) catMonths[mIdx] += t.value;
            }
          }
        });
        const catTotal = catMonths.reduce((a, b) => a + b, 0);

        const catRow: Record<string, any> = {
          'Estrutura / Categoria / Subcategoria': `  • ${cat.name}`
        };
        DRE_MONTHS_NAMES.forEach((m, idx) => {
          catRow[m] = catMonths[idx] || 0;
        });
        catRow['Total Exercício'] = catTotal;
        rows.push(catRow);

        // Subcategories
        const subSet = new Set<string>(cat.subcategories || []);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'entrada' && t.subcategory) {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) subSet.add(t.subcategory);
          }
        });

        Array.from(subSet).forEach(sub => {
          const subMonths = Array(12).fill(0);
          transactions.forEach(t => {
            if (t.categoryId === cat.id && t.type === 'entrada' && t.subcategory === sub) {
              const d = t.dataRecebido || t.dataLancamento || t.date;
              if (d && d.startsWith(`${dreSelectedYear}-`)) {
                const mIdx = parseInt(d.substring(5, 7), 10) - 1;
                if (mIdx >= 0 && mIdx < 12) subMonths[mIdx] += t.value;
              }
            }
          });
          const subTotal = subMonths.reduce((a, b) => a + b, 0);
          if (subTotal > 0 || (cat.subcategories && cat.subcategories.includes(sub))) {
            const subRow: Record<string, any> = {
              'Estrutura / Categoria / Subcategoria': `      - ${sub}`
            };
            DRE_MONTHS_NAMES.forEach((m, idx) => {
              subRow[m] = subMonths[idx] || 0;
            });
            subRow['Total Exercício'] = subTotal;
            rows.push(subRow);
          }
        });
      });

      // Total Receitas
      const totalInflowRow: Record<string, any> = {
        'Estrutura / Categoria / Subcategoria': 'TOTAL DAS RECEITAS'
      };
      DRE_MONTHS_NAMES.forEach((m, idx) => {
        totalInflowRow[m] = monthInflow[idx];
      });
      totalInflowRow['Total Exercício'] = totalInflowYear;
      rows.push(totalInflowRow);
      rows.push({});

      // 3. Despesas
      rows.push({
        'Estrutura / Categoria / Subcategoria': '2. DESPESAS OPERACIONAIS (-)',
        ...Object.fromEntries(DRE_MONTHS_NAMES.map(m => [m, ''])),
        'Total Exercício': ''
      });

      const expenseCategories = categories.filter(c => 
        c.type === 'saida' || c.type === 'ambas' || 
        transactions.some(t => t.categoryId === c.id && t.type === 'saida' && (t.dataLancamento || t.date).startsWith(`${dreSelectedYear}-`))
      );

      expenseCategories.forEach(cat => {
        const catMonths = Array(12).fill(0);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'saida') {
            const d = t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) {
              const mIdx = parseInt(d.substring(5, 7), 10) - 1;
              if (mIdx >= 0 && mIdx < 12) catMonths[mIdx] += t.value;
            }
          }
        });
        const catTotal = catMonths.reduce((a, b) => a + b, 0);

        const catRow: Record<string, any> = {
          'Estrutura / Categoria / Subcategoria': `  • ${cat.name}`
        };
        DRE_MONTHS_NAMES.forEach((m, idx) => {
          catRow[m] = catMonths[idx] || 0;
        });
        catRow['Total Exercício'] = catTotal;
        rows.push(catRow);

        // Subcategories
        const subSet = new Set<string>(cat.subcategories || []);
        transactions.forEach(t => {
          if (t.categoryId === cat.id && t.type === 'saida' && t.subcategory) {
            const d = t.dataLancamento || t.date;
            if (d && d.startsWith(`${dreSelectedYear}-`)) subSet.add(t.subcategory);
          }
        });

        Array.from(subSet).forEach(sub => {
          const subMonths = Array(12).fill(0);
          transactions.forEach(t => {
            if (t.categoryId === cat.id && t.type === 'saida' && t.subcategory === sub) {
              const d = t.dataLancamento || t.date;
              if (d && d.startsWith(`${dreSelectedYear}-`)) {
                const mIdx = parseInt(d.substring(5, 7), 10) - 1;
                if (mIdx >= 0 && mIdx < 12) subMonths[mIdx] += t.value;
              }
            }
          });
          const subTotal = subMonths.reduce((a, b) => a + b, 0);
          if (subTotal > 0 || (cat.subcategories && cat.subcategories.includes(sub))) {
            const subRow: Record<string, any> = {
              'Estrutura / Categoria / Subcategoria': `      - ${sub}`
            };
            DRE_MONTHS_NAMES.forEach((m, idx) => {
              subRow[m] = subMonths[idx] || 0;
            });
            subRow['Total Exercício'] = subTotal;
            rows.push(subRow);
          }
        });
      });

      // Total Despesas
      const totalOutflowRow: Record<string, any> = {
        'Estrutura / Categoria / Subcategoria': 'TOTAL DAS DESPESAS'
      };
      DRE_MONTHS_NAMES.forEach((m, idx) => {
        totalOutflowRow[m] = monthOutflow[idx];
      });
      totalOutflowRow['Total Exercício'] = totalOutflowYear;
      rows.push(totalOutflowRow);
      rows.push({});

      // 4. Resultado Final
      const resultRow: Record<string, any> = {
        'Estrutura / Categoria / Subcategoria': '3. RESULTADO DO EXERCÍCIO (SUPERÁVIT / DÉFICIT)'
      };
      DRE_MONTHS_NAMES.forEach((m, idx) => {
        resultRow[m] = monthResult[idx];
      });
      resultRow['Total Exercício'] = totalResultYear;
      rows.push(resultRow);
      rows.push({});

      // 5. Saldo Final de Caixa
      const endCashRow: Record<string, any> = {
        'Estrutura / Categoria / Subcategoria': '4. SALDO FINAL DE CAIXA / DISPONIBILIDADES'
      };
      DRE_MONTHS_NAMES.forEach((m, idx) => {
        endCashRow[m] = endCashMonth[idx];
      });
      endCashRow['Total Exercício'] = endCashTotal;
      rows.push(endCashRow);

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 45 },
        ...DRE_MONTHS_NAMES.map(() => ({ wch: 14 })),
        { wch: 18 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `DRE_${dreSelectedYear}`);
      XLSX.writeFile(wb, `demonstrativo_dre_fluxo_caixa_${dreSelectedYear}.xlsx`);
    } catch (err) {
      console.error('Erro ao exportar Excel do DRE:', err);
      alert('Não foi possível gerar a planilha Excel do Demonstrativo.');
    }
  };

  const handleExportBalancoExcel = () => {
    const rangeBase = getBalancoPeriodDateRange(balancoBaseYear, balancoPeriodScope);
    const rangeComp = getBalancoPeriodDateRange(balancoCompYear, balancoPeriodScope);

    const rows: Array<Record<string, any>> = [];

    // Header Info
    rows.push({
      'Classificação / Seção': 'MINISTÉRIO NOVA VIDA',
      'Conta / Categoria / Bem': 'AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP',
      'Subcategoria / Especificação': 'CNPJ: 62.471.271-0001-82',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });
    rows.push({
      'Classificação / Seção': `BALANÇO PATRIMONIAL DO EXERCÍCIO ENCERRADO EM 31 DE DEZEMBRO DE ${balancoBaseYear}`,
      'Conta / Categoria / Bem': rangeBase.label,
      'Subcategoria / Especificação': balancoCompareEnabled ? `Comparativo com ${getBalancoPeriodDateRange(balancoCompYear, balancoPeriodScope).label}` : 'Sem Comparação Anual',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });
    rows.push({});

    // 1. ATIVO CIRCULANTE
    rows.push({
      'Classificação / Seção': '1. ATIVO CIRCULANTE (DISPONIBILIDADES: BANCOS & CAIXA)',
      'Conta / Categoria / Bem': '',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });

    let totalCircBase = 0;
    let totalCircComp = 0;
    accounts.forEach(acc => {
      const bBal = getAccountBalanceAtDate(acc.id, rangeBase.end);
      const cBal = balancoCompareEnabled ? getAccountBalanceAtDate(acc.id, rangeComp.end) : 0;
      totalCircBase += bBal;
      totalCircComp += cBal;
      const diff = bBal - cBal;
      const pct = cBal !== 0 ? ((bBal - cBal) / Math.abs(cBal)) * 100 : (bBal > 0 ? 100 : 0);
      rows.push({
        'Classificação / Seção': '1.1 Ativo Circulante',
        'Conta / Categoria / Bem': acc.name,
        'Subcategoria / Especificação': `${acc.bankName} - ${getAccountTypeLabel(acc.type)}`,
        [`Valor Base (${balancoBaseYear})`]: bBal,
        [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? cBal : '',
        'Variação Nominal (R$)': balancoCompareEnabled ? diff : '',
        'Variação Percentual (%)': balancoCompareEnabled ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : ''
      });
    });
    const circDiff = totalCircBase - totalCircComp;
    const circPct = totalCircComp !== 0 ? (circDiff / Math.abs(totalCircComp)) * 100 : (totalCircBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'SUBTOTAL ATIVO CIRCULANTE',
      'Conta / Categoria / Bem': 'Total de Saldos em Caixa e Bancos',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: totalCircBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? totalCircComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? circDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${circPct >= 0 ? '+' : ''}${circPct.toFixed(1)}%` : ''
    });
    rows.push({});

    // 2. ATIVO NÃO CIRCULANTE / IMOBILIZADO
    rows.push({
      'Classificação / Seção': '2. ATIVO NÃO CIRCULANTE (IMOBILIZADO / PATRIMÔNIO)',
      'Conta / Categoria / Bem': '',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });

    let totalImobBase = 0;
    let totalImobComp = 0;
    fixedAssets.forEach(fa => {
      const inBase = fa.acquisitionDate <= rangeBase.end;
      const inComp = fa.acquisitionDate <= rangeComp.end;
      const bVal = inBase ? (fa.currentValue || fa.acquisitionValue) : 0;
      const cVal = inComp ? fa.acquisitionValue : 0;
      totalImobBase += bVal;
      totalImobComp += cVal;
      const diff = bVal - cVal;
      const pct = cVal !== 0 ? ((bVal - cVal) / Math.abs(cVal)) * 100 : (bVal > 0 ? 100 : 0);
      rows.push({
        'Classificação / Seção': '2.1 Bens Imobilizados',
        'Conta / Categoria / Bem': fa.name,
        'Subcategoria / Especificação': `${fa.category} | Aquis.: ${fa.acquisitionDate}${fa.description ? ` (${fa.description})` : ''}`,
        [`Valor Base (${balancoBaseYear})`]: bVal,
        [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? cVal : '',
        'Variação Nominal (R$)': balancoCompareEnabled ? diff : '',
        'Variação Percentual (%)': balancoCompareEnabled ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : ''
      });
    });
    const imobDiff = totalImobBase - totalImobComp;
    const imobPct = totalImobComp !== 0 ? (imobDiff / Math.abs(totalImobComp)) * 100 : (totalImobBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'SUBTOTAL ATIVO NÃO CIRCULANTE',
      'Conta / Categoria / Bem': 'Total de Bens Móveis, Imóveis e Equipamentos',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: totalImobBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? totalImobComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? imobDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${imobPct >= 0 ? '+' : ''}${imobPct.toFixed(1)}%` : ''
    });
    rows.push({});

    // TOTAL GERAL DOS ATIVOS
    const totalAtivoBase = totalCircBase + totalImobBase;
    const totalAtivoComp = totalCircComp + totalImobComp;
    const ativoDiff = totalAtivoBase - totalAtivoComp;
    const ativoPct = totalAtivoComp !== 0 ? (ativoDiff / Math.abs(totalAtivoComp)) * 100 : (totalAtivoBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'TOTAL GERAL DO ATIVO (1 + 2)',
      'Conta / Categoria / Bem': 'Patrimônio Bruto Total da Organização',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: totalAtivoBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? totalAtivoComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? ativoDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${ativoPct >= 0 ? '+' : ''}${ativoPct.toFixed(1)}%` : ''
    });
    rows.push({});

    // 3. RECEITAS DO PERÍODO
    rows.push({
      'Classificação / Seção': '3. DEMONSTRAÇÃO DE RECEITAS (ENTRADAS)',
      'Conta / Categoria / Bem': '',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });

    const baseInflowTxs = transactions.filter(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      return t.type === 'entrada' && d >= rangeBase.start && d <= rangeBase.end;
    });
    const compInflowTxs = transactions.filter(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      return t.type === 'entrada' && d >= rangeComp.start && d <= rangeComp.end;
    });

    categories.filter(c => c.type === 'entrada' || c.type === 'ambas').forEach(cat => {
      const bSum = baseInflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
      const cSum = balancoCompareEnabled ? compInflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0) : 0;
      if (bSum === 0 && cSum === 0) return;
      const diff = bSum - cSum;
      const pct = cSum !== 0 ? ((bSum - cSum) / Math.abs(cSum)) * 100 : (bSum > 0 ? 100 : 0);
      rows.push({
        'Classificação / Seção': '3.1 Receita por Categoria',
        'Conta / Categoria / Bem': cat.name,
        'Subcategoria / Especificação': cat.mainCategory || '',
        [`Valor Base (${balancoBaseYear})`]: bSum,
        [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? cSum : '',
        'Variação Nominal (R$)': balancoCompareEnabled ? diff : '',
        'Variação Percentual (%)': balancoCompareEnabled ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : ''
      });
      // Subcategories
      (cat.subcategories || []).forEach(sub => {
        const subBase = baseInflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0);
        const subComp = balancoCompareEnabled ? compInflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0) : 0;
        if (subBase === 0 && subComp === 0) return;
        const subDiff = subBase - subComp;
        const subPct = subComp !== 0 ? ((subBase - subComp) / Math.abs(subComp)) * 100 : (subBase > 0 ? 100 : 0);
        rows.push({
          'Classificação / Seção': '   └ Subcategoria',
          'Conta / Categoria / Bem': `   • ${sub}`,
          'Subcategoria / Especificação': cat.name,
          [`Valor Base (${balancoBaseYear})`]: subBase,
          [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? subComp : '',
          'Variação Nominal (R$)': balancoCompareEnabled ? subDiff : '',
          'Variação Percentual (%)': balancoCompareEnabled ? `${subPct >= 0 ? '+' : ''}${subPct.toFixed(1)}%` : ''
        });
      });
    });

    const totalRecBase = baseInflowTxs.reduce((sum, t) => sum + t.value, 0);
    const totalRecComp = compInflowTxs.reduce((sum, t) => sum + t.value, 0);
    const recDiff = totalRecBase - totalRecComp;
    const recPct = totalRecComp !== 0 ? (recDiff / Math.abs(totalRecComp)) * 100 : (totalRecBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'TOTAL DAS RECEITAS (3)',
      'Conta / Categoria / Bem': 'Entradas Líquidas no Período',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: totalRecBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? totalRecComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? recDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${recPct >= 0 ? '+' : ''}${recPct.toFixed(1)}%` : ''
    });
    rows.push({});

    // 4. DESPESAS DO PERÍODO
    rows.push({
      'Classificação / Seção': '4. DEMONSTRAÇÃO DE DESPESAS (SAÍDAS)',
      'Conta / Categoria / Bem': '',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: '',
      [`Valor Comp (${balancoCompYear})`]: '',
      'Variação Nominal (R$)': '',
      'Variação Percentual (%)': ''
    });

    const baseOutflowTxs = transactions.filter(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      return t.type === 'saida' && d >= rangeBase.start && d <= rangeBase.end;
    });
    const compOutflowTxs = transactions.filter(t => {
      const d = t.dataRecebido || t.dataLancamento || t.date;
      return t.type === 'saida' && d >= rangeComp.start && d <= rangeComp.end;
    });

    categories.filter(c => c.type === 'saida' || c.type === 'ambas').forEach(cat => {
      const bSum = baseOutflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
      const cSum = balancoCompareEnabled ? compOutflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0) : 0;
      if (bSum === 0 && cSum === 0) return;
      const diff = bSum - cSum;
      const pct = cSum !== 0 ? ((bSum - cSum) / Math.abs(cSum)) * 100 : (bSum > 0 ? 100 : 0);
      rows.push({
        'Classificação / Seção': '4.1 Despesa por Categoria',
        'Conta / Categoria / Bem': cat.name,
        'Subcategoria / Especificação': cat.mainCategory || '',
        [`Valor Base (${balancoBaseYear})`]: bSum,
        [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? cSum : '',
        'Variação Nominal (R$)': balancoCompareEnabled ? diff : '',
        'Variação Percentual (%)': balancoCompareEnabled ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : ''
      });
      // Subcategories
      (cat.subcategories || []).forEach(sub => {
        const subBase = baseOutflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0);
        const subComp = balancoCompareEnabled ? compOutflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0) : 0;
        if (subBase === 0 && subComp === 0) return;
        const subDiff = subBase - subComp;
        const subPct = subComp !== 0 ? ((subBase - subComp) / Math.abs(subComp)) * 100 : (subBase > 0 ? 100 : 0);
        rows.push({
          'Classificação / Seção': '   └ Subcategoria',
          'Conta / Categoria / Bem': `   • ${sub}`,
          'Subcategoria / Especificação': cat.name,
          [`Valor Base (${balancoBaseYear})`]: subBase,
          [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? subComp : '',
          'Variação Nominal (R$)': balancoCompareEnabled ? subDiff : '',
          'Variação Percentual (%)': balancoCompareEnabled ? `${subPct >= 0 ? '+' : ''}${subPct.toFixed(1)}%` : ''
        });
      });
    });

    const totalDespBase = baseOutflowTxs.reduce((sum, t) => sum + t.value, 0);
    const totalDespComp = compOutflowTxs.reduce((sum, t) => sum + t.value, 0);
    const despDiff = totalDespBase - totalDespComp;
    const despPct = totalDespComp !== 0 ? (despDiff / Math.abs(totalDespComp)) * 100 : (totalDespBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'TOTAL DAS DESPESAS (4)',
      'Conta / Categoria / Bem': 'Saídas Realizadas no Período',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: totalDespBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? totalDespComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? despDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${despPct >= 0 ? '+' : ''}${despPct.toFixed(1)}%` : ''
    });
    rows.push({});

    // 5. RESULTADO / SUPERÁVIT
    const supBase = totalRecBase - totalDespBase;
    const supComp = totalRecComp - totalDespComp;
    const supDiff = supBase - supComp;
    const supPct = supComp !== 0 ? (supDiff / Math.abs(supComp)) * 100 : (supBase > 0 ? 100 : 0);
    rows.push({
      'Classificação / Seção': 'SUPERÁVIT / DÉFICIT OPERACIONAL (3 - 4)',
      'Conta / Categoria / Bem': 'Resultado Líquido do Exercício',
      'Subcategoria / Especificação': '',
      [`Valor Base (${balancoBaseYear})`]: supBase,
      [`Valor Comp (${balancoCompYear})`]: balancoCompareEnabled ? supComp : '',
      'Variação Nominal (R$)': balancoCompareEnabled ? supDiff : '',
      'Variação Percentual (%)': balancoCompareEnabled ? `${supPct >= 0 ? '+' : ''}${supPct.toFixed(1)}%` : ''
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 38 }, { wch: 32 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balanco_Patrimonial');
    XLSX.writeFile(wb, `Balanco_Patrimonial_${balancoBaseYear}${balancoCompareEnabled ? `_vs_${balancoCompYear}` : ''}.xlsx`);
  };

  const handleExportBalancoPDF = async () => {
    let element = document.getElementById('balanco-printable-sheet');
    if (!element) {
      setShowPrintBalancoModal(true);
      await new Promise(resolve => setTimeout(resolve, 350));
      element = document.getElementById('balanco-printable-sheet');
    }

    if (element) {
      setIsGeneratingBalancoPDF(true);
      try {
        const canvas = await html2canvas(element, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('balanco-printable-sheet');
            if (clonedEl) {
              clonedEl.style.boxShadow = 'none';
              clonedEl.style.border = 'none';
              clonedEl.style.borderRadius = '0';
              clonedEl.style.width = '1140px';
              clonedEl.style.padding = '24px 32px';
              clonedEl.style.margin = '0 auto';
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        if (imgHeight <= pdfHeight + 15) {
          const scaleFactor = imgHeight > pdfHeight ? (pdfHeight - 4) / imgHeight : 1;
          const renderW = pdfWidth * scaleFactor;
          const renderH = imgHeight * scaleFactor;
          const posX = (pdfWidth - renderW) / 2;
          const posY = (pdfHeight - renderH) / 2;
          doc.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else {
          let heightLeft = imgHeight;
          let position = 0;

          doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position -= pdfHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        }

        doc.save(`Balanco_Patrimonial_${balancoBaseYear}${balancoCompareEnabled ? `_vs_${balancoCompYear}` : ''}.pdf`);
      } catch (err) {
        console.error('Erro ao gerar PDF do Balanço Patrimonial:', err);
      } finally {
        setIsGeneratingBalancoPDF(false);
      }
    }
  };

  const handleExportDREPDF = async () => {
    let element = document.getElementById('dre-printable-sheet');
    if (!element) {
      setShowPrintDREModal(true);
      await new Promise(resolve => setTimeout(resolve, 350));
      element = document.getElementById('dre-printable-sheet');
    }

    if (element) {
      setIsGeneratingDREPDF(true);
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('dre-printable-sheet');
            if (clonedEl) {
              clonedEl.style.boxShadow = 'none';
              clonedEl.style.border = 'none';
              clonedEl.style.borderRadius = '0';
              clonedEl.style.width = '1120px';
              clonedEl.style.maxWidth = '1120px';
              clonedEl.style.minWidth = '1120px';
              clonedEl.style.padding = '16px 20px';
              clonedEl.style.margin = '0 auto';
              clonedEl.style.backgroundColor = '#ffffff';
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        if (imgHeight <= pdfHeight + 15) {
          const scaleFactor = imgHeight > pdfHeight ? (pdfHeight - 4) / imgHeight : 1;
          const renderW = pdfWidth * scaleFactor;
          const renderH = imgHeight * scaleFactor;
          const posX = (pdfWidth - renderW) / 2;
          const posY = (pdfHeight - renderH) / 2;
          doc.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else {
          let heightLeft = imgHeight;
          let position = 0;

          doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position -= pdfHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        }

        doc.save(`Demonstrativo_DRE_Fluxo_Caixa_${dreSelectedYear}.pdf`);
      } catch (err) {
        console.error('Erro ao gerar PDF do Demonstrativo:', err);
      } finally {
        setIsGeneratingDREPDF(false);
      }
    }
  };

  const getTransactionPeriodUpper = () => {
    if (txSelectedPeriod === '7d') return 'ÚLTIMOS 7 DIAS';
    if (txSelectedPeriod === '30d') return 'ÚLTIMOS 30 DIAS';
    if (txSelectedPeriod === '90d') return 'ÚLTIMOS 90 DIAS';
    if (txSelectedPeriod === 'custom') {
      const startFmt = txStartDateFilter ? txStartDateFilter.split('-').reverse().join('/') : 'INÍCIO';
      const endFmt = txEndDateFilter ? txEndDateFilter.split('-').reverse().join('/') : 'FIM';
      return `${startFmt} A ${endFmt}`;
    }
    const year = txSelectedYear !== 'all' ? txSelectedYear : '';
    const month = txSelectedMonth !== 'all' ? txSelectedMonth : '';
    if (year && month) {
      const monthObj = monthsList.find(m => m.value === month);
      const mName = (monthObj?.label || month).toUpperCase();
      return `${mName} DE ${year}`;
    }
    if (year) return `EXERCÍCIO DE ${year}`;
    if (month) {
      const monthObj = monthsList.find(m => m.value === month);
      const mName = (monthObj?.label || month).toUpperCase();
      const currentYr = new Date().getFullYear();
      return `${mName} DE ${currentYr}`;
    }
    return `EXERCÍCIO DE ${new Date().getFullYear()}`;
  };

  const getTransactionReportTitle = () => {
    const period = getTransactionPeriodUpper();
    if (txFilterType === 'entrada') {
      return `RECEITAS - ${period}`;
    }
    if (txFilterType === 'saida') {
      return `DESPESAS - ${period}`;
    }
    if (txFilterType === 'transfer') {
      return `TRANSFERÊNCIA ENTRE CONTAS - ${period}`;
    }
    return `RECEITAS E DESPESAS - ${period}`;
  };

  const getExportPeriodLabel = () => {
    if (txSelectedPeriod === '7d') return 'Últimos 7 dias';
    if (txSelectedPeriod === '30d') return 'Últimos 30 dias';
    if (txSelectedPeriod === '90d') return 'Últimos 90 dias';
    if (txSelectedPeriod === 'custom') {
      const startFmt = txStartDateFilter ? txStartDateFilter.split('-').reverse().join('/') : 'Início';
      const endFmt = txEndDateFilter ? txEndDateFilter.split('-').reverse().join('/') : 'Fim';
      return `${startFmt} a ${endFmt}`;
    }
    const year = txSelectedYear !== 'all' ? txSelectedYear : '';
    const month = txSelectedMonth !== 'all' ? txSelectedMonth : '';
    if (year && month) {
      const monthObj = monthsList.find(m => m.value === month);
      return `${monthObj?.label || month} de ${year}`;
    }
    if (year) return `Ano de ${year}`;
    if (month) {
      const monthObj = monthsList.find(m => m.value === month);
      return `${monthObj?.label || month}`;
    }
    return 'Geral (Todo o Período)';
  };

  const handleExportExcel = () => {
    try {
      const periodLabel = getExportPeriodLabel();

      if (txFilterType === 'transfer') {
        const rows = displayTransfers.map(tf => {
          const src = accounts.find(a => a.id === tf.sourceAccountId);
          const dest = accounts.find(a => a.id === tf.destinationAccountId);
          return {
            'Data': tf.date.split('-').reverse().join('/'),
            'Conta Origem (Saída)': src ? `${src.name} (${src.bankName})` : '—',
            'Conta Destino (Entrada)': dest ? `${dest.name} (${dest.bankName})` : '—',
            'Valor (R$)': tf.value,
            'Observação': tf.observation || '—'
          };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
          { wch: 14 },
          { wch: 30 },
          { wch: 30 },
          { wch: 16 },
          { wch: 40 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transferências');
        const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
        XLSX.writeFile(wb, `transferencias_${safePeriod}.xlsx`);
        return;
      }

      const rows = displayTransactions.map(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        return {
          'Data': tx.date.split('-').reverse().join('/'),
          'Tipo': tx.type === 'entrada' ? 'Receita' : 'Despesa',
          'Descrição': tx.description,
          'Categoria': cat?.name || '—',
          'Subcategoria': tx.subcategory || '—',
          'Conta': acc?.name || '—',
          'Banco': acc?.bankName || '—',
          'Forma de Pagamento': tx.paymentMethod ? tx.paymentMethod.toUpperCase() : '—',
          'Status': tx.reconciled ? 'Conciliado' : 'Pendente',
          'Valor (R$)': tx.value
        };
      });

      const totalEntradas = filteredTransactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.value, 0);
      const totalSaidas = filteredTransactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.value, 0);
      const saldo = totalEntradas - totalSaidas;

      const rowsWithTotals: any[] = [...rows];
      rowsWithTotals.push({});
      rowsWithTotals.push({
        'Data': 'TOTAIS',
        'Tipo': '',
        'Descrição': `Receitas: ${formatCurrency(totalEntradas)} | Despesas: ${formatCurrency(totalSaidas)} | Saldo Líquido: ${formatCurrency(saldo)}`,
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Banco': '',
        'Forma de Pagamento': '',
        'Status': '',
        'Valor (R$)': saldo
      });

      const ws = XLSX.utils.json_to_sheet(rowsWithTotals);
      ws['!cols'] = [
        { wch: 14 },
        { wch: 12 },
        { wch: 34 },
        { wch: 22 },
        { wch: 20 },
        { wch: 22 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
        { wch: 16 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transações');
      const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      XLSX.writeFile(wb, `transacoes_${safePeriod}.xlsx`);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
    }
  };

  const getAccountPeriodStats = (acc: BankAccount) => {
    let startDate = '';
    let endDate = '';
    if (txSelectedPeriod === 'custom') {
      startDate = txStartDateFilter;
      endDate = txEndDateFilter;
    } else {
      const year = txSelectedYear !== 'all' ? txSelectedYear : '';
      const month = txSelectedMonth !== 'all' ? txSelectedMonth : '';
      if (year && month) {
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
      } else if (year) {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      } else if (month) {
        const curYear = new Date().getFullYear().toString();
        startDate = `${curYear}-${month}-01`;
        const lastDay = new Date(parseInt(curYear), parseInt(month), 0).getDate();
        endDate = `${curYear}-${month}-${lastDay.toString().padStart(2, '0')}`;
      }
    }

    const hasActiveRange = !!(startDate || endDate);

    let initialBalanceForPeriod = Number(acc.initialBalance);
    let periodInflows = 0;
    let periodOutflows = 0;
    let periodTransfersIn = 0;
    let periodTransfersOut = 0;

    transactions.forEach(tx => {
      if (tx.accountId === acc.id) {
        if (hasActiveRange) {
          if (tx.date < startDate) {
            if (tx.type === 'entrada') initialBalanceForPeriod += tx.value;
            else initialBalanceForPeriod -= tx.value;
          } else if (tx.date >= startDate && tx.date <= endDate) {
            if (tx.type === 'entrada') periodInflows += tx.value;
            else periodOutflows += tx.value;
          }
        } else {
          if (tx.type === 'entrada') periodInflows += tx.value;
          else periodOutflows += tx.value;
        }
      }
    });

    transfers.forEach(tf => {
      if (hasActiveRange) {
        if (tf.date < startDate) {
          if (tf.sourceAccountId === acc.id) initialBalanceForPeriod -= tf.value;
          if (tf.destinationAccountId === acc.id) initialBalanceForPeriod += tf.value;
        } else if (tf.date >= startDate && tf.date <= endDate) {
          if (tf.sourceAccountId === acc.id) periodTransfersOut += tf.value;
          if (tf.destinationAccountId === acc.id) periodTransfersIn += tf.value;
        }
      } else {
        if (tf.sourceAccountId === acc.id) periodTransfersOut += tf.value;
        if (tf.destinationAccountId === acc.id) periodTransfersIn += tf.value;
      }
    });

    const totalEntradas = periodInflows + periodTransfersIn;
    const totalSaidas = periodOutflows + periodTransfersOut;
    const diff = totalEntradas - totalSaidas;
    const finalBalanceForPeriod = initialBalanceForPeriod + diff;

    return {
      initialBalanceForPeriod,
      totalEntradas,
      totalSaidas,
      finalBalanceForPeriod,
      diff
    };
  };

  // Period transactions independent of txFilterType for the overview cards
  const periodTransactions = transactions.filter(tx => {
    if (txSelectedAccountId !== 'all' && tx.accountId !== txSelectedAccountId) return false;
    if (txSelectedYear !== 'all' && tx.date.substring(0, 4) !== txSelectedYear) return false;
    if (txSelectedMonth !== 'all' && tx.date.substring(5, 7) !== txSelectedMonth) return false;
    if (txSelectedPeriod !== 'all') {
      if (txSelectedPeriod === 'custom') {
        if (txStartDateFilter && tx.date < txStartDateFilter) return false;
        if (txEndDateFilter && tx.date > txEndDateFilter) return false;
      } else {
        const txDateObj = new Date(tx.date + 'T00:00:00');
        const now = new Date();
        const diffTime = now.getTime() - txDateObj.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (txSelectedPeriod === '7d' && (diffDays > 7 || diffDays < 0)) return false;
        if (txSelectedPeriod === '30d' && (diffDays > 30 || diffDays < 0)) return false;
        if (txSelectedPeriod === '90d' && (diffDays > 90 || diffDays < 0)) return false;
      }
    }
    return true;
  });

  const reportTotalReceitas = periodTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.value, 0);

  const reportTotalDespesas = periodTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.value, 0);

  const reportSuperavit = reportTotalReceitas - reportTotalDespesas;
  const reportTotalSaldoContas = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const handleExportPDF = async () => {
    // 1. Ensure modal is open so the full printable element is rendered in DOM
    let element = document.getElementById('report-printable-sheet');
    if (!element) {
      setShowPrintReportModal(true);
      await new Promise(resolve => setTimeout(resolve, 350));
      element = document.getElementById('report-printable-sheet');
    }

    if (element) {
      setIsGeneratingPDF(true);
      try {
        const periodLabel = getExportPeriodLabel();

        // Render the exact HTML element to high-res canvas (scale 2.5 for crisp text & SVGs)
        const canvas = await html2canvas(element, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('report-printable-sheet');
            if (clonedEl) {
              clonedEl.style.boxShadow = 'none';
              clonedEl.style.border = 'none';
              clonedEl.style.borderRadius = '0';
              clonedEl.style.width = '794px';
              clonedEl.style.maxWidth = '794px';
              clonedEl.style.padding = '20px 24px';
              clonedEl.style.margin = '0 auto';
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210; // A4 portrait width in mm
        const pdfHeight = 297; // A4 portrait height in mm
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // If it fits within roughly 1 page (up to 310mm), fit cleanly to 1 page
        if (imgHeight <= pdfHeight + 15) {
          const scaleFactor = imgHeight > pdfHeight ? (pdfHeight - 4) / imgHeight : 1;
          const renderW = pdfWidth * scaleFactor;
          const renderH = imgHeight * scaleFactor;
          const posX = (pdfWidth - renderW) / 2;
          const posY = (pdfHeight - renderH) / 2;
          doc.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else {
          // Multi-page pagination
          let heightLeft = imgHeight;
          let position = 0;

          doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position -= pdfHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        }

        const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`relatorio_${txFilterType}_${safePeriod}.pdf`);
        return;
      } catch (err) {
        console.error('Erro ao gerar PDF visual com html2canvas, usando fallback direto:', err);
      } finally {
        setIsGeneratingPDF(false);
      }
    }

    // Fallback: direct jsPDF generation if DOM element capture wasn't available
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const periodLabel = getExportPeriodLabel();

      // Top Left Header with MNV Emblem & Left Aligned Titles
      const logoX = 22;
      const logoY = 18;
      const logoR = 8.5;
      doc.setDrawColor(24, 24, 27);
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.circle(logoX, logoY, logoR, 'FD');
      doc.setDrawColor(113, 113, 122);
      doc.setLineWidth(0.2);
      doc.circle(logoX, logoY, logoR - 0.6, 'D');

      // Emblem text inside
      doc.setFontSize(5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(24, 24, 27);
      doc.text('MNV', logoX, logoY + 4, { align: 'center' });
      doc.setFontSize(2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(82, 82, 91);
      doc.text('PALAVRA, AMOR E LOUVOR', logoX, logoY + 6.3, { align: 'center' });

      // Left-aligned header text next to logo
      const textStartX = 34;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13.5);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTÉRIO NOVA VIDA', textStartX, 13, { align: 'left' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(63, 63, 70);
      doc.text('AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP', textStartX, 17, { align: 'left' });
      doc.text('CNPJ: 62.471.271-0001-82', textStartX, 20.5, { align: 'left' });

      // Divider line
      doc.setDrawColor(212, 212, 216);
      doc.setLineWidth(0.3);
      doc.line(textStartX, 22.5, 280, 22.5);

      // Dynamic Section Title in deep indigo
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(49, 46, 129); // text-indigo-900
      doc.text(getTransactionReportTitle(), textStartX, 27, { align: 'left' });

      // Bottom border line
      doc.setDrawColor(24, 24, 27);
      doc.setLineWidth(0.6);
      doc.line(14, 29.5, 283, 29.5);

      // Section: Visão Geral
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Visão Geral', 14, 34);

      // 4 Cards layout
      const cardW = 63.5;
      const cardH = 15;
      const startY = 32;

      // Card 1: Receitas Totais
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, startY, cardW, cardH, 2, 2, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('RECEITAS TOTAIS', 17, startY + 4.5);
      doc.setFontSize(9.5);
      doc.setTextColor(16, 185, 129);
      doc.text(formatCurrency(reportTotalReceitas), 17, startY + 9.5);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Dízimos e ofertas consolidadas', 17, startY + 13.5);

      // Card 2: Despesas Totais
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(81.5, startY, cardW, cardH, 2, 2, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('DESPESAS TOTAIS', 84.5, startY + 4.5);
      doc.setFontSize(9.5);
      doc.setTextColor(239, 68, 68);
      doc.text(formatCurrency(reportTotalDespesas), 84.5, startY + 9.5);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Soma de todas as despesas', 84.5, startY + 13.5);

      // Card 3: Superávit Líquido
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(149, startY, cardW, cardH, 2, 2, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('SUPERÁVIT LÍQUIDO', 152, startY + 4.5);
      doc.setFontSize(9.5);
      doc.setTextColor(reportSuperavit >= 0 ? 79 : 239, reportSuperavit >= 0 ? 70 : 68, reportSuperavit >= 0 ? 229 : 68);
      doc.text(formatCurrency(reportSuperavit), 152, startY + 9.5);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Inflows operacionais líquidos', 152, startY + 13.5);

      // Card 4: Saldo em Contas (Indigo Filled)
      doc.setFillColor(67, 56, 202); // #4338ca
      doc.roundedRect(216.5, startY, cardW, cardH, 2, 2, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('SALDO EM CONTAS', 219.5, startY + 4.5);
      doc.setFontSize(9.5);
      doc.text(formatCurrency(reportTotalSaldoContas), 219.5, startY + 9.5);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(224, 231, 255);
      doc.text('Total de saldos de bancos', 219.5, startY + 13.5);

      // Section: Bancos
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Bancos', 14, 52);

      const bankSlice = accounts.slice(0, 5);
      const bCardW = (297 - 28 - (bankSlice.length - 1) * 3) / bankSlice.length;
      const bStartY = 54;
      const bCardH = 17;

      bankSlice.forEach((acc, idx) => {
        const bx = 14 + idx * (bCardW + 3);
        const stats = getAccountPeriodStats(acc);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, bStartY, bCardW, bCardH, 1.5, 1.5, 'FD');

        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(acc.name, bx + 2, bStartY + 3.5, { maxWidth: bCardW - 4 });

        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 185, 129);
        doc.text(`Entradas: +${formatCurrency(stats.totalEntradas)}`, bx + 2, bStartY + 6.5);

        doc.setTextColor(239, 68, 68);
        doc.text(`Saídas: -${formatCurrency(stats.totalSaidas)}`, bx + 2, bStartY + 9.5);

        doc.setTextColor(stats.diff >= 0 ? 16 : 239, stats.diff >= 0 ? 185 : 68, stats.diff >= 0 ? 129 : 68);
        doc.text(`Diferença: ${stats.diff >= 0 ? '+' : ''}${formatCurrency(stats.diff)}`, bx + 2, bStartY + 12.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(stats.finalBalanceForPeriod >= 0 ? 79 : 239, stats.finalBalanceForPeriod >= 0 ? 70 : 68, stats.finalBalanceForPeriod >= 0 ? 229 : 68);
        doc.text(`Saldo: ${formatCurrency(stats.finalBalanceForPeriod)}`, bx + 2, bStartY + 15.5);
      });

      // Section: Lançamentos
      const tableStartY = 74;

      if (txFilterType === 'transfer') {
        const tableData = displayTransfers.map(tf => {
          const src = accounts.find(a => a.id === tf.sourceAccountId);
          const dest = accounts.find(a => a.id === tf.destinationAccountId);
          return [
            tf.date.split('-').reverse().join('/'),
            src ? `${src.name} (${src.bankName})` : '—',
            dest ? `${dest.name} (${dest.bankName})` : '—',
            tf.observation || '—',
            formatCurrency(tf.value)
          ];
        });

        const totalTransfer = filteredTransfers.reduce((sum, t) => sum + t.value, 0);

        autoTable(doc, {
          startY: tableStartY,
          head: [['Data', 'Conta Origem (Saída)', 'Conta Destino (Entrada)', 'Observação', 'Valor']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8.5, cellPadding: 2.5 },
          foot: [['Total', '', '', `${filteredTransfers.length} transferências`, formatCurrency(totalTransfer)]],
          footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
        });

        const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`transferencias_${safePeriod}.pdf`);
        return;
      }

      const isSaida = txFilterType === 'saida';
      const isEntradaMode = txFilterType === 'entrada';

      const tableData = displayTransactions.map(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        const txIsEntrada = tx.type === 'entrada';
        const dateVal = (txIsEntrada 
          ? (tx.dataRecebido || tx.date) 
          : (tx.dataLancamento || tx.date)
        )?.split('-').reverse().join('/') || '—';
        const isDone = txIsEntrada ? tx.recebido !== 'nao' : tx.pago !== 'nao';
        const personEntity = txIsEntrada ? (tx.recebidoDe || '—') : (tx.vaiPagarQuem || '—');
        const paymentMethodVal = (tx.paymentMethod || tx.formaPagamento)?.toUpperCase() || '—';
        const installmentVal = tx.parcelamento === 'sim' 
          ? `${tx.numeroParcelas || 1}x ${tx.frequenciaParcelas ? `(${tx.frequenciaParcelas})` : ''}` 
          : tx.parcelamento === 'recorrente' 
            ? 'Recorrente' 
            : (tx.installments || 'À Vista');

        return [
          dateVal,
          tx.description,
          (txIsEntrada ? '+ ' : '- ') + formatCurrency(tx.value),
          txIsEntrada ? 'Receita' : 'Despesa',
          (cat?.name || '—') + (tx.subcategory ? ` • ${tx.subcategory}` : ''),
          acc?.name || '—',
          isDone ? 'Sim' : 'Não',
          personEntity,
          paymentMethodVal,
          installmentVal,
          tx.observation || '—'
        ];
      });

      const dateHeader = isEntradaMode ? 'Data de Recebido' : isSaida ? 'Data de Lançamento' : 'Data';
      const statusHeader = isEntradaMode ? 'Recebido' : isSaida ? 'Pago' : 'Status';
      const personHeader = isEntradaMode ? 'Recebido de' : isSaida ? 'Pagar quem' : 'Recebido / Pagar';

      const totalValFormatted = isSaida 
        ? `- ${formatCurrency(displayTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0))}`
        : isEntradaMode 
          ? `+ ${formatCurrency(displayTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.value, 0))}`
          : formatCurrency(reportSuperavit);

      autoTable(doc, {
        startY: tableStartY,
        head: [[dateHeader, 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Conta Bancária', statusHeader, personHeader, 'Forma Pgto', 'Parcelamento', 'Observações']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 6.5, cellPadding: 1.8 },
        styles: { fontSize: 6.5, cellPadding: 1.6, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 44 },
          2: { cellWidth: 24, fontStyle: 'bold', halign: 'right' },
          3: { cellWidth: 16 },
          4: { cellWidth: 32 },
          5: { cellWidth: 28 },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 24 },
          8: { cellWidth: 16, halign: 'center' },
          9: { cellWidth: 18 },
          10: { cellWidth: 36 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const raw = String(data.cell.raw);
            if (raw.startsWith('+')) {
              data.cell.styles.textColor = [16, 185, 129];
            } else if (raw.startsWith('-')) {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        },
        foot: [['Total', '', totalValFormatted, '', '', '', '', '', '', '', `${displayTransactions.length} lançamentos`]],
        footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7 }
      });

      const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`relatorio_${txFilterType}_${safePeriod}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
            Gestão de Finanças
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">Controle de caixa, dízimos, ofertas, transferências e demonstrativos</p>
        </div>

        {/* PERIOD SELECTOR & ACTIONS FOR REPORT TAB */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {activeSubTab === 'dashboard' && (
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-850'
            }`}>
              <span className="text-[9px] font-bold uppercase text-zinc-500 px-2">Filtrar por:</span>
              <select
                value={dashSelectedYear}
                onChange={(e) => setDashSelectedYear(e.target.value)}
                className={`text-xs bg-transparent focus:outline-none px-2 py-1 cursor-pointer font-bold ${
                  isHighContrast ? 'text-zinc-800' : 'text-zinc-300'
                }`}
              >
                <option value="all" className={isHighContrast ? 'text-zinc-900' : 'text-zinc-950 bg-zinc-900'}>Todos os Anos</option>
                {availableDashYears.map(yr => (
                  <option key={yr} value={yr} className={isHighContrast ? 'text-zinc-900' : 'text-zinc-950 bg-zinc-900'}>{yr}</option>
                ))}
              </select>
              <div className={`h-4 w-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
              <select
                value={dashSelectedMonth}
                onChange={(e) => setDashSelectedMonth(e.target.value)}
                className={`text-xs bg-transparent focus:outline-none px-2 py-1 cursor-pointer font-bold ${
                  isHighContrast ? 'text-zinc-800' : 'text-zinc-300'
                }`}
              >
                <option value="all" className={isHighContrast ? 'text-zinc-900' : 'text-zinc-950 bg-zinc-900'}>Todos os Meses</option>
                {monthsList.map(mo => (
                  <option key={mo.value} value={mo.value} className={isHighContrast ? 'text-zinc-900' : 'text-zinc-950 bg-zinc-900'}>{mo.label}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border transition-colors flex-wrap ${
            isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950/80 p-1 border-zinc-900'
          }`}>
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeSubTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              Painel
            </button>
            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeSubTab === 'transactions' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              Transações
            </button>
            <button
              onClick={() => setActiveSubTab('cards')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'cards' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              <CreditCard size={12} />
              Cartões de Crédito
            </button>
            <button
              onClick={() => setActiveSubTab('accounts')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeSubTab === 'accounts' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              Contas Bancárias
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeSubTab === 'categories' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeSubTab === 'reports' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : (isHighContrast ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-white')
              }`}
            >
              Relatórios
            </button>
          </div>
        </div>
      </div>

      {/* KPI SUMMARY CARDS (STAYS ON TOP FOR OTHER SUBTABS) */}
      {activeSubTab !== 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
            isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Receitas Totais</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <ArrowUpRight size={14} />
              </div>
            </div>
            <h3 className={`text-lg font-bold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
              {formatCurrency(totalInflow)}
            </h3>
            <p className="text-[9px] text-zinc-500 mt-1">Dízimos e ofertas consolidadas</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
            isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Despesas Totais</span>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <ArrowDownLeft size={14} />
              </div>
            </div>
            <h3 className={`text-lg font-bold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
              {formatCurrency(totalOutflow)}
            </h3>
            <p className="text-[9px] text-zinc-500 mt-1">Soma de todas as despesas</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
            isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Superávit Líquido</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                netCashFlow >= 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                <TrendingUp size={14} />
              </div>
            </div>
            <h3 className={`text-lg font-bold tracking-tight ${
              netCashFlow >= 0 ? (isHighContrast ? 'text-indigo-600' : 'text-indigo-400') : 'text-rose-500'
            }`}>
              {formatCurrency(netCashFlow)}
            </h3>
            <p className="text-[9px] text-zinc-500 mt-1">Inflows operacionais líquidos</p>
          </div>

          <div 
            className="p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 text-white border-indigo-500/30"
            style={{ backgroundColor: '#4f39f6' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-[10px] font-bold uppercase tracking-wider text-white/90"
                style={{ color: '#f9f9f9' }}
              >
                Saldo em Contas
              </span>
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: '#4f39f6', borderColor: '#ffffff', color: '#ffffff' }}
              >
                <Wallet size={14} style={{ color: '#ffffff' }} />
              </div>
            </div>
            <h3 
              className="text-lg font-bold tracking-tight text-white"
              style={{ color: '#ffffff' }}
            >
              {formatCurrency(totalBankBalance)}
            </h3>
            <p 
              className="text-[9px] mt-1 text-white/80"
              style={{ color: '#f7f7f7' }}
            >
              Total de saldos de bancos
            </p>
          </div>
        </div>
      )}

      {/* --- WORKSPACE SUBTAB PANELS --- */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900'
      }`}>

        {/* 1. FINANCIAL DASHBOARD SCREEN (MATCHING REFERENCE DESIGN) */}
        {activeSubTab === 'dashboard' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Top Dashboard Title Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isHighContrast ? 'text-zinc-900' : 'text-white'
                }`}>
                  Meu Painel
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  Visão executiva integrada de saldos, cartões, receitas e despesas
                </p>
              </div>

              {/* Quick Period Badges / Filter shortcut */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                  isHighContrast ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-[#151824] border-white/10 text-zinc-200'
                }`}>
                  <Calendar size={13} className="text-emerald-400" />
                  <span>
                    {dashSelectedMonth === 'all' ? 'Todo o Ano' : monthsList.find(m => m.value === dashSelectedMonth)?.label} {dashSelectedYear === 'all' ? 'Geral' : dashSelectedYear}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <SlidersHorizontal size={12} />
                  <span>Filtrar</span>
                </button>
              </div>
            </div>

            {/* MAIN 2-COLUMN GRID (8 COLS LEFT/MAIN + 4 COLS RIGHT SIDEBAR) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* === LEFT / MAIN COLUMN (8 COLS) === */}
              <div className="lg:col-span-8 space-y-6">

                {/* ROW 1: TOTAL BALANCE HERO CARD + INCOME/EXPENSE/SUPERÁVIT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Hero Card: Total Balance (Vibrant Purple System Gradient) */}
                  <div className="md:col-span-6 bg-gradient-to-tr from-indigo-700 via-purple-600 to-violet-500 text-white p-6 sm:p-7 rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] select-none border border-purple-400/30 group">
                    {/* Organic glow shapes in background */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute left-1/3 -top-12 w-36 h-36 bg-violet-300/20 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-8 w-32 h-32 bg-indigo-900/30 rounded-full blur-lg pointer-events-none" />

                    {/* Top row: Label */}
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight block drop-shadow-xs">
                          Saldo Total em Contas
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-purple-100 font-bold mt-0.5">
                          <span>{accounts.length} contas bancárias ativas</span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 font-mono shadow-xs backdrop-blur-xs">
                        BRL R$
                      </span>
                    </div>

                    {/* Middle: Big Balance Value */}
                    <div className="relative z-10 py-2">
                      <h3 className="text-3xl sm:text-4xl lg:text-[38px] font-black tracking-tight text-white font-sans leading-none drop-shadow-md">
                        {formatCurrency(totalBankBalance)}
                      </h3>
                      <p className="text-[11.5px] font-bold text-purple-100 mt-2 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-xs" />
                        <span>+{formatCurrency(totalInflow)} receitas no período selecionado</span>
                      </p>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="relative z-10 flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowTransferModal(true)}
                        className="bg-white hover:bg-zinc-100 text-purple-950 px-4 sm:px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                      >
                        <ArrowRightLeft size={13} />
                        <span>Transferir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetTxForm();
                          setTxType('entrada');
                          setEditingTx(null);
                          setShowTxModal(true);
                        }}
                        className="bg-purple-950/70 hover:bg-purple-950 text-white px-4 sm:px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg border border-white/20 active:scale-95 transition-all"
                      >
                        <Plus size={14} />
                        <span>Lançar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetTxForm();
                          setTxType('saida');
                          setEditingTx(null);
                          setShowTxModal(true);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all ml-auto border border-white/20"
                        title="Nova Despesa Rápida"
                      >
                        <DollarSign size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Income, Expense & Superávit Stacked KPI Cards */}
                  <div className="md:col-span-6 flex flex-col gap-3">
                    
                    {/* Income (Entradas) */}
                    <div className={`p-4 rounded-[22px] border flex items-center justify-between transition-all shadow-md ${
                      isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#12141c] border-white/5'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isHighContrast 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <ArrowUpRight size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            Entradas (Receitas)
                          </span>
                          <h4 className={`text-xl font-black font-mono tracking-tight ${
                            isHighContrast ? 'text-emerald-700' : 'text-white'
                          }`}>
                            +{formatCurrency(totalInflow)}
                          </h4>
                        </div>
                      </div>

                      <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs shrink-0 font-mono border ${
                        isHighContrast 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      }`}>
                        {totalInflow >= totalOutflow ? '+15.7%' : '+8.2%'}
                      </span>
                    </div>

                    {/* Expense (Saídas) */}
                    <div className={`p-4 rounded-[22px] border flex items-center justify-between transition-all shadow-md ${
                      isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#12141c] border-white/5'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isHighContrast 
                            ? 'bg-rose-100 text-rose-700 border-rose-300' 
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                        }`}>
                          <ArrowDownRight size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            Saídas (Despesas)
                          </span>
                          <h4 className={`text-xl font-black font-mono tracking-tight ${
                            isHighContrast ? 'text-rose-700' : 'text-white'
                          }`}>
                            -{formatCurrency(totalOutflow)}
                          </h4>
                        </div>
                      </div>

                      <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs shrink-0 font-mono border ${
                        isHighContrast 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                      }`}>
                        -10.7%
                      </span>
                    </div>

                    {/* Superávit / Déficit Líquido (Novo Card Solicitado) */}
                    <div className={`p-4 rounded-[22px] border flex items-center justify-between transition-all shadow-md ${
                      netCashFlow >= 0 
                        ? (isHighContrast ? 'bg-emerald-50 border-emerald-200' : 'bg-[#12141c] border-emerald-500/20 ring-1 ring-emerald-500/10') 
                        : (isHighContrast ? 'bg-rose-50 border-rose-200' : 'bg-[#12141c] border-rose-500/20 ring-1 ring-rose-500/10')
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          netCashFlow >= 0 
                            ? (isHighContrast ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30') 
                            : (isHighContrast ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-rose-500/20 text-rose-400 border-rose-500/30')
                        }`}>
                          {netCashFlow >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                          }`}>
                            Superávit Líquido
                          </span>
                          <h4 className={`text-xl font-black font-mono tracking-tight ${
                            netCashFlow >= 0 
                              ? (isHighContrast ? 'text-emerald-700' : 'text-emerald-400') 
                              : (isHighContrast ? 'text-rose-700' : 'text-rose-400')
                          }`}>
                            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                          </h4>
                        </div>
                      </div>

                      <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs shrink-0 font-mono border ${
                        netCashFlow >= 0 
                          ? (isHighContrast ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30') 
                          : (isHighContrast ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-500/20 text-rose-300 border-rose-500/30')
                      }`}>
                        {netCashFlow >= 0 ? 'Superávit' : 'Déficit'}
                      </span>
                    </div>

                  </div>

                </div>

                {/* ROW 2: COMPARATIVE FLOW & EXPENSE SPLIT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Card 1: Comparative Flow (Fluxo Comparativo de Entradas vs Saídas) */}
                  <div className={`md:col-span-7 p-6 rounded-[26px] border flex flex-col justify-between shadow-lg ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-[#12141c] border-white/5'
                  }`}>
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-extrabold ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                            Fluxo Comparativo
                          </h4>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            Entradas vs Saídas
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          Evolução mensal de receitas arrecadadas versus despesas
                        </p>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
                          <span className={`text-[10px] font-bold ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>Entradas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-xs shadow-rose-400/50" />
                          <span className={`text-[10px] font-bold ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>Saídas</span>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Dual Pill Bar Chart */}
                    <div className="pt-2 pb-1">
                      {/* Active Tooltip / Aggregate Preview Callout */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Saldo Líquido do Período:
                          </span>
                          <span className={`text-[11px] font-mono font-black ${
                            netCashFlow >= 0 
                              ? (isHighContrast ? 'text-emerald-700' : 'text-emerald-400') 
                              : (isHighContrast ? 'text-rose-700' : 'text-rose-400')
                          }`}>
                            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                          </span>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border shadow-md text-[10px] ${
                          isHighContrast 
                            ? 'bg-white border-zinc-200 text-zinc-900' 
                            : 'bg-black/60 backdrop-blur-md border-white/10 text-white'
                        }`}>
                          <span className={`${isHighContrast ? 'text-emerald-700' : 'text-emerald-400'} font-bold font-mono`}>
                            +{formatCurrency(totalInflow)}
                          </span>
                          <span className={isHighContrast ? 'text-zinc-400' : 'text-zinc-600'}>/</span>
                          <span className={`${isHighContrast ? 'text-rose-700' : 'text-rose-400'} font-bold font-mono`}>
                            -{formatCurrency(totalOutflow)}
                          </span>
                        </div>
                      </div>

                      {/* Paired Bars Track */}
                      <div className="h-[175px] flex items-end justify-between gap-1.5 sm:gap-3 pt-3 border-b border-zinc-200/40 dark:border-white/5 pb-2">
                        {chartData.slice(-6).map((d, idx) => {
                          const isLast = idx === chartData.slice(-6).length - 1;
                          const inHeight = maxChartVal > 0 ? Math.max(8, Math.min(100, (d.inflows / maxChartVal) * 100)) : 15 + (idx * 10);
                          const outHeight = maxChartVal > 0 ? Math.max(8, Math.min(100, (d.outflows / maxChartVal) * 100)) : 12 + (idx * 8);
                          const net = d.inflows - d.outflows;

                          return (
                            <div 
                              key={idx} 
                              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                              title={`${d.label}\nEntradas: ${formatCurrency(d.inflows)}\nSaídas: ${formatCurrency(d.outflows)}\nSaldo Líquido: ${net >= 0 ? '+' : ''}${formatCurrency(net)}`}
                            >
                              {/* Hover Floating Tooltip */}
                              <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30 bg-zinc-950/95 border border-white/20 px-2.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap flex flex-col items-center">
                                <span className="text-[9px] font-black text-white uppercase">{d.label}</span>
                                <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-bold mt-0.5">
                                  <span className="text-emerald-400">+{formatCurrency(d.inflows)}</span>
                                  <span className="text-zinc-600">|</span>
                                  <span className="text-rose-400">-{formatCurrency(d.outflows)}</span>
                                </div>
                              </div>

                              {/* Side-by-Side Dual Bars Container */}
                              <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full px-0.5">
                                {/* Inflow (Entrada) Bar */}
                                <div className="flex-1 max-w-[18px] sm:max-w-[22px] flex items-end justify-center h-full">
                                  <div 
                                    className={`w-full rounded-t-lg rounded-b-sm transition-all duration-500 relative overflow-hidden ${
                                      d.inflows > 0 
                                        ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-sm shadow-emerald-500/30 group-hover:brightness-110' 
                                        : (isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/40')
                                    }`}
                                    style={{ height: `${inHeight}%` }}
                                  >
                                    {isLast && d.inflows > 0 && (
                                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                    )}
                                  </div>
                                </div>

                                {/* Outflow (Saída) Bar */}
                                <div className="flex-1 max-w-[18px] sm:max-w-[22px] flex items-end justify-center h-full">
                                  <div 
                                    className={`w-full rounded-t-lg rounded-b-sm transition-all duration-500 relative overflow-hidden ${
                                      d.outflows > 0 
                                        ? 'bg-gradient-to-t from-rose-600 via-pink-500 to-rose-400 shadow-sm shadow-rose-500/30 group-hover:brightness-110' 
                                        : (isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/40')
                                    }`}
                                    style={{ height: `${outHeight}%` }}
                                  >
                                    {isLast && d.outflows > 0 && (
                                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Net Balance Micro Badge below bars */}
                              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                net >= 0 
                                  ? (isHighContrast ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') 
                                  : (isHighContrast ? 'bg-rose-100 text-rose-800' : 'bg-rose-500/10 text-rose-400')
                              }`}>
                                {net >= 0 ? '+' : ''}{(net / 1000).toFixed(1)}k
                              </span>

                              {/* Month label */}
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                isLast 
                                  ? (isHighContrast ? 'text-indigo-600 font-black' : 'text-white font-extrabold') 
                                  : (isHighContrast ? 'text-zinc-600' : 'text-zinc-400')
                              }`}>
                                {d.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Expense Split (Divisão de Despesas por Categoria com Valores Reais) */}
                  <div className={`md:col-span-5 p-6 rounded-[26px] border flex flex-col justify-between shadow-lg ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-[#12141c] border-white/5'
                  }`}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className={`text-sm font-extrabold ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                          Divisão de Despesas
                        </h4>
                        <p className={`text-[10px] ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          Valores e percentuais por centro de custo
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-700' : 'bg-[#191b24] border-white/10 text-zinc-300'
                      }`}>
                        {monthsList.find(m => m.value === dashSelectedMonth)?.label || 'Atual'}
                      </span>
                    </div>

                    {/* Donut & Legend Layout with Exact Monetary Amounts */}
                    {(() => {
                      const catColors = ['#facc15', '#f43f5e', '#8b5cf6', '#10b981', '#06b6d4', '#f97316', '#3b82f6'];
                      const catBgs = ['bg-yellow-400', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-orange-500', 'bg-blue-500'];

                      const topOutflowCats = categories
                        .filter(c => c.type === 'saida' || c.type === 'ambas')
                        .map((c, idx) => {
                          const amount = filteredDashboardTxs
                            .filter(t => t.type === 'saida' && t.categoryId === c.id)
                            .reduce((s, t) => s + t.value, 0);
                          const pct = totalOutflow > 0 ? (amount / totalOutflow) * 100 : 0;
                          return {
                            name: c.name,
                            amount,
                            pct: Math.round(pct),
                            pctExact: pct,
                            color: catColors[idx % catColors.length],
                            bgClass: catBgs[idx % catBgs.length]
                          };
                        })
                        .filter(c => c.amount > 0)
                        .sort((a, b) => b.amount - a.amount);

                      const displayedCats = topOutflowCats.slice(0, 4);
                      const circumference = 2 * Math.PI * 50; // ~314.159

                      let cumulativeOffset = 0;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-2">
                          {/* SVG Multi-Segment Donut Chart - Enlarged to fit Total inside perfectly */}
                          <div className="sm:col-span-5 flex flex-col items-center justify-center relative select-none">
                            <div className="w-36 h-36 sm:w-40 sm:h-40 relative flex items-center justify-center">
                              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                                {/* Background track circle */}
                                <circle 
                                  cx="60" 
                                  cy="60" 
                                  r="50" 
                                  fill="transparent" 
                                  stroke={isHighContrast ? '#e4e4e7' : '#1f2430'} 
                                  strokeWidth="10" 
                                />
                                
                                {displayedCats.length > 0 ? (
                                  displayedCats.map((cat, idx) => {
                                    const strokeLength = (cat.pctExact / 100) * circumference;
                                    const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
                                    const strokeDashoffset = -cumulativeOffset;
                                    cumulativeOffset += strokeLength;

                                    return (
                                      <circle
                                        key={idx}
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        fill="transparent"
                                        stroke={cat.color}
                                        strokeWidth="10"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                      />
                                    );
                                  })
                                ) : (
                                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="60 250" strokeDashoffset="0" strokeLinecap="round" />
                                )}
                              </svg>

                              {/* Center Total Text - Cleanly centered inside the donut hole */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2 text-center">
                                <span className={`text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-widest ${
                                  isHighContrast ? 'text-zinc-500 font-bold' : 'text-zinc-400'
                                }`}>
                                  TOTAL
                                </span>
                                <span className={`text-[11px] sm:text-[12.5px] font-black font-mono mt-0.5 tracking-tight px-1 text-center whitespace-nowrap ${
                                  isHighContrast ? 'text-zinc-950 font-black' : 'text-white font-black'
                                }`}>
                                  {formatCurrency(totalOutflow)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Legend Column with Exact Values */}
                          <div className="sm:col-span-7 space-y-2">
                            {displayedCats.length > 0 ? (
                              displayedCats.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between gap-1.5 text-xs py-0.5 border-b border-zinc-200/40 dark:border-white/5">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <div className={`w-1.5 h-3.5 rounded-full ${cat.bgClass} shrink-0`} />
                                    <span className={`font-bold truncate text-[11px] ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                      {cat.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`font-mono font-bold text-[11px] ${isHighContrast ? 'text-zinc-950 font-black' : 'text-white'}`}>
                                      {formatCurrency(cat.amount)}
                                    </span>
                                    <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                                      isHighContrast ? 'bg-zinc-200/80 text-zinc-800' : 'bg-white/10 text-zinc-300'
                                    }`}>
                                      {cat.pct}%
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className={`text-[11px] font-medium ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                  Nenhuma despesa lançada neste período
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>

                {/* ROW 3: OVERVIEW STATISTIC - BANK ACCOUNTS EVOLUTION (Gráfico de Evolução Patrimonial & Contas) */}
                {(() => {
                  const selectedAcc = accounts.find(a => a.id === dashEvolutionAccountId);
                  const currentTotal = dashEvolutionAccountId === 'all'
                    ? accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0)
                    : (selectedAcc?.currentBalance || 0);

                  // Points calculation according to selected timeframe
                  let points: { label: string; fullDate: string; value: number; benchmark: number }[] = [];
                  
                  if (dashEvolutionTimeframe === '1S') {
                    // 7 days
                    const dayLabels = ['03/10', '04/10', '05/10', '06/10', '07/10', '08/10', '09/10'];
                    const multipliers = [0.88, 0.92, 0.85, 0.94, 0.89, 0.96, 1.0];
                    const benchMultipliers = [0.82, 0.86, 0.90, 0.87, 0.92, 0.94, 0.96];
                    points = dayLabels.map((lbl, idx) => ({
                      label: lbl,
                      fullDate: `${lbl}, 14:00`,
                      value: Math.max(0, currentTotal * multipliers[idx]),
                      benchmark: Math.max(0, currentTotal * benchMultipliers[idx])
                    }));
                  } else if (dashEvolutionTimeframe === '1M') {
                    // 10 sampling points across month
                    const dayLabels = ['08/11', '09/11', '10/11', '11/11', '12/11', '13/11', '14/11', '15/11', '16/11', '17/11'];
                    const multipliers = [0.82, 0.72, 0.62, 0.94, 0.68, 0.54, 0.78, 1.08, 0.90, 0.85];
                    const benchMultipliers = [0.70, 0.82, 0.88, 0.79, 0.64, 0.60, 0.74, 0.58, 0.66, 0.74];
                    points = dayLabels.map((lbl, idx) => ({
                      label: lbl,
                      fullDate: `${lbl}, 08:20:40PM`,
                      value: Math.max(0, currentTotal * multipliers[idx]),
                      benchmark: Math.max(0, currentTotal * benchMultipliers[idx])
                    }));
                  } else if (dashEvolutionTimeframe === '1A') {
                    // 12 months
                    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    const multipliers = [0.65, 0.72, 0.68, 0.80, 0.75, 0.85, 0.82, 0.90, 0.88, 0.94, 0.96, 1.0];
                    const benchMultipliers = [0.60, 0.63, 0.70, 0.74, 0.71, 0.78, 0.80, 0.82, 0.85, 0.86, 0.89, 0.92];
                    points = monthLabels.map((lbl, idx) => ({
                      label: lbl,
                      fullDate: `${lbl} 2026`,
                      value: Math.max(0, currentTotal * multipliers[idx]),
                      benchmark: Math.max(0, currentTotal * benchMultipliers[idx])
                    }));
                  } else {
                    // TOTAL / MAX
                    const yearLabels = ['2021', '2022', '2023', '2024', '2025', '2026'];
                    const multipliers = [0.35, 0.52, 0.68, 0.82, 0.91, 1.0];
                    const benchMultipliers = [0.30, 0.44, 0.58, 0.70, 0.80, 0.88];
                    points = yearLabels.map((lbl, idx) => ({
                      label: lbl,
                      fullDate: `Ano de ${lbl}`,
                      value: Math.max(0, currentTotal * multipliers[idx]),
                      benchmark: Math.max(0, currentTotal * benchMultipliers[idx])
                    }));
                  }

                  // Dimensions & Scalings
                  const svgWidth = 840;
                  const svgHeight = 270;
                  const paddingLeft = 55;
                  const paddingRight = 35;
                  const paddingTop = 30;
                  const paddingBottom = 40;
                  
                  const innerW = svgWidth - paddingLeft - paddingRight;
                  const innerH = svgHeight - paddingTop - paddingBottom;

                  const allValues = [...points.map(p => p.value), ...points.map(p => p.benchmark), currentTotal];
                  const maxVal = Math.max(...allValues, 1000) * 1.18;
                  const minVal = 0;

                  const getY = (val: number) => {
                    const ratio = (val - minVal) / (maxVal - minVal);
                    return paddingTop + innerH - (ratio * innerH);
                  };

                  const getX = (idx: number) => {
                    if (points.length <= 1) return paddingLeft;
                    return paddingLeft + (idx / (points.length - 1)) * innerW;
                  };

                  // Coordinates mapping
                  const coords = points.map((p, idx) => ({
                    x: getX(idx),
                    y: getY(p.value),
                    label: p.label,
                    fullDate: p.fullDate,
                    value: p.value,
                    benchmark: p.benchmark
                  }));

                  const benchCoords = points.map((p, idx) => ({
                    x: getX(idx),
                    y: getY(p.benchmark)
                  }));

                  // Cubic Bezier smoothing builder
                  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
                    if (pts.length === 0) return '';
                    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
                    let path = `M ${pts[0].x} ${pts[0].y}`;
                    for (let i = 0; i < pts.length - 1; i++) {
                      const p0 = pts[i];
                      const p1 = pts[i + 1];
                      const cp1x = p0.x + (p1.x - p0.x) * 0.45;
                      const cp1y = p0.y;
                      const cp2x = p0.x + (p1.x - p0.x) * 0.55;
                      const cp2y = p1.y;
                      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                    }
                    return path;
                  };

                  const mainLinePath = buildSmoothPath(coords);
                  const benchLinePath = buildSmoothPath(benchCoords);
                  const areaPath = `${mainLinePath} L ${coords[coords.length - 1].x} ${paddingTop + innerH} L ${coords[0].x} ${paddingTop + innerH} Z`;

                  // Grid ticks (0k, 10k, 20k, 30k, 40k, 50k...)
                  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
                    const val = minVal + ratio * (maxVal - minVal);
                    const y = paddingTop + innerH - (ratio * innerH);
                    const label = val >= 1000 ? `${Math.round(val / 1000)}K` : `${Math.round(val)}`;
                    return { val, y, label };
                  });

                  const activeIdx = dashEvolutionHoverIdx !== null ? dashEvolutionHoverIdx : 3;
                  const activePoint = coords[Math.min(activeIdx, coords.length - 1)] || coords[0];

                  return (
                    <div className={`p-6 sm:p-7 rounded-[28px] border shadow-2xl relative overflow-hidden transition-all duration-300 ${
                      isHighContrast ? 'bg-white border-zinc-200' : 'bg-[#0f1118] border-white/5'
                    }`}>
                      {/* Top Header Row with Overview Statistic Title & Timeframe Filters */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/40 dark:border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                              isHighContrast ? 'text-zinc-900' : 'text-white'
                            }`}>
                              Overview Statistic
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                              Live
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Estatística e evolução do patrimônio nas contas bancárias
                          </p>
                        </div>

                        {/* Timeframe Filter Pills (1S, 1M, 1A, TOTAL) */}
                        <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-[#181a24] border-white/10'
                        }`}>
                          {(['1S', '1M', '1A', 'TOTAL'] as const).map(tf => {
                            const active = dashEvolutionTimeframe === tf;
                            return (
                              <button
                                key={tf}
                                type="button"
                                onClick={() => setDashEvolutionTimeframe(tf)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                                  active
                                    ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white shadow-md shadow-rose-500/25 scale-[1.03]'
                                    : isHighContrast
                                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {tf}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Account Filter Chips Horizontal Bar */}
                      <div className="py-3.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setDashEvolutionAccountId('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                            dashEvolutionAccountId === 'all'
                              ? isHighContrast
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                                : 'bg-indigo-600/20 border-indigo-400 text-white shadow-xs'
                              : isHighContrast
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                : 'bg-[#181a24]/80 border-white/5 text-zinc-300 hover:bg-[#181a24]'
                          }`}
                        >
                          <Wallet size={14} className={dashEvolutionAccountId === 'all' ? 'text-indigo-400' : 'text-zinc-400'} />
                          <span>Todas as Contas ({accounts.length})</span>
                          <span className="font-mono text-[10px] opacity-80">
                            {formatCurrency(totalBankBalance)}
                          </span>
                        </button>

                        {accounts.map(acc => {
                          const isSelected = dashEvolutionAccountId === acc.id;
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => setDashEvolutionAccountId(acc.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                                isSelected
                                  ? isHighContrast
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                                    : 'bg-indigo-600/20 border-indigo-400 text-white shadow-xs'
                                  : isHighContrast
                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                    : 'bg-[#181a24]/80 border-white/5 text-zinc-300 hover:bg-[#181a24]'
                              }`}
                            >
                              <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={16} />
                              <span>{acc.name}</span>
                              <span className="font-mono text-[10px] opacity-80">
                                {formatCurrency(acc.currentBalance)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Main Chart Canvas Area */}
                      <div className="relative pt-4 pb-1">
                        {/* Account Summary Floating Card (Top Left matching reference) */}
                        <div className="flex items-center gap-3 mb-2 px-1">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border ${
                            isHighContrast 
                              ? 'bg-zinc-100 border-zinc-300 text-zinc-800' 
                              : 'bg-[#261519] border-rose-500/30 text-rose-400'
                          }`}>
                            {dashEvolutionAccountId === 'all' ? (
                              <Wallet className="w-5 h-5 text-rose-400" />
                            ) : (
                              <BankLogo bankName={selectedAcc?.bankName || 'Banco'} imageUrl={selectedAcc?.image} size={28} />
                            )}
                          </div>
                          <div>
                            <span className={`text-[11px] font-bold block truncate max-w-[280px] ${
                              isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                            }`}>
                              {dashEvolutionAccountId === 'all'
                                ? 'Patrimônio Integrado Consolidado'
                                : `${selectedAcc?.bankName} (${selectedAcc?.name})`}
                            </span>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                                isHighContrast ? 'text-zinc-950' : 'text-white'
                              }`}>
                                {formatCurrency(currentTotal)}
                              </h4>
                              <span className="inline-flex items-center gap-0.5 text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                                <TrendingUp size={11} /> +26%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive SVG Spline Wave Chart */}
                        <div className="relative w-full overflow-hidden select-none">
                          <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="w-full h-auto overflow-visible cursor-crosshair"
                          >
                            <defs>
                              {/* Main Stroke Gradient */}
                              <linearGradient id="mainCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="35%" stopColor="#f43f5e" />
                                <stop offset="70%" stopColor="#ff5722" />
                                <stop offset="100%" stopColor="#fb7185" />
                              </linearGradient>

                              {/* Area Ambient Glow Gradient */}
                              <linearGradient id="mainAreaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                                <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                              </linearGradient>

                              {/* Glow Filter */}
                              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            {/* Horizontal Grid lines and Y-axis Labels */}
                            {yTicks.map((tick, i) => (
                              <g key={i}>
                                <line
                                  x1={paddingLeft}
                                  y1={tick.y}
                                  x2={svgWidth - paddingRight}
                                  y2={tick.y}
                                  stroke={isHighContrast ? '#e4e4e7' : '#1b1e2a'}
                                  strokeWidth="1"
                                  strokeDasharray="4 4"
                                />
                                <text
                                  x={paddingLeft - 10}
                                  y={tick.y + 4}
                                  textAnchor="end"
                                  className={`text-[10.5px] font-mono font-bold ${
                                    isHighContrast ? 'fill-zinc-500' : 'fill-zinc-600'
                                  }`}
                                >
                                  {tick.label}
                                </text>
                              </g>
                            ))}

                            {/* Vertical Grid Lines for each date point */}
                            {coords.map((c, i) => (
                              <line
                                key={i}
                                x1={c.x}
                                y1={paddingTop}
                                x2={c.x}
                                y2={paddingTop + innerH}
                                stroke={isHighContrast ? '#f4f4f5' : '#141724'}
                                strokeWidth="1"
                              />
                            ))}

                            {/* Secondary Benchmark Wave Curve */}
                            <path
                              d={benchLinePath}
                              fill="none"
                              stroke={isHighContrast ? '#cbd5e1' : '#282b3a'}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Main Active Wave Gradient Area Fill */}
                            <path
                              d={areaPath}
                              fill="url(#mainAreaGlow)"
                            />

                            {/* Main Active Spline Wave Curve */}
                            <path
                              d={mainLinePath}
                              fill="none"
                              stroke="url(#mainCurveGrad)"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#neonGlow)"
                              className="transition-all duration-300"
                            />

                            {/* Active Hover / Selected Guideline & Glow Node */}
                            {activePoint && (
                              <g className="transition-all duration-200">
                                {/* Vertical Guideline */}
                                <line
                                  x1={activePoint.x}
                                  y1={paddingTop}
                                  x2={activePoint.x}
                                  y2={paddingTop + innerH}
                                  stroke={isHighContrast ? '#71717a' : '#ffffff'}
                                  strokeOpacity="0.45"
                                  strokeWidth="1.5"
                                  strokeDasharray="3 3"
                                />

                                {/* Outer Ripple Halo */}
                                <circle
                                  cx={activePoint.x}
                                  y={activePoint.y}
                                  r="9"
                                  fill="#f43f5e"
                                  fillOpacity="0.3"
                                />

                                {/* Core Luminous Center Dot */}
                                <circle
                                  cx={activePoint.x}
                                  y={activePoint.y}
                                  r="5.5"
                                  fill="#ffffff"
                                  stroke="#f43f5e"
                                  strokeWidth="3.5"
                                  className="drop-shadow-lg"
                                />
                              </g>
                            )}

                            {/* X-Axis Date Labels */}
                            {coords.map((c, i) => {
                              const isHovered = activeIdx === i;
                              return (
                                <text
                                  key={i}
                                  x={c.x}
                                  y={paddingTop + innerH + 24}
                                  textAnchor="middle"
                                  className={`text-[11px] font-mono transition-colors ${
                                    isHovered
                                      ? (isHighContrast ? 'fill-zinc-950 font-black' : 'fill-white font-black')
                                      : (isHighContrast ? 'fill-zinc-500 font-bold' : 'fill-zinc-500 font-semibold')
                                  }`}
                                >
                                  {c.label}
                                </text>
                              );
                            })}

                            {/* Invisible Wide Touch/Hover Overlay Columns */}
                            {coords.map((c, i) => (
                              <rect
                                key={i}
                                x={c.x - (innerW / coords.length) / 2}
                                y={paddingTop}
                                width={innerW / coords.length}
                                height={innerH}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setDashEvolutionHoverIdx(i)}
                                onTouchStart={() => setDashEvolutionHoverIdx(i)}
                              />
                            ))}
                          </svg>

                          {/* Floating Glassmorphic Tooltip (Matching reference image position) */}
                          {activePoint && (
                            <div 
                              className="absolute pointer-events-none transition-all duration-200 z-30"
                              style={{
                                left: `${(activePoint.x / svgWidth) * 100}%`,
                                top: `${Math.max(8, ((activePoint.y - 70) / svgHeight) * 100)}%`,
                                transform: 'translate(-50%, -100%)'
                              }}
                            >
                              <div className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 whitespace-nowrap min-w-[210px] ${
                                isHighContrast 
                                  ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl' 
                                  : 'bg-[#151722]/95 border-white/20 text-white shadow-2xl shadow-black/60'
                              }`}>
                                <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                  {dashEvolutionAccountId === 'all' ? (
                                    <Wallet size={15} className="text-orange-400" />
                                  ) : (
                                    <BankLogo bankName={selectedAcc?.bankName || 'Banco'} imageUrl={selectedAcc?.image} size={20} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black font-mono">
                                      {formatCurrency(activePoint.value)}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-emerald-400 font-mono">
                                      +21%
                                    </span>
                                  </div>
                                  <span className={`text-[9.5px] block font-mono ${
                                    isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                                  }`}>
                                    {activePoint.fullDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ROW 4: RECENT TRANSACTIONS (Lançamentos Recentes) */}
                <div className={`p-6 rounded-[26px] border shadow-lg ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-[#12141c] border-white/5'
                }`}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-extrabold ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                        Lançamentos Recentes
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                        {transactions.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSubTab('transactions')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Ver Todos <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* Transactions List */}
                  <div className="space-y-2.5">
                    {transactions.slice(0, 5).map((tx) => {
                      const category = categories.find(c => c.id === tx.categoryId);
                      const isExpense = tx.type === 'saida';
                      const formattedDate = tx.date.split('-').reverse().join('/');

                      return (
                        <div 
                          key={tx.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all hover:border-zinc-700 ${
                            isHighContrast ? 'bg-white border-zinc-200' : 'bg-[#181a24] border-white/5'
                          }`}
                        >
                          {/* Left: Icon & Description */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                              isExpense 
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {isExpense ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h5 className={`text-xs font-bold truncate ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                                {tx.description}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                                <span>{category?.name || 'Geral'}</span>
                                {tx.subcategory && <span>• {tx.subcategory}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Center: Status Badge & Date */}
                          <div className="hidden sm:flex items-center gap-3 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30">
                              Confirmado
                            </span>
                            <span className="text-[10.5px] font-mono text-zinc-400">
                              {formattedDate}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase">
                              {tx.formaPagamento || 'PIX'}
                            </span>
                          </div>

                          {/* Right: Amount & Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-mono font-bold text-xs sm:text-sm ${
                              isExpense ? (isHighContrast ? 'text-zinc-900' : 'text-white') : 'text-emerald-400 font-black'
                            }`}>
                              {isExpense ? '-' : '+'} {formatCurrency(tx.value)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleEditTransaction(tx);
                              }}
                              className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer rounded-lg"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* === RIGHT SIDEBAR COLUMN (4 COLS: MY CARDS & RECURRENT SUBSCRIPTIONS) === */}
              <div className={`lg:col-span-4 p-6 rounded-[28px] border shadow-2xl space-y-6 ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-[#12141c] border-white/5'
              }`}>
                
                {/* 1. "My Cards" Header & Staggered 3D Overlapping Card Deck */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-sm font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                        Meus Cartões
                      </h4>
                      <sup className="text-[10px] font-bold text-indigo-400 font-mono">
                        {creditCards.length}
                      </sup>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        resetCardForm();
                        setShowCardModal(true);
                      }}
                      className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <span>Adicionar</span>
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Physical 3D Vertical Layered Stack of Cards */}
                  {(() => {
                    const safeIndex = Math.min(dashSelectedCardIndex, creditCards.length - 1);
                    const activeCard = creditCards[safeIndex] || creditCards[0];
                    if (!activeCard) return null;

                    const activeCardInvoice = getCardInvoiceForPeriod(activeCard.id);
                    const activeCardLimit = Number(activeCard.limit || 0);
                    const activeCardAvailable = Math.max(0, activeCardLimit - activeCardInvoice);
                    const usedPct = activeCardLimit > 0 ? Math.min(100, Math.round((activeCardInvoice / activeCardLimit) * 100)) : 0;
                    const selectedMonthName = dashSelectedMonth === 'all' 
                      ? (dashSelectedYear === 'all' ? 'Geral' : dashSelectedYear)
                      : `${monthsList.find(m => m.value === dashSelectedMonth)?.label || ''} ${dashSelectedYear === 'all' ? '' : dashSelectedYear}`;

                    return (
                      <div className="relative pt-6 pb-2 select-none">
                        {/* 1st Top Stack Peeking Card (Orange Gradient / First Inactive) */}
                        {creditCards.length > 1 && (() => {
                          const c1 = creditCards[(safeIndex + 1) % creditCards.length];
                          const c1Invoice = getCardInvoiceForPeriod(c1.id);
                          return (
                            <div 
                              onClick={() => setDashSelectedCardIndex((safeIndex + 1) % creditCards.length)}
                              className="w-[88%] mx-auto h-16 rounded-2xl p-3 bg-gradient-to-r from-orange-400 to-amber-300 text-zinc-950 shadow-md cursor-pointer transition-all duration-300 transform -translate-y-4 hover:-translate-y-6 flex justify-between items-center opacity-90 hover:opacity-100 border border-white/20"
                            >
                              <div className="min-w-0">
                                <span className="font-extrabold text-[10px] uppercase tracking-wider block truncate">
                                  {c1?.bankName || c1?.name || 'Cartão 2'}
                                </span>
                                <span className="font-mono text-[9px] font-bold text-zinc-800">
                                  Fatura: {formatCurrency(c1Invoice)}
                                </span>
                              </div>
                              <span className="font-mono font-black text-[10px] shrink-0 bg-black/10 px-2 py-0.5 rounded-full">
                                •••• {c1?.lastFourDigits}
                              </span>
                            </div>
                          );
                        })()}

                        {/* 2nd Middle Stack Peeking Card (Mint/Teal Gradient) */}
                        {creditCards.length > 2 && (() => {
                          const c2 = creditCards[(safeIndex + 2) % creditCards.length];
                          const c2Invoice = getCardInvoiceForPeriod(c2.id);
                          return (
                            <div 
                              onClick={() => setDashSelectedCardIndex((safeIndex + 2) % creditCards.length)}
                              className="w-[94%] mx-auto h-16 rounded-2xl p-3 bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-400 text-zinc-950 shadow-md cursor-pointer transition-all duration-300 transform -translate-y-8 hover:-translate-y-10 flex justify-between items-center opacity-95 hover:opacity-100 border border-white/20"
                            >
                              <div className="min-w-0">
                                <span className="font-extrabold text-[10px] uppercase tracking-wider block truncate">
                                  {c2?.bankName || c2?.name || 'Cartão 3'}
                                </span>
                                <span className="font-mono text-[9px] font-bold text-zinc-800">
                                  Fatura: {formatCurrency(c2Invoice)}
                                </span>
                              </div>
                              <span className="font-mono font-black text-[10px] shrink-0 bg-black/10 px-2 py-0.5 rounded-full">
                                •••• {c2?.lastFourDigits}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Front Active Main Card (Custom Image, Solid Color, or Gradient) */}
                        {(() => {
                          const isLight = !activeCard.image && isLightCardColor(activeCard.color);
                          return (
                            <div 
                              onClick={() => {
                                if (creditCards.length > 1) {
                                  setDashSelectedCardIndex((safeIndex + 1) % creditCards.length);
                                }
                              }}
                              className={`w-full aspect-[1.586/1] rounded-2xl p-5 relative overflow-hidden shadow-2xl flex flex-col justify-between border cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                                creditCards.length > 2 ? '-translate-y-12' : creditCards.length === 2 ? '-translate-y-6' : ''
                              } ${isLight ? 'border-zinc-300 shadow-xl' : activeCard.image ? 'border-zinc-700' : 'border-white/10'}`}
                              style={
                                !activeCard.image && (activeCard.color?.startsWith('#') || isLight)
                                  ? { backgroundColor: activeCard.color || '#ffffff' } 
                                  : undefined
                              }
                            >
                              {/* Card Background: Custom Image, Gradient or Solid */}
                              {activeCard.image ? (
                                <div className="absolute inset-0 z-0">
                                  <img src={activeCard.image} alt={activeCard.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px]" />
                                </div>
                              ) : !activeCard.color?.startsWith('#') && !isLight ? (
                                <div className={`absolute inset-0 z-0 ${
                                  activeCard.color?.startsWith('from-') 
                                    ? `bg-gradient-to-br ${activeCard.color}` 
                                    : activeCard.color?.startsWith('bg-')
                                      ? activeCard.color
                                      : 'bg-gradient-to-br from-[#8b5cf6] via-[#6366f1] to-[#3b82f6]'
                                }`}>
                                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/10" />
                                  <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full border border-white/10" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 z-0">
                                  <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full border ${isLight ? 'border-zinc-900/10' : 'border-white/10'}`} />
                                  <div className={`absolute -left-8 -bottom-8 w-36 h-36 rounded-full border ${isLight ? 'border-zinc-900/10' : 'border-white/10'}`} />
                                </div>
                              )}

                              {/* Top row */}
                              <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-5.5 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-500 border border-amber-600/40 shadow-inner grid grid-cols-2 gap-0.5 p-0.5">
                                    <div className="border border-amber-800/30 rounded-xs" />
                                    <div className="border border-amber-800/30 rounded-xs" />
                                    <div className="border border-amber-800/30 rounded-xs" />
                                    <div className="border border-amber-800/30 rounded-xs" />
                                  </div>
                                  <Wifi size={13} className={`rotate-90 ${isLight ? 'text-zinc-800' : 'text-white/80'}`} />
                                </div>

                                <div className="flex items-center gap-2">
                                  {activeCard.bankName && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border truncate max-w-[110px] ${
                                      isLight 
                                        ? 'bg-zinc-100 text-zinc-900 border-zinc-300 shadow-xs' 
                                        : 'bg-black/40 text-white border-white/10'
                                    }`}>
                                      {activeCard.bankName}
                                    </span>
                                  )}
                                  <CreditCardBrandLogo brand={activeCard.brand} size={28} isLight={isLight} />
                                </div>
                              </div>

                              {/* Middle: Masked Number */}
                              <div className="relative z-10 py-1">
                                <p className={`font-mono text-base tracking-[0.2em] font-black ${
                                  isLight ? 'text-zinc-950' : 'text-white drop-shadow-md'
                                }`}>
                                  •••• •••• •••• {activeCard.lastFourDigits}
                                </p>
                              </div>

                              {/* Bottom: Holder & Expiry */}
                              <div className="relative z-10 flex justify-between items-end">
                                <div>
                                  <p className={`text-[7.5px] uppercase tracking-widest font-bold ${
                                    isLight ? 'text-zinc-500' : 'text-white/80'
                                  }`}>Titular</p>
                                  <p className={`text-[10px] font-black uppercase tracking-wider truncate font-mono max-w-[160px] ${
                                    isLight ? 'text-zinc-950' : 'text-white drop-shadow'
                                  }`}>
                                    {activeCard.cardholderName || 'MINISTÉRIO NOVA VIDA'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-[7.5px] uppercase tracking-widest font-bold ${
                                    isLight ? 'text-zinc-500' : 'text-white/80'
                                  }`}>Venc.</p>
                                  <p className={`text-[10px] font-bold font-mono ${
                                    isLight ? 'text-zinc-950 font-black' : 'text-white'
                                  }`}>
                                    Dia {activeCard.dueDay}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Invoice & Limit Panel for Selected Month */}
                        <div className={`p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-md mt-2 ${
                          isHighContrast ? 'bg-white border-zinc-200' : 'bg-[#181a24] border-white/5'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                                isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                              }`}>
                                Fatura ({selectedMonthName})
                              </span>
                              <h5 className="text-base font-black font-mono text-rose-400">
                                {formatCurrency(activeCardInvoice)}
                              </h5>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                                isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                              }`}>
                                Limite Disp.
                              </span>
                              <h5 className={`text-xs font-bold font-mono ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                                {formatCurrency(activeCardAvailable)}
                              </h5>
                            </div>
                          </div>

                          {/* Limit Progress Bar */}
                          <div className="space-y-1">
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  usedPct > 85 ? 'bg-rose-500' : usedPct > 60 ? 'bg-amber-400' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.max(4, usedPct)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-500">
                              <span>{usedPct}% do limite</span>
                              <span>Total: {formatCurrency(activeCardLimit)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Quick Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              resetTxForm();
                              setTxType('saida');
                              setTxFormaPagamento('cartão');
                              setTxCreditCardId(activeCard.id);
                              setShowTxModal(true);
                            }}
                            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all text-center cursor-pointer active:scale-95"
                          >
                            + Lançar no Cartão
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCardTxSelectedCardId(activeCard.id);
                              setActiveSubTab('cards');
                            }}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              isHighContrast ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'bg-[#181a24] border-white/10 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            Extrato
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. "Subscriptions" (Despesas Recorrentes Reais Baseadas em Lançamentos) */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/40">
                  {(() => {
                    // Extract real recurring and fixed expenses from system transactions
                    const recurringMap = new Map<string, { name: string; val: number; dueDay: string; icon: string; color: string }>();

                    const iconPresets = ['⚡', '🌐', '🏢', '💧', '📡', '🛡️', '📦'];
                    const colorPresets = [
                      'bg-amber-500/20 text-amber-300 border-amber-500/30',
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                      'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    ];

                    // 1. Explicit recurring or fixed category transactions
                    const candidateTxs = transactions.filter(t => {
                      if (t.type !== 'saida') return false;
                      const cat = categories.find(c => c.id === t.categoryId);
                      return t.parcelamento === 'recorrente' || Boolean(t.frequenciaParcelas) || cat?.mainCategory === 'Despesas Fixas';
                    });

                    candidateTxs.forEach((t, idx) => {
                      const desc = t.description.trim();
                      if (!recurringMap.has(desc)) {
                        const day = t.dataVencimento ? t.dataVencimento.substring(8, 10) : (t.date ? t.date.substring(8, 10) : '10');
                        recurringMap.set(desc, {
                          name: desc,
                          val: t.value,
                          dueDay: `Todo dia ${day}`,
                          icon: iconPresets[idx % iconPresets.length],
                          color: colorPresets[idx % colorPresets.length]
                        });
                      }
                    });

                    // Fallback to top standard expense descriptions if none explicitly recurring
                    if (recurringMap.size === 0) {
                      transactions.filter(t => t.type === 'saida').slice(0, 4).forEach((t, idx) => {
                        const desc = t.description.trim();
                        if (!recurringMap.has(desc)) {
                          const day = t.dataVencimento ? t.dataVencimento.substring(8, 10) : (t.date ? t.date.substring(8, 10) : '15');
                          recurringMap.set(desc, {
                            name: desc,
                            val: t.value,
                            dueDay: `Venc. dia ${day}`,
                            icon: iconPresets[idx % iconPresets.length],
                            color: colorPresets[idx % colorPresets.length]
                          });
                        }
                      });
                    }

                    const recurringList = Array.from(recurringMap.values()).slice(0, 4);

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-sm font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                              Despesas Recorrentes
                            </h4>
                            <sup className="text-[10px] font-bold text-emerald-400 font-mono">
                              {recurringList.length}
                            </sup>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveSubTab('transactions')}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            Ver Lançamentos <ChevronRight size={12} />
                          </button>
                        </div>

                        {/* Recurrent Items List */}
                        <div className="space-y-2">
                          {recurringList.length > 0 ? (
                            recurringList.map((sub, sIdx) => (
                              <div 
                                key={sIdx}
                                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all hover:border-zinc-700 ${
                                  isHighContrast ? 'bg-white border-zinc-200' : 'bg-[#181a24] border-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs shrink-0 ${sub.color}`}>
                                    {sub.icon}
                                  </div>
                                  <div className="min-w-0">
                                    <h6 className={`text-xs font-bold truncate ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                                      {sub.name}
                                    </h6>
                                    <p className={`text-[9px] font-medium ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                      {sub.dueDay}
                                    </p>
                                  </div>
                                </div>

                                <span className={`font-mono font-bold text-xs shrink-0 ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                                  {formatCurrency(sub.val)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className={`text-[11px] text-center py-2 ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              Nenhuma despesa recorrente cadastrada
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* 3. Registered Bank Accounts Mini List (Com Saldos Reais Calculados) */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/40">
                  <div className="flex justify-between items-center">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-400'}`}>
                      Contas Bancárias ({accounts.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('accounts')}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Ver Todas
                    </button>
                  </div>

                  <div className="space-y-2">
                    {accounts.slice(0, 4).map((acc) => {
                      const realBalance = getAccountRealBalance(acc.id);
                      return (
                        <div 
                          key={acc.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                            isHighContrast ? 'bg-white border-zinc-200' : 'bg-[#181a24] border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={22} />
                            <div className="min-w-0">
                              <p className={`text-[11px] font-bold truncate ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>{acc.name}</p>
                              <p className={`text-[8.5px] font-mono truncate ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>{acc.bankName}</p>
                            </div>
                          </div>
                          <span className={`font-mono font-bold text-xs ${
                            realBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatCurrency(realBalance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 2. TRANSACTIONS SCREEN */}
        {activeSubTab === 'transactions' && (
          <div>
            {/* Notification Banner for Bulk Import Success */}
            <AnimatePresence>
              {bulkImportSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className={`mx-5 mt-4 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
                    isHighContrast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100'
                      : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100 backdrop-blur-md shadow-emerald-950/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-400">
                        {bulkImportSuccessMsg.count} {bulkImportSuccessMsg.count === 1 ? 'lançamento importado com sucesso!' : 'lançamentos importados com sucesso!'}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Receitas: <span className="text-emerald-400 font-bold font-mono">+{formatCurrency(bulkImportSuccessMsg.totalReceitas)}</span> | Despesas: <span className="text-rose-400 font-bold font-mono">-{formatCurrency(bulkImportSuccessMsg.totalDespesas)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkImportSuccessMsg(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {/* Notification Banner for Bulk Transfer Import Success */}
              {transferImportSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className={`mx-5 mt-4 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
                    isHighContrast
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-indigo-100'
                      : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-100 backdrop-blur-md shadow-indigo-950/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 border border-indigo-500/30">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-indigo-400">
                        {transferImportSuccessMsg.count} {transferImportSuccessMsg.count === 1 ? 'transferência importada com sucesso!' : 'transferências importadas com sucesso!'}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Volume total transferido: <span className="text-indigo-400 font-bold font-mono">{formatCurrency(transferImportSuccessMsg.totalValue)}</span> entre as contas da igreja.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferImportSuccessMsg(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bank account cards in transactions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {accounts.map(acc => {
                // Determine the date range based on the filters
                let startDate = '';
                let endDate = '';

                if (txSelectedPeriod === '7d') {
                  const d = new Date();
                  d.setDate(d.getDate() - 7);
                  startDate = d.toISOString().split('T')[0];
                  endDate = new Date().toISOString().split('T')[0];
                } else if (txSelectedPeriod === '30d') {
                  const d = new Date();
                  d.setDate(d.getDate() - 30);
                  startDate = d.toISOString().split('T')[0];
                  endDate = new Date().toISOString().split('T')[0];
                } else if (txSelectedPeriod === '90d') {
                  const d = new Date();
                  d.setDate(d.getDate() - 90);
                  startDate = d.toISOString().split('T')[0];
                  endDate = new Date().toISOString().split('T')[0];
                } else if (txSelectedPeriod === 'custom') {
                  startDate = txStartDateFilter || '1970-01-01';
                  endDate = txEndDateFilter || '9999-12-31';
                } else {
                  // Year and Month
                  const year = txSelectedYear !== 'all' ? txSelectedYear : '';
                  const month = txSelectedMonth !== 'all' ? txSelectedMonth : '';
                  if (year && month) {
                    startDate = `${year}-${month}-01`;
                    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                    endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
                  } else if (year) {
                    startDate = `${year}-01-01`;
                    endDate = `${year}-12-31`;
                  } else if (month) {
                    const curYear = new Date().getFullYear().toString();
                    startDate = `${curYear}-${month}-01`;
                    const lastDay = new Date(parseInt(curYear), parseInt(month), 0).getDate();
                    endDate = `${curYear}-${month}-${lastDay.toString().padStart(2, '0')}`;
                  }
                }

                const hasActiveRange = !!(startDate || endDate);

                let initialBalanceForPeriod = Number(acc.initialBalance);
                let periodInflows = 0;
                let periodOutflows = 0;
                let periodTransfersIn = 0;
                let periodTransfersOut = 0;

                transactions.forEach(tx => {
                  if (tx.accountId === acc.id) {
                    if (hasActiveRange) {
                      if (tx.date < startDate) {
                        if (tx.type === 'entrada') initialBalanceForPeriod += tx.value;
                        else initialBalanceForPeriod -= tx.value;
                      } else if (tx.date >= startDate && tx.date <= endDate) {
                        if (tx.type === 'entrada') periodInflows += tx.value;
                        else periodOutflows += tx.value;
                      }
                    } else {
                      if (tx.type === 'entrada') periodInflows += tx.value;
                      else periodOutflows += tx.value;
                    }
                  }
                });

                transfers.forEach(tf => {
                  if (hasActiveRange) {
                    if (tf.date < startDate) {
                      if (tf.sourceAccountId === acc.id) initialBalanceForPeriod -= tf.value;
                      if (tf.destinationAccountId === acc.id) initialBalanceForPeriod += tf.value;
                    } else if (tf.date >= startDate && tf.date <= endDate) {
                      if (tf.sourceAccountId === acc.id) periodTransfersOut += tf.value;
                      if (tf.destinationAccountId === acc.id) periodTransfersIn += tf.value;
                    }
                  } else {
                    if (tf.sourceAccountId === acc.id) periodTransfersOut += tf.value;
                    if (tf.destinationAccountId === acc.id) periodTransfersIn += tf.value;
                  }
                });

                const totalEntradas = periodInflows + periodTransfersIn;
                const totalSaidas = periodOutflows + periodTransfersOut;
                const diff = totalEntradas - totalSaidas;
                const finalBalanceForPeriod = initialBalanceForPeriod + diff;

                // Format period/month description label
                let referenceLabel = 'Geral (Todo o Período)';
                if (txSelectedPeriod === '7d') {
                  referenceLabel = 'Últimos 7 dias';
                } else if (txSelectedPeriod === '30d') {
                  referenceLabel = 'Últimos 30 dias';
                } else if (txSelectedPeriod === '90d') {
                  referenceLabel = 'Últimos 90 dias';
                } else if (txSelectedPeriod === 'custom') {
                  const startFmt = txStartDateFilter ? txStartDateFilter.split('-').reverse().join('/') : 'Início';
                  const endFmt = txEndDateFilter ? txEndDateFilter.split('-').reverse().join('/') : 'Fim';
                  referenceLabel = `${startFmt} a ${endFmt}`;
                } else {
                  const year = txSelectedYear !== 'all' ? txSelectedYear : '';
                  const month = txSelectedMonth !== 'all' ? txSelectedMonth : '';
                  if (year && month) {
                    const monthObj = monthsList.find(m => m.value === month);
                    referenceLabel = `${monthObj?.label || month} de ${year}`;
                  } else if (year) {
                    referenceLabel = `Ano de ${year}`;
                  } else if (month) {
                    const monthObj = monthsList.find(m => m.value === month);
                    referenceLabel = `${monthObj?.label || month}`;
                  }
                }

                const isSelected = txSelectedAccountId === acc.id;

                return (
                  <div 
                    key={`tx-acc-${acc.id}`} 
                    onClick={() => setTxSelectedAccountId(isSelected ? 'all' : acc.id)}
                    className={`p-5 rounded-xl border flex flex-col justify-between relative cursor-pointer transition-all duration-300 select-none hover:scale-[1.01] ${
                      isSelected
                        ? isHighContrast
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                          : 'bg-indigo-950/25 border-indigo-500 ring-2 ring-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : isHighContrast
                          ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm'
                          : 'bg-zinc-900/10 border-[#27272a] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={36} />
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>{acc.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-semibold truncate">
                            {acc.bankName} • Ag {acc.agency} | CC {acc.accountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                            Filtrado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-zinc-800/60 grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Mês de Referência</p>
                        <p className={`font-semibold mt-0.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>{referenceLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Diferença</p>
                        <p className={`font-mono font-bold mt-0.5 ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                        </p>
                      </div>

                      <div className={`p-2 rounded-lg border ${
                        isHighContrast ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/30'
                      }`}>
                        <p className="text-[8px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Entradas
                        </p>
                        <p className="font-mono font-bold text-xs text-emerald-500 mt-0.5">
                          +{formatCurrency(totalEntradas)}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg border text-right ${
                        isHighContrast ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-800/30'
                      }`}>
                        <p className="text-[8px] text-rose-600 dark:text-rose-400 uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Saídas
                        </p>
                        <p className="font-mono font-bold text-xs text-rose-500 mt-0.5">
                          -{formatCurrency(totalSaidas)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Saldo Inicial</p>
                        <p className="font-mono text-zinc-400 mt-0.5">{formatCurrency(initialBalanceForPeriod)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Saldo Atual</p>
                        <p className={`font-mono font-bold text-sm mt-0.5 ${finalBalanceForPeriod >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
                          {formatCurrency(finalBalanceForPeriod)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toolbar section */}
            <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
              isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-900'
            }`}>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 w-full sm:w-auto">
                <button
                  onClick={() => setTxFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    txFilterType === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTxFilterType('entrada')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    txFilterType === 'entrada' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setTxFilterType('saida')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    txFilterType === 'saida' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Despesas
                </button>
                <button
                  onClick={() => setTxFilterType('transfer')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    txFilterType === 'transfer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Transferências entre Contas
                </button>

                {/* Campo de Pesquisa em Transações ao lado de Transferências */}
                <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial ml-0 sm:ml-1.5">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar lançamentos..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-xs transition-colors border outline-none ${
                      isHighContrast 
                        ? 'bg-white border-zinc-300 text-zinc-900 focus:border-indigo-600 placeholder:text-zinc-400' 
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 focus:border-indigo-500 placeholder:text-zinc-500'
                    }`}
                  />
                  {txSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTxSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons inside transaction tab */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto items-center">
                {/* Botão de Exportar Arquivo (PDF ou Excel) */}
                <div className="relative flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(prev => !prev)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-sm ${
                      isHighContrast
                        ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                    }`}
                    title="Exportar arquivo em PDF ou Excel"
                  >
                    <Download size={12} className="text-indigo-400" />
                    <span>Exportar</span>
                    <ChevronDown size={11} className={`text-zinc-400 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showExportMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowExportMenu(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-56 rounded-xl border shadow-2xl z-50 p-1.5 backdrop-blur-md ${
                            isHighContrast
                              ? 'bg-white border-zinc-200 text-zinc-800 shadow-zinc-300/60'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80'
                          }`}
                        >
                          <div className="px-2.5 py-1.5 border-b border-zinc-700/20 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            Exportar Lançamentos
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              setShowPrintReportModal(true);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                              isHighContrast
                                ? 'hover:bg-rose-50 text-zinc-800 hover:text-rose-700'
                                : 'hover:bg-rose-500/10 text-zinc-200 hover:text-rose-300'
                            }`}
                          >
                            <div className="p-1.5 rounded-md bg-rose-500/15 text-rose-500 shrink-0">
                              <FileText size={14} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-[11px] leading-tight">Exportar em PDF</p>
                              <p className="text-[9px] text-zinc-500 truncate">Relatório formatado (.pdf / impressão)</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              handleExportExcel();
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                              isHighContrast
                                ? 'hover:bg-emerald-50 text-zinc-800 hover:text-emerald-700'
                                : 'hover:bg-emerald-500/10 text-zinc-200 hover:text-emerald-300'
                            }`}
                          >
                            <div className="p-1.5 rounded-md bg-emerald-500/15 text-emerald-500 shrink-0">
                              <FileSpreadsheet size={14} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-[11px] leading-tight">Exportar em Excel</p>
                              <p className="text-[9px] text-zinc-500 truncate">Planilha detalhada (.xlsx)</p>
                            </div>
                          </button>

                          <div className="my-1 border-t border-zinc-700/20" />

                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              setShowBulkImportModal(true);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                              isHighContrast
                                ? 'hover:bg-indigo-50 text-zinc-800 hover:text-indigo-700'
                                : 'hover:bg-indigo-500/10 text-zinc-200 hover:text-indigo-300'
                            }`}
                          >
                            <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400 shrink-0">
                              <Upload size={14} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-[11px] leading-tight text-indigo-400">Importar Lançamentos</p>
                              <p className="text-[9px] text-zinc-500 truncate">Receitas e Despesas (.xlsx / .csv)</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowExportMenu(false);
                              setShowBulkTransferImportModal(true);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                              isHighContrast
                                ? 'hover:bg-indigo-50 text-zinc-800 hover:text-indigo-700'
                                : 'hover:bg-indigo-500/10 text-zinc-200 hover:text-indigo-300'
                            }`}
                          >
                            <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400 shrink-0">
                              <RefreshCw size={14} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-[11px] leading-tight text-indigo-400">Importar Transferências</p>
                              <p className="text-[9px] text-zinc-500 truncate">Entre contas e caixas (.xlsx / .csv)</p>
                            </div>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botão de Importar em Massa dedicado */}
                {txFilterType === 'transfer' ? (
                  <button
                    type="button"
                    onClick={() => setShowBulkTransferImportModal(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-sm ${
                      isHighContrast
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100'
                        : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
                    }`}
                    title="Importar transferências entre contas em lote via Excel ou CSV"
                  >
                    <Upload size={12} className="text-indigo-400" />
                    <span>Importar Transferências em Massa</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBulkImportModal(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-sm ${
                      isHighContrast
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100'
                        : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
                    }`}
                    title="Importar receitas e despesas em lote via Excel ou CSV"
                  >
                    <Upload size={12} className="text-indigo-400" />
                    <span>Importar em Massa</span>
                  </button>
                )}

                {/* Botão de Gestão de Favorecidos & Pagadores */}
                <button
                  type="button"
                  onClick={() => {
                    setEntityFilterType('todos');
                    setEntitySearchQuery('');
                    setShowEntitiesManagerModal(true);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-sm ${
                    isHighContrast
                      ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                  }`}
                  title="Gerenciar cadastro de quem irá receber (favorecidos) ou quem irá pagar (membros/doadores)"
                >
                  <Users size={12} className="text-indigo-400" />
                  <span>Favorecidos & Pagadores</span>
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-400 font-bold">
                    {financialEntities.length}
                  </span>
                </button>

                <button
                  onClick={() => { setEditingTx(null); setTxType('entrada'); setShowTxModal(true); }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={12} /> Receita
                </button>
                <button
                  onClick={() => { setEditingTx(null); setTxType('saida'); setShowTxModal(true); }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={12} /> Despesa
                </button>
                <button
                  onClick={handleOpenNewTransfer}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw size={12} /> Transferência
                </button>
              </div>
            </div>

              {/* Secondary filters: Year, Month, Period, Bank Account, Category, Status */}
            <div className={`px-5 py-3.5 border-b flex flex-wrap items-center gap-4 select-none ${
              isHighContrast ? 'bg-zinc-100/60 border-zinc-200' : 'bg-zinc-950/30 border-zinc-900/80'
            }`}>
              {/* Filter by Bank Account */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Conta:</span>
                <select
                  value={txSelectedAccountId}
                  onChange={(e) => setTxSelectedAccountId(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="all">Todas as Contas</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                  ))}
                </select>
              </div>

              {/* Filter by Category */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Categoria:</span>
                <select
                  value={txSelectedCategoryId}
                  onChange={(e) => setTxSelectedCategoryId(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="all">Todas as Categorias</option>
                  {categories
                    .filter(c => txFilterType === 'all' ? true : (txFilterType === 'entrada' ? (c.type === 'entrada' || c.type === 'ambas') : (c.type === 'saida' || c.type === 'ambas')))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              {/* Filter by Status (Recebido / Pago) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  {txFilterType === 'entrada' ? 'Recebido:' : txFilterType === 'saida' ? 'Pago:' : 'Situação:'}
                </span>
                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {txFilterType === 'entrada' ? (
                    <>
                      <option value="all">Todos</option>
                      <option value="recebido_sim">Recebido (Sim)</option>
                      <option value="recebido_nao">A Receber (Não)</option>
                    </>
                  ) : txFilterType === 'saida' ? (
                    <>
                      <option value="all">Todos</option>
                      <option value="pago_sim">Pago (Sim)</option>
                      <option value="pago_nao">A Pagar (Não)</option>
                    </>
                  ) : (
                    <>
                      <option value="all">Todos</option>
                      <option value="recebido_sim">Recebidos (Sim)</option>
                      <option value="recebido_nao">A Receber (Não)</option>
                      <option value="pago_sim">Pagos (Sim)</option>
                      <option value="pago_nao">A Pagar (Não)</option>
                      <option value="concluido">Concluídos (Recebido / Pago)</option>
                      <option value="pendente">Pendentes (A Receber / A Pagar)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Filter by Year */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Ano:</span>
                <select
                  value={txSelectedYear}
                  onChange={(e) => setTxSelectedYear(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="all">Todos</option>
                  {availableDashYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Month */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Mês:</span>
                <select
                  value={txSelectedMonth}
                  onChange={(e) => setTxSelectedMonth(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="all">Todos</option>
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Period */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Período:</span>
                <select
                  value={txSelectedPeriod}
                  onChange={(e) => setTxSelectedPeriod(e.target.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="all">Todos os Lançamentos</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="custom">Personalizado</option>
                </select>

                {txSelectedPeriod === 'custom' && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Início:</span>
                    <input
                      type="date"
                      value={txStartDateFilter}
                      onChange={(e) => setTxStartDateFilter(e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                      }`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Fim:</span>
                    <input
                      type="date"
                      value={txEndDateFilter}
                      onChange={(e) => setTxEndDateFilter(e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Active sort badge */}
              {txSortOrder && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                  {txSortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>Data: {txSortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</span>
                  <button 
                    onClick={() => setTxSortOrder(null)} 
                    className="ml-1 text-indigo-400 hover:text-indigo-200 cursor-pointer"
                    title="Remover ordenação por data"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Clean filters button if any active */}
              {(txSelectedYear !== 'all' || txSelectedMonth !== 'all' || txSelectedPeriod !== 'all' || txSelectedAccountId !== 'all' || txSelectedCategoryId !== 'all' || txStatusFilter !== 'all' || txStartDateFilter || txEndDateFilter || txSortOrder !== null) && (
                <button
                  onClick={() => {
                    setTxSelectedYear('all');
                    setTxSelectedMonth('all');
                    setTxSelectedPeriod('all');
                    setTxStartDateFilter('');
                    setTxEndDateFilter('');
                    setTxSelectedAccountId('all');
                    setTxSelectedCategoryId('all');
                    setTxStatusFilter('all');
                    setTxSortOrder(null);
                  }}
                  className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-wider underline cursor-pointer ml-auto"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Bulk Action Bar for Selected Transactions */}
            {selectedTxIds.length > 0 && (
              <div className={`mx-5 mb-4 p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all animate-in fade-in duration-200 ${
                isHighContrast 
                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-sm' 
                  : 'bg-indigo-950/40 border-indigo-800/80 text-indigo-200 shadow-lg'
              }`}>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold shrink-0">
                    {selectedTxIds.length}
                  </span>
                  <span className="text-xs font-bold">
                    {selectedTxIds.length} {selectedTxIds.length === 1 ? 'lançamento selecionado' : 'lançamentos selecionados'}
                  </span>
                  {!isAllFilteredSelected && displayTransactions.length > paginatedTransactions.length && (
                    <button
                      onClick={selectAllFiltered}
                      className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 underline cursor-pointer ml-1"
                    >
                      Selecionar todos os {displayTransactions.length} lançamentos filtrados
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearSelection}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isHighContrast
                        ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                        : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    Limpar seleção
                  </button>

                  <button
                    onClick={handleBulkDeleteTx}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Excluir Selecionados ({selectedTxIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Table data renderer */}
            {txFilterType !== 'transfer' ? (
              displayTransactions.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <DollarSign size={24} className="mx-auto text-zinc-500" />
                  <p className="text-xs font-bold text-zinc-400">Nenhum lançamento de caixa localizado</p>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full border-collapse text-left min-w-[1100px]">
                      <thead>
                        <tr className={`border-b text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-900'
                        }`}>
                          {/* Checkbox Header for Mass Selection */}
                          <th className="py-3.5 px-3 w-10 text-center select-none">
                            <input
                              type="checkbox"
                              checked={isAllPageSelected}
                              ref={el => {
                                if (el) el.indeterminate = isSomePageSelected;
                              }}
                              onChange={toggleSelectAllPage}
                              className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                              title={isAllPageSelected ? "Desmarcar todos desta página" : "Selecionar todos desta página"}
                            />
                          </th>
                          <th 
                            onClick={() => setTxSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="py-3.5 px-3 cursor-pointer select-none group transition-colors hover:text-indigo-400"
                            title="Clique para ordenar por data (crescente / decrescente)"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>
                                {txFilterType === 'entrada' ? 'Data de Recebido' : txFilterType === 'saida' ? 'Data de Lançamento' : 'Data'}
                              </span>
                              {txSortOrder === 'asc' ? (
                                <span className="inline-flex items-center gap-0.5 text-indigo-400 bg-indigo-500/15 px-1 py-0.5 rounded font-bold text-[9px]" title="Ordem crescente">
                                  <ArrowUp size={11} className="shrink-0" />
                                </span>
                              ) : txSortOrder === 'desc' ? (
                                <span className="inline-flex items-center gap-0.5 text-indigo-400 bg-indigo-500/15 px-1 py-0.5 rounded font-bold text-[9px]" title="Ordem decrescente">
                                  <ArrowDown size={11} className="shrink-0" />
                                </span>
                              ) : (
                                <ArrowUpDown size={11} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                              )}
                            </div>
                          </th>
                          <th className="py-3.5 px-4 min-w-[150px]">Descrição</th>
                          <th className="py-3.5 px-3">Valor</th>
                          <th className="py-3.5 px-3">Tipo</th>
                          <th className="py-3.5 px-3">Categoria</th>
                          <th className="py-3.5 px-3">Conta Bancária</th>
                          <th className="py-3.5 px-3">
                            {txFilterType === 'entrada' ? 'Recebido' : txFilterType === 'saida' ? 'Pago' : 'Recebido / Pago'}
                          </th>
                          <th className="py-3.5 px-3">
                            {txFilterType === 'entrada' ? 'Recebido de' : txFilterType === 'saida' ? 'Pagar quem' : 'Recebido de / Pagar quem'}
                          </th>
                          <th className="py-3.5 px-3">Forma de Pagamento</th>
                          <th className="py-3.5 px-3">Parcelamento</th>
                          <th className="py-3.5 px-3">Observações</th>
                          <th className="py-3.5 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs font-medium ${isHighContrast ? 'divide-zinc-200 text-zinc-800' : 'divide-zinc-900 text-zinc-300'}`}>
                        {paginatedTransactions.map(tx => {
                          const category = categories.find(c => c.id === tx.categoryId);
                          const account = accounts.find(a => a.id === tx.accountId);
                          const isEntrada = tx.type === 'entrada';
                          const dateValue = isEntrada 
                            ? (tx.dataRecebido || tx.date) 
                            : (tx.dataLancamento || tx.date);
                          const isDone = isEntrada 
                            ? (tx.recebido !== 'nao') 
                            : (tx.pago !== 'nao');
                          const personEntity = isEntrada 
                            ? (tx.recebidoDe || '—') 
                            : (tx.vaiPagarQuem || '—');
                          const isSelected = selectedTxIds.includes(tx.id);

                          return (
                            <tr 
                              key={tx.id} 
                              className={`transition-colors ${
                                isSelected 
                                  ? (isHighContrast ? 'bg-indigo-50/80' : 'bg-indigo-950/30') 
                                  : (isHighContrast ? 'hover:bg-zinc-50' : 'hover:bg-zinc-50/10')
                              }`}
                            >
                              {/* Checkbox column */}
                              <td className="py-3.5 px-3 text-center select-none" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectTx(tx.id)}
                                  className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                                />
                              </td>

                              {/* 1. Data de recebido / Data de lançamento */}
                              <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                                {dateValue ? dateValue.split('-').reverse().join('/') : '—'}
                              </td>

                              {/* 2. Descrição */}
                              <td className="py-3.5 px-4 font-semibold min-w-[150px]">
                                <div className="flex items-center gap-2">
                                  <span className={isHighContrast ? 'text-zinc-900' : 'text-zinc-100'}>{tx.description}</span>
                                  {tx.receiptImage && (
                                    <button
                                      onClick={() => setSelectedReceiptImage(tx.receiptImage || null)}
                                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 text-[9px] font-bold border transition-colors cursor-pointer shrink-0 ${
                                        isHighContrast 
                                          ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700' 
                                          : 'bg-zinc-800/60 hover:bg-zinc-750 border-zinc-750 text-zinc-300'
                                      }`}
                                      title="Visualizar Recibo Anexo"
                                    >
                                      <FileText size={10} className="text-indigo-400" />
                                      <span>Recibo</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* 3. Valor */}
                              <td className={`py-3.5 px-3 font-bold whitespace-nowrap font-mono ${isEntrada ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isEntrada ? '+' : '-'} {formatCurrency(tx.value)}
                              </td>

                              {/* 4. Tipo */}
                              <td className="py-3.5 px-3 uppercase text-[9px] font-bold whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full ${isEntrada ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>
                                  {isEntrada ? 'Receita' : 'Despesa'}
                                </span>
                              </td>

                              {/* 5. Categoria */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-medium border ${category?.color || 'bg-zinc-500/10'}`}>
                                  {category?.name || 'Não classificado'}{tx.subcategory ? ` • ${tx.subcategory}` : ''}
                                </span>
                              </td>

                              {/* 6. Conta bancária */}
                              <td className="py-3.5 px-3 font-semibold whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {account ? (
                                    <>
                                      <BankLogo bankName={account.bankName} imageUrl={account.image} size={18} />
                                      <span className={isHighContrast ? 'text-zinc-700' : 'text-indigo-400 font-semibold text-xs'}>{account.name}</span>
                                    </>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </div>
                              </td>

                              {/* 7. Recebido / Pago */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  isDone 
                                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-amber-500/15 text-amber-500 border-amber-500/20'
                                }`}>
                                  {isDone ? 'Sim' : 'Não'}
                                </span>
                              </td>

                              {/* 8. Recebido de / Pagar quem */}
                              <td className="py-3.5 px-3 text-xs text-zinc-400 whitespace-nowrap">
                                {personEntity}
                              </td>

                              {/* 9. Forma de pagamento */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                {tx.formaPagamento ? (
                                  <span className={`uppercase text-[9px] font-bold px-2 py-0.5 rounded border ${
                                    isHighContrast ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60'
                                  }`}>
                                    {tx.formaPagamento}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500">—</span>
                                )}
                              </td>

                              {/* 10. Parcelamento */}
                              <td className="py-3.5 px-3 whitespace-nowrap text-xs">
                                {tx.parcelamento === 'sim' ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-indigo-400">
                                      {tx.parcelaAtual || 1}/{tx.numeroParcelas || 1}
                                    </span>
                                    {tx.frequenciaParcelas && (
                                      <span className="text-[10px] text-zinc-500 capitalize">
                                        {tx.frequenciaParcelas}
                                      </span>
                                    )}
                                  </div>
                                ) : tx.parcelamento === 'recorrente' ? (
                                  <span className="font-semibold text-purple-400">Recorrente</span>
                                ) : (
                                  <span className="text-zinc-500">À Vista</span>
                                )}
                              </td>

                              {/* 11. Observações */}
                              <td className="py-3.5 px-3 max-w-[200px] truncate text-[11px] text-zinc-400" title={tx.observation || ''}>
                                {tx.observation || '—'}
                              </td>

                              {/* 12. Ações */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1.5 items-center">
                                  <button
                                    onClick={() => {
                                      setEditingTx(tx);
                                      setTxDescription(tx.description);
                                      setTxValue(tx.value.toString());
                                      setTxType(tx.type);
                                      setTxCategoryId(tx.categoryId);
                                      setTxSubcategory(tx.subcategory || '');
                                      setTxAccountId(tx.accountId);
                                      setTxDate(tx.date);
                                      setTxObservation(tx.observation || '');
                                      
                                      // Populate new fields or default if undefined
                                      setTxRecebido(tx.recebido || 'sim');
                                      setTxRecebidoDe(tx.recebidoDe || '');
                                      setTxDataRecebido(tx.dataRecebido || tx.date);
                                      setTxDataLancamento(tx.dataLancamento || tx.date);
                                      setTxParcelamento(tx.parcelamento || 'nao');
                                      setTxFrequenciaParcelas(tx.frequenciaParcelas || 'mensal');
                                      setTxNumeroParcelas(tx.numeroParcelas ? tx.numeroParcelas.toString() : '1');
                                      setTxParcelaAtual(tx.parcelaAtual ? tx.parcelaAtual.toString() : '1');
                                      setTxFormaPagamento(tx.formaPagamento || 'pix');
                                      setTxCreditCardId(tx.creditCardId || '');
                                      setTxPago(tx.pago || 'sim');
                                      setTxVaiPagarQuem(tx.vaiPagarQuem || '');
                                      setTxDataVencimento(tx.dataVencimento || tx.date);
                                      setTxReceiptImage(tx.receiptImage || null);
                                      
                                      setShowTxModal(true);
                                    }}
                                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                                      isHighContrast ? 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800/40'
                                    }`}
                                    title="Editar Lançamento"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTx(tx.id)}
                                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                                      isHighContrast ? 'text-zinc-500 hover:text-red-600 hover:bg-zinc-100' : 'text-zinc-500 hover:text-red-500 hover:bg-red-500/5'
                                    }`}
                                    title="Excluir Lançamento"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {displayTransactions.length > 0 && (
                    <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-950/40 border-zinc-900 text-zinc-400'
                    }`}>
                      {/* Range Info */}
                      <div className="flex items-center gap-2">
                        <span>
                          Mostrando <strong className={isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}>
                            {Math.min((validCurrentPage - 1) * txItemsPerPage + 1, displayTransactions.length)}
                          </strong> a <strong className={isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}>
                            {Math.min(validCurrentPage * txItemsPerPage, displayTransactions.length)}
                          </strong> de <strong className={isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}>
                            {displayTransactions.length}
                          </strong> lançamentos
                        </span>
                      </div>

                      {/* Items Per Page Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-500">Linhas por página:</span>
                        <select
                          value={txItemsPerPage}
                          onChange={(e) => {
                            setTxItemsPerPage(Number(e.target.value));
                            setTxCurrentPage(1);
                          }}
                          className={`px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center gap-1">
                        {/* First Page */}
                        <button
                          onClick={() => setTxCurrentPage(1)}
                          disabled={validCurrentPage === 1}
                          className={`p-1.5 rounded-lg border transition-all ${
                            validCurrentPage === 1
                              ? 'opacity-40 cursor-not-allowed border-transparent'
                              : isHighContrast
                                ? 'hover:bg-zinc-200 border-zinc-200 text-zinc-700 cursor-pointer'
                                : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300 cursor-pointer'
                          }`}
                          title="Primeira página"
                        >
                          <ChevronsLeft size={15} />
                        </button>

                        {/* Previous Page */}
                        <button
                          onClick={() => setTxCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={validCurrentPage === 1}
                          className={`p-1.5 rounded-lg border transition-all ${
                            validCurrentPage === 1
                              ? 'opacity-40 cursor-not-allowed border-transparent'
                              : isHighContrast
                                ? 'hover:bg-zinc-200 border-zinc-200 text-zinc-700 cursor-pointer'
                                : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300 cursor-pointer'
                          }`}
                          title="Página anterior"
                        >
                          <ChevronLeft size={15} />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1 mx-1">
                          {(() => {
                            const pages: (number | string)[] = [];
                            if (totalTxPages <= 7) {
                              for (let i = 1; i <= totalTxPages; i++) pages.push(i);
                            } else {
                              if (validCurrentPage <= 4) {
                                pages.push(1, 2, 3, 4, 5, '...', totalTxPages);
                              } else if (validCurrentPage >= totalTxPages - 3) {
                                pages.push(1, '...', totalTxPages - 4, totalTxPages - 3, totalTxPages - 2, totalTxPages - 1, totalTxPages);
                              } else {
                                pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalTxPages);
                              }
                            }

                            return pages.map((page, idx) => {
                              if (page === '...') {
                                return <span key={`ellipsis-${idx}`} className="px-1 text-zinc-500 font-bold">...</span>;
                              }
                              const isCurrent = page === validCurrentPage;
                              return (
                                <button
                                  key={`page-${page}`}
                                  onClick={() => setTxCurrentPage(Number(page))}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                      : isHighContrast
                                        ? 'text-zinc-700 hover:bg-zinc-200'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            });
                          })()}
                        </div>

                        {/* Next Page */}
                        <button
                          onClick={() => setTxCurrentPage(prev => Math.min(totalTxPages, prev + 1))}
                          disabled={validCurrentPage === totalTxPages}
                          className={`p-1.5 rounded-lg border transition-all ${
                            validCurrentPage === totalTxPages
                              ? 'opacity-40 cursor-not-allowed border-transparent'
                              : isHighContrast
                                ? 'hover:bg-zinc-200 border-zinc-200 text-zinc-700 cursor-pointer'
                                : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300 cursor-pointer'
                          }`}
                          title="Próxima página"
                        >
                          <ChevronRight size={15} />
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={() => setTxCurrentPage(totalTxPages)}
                          disabled={validCurrentPage === totalTxPages}
                          className={`p-1.5 rounded-lg border transition-all ${
                            validCurrentPage === totalTxPages
                              ? 'opacity-40 cursor-not-allowed border-transparent'
                              : isHighContrast
                                ? 'hover:bg-zinc-200 border-zinc-200 text-zinc-700 cursor-pointer'
                                : 'hover:bg-zinc-800 border-zinc-800 text-zinc-300 cursor-pointer'
                          }`}
                          title="Última página"
                        >
                          <ChevronsRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              displayTransfers.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mx-auto border border-indigo-500/20">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-300">Nenhuma transferência localizada no período</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Realize uma nova transferência entre contas ou importe uma planilha em massa.</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenNewTransfer}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Plus size={12} /> Nova Transferência
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkTransferImportModal(true)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isHighContrast ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <Upload size={12} className="text-indigo-400" />
                      <span>Importar em Massa</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full border-collapse text-left min-w-[700px]">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-900'
                      }`}>
                        <th 
                          onClick={() => setTxSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="py-4 px-4 cursor-pointer select-none group transition-colors hover:text-indigo-400"
                          title="Clique para ordenar por data (crescente / decrescente)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Data</span>
                            {txSortOrder === 'asc' ? (
                              <span className="inline-flex items-center gap-0.5 text-indigo-400 bg-indigo-500/15 px-1 py-0.5 rounded font-bold text-[9px]" title="Ordem crescente">
                                <ArrowUp size={11} className="shrink-0" />
                              </span>
                            ) : txSortOrder === 'desc' ? (
                              <span className="inline-flex items-center gap-0.5 text-indigo-400 bg-indigo-500/15 px-1 py-0.5 rounded font-bold text-[9px]" title="Ordem decrescente">
                                <ArrowDown size={11} className="shrink-0" />
                              </span>
                            ) : (
                              <ArrowUpDown size={11} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                            )}
                          </div>
                        </th>
                        <th className="py-4 px-6">Origem</th>
                        <th className="py-4 px-4">Destino</th>
                        <th className="py-4 px-4">Valor</th>
                        <th className="py-4 px-4">Histórico / Observações</th>
                        <th className="py-4 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs font-medium ${isHighContrast ? 'divide-zinc-200 text-zinc-800' : 'divide-zinc-900 text-zinc-300'}`}>
                      {displayTransfers.map(tf => {
                        const src = accounts.find(a => a.id === tf.sourceAccountId);
                        const dest = accounts.find(a => a.id === tf.destinationAccountId);
                        return (
                          <tr key={tf.id} className="hover:bg-zinc-50/10">
                            {/* 1. Data */}
                            <td className="py-4 px-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                              {tf.date.split('-').reverse().join('/')}
                            </td>

                            {/* 2. Origem */}
                            <td className="py-4 px-6 font-semibold text-red-500 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {src && <BankLogo bankName={src.bankName} imageUrl={src.image} size={18} />}
                                <span>{src?.name || '—'}</span>
                              </div>
                            </td>

                            {/* 3. Destino */}
                            <td className="py-4 px-4 font-semibold text-emerald-500 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {dest && <BankLogo bankName={dest.bankName} imageUrl={dest.image} size={18} />}
                                <span>{dest?.name || '—'}</span>
                              </div>
                            </td>

                            {/* 4. Valor */}
                            <td className="py-4 px-4 font-bold font-mono whitespace-nowrap">{formatCurrency(tf.value)}</td>

                            {/* 5. Histórico / Observações */}
                            <td className="py-4 px-4 text-zinc-400 max-w-xs truncate text-xs">{tf.observation || '—'}</td>

                            {/* 6. Ações */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditTransfer(tf)}
                                  className="p-1.5 text-zinc-500 hover:text-indigo-400 rounded hover:bg-indigo-500/10 cursor-pointer transition-colors"
                                  title="Editar Transferência"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransfer(tf.id)}
                                  className="p-1.5 text-zinc-500 hover:text-red-500 rounded hover:bg-red-500/10 cursor-pointer transition-colors"
                                  title="Excluir Transferência"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

        {/* 2.5 CREDIT CARDS LIST & MANAGEMENT SCREEN */}
        {activeSubTab === 'cards' && (
          <div className="space-y-6">
            {/* Header / Actions Bar */}
            <div className={`p-4 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-900'}`}>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>
                  <CreditCard size={15} className="text-indigo-400" />
                  Cartões de Crédito Corporativos
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Gerencie limites, faturas, datas de fechamento/vencimento e fotos dos cartões.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    resetCardForm();
                    setShowCardModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer uppercase tracking-wider shadow transition-colors"
                >
                  <Plus size={12} /> Novo Cartão de Crédito
                </button>
              </div>
            </div>

            {/* Quick Metrics for Credit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-5">
              <div className={`p-4 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Limite Total Concedido</span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <CreditCard size={13} />
                  </div>
                </div>
                <p className="text-lg font-bold font-mono text-indigo-400 mt-2">
                  {formatCurrency(creditCards.reduce((sum, c) => sum + (c.limit || 0), 0))}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Soma de todos os cartões cadastrados</p>
              </div>

              <div className={`p-4 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fatura Atual Comprometida</span>
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <ArrowDownRight size={13} />
                  </div>
                </div>
                <p className="text-lg font-bold font-mono text-rose-500 mt-2">
                  {formatCurrency(creditCards.reduce((sum, c) => sum + (c.usedLimit || 0), 0))}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Total de compras / limite em uso</p>
              </div>

              <div className={`p-4 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Limite Disponível</span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ArrowUpRight size={13} />
                  </div>
                </div>
                <p className="text-lg font-bold font-mono text-emerald-500 mt-2">
                  {formatCurrency(
                    Math.max(0, creditCards.reduce((sum, c) => sum + (c.limit || 0) - (c.usedLimit || 0), 0))
                  )}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Saldo livre para novas despesas</p>
              </div>

              <div className={`p-4 rounded-xl border ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cartões Ativos</span>
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <ShieldCheck size={13} />
                  </div>
                </div>
                <p className={`text-lg font-bold font-mono mt-2 ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                  {creditCards.filter(c => c.status !== 'blocked').length} / {creditCards.length}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Cartões corporativos habilitados</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-1 ${
                  isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <Search size={14} className="text-zinc-500" />
                  <input
                    type="text"
                    value={cardSearchQuery}
                    onChange={(e) => setCardSearchQuery(e.target.value)}
                    placeholder="Buscar por nome do cartão, banco ou final..."
                    className="w-full bg-transparent text-xs focus:outline-none text-zinc-200 placeholder-zinc-500"
                  />
                  {cardSearchQuery && (
                    <button onClick={() => setCardSearchQuery('')} className="text-zinc-500 hover:text-white">
                      <X size={13} />
                    </button>
                  )}
                </div>

                <select
                  value={cardBrandFilter}
                  onChange={(e) => setCardBrandFilter(e.target.value)}
                  className={`text-xs px-3 py-2 rounded-xl border font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                    isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <option value="todos">Todas Bandeiras</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="visa">Visa</option>
                  <option value="elo">Elo</option>
                  <option value="amex">Amex</option>
                  <option value="hipercard">Hipercard</option>
                </select>
              </div>
            </div>

            {/* Cards Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
              {creditCards
                .filter(card => {
                  const matchSearch = !cardSearchQuery.trim() || 
                    card.name.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
                    card.bankName.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
                    card.lastFourDigits.includes(cardSearchQuery) ||
                    (card.cardholderName || '').toLowerCase().includes(cardSearchQuery.toLowerCase());
                  const matchBrand = cardBrandFilter === 'todos' || card.brand === cardBrandFilter;
                  return matchSearch && matchBrand;
                })
                .map(card => {
                  const used = card.usedLimit || 0;
                  const limit = card.limit || 1;
                  const usagePct = Math.min(100, Math.round((used / limit) * 100));
                  const available = Math.max(0, limit - used);
                  const isLight = !card.image && isLightCardColor(card.color);

                  return (
                    <div 
                      key={card.id} 
                      className={`p-5 rounded-2xl border flex flex-col justify-between relative group transition-all duration-300 ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-md' : 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Realistic Visual Credit Card */}
                      <div className={`w-full aspect-[1.586/1] rounded-2xl relative p-5 overflow-hidden shadow-2xl flex flex-col justify-between border select-none transition-transform duration-300 group-hover:scale-[1.01] ${
                        isLight ? 'border-zinc-300 shadow-xl' : card.image ? 'border-zinc-700/60' : 'border-white/10'
                      }`}
                      style={
                        !card.image && (card.color?.startsWith('#') || isLight)
                          ? { backgroundColor: card.color || '#ffffff' }
                          : undefined
                      }>
                        {/* Background: Custom Image or Color Gradient */}
                        {card.image ? (
                          <div className="absolute inset-0 z-0">
                            <img 
                              src={card.image} 
                              alt={card.name} 
                              className="w-full h-full object-cover"
                            />
                            {/* Glassmorphic lighting gradient overlay for high readability */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
                          </div>
                        ) : card.color?.startsWith('#') || isLight ? (
                          <div className="absolute inset-0 z-0" style={{ backgroundColor: card.color || '#ffffff' }}>
                            {/* Subtle geometric lines */}
                            <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full border pointer-events-none ${isLight ? 'border-zinc-900/10' : 'border-white/5'}`} />
                            <div className={`absolute -left-12 -bottom-12 w-48 h-48 rounded-full border pointer-events-none ${isLight ? 'border-zinc-900/10' : 'border-white/5'}`} />
                          </div>
                        ) : (
                          <div className={`absolute inset-0 z-0 ${
                            card.color?.startsWith('from-') 
                              ? `bg-gradient-to-br ${card.color}` 
                              : card.color?.startsWith('bg-')
                                ? card.color
                                : 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-black'
                          }`}>
                            {/* Subtle geometric lines */}
                            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
                            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
                          </div>
                        )}

                        {/* Card Top Row: EMV Chip, Contactless Icon & Bank Logo */}
                        <div className="relative z-10 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {/* Golden EMV Smart Chip */}
                            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-500 border border-amber-600/40 shadow-inner grid grid-cols-2 gap-0.5 p-1">
                              <div className="border border-amber-800/30 rounded-xs" />
                              <div className="border border-amber-800/30 rounded-xs" />
                              <div className="border border-amber-800/30 rounded-xs" />
                              <div className="border border-amber-800/30 rounded-xs" />
                            </div>

                            {/* Contactless Wifi Icon */}
                            <Wifi size={17} className={`rotate-90 ${isLight ? 'text-zinc-800' : 'text-white/70'}`} />
                          </div>

                          {/* Bank Name / Logo */}
                          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
                            isLight 
                              ? 'bg-zinc-100 text-zinc-900 border-zinc-300 shadow-xs' 
                              : 'bg-black/40 backdrop-blur-md border-white/10 text-white'
                          }`}>
                            <BankLogo bankName={card.bankName} size={20} />
                            <span className={`text-[11px] font-bold tracking-wide truncate max-w-[120px] ${
                              isLight ? 'text-zinc-900' : 'text-white'
                            }`}>
                              {card.bankName}
                            </span>
                          </div>
                        </div>

                        {/* Card Middle Row: Masked Number */}
                        <div className="relative z-10 py-1">
                          <p className={`font-mono text-base tracking-[0.25em] font-black ${
                            isLight ? 'text-zinc-950' : 'text-white drop-shadow-md'
                          }`}>
                            ••••  ••••  ••••  {card.lastFourDigits}
                          </p>
                        </div>

                        {/* Card Bottom Row: Cardholder, Dates & Brand Logo */}
                        <div className="relative z-10 flex justify-between items-end">
                          <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                            <p className={`text-[8px] uppercase tracking-widest font-bold ${
                              isLight ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Titular</p>
                            <p className={`text-[11px] font-black uppercase tracking-wider truncate font-mono ${
                              isLight ? 'text-zinc-950' : 'text-white drop-shadow'
                            }`}>
                              {card.cardholderName || 'MINISTÉRIO NOVA VIDA'}
                            </p>
                            <div className={`flex items-center gap-2 text-[8px] font-bold pt-0.5 ${
                              isLight ? 'text-zinc-600' : 'text-zinc-300'
                            }`}>
                              <span>FECH: Dia {card.closingDay}</span>
                              <span>•</span>
                              <span>VENC: Dia {card.dueDay}</span>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end">
                            <CreditCardBrandLogo brand={card.brand} size={32} isLight={isLight} />
                          </div>
                        </div>

                        {/* Custom Image Badge Overlay (if card has custom uploaded photo) */}
                        {card.image && (
                          <button
                            type="button"
                            onClick={() => setSelectedCardPreviewImage(card.image || null)}
                            className="absolute right-3 bottom-3 z-20 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold flex items-center gap-1 border border-white/20 transition-colors cursor-pointer"
                            title="Visualizar foto ampliada do cartão"
                          >
                            <Eye size={10} /> Foto
                          </button>
                        )}
                      </div>

                      {/* Financial Info & Limit Progress Bar */}
                      <div className="mt-4 space-y-3">
                        {/* Limit usage progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              Limite Usado ({usagePct}%)
                            </span>
                            <span className="font-mono font-bold text-xs text-rose-400">
                              {formatCurrency(used)}
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                usagePct > 80 ? 'bg-rose-500' : usagePct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        </div>

                        {/* Numbers Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-dashed border-zinc-800/60">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Disponível</span>
                            <span className="font-mono font-bold text-emerald-500 text-xs">{formatCurrency(available)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Limite Total</span>
                            <span className={`font-mono font-bold text-xs ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                              {formatCurrency(card.limit)}
                            </span>
                          </div>
                        </div>

                        {/* Dates info & Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500 font-bold">Fechamento:</span>
                            <span className="font-semibold text-zinc-300">Dia {card.closingDay}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500 font-bold">Vence:</span>
                            <span className="font-semibold text-zinc-300">Dia {card.dueDay}</span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[8px] tracking-wider border ${
                            card.status === 'blocked' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {card.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                          </span>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-zinc-800/50">
                          {/* 1. Quick Image Upload / Change button */}
                          <label 
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                              isHighContrast 
                                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700' 
                                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                            }`}
                            title="Inserir / Alterar Imagem do Cartão"
                          >
                            <ImageIcon size={12} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{card.image ? 'Foto' : '+ Foto'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const base64 = reader.result as string;
                                    setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, image: base64 } : c));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {/* 2. Lançar Compra no Cartão */}
                          <button
                            type="button"
                            onClick={() => {
                              resetTxForm();
                              setTxType('saida');
                              setTxFormaPagamento('cartão');
                              setTxCreditCardId(card.id);
                              if (card.bankAccountId) {
                                setTxAccountId(card.bankAccountId);
                              }
                              setEditingTx(null);
                              setShowTxModal(true);
                            }}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              isHighContrast
                                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            }`}
                            title="Lançar Nova Despesa neste Cartão"
                          >
                            <Plus size={12} className="shrink-0" />
                            <span className="truncate">Despesa</span>
                          </button>

                          {/* 3. Editar Dados */}
                          <button
                            type="button"
                            onClick={() => handleEditCard(card)}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              isHighContrast 
                                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700' 
                                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                            }`}
                            title="Editar Dados do Cartão"
                          >
                            <Edit3 size={12} className="shrink-0" />
                            <span className="truncate">Editar</span>
                          </button>

                          {/* 4. Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title="Excluir Cartão"
                          >
                            <Trash2 size={12} className="shrink-0" />
                            <span className="truncate">Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Extrato de Lançamentos dos Cartões */}
            {(() => {
              const allCardTransactions = transactions.filter(t => t.formaPagamento === 'cartão' || t.creditCardId);
              
              const availableCardTxYears = Array.from(new Set([
                new Date().getFullYear().toString(),
                ...allCardTransactions.map(t => t.date.substring(0, 4))
              ])).sort().reverse();

              const filteredCardTransactions = allCardTransactions.filter(t => {
                if (cardTxSelectedYear !== 'all') {
                  if (t.date.substring(0, 4) !== cardTxSelectedYear) return false;
                }
                if (cardTxSelectedMonth !== 'all') {
                  if (t.date.substring(5, 7) !== cardTxSelectedMonth) return false;
                }
                if (cardTxSelectedCardId !== 'all') {
                  if (t.creditCardId !== cardTxSelectedCardId) return false;
                }
                if (cardTxStatusFilter !== 'all') {
                  if (cardTxStatusFilter === 'pago' && t.pago !== 'sim') return false;
                  if (cardTxStatusFilter === 'pendente' && t.pago === 'sim') return false;
                }
                if (cardTxSearchQuery.trim()) {
                  const q = cardTxSearchQuery.toLowerCase();
                  const cardMatch = creditCards.find(c => c.id === t.creditCardId);
                  const catMatch = categories.find(c => c.id === t.categoryId);
                  const descMatch = (t.description || '').toLowerCase().includes(q);
                  const obsMatch = (t.observation || '').toLowerCase().includes(q);
                  const valMatch = (t.value || 0).toString().includes(q);
                  const catNameMatch = (catMatch?.name || '').toLowerCase().includes(q);
                  const cardNameMatch = cardMatch ? (
                    cardMatch.name.toLowerCase().includes(q) || 
                    cardMatch.bankName.toLowerCase().includes(q) || 
                    cardMatch.lastFourDigits.includes(q) ||
                    (cardMatch.cardholderName || '').toLowerCase().includes(q)
                  ) : false;
                  if (!descMatch && !obsMatch && !valMatch && !catNameMatch && !cardNameMatch) return false;
                }
                return true;
              }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              const totalFilteredCardAmount = filteredCardTransactions.reduce((acc, t) => acc + (t.value || 0), 0);
              const totalFilteredCardPaid = filteredCardTransactions.filter(t => t.pago === 'sim').reduce((acc, t) => acc + (t.value || 0), 0);
              const totalFilteredCardPending = filteredCardTransactions.filter(t => t.pago !== 'sim').reduce((acc, t) => acc + (t.value || 0), 0);
              const isAnyCardTxFilterActive = cardTxSelectedYear !== 'all' || cardTxSelectedMonth !== 'all' || cardTxSelectedCardId !== 'all' || cardTxStatusFilter !== 'all' || cardTxSearchQuery.trim() !== '';

              return (
                <div className="px-5 pb-8 space-y-4">
                  {/* Extrato Header & Summary Cards */}
                  <div className={`p-5 rounded-2xl border ${
                    isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/40 border-zinc-800'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/40">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-100'
                          }`}>
                            Extrato de Compras nos Cartões
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Detalhamento de faturas com filtros por ano, mês, cartão e status
                          </p>
                        </div>
                      </div>

                      {/* Summary Badges */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className={`px-3 py-1.5 rounded-xl border text-right ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Total no Período</span>
                          <span className="font-mono font-bold text-xs text-rose-400">
                            {formatCurrency(totalFilteredCardAmount)}
                          </span>
                        </div>

                        <div className={`px-3 py-1.5 rounded-xl border text-right ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Pago</span>
                          <span className="font-mono font-bold text-xs text-emerald-400">
                            {formatCurrency(totalFilteredCardPaid)}
                          </span>
                        </div>

                        <div className={`px-3 py-1.5 rounded-xl border text-right ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Pendente / Aberto</span>
                          <span className="font-mono font-bold text-xs text-amber-400">
                            {formatCurrency(totalFilteredCardPending)}
                          </span>
                        </div>

                        <div className={`px-3 py-1.5 rounded-xl border text-right ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Lançamentos</span>
                          <span className={`font-mono font-bold text-xs ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                            {filteredCardTransactions.length} / {allCardTransactions.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Filter Bar with Year, Month, Card, Status, Search */}
                    <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
                        {/* Filtro por Ano */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                            <Calendar size={11} className="text-indigo-400" /> Ano:
                          </span>
                          <select
                            value={cardTxSelectedYear}
                            onChange={(e) => setCardTxSelectedYear(e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            <option value="all">Todos os Anos</option>
                            {availableCardTxYears.map(yr => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro por Mês */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Mês:</span>
                          <select
                            value={cardTxSelectedMonth}
                            onChange={(e) => setCardTxSelectedMonth(e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            <option value="all">Todos os Meses</option>
                            {monthsList.map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro por Cartão */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                            <CreditCard size={11} className="text-indigo-400" /> Cartão:
                          </span>
                          <select
                            value={cardTxSelectedCardId}
                            onChange={(e) => setCardTxSelectedCardId(e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[200px] truncate ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            <option value="all">Todos os Cartões</option>
                            {creditCards.map(c => (
                              <option key={c.id} value={c.id}>{c.name} (•••• {c.lastFourDigits})</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro por Status */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Status:</span>
                          <select
                            value={cardTxStatusFilter}
                            onChange={(e) => setCardTxStatusFilter(e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            <option value="all">Todos os Status</option>
                            <option value="pago">Pagas</option>
                            <option value="pendente">Pendentes / Aberto</option>
                          </select>
                        </div>

                        {/* Botão Limpar Filtros */}
                        {isAnyCardTxFilterActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setCardTxSelectedYear('all');
                              setCardTxSelectedMonth('all');
                              setCardTxSelectedCardId('all');
                              setCardTxStatusFilter('all');
                              setCardTxSearchQuery('');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                            title="Limpar todos os filtros aplicados ao extrato"
                          >
                            <X size={12} /> Limpar Filtros
                          </button>
                        )}
                      </div>

                      {/* Busca dentro do Extrato */}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border min-w-[220px] ${
                        isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950/80 border-zinc-800'
                      }`}>
                        <Search size={13} className="text-zinc-500" />
                        <input
                          type="text"
                          value={cardTxSearchQuery}
                          onChange={(e) => setCardTxSearchQuery(e.target.value)}
                          placeholder="Buscar no extrato..."
                          className="w-full bg-transparent text-xs focus:outline-none text-zinc-200 placeholder-zinc-500"
                        />
                        {cardTxSearchQuery && (
                          <button onClick={() => setCardTxSearchQuery('')} className="text-zinc-500 hover:text-white">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extrato Table View */}
                  <div className={`rounded-2xl border overflow-hidden ${
                    isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/30 border-zinc-800'
                  }`}>
                    {filteredCardTransactions.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-zinc-500 text-xs">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800/40 border border-zinc-700/40 flex items-center justify-center text-zinc-400">
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-300">Nenhum lançamento encontrado</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {isAnyCardTxFilterActive 
                              ? 'Nenhum lançamento corresponde aos filtros selecionados (Ano/Mês/Cartão/Status).' 
                              : 'Nenhuma despesa ou compra com cartão registrada até o momento.'}
                          </p>
                        </div>
                        {isAnyCardTxFilterActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setCardTxSelectedYear('all');
                              setCardTxSelectedMonth('all');
                              setCardTxSelectedCardId('all');
                              setCardTxStatusFilter('all');
                              setCardTxSearchQuery('');
                            }}
                            className="mt-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${
                              isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
                            }`}>
                              <th className="py-3.5 px-4">Data</th>
                              <th className="py-3.5 px-4">Descrição</th>
                              <th className="py-3.5 px-4">Cartão Utilizado</th>
                              <th className="py-3.5 px-4">Categoria</th>
                              <th className="py-3.5 px-4">Parcelamento</th>
                              <th className="py-3.5 px-4 text-right">Valor</th>
                              <th className="py-3.5 px-4 text-center">Status</th>
                              <th className="py-3.5 px-4 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/40">
                            {filteredCardTransactions.map(tx => {
                              const cardMatch = creditCards.find(c => c.id === tx.creditCardId);
                              const catMatch = categories.find(c => c.id === tx.categoryId);

                              return (
                                <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                                  <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                                    {tx.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-zinc-200">{tx.description}</div>
                                    {tx.observation && (
                                      <div className="text-[10px] text-zinc-500 line-clamp-1">{tx.observation}</div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {cardMatch ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-200 font-bold text-[10px]">
                                        <CreditCardBrandLogo brand={cardMatch.brand} size={16} />
                                        {cardMatch.name} (•••• {cardMatch.lastFourDigits})
                                      </span>
                                    ) : (
                                      <span className="text-zinc-500 text-[11px]">Cartão Geral</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catMatch?.color || 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'}`}>
                                      {catMatch?.name || '—'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {tx.parcelamento === 'sim' ? (
                                      <span className="font-bold text-indigo-400">
                                        {tx.parcelaAtual || 1}/{tx.numeroParcelas || 1}
                                      </span>
                                    ) : tx.parcelamento === 'recorrente' ? (
                                      <span className="text-purple-400 font-semibold">Recorrente</span>
                                    ) : (
                                      <span className="text-zinc-500">À Vista</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                                    - {formatCurrency(tx.value)}
                                  </td>
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextStatus = tx.pago === 'sim' ? 'nao' : 'sim';
                                        setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, pago: nextStatus } : t));
                                      }}
                                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border cursor-pointer transition-all hover:scale-105 ${
                                        tx.pago === 'sim' 
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      }`}
                                      title="Clique para alternar entre Pago e Pendente"
                                    >
                                      {tx.pago === 'sim' ? 'Pago' : 'Pendente'}
                                    </button>
                                  </td>
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-1 items-center">
                                      {tx.receiptImage && (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedReceiptImage(tx.receiptImage || null)}
                                          className="p-1.5 text-zinc-500 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                          title="Visualizar Comprovante Anexado"
                                        >
                                          <Eye size={13} />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTx(tx);
                                          setTxDescription(tx.description);
                                          setTxValue(tx.value.toString());
                                          setTxType(tx.type);
                                          setTxCategoryId(tx.categoryId);
                                          setTxSubcategory(tx.subcategory || '');
                                          setTxAccountId(tx.accountId);
                                          setTxDate(tx.date);
                                          setTxObservation(tx.observation || '');
                                          setTxRecebido(tx.recebido || 'sim');
                                          setTxRecebidoDe(tx.recebidoDe || '');
                                          setTxDataRecebido(tx.dataRecebido || tx.date);
                                          setTxDataLancamento(tx.dataLancamento || tx.date);
                                          setTxParcelamento(tx.parcelamento || 'nao');
                                          setTxFrequenciaParcelas(tx.frequenciaParcelas || 'mensal');
                                          setTxNumeroParcelas(tx.numeroParcelas ? tx.numeroParcelas.toString() : '1');
                                          setTxParcelaAtual(tx.parcelaAtual ? tx.parcelaAtual.toString() : '1');
                                          setTxFormaPagamento(tx.formaPagamento || 'cartão');
                                          setTxCreditCardId(tx.creditCardId || '');
                                          setTxPago(tx.pago || 'sim');
                                          setTxVaiPagarQuem(tx.vaiPagarQuem || '');
                                          setTxDataVencimento(tx.dataVencimento || tx.date);
                                          setTxReceiptImage(tx.receiptImage || null);
                                          setShowTxModal(true);
                                        }}
                                        className="p-1.5 text-zinc-500 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                        title="Editar Lançamento"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTx(tx.id)}
                                        className="p-1.5 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                        title="Excluir Lançamento"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 3. BANK ACCOUNTS LIST SCREEN */}
        {activeSubTab === 'accounts' && (
          <div>
            <div className={`p-4 border-b flex justify-between items-center ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-900'}`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>
                Saldos e Contas de Bancos
              </h3>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setAccName('');
                  setAccBankName('');
                  setAccAgency('');
                  setAccNumber('');
                  setAccInitialBalance('');
                  setAccImage('');
                  setAccType('conta_corrente');
                  setAccInitialBalanceDate(new Date().toISOString().split('T')[0]);
                  setShowAccountModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer uppercase tracking-wider"
              >
                <Plus size={12} /> Nova Conta Bancária
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {accounts.map(acc => {
                const diff = acc.currentBalance - acc.initialBalance;
                return (
                  <div key={acc.id} className={`p-5 rounded-xl border flex flex-col justify-between relative group ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/10 border-zinc-800 hover:border-zinc-700'
                  }`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3 items-center min-w-0 flex-1">
                        <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`text-xs font-bold truncate ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>{acc.name}</h4>
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                              {getAccountTypeLabel(acc.accountType)}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">
                            {acc.bankName} • Ag {acc.agency} | {acc.accountType === 'caixa_fisico' ? 'Nº' : 'CC'} {acc.accountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleEditAccount(acc)}
                          className="p-1.5 text-zinc-500 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="Editar Conta Bancária"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Excluir Conta Bancária"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-zinc-800/60 grid grid-cols-2 gap-y-3 text-xs">
                      <div>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Tipo de Conta</p>
                        <p className={`font-semibold mt-0.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>
                          {getAccountTypeLabel(acc.accountType)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Diferença</p>
                        <p className={`font-mono font-bold mt-0.5 ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                          Saldo Inicial {acc.initialBalanceDate ? `(${acc.initialBalanceDate.split('-').reverse().join('/')})` : ''}
                        </p>
                        <p className="font-mono text-zinc-400 mt-0.5">{formatCurrency(acc.initialBalance)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Saldo Atual</p>
                        <p className={`font-mono font-bold text-sm mt-0.5 ${acc.currentBalance >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
                          {formatCurrency(acc.currentBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TRANSACTION CATEGORIES SCREEN (WITH SUBCATEGORIES) */}
        {activeSubTab === 'categories' && (
          <div>
            {/* Notification Banner for Bulk Category Import Success */}
            <AnimatePresence>
              {categoryImportSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className={`mx-5 mt-4 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
                    isHighContrast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100'
                      : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100 backdrop-blur-md shadow-emerald-950/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-400">
                        Categorias importadas e atualizadas com sucesso!
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Total de <span className="text-emerald-400 font-bold">{categoryImportSuccessMsg.count} categorias</span> e <span className="text-purple-400 font-bold">{categoryImportSuccessMsg.subcategoriesCount} subcategorias</span> configuradas no plano de contas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryImportSuccessMsg(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`p-4 border-b flex justify-between items-center ${isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-900'}`}>
              <div className="flex items-center gap-2.5">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>
                  Categorias e Subcategorias Financeiras
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isHighContrast ? 'bg-zinc-100 border-zinc-250 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {filteredCategories.length} {filteredCategories.length !== categories.length ? `de ${categories.length}` : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Segmented View Mode Toggle */}
                <div className={`flex items-center rounded-lg p-0.5 border ${isHighContrast ? 'bg-zinc-100 border-zinc-250' : 'bg-zinc-900 border-zinc-800'}`}>
                  <button
                    onClick={() => setCategoryViewMode('grid')}
                    className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all ${
                      categoryViewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isHighContrast ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid size={11} />
                    <span className="sr-only sm:not-sr-only">Grade</span>
                  </button>
                  <button
                    onClick={() => setCategoryViewMode('list')}
                    className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-extrabold cursor-pointer transition-all ${
                      categoryViewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isHighContrast ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Visualização em Lista"
                  >
                    <List size={11} />
                    <span className="sr-only sm:not-sr-only">Lista</span>
                  </button>
                </div>

                {/* Botão de Importar Categorias em Massa */}
                <button
                  type="button"
                  onClick={() => setShowBulkCategoryImportModal(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer uppercase tracking-wider border transition-all ${
                    isHighContrast
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100'
                      : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/40 hover:border-indigo-400'
                  }`}
                  title="Importar categorias e subcategorias em lote via Excel ou CSV"
                >
                  <Upload size={12} className="text-indigo-400" />
                  <span>Importar em Massa</span>
                </button>

                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer uppercase tracking-wider animate-in fade-in zoom-in-95 duration-150"
                >
                  <Plus size={12} /> Nova Categoria Pai
                </button>
              </div>
            </div>

            {/* Filter & Search Toolbar for Categories */}
            <div className={`p-3.5 px-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
              isHighContrast ? 'bg-zinc-50/90 border-zinc-200' : 'bg-zinc-950/30 border-zinc-900'
            }`}>
              {/* Type Filters */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setCategoryTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    categoryTypeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isHighContrast ? 'text-zinc-600 hover:bg-zinc-200' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  Todas ({categories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTypeFilter('entrada')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    categoryTypeFilter === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isHighContrast ? 'text-zinc-600 hover:bg-zinc-200' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  Receitas ({categories.filter(c => c.type === 'entrada').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTypeFilter('saida')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    categoryTypeFilter === 'saida'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : isHighContrast ? 'text-zinc-600 hover:bg-zinc-200' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  Despesas ({categories.filter(c => c.type === 'saida').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTypeFilter('ambas')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    categoryTypeFilter === 'ambas'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isHighContrast ? 'text-zinc-600 hover:bg-zinc-200' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  Ambas
                </button>
              </div>

              {/* Group / Main Category Selector & Search Input */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                {availableCategoryGroups.length > 0 && (
                  <div className="relative min-w-[140px] flex-1 sm:flex-initial">
                    <select
                      value={categoryGroupFilter}
                      onChange={(e) => setCategoryGroupFilter(e.target.value)}
                      className={`w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                        isHighContrast
                          ? 'bg-white border-zinc-300 text-zinc-800'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <option value="all">Todos os Grupos</option>
                      {availableCategoryGroups.map(grp => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Search Bar for Categories */}
                <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 sm:flex-initial">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar categoria, código, sub..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-xs transition-colors border outline-none ${
                      isHighContrast 
                        ? 'bg-white border-zinc-300 text-zinc-900 focus:border-indigo-600 placeholder:text-zinc-400' 
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 focus:border-indigo-500 placeholder:text-zinc-500'
                    }`}
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions Banner for Selected Categories */}
            {selectedCategoryIds.length > 0 && (
              <div className={`p-3.5 px-5 border-b flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isHighContrast 
                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950' 
                  : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <CheckSquare size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold">
                      {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}
                    </span>
                    <span className="text-[11px] opacity-75 ml-2">
                      (de um total de {categories.length})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllCategories}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isHighContrast
                        ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                        : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {isAllCategoriesSelected ? 'Desmarcar todas' : 'Selecionar todas'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDeleteCategories}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Excluir Selecionadas ({selectedCategoryIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {categoryViewMode === 'grid' ? (
              filteredCategories.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
                    <Search size={22} />
                  </div>
                  <h4 className={`text-sm font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    Nenhuma categoria encontrada
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Nenhum resultado corresponde aos filtros e termos de busca aplicados.
                  </p>
                  {(categorySearchQuery || categoryTypeFilter !== 'all' || categoryGroupFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategorySearchQuery('');
                        setCategoryTypeFilter('all');
                        setCategoryGroupFilter('all');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Limpar Filtros de Categoria
                    </button>
                  )}
                </div>
              ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat, cIdx) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all duration-200 ${
                        isSelected
                          ? (isHighContrast ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/40 shadow-sm' : 'bg-indigo-950/25 border-indigo-500/60 ring-2 ring-indigo-500/30')
                          : (isHighContrast ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-zinc-900/20 border-[#27272a] hover:border-zinc-700')
                      }`}
                    >
                      <div>
                        {/* Header with Selection Checkbox, Código & Categoria Name */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectCategory(cat.id)}
                              className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer shrink-0"
                              title={isSelected ? "Desmarcar esta categoria" : "Selecionar categoria para exclusão"}
                            />
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                              isHighContrast ? 'bg-zinc-200 text-zinc-800 border-zinc-300' : 'bg-zinc-800 text-indigo-400 border-zinc-700'
                            }`}>
                              {cat.code || `${cIdx + 1}`.padStart(2, '0')}
                            </span>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                              {cat.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenCategoryModal(cat)}
                              className="p-1 text-zinc-500 hover:text-indigo-400 rounded hover:bg-indigo-500/5 cursor-pointer"
                              title="Editar Categoria"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-zinc-500 hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer"
                              title="Excluir Categoria"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Formatted attributes: Tipo / Grupo / Categoria Pai / Descrição */}
                        <div className="mt-3.5 space-y-2 text-xs border-t border-dashed border-zinc-800/60 pt-3">
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Tipo</span>
                              <span className={`inline-flex items-center gap-1 font-bold ${
                                cat.type === 'entrada' ? 'text-emerald-400' : cat.type === 'saida' ? 'text-rose-400' : 'text-indigo-400'
                              }`}>
                                {cat.type === 'ambas' ? 'Ambos fluxos' : cat.type === 'entrada' ? 'Receita' : 'Despesa'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Grupo</span>
                              <span className={`font-semibold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                {cat.group || cat.mainCategory || '—'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Categoria Pai</span>
                            <span className={`font-semibold text-[11px] ${cat.parentCategory ? (isHighContrast ? 'text-zinc-700' : 'text-zinc-300') : 'text-zinc-500 italic'}`}>
                              {cat.parentCategory || '— (Raiz)'}
                            </span>
                          </div>

                          {cat.description && (
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Descrição</span>
                              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Subcategories list */}
                        <div className="mt-4 space-y-2 border-t border-dashed border-zinc-800/60 pt-3">
                          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                            Subcategorias ({(cat.subcategories || []).length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(cat.subcategories || []).length === 0 ? (
                              <span className="text-[10px] text-zinc-500 italic">Nenhuma subcategoria cadastrada</span>
                            ) : (
                              (cat.subcategories || []).map(sub => (
                                <span 
                                  key={sub} 
                                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold border px-2 py-0.5 rounded-md transition-colors ${
                                    isHighContrast ? 'bg-zinc-100 border-zinc-250 text-zinc-800' : 'bg-zinc-800/60 border-zinc-700/80 text-zinc-300'
                                  }`}
                                >
                                  <span>{sub}</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteSubcategory(cat.id, sub)}
                                    className="p-0.5 text-zinc-400 hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title={`Excluir subcategoria "${sub}"`}
                                  >
                                    <X size={11} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add Inline Subcategory form */}
                      <div className="border-t border-dashed border-zinc-800/60 pt-3 flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Nova subcategoria..."
                          value={newSubcategoryName[cat.id] || ''}
                          onChange={(e) => setNewSubcategoryName({
                            ...newSubcategoryName,
                            [cat.id]: e.target.value
                          })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcategory(cat.id);
                            }
                          }}
                          className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        />
                        <button
                          onClick={() => handleAddSubcategory(cat.id)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              )
            ) : (
              // --- LIST VIEW FORMATTED AS: Código / Categoria / Tipo / Grupo / Categoria Pai / Descrição ---
              <div className="p-5">
                <div className={`border rounded-xl overflow-x-auto scrollbar-thin ${isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${isHighContrast ? 'bg-zinc-50 text-zinc-500 border-zinc-200' : 'bg-zinc-900/40 text-zinc-400 border-zinc-800'}`}>
                        {/* Checkbox Header for Mass Selection */}
                        <th className="p-4 w-10 text-center select-none">
                          <input
                            type="checkbox"
                            checked={isAllCategoriesSelected}
                            ref={el => {
                              if (el) el.indeterminate = isSomeCategoriesSelected;
                            }}
                            onChange={toggleSelectAllCategories}
                            className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                            title={isAllCategoriesSelected ? "Desmarcar todas as categorias" : "Selecionar todas as categorias"}
                          />
                        </th>
                        <th className="p-4 w-24">Código</th>
                        <th className="p-4 min-w-[180px]">Categoria</th>
                        <th className="p-4 w-28">Tipo</th>
                        <th className="p-4 min-w-[140px]">Grupo</th>
                        <th className="p-4 min-w-[150px]">Categoria Pai</th>
                        <th className="p-4 min-w-[200px]">Descrição</th>
                        <th className="p-4 min-w-[180px]">Subcategorias</th>
                        <th className="p-4 text-right w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {filteredCategories.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-zinc-500 text-xs">
                            Nenhuma categoria encontrada com os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((cat, cIdx) => {
                        const isSelected = selectedCategoryIds.includes(cat.id);
                        return (
                          <tr 
                            key={cat.id} 
                            className={`hover:bg-zinc-500/5 transition-colors text-xs ${
                              isSelected
                                ? (isHighContrast ? 'bg-indigo-50/70 text-zinc-900' : 'bg-indigo-950/25 text-zinc-100')
                                : (isHighContrast ? 'text-zinc-800' : 'text-zinc-200')
                            }`}
                          >
                            {/* Checkbox column */}
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectCategory(cat.id)}
                                className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                                title={`Selecionar categoria ${cat.name}`}
                              />
                            </td>

                            {/* 1. Código */}
                            <td className="p-4 font-mono font-bold text-[11px] text-indigo-400 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded border ${
                                isHighContrast ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-indigo-400'
                              }`}>
                                {cat.code || `${cIdx + 1}`.padStart(2, '0')}
                              </span>
                            </td>

                            {/* 2. Categoria */}
                            <td className="p-4 font-semibold">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                                {cat.name}
                              </span>
                            </td>

                            {/* 3. Tipo */}
                            <td className="p-4 capitalize font-semibold text-[11px] whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                cat.type === 'entrada'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : cat.type === 'saida'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {cat.type === 'ambas' ? 'Ambos fluxos' : cat.type === 'entrada' ? 'Receita' : 'Despesa'}
                              </span>
                            </td>

                            {/* 4. Grupo */}
                            <td className="p-4">
                              <span className={`text-[11px] font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                {cat.group || cat.mainCategory || '—'}
                              </span>
                            </td>

                            {/* 5. Categoria Pai */}
                            <td className="p-4 text-[11px]">
                              {cat.parentCategory ? (
                                <span className={`font-semibold ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                  {cat.parentCategory}
                                </span>
                              ) : (
                                <span className="text-zinc-500 italic text-[10px]">— (Raiz)</span>
                              )}
                            </td>

                            {/* 6. Descrição */}
                            <td className="p-4 text-[11px] text-zinc-400 max-w-xs">
                              {cat.description ? (
                                <p className="line-clamp-2 leading-tight">{cat.description}</p>
                              ) : (
                                <span className="text-zinc-600 italic text-[10px]">—</span>
                              )}
                            </td>

                            {/* Subcategorias List & Inline Adder */}
                            <td className="p-4">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap gap-1 max-w-sm">
                                  {(cat.subcategories || []).length === 0 ? (
                                    <span className="text-[10px] text-zinc-500 italic">Sem subcategorias</span>
                                  ) : (
                                    (cat.subcategories || []).map(sub => (
                                      <span 
                                        key={sub} 
                                        className={`inline-flex items-center gap-1.5 text-[9px] font-semibold border px-1.5 py-0.5 rounded transition-colors ${
                                          isHighContrast ? 'bg-zinc-100 border-zinc-250 text-zinc-800' : 'bg-zinc-850 border-zinc-700/80 text-zinc-300'
                                        }`}
                                      >
                                        <span>{sub}</span>
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteSubcategory(cat.id, sub)}
                                          className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                                          title={`Excluir "${sub}"`}
                                        >
                                          <X size={10} />
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>

                                <div className="flex gap-1 items-center max-w-[150px]">
                                  <input
                                    type="text"
                                    placeholder="+ sub..."
                                    value={newSubcategoryName[cat.id] || ''}
                                    onChange={(e) => setNewSubcategoryName({
                                      ...newSubcategoryName,
                                      [cat.id]: e.target.value
                                    })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubcategory(cat.id);
                                      }
                                    }}
                                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 w-20 ${
                                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                                    }`}
                                  />
                                  <button
                                    onClick={() => handleAddSubcategory(cat.id)}
                                    className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenCategoryModal(cat)}
                                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                                    isHighContrast ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-400'
                                  }`}
                                  title="Editar Categoria"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                                    isHighContrast ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-rose-500/10 text-rose-400'
                                  }`}
                                  title="Excluir Categoria"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. REPORTS SCREEN (DEMONSTRATIVO & BALANCETE) */}
        {activeSubTab === 'reports' && (
          <div className="p-6 space-y-6">
            {/* Report sub-tabs */}
            <div className={`flex flex-wrap justify-between items-center gap-3 border-b pb-3 no-print ${
              isHighContrast ? 'border-zinc-200' : 'border-zinc-800'
            }`}>
              <div className={`flex flex-wrap gap-1 p-1 rounded-xl ${
                isHighContrast ? 'bg-zinc-100 border border-zinc-200/80' : 'bg-zinc-900'
              }`}>
                <button
                  onClick={() => setReportType('demonstrativo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    reportType === 'demonstrativo' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : (isHighContrast ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60' : 'text-zinc-400 hover:text-zinc-200')
                  }`}
                >
                  Demonstrativo (DRE / Fluxo de Caixa)
                </button>
                <button
                  onClick={() => setReportType('balanco_patrimonial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    reportType === 'balanco_patrimonial' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : (isHighContrast ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60' : 'text-zinc-400 hover:text-zinc-200')
                  }`}
                >
                  <Scale size={13} />
                  Balanço Patrimonial
                </button>
              </div>

              <div className="flex items-center gap-2">
                {reportType === 'demonstrativo' && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportDREExcel}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                      title="Exportar Demonstrativo DRE e Fluxo de Caixa Mês a Mês para Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={13} /> Exportar Excel
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm active:scale-95"
                      title="Imprimir Demonstrativo Operacional"
                    >
                      <Printer size={13} /> Imprimir Demonstrativo Operacional
                    </button>
                  </>
                )}

                {reportType === 'balanco_patrimonial' && (
                  <>
                    <button
                      onClick={() => handleOpenAddAssetModal()}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isHighContrast
                          ? 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 shadow-sm'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                      title="Cadastrar novo bem patrimonial imobilizado"
                    >
                      <Plus size={13} /> Novo Bem / Ativo
                    </button>
                    <button
                      onClick={handleExportBalancoExcel}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                      title="Exportar Balanço Patrimonial e Comparativo para Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={13} /> Exportar Excel
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintBalanco}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm active:scale-95"
                      title="Imprimir Relatório Oficial"
                    >
                      <Printer size={13} /> Imprimir Relatório
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* PRINTABLE AREA CONTAINING REPORT */}
            <div id="printable-report-area" className="p-2 space-y-6 bg-transparent rounded-2xl no-print">
              
              {/* Header Title for Printout */}
              <div className={`border-b-2 pb-4 text-center space-y-1 ${
                isHighContrast ? 'border-zinc-200' : 'border-zinc-800/80'
              }`}>
                {reportType === 'balanco_patrimonial' ? (
                  <div className="space-y-1">
                    <h3 className={`text-sm font-bold uppercase tracking-widest ${
                      isHighContrast ? 'text-indigo-700' : 'text-indigo-500'
                    }`}>
                      MINISTÉRIO NOVA VIDA
                    </h3>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                      isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                    </p>
                    <p className={`text-[10px] font-mono font-medium ${
                      isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      CNPJ: 62.471.271-0001-82
                    </p>
                    <div className="pt-2">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        isHighContrast ? 'text-zinc-900' : 'text-zinc-200'
                      }`}>
                        BALANÇO PATRIMONIAL DO EXERCÍCIO ENCERRADO EM 31 DE DEZEMBRO DE {balancoBaseYear}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-500">
                      MINISTÉRIO NOVA VIDA
                    </h3>
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 font-medium">
                      CNPJ: 62.471.271-0001-82
                    </p>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 pt-1">
                      DEMONSTRATIVO DE RESULTADO (DRE) E FLUXO DE CAIXA MÊS A MÊS - EXERCÍCIO DE {dreSelectedYear}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">
                      VISUALIZAÇÃO ANUAL CONSOLIDADA DE 01 DE JANEIRO A 31 DE DEZEMBRO DE {dreSelectedYear}
                    </p>
                  </div>
                )}
              </div>

              {/* REPORT TYPE A: DEMONSTRATIVO COMPLETO (DRE / FLUXO DE CAIXA MÊS A MÊS) */}
              {reportType === 'demonstrativo' && (() => {
                const {
                  DRE_MONTHS_LIST: DRE_MONTHS,
                  yearInitialCash,
                  monthlyInflow,
                  monthlyOutflow,
                  monthlyResult,
                  monthlyStartCash,
                  monthlyEndCash,
                  totalInflowYear,
                  totalOutflowYear,
                  totalResultYear,
                  endCashYear,
                  incomeCategories,
                  expenseCategories
                } = dreCalculations;

                const toggleCategory = (catId: string) => {
                  setDreExpandedCategories(prev => ({
                    ...prev,
                    [catId]: prev[catId] !== undefined ? !prev[catId] : !dreExpandAll
                  }));
                };

                const isCatExpanded = (catId: string) => {
                  if (dreExpandedCategories[catId] !== undefined) {
                    return dreExpandedCategories[catId];
                  }
                  return dreExpandAll;
                };

                return (
                  <div className="space-y-6 text-xs text-left">
                    {/* BARRA DE CONTROLE: SELETOR DE ANO E EXPANSÃO (NO-PRINT) */}
                    <div className={`no-print p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
                      isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900/60 border-zinc-800/80'
                    }`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-400" />
                          <span className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>Ano do Exercício:</span>
                        </div>
                        <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-950 border-zinc-800'
                        }`}>
                          {balancoAvailableYears.map(yr => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setDreSelectedYear(yr)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                dreSelectedYear === yr
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : (isHighContrast ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200')
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !dreExpandAll;
                            setDreExpandAll(next);
                            const newMap: Record<string, boolean> = {};
                            [...incomeCategories, ...expenseCategories].forEach(c => {
                              newMap[c.id] = next;
                            });
                            setDreExpandedCategories(newMap);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            isHighContrast 
                              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {dreExpandAll ? (
                            <>
                              <ChevronUp size={13} /> Recolher Subcategorias
                            </>
                          ) : (
                            <>
                              <ChevronDown size={13} /> Expandir Todas Subcategorias
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* TOP EXECUTIVE METRIC CARDS (ANUAL SUMMARY) */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {/* 1. Saldo Inicial */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        isHighContrast ? 'bg-amber-50/50 border-amber-200' : 'bg-zinc-900/70 border-zinc-800'
                      }`}>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}`}>Saldo Inicial (01/Jan)</span>
                          <Wallet size={13} className="text-amber-500" />
                        </div>
                        <p className={`text-base font-bold tracking-tight font-mono ${isHighContrast ? 'text-zinc-900' : 'text-zinc-100'}`}>
                          {formatCurrency(yearInitialCash)}
                        </p>
                        <p className="text-[9px] text-zinc-500">Disponibilidade no início do ano</p>
                      </div>

                      {/* 2. Total Receitas */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        isHighContrast ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/10 border-emerald-500/20'
                      }`}>
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Receitas Totais (+)</span>
                          <ArrowUpRight size={13} />
                        </div>
                        <p className="text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(totalInflowYear)}
                        </p>
                        <p className="text-[9px] text-emerald-700 dark:text-emerald-500/80">Entradas acumuladas ({dreSelectedYear})</p>
                      </div>

                      {/* 3. Total Despesas */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        isHighContrast ? 'bg-red-50 border-red-200' : 'bg-red-950/10 border-red-500/20'
                      }`}>
                        <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Despesas Totais (-)</span>
                          <ArrowDownRight size={13} />
                        </div>
                        <p className="text-base font-bold tracking-tight text-red-600 dark:text-red-400 font-mono">
                          {formatCurrency(totalOutflowYear)}
                        </p>
                        <p className="text-[9px] text-red-700 dark:text-red-500/80">Saídas operacionais ({dreSelectedYear})</p>
                      </div>

                      {/* 4. Resultado Operacional */}
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        totalResultYear >= 0 
                          ? (isHighContrast ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/30') 
                          : (isHighContrast ? 'bg-red-50 border-red-300' : 'bg-red-950/20 border-red-500/30')
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-300'}`}>Resultado Final</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            totalResultYear >= 0 
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}>
                            {totalResultYear >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'}
                          </span>
                        </div>
                        <p className={`text-base font-bold tracking-tight font-mono ${
                          totalResultYear >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(totalResultYear)}
                        </p>
                        <p className="text-[9px] text-zinc-500">Receitas (-) Despesas</p>
                      </div>

                      {/* 5. Saldo Final */}
                      <div className={`p-3.5 rounded-xl border space-y-1 col-span-2 md:col-span-1 ${
                        isHighContrast ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-500/30'
                      }`}>
                        <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Saldo Final (31/Dez)</span>
                          <Building2 size={13} />
                        </div>
                        <p className={`text-base font-bold tracking-tight font-mono ${
                          isHighContrast ? 'text-indigo-950' : 'text-indigo-300'
                        }`}>
                          {formatCurrency(endCashYear)}
                        </p>
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400/80">Disponibilidade final em caixa</p>
                      </div>
                    </div>

                    {/* TABELA CONSOLIDADA MÊS A MÊS DO ANO SELECIONADO */}
                    <div className={`rounded-2xl border overflow-hidden shadow-xl ${
                      isHighContrast ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-950/60'
                    }`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                              isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                            }`}>
                              <th className={`py-3 px-4 min-w-[260px] sticky left-0 z-10 border-r ${
                                isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800/80'
                              }`}>
                                Estrutura / Conta / Categoria
                              </th>
                              {DRE_MONTHS.map(m => (
                                <th key={m.key} className="py-3 px-3 min-w-[95px] text-right font-mono">
                                  {m.label}
                                </th>
                              ))}
                              <th className={`py-3 px-4 min-w-[125px] text-right font-bold border-l font-mono ${
                                isHighContrast ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-900 text-zinc-200 border-zinc-800'
                              }`}>
                                Total {dreSelectedYear}
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-zinc-800/60 font-mono">
                            {/* LINHA: SALDO INICIAL DE CAIXA */}
                            <tr className={`${isHighContrast ? 'bg-amber-50/70 hover:bg-amber-50' : 'bg-amber-950/10 hover:bg-amber-950/20'} transition-colors`}>
                              <td className={`py-3 px-4 font-bold sticky left-0 z-10 border-r font-sans flex items-center gap-2 ${
                                isHighContrast ? 'bg-amber-50 text-amber-900 border-zinc-200' : 'bg-zinc-900/95 text-amber-300 border-zinc-800/80'
                              }`}>
                                <Wallet size={13} className="text-amber-500 shrink-0" />
                                <span>SALDO INICIAL DE CAIXA</span>
                              </td>
                              {monthlyStartCash.map((val, idx) => (
                                <td key={idx} className={`py-3 px-3 text-right ${isHighContrast ? 'text-amber-900' : 'text-amber-200/90'}`}>
                                  {formatCurrency(val)}
                                </td>
                              ))}
                              <td className={`py-3 px-4 text-right font-bold border-l ${
                                isHighContrast ? 'text-amber-900 bg-amber-100/50 border-zinc-200' : 'text-amber-300 bg-amber-950/20 border-zinc-800'
                              }`}>
                                {formatCurrency(yearInitialCash)}
                              </td>
                            </tr>

                            {/* SEÇÃO: 1. RECEITAS OPERACIONAIS (+) */}
                            <tr className={`${isHighContrast ? 'bg-emerald-50 text-emerald-900 border-t-2 border-emerald-300' : 'bg-emerald-950/20 text-emerald-400 border-t-2 border-emerald-500/30'} font-sans font-bold`}>
                              <td colSpan={14} className={`py-2.5 px-4 text-[11px] uppercase tracking-wider sticky left-0 z-10 ${
                                isHighContrast ? 'bg-emerald-100/70 text-emerald-900' : 'bg-emerald-950/30 text-emerald-400'
                              }`}>
                                1. RECEITAS OPERACIONAIS (+)
                              </td>
                            </tr>

                            {incomeCategories.length === 0 ? (
                              <tr>
                                <td colSpan={14} className="py-4 px-4 text-center text-zinc-500 italic font-sans">
                                  Nenhuma receita registrada no exercício de {dreSelectedYear}.
                                </td>
                              </tr>
                            ) : (
                              incomeCategories.map(cat => {
                                const expanded = isCatExpanded(cat.id);
                                const hasSubs = cat.subcategoriesList.length > 0;

                                return (
                                  <React.Fragment key={cat.id}>
                                    {/* Linha Categoria */}
                                    <tr className={`transition-colors group ${
                                      isHighContrast ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'
                                    }`}>
                                      <td className={`py-2.5 px-4 font-sans font-semibold sticky left-0 z-10 border-r ${
                                        isHighContrast ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-zinc-950/95 text-zinc-200 border-zinc-800/80'
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          {hasSubs ? (
                                            <button
                                              type="button"
                                              onClick={() => toggleCategory(cat.id)}
                                              className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                            </button>
                                          ) : (
                                            <div className="w-3.5" />
                                          )}
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#10b981' }} />
                                          <span className="truncate">{cat.name}</span>
                                          {hasSubs && (
                                            <span className="text-[9px] text-zinc-500 font-mono">
                                              ({cat.subcategoriesList.length})
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      {cat.months.map((val, idx) => (
                                        <td key={idx} className={`py-2.5 px-3 text-right ${val > 0 ? (isHighContrast ? 'text-zinc-900' : 'text-zinc-200') : (isHighContrast ? 'text-zinc-300' : 'text-zinc-600')}`}>
                                          {val > 0 ? formatCurrency(val) : '—'}
                                        </td>
                                      ))}
                                      <td className={`py-2.5 px-4 text-right font-bold border-l ${
                                        isHighContrast ? 'text-emerald-700 bg-zinc-50 border-zinc-200' : 'text-emerald-400 bg-zinc-900/40 border-zinc-800'
                                      }`}>
                                        {formatCurrency(cat.total)}
                                      </td>
                                    </tr>

                                    {/* Linhas Subcategorias */}
                                    {expanded && cat.subcategoriesList.map(sub => (
                                      <tr key={sub.name} className={`transition-colors text-[11px] ${
                                        isHighContrast ? 'bg-zinc-50/60 hover:bg-zinc-100/50' : 'bg-zinc-900/20 hover:bg-zinc-900/40'
                                      }`}>
                                        <td className={`py-1.5 pl-11 pr-4 font-sans sticky left-0 z-10 border-r ${
                                          isHighContrast ? 'bg-zinc-50/90 text-zinc-600 border-zinc-200' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800/80'
                                        }`}>
                                          <span className="text-zinc-500 mr-1.5">•</span>
                                          <span>{sub.name}</span>
                                        </td>
                                        {sub.months.map((val, idx) => (
                                          <td key={idx} className={`py-1.5 px-3 text-right ${val > 0 ? (isHighContrast ? 'text-zinc-800' : 'text-zinc-300') : (isHighContrast ? 'text-zinc-300' : 'text-zinc-700')}`}>
                                            {val > 0 ? formatCurrency(val) : '—'}
                                          </td>
                                        ))}
                                        <td className={`py-1.5 px-4 text-right font-semibold border-l ${
                                          isHighContrast ? 'text-zinc-700 bg-zinc-100/60 border-zinc-200' : 'text-zinc-300 bg-zinc-900/30 border-zinc-800'
                                        }`}>
                                          {formatCurrency(sub.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })
                            )}

                            {/* TOTAL DAS RECEITAS */}
                            <tr className={`border-t border-b font-bold ${
                              isHighContrast 
                                ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900' 
                                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                            }`}>
                              <td className={`py-3 px-4 font-sans sticky left-0 z-10 border-r ${
                                isHighContrast ? 'bg-emerald-100 text-emerald-900 border-zinc-200' : 'bg-emerald-950/80 text-emerald-400 border-zinc-800/80'
                              }`}>
                                TOTAL DAS RECEITAS
                              </td>
                              {monthlyInflow.map((val, idx) => (
                                <td key={idx} className={`py-3 px-3 text-right ${isHighContrast ? 'text-emerald-950' : 'text-emerald-300'}`}>
                                  {formatCurrency(val)}
                                </td>
                              ))}
                              <td className={`py-3 px-4 text-right text-sm border-l ${
                                isHighContrast 
                                  ? 'text-emerald-950 bg-emerald-200/50 border-zinc-200' 
                                  : 'text-emerald-300 bg-emerald-950/50 border-zinc-800'
                              }`}>
                                {formatCurrency(totalInflowYear)}
                              </td>
                            </tr>

                            {/* SEÇÃO: 2. DESPESAS OPERACIONAIS (-) */}
                            <tr className={`${isHighContrast ? 'bg-red-50 text-red-900 border-t-2 border-red-300' : 'bg-red-950/20 text-red-400 border-t-2 border-red-500/30'} font-sans font-bold`}>
                              <td colSpan={14} className={`py-2.5 px-4 text-[11px] uppercase tracking-wider sticky left-0 z-10 ${
                                isHighContrast ? 'bg-red-100/70 text-red-900' : 'bg-red-950/30 text-red-400'
                              }`}>
                                2. DESPESAS OPERACIONAIS (-)
                              </td>
                            </tr>

                            {expenseCategories.length === 0 ? (
                              <tr>
                                <td colSpan={14} className="py-4 px-4 text-center text-zinc-500 italic font-sans">
                                  Nenhuma despesa registrada no exercício de {dreSelectedYear}.
                                </td>
                              </tr>
                            ) : (
                              expenseCategories.map(cat => {
                                const expanded = isCatExpanded(cat.id);
                                const hasSubs = cat.subcategoriesList.length > 0;

                                return (
                                  <React.Fragment key={cat.id}>
                                    {/* Linha Categoria */}
                                    <tr className={`transition-colors group ${
                                      isHighContrast ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'
                                    }`}>
                                      <td className={`py-2.5 px-4 font-sans font-semibold sticky left-0 z-10 border-r ${
                                        isHighContrast ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-zinc-950/95 text-zinc-200 border-zinc-800/80'
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          {hasSubs ? (
                                            <button
                                              type="button"
                                              onClick={() => toggleCategory(cat.id)}
                                              className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                            </button>
                                          ) : (
                                            <div className="w-3.5" />
                                          )}
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#ef4444' }} />
                                          <span className="truncate">{cat.name}</span>
                                          {hasSubs && (
                                            <span className="text-[9px] text-zinc-500 font-mono">
                                              ({cat.subcategoriesList.length})
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      {cat.months.map((val, idx) => (
                                        <td key={idx} className={`py-2.5 px-3 text-right ${val > 0 ? (isHighContrast ? 'text-zinc-900' : 'text-zinc-200') : (isHighContrast ? 'text-zinc-300' : 'text-zinc-600')}`}>
                                          {val > 0 ? formatCurrency(val) : '—'}
                                        </td>
                                      ))}
                                      <td className={`py-2.5 px-4 text-right font-bold border-l ${
                                        isHighContrast ? 'text-red-700 bg-zinc-50 border-zinc-200' : 'text-red-400 bg-zinc-900/40 border-zinc-800'
                                      }`}>
                                        {formatCurrency(cat.total)}
                                      </td>
                                    </tr>

                                    {/* Linhas Subcategorias */}
                                    {expanded && cat.subcategoriesList.map(sub => (
                                      <tr key={sub.name} className={`transition-colors text-[11px] ${
                                        isHighContrast ? 'bg-zinc-50/60 hover:bg-zinc-100/50' : 'bg-zinc-900/20 hover:bg-zinc-900/40'
                                      }`}>
                                        <td className={`py-1.5 pl-11 pr-4 font-sans sticky left-0 z-10 border-r ${
                                          isHighContrast ? 'bg-zinc-50/90 text-zinc-600 border-zinc-200' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800/80'
                                        }`}>
                                          <span className="text-zinc-500 mr-1.5">•</span>
                                          <span>{sub.name}</span>
                                        </td>
                                        {sub.months.map((val, idx) => (
                                          <td key={idx} className={`py-1.5 px-3 text-right ${val > 0 ? (isHighContrast ? 'text-zinc-800' : 'text-zinc-300') : (isHighContrast ? 'text-zinc-300' : 'text-zinc-700')}`}>
                                            {val > 0 ? formatCurrency(val) : '—'}
                                          </td>
                                        ))}
                                        <td className={`py-1.5 px-4 text-right font-semibold border-l ${
                                          isHighContrast ? 'text-zinc-700 bg-zinc-100/60 border-zinc-200' : 'text-zinc-300 bg-zinc-900/30 border-zinc-800'
                                        }`}>
                                          {formatCurrency(sub.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })
                            )}

                            {/* TOTAL DAS DESPESAS */}
                            <tr className={`border-t border-b font-bold ${
                              isHighContrast 
                                ? 'bg-red-100/60 border-red-300 text-red-900' 
                                : 'bg-red-950/30 border-red-500/40 text-red-400'
                            }`}>
                              <td className={`py-3 px-4 font-sans sticky left-0 z-10 border-r ${
                                isHighContrast ? 'bg-red-100 text-red-900 border-zinc-200' : 'bg-red-950/80 text-red-400 border-zinc-800/80'
                              }`}>
                                TOTAL DAS DESPESAS
                              </td>
                              {monthlyOutflow.map((val, idx) => (
                                <td key={idx} className={`py-3 px-3 text-right ${isHighContrast ? 'text-red-950' : 'text-red-300'}`}>
                                  {formatCurrency(val)}
                                </td>
                              ))}
                              <td className={`py-3 px-4 text-right text-sm border-l ${
                                isHighContrast 
                                  ? 'text-red-950 bg-red-200/50 border-zinc-200' 
                                  : 'text-red-300 bg-red-950/50 border-zinc-800'
                              }`}>
                                {formatCurrency(totalOutflowYear)}
                              </td>
                            </tr>

                            {/* 3. RESULTADO DO EXERCÍCIO / RESULTADO FINAL */}
                            <tr className={`border-t-2 border-b-2 font-bold text-sm ${
                              isHighContrast 
                                ? 'bg-zinc-100 border-indigo-400' 
                                : 'bg-zinc-900/95 border-indigo-500/50'
                            }`}>
                              <td className={`py-3.5 px-4 font-sans sticky left-0 z-10 border-r flex items-center justify-between ${
                                isHighContrast ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-900 text-zinc-100 border-zinc-800/80'
                              }`}>
                                <span>RESULTADO FINAL (SUPERÁVIT / DÉFICIT)</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                  totalResultYear >= 0 
                                    ? (isHighContrast ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-500/20 text-emerald-400') 
                                    : (isHighContrast ? 'bg-red-200 text-red-900' : 'bg-red-500/20 text-red-400')
                                }`}>
                                  {totalResultYear >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'}
                                </span>
                              </td>
                              {monthlyResult.map((val, idx) => (
                                <td key={idx} className={`py-3.5 px-3 text-right ${val >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {formatCurrency(val)}
                                </td>
                              ))}
                              <td className={`py-3.5 px-4 text-right font-black text-sm border-l ${
                                isHighContrast ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900 border-zinc-800'
                              } ${totalResultYear >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {formatCurrency(totalResultYear)}
                              </td>
                            </tr>

                            {/* 4. SALDO FINAL DE CAIXA E EQUIVALENTES */}
                            <tr className={`transition-colors font-bold ${
                              isHighContrast ? 'bg-indigo-50/70 hover:bg-indigo-50' : 'bg-indigo-950/20 hover:bg-indigo-950/30'
                            }`}>
                              <td className={`py-3 px-4 font-sans sticky left-0 z-10 border-r flex items-center gap-2 ${
                                isHighContrast 
                                  ? 'bg-indigo-100/80 text-indigo-950 border-zinc-200' 
                                  : 'bg-indigo-950/80 text-indigo-300 border-zinc-800/80'
                              }`}>
                                <Building2 size={13} className="text-indigo-500 shrink-0" />
                                <span>SALDO FINAL DE CAIXA (DISPONIBILIDADES)</span>
                              </td>
                              {monthlyEndCash.map((val, idx) => (
                                <td key={idx} className={`py-3 px-3 text-right ${
                                  isHighContrast ? 'text-indigo-950' : 'text-indigo-200'
                                }`}>
                                  {formatCurrency(val)}
                                </td>
                              ))}
                              <td className={`py-3 px-4 text-right text-sm border-l ${
                                isHighContrast 
                                  ? 'text-indigo-950 bg-indigo-200/50 border-zinc-200' 
                                  : 'text-indigo-300 bg-indigo-950/60 border-zinc-800'
                              }`}>
                                {formatCurrency(endCashYear)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* REPORT TYPE B: BALANÇO PATRIMONIAL & COMPARATIVO ANUAL */}
              {reportType === 'balanco_patrimonial' && (() => {
                const rangeBase = getBalancoPeriodDateRange(balancoBaseYear, balancoPeriodScope);
                const rangeComp = getBalancoPeriodDateRange(balancoCompYear, balancoPeriodScope);

                // Helper for variation
                const calcVar = (base: number, comp: number) => {
                  const diff = base - comp;
                  const pct = comp !== 0 ? ((base - comp) / Math.abs(comp)) * 100 : (base > 0 ? 100 : 0);
                  return { diff, pct };
                };

                const renderBadge = (diff: number, pct: number, isExpense = false) => {
                  if (!balancoCompareEnabled) return null;
                  if (diff === 0) {
                    return (
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isHighContrast
                          ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        0.0%
                      </span>
                    );
                  }
                  const isPositive = diff > 0;
                  const isGood = isExpense ? !isPositive : isPositive;
                  const colorClass = isGood 
                    ? (isHighContrast ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')
                    : (isHighContrast ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/10 text-rose-500 border-rose-500/20');

                  return (
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${colorClass}`}>
                      {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      <span>{isPositive ? '+' : ''}{pct.toFixed(1)}%</span>
                      <span className="opacity-75 text-[9px]">({diff > 0 ? '+' : ''}{formatCurrency(diff)})</span>
                    </span>
                  );
                };

                // 1. ATIVO CIRCULANTE (Disponibilidades / Bancos e Caixa)
                let totalCirculanteBase = 0;
                let totalCirculanteComp = 0;
                const accountsData = accounts.map(acc => {
                  const baseBal = getAccountBalanceAtDate(acc.id, rangeBase.end);
                  const compBal = balancoCompareEnabled ? getAccountBalanceAtDate(acc.id, rangeComp.end) : 0;
                  totalCirculanteBase += baseBal;
                  totalCirculanteComp += compBal;
                  const v = calcVar(baseBal, compBal);
                  return { acc, baseBal, compBal, v };
                });
                const circVar = calcVar(totalCirculanteBase, totalCirculanteComp);

                // 2. ATIVO NÃO CIRCULANTE (Imobilizado / Bens Patrimoniais)
                let totalImobilizadoBase = 0;
                let totalImobilizadoComp = 0;
                const assetsData = fixedAssets.map(fa => {
                  const inBase = fa.acquisitionDate <= rangeBase.end;
                  const inComp = fa.acquisitionDate <= rangeComp.end;
                  const baseVal = inBase ? (fa.currentValue || fa.acquisitionValue) : 0;
                  const compVal = inComp ? fa.acquisitionValue : 0;
                  totalImobilizadoBase += baseVal;
                  totalImobilizadoComp += compVal;
                  const v = calcVar(baseVal, compVal);
                  return { fa, inBase, inComp, baseVal, compVal, v };
                });
                const imobVar = calcVar(totalImobilizadoBase, totalImobilizadoComp);

                // Total Ativo Geral
                const totalAtivoBase = totalCirculanteBase + totalImobilizadoBase;
                const totalAtivoComp = totalCirculanteComp + totalImobilizadoComp;
                const totalAtivoVar = calcVar(totalAtivoBase, totalAtivoComp);

                // 3. RECEITAS DO EXERCÍCIO
                const baseInflowTxs = transactions.filter(t => {
                  const d = t.dataRecebido || t.dataLancamento || t.date;
                  return t.type === 'entrada' && d >= rangeBase.start && d <= rangeBase.end;
                });
                const compInflowTxs = transactions.filter(t => {
                  const d = t.dataRecebido || t.dataLancamento || t.date;
                  return t.type === 'entrada' && d >= rangeComp.start && d <= rangeComp.end;
                });

                const revCategories = categories.filter(c => c.type === 'entrada' || c.type === 'ambas').map(cat => {
                  const bSum = baseInflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
                  const cSum = balancoCompareEnabled ? compInflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0) : 0;
                  const v = calcVar(bSum, cSum);
                  const subcats = (cat.subcategories || []).map(sub => {
                    const subBase = baseInflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0);
                    const subComp = balancoCompareEnabled ? compInflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0) : 0;
                    return { sub, subBase, subComp, v: calcVar(subBase, subComp) };
                  }).filter(s => s.subBase > 0 || s.subComp > 0);

                  return { cat, bSum, cSum, v, subcats };
                }).filter(c => c.bSum > 0 || c.cSum > 0);

                const totalReceitasBase = baseInflowTxs.reduce((sum, t) => sum + t.value, 0);
                const totalReceitasComp = compInflowTxs.reduce((sum, t) => sum + t.value, 0);
                const receitasVar = calcVar(totalReceitasBase, totalReceitasComp);

                // 4. DESPESAS DO EXERCÍCIO
                const baseOutflowTxs = transactions.filter(t => {
                  const d = t.dataRecebido || t.dataLancamento || t.date;
                  return t.type === 'saida' && d >= rangeBase.start && d <= rangeBase.end;
                });
                const compOutflowTxs = transactions.filter(t => {
                  const d = t.dataRecebido || t.dataLancamento || t.date;
                  return t.type === 'saida' && d >= rangeComp.start && d <= rangeComp.end;
                });

                const expCategories = categories.filter(c => c.type === 'saida' || c.type === 'ambas').map(cat => {
                  const bSum = baseOutflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
                  const cSum = balancoCompareEnabled ? compOutflowTxs.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0) : 0;
                  const v = calcVar(bSum, cSum);
                  const subcats = (cat.subcategories || []).map(sub => {
                    const subBase = baseOutflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0);
                    const subComp = balancoCompareEnabled ? compOutflowTxs.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((sum, t) => sum + t.value, 0) : 0;
                    return { sub, subBase, subComp, v: calcVar(subBase, subComp) };
                  }).filter(s => s.subBase > 0 || s.subComp > 0);

                  return { cat, bSum, cSum, v, subcats };
                }).filter(c => c.bSum > 0 || c.cSum > 0);

                const totalDespesasBase = baseOutflowTxs.reduce((sum, t) => sum + t.value, 0);
                const totalDespesasComp = compOutflowTxs.reduce((sum, t) => sum + t.value, 0);
                const despesasVar = calcVar(totalDespesasBase, totalDespesasComp);

                // 5. SUPERÁVIT / RESULTADO LÍQUIDO
                const superavitBase = totalReceitasBase - totalDespesasBase;
                const superavitComp = totalReceitasComp - totalDespesasComp;
                const superavitVar = calcVar(superavitBase, superavitComp);

                // Patrimônio Líquido Consolidado (Ativo Total + Resultado do Período)
                const patrimonioLiquidoBase = totalAtivoBase + superavitBase;
                const patrimonioLiquidoComp = totalAtivoComp + superavitComp;
                const patrimonioVar = calcVar(patrimonioLiquidoBase, patrimonioLiquidoComp);

                return (
                  <div className="space-y-6 text-xs text-left">
                    {/* CABEÇALHO INSTITUCIONAL DO MINISTÉRIO NOVA VIDA */}
                    <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                      isHighContrast 
                        ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' 
                        : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border-zinc-800 text-white shadow-lg'
                    }`}>
                      <div className="flex items-center gap-4 text-center sm:text-left">
                        <MNVLogo size={52} />
                        <div>
                          <h2 className={`text-base sm:text-lg font-bold uppercase tracking-tight ${
                            isHighContrast ? 'text-zinc-900' : 'text-white'
                          }`}>
                            MINISTÉRIO NOVA VIDA
                          </h2>
                          <p className={`text-xs uppercase tracking-wide font-medium ${
                            isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>
                            AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                          </p>
                          <p className={`text-xs font-mono font-medium ${
                            isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>
                            CNPJ: 62.471.271-0001-82
                          </p>
                          <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                            isHighContrast ? 'text-indigo-600' : 'text-indigo-400'
                          }`}>
                            BALANÇO PATRIMONIAL DO EXERCÍCIO ENCERRADO EM 31 DE DEZEMBRO DE {balancoBaseYear}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* BARRA DE CONTROLE: FILTRO POR PERÍODO E COMPARAÇÃO DE ANOS (NO-PRINT) */}
                    <div className={`no-print p-4 rounded-2xl border space-y-4 transition-colors ${
                      isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className={`flex items-center gap-1.5 font-bold text-xs ${
                            isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                          }`}>
                            <Calendar size={14} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-500'} />
                            <span>Período & Comparativo:</span>
                          </div>

                          {/* Ano Base */}
                          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300' : 'bg-zinc-950 border-zinc-800'
                          }`}>
                            <span className={`text-[10px] uppercase font-bold ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Ano Base:</span>
                            <select
                              value={balancoBaseYear}
                              onChange={(e) => setBalancoBaseYear(e.target.value)}
                              className={`text-xs bg-transparent font-bold focus:outline-none cursor-pointer ${
                                isHighContrast ? 'text-zinc-900' : 'text-white'
                              }`}
                            >
                              {balancoAvailableYears.map(y => (
                                <option key={y} value={y} className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>{y}</option>
                              ))}
                            </select>
                          </div>

                          {/* Escopo do Período */}
                          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-300' : 'bg-zinc-950 border-zinc-800'
                          }`}>
                            <span className={`text-[10px] uppercase font-bold ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Escopo:</span>
                            <select
                              value={balancoPeriodScope}
                              onChange={(e) => setBalancoPeriodScope(e.target.value)}
                              className={`text-xs bg-transparent font-bold focus:outline-none cursor-pointer ${
                                isHighContrast ? 'text-zinc-900' : 'text-white'
                              }`}
                            >
                              <option value="all" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Exercício Completo (Ano Todo)</option>
                              <option value="1s" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>1º Semestre (Jan - Jun)</option>
                              <option value="2s" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>2º Semestre (Jul - Dez)</option>
                              <option value="1t" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>1º Trimestre (Jan - Mar)</option>
                              <option value="2t" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>2º Trimestre (Abr - Jun)</option>
                              <option value="3t" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>3º Trimestre (Jul - Set)</option>
                              <option value="4t" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>4º Trimestre (Out - Dez)</option>
                              <option value="01" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Janeiro</option>
                              <option value="02" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Fevereiro</option>
                              <option value="03" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Março</option>
                              <option value="04" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Abril</option>
                              <option value="05" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Maio</option>
                              <option value="06" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Junho</option>
                              <option value="07" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Julho</option>
                              <option value="08" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Agosto</option>
                              <option value="09" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Setembro</option>
                              <option value="10" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Outubro</option>
                              <option value="11" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Novembro</option>
                              <option value="12" className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>Dezembro</option>
                            </select>
                          </div>

                          {/* Toggle Comparar com outro ano */}
                          <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                            isHighContrast 
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}>
                            <input
                              type="checkbox"
                              checked={balancoCompareEnabled}
                              onChange={(e) => setBalancoCompareEnabled(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-zinc-300 cursor-pointer"
                            />
                            <span>Comparar Anos</span>
                          </label>

                          {/* Ano Comparativo */}
                          {balancoCompareEnabled && (
                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border animate-fadeIn transition-colors ${
                              isHighContrast 
                                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' 
                                : 'bg-zinc-950 border-indigo-500/40 text-indigo-300'
                            }`}>
                              <span className={`text-[10px] uppercase font-bold ${
                                isHighContrast ? 'text-indigo-700' : 'text-zinc-400'
                              }`}>vs Ano:</span>
                              <select
                                value={balancoCompYear}
                                onChange={(e) => setBalancoCompYear(e.target.value)}
                                className={`text-xs bg-transparent font-bold focus:outline-none cursor-pointer ${
                                  isHighContrast ? 'text-indigo-900' : 'text-indigo-300'
                                }`}
                              >
                                {balancoAvailableYears.filter(y => y !== balancoBaseYear).map(y => (
                                  <option key={y} value={y} className={isHighContrast ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}>{y}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Banner Informativo do Período */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`text-[11px] px-3 py-1.5 rounded-xl border font-medium ${
                            isHighContrast 
                              ? 'bg-zinc-50 text-zinc-600 border-zinc-200' 
                              : 'text-zinc-400 bg-zinc-950/80 border-zinc-800/80'
                          }`}>
                            <span className={isHighContrast ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold'}>{rangeBase.label}</span>
                            {balancoCompareEnabled && (
                              <span> em confronto com <span className={isHighContrast ? 'text-amber-600 font-bold' : 'text-amber-400 font-bold'}>{rangeComp.label}</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOP SUMMARY CARDS (KPIS COMPARATIVOS) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {/* Ativo Circulante */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-zinc-900/40 border-zinc-800/80'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          <span>Ativo Circulante</span>
                          <Wallet size={12} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-500'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          isHighContrast ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>{formatCurrency(totalCirculanteBase)}</p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: {formatCurrency(totalCirculanteComp)}</span>
                            {renderBadge(circVar.diff, circVar.pct)}
                          </div>
                        )}
                      </div>

                      {/* Ativo Imobilizado */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-zinc-900/40 border-zinc-800/80'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          <span>Ativo Imobilizado</span>
                          <Building2 size={12} className={isHighContrast ? 'text-amber-600' : 'text-amber-500'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          isHighContrast ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>{formatCurrency(totalImobilizadoBase)}</p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: {formatCurrency(totalImobilizadoComp)}</span>
                            {renderBadge(imobVar.diff, imobVar.pct)}
                          </div>
                        )}
                      </div>

                      {/* Total Geral do Ativo */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-indigo-950/20 border-indigo-500/30'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-indigo-400'
                        }`}>
                          <span>Total do Ativo</span>
                          <Landmark size={12} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-400'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          isHighContrast ? 'text-indigo-600' : 'text-indigo-300'
                        }`}>{formatCurrency(totalAtivoBase)}</p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: {formatCurrency(totalAtivoComp)}</span>
                            {renderBadge(totalAtivoVar.diff, totalAtivoVar.pct)}
                          </div>
                        )}
                      </div>

                      {/* Total Receitas */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-emerald-950/20 border-emerald-500/30'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-emerald-400'
                        }`}>
                          <span>Total Receitas</span>
                          <TrendingUp size={12} className={isHighContrast ? 'text-emerald-600' : 'text-emerald-400'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          isHighContrast ? 'text-emerald-600' : 'text-emerald-400'
                        }`}>+{formatCurrency(totalReceitasBase)}</p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: +{formatCurrency(totalReceitasComp)}</span>
                            {renderBadge(receitasVar.diff, receitasVar.pct)}
                          </div>
                        )}
                      </div>

                      {/* Total Despesas */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-rose-950/20 border-rose-500/30'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-rose-400'
                        }`}>
                          <span>Total Despesas</span>
                          <ArrowUpRight size={12} className={isHighContrast ? 'text-rose-600' : 'text-rose-400'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          isHighContrast ? 'text-rose-600' : 'text-rose-400'
                        }`}>-{formatCurrency(totalDespesasBase)}</p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: -{formatCurrency(totalDespesasComp)}</span>
                            {renderBadge(despesasVar.diff, despesasVar.pct, true)}
                          </div>
                        )}
                      </div>

                      {/* Superávit Líquido */}
                      <div className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' : 'bg-zinc-900/40 border-zinc-800/80'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          <span>Superávit Líquido</span>
                          <Scale size={12} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-500'} />
                        </div>
                        <p className={`text-sm font-black font-mono ${
                          superavitBase >= 0 
                            ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-400') 
                            : (isHighContrast ? 'text-rose-600' : 'text-rose-400')
                        }`}>
                          {formatCurrency(superavitBase)}
                        </p>
                        {balancoCompareEnabled && (
                          <div className="pt-1 flex flex-col gap-0.5">
                            <span className={`text-[9px] font-mono ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-500'
                            }`}>Em {balancoCompYear}: {formatCurrency(superavitComp)}</span>
                            {renderBadge(superavitVar.diff, superavitVar.pct)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* QUADRO 1: TODOS OS ATIVOS (CIRCULANTE & NÃO CIRCULANTE/IMOBILIZADO) */}
                    {/* ============================================================== */}
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between border-b pb-2 ${
                        isHighContrast ? 'border-zinc-200' : 'border-zinc-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Landmark className={`w-4 h-4 ${isHighContrast ? 'text-indigo-600' : 'text-indigo-400'}`} />
                          <h4 className={`font-bold uppercase tracking-wider text-xs ${
                            isHighContrast ? 'text-zinc-900 font-bold' : 'text-indigo-400'
                          }`}>
                            1. ATIVOS DA ORGANIZAÇÃO (CIRCULANTE & NÃO CIRCULANTE)
                          </h4>
                        </div>
                        <span className={`text-[11px] font-mono ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                        }`}>
                          Total do Ativo: <span className={isHighContrast ? 'text-zinc-900 font-bold' : 'text-zinc-100'}>{formatCurrency(totalAtivoBase)}</span>
                        </span>
                      </div>

                      {/* 1.1 ATIVO CIRCULANTE (Bancos & Caixa) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-300'
                          }`}>
                            <Wallet size={12} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-400'} />
                            1.1 Ativo Circulante (Disponibilidades: Bancos e Caixa)
                          </h5>
                          <span className={`text-[10px] font-mono font-semibold ${
                            isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>
                            Subtotal: {formatCurrency(totalCirculanteBase)}
                          </span>
                        </div>

                        <div className={`border rounded-xl overflow-hidden overflow-x-auto scrollbar-thin ${
                          isHighContrast ? 'border-zinc-200 bg-white shadow-sm' : 'border-zinc-800'
                        }`}>
                          <table className="w-full text-left border-collapse min-w-[650px]">
                            <thead>
                              <tr className={`border-b text-[9px] uppercase font-bold ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-500 tracking-wider' : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                              }`}>
                                <th className="py-2.5 px-3">Conta / Instituição</th>
                                <th className="py-2.5 px-3">Tipo da Conta</th>
                                <th className="py-2.5 px-3 text-right">Saldo em {balancoBaseYear}</th>
                                {balancoCompareEnabled && (
                                  <>
                                    <th className={`py-2.5 px-3 text-right ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>Saldo em {balancoCompYear}</th>
                                    <th className="py-2.5 px-3 text-right">Variação (R$)</th>
                                    <th className="py-2.5 px-3 text-right">Variação (%)</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${
                              isHighContrast ? 'divide-zinc-200 bg-white text-zinc-800' : 'divide-zinc-900 text-zinc-300'
                            }`}>
                              {accountsData.map(({ acc, baseBal, compBal, v }) => (
                                <tr key={acc.id} className={`transition-colors ${
                                  isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-500/5'
                                }`}>
                                  <td className={`py-2.5 px-3 font-semibold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>
                                    <div className="flex items-center gap-2">
                                      <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={24} />
                                      <div>
                                        <span>{acc.name}</span>
                                        <span className={`block text-[9px] font-normal ${isHighContrast ? 'text-zinc-500' : 'text-zinc-500'}`}>{acc.bankName}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                      isHighContrast ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-zinc-800 text-zinc-300'
                                    }`}>
                                      {getAccountTypeLabel(acc.type)}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                    isHighContrast ? 'text-zinc-900' : 'text-zinc-100'
                                  }`}>
                                    {formatCurrency(baseBal)}
                                  </td>
                                  {balancoCompareEnabled && (
                                    <>
                                      <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {formatCurrency(compBal)}
                                      </td>
                                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                        v.diff > 0 
                                          ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-500') 
                                          : v.diff < 0 
                                          ? (isHighContrast ? 'text-rose-600' : 'text-rose-500') 
                                          : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                      }`}>
                                        {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        {renderBadge(v.diff, v.pct)}
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className={`border-t font-bold ${
                                isHighContrast ? 'bg-zinc-50/90 border-zinc-200 text-zinc-900' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'
                              }`}>
                                <td colSpan={2} className={`py-2.5 px-3 uppercase text-[10px] tracking-wider ${
                                  isHighContrast ? 'text-zinc-700 font-bold' : 'text-indigo-400'
                                }`}>
                                  Subtotal do Ativo Circulante
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono ${
                                  isHighContrast ? 'text-indigo-600 font-black' : 'text-indigo-300'
                                }`}>
                                  {formatCurrency(totalCirculanteBase)}
                                </td>
                                {balancoCompareEnabled && (
                                  <>
                                    <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                      {formatCurrency(totalCirculanteComp)}
                                    </td>
                                    <td className={`py-2.5 px-3 text-right font-mono ${
                                      circVar.diff > 0 
                                        ? (isHighContrast ? 'text-emerald-600 font-bold' : 'text-emerald-500') 
                                        : circVar.diff < 0 
                                        ? (isHighContrast ? 'text-rose-600 font-bold' : 'text-rose-500') 
                                        : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                    }`}>
                                      {circVar.diff > 0 ? '+' : ''}{formatCurrency(circVar.diff)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {renderBadge(circVar.diff, circVar.pct)}
                                    </td>
                                  </>
                                )}
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* 1.2 ATIVO NÃO CIRCULANTE (Bens Patrimoniais / Imobilizado) */}
                      <div className="space-y-2 pt-3">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-300'
                          }`}>
                            <Building2 size={12} className={isHighContrast ? 'text-amber-600' : 'text-amber-400'} />
                            1.2 Ativo Não Circulante (Imobilizado / Bens Móveis, Imóveis e Equipamentos)
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-semibold ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>
                              Subtotal: {formatCurrency(totalImobilizadoBase)}
                            </span>
                            <button
                              onClick={() => handleOpenAddAssetModal()}
                              className={`no-print text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                                isHighContrast ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                              }`}
                            >
                              <Plus size={11} /> Adicionar Bem
                            </button>
                          </div>
                        </div>

                        <div className={`border rounded-xl overflow-hidden overflow-x-auto scrollbar-thin ${
                          isHighContrast ? 'border-zinc-200 bg-white shadow-sm' : 'border-zinc-800'
                        }`}>
                          <table className="w-full text-left border-collapse min-w-[750px]">
                            <thead>
                              <tr className={`border-b text-[9px] uppercase font-bold ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-500 tracking-wider' : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                              }`}>
                                <th className="py-2.5 px-3">Bem Patrimonial</th>
                                <th className="py-2.5 px-3">Categoria</th>
                                <th className="py-2.5 px-3">Aquisição</th>
                                <th className="py-2.5 px-3 text-right">Valor em {balancoBaseYear}</th>
                                {balancoCompareEnabled && (
                                  <>
                                    <th className={`py-2.5 px-3 text-right ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>Valor em {balancoCompYear}</th>
                                    <th className="py-2.5 px-3 text-right">Variação (R$)</th>
                                    <th className="py-2.5 px-3 text-right">Variação (%)</th>
                                  </>
                                )}
                                <th className="py-2.5 px-3 text-center no-print w-16">Ações</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${
                              isHighContrast ? 'divide-zinc-200 bg-white text-zinc-800' : 'divide-zinc-900 text-zinc-300'
                            }`}>
                              {assetsData.map(({ fa, inBase, inComp, baseVal, compVal, v }) => (
                                <tr key={fa.id} className={`transition-colors ${
                                  isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-500/5'
                                }`}>
                                  <td className={`py-2.5 px-3 font-semibold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>
                                    <div>
                                      <span>{fa.name}</span>
                                      {fa.description && (
                                        <span className={`block text-[9px] font-normal ${isHighContrast ? 'text-zinc-500' : 'text-zinc-500'}`}>{fa.description}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${
                                      isHighContrast 
                                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                      {fa.category}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 font-mono text-[10px] ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {fa.acquisitionDate ? fa.acquisitionDate.split('-').reverse().join('/') : '—'}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-100'}`}>
                                    {inBase ? formatCurrency(baseVal) : <span className={isHighContrast ? 'text-zinc-400 italic' : 'text-zinc-600 italic'}>Não existia</span>}
                                  </td>
                                  {balancoCompareEnabled && (
                                    <>
                                      <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {inComp ? formatCurrency(compVal) : <span className={isHighContrast ? 'text-zinc-400 italic' : 'text-zinc-600 italic'}>Não existia</span>}
                                      </td>
                                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                        v.diff > 0 
                                          ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-500') 
                                          : v.diff < 0 
                                          ? (isHighContrast ? 'text-rose-600' : 'text-rose-500') 
                                          : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                      }`}>
                                        {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        {renderBadge(v.diff, v.pct)}
                                      </td>
                                    </>
                                  )}
                                  <td className="py-2.5 px-3 text-center no-print">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleOpenAddAssetModal(fa)}
                                        className={`p-1 rounded cursor-pointer transition-colors ${
                                          isHighContrast ? 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                                        }`}
                                        title="Editar bem"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAsset(fa.id, fa.name)}
                                        className={`p-1 rounded cursor-pointer transition-colors ${
                                          isHighContrast ? 'text-zinc-500 hover:text-rose-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                                        }`}
                                        title="Excluir bem"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className={`border-t font-bold ${
                                isHighContrast ? 'bg-zinc-50/90 border-zinc-200 text-zinc-900' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'
                              }`}>
                                <td colSpan={3} className={`py-2.5 px-3 uppercase text-[10px] tracking-wider ${
                                  isHighContrast ? 'text-zinc-700 font-bold' : 'text-amber-400'
                                }`}>
                                  Subtotal do Ativo Imobilizado
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono ${
                                  isHighContrast ? 'text-amber-700 font-black' : 'text-amber-300'
                                }`}>
                                  {formatCurrency(totalImobilizadoBase)}
                                </td>
                                {balancoCompareEnabled && (
                                  <>
                                    <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                      {formatCurrency(totalImobilizadoComp)}
                                    </td>
                                    <td className={`py-2.5 px-3 text-right font-mono ${
                                      imobVar.diff > 0 
                                        ? (isHighContrast ? 'text-emerald-600 font-bold' : 'text-emerald-500') 
                                        : imobVar.diff < 0 
                                        ? (isHighContrast ? 'text-rose-600 font-bold' : 'text-rose-500') 
                                        : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                    }`}>
                                      {imobVar.diff > 0 ? '+' : ''}{formatCurrency(imobVar.diff)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {renderBadge(imobVar.diff, imobVar.pct)}
                                    </td>
                                  </>
                                )}
                                <td className="no-print"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* TOTAL GERAL DO ATIVO (CONSOLIDADO) */}
                      <div className={`p-3.5 rounded-xl border flex flex-wrap justify-between items-center gap-3 transition-colors ${
                        isHighContrast 
                          ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950 shadow-sm' 
                          : 'border-indigo-500/30 bg-indigo-950/15'
                      }`}>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            isHighContrast ? 'text-indigo-900 font-bold' : 'text-indigo-400'
                          }`}>TOTAL GERAL DO ATIVO (CIRCULANTE + NÃO CIRCULANTE)</p>
                          <p className={`text-[10px] ${isHighContrast ? 'text-zinc-500 font-medium' : 'text-zinc-400'}`}>
                            Patrimônio bruto total registrado no encerramento do período selecionado
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className={`block text-[10px] uppercase font-mono font-bold ${
                              isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>Em {balancoBaseYear}:</span>
                            <span className={`text-base font-black font-mono ${
                              isHighContrast ? 'text-indigo-700' : 'text-indigo-300'
                            }`}>{formatCurrency(totalAtivoBase)}</span>
                          </div>
                          {balancoCompareEnabled && (
                            <>
                              <div className={`border-l pl-4 ${isHighContrast ? 'border-indigo-200' : 'border-zinc-800'}`}>
                                <span className={`block text-[10px] uppercase font-mono font-bold ${
                                  isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                                }`}>Em {balancoCompYear}:</span>
                                <span className={`text-base font-black font-mono ${
                                  isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                                }`}>{formatCurrency(totalAtivoComp)}</span>
                              </div>
                              <div className={`border-l pl-4 flex flex-col items-end ${isHighContrast ? 'border-indigo-200' : 'border-zinc-800'}`}>
                                <span className={`block text-[10px] uppercase font-mono font-bold ${
                                  isHighContrast ? 'text-zinc-500' : 'text-zinc-400'
                                }`}>Variação Total:</span>
                                {renderBadge(totalAtivoVar.diff, totalAtivoVar.pct)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* QUADRO 2: TODAS AS RECEITAS (DEMONSTRAÇÃO COMPARATIVA) */}
                    {/* ============================================================== */}
                    <div className="space-y-3 pt-2">
                      <div className={`flex items-center justify-between border-b pb-2 ${
                        isHighContrast ? 'border-zinc-200' : 'border-zinc-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${isHighContrast ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          <h4 className={`font-bold uppercase tracking-wider text-xs ${
                            isHighContrast ? 'text-zinc-900 font-bold' : 'text-emerald-400'
                          }`}>
                            2. RECEITAS DO EXERCÍCIO (+)
                          </h4>
                        </div>
                        <span className={`text-[11px] font-mono ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                        }`}>
                          Total de Entradas: <span className={isHighContrast ? 'text-emerald-600 font-bold' : 'text-emerald-400 font-black'}>+{formatCurrency(totalReceitasBase)}</span>
                        </span>
                      </div>

                      <div className={`border rounded-xl overflow-hidden overflow-x-auto scrollbar-thin ${
                        isHighContrast ? 'border-zinc-200 bg-white shadow-sm' : 'border-zinc-800'
                      }`}>
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className={`border-b text-[9px] uppercase font-bold ${
                              isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-500 tracking-wider' : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                            }`}>
                              <th className="py-2.5 px-3">Categoria de Receita</th>
                              <th className="py-2.5 px-3">Grupo Principal</th>
                              <th className="py-2.5 px-3 text-right">Exercício {balancoBaseYear}</th>
                              {balancoCompareEnabled && (
                                <>
                                  <th className={`py-2.5 px-3 text-right ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>Exercício {balancoCompYear}</th>
                                  <th className="py-2.5 px-3 text-right">Variação (R$)</th>
                                  <th className="py-2.5 px-3 text-right">Variação (%)</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${
                            isHighContrast ? 'divide-zinc-200 bg-white text-zinc-800' : 'divide-zinc-900 text-zinc-300'
                          }`}>
                            {revCategories.map(({ cat, bSum, cSum, v, subcats }) => (
                              <React.Fragment key={cat.id}>
                                <tr className={`transition-colors font-semibold ${
                                  isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-500/5'
                                }`}>
                                  <td className={`py-2.5 px-3 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isHighContrast ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : cat.color
                                    }`}>
                                      {cat.name}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-[10px] ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {cat.mainCategory || 'Receitas Gerais'}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                    isHighContrast ? 'text-emerald-600' : 'text-emerald-400'
                                  }`}>
                                    +{formatCurrency(bSum)}
                                  </td>
                                  {balancoCompareEnabled && (
                                    <>
                                      <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        +{formatCurrency(cSum)}
                                      </td>
                                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                        v.diff > 0 
                                          ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-500') 
                                          : v.diff < 0 
                                          ? (isHighContrast ? 'text-rose-600' : 'text-rose-500') 
                                          : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                      }`}>
                                        {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        {renderBadge(v.diff, v.pct)}
                                      </td>
                                    </>
                                  )}
                                </tr>
                                {/* Subcategories breakdown rows */}
                                {subcats.map(({ sub, subBase, subComp, v: subV }) => (
                                  <tr key={sub} className={`text-[10px] ${
                                    isHighContrast ? 'bg-zinc-50/50 text-zinc-600' : 'bg-zinc-950/30 text-zinc-400'
                                  }`}>
                                    <td className="py-1.5 px-3 pl-8">
                                      <span className={isHighContrast ? 'text-zinc-400 mr-1.5' : 'text-zinc-500 mr-1.5'}>•</span>
                                      <span className={isHighContrast ? 'font-medium text-zinc-800' : ''}>{sub}</span>
                                    </td>
                                    <td className={`py-1.5 px-3 italic ${isHighContrast ? 'text-zinc-500' : 'text-zinc-500'}`}>Subcategoria</td>
                                    <td className={`py-1.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-900 font-medium' : 'text-zinc-300'}`}>
                                      {formatCurrency(subBase)}
                                    </td>
                                    {balancoCompareEnabled && (
                                      <>
                                        <td className={`py-1.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-500'}`}>
                                          {formatCurrency(subComp)}
                                        </td>
                                        <td className={`py-1.5 px-3 text-right font-mono ${
                                          subV.diff > 0 
                                            ? (isHighContrast ? 'text-emerald-600 font-medium' : 'text-emerald-500/80') 
                                            : subV.diff < 0 
                                            ? (isHighContrast ? 'text-rose-600 font-medium' : 'text-rose-500/80') 
                                            : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                        }`}>
                                          {subV.diff > 0 ? '+' : ''}{formatCurrency(subV.diff)}
                                        </td>
                                        <td className="py-1.5 px-3 text-right">
                                          <span className={`text-[9px] font-mono ${isHighContrast ? 'text-zinc-500 font-medium' : 'opacity-80'}`}>
                                            {subV.pct >= 0 ? '+' : ''}{subV.pct.toFixed(1)}%
                                          </span>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className={`border-t font-bold ${
                              isHighContrast ? 'bg-emerald-50/60 border-emerald-200 text-zinc-900' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'
                            }`}>
                              <td colSpan={2} className={`py-2.5 px-3 uppercase text-[10px] tracking-wider ${
                                isHighContrast ? 'text-emerald-950 font-bold' : 'text-emerald-400'
                              }`}>
                                TOTAL GERAL DAS RECEITAS
                              </td>
                              <td className={`py-2.5 px-3 text-right font-mono text-sm ${
                                isHighContrast ? 'text-emerald-600 font-black' : 'text-emerald-400'
                              }`}>
                                +{formatCurrency(totalReceitasBase)}
                              </td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className={`py-2.5 px-3 text-right font-mono text-sm ${isHighContrast ? 'text-zinc-600 font-bold' : 'text-zinc-400'}`}>
                                    +{formatCurrency(totalReceitasComp)}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono text-sm ${
                                    receitasVar.diff > 0 
                                      ? (isHighContrast ? 'text-emerald-600 font-bold' : 'text-emerald-500') 
                                      : receitasVar.diff < 0 
                                      ? (isHighContrast ? 'text-rose-600 font-bold' : 'text-rose-500') 
                                      : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                  }`}>
                                    {receitasVar.diff > 0 ? '+' : ''}{formatCurrency(receitasVar.diff)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {renderBadge(receitasVar.diff, receitasVar.pct)}
                                  </td>
                                </>
                              )}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* QUADRO 3: TODAS AS DESPESAS (DEMONSTRAÇÃO COMPARATIVA) */}
                    {/* ============================================================== */}
                    <div className="space-y-3 pt-2">
                      <div className={`flex items-center justify-between border-b pb-2 ${
                        isHighContrast ? 'border-zinc-200' : 'border-zinc-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className={`w-4 h-4 ${isHighContrast ? 'text-rose-600' : 'text-rose-400'}`} />
                          <h4 className={`font-bold uppercase tracking-wider text-xs ${
                            isHighContrast ? 'text-zinc-900 font-bold' : 'text-rose-400'
                          }`}>
                            3. DESPESAS DO EXERCÍCIO (-)
                          </h4>
                        </div>
                        <span className={`text-[11px] font-mono ${
                          isHighContrast ? 'text-zinc-500' : 'text-zinc-400 font-bold'
                        }`}>
                          Total de Saídas: <span className={isHighContrast ? 'text-rose-600 font-bold' : 'text-rose-400 font-black'}>-{formatCurrency(totalDespesasBase)}</span>
                        </span>
                      </div>

                      <div className={`border rounded-xl overflow-hidden overflow-x-auto scrollbar-thin ${
                        isHighContrast ? 'border-zinc-200 bg-white shadow-sm' : 'border-zinc-800'
                      }`}>
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className={`border-b text-[9px] uppercase font-bold ${
                              isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-500 tracking-wider' : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                            }`}>
                              <th className="py-2.5 px-3">Categoria de Despesa</th>
                              <th className="py-2.5 px-3">Grupo Principal</th>
                              <th className="py-2.5 px-3 text-right">Exercício {balancoBaseYear}</th>
                              {balancoCompareEnabled && (
                                <>
                                  <th className={`py-2.5 px-3 text-right ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>Exercício {balancoCompYear}</th>
                                  <th className="py-2.5 px-3 text-right">Variação (R$)</th>
                                  <th className="py-2.5 px-3 text-right">Variação (%)</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${
                            isHighContrast ? 'divide-zinc-200 bg-white text-zinc-800' : 'divide-zinc-900 text-zinc-300'
                          }`}>
                            {expCategories.map(({ cat, bSum, cSum, v, subcats }) => (
                              <React.Fragment key={cat.id}>
                                <tr className={`transition-colors font-semibold ${
                                  isHighContrast ? 'hover:bg-zinc-50/80' : 'hover:bg-zinc-500/5'
                                }`}>
                                  <td className={`py-2.5 px-3 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isHighContrast 
                                        ? (cat.color.includes('amber') 
                                            ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                            : cat.color.includes('sky') 
                                            ? 'bg-sky-50 text-sky-800 border-sky-200' 
                                            : 'bg-rose-50 text-rose-800 border-rose-200')
                                        : cat.color
                                    }`}>
                                      {cat.name}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-[10px] ${isHighContrast ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {cat.mainCategory || 'Despesas Gerais'}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                    isHighContrast ? 'text-rose-600' : 'text-rose-400'
                                  }`}>
                                    -{formatCurrency(bSum)}
                                  </td>
                                  {balancoCompareEnabled && (
                                    <>
                                      <td className={`py-2.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        -{formatCurrency(cSum)}
                                      </td>
                                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                        v.diff > 0 
                                          ? (isHighContrast ? 'text-amber-700' : 'text-amber-500') 
                                          : v.diff < 0 
                                          ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-500') 
                                          : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                      }`}>
                                        {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        {renderBadge(v.diff, v.pct, true)}
                                      </td>
                                    </>
                                  )}
                                </tr>
                                {/* Subcategories breakdown rows */}
                                {subcats.map(({ sub, subBase, subComp, v: subV }) => (
                                  <tr key={sub} className={`text-[10px] ${
                                    isHighContrast ? 'bg-zinc-50/50 text-zinc-600' : 'bg-zinc-950/30 text-zinc-400'
                                  }`}>
                                    <td className="py-1.5 px-3 pl-8">
                                      <span className={isHighContrast ? 'text-zinc-400 mr-1.5' : 'text-zinc-500 mr-1.5'}>•</span>
                                      <span className={isHighContrast ? 'font-medium text-zinc-800' : ''}>{sub}</span>
                                    </td>
                                    <td className={`py-1.5 px-3 italic ${isHighContrast ? 'text-zinc-500' : 'text-zinc-500'}`}>Subcategoria</td>
                                    <td className={`py-1.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-900 font-medium' : 'text-zinc-300'}`}>
                                      {formatCurrency(subBase)}
                                    </td>
                                    {balancoCompareEnabled && (
                                      <>
                                        <td className={`py-1.5 px-3 text-right font-mono ${isHighContrast ? 'text-zinc-600' : 'text-zinc-500'}`}>
                                          {formatCurrency(subComp)}
                                        </td>
                                        <td className={`py-1.5 px-3 text-right font-mono ${
                                          subV.diff > 0 
                                            ? (isHighContrast ? 'text-amber-700 font-medium' : 'text-amber-500/80') 
                                            : subV.diff < 0 
                                            ? (isHighContrast ? 'text-emerald-600 font-medium' : 'text-emerald-500/80') 
                                            : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                        }`}>
                                          {subV.diff > 0 ? '+' : ''}{formatCurrency(subV.diff)}
                                        </td>
                                        <td className="py-1.5 px-3 text-right">
                                          <span className={`text-[9px] font-mono ${isHighContrast ? 'text-zinc-500 font-medium' : 'opacity-80'}`}>
                                            {subV.pct >= 0 ? '+' : ''}{subV.pct.toFixed(1)}%
                                          </span>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className={`border-t font-bold ${
                              isHighContrast ? 'bg-rose-50/60 border-rose-200 text-zinc-900' : 'border-zinc-800 bg-zinc-950/80 text-zinc-200'
                            }`}>
                              <td colSpan={2} className={`py-2.5 px-3 uppercase text-[10px] tracking-wider ${
                                isHighContrast ? 'text-rose-950 font-bold' : 'text-rose-400'
                              }`}>
                                TOTAL GERAL DAS DESPESAS
                              </td>
                              <td className={`py-2.5 px-3 text-right font-mono text-sm ${
                                isHighContrast ? 'text-rose-600 font-black' : 'text-rose-400'
                              }`}>
                                -{formatCurrency(totalDespesasBase)}
                              </td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className={`py-2.5 px-3 text-right font-mono text-sm ${isHighContrast ? 'text-zinc-600 font-bold' : 'text-zinc-400'}`}>
                                    -{formatCurrency(totalDespesasComp)}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono text-sm ${
                                    despesasVar.diff > 0 
                                      ? (isHighContrast ? 'text-amber-700 font-bold' : 'text-amber-500') 
                                      : despesasVar.diff < 0 
                                      ? (isHighContrast ? 'text-emerald-600 font-bold' : 'text-emerald-500') 
                                      : (isHighContrast ? 'text-zinc-500' : 'text-zinc-500')
                                  }`}>
                                    {despesasVar.diff > 0 ? '+' : ''}{formatCurrency(despesasVar.diff)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {renderBadge(despesasVar.diff, despesasVar.pct, true)}
                                  </td>
                                </>
                              )}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* QUADRO 4: SÍNTESE PATRIMONIAL, RESULTADO LÍQUIDO E GRÁFICOS */}
                    {/* ============================================================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Resumo do Resultado e Patrimônio */}
                      <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                        isHighContrast 
                          ? 'bg-white border-zinc-200 shadow-sm' 
                          : 'border-indigo-500/20 bg-indigo-500/5'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Scale className={`w-4 h-4 ${isHighContrast ? 'text-indigo-600' : 'text-indigo-400'}`} />
                          <h4 className={`font-bold text-xs uppercase tracking-wider ${
                            isHighContrast ? 'text-zinc-900 font-bold' : 'text-indigo-300'
                          }`}>
                            4. Síntese do Resultado & Patrimônio Líquido
                          </h4>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className={`flex justify-between items-center py-1.5 border-b ${
                            isHighContrast ? 'border-zinc-100' : 'border-zinc-800/60'
                          }`}>
                            <span className={isHighContrast ? 'text-zinc-600 font-medium' : 'text-zinc-400'}>Receitas Totais ({balancoBaseYear}):</span>
                            <span className={`font-mono font-bold ${isHighContrast ? 'text-emerald-600' : 'text-emerald-400'}`}>+{formatCurrency(totalReceitasBase)}</span>
                          </div>
                          <div className={`flex justify-between items-center py-1.5 border-b ${
                            isHighContrast ? 'border-zinc-100' : 'border-zinc-800/60'
                          }`}>
                            <span className={isHighContrast ? 'text-zinc-600 font-medium' : 'text-zinc-400'}>Despesas Totais ({balancoBaseYear}):</span>
                            <span className={`font-mono font-bold ${isHighContrast ? 'text-rose-600' : 'text-rose-400'}`}>-{formatCurrency(totalDespesasBase)}</span>
                          </div>
                          <div className={`flex justify-between items-center py-1.5 border-b font-bold ${
                            isHighContrast ? 'border-zinc-200' : 'border-zinc-800/60'
                          }`}>
                            <span className={isHighContrast ? 'text-zinc-900' : 'text-zinc-300'}>Superávit / Déficit Operacional:</span>
                            <span className={`font-mono font-black ${
                              superavitBase >= 0 
                                ? (isHighContrast ? 'text-emerald-600' : 'text-emerald-400') 
                                : (isHighContrast ? 'text-rose-600' : 'text-rose-400')
                            }`}>
                              {formatCurrency(superavitBase)}
                            </span>
                          </div>
                          <div className={`flex justify-between items-center py-2 pt-3 font-bold text-sm p-2.5 rounded-xl border ${
                            isHighContrast 
                              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' 
                              : 'bg-zinc-950/40 border-indigo-500/30 text-indigo-300'
                          }`}>
                            <span className={`uppercase text-xs tracking-wider ${
                              isHighContrast ? 'text-indigo-900 font-bold' : 'text-indigo-300'
                            }`}>Patrimônio Líquido Consolidado:</span>
                            <span className={`font-mono text-base font-black ${
                              isHighContrast ? 'text-indigo-700' : 'text-indigo-300'
                            }`}>{formatCurrency(patrimonioLiquidoBase)}</span>
                          </div>
                        </div>

                        {balancoCompareEnabled && (
                          <div className={`pt-2 border-t text-[10px] flex justify-between items-center ${
                            isHighContrast ? 'border-zinc-200 text-zinc-500 font-medium' : 'border-zinc-800 text-zinc-400'
                          }`}>
                            <span className="font-medium">Variação Patrimônio vs {balancoCompYear}:</span>
                            {renderBadge(patrimonioVar.diff, patrimonioVar.pct)}
                          </div>
                        )}
                      </div>

                      {/* Comparativo Visual de Barras entre Anos */}
                      <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                        isHighContrast ? 'bg-white border-zinc-200 shadow-sm' : 'border-zinc-800 bg-zinc-900/40'
                      }`}>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                            isHighContrast ? 'text-zinc-900 font-bold' : 'text-zinc-300'
                          }`}>
                            <Layers size={13} className={isHighContrast ? 'text-indigo-600' : 'text-indigo-400'} />
                            Comparativo Visual de Exercícios
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] font-mono">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
                              <span className={isHighContrast ? 'text-zinc-700 font-bold' : ''}>{balancoBaseYear}</span>
                            </span>
                            {balancoCompareEnabled && (
                              <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                                <span className={isHighContrast ? 'text-zinc-700 font-bold' : ''}>{balancoCompYear}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Barras de Métricas */}
                        <div className="space-y-3 pt-1">
                          {/* 1. Ativos Totais */}
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className={`font-semibold ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>Ativo Total</span>
                              <span className={`font-mono font-bold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-300'}`}>{formatCurrency(totalAtivoBase)}</span>
                            </div>
                            <div className="space-y-1">
                              <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                              </div>
                              {balancoCompareEnabled && totalAtivoBase > 0 && (
                                <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                  <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, (totalAtivoComp / totalAtivoBase) * 100))}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. Receitas */}
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className={`font-semibold ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>Receitas do Período</span>
                              <span className={`font-mono font-bold ${isHighContrast ? 'text-emerald-600' : 'text-emerald-400'}`}>+{formatCurrency(totalReceitasBase)}</span>
                            </div>
                            <div className="space-y-1">
                              <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                              </div>
                              {balancoCompareEnabled && totalReceitasBase > 0 && (
                                <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                  <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, (totalReceitasComp / totalReceitasBase) * 100))}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 3. Despesas */}
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className={`font-semibold ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>Despesas do Período</span>
                              <span className={`font-mono font-bold ${isHighContrast ? 'text-rose-600' : 'text-rose-400'}`}>-{formatCurrency(totalDespesasBase)}</span>
                            </div>
                            <div className="space-y-1">
                              <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                              </div>
                              {balancoCompareEnabled && totalDespesasBase > 0 && (
                                <div className={`w-full rounded-full h-2 overflow-hidden ${isHighContrast ? 'bg-zinc-100 border border-zinc-200/60' : 'bg-zinc-800'}`}>
                                  <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, (totalDespesasComp / totalDespesasBase) * 100))}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        )}

      </div>

      {/* --- FINANCIAL MODALS --- */}
      <AnimatePresence>
        
        {/* Modal: New Transaction (Entry or Expense) */}
        {showTxModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTxModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-3xl md:max-w-4xl w-full overflow-hidden shadow-2xl text-left ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {editingTx ? 'Editar Transação' : 'Lançar Nova Transação'} ({txType === 'entrada' ? 'Receita' : 'Despesa'})
                  </h3>
                </div>
                <button onClick={() => { setShowTxModal(false); setEditingTx(null); }} className="p-1 rounded text-zinc-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="p-6 space-y-4 max-h-[90vh] md:max-h-[85vh] overflow-y-auto scrollbar-thin">
                {/* Flow indicator switch */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setTxType('entrada'); setTxCategoryId(''); setTxSubcategory(''); }}
                    className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      txType === 'entrada' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Receita (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTxType('saida'); setTxCategoryId(''); setTxSubcategory(''); }}
                    className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      txType === 'saida' ? 'bg-red-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Despesa (-)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Left Column: Core fields & status */}
                  <div className="space-y-4">
                    {/* COMMON - DESCRICAO COM PREENCHIMENTO INTELIGENTE */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex justify-between items-center">
                        <span>Descrição / Histórico *</span>
                        {transactions.some(t => t.type === txType && t.description.toLowerCase().trim() === txDescription.toLowerCase().trim()) && (
                          <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                            ✨ Memória Inteligente
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={txDescription}
                          onChange={(e) => {
                            setTxDescription(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                          placeholder={txType === 'entrada' ? 'Ex: Dízimo Dominical Culto' : 'Ex: Compra de Lâmpadas para o Templo'}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>

                      {/* Feedback Toast de Preenchimento Automático */}
                      {autoFillFeedback && (
                        <div className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-fadeIn shadow-sm">
                          <span>✨</span>
                          <span>{autoFillFeedback}</span>
                        </div>
                      )}

                      {/* Banner Inteligente de Preenchimento Automático em Tempo Real */}
                      {(() => {
                        if (!txDescription || txDescription.trim().length < 2) return null;
                        const term = txDescription.trim().toLowerCase();
                        const activeMatch = [...transactions].reverse().find(t => 
                          t.type === txType && t.description.toLowerCase().trim() === term
                        ) || (term.length >= 3 ? [...transactions].reverse().find(t => 
                          t.type === txType && t.description.toLowerCase().includes(term)
                        ) : undefined);

                        if (!activeMatch) return null;

                        const matchCat = categories.find(c => c.id === activeMatch.categoryId);
                        const matchAcc = accounts.find(a => a.id === activeMatch.accountId);

                        return (
                          <div className={`mt-2 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isHighContrast 
                              ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-sm' 
                              : 'bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950 border-indigo-500/40 text-zinc-200 shadow-md'
                          }`}>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs">⚡</span>
                                <span className="text-[11px] font-bold text-indigo-400">Sugestão de Preenchimento Automático</span>
                                <span className="text-[9px] text-zinc-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Lançamento anterior</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 truncate">
                                <strong>{activeMatch.description}</strong>
                                {activeMatch.value ? ` • ${formatCurrency(activeMatch.value)}` : ''}
                                {matchCat ? ` • ${matchCat.name}` : ''}
                                {activeMatch.subcategory ? ` › ${activeMatch.subcategory}` : ''}
                                {matchAcc ? ` • ${matchAcc.name}` : ''}
                                {txType === 'entrada' && activeMatch.recebidoDe ? ` • Recebido de: ${activeMatch.recebidoDe}` : ''}
                                {txType === 'saida' && activeMatch.vaiPagarQuem ? ` • Favorecido: ${activeMatch.vaiPagarQuem}` : ''}
                                {activeMatch.formaPagamento ? ` • ${activeMatch.formaPagamento}` : ''}
                              </p>
                              <p className="text-[9px] text-zinc-500">
                                ℹ️ Preenche quem pagou/recebeu, categoria, subcategoria, valor, forma de pgto e banco. Data, status e parcelamento permanecem sem alteração.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => applySmartAutoFill(activeMatch)}
                              className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>✨ Preencher Dados</span>
                            </button>
                          </div>
                        );
                      })()}

                      {/* Auto-fill/Suggestions Dropdown */}
                      {showSuggestions && (
                        (() => {
                          const allTypeTxs = transactions.filter(t => t.type === txType);
                          const uniqueDescs = Array.from(new Set<string>(allTypeTxs.map(t => t.description)));
                          const term = txDescription.trim().toLowerCase();
                          const matches = term.length > 0
                            ? uniqueDescs.filter(desc => desc.toLowerCase().includes(term))
                            : uniqueDescs.slice(0, 6);

                          if (matches.length === 0) return null;

                          return (
                            <div className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border shadow-2xl backdrop-blur-md ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}>
                              <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/10 flex justify-between items-center bg-zinc-900/40">
                                <span>Lançamentos anteriores (Memória Inteligente)</span>
                                <span className="text-[8px] text-indigo-400 font-semibold">Clique para autocompletar</span>
                              </div>
                              {matches.map((desc, idx) => {
                                const match = [...transactions]
                                  .reverse()
                                  .find(t => t.type === txType && t.description.toLowerCase() === desc.toLowerCase());
                                const cat = match ? categories.find(c => c.id === match.categoryId) : null;
                                const acc = match ? accounts.find(a => a.id === match.accountId) : null;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      if (match) {
                                        applySmartAutoFill(match);
                                      } else {
                                        setTxDescription(desc);
                                        setShowSuggestions(false);
                                      }
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-indigo-600/10 hover:text-indigo-400 font-medium cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${
                                      isHighContrast ? 'border-zinc-100 text-zinc-800' : 'border-zinc-900 text-zinc-300'
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1 mr-3">
                                      <p className="font-semibold text-xs truncate">{desc}</p>
                                      {(cat || acc || (match && (match.recebidoDe || match.vaiPagarQuem))) && (
                                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                          {cat?.name}{match?.subcategory ? ` › ${match.subcategory}` : ''}{acc ? ` • ${acc.name}` : ''}
                                          {match?.recebidoDe ? ` • ${match.recebidoDe}` : ''}
                                          {match?.vaiPagarQuem ? ` • ${match.vaiPagarQuem}` : ''}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0 flex items-center gap-2">
                                      {match && (
                                        <span className={`font-mono text-[11px] font-bold ${
                                          txType === 'entrada' ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                          {formatCurrency(match.value)}
                                        </span>
                                      )}
                                      <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">
                                        Preencher
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()
                      )}

                      {/* Quick Memory Pills */}
                      {(() => {
                        const quickChips = Array.from(new Set<string>(
                          transactions.filter(t => t.type === txType).map(t => t.description)
                        )).slice(0, 4);

                        if (quickChips.length === 0) return null;

                        return (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Memória Rápida:</span>
                            {quickChips.map((chip, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const match = [...transactions].reverse().find(t => t.type === txType && t.description.toLowerCase() === chip.toLowerCase());
                                  if (match) {
                                    applySmartAutoFill(match);
                                  } else {
                                    setTxDescription(chip);
                                    setShowSuggestions(false);
                                  }
                                }}
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer truncate max-w-[180px] ${
                                  isHighContrast
                                    ? 'bg-zinc-100 hover:bg-indigo-50 hover:border-indigo-300 text-zinc-700 hover:text-indigo-600 border-zinc-200'
                                    : 'bg-zinc-900/60 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-zinc-400 hover:text-indigo-300 border-zinc-800'
                                }`}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Conditional fields based on Flow Type (Entrada vs Despesa) */}
                    {txType === 'entrada' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* ENTRADA - RECEBIDO (SIM/NAO) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recebido? *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setTxRecebido('sim')}
                              className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                txRecebido === 'sim'
                                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-500'
                                  : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setTxRecebido('nao')}
                              className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                txRecebido === 'nao'
                                  ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                                  : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                              }`}
                            >
                              Não
                            </button>
                          </div>
                        </div>

                        {/* ENTRADA - RECEBIDO DE */}
                        <div className="space-y-1 sm:col-span-2 relative">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                              <Users size={11} className="text-emerald-500" />
                              <span>Recebido de (Doador / Pagador) *</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenAddEntityModal(txRecebidoDe, 'pagador')}
                                className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 cursor-pointer transition-colors flex items-center gap-1"
                                title="Cadastrar novo pagador com dados completos"
                              >
                                <UserPlus size={10} />
                                <span>+ Novo Pagador</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEntityFilterType('pagador');
                                  setShowEntitiesManagerModal(true);
                                }}
                                className="text-[9px] text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors underline"
                                title="Ver todos os pagadores e favorecidos cadastrados"
                              >
                                Ver todos ({financialEntities.filter(e => e.type === 'pagador' || e.type === 'ambos').length})
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={txRecebidoDe}
                              onChange={(e) => {
                                setTxRecebidoDe(e.target.value);
                                setShowEntitySuggestions(true);
                              }}
                              onFocus={() => setShowEntitySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowEntitySuggestions(false), 250)}
                              placeholder="Digite ou escolha quem está pagando (ex: Nome do membro, doador)..."
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            {txRecebidoDe && (
                              <button
                                type="button"
                                onClick={() => setTxRecebidoDe('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer p-0.5"
                                title="Limpar campo"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Quick Save Prompt if typed name is not yet in financialEntities */}
                          {txRecebidoDe.trim().length >= 2 && !financialEntities.some(e => e.name.toLowerCase() === txRecebidoDe.trim().toLowerCase()) && (
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span className="text-[9.5px] text-zinc-400 italic truncate">
                                Nome novo: "{txRecebidoDe.trim()}"
                              </span>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleQuickSaveCurrentEntity();
                                }}
                                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0 active:scale-95"
                                title="Salvar para que este nome apareça automaticamente nas próximas transações"
                              >
                                <BookmarkPlus size={10} />
                                <span>Salvar nos Cadastros Rápidos</span>
                              </button>
                            </div>
                          )}

                          {/* Toast feedback after quick save */}
                          {entityQuickSuccessMsg && (
                            <div className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn mt-1">
                              <CheckCircle2 size={11} className="shrink-0" />
                              <span>{entityQuickSuccessMsg}</span>
                            </div>
                          )}

                          {/* Autocomplete dropdown for Payers */}
                          {showEntitySuggestions && (() => {
                            const availablePayers = financialEntities.filter(e => e.type === 'pagador' || e.type === 'ambos');
                            const term = txRecebidoDe.trim().toLowerCase();
                            const matches = term.length > 0
                              ? availablePayers.filter(e => e.name.toLowerCase().includes(term) || (e.document && e.document.includes(term)))
                              : availablePayers.slice(0, 7);

                            if (matches.length === 0 && term.length === 0) return null;

                            return (
                              <div className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border shadow-2xl backdrop-blur-md ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}>
                                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/20 flex justify-between items-center bg-zinc-900/50">
                                  <span>Pagadores & Doadores Cadastrados</span>
                                  <span className="text-[8px] text-emerald-400 font-bold">Clique para selecionar</span>
                                </div>
                                {matches.length === 0 ? (
                                  <div className="p-3 text-center space-y-1.5">
                                    <p className="text-[11px] text-zinc-400">Nenhum pagador cadastrado com "{txRecebidoDe}".</p>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleOpenAddEntityModal(txRecebidoDe, 'pagador');
                                      }}
                                      className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                                    >
                                      <UserPlus size={11} /> + Cadastrar "{txRecebidoDe}" agora
                                    </button>
                                  </div>
                                ) : (
                                  matches.map((ent) => {
                                    const catObj = categories.find(c => c.id === ent.category);
                                    const accObj = accounts.find(a => a.id === ent.defaultAccountId);

                                    return (
                                      <button
                                        key={ent.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleSelectEntity(ent);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-600/10 hover:text-emerald-400 font-medium cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${
                                          isHighContrast ? 'border-zinc-100 text-zinc-800' : 'border-zinc-900 text-zinc-200'
                                        }`}
                                      >
                                        <div className="min-w-0 flex-1 mr-2">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-xs truncate">{ent.name}</span>
                                            {ent.document && (
                                              <span className="text-[9px] text-zinc-500 font-mono">({ent.document})</span>
                                            )}
                                          </div>
                                          {(catObj || accObj || ent.defaultPaymentMethod) && (
                                            <p className="text-[9.5px] text-zinc-500 truncate mt-0.5">
                                              {catObj ? `Cat: ${catObj.name}` : ''}
                                              {ent.subcategory ? ` › ${ent.subcategory}` : ''}
                                              {accObj ? ` • ${accObj.name}` : ''}
                                              {ent.defaultPaymentMethod ? ` • ${ent.defaultPaymentMethod.toUpperCase()}` : ''}
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                          Selecionar
                                        </span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            );
                          })()}

                          {/* Quick chips of frequent payers */}
                          {(() => {
                            const topPayers = financialEntities
                              .filter(e => e.type === 'pagador' || e.type === 'ambos')
                              .slice(0, 4);

                            if (topPayers.length === 0) return null;

                            return (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">Frequentes:</span>
                                {topPayers.map((payer) => (
                                  <button
                                    key={payer.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectEntity(payer);
                                    }}
                                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer truncate max-w-[170px] ${
                                      txRecebidoDe.toLowerCase() === payer.name.toLowerCase()
                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold'
                                        : isHighContrast
                                        ? 'bg-zinc-100 hover:bg-emerald-50 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 border-zinc-200'
                                        : 'bg-zinc-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-300 border-zinc-800'
                                    }`}
                                    title={`Preencher como ${payer.name}`}
                                  >
                                    {payer.name}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* DESPESA - PAGO (SIM/NAO) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pago? *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setTxPago('sim')}
                              className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                txPago === 'sim'
                                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-500'
                                  : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setTxPago('nao')}
                              className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                txPago === 'nao'
                                  ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                                  : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                              }`}
                            >
                              Não
                            </button>
                          </div>
                        </div>

                        {/* DESPESA - VAI PAGAR QUEM */}
                        <div className="space-y-1 sm:col-span-2 relative">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                              <Building2 size={11} className="text-red-500" />
                              <span>Vai pagar quem? (Favorecido / Fornecedor) *</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenAddEntityModal(txVaiPagarQuem, 'recebedor')}
                                className="text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded border border-red-500/20 cursor-pointer transition-colors flex items-center gap-1"
                                title="Cadastrar novo favorecido ou fornecedor com dados completos"
                              >
                                <UserPlus size={10} />
                                <span>+ Novo Favorecido</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEntityFilterType('recebedor');
                                  setShowEntitiesManagerModal(true);
                                }}
                                className="text-[9px] text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors underline"
                                title="Ver todos os favorecidos e pagadores cadastrados"
                              >
                                Ver todos ({financialEntities.filter(e => e.type === 'recebedor' || e.type === 'ambos').length})
                              </button>
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={txVaiPagarQuem}
                              onChange={(e) => {
                                setTxVaiPagarQuem(e.target.value);
                                setShowEntitySuggestions(true);
                              }}
                              onFocus={() => setShowEntitySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowEntitySuggestions(false), 250)}
                              placeholder="Digite ou escolha quem irá receber (ex: CPFL, SAEP, Pastor, Fornecedor)..."
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            {txVaiPagarQuem && (
                              <button
                                type="button"
                                onClick={() => setTxVaiPagarQuem('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer p-0.5"
                                title="Limpar campo"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Quick Save Prompt if typed name is not yet in financialEntities */}
                          {txVaiPagarQuem.trim().length >= 2 && !financialEntities.some(e => e.name.toLowerCase() === txVaiPagarQuem.trim().toLowerCase()) && (
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span className="text-[9.5px] text-zinc-400 italic truncate">
                                Nome novo: "{txVaiPagarQuem.trim()}"
                              </span>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleQuickSaveCurrentEntity();
                                }}
                                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0 active:scale-95"
                                title="Salvar para que este favorecido apareça automaticamente nas próximas transações"
                              >
                                <BookmarkPlus size={10} />
                                <span>Salvar nos Cadastros Rápidos</span>
                              </button>
                            </div>
                          )}

                          {/* Toast feedback after quick save */}
                          {entityQuickSuccessMsg && (
                            <div className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn mt-1">
                              <CheckCircle2 size={11} className="shrink-0" />
                              <span>{entityQuickSuccessMsg}</span>
                            </div>
                          )}

                          {/* Autocomplete dropdown for Payees / Beneficiaries */}
                          {showEntitySuggestions && (() => {
                            const availablePayees = financialEntities.filter(e => e.type === 'recebedor' || e.type === 'ambos');
                            const term = txVaiPagarQuem.trim().toLowerCase();
                            const matches = term.length > 0
                              ? availablePayees.filter(e => e.name.toLowerCase().includes(term) || (e.document && e.document.includes(term)))
                              : availablePayees.slice(0, 7);

                            if (matches.length === 0 && term.length === 0) return null;

                            return (
                              <div className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border shadow-2xl backdrop-blur-md ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}>
                                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/20 flex justify-between items-center bg-zinc-900/50">
                                  <span>Favorecidos & Fornecedores Cadastrados</span>
                                  <span className="text-[8px] text-red-400 font-bold">Clique para selecionar</span>
                                </div>
                                {matches.length === 0 ? (
                                  <div className="p-3 text-center space-y-1.5">
                                    <p className="text-[11px] text-zinc-400">Nenhum favorecido cadastrado com "{txVaiPagarQuem}".</p>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleOpenAddEntityModal(txVaiPagarQuem, 'recebedor');
                                      }}
                                      className="text-xs font-bold text-red-400 hover:underline inline-flex items-center gap-1"
                                    >
                                      <UserPlus size={11} /> + Cadastrar "{txVaiPagarQuem}" agora
                                    </button>
                                  </div>
                                ) : (
                                  matches.map((ent) => {
                                    const catObj = categories.find(c => c.id === ent.category);
                                    const accObj = accounts.find(a => a.id === ent.defaultAccountId);

                                    return (
                                      <button
                                        key={ent.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleSelectEntity(ent);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-red-600/10 hover:text-red-400 font-medium cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${
                                          isHighContrast ? 'border-zinc-100 text-zinc-800' : 'border-zinc-900 text-zinc-200'
                                        }`}
                                      >
                                        <div className="min-w-0 flex-1 mr-2">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-xs truncate">{ent.name}</span>
                                            {ent.document && (
                                              <span className="text-[9px] text-zinc-500 font-mono">({ent.document})</span>
                                            )}
                                          </div>
                                          {(catObj || accObj || ent.defaultPaymentMethod) && (
                                            <p className="text-[9.5px] text-zinc-500 truncate mt-0.5">
                                              {catObj ? `Cat: ${catObj.name}` : ''}
                                              {ent.subcategory ? ` › ${ent.subcategory}` : ''}
                                              {accObj ? ` • ${accObj.name}` : ''}
                                              {ent.defaultPaymentMethod ? ` • ${ent.defaultPaymentMethod.toUpperCase()}` : ''}
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-[8.5px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 shrink-0">
                                          Selecionar
                                        </span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            );
                          })()}

                          {/* Quick chips of frequent payees */}
                          {(() => {
                            const topPayees = financialEntities
                              .filter(e => e.type === 'recebedor' || e.type === 'ambos')
                              .slice(0, 4);

                            if (topPayees.length === 0) return null;

                            return (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">Frequentes:</span>
                                {topPayees.map((payee) => (
                                  <button
                                    key={payee.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectEntity(payee);
                                    }}
                                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer truncate max-w-[170px] ${
                                      txVaiPagarQuem.toLowerCase() === payee.name.toLowerCase()
                                        ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                                        : isHighContrast
                                        ? 'bg-zinc-100 hover:bg-red-50 hover:border-red-300 text-zinc-700 hover:text-red-700 border-zinc-200'
                                        : 'bg-zinc-900/60 hover:bg-red-500/10 hover:border-red-500/40 text-zinc-400 hover:text-red-300 border-zinc-800'
                                    }`}
                                    title={`Preencher como ${payee.name}`}
                                  >
                                    {payee.name}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* VALOR & FORMA DE PAGAMENTO */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* COMMON - VALOR */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0.01"
                          value={txValue}
                          onChange={(e) => setTxValue(e.target.value)}
                          placeholder="0,00"
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>

                      {/* COMMON - FORMA DE PAGAMENTO */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Forma de Pagamento *</label>
                        <select
                          required
                          value={txFormaPagamento}
                          onChange={(e: any) => setTxFormaPagamento(e.target.value)}
                          className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <option value="pix">Pix</option>
                          <option value="boleto">Boleto</option>
                          <option value="cartão">Cartão de Crédito / Débito</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="débito automático">Débito Automático</option>
                          <option value="transferência">Transferência</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>

                      {/* SELEÇÃO DO CARTÃO QUANDO FOR CARTÃO */}
                      {txFormaPagamento === 'cartão' && creditCards.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Cartão de Crédito Utilizado</label>
                          <select
                            value={txCreditCardId}
                            onChange={(e) => setTxCreditCardId(e.target.value)}
                            className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                              isHighContrast ? 'bg-indigo-50/60 border-indigo-200 text-zinc-900' : 'bg-indigo-950/20 border-indigo-800/60 text-zinc-200'
                            }`}
                          >
                            <option value="">Selecione o Cartão...</option>
                            {creditCards.map(card => (
                              <option key={card.id} value={card.id}>
                                {card.name} (•••• {card.lastFourDigits}) - {card.bankName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* COMMON - BANCO */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Banco / Conta *</label>
                      <select
                        required
                        value={txAccountId}
                        onChange={(e) => setTxAccountId(e.target.value)}
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        <option value="">Selecione...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.currentBalance)})</option>
                        ))}
                      </select>
                    </div>

                    {/* COMMON - OBSERVACOES */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Observações / Detalhes</label>
                      <textarea
                        value={txObservation}
                        onChange={(e) => setTxObservation(e.target.value)}
                        placeholder="Escreva detalhes adicionais..."
                        rows={2}
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        }`}
                      />
                    </div>

                    {/* COMMON - DIGITALIZAR RECIBO / COMPROVANTE */}
                    <div className="space-y-2 border-t border-zinc-800/10 pt-3 mt-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Comprovante / Recibo</label>
                      
                      {!txReceiptImage && !cameraActive && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                              isHighContrast 
                                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-850' 
                                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-indigo-400'
                            }`}
                          >
                            <Camera size={13} />
                            Digitalizar Recibo
                          </button>
                          
                          <label
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-center ${
                              isHighContrast 
                                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-850' 
                                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-350'
                            }`}
                          >
                            <Upload size={13} />
                            Anexar Arquivo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {cameraActive && (
                        <div className={`p-3 rounded-xl border space-y-2 flex flex-col items-center ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                        }`}>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {cameraError && (
                            <p className="text-[10px] font-medium text-red-500 text-center">{cameraError}</p>
                          )}
                          <div className="flex gap-2 w-full justify-center">
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Camera size={11} /> Capturar Foto
                            </button>
                          </div>
                        </div>
                      )}

                      {txReceiptImage && (
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 relative cursor-pointer" onClick={() => setSelectedReceiptImage(txReceiptImage)}>
                              <img src={txReceiptImage} alt="Preview do Recibo" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                <Eye size={12} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <Check size={11} /> Recibo Anexado
                              </span>
                              <p className="text-[9px] text-zinc-500">Clique na miniatura para ampliar</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptImage(txReceiptImage)}
                              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                                isHighContrast 
                                  ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-600' 
                                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-indigo-400'
                              }`}
                              title="Visualizar ampliado"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTxReceiptImage(null)}
                              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                                isHighContrast 
                                  ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-red-600' 
                                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-red-500'
                              }`}
                              title="Remover recibo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Date, Category, Subcategory, Installments */}
                  <div className="space-y-4">
                    {/* CONDITIONAL DATES */}
                    <div className="grid grid-cols-2 gap-3">
                      {txType === 'entrada' ? (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data Recebido</label>
                            <input
                              type="date"
                              required={txRecebido === 'sim'}
                              disabled={txRecebido === 'nao'}
                              value={txDataRecebido}
                              onChange={(e) => setTxDataRecebido(e.target.value)}
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              } disabled:opacity-40`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data Lançamento *</label>
                            <input
                              type="date"
                              required
                              value={txDataLancamento}
                              onChange={(e) => setTxDataLancamento(e.target.value)}
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data Vencimento *</label>
                            <input
                              type="date"
                              required
                              value={txDataVencimento}
                              onChange={(e) => setTxDataVencimento(e.target.value)}
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data Lançamento *</label>
                            <input
                              type="date"
                              required
                              value={txDataLancamento}
                              onChange={(e) => setTxDataLancamento(e.target.value)}
                              className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* COMMON - CATEGORIA WITH INLINE OPTION TO CREATE CATEGORY */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowInlineCategory(!showInlineCategory);
                            setShowInlineSubcategory(false);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Criar Categoria
                        </button>
                      </div>
                      
                      <select
                        required
                        value={txCategoryId}
                        onChange={(e) => {
                          setTxCategoryId(e.target.value);
                          setTxSubcategory('');
                          setShowInlineSubcategory(false);
                        }}
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        <option value="">Selecione...</option>
                        {categories
                          .filter(c => c.type === 'ambas' || c.type === txType)
                          .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>

                      {/* Inline Category Creation Drawer/Input */}
                      {showInlineCategory && (
                        <div className={`mt-2 p-3.5 rounded-xl border space-y-3 ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Nova Categoria de {txType === 'entrada' ? 'Receita' : 'Despesa'}</span>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Nome da categoria (ex: Ofertas Especiais)"
                              value={inlineCategoryName}
                              onChange={(e) => setInlineCategoryName(e.target.value)}
                              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            <input
                              type="text"
                              placeholder="Subcategorias (opcional, separadas por vírgula)"
                              value={inlineCategorySubcategories}
                              onChange={(e) => setInlineCategorySubcategories(e.target.value)}
                              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => { setShowInlineCategory(false); setInlineCategoryName(''); setInlineCategorySubcategories(''); }}
                                className="px-2.5 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] cursor-pointer hover:bg-zinc-700"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleCreateInlineCategory}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Criar Categoria
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SUBCATEGORY DROPDOWN - ALWAYS VISIBLE BELOW CATEGORY */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subcategoria</label>
                        {txCategoryId && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowInlineSubcategory(!showInlineSubcategory);
                              setShowInlineCategory(false);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Criar Subcategoria
                          </button>
                        )}
                      </div>
                      
                      <select
                        value={txSubcategory}
                        onChange={(e) => setTxSubcategory(e.target.value)}
                        disabled={!txCategoryId}
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                        } disabled:opacity-50`}
                      >
                        <option value="">Nenhuma</option>
                        {categories.find(c => c.id === txCategoryId)?.subcategories?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>

                      {/* Inline Subcategory Creation Input */}
                      {showInlineSubcategory && txCategoryId && (
                        <div className={`mt-2 p-3 rounded-xl border space-y-2 ${
                          isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                        }`}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Nova Subcategoria</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Ex: Culto Dominical, Sede"
                              value={inlineSubcategoryName}
                              onChange={(e) => setInlineSubcategoryName(e.target.value)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!inlineSubcategoryName.trim()) return;
                                const newSub = inlineSubcategoryName.trim();
                                setCategories(categories.map(c => {
                                  if (c.id === txCategoryId) {
                                    const subs = c.subcategories || [];
                                    if (!subs.includes(newSub)) {
                                      return { ...c, subcategories: [...subs, newSub] };
                                    }
                                  }
                                  return c;
                                }));
                                setTxSubcategory(newSub);
                                setInlineSubcategoryName('');
                                setShowInlineSubcategory(false);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowInlineSubcategory(false); setInlineSubcategoryName(''); }}
                              className="px-2 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] cursor-pointer hover:bg-zinc-700"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* COMMON - PARCELAMENTO */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Parcelamento *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['nao', 'sim', 'recorrente'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTxParcelamento(mode)}
                            className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border capitalize ${
                              txParcelamento === mode
                                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold'
                                : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                            }`}
                          >
                            {mode === 'nao' ? 'Não' : mode === 'sim' ? 'Sim' : 'Recorrente'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PARCELAMENTO FREQUENCY & COUNT (ONLY FOR 'SIM') */}
                    {txParcelamento === 'sim' && (
                      <div className={`p-4 rounded-xl border space-y-3 ${
                        isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/40 border-zinc-850'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Frequência *</label>
                            <select
                              required
                              value={txFrequenciaParcelas}
                              onChange={(e: any) => setTxFrequenciaParcelas(e.target.value)}
                              className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              <option value="diario">Diário</option>
                              <option value="semanal">Semanal</option>
                              <option value="quinzenal">Quinzenal</option>
                              <option value="mensal">Mensal</option>
                              <option value="anual">Anual</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Parcela Atual</label>
                            <input
                              type="number"
                              min="1"
                              max={txNumeroParcelas || 1}
                              required
                              value={txParcelaAtual}
                              onChange={(e) => setTxParcelaAtual(e.target.value)}
                              placeholder="1"
                              className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total de Parcelas *</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={txNumeroParcelas}
                              onChange={(e) => setTxNumeroParcelas(e.target.value)}
                              placeholder="10"
                              className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Quick installment buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">Atalhos:</span>
                          {['2', '3', '6', '10', '12', '24'].map(pCount => (
                            <button
                              key={pCount}
                              type="button"
                              onClick={() => { setTxNumeroParcelas(pCount); setTxParcelaAtual('1'); }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                txNumeroParcelas === pCount
                                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                                  : isHighContrast ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                              }`}
                            >
                              {pCount}x
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 text-indigo-400 font-semibold border-t border-zinc-800/40">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Exibição na Tabela:</span>
                          <span className="bg-indigo-500/15 px-2.5 py-0.5 rounded-md border border-indigo-500/30 font-mono text-xs font-bold text-indigo-400">
                            {txParcelaAtual || 1}/{txNumeroParcelas || 1} ({txFrequenciaParcelas || 'mensal'})
                          </span>
                        </div>

                        {parseInt(txNumeroParcelas) > 1 && (
                          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 flex items-start gap-1.5">
                            <span className="text-xs shrink-0">⚡</span>
                            <span>
                              Ao salvar, o sistema criará automaticamente <strong>{Math.max(1, parseInt(txNumeroParcelas) - (parseInt(txParcelaAtual) || 1) + 1)} lançamentos</strong> nos meses seguintes ({txFrequenciaParcelas || 'mensal'}) com as datas calculadas e status pendente para as parcelas futuras.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RECORRÊNCIA FREQUENCY & DURATION (FOR 'RECORRENTE') */}
                    {txParcelamento === 'recorrente' && (
                      <div className={`p-4 rounded-xl border space-y-3 ${
                        isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/40 border-zinc-850'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Periodicidade *</label>
                            <select
                              required
                              value={txFrequenciaParcelas || 'mensal'}
                              onChange={(e: any) => setTxFrequenciaParcelas(e.target.value)}
                              className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              <option value="mensal">Mensal (todo mês)</option>
                              <option value="quinzenal">Quinzenal (a cada 15 dias)</option>
                              <option value="semanal">Semanal (toda semana)</option>
                              <option value="anual">Anual (uma vez ao ano)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gerar Lançamentos Para (Repetições) *</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="2"
                                max="120"
                                required
                                value={txNumeroParcelas === '1' || !txNumeroParcelas ? '12' : txNumeroParcelas}
                                onChange={(e) => setTxNumeroParcelas(e.target.value)}
                                placeholder="12"
                                className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                                  isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                                }`}
                              />
                              <span className="text-[11px] text-zinc-400 font-medium shrink-0">
                                {txFrequenciaParcelas === 'anual' ? 'anos' : txFrequenciaParcelas === 'semanal' ? 'semanas' : txFrequenciaParcelas === 'quinzenal' ? 'quinzenas' : 'meses'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Period Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">Atalhos:</span>
                          {[
                            { label: '6 Meses', val: '6' },
                            { label: '12 Meses (1 Ano)', val: '12' },
                            { label: '24 Meses (2 Anos)', val: '24' },
                            { label: '36 Meses (3 Anos)', val: '36' },
                          ].map(item => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => setTxNumeroParcelas(item.val)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                (txNumeroParcelas === item.val || (!txNumeroParcelas && item.val === '12'))
                                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                                  : isHighContrast ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 flex items-start gap-2">
                          <span className="text-xs shrink-0">⚡</span>
                          <span>
                            Ao salvar, o sistema criará automaticamente <strong>{parseInt(txNumeroParcelas) || 12} lançamentos</strong> nos meses subsequentes ({txFrequenciaParcelas || 'mensal'}) com as datas projetadas. O 1º lançamento receberá o status informado e os futuros ficarão <strong>pendentes</strong> para acompanhamento no fluxo de caixa e no filtro mensal.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS (SAVE & CONTINUE AND SAVE & EXIT) */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/20">
                  <button
                    type="submit"
                    onClick={() => setCloseOnSave(false)}
                    className={`py-3 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                      isHighContrast
                        ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    Salvar e Continuar
                  </button>
                  <button
                    type="submit"
                    onClick={() => setCloseOnSave(true)}
                    className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow"
                  >
                    {editingTx ? 'Salvar Alterações' : 'Salvar e Sair'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Credit Card (Create / Edit) */}
        {showCardModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCardModal(false);
              resetCardForm();
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-left max-h-[92vh] flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20 shrink-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {editingCard ? 'Editar Cartão de Crédito' : 'Cadastrar Novo Cartão de Crédito'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setShowCardModal(false);
                    resetCardForm();
                  }} 
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="p-6 space-y-4 overflow-y-auto scrollbar-thin">
                {/* Real-time Card Visual Preview */}
                {(() => {
                  const isLight = !cardImage && isLightCardColor(cardColor);
                  return (
                    <div 
                      className={`w-full aspect-[2.2/1] rounded-xl relative p-4 overflow-hidden shadow-xl flex flex-col justify-between border select-none ${
                        isLight ? 'border-zinc-300 shadow-xl' : 'border-white/10'
                      }`}
                      style={
                        !cardImage && (cardColor?.startsWith('#') || isLight)
                          ? { backgroundColor: cardColor || '#ffffff' }
                          : undefined
                      }
                    >
                      {cardImage ? (
                        <div className="absolute inset-0 z-0">
                          <img src={cardImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
                        </div>
                      ) : cardColor?.startsWith('#') || isLight ? (
                        <div className="absolute inset-0 z-0" style={{ backgroundColor: cardColor || '#ffffff' }}>
                          <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full border ${isLight ? 'border-zinc-900/10' : 'border-white/10'}`} />
                          <div className={`absolute -left-8 -bottom-8 w-36 h-36 rounded-full border ${isLight ? 'border-zinc-900/10' : 'border-white/10'}`} />
                        </div>
                      ) : (
                        <div className={`absolute inset-0 z-0 ${
                          cardColor?.startsWith('from-') 
                            ? `bg-gradient-to-br ${cardColor}` 
                            : cardColor?.startsWith('bg-')
                              ? cardColor
                              : 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-black'
                        }`}>
                          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/10" />
                          <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full border border-white/10" />
                        </div>
                      )}

                      <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-400 to-yellow-500 border border-amber-600/40 shadow-inner" />
                          <Wifi size={14} className={`rotate-90 ${isLight ? 'text-zinc-800' : 'text-white/70'}`} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border truncate max-w-[120px] ${
                          isLight 
                            ? 'text-zinc-900 bg-zinc-100 border-zinc-300 shadow-xs' 
                            : 'text-white bg-black/40 border-white/10'
                        }`}>
                          {cardBankName || 'Nome do Banco'}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <p className={`font-mono text-sm tracking-widest font-black ${
                          isLight ? 'text-zinc-950' : 'text-white drop-shadow'
                        }`}>
                          ••••  ••••  ••••  {cardLastFourDigits.replace(/\D/g, '').slice(-4) || '0000'}
                        </p>
                      </div>

                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className={`text-[7px] uppercase tracking-wider font-bold ${
                            isLight ? 'text-zinc-500' : 'text-zinc-400'
                          }`}>Titular</p>
                          <p className={`text-[10px] font-black uppercase truncate max-w-[180px] font-mono ${
                            isLight ? 'text-zinc-950' : 'text-white'
                          }`}>
                            {cardCardholderName || 'MINISTÉRIO NOVA VIDA'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold font-mono ${
                            isLight ? 'text-zinc-600' : 'text-zinc-300'
                          }`}>F:{cardClosingDay || 20} V:{cardDueDay || 28}</span>
                          <CreditCardBrandLogo brand={cardBrand} size={24} isLight={isLight} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Cartão *</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Ex: Nubank PJ Ultravioleta"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Banco Emissor *</label>
                    <input
                      type="text"
                      required
                      value={cardBankName}
                      onChange={(e) => setCardBankName(e.target.value)}
                      placeholder="Ex: Nubank, Itaú, Bradesco"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">4 Últimos Dígitos *</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={cardLastFourDigits}
                      onChange={(e) => setCardLastFourDigits(e.target.value.replace(/\D/g, ''))}
                      placeholder="8842"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bandeira *</label>
                    <select
                      value={cardBrand}
                      onChange={(e: any) => setCardBrand(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="mastercard">Mastercard</option>
                      <option value="visa">Visa</option>
                      <option value="elo">Elo</option>
                      <option value="amex">American Express</option>
                      <option value="hipercard">Hipercard</option>
                      <option value="outro">Outra</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</label>
                    <select
                      value={cardStatus}
                      onChange={(e: any) => setCardStatus(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="active">Ativo / Habilitado</option>
                      <option value="blocked">Bloqueado</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Titular Impresso</label>
                    <input
                      type="text"
                      value={cardCardholderName}
                      onChange={(e) => setCardCardholderName(e.target.value)}
                      placeholder="MINISTÉRIO NOVA VIDA"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium uppercase ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Conta Bancária de Débito (Opcional)</label>
                    <select
                      value={cardBankAccountId}
                      onChange={(e) => setCardBankAccountId(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Nenhuma conta vinculada</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Limite Total (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={cardLimit}
                      onChange={(e) => setCardLimit(e.target.value)}
                      placeholder="15000"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fatura Atual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cardUsedLimit}
                      onChange={(e) => setCardUsedLimit(e.target.value)}
                      placeholder="0"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dia Fechamento *</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={cardClosingDay}
                      onChange={(e) => setCardClosingDay(e.target.value)}
                      placeholder="20"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dia Vencimento *</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={cardDueDay}
                      onChange={(e) => setCardDueDay(e.target.value)}
                      placeholder="28"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                {/* IMAGEM DO CARTÃO (UPLOAD DE FOTO OU ARTE) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Imagem / Foto do Cartão</span>
                    <span className="text-indigo-400 font-normal text-[9px] lowercase">foto do cartão físico ou arte personalizada</span>
                  </label>
                  
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg border border-zinc-700/60 overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                        {cardImage ? (
                          <img src={cardImage} alt="Preview do Cartão" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-zinc-500" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCardImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-[10px] text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cardImage}
                          onChange={(e) => setCardImage(e.target.value)}
                          placeholder="Ou insira a URL da imagem do cartão..."
                          className={`w-full text-[10px] px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>

                      {cardImage && (
                        <button
                          type="button"
                          onClick={() => setCardImage('')}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Color Theme Presets & Solid / Gradient Customizer */}
                {!cardImage && (
                  <div className="space-y-3 pt-1 border-t border-zinc-800/40">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Cores & Estilos do Cartão
                      </label>
                      <span className="text-[9px] font-mono text-indigo-400">
                        {cardColor?.startsWith('#') ? 'Cor Sólida (Sem Gradiente)' : 'Gradiente'}
                      </span>
                    </div>

                    {/* Gradient Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        Gradientes Modernos
                      </span>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                        {[
                          { label: 'Black Ônix', color: 'from-zinc-950 via-neutral-900 to-black' },
                          { label: 'Roxo Ultravioleta', color: 'from-purple-950 via-indigo-950 to-zinc-950' },
                          { label: 'Azul Real', color: 'from-blue-950 via-indigo-950 to-slate-950' },
                          { label: 'Ruby Elegance', color: 'from-rose-950 via-red-950 to-zinc-950' },
                          { label: 'Esmeralda Nobre', color: 'from-emerald-950 via-teal-950 to-zinc-950' },
                          { label: 'Ouro Imperial', color: 'from-amber-900 via-yellow-950 to-zinc-950' },
                          { label: 'Titânio / Grafite', color: 'from-slate-800 via-zinc-900 to-black' },
                          { label: 'Cyber Neon', color: 'from-cyan-900 via-blue-900 to-purple-950' },
                          { label: 'Sunset Coral', color: 'from-orange-900 via-rose-900 to-zinc-950' },
                          { label: 'Midnight Ocean', color: 'from-slate-900 via-sky-950 to-zinc-950' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCardColor(preset.color)}
                            className={`h-7 rounded-lg bg-gradient-to-br ${preset.color} border transition-all cursor-pointer relative ${
                              cardColor === preset.color ? 'ring-2 ring-indigo-500 border-white scale-105' : 'border-zinc-700/60 hover:border-zinc-500'
                            }`}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Solid Colors (Sem Gradiente) & Color Picker */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                          Cores Sólidas (Sem Gradiente)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[9px] font-bold text-zinc-500 cursor-pointer">
                            Cor Livre (Hex):
                          </label>
                          <input 
                            type="color"
                            value={cardColor.startsWith('#') ? cardColor : '#09090b'}
                            onChange={(e) => setCardColor(e.target.value)}
                            className="w-5 h-5 rounded-md border border-white/20 cursor-pointer bg-transparent"
                            title="Seletor de cor personalizada"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
                        {[
                          { label: 'Branco Puro', hex: '#ffffff' },
                          { label: 'Branco Gelo', hex: '#f4f4f5' },
                          { label: 'Cinza Platina', hex: '#e2e8f0' },
                          { label: 'Preto Absoluto', hex: '#09090b' },
                          { label: 'Grafite Escuro', hex: '#18181b' },
                          { label: 'Cinza Titânio', hex: '#27272a' },
                          { label: 'Azul Noturno', hex: '#0f172a' },
                          { label: 'Roxo Imperial', hex: '#3b0764' },
                          { label: 'Verde Floresta', hex: '#064e3b' },
                          { label: 'Vinho Tinto', hex: '#4c0519' },
                          { label: 'Bronze / Âmbar', hex: '#451a03' },
                          { label: 'Azul Cobalto', hex: '#1e3a8a' },
                        ].map((solid, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCardColor(solid.hex)}
                            className={`h-7 rounded-lg border transition-all cursor-pointer relative ${
                              cardColor === solid.hex ? 'ring-2 ring-indigo-500 border-white scale-105' : 'border-zinc-700/60 hover:border-zinc-500'
                            }`}
                            style={{ backgroundColor: solid.hex }}
                            title={solid.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Observações / Notas</label>
                  <textarea
                    rows={2}
                    value={cardNotes}
                    onChange={(e) => setCardNotes(e.target.value)}
                    placeholder="Informações adicionais sobre o cartão corporativo..."
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg mt-2"
                >
                  {editingCard ? 'Salvar Alterações do Cartão' : 'Cadastrar Cartão de Crédito'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Full Size Card Image Preview */}
        {selectedCardPreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCardPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-950 flex flex-col"
            >
              <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <ImageIcon size={14} className="text-indigo-400" />
                  Visualização da Imagem do Cartão
                </span>
                <button
                  onClick={() => setSelectedCardPreviewImage(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-black/50 overflow-auto">
                <img
                  src={selectedCardPreviewImage}
                  alt="Foto do Cartão"
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg border border-zinc-800"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Account (Create / Edit) */}
        {showAccountModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowAccountModal(false);
              setEditingAccount(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20 shrink-0">
                <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  {editingAccount ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta Bancária'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAccountModal(false);
                    setEditingAccount(null);
                  }} 
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAccount} className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome Amigável *</label>
                  <input
                    type="text" required value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Ex: Caixa Tesouraria, Bradesco Geral"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                {/* TIPO DE CONTA (caixa físico, conta corrente, conta poupança, conta investimento) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex justify-between items-center">
                    <span>Tipo de Conta *</span>
                    <span className="text-[9px] lowercase font-normal text-zinc-400">escolha uma opção</span>
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as BankAccountType)}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <option value="caixa_fisico">Caixa Físico</option>
                    <option value="conta_corrente">Conta Corrente</option>
                    <option value="conta_poupanca">Conta Poupança</option>
                    <option value="conta_investimento">Conta Investimento</option>
                  </select>

                  {/* Atalhos rápidos para alternar em 1 clique */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { id: 'caixa_fisico', label: 'Caixa Físico' },
                      { id: 'conta_corrente', label: 'Conta Corrente' },
                      { id: 'conta_poupanca', label: 'Conta Poupança' },
                      { id: 'conta_investimento', label: 'Conta Investimento' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAccType(item.id as BankAccountType)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                          accType === item.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold shadow-sm'
                            : isHighContrast
                            ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-250 text-zinc-700'
                            : 'bg-zinc-950/60 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Banco *</label>
                  <input
                    type="text" required value={accBankName} onChange={(e) => setAccBankName(e.target.value)} placeholder="Ex: Dinheiro em Espécie, Banco Bradesco S.A."
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Agência</label>
                    <input
                      type="text" value={accAgency} onChange={(e) => setAccAgency(e.target.value)} placeholder="Ex: 0001"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {accType === 'caixa_fisico' ? 'Identificação / Número *' : 'Número da Conta *'}
                    </label>
                    <input
                      type="text" required value={accNumber} onChange={(e) => setAccNumber(e.target.value)} placeholder="Ex: 102030-4"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                {/* SALDO INICIAL E DATA DO SALDO INICIAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Saldo Inicial (R$) *</label>
                    <input
                      type="number" step="0.01" required value={accInitialBalance} onChange={(e) => setAccInitialBalance(e.target.value)} placeholder="0,00"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data do Saldo Inicial *</label>
                    <input
                      type="date"
                      required
                      value={accInitialBalanceDate}
                      onChange={(e) => setAccInitialBalanceDate(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-sans">Imagem com Moldura Redonda</label>
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="w-12 h-12 rounded-full border border-zinc-700/50 flex items-center justify-center shrink-0 bg-zinc-800 overflow-hidden relative">
                      {accImage ? (
                        <img src={accImage} alt="Preview Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={20} className="text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAccImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-[10px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accImage}
                        onChange={(e) => setAccImage(e.target.value)}
                        placeholder="Ou digite a URL da imagem..."
                        className={`w-full text-[10px] px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                        }`}
                      />
                    </div>
                    {accImage && (
                      <button
                        type="button"
                        onClick={() => setAccImage('')}
                        className="text-[10px] font-bold text-rose-500 hover:underline shrink-0"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow">
                  {editingAccount ? 'Salvar Alterações' : 'Salvar Conta Bancária'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: New / Edit Transfer */}
        {showTransferModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowTransferModal(false);
              setEditingTransfer(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-left ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20">
                <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  {editingTransfer ? 'Editar Transferência entre Contas' : 'Transferência entre Contas Bancárias'}
                </h3>
                <button 
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setEditingTransfer(null);
                  }} 
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddTransfer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Conta Origem (Despesa) *</label>
                    <select
                      required value={tfSourceId} onChange={(e) => setTfSourceId(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.currentBalance)})</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Conta Destino (Entrada) *</label>
                    <select
                      required value={tfDestId} onChange={(e) => setTfDestId(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatCurrency(acc.currentBalance)})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor (R$) *</label>
                    <input
                      type="number" step="0.01" required min="0.01" value={tfValue} onChange={(e) => setTfValue(e.target.value)} placeholder="0,00"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Data *</label>
                    <input
                      type="date" required value={tfDate} onChange={(e) => setTfDate(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Histórico / Descrição</label>
                    {transfers.some(tf => tf.observation && tf.observation.toLowerCase().trim() === tfObservation.toLowerCase().trim()) && (
                      <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-full">✨ Memória Ativa</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={tfObservation}
                    onChange={(e) => {
                      setTfObservation(e.target.value);
                      setShowTfSuggestions(true);
                    }}
                    onFocus={() => setShowTfSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTfSuggestions(false), 200)}
                    placeholder="Ex: Repasse de valores do caixa para fundo de poupança reformas"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />

                  {/* Dropdown Suggestions from previous transfers */}
                  {showTfSuggestions && (() => {
                    const defaultSuggestions = [
                      'Depósito de dinheiro do caixa em conta',
                      'Aporte poupança reformas',
                      'Transferência entre contas correntes',
                      'Repasse financeiro para fundo missionário',
                      'Cobertura de saldo de conta operacional'
                    ];

                    const pastObs = transfers
                      .map(tf => tf.observation?.trim())
                      .filter((obs): obs is string => Boolean(obs && obs.length > 0));

                    const allSuggestions = Array.from(new Set([...pastObs, ...defaultSuggestions]));
                    const term = tfObservation.trim().toLowerCase();
                    const filtered = term.length > 0
                      ? allSuggestions.filter(s => s.toLowerCase().includes(term))
                      : allSuggestions.slice(0, 6);

                    if (filtered.length === 0) return null;

                    return (
                      <div className={`absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl backdrop-blur-md ${
                        isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}>
                        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/10 flex justify-between items-center">
                          <span>Histórico de transferências anteriores</span>
                          <span className="text-[8px] text-indigo-400 font-semibold">Preenchimento rápido</span>
                        </div>
                        {filtered.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTfObservation(item);
                              setShowTfSuggestions(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs hover:bg-indigo-600/10 hover:text-indigo-400 font-medium cursor-pointer flex items-center justify-between border-b last:border-0 ${
                              isHighContrast ? 'border-zinc-100 text-zinc-800' : 'border-zinc-900 text-zinc-300'
                            }`}
                          >
                            <span className="truncate mr-2">{item}</span>
                            <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold shrink-0">Inserir</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Quick pills below field */}
                  {(() => {
                    const defaultSuggestions = [
                      'Depósito caixa em conta',
                      'Aporte poupança reformas',
                      'Transferência entre contas',
                      'Fundo missionário'
                    ];
                    const pastObs = transfers
                      .map(tf => tf.observation?.trim())
                      .filter((obs): obs is string => Boolean(obs && obs.length > 0));
                    const chips = Array.from(new Set([...pastObs, ...defaultSuggestions])).slice(0, 3);

                    return (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Memória Rápida:</span>
                        {chips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTfObservation(chip);
                              setShowTfSuggestions(false);
                            }}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer truncate max-w-[200px] ${
                              isHighContrast
                                ? 'bg-zinc-100 hover:bg-indigo-50 hover:border-indigo-300 text-zinc-700 hover:text-indigo-600 border-zinc-200'
                                : 'bg-zinc-900/60 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-zinc-400 hover:text-indigo-300 border-zinc-800'
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow">
                  {editingTransfer ? 'Salvar Alterações' : 'Confirmar Transferência'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Gerenciador de Favorecidos & Pagadores Cadastrados */}
        {showEntitiesManagerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50"
            onClick={() => setShowEntitiesManagerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-zinc-950/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                      <span>Favorecidos & Pagadores Cadastrados</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-extrabold border border-indigo-500/20">
                        {financialEntities.length} registros
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Contatos pré-salvos para preenchimento ágil e inteligente de quem paga e quem recebe nas transações
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenAddEntityModal();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    <UserPlus size={13} />
                    <span>+ Novo Cadastro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEntitiesManagerModal(false)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className={`p-3.5 border-b flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0 ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800/80'
              }`}>
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60 self-start">
                  <button
                    type="button"
                    onClick={() => setEntityFilterType('todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      entityFilterType === 'todos'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Todos ({financialEntities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityFilterType('recebedor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      entityFilterType === 'recebedor'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Building2 size={11} />
                    Quem irá Receber ({financialEntities.filter(e => e.type === 'recebedor' || e.type === 'ambos').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityFilterType('pagador')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      entityFilterType === 'pagador'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Users size={11} />
                    Quem irá Pagar ({financialEntities.filter(e => e.type === 'pagador' || e.type === 'ambos').length})
                  </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={entitySearchQuery}
                    onChange={(e) => setEntitySearchQuery(e.target.value)}
                    placeholder="Buscar por nome, documento ou telefone..."
                    className={`w-full pl-8 pr-7 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isHighContrast
                        ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500'
                    }`}
                  />
                  {entitySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setEntitySearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* List / Cards Content */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
                {(() => {
                  const filtered = financialEntities.filter(ent => {
                    if (entityFilterType === 'recebedor' && ent.type !== 'recebedor' && ent.type !== 'ambos') return false;
                    if (entityFilterType === 'pagador' && ent.type !== 'pagador' && ent.type !== 'ambos') return false;

                    const q = entitySearchQuery.trim().toLowerCase();
                    if (!q) return true;

                    return (
                      ent.name.toLowerCase().includes(q) ||
                      (ent.document && ent.document.toLowerCase().includes(q)) ||
                      (ent.phone && ent.phone.includes(q)) ||
                      (ent.email && ent.email.toLowerCase().includes(q)) ||
                      (ent.notes && ent.notes.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center space-y-3">
                        <Users size={32} className="mx-auto text-zinc-600 opacity-60" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-zinc-300">Nenhum cadastro encontrado</p>
                          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                            {entitySearchQuery
                              ? `Nenhum contato coincide com a busca "${entitySearchQuery}".`
                              : 'Cadastre pessoas, membros ou fornecedores para agilizar o lançamento das transações.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddEntityModal()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserPlus size={13} />
                          <span>Cadastrar Agora</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtered.map((ent) => {
                        const catObj = categories.find(c => c.id === ent.category);
                        const accObj = accounts.find(a => a.id === ent.defaultAccountId);
                        const txCount = transactions.filter(t => 
                          (ent.type === 'recebedor' && t.vaiPagarQuem?.toLowerCase() === ent.name.toLowerCase()) ||
                          (ent.type === 'pagador' && t.recebidoDe?.toLowerCase() === ent.name.toLowerCase()) ||
                          (ent.type === 'ambos' && (t.recebidoDe?.toLowerCase() === ent.name.toLowerCase() || t.vaiPagarQuem?.toLowerCase() === ent.name.toLowerCase()))
                        ).length;

                        return (
                          <div
                            key={ent.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                              isHighContrast
                                ? 'bg-white border-zinc-200 shadow-sm hover:border-indigo-300'
                                : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            {/* Top info */}
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className={`text-xs font-bold truncate ${isHighContrast ? 'text-zinc-900' : 'text-zinc-100'}`} title={ent.name}>
                                    {ent.name}
                                  </h4>
                                  {ent.document && (
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                      Doc: {ent.document}
                                    </p>
                                  )}
                                </div>

                                {/* Type Badge */}
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                                  ent.type === 'recebedor'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : ent.type === 'pagador'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                }`}>
                                  {ent.type === 'recebedor' ? 'Quem recebe (Favorecido)' : ent.type === 'pagador' ? 'Quem paga (Doador)' : 'Ambos'}
                                </span>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-800/40">
                                {catObj && (
                                  <div>
                                    <span className="text-zinc-500 font-bold block">Categoria Padrão:</span>
                                    <span className="text-zinc-300 font-medium truncate block">
                                      {catObj.name}{ent.subcategory ? ` › ${ent.subcategory}` : ''}
                                    </span>
                                  </div>
                                )}

                                {accObj && (
                                  <div>
                                    <span className="text-zinc-500 font-bold block">Conta Padrão:</span>
                                    <span className="text-zinc-300 font-medium truncate block">
                                      {accObj.name}
                                    </span>
                                  </div>
                                )}

                                {ent.defaultPaymentMethod && (
                                  <div>
                                    <span className="text-zinc-500 font-bold block">Forma de Pgto:</span>
                                    <span className="text-indigo-400 font-bold uppercase truncate block">
                                      {ent.defaultPaymentMethod}
                                    </span>
                                  </div>
                                )}

                                <div>
                                  <span className="text-zinc-500 font-bold block">Histórico de Uso:</span>
                                  <span className="text-zinc-400 font-medium block">
                                    {txCount} {txCount === 1 ? 'transação' : 'transações'}
                                  </span>
                                </div>
                              </div>

                              {(ent.phone || ent.email || ent.notes) && (
                                <div className="text-[10px] text-zinc-400 pt-1 space-y-0.5 border-t border-dashed border-zinc-800/30">
                                  {ent.phone && <p className="truncate">📞 {ent.phone}</p>}
                                  {ent.email && <p className="truncate">✉️ {ent.email}</p>}
                                  {ent.notes && <p className="text-zinc-500 italic truncate">Obs: {ent.notes}</p>}
                                </div>
                              )}
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/40">
                              <div className="flex items-center gap-1.5">
                                {(ent.type === 'pagador' || ent.type === 'ambos') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      resetTxForm();
                                      setTxType('entrada');
                                      handleSelectEntity(ent);
                                      setShowEntitiesManagerModal(false);
                                      setShowTxModal(true);
                                    }}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 cursor-pointer transition-colors"
                                    title="Lançar nova receita recebida deste contato"
                                  >
                                    + Receita
                                  </button>
                                )}

                                {(ent.type === 'recebedor' || ent.type === 'ambos') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      resetTxForm();
                                      setTxType('saida');
                                      handleSelectEntity(ent);
                                      setShowEntitiesManagerModal(false);
                                      setShowTxModal(true);
                                    }}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                                    title="Lançar nova despesa paga a este favorecido"
                                  >
                                    + Despesa
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditEntity(ent)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                  title="Editar cadastro"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEntity(ent.id, ent.name)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Excluir cadastro"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Formulário de Cadastro / Edição de Favorecido ou Pagador */}
        {showEntityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={() => setShowEntityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20 shrink-0">
                <h3 className={`text-xs font-bold flex items-center gap-2 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <Users size={14} className="text-indigo-400" />
                  <span>{editingEntity ? 'Editar Cadastro de Favorecido / Pagador' : 'Novo Cadastro de Favorecido / Pagador'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEntityModal(false)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEntity} className="p-6 space-y-4 overflow-y-auto scrollbar-thin">
                {/* Nome completo */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Nome Completo / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={entityFormName}
                    onChange={(e) => setEntityFormName(e.target.value)}
                    placeholder="Ex: CPFL, SAEP, Pastor Presidente, Membro..."
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                {/* Tipo de Vínculo */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Tipo de Vínculo Financeiro *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEntityFormType('recebedor')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        entityFormType === 'recebedor'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-sm'
                          : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Quem irá Receber (Favorecido/Fornecedor)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntityFormType('pagador')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        entityFormType === 'pagador'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm'
                          : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Quem irá Pagar (Doador/Membro)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntityFormType('ambos')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        entityFormType === 'ambos'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm'
                          : isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Ambos (Paga & Recebe)
                    </button>
                  </div>
                </div>

                {/* CPF ou CNPJ & Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      CPF ou CNPJ (Opcional)
                    </label>
                    <input
                      type="text"
                      value={entityFormDocument}
                      onChange={(e) => setEntityFormDocument(e.target.value)}
                      placeholder="Ex: 00.000.000/0001-00 ou CPF"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Telefone / WhatsApp (Opcional)
                    </label>
                    <input
                      type="text"
                      value={entityFormPhone}
                      onChange={(e) => setEntityFormPhone(e.target.value)}
                      placeholder="Ex: (19) 99999-9999"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Predefinições automáticas para facilitar lançamento */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      ⚡ Predefinições Automáticas ao Selecionar
                    </span>
                    <span className="text-[9px] text-zinc-500">Opcional para agilizar o preenchimento</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Categoria Padrão */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria Padrão</label>
                      <select
                        value={entityFormCategory}
                        onChange={(e) => {
                          setEntityFormCategory(e.target.value);
                          setEntityFormSubcategory('');
                        }}
                        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        <option value="">Nenhuma (escolher no lançamento)</option>
                        {categories
                          .filter(c => entityFormType === 'ambos' ? true : (entityFormType === 'pagador' ? (c.type === 'entrada' || c.type === 'ambas') : (c.type === 'saida' || c.type === 'ambas')))
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* Subcategoria Padrão */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subcategoria Padrão</label>
                      <select
                        value={entityFormSubcategory}
                        onChange={(e) => setEntityFormSubcategory(e.target.value)}
                        disabled={!entityFormCategory}
                        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        } disabled:opacity-50`}
                      >
                        <option value="">Nenhuma</option>
                        {entityFormCategory && (categories.find(c => c.id === entityFormCategory)?.subcategories || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Conta Padrão */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Conta / Caixa Padrão</label>
                      <select
                        value={entityFormAccountId}
                        onChange={(e) => setEntityFormAccountId(e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        <option value="">Nenhuma (escolher no lançamento)</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Forma de Pgto Padrão */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Forma de Pagamento</label>
                      <select
                        value={entityFormPaymentMethod}
                        onChange={(e: any) => setEntityFormPaymentMethod(e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        }`}
                      >
                        <option value="pix">Pix</option>
                        <option value="boleto">Boleto</option>
                        <option value="cartão">Cartão de Crédito / Débito</option>
                        <option value="dinheiro">Dinheiro em Espécie</option>
                        <option value="débito automático">Débito Automático</option>
                        <option value="transferência">Transferência Bancária</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Observações / Detalhes</label>
                  <textarea
                    rows={2}
                    value={entityFormNotes}
                    onChange={(e) => setEntityFormNotes(e.target.value)}
                    placeholder="Informações adicionais sobre este favorecido ou pagador..."
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg mt-2"
                >
                  {editingEntity ? 'Salvar Alterações' : 'Gravar Cadastro'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: New Category */}
        {showCategoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-left max-h-[90vh] flex flex-col ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center bg-zinc-950/20 shrink-0">
                <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  {editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}
                </h3>
                <button 
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }} 
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Código */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Código</label>
                    <input
                      type="text" value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="1.01"
                      className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-indigo-400'
                      }`}
                    />
                  </div>

                  {/* 2. Nome da Categoria */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome da Categoria *</label>
                    <input
                      type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ex: Dízimos, Energia Elétrica"
                      className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 3. Tipo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tipo de Fluxo *</label>
                    <select
                      required value={catType} onChange={(e: any) => setCatType(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="entrada">Receita (Entrada)</option>
                      <option value="saida">Despesa (Saída)</option>
                      <option value="ambas">Ambos os Fluxos</option>
                    </select>
                  </div>

                  {/* 4. Grupo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Grupo *</label>
                    <select
                      required value={catMainCategory} onChange={(e: any) => setCatMainCategory(e.target.value)}
                      className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="Receitas">Receitas</option>
                      <option value="Despesas Fixas">Despesas Fixas</option>
                      <option value="Despesas Variáveis">Despesas Variáveis</option>
                      <option value="Investimentos">Investimentos</option>
                    </select>
                  </div>
                </div>

                {/* 5. Categoria Pai */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria Pai (Opcional)</label>
                  <input
                    type="text" value={catParentCategory} onChange={(e) => setCatParentCategory(e.target.value)} placeholder="Ex: Dízimos e Ofertas, Despesas Operacionais..."
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                {/* 6. Descrição */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Descrição / Finalidade</label>
                  <textarea
                    rows={2} value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Descreva a finalidade ou regras desta categoria..."
                    className={`w-full text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cor do Marcador *</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['emerald', 'blue', 'purple', 'amber', 'rose', 'sky', 'indigo'].map(colorOpt => (
                      <button
                        key={colorOpt} type="button" onClick={() => setCatColor(colorOpt)}
                        className={`aspect-square rounded-lg transition-transform cursor-pointer border-2 ${
                          colorOpt === 'emerald' ? 'bg-emerald-500' :
                          colorOpt === 'blue' ? 'bg-blue-500' :
                          colorOpt === 'purple' ? 'bg-purple-500' :
                          colorOpt === 'amber' ? 'bg-amber-500' :
                          colorOpt === 'rose' ? 'bg-rose-500' :
                          colorOpt === 'sky' ? 'bg-sky-500' : 'bg-indigo-500'
                        } ${catColor === colorOpt ? 'border-indigo-600 scale-110 shadow' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Subcategorias Vinculadas */}
                <div className="space-y-2 pt-2 border-t border-dashed border-zinc-800/60">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Subcategorias Vinculadas ({catSubcategories.length})
                    </label>
                  </div>

                  <div className={`flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl border border-dashed ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-250' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    {catSubcategories.length === 0 ? (
                      <span className="text-[11px] text-zinc-500 italic p-1">Nenhuma subcategoria cadastrada</span>
                    ) : (
                      catSubcategories.map(sub => (
                        <span
                          key={sub}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold border px-2 py-1 rounded-lg transition-colors ${
                            isHighContrast ? 'bg-white border-zinc-250 text-zinc-800 shadow-xs' : 'bg-zinc-850 border-zinc-750 text-zinc-200'
                          }`}
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCategory) {
                                handleDeleteSubcategory(editingCategory.id, sub);
                              } else {
                                setCatSubcategories(catSubcategories.filter(s => s !== sub));
                              }
                            }}
                            className="p-0.5 text-zinc-400 hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={`Excluir subcategoria "${sub}"`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Campo para adicionar nova subcategoria no modal */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nome de nova subcategoria..."
                      value={modalNewSubcategory}
                      onChange={(e) => setModalNewSubcategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = modalNewSubcategory.trim();
                          if (trimmed && !catSubcategories.includes(trimmed)) {
                            setCatSubcategories([...catSubcategories, trimmed]);
                            setModalNewSubcategory('');
                          }
                        }
                      }}
                      className={`text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 font-medium ${
                        isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = modalNewSubcategory.trim();
                        if (trimmed && !catSubcategories.includes(trimmed)) {
                          setCatSubcategories([...catSubcategories, trimmed]);
                          setModalNewSubcategory('');
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/40">
                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow">
                    {editingCategory ? 'Salvar Alterações' : 'Salvar Categoria'}
                  </button>

                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(editingCategory.id)}
                      className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Excluir esta categoria</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Safe Deletion Confirmation Dialog */}
        {deleteConfirmState && deleteConfirmState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            onClick={() => setDeleteConfirmState(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-left space-y-4 ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
                  <AlertCircle size={22} />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className={`text-sm font-bold ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
                    {deleteConfirmState.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {deleteConfirmState.description}
                  </p>
                </div>
              </div>

              {deleteConfirmState.warningNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{deleteConfirmState.warningNote}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmState(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                    isHighContrast 
                      ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700' 
                      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirmState.onConfirm();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{deleteConfirmState.confirmButtonText || 'Confirmar Exclusão'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: View Scanned Receipt / Lightbox */}
        {selectedReceiptImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
            onClick={() => setSelectedReceiptImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[90vh] flex flex-col justify-center items-center"
            >
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="absolute -top-12 right-0 md:top-4 md:-right-12 p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full cursor-pointer z-10 border border-zinc-700"
                title="Fechar visualização"
              >
                <X size={18} />
              </button>
              <div className="rounded-2xl overflow-hidden border border-zinc-800 max-w-full max-h-[80vh] bg-zinc-950 flex items-center justify-center shadow-2xl">
                <img
                  src={selectedReceiptImage}
                  alt="Recibo Digitalizado"
                  className="max-w-full max-h-[80vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-zinc-400 text-xs mt-3 font-semibold">Comprovante de Lançamento Financeiro</p>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Print / Export PDF Report (Layout conforming to user image) */}
        {showPrintReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col z-[100] overflow-y-auto p-3 sm:p-6"
            onClick={() => setShowPrintReportModal(false)}
          >
            {/* Modal Controls Header Bar (hidden during printing) */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-[850px] w-full mx-auto mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl no-print shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{getTransactionReportTitle()}</h3>
                  <p className="text-[11px] text-zinc-400">Configurado para impressão em página A4 (Retrato) com todas as colunas ajustadas</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <Printer size={15} />
                  <span>Imprimir / Salvar em PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? (
                    <Loader2 size={15} className="animate-spin text-indigo-400" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>{isGeneratingPDF ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Report Canvas */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-[850px] w-full mx-auto overflow-x-auto pb-12"
            >
              <div
                id="report-printable-sheet"
                className="printable-area bg-white text-zinc-900 border border-zinc-200 shadow-2xl rounded-2xl p-5 sm:p-7 w-full select-text font-sans box-border"
              >
                {/* 1. Official Header matching institutional format */}
                <div className="flex items-center gap-4 pb-4 border-b-2 border-zinc-900 text-left mb-5">
                  <MNVLogo size={65} />
                  <div className="flex flex-col items-start justify-center">
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                      MINISTÉRIO NOVA VIDA
                    </h1>
                    <p className="text-[10.5px] font-bold text-zinc-700 uppercase tracking-wide mt-0.5">
                      AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                    </p>
                    <p className="text-[10.5px] font-mono font-bold text-zinc-600">
                      CNPJ: 62.471.271-0001-82
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-zinc-300 w-full">
                      <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-indigo-900">
                        {getTransactionReportTitle()}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* 2. Visão Geral (4 KPI Cards) */}
                <div className="mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                    Visão Geral
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Card 1: Receitas Totais */}
                    <div className="border border-zinc-200 rounded-xl p-2.5 bg-white shadow-2xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                          RECEITAS TOTAIS
                        </span>
                        <div className="p-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                          <ArrowUpRight size={12} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm sm:text-base font-black text-zinc-900 font-mono truncate">
                          {formatCurrency(reportTotalReceitas)}
                        </p>
                        <p className="text-[8px] text-zinc-400 mt-0.5 truncate">
                          Dízimos e ofertas
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Despesas Totais */}
                    <div className="border border-zinc-200 rounded-xl p-2.5 bg-white shadow-2xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                          DESPESAS TOTAIS
                        </span>
                        <div className="p-0.5 rounded bg-rose-50 text-rose-500 border border-rose-200/60">
                          <ArrowDownRight size={12} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm sm:text-base font-black text-zinc-900 font-mono truncate">
                          {formatCurrency(reportTotalDespesas)}
                        </p>
                        <p className="text-[8px] text-zinc-400 mt-0.5 truncate">
                          Soma de despesas
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Superávit Líquido */}
                    <div className="border border-zinc-200 rounded-xl p-2.5 bg-white shadow-2xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                          SUPERÁVIT LÍQUIDO
                        </span>
                        <div className="p-0.5 rounded bg-indigo-50 text-indigo-500 border border-indigo-200/60">
                          <TrendingUp size={12} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className={`text-sm sm:text-base font-black font-mono truncate ${reportSuperavit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                          {formatCurrency(reportSuperavit)}
                        </p>
                        <p className="text-[8px] text-zinc-400 mt-0.5 truncate">
                          Resultado líquido
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Saldo em Contas */}
                    <div className="rounded-xl p-2.5 bg-indigo-600 text-white shadow-sm flex flex-col justify-between" style={{ backgroundColor: '#4338ca' }}>
                      <div className="flex justify-between items-start">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/90">
                          SALDO EM CONTAS
                        </span>
                        <div className="p-0.5 rounded bg-white/20 text-white">
                          <Wallet size={12} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm sm:text-base font-black text-white font-mono truncate">
                          {formatCurrency(reportTotalSaldoContas)}
                        </p>
                        <p className="text-[8px] text-white/80 mt-0.5 truncate">
                          Total em bancos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bancos (Bank Cards grid) */}
                <div className="mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                    Bancos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {accounts.slice(0, 8).map(acc => {
                      const stats = getAccountPeriodStats(acc);
                      return (
                        <div key={acc.id} className="border border-zinc-200 rounded-lg p-2 bg-white shadow-2xs flex flex-col justify-between text-left">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={15} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[8.5px] font-bold text-zinc-800 truncate leading-tight">{acc.name}</p>
                                <p className="text-[7px] text-zinc-400 truncate">{acc.accountType === 'caixa_fisico' ? `Nº ${acc.accountNumber}` : `Ag ${acc.agency} | CC ${acc.accountNumber}`}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1 my-1.5 text-[7px]">
                              <div className="bg-emerald-50/80 border border-emerald-100 rounded px-1 py-0.5">
                                <span className="text-emerald-700 font-bold block text-[6px] uppercase">Entradas</span>
                                <span className="text-emerald-600 font-mono font-bold block truncate">+{formatCurrency(stats.totalEntradas)}</span>
                              </div>
                              <div className="bg-rose-50/80 border border-rose-100 rounded px-1 py-0.5 text-right">
                                <span className="text-rose-700 font-bold block text-[6px] uppercase">Saídas</span>
                                <span className="text-rose-600 font-mono font-bold block truncate">-{formatCurrency(stats.totalSaidas)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-dashed border-zinc-200 space-y-1 text-[7px]">
                            <div className="flex justify-between items-baseline">
                              <span className="text-zinc-500 uppercase text-[6px] font-bold">Diferença (Mês)</span>
                              <span className={`font-mono font-bold text-[7.5px] truncate ${stats.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stats.diff >= 0 ? '+' : ''}{formatCurrency(stats.diff)}
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1 border-t border-zinc-100">
                              <div>
                                <span className="text-zinc-400 uppercase text-[6px] block">Inicial</span>
                                <span className="text-zinc-600 font-mono block truncate">{formatCurrency(stats.initialBalanceForPeriod)}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-400 uppercase text-[6px] block">Atual</span>
                                <span className={`font-mono font-bold block text-[8px] truncate ${stats.finalBalanceForPeriod >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                  {formatCurrency(stats.finalBalanceForPeriod)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Lançamentos (Table with all 11 columns, calibrated to fit in 100% portrait width) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                    {txFilterType === 'transfer' ? 'Transferências' : 'Lançamentos'}
                  </h3>

                  {txFilterType === 'transfer' ? (
                    <div className="w-full border border-zinc-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full border-collapse text-left table-fixed text-[7.5px]">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50/80 font-bold uppercase tracking-wider text-zinc-600">
                            <th className="py-2 px-1.5 w-[12%]">Data</th>
                            <th className="py-2 px-1.5 w-[24%]">Conta Origem (Saída)</th>
                            <th className="py-2 px-1.5 w-[24%]">Conta Destino (Entrada)</th>
                            <th className="py-2 px-1.5 w-[25%]">Observações</th>
                            <th className="py-2 px-1.5 w-[15%] text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {displayTransfers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-zinc-400 font-medium text-xs">
                                Nenhuma transferência encontrada para o período selecionado.
                              </td>
                            </tr>
                          ) : (
                            displayTransfers.map(tf => {
                              const src = accounts.find(a => a.id === tf.sourceAccountId);
                              const dest = accounts.find(a => a.id === tf.destinationAccountId);
                              return (
                                <tr key={tf.id} className="hover:bg-zinc-50/50">
                                  <td className="py-1.5 px-1.5 font-mono text-zinc-600 whitespace-nowrap font-semibold">
                                    {tf.date.split('-').reverse().join('/')}
                                  </td>
                                  <td className="py-1.5 px-1.5">
                                    <div className="flex items-center gap-1">
                                      {src && <BankLogo bankName={src.bankName} imageUrl={src.image} size={12} />}
                                      <span className="font-medium text-zinc-800 truncate">{src ? `${src.name}` : '—'}</span>
                                    </div>
                                  </td>
                                  <td className="py-1.5 px-1.5">
                                    <div className="flex items-center gap-1">
                                      {dest && <BankLogo bankName={dest.bankName} imageUrl={dest.image} size={12} />}
                                      <span className="font-medium text-zinc-800 truncate">{dest ? `${dest.name}` : '—'}</span>
                                    </div>
                                  </td>
                                  <td className="py-1.5 px-1.5 text-zinc-500 italic truncate">
                                    {tf.observation || '—'}
                                  </td>
                                  <td className="py-1.5 px-1.5 font-bold font-mono text-right text-indigo-600 whitespace-nowrap">
                                    {formatCurrency(tf.value)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-zinc-200 bg-zinc-50 font-bold text-[8px] text-zinc-700">
                            <td className="py-2 px-1.5" colSpan={4}>
                              Total ({displayTransfers.length} transferências)
                            </td>
                            <td className="py-2 px-1.5 font-mono text-right text-indigo-600 whitespace-nowrap">
                              {formatCurrency(displayTransfers.reduce((s, t) => s + t.value, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="w-full border border-zinc-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full border-collapse text-left table-fixed text-[7px] leading-tight">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50/80 font-bold uppercase tracking-wider text-zinc-600">
                            <th className="py-2 px-1 w-[8%] text-center">Data</th>
                            <th className="py-2 px-1 w-[18%]">Descrição</th>
                            <th className="py-2 px-1 w-[10.5%] text-right">Valor</th>
                            <th className="py-2 px-1 w-[6.5%] text-center">Tipo</th>
                            <th className="py-2 px-1 w-[13%]">Categoria</th>
                            <th className="py-2 px-1 w-[11%]">Conta</th>
                            <th className="py-2 px-1 w-[5.5%] text-center">
                              {txFilterType === 'entrada' ? 'Recebido' : txFilterType === 'saida' ? 'Pago' : 'Status'}
                            </th>
                            <th className="py-2 px-1 w-[10%]">
                              {txFilterType === 'entrada' ? 'Recebido de' : txFilterType === 'saida' ? 'Pagar quem' : 'Pessoa'}
                            </th>
                            <th className="py-2 px-1 w-[6.5%] text-center">Pgto</th>
                            <th className="py-2 px-1 w-[5.5%] text-center">Parc.</th>
                            <th className="py-2 px-1 w-[5.5%]">Obs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {displayTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-6 text-center text-zinc-400 font-medium text-xs">
                                Nenhum lançamento encontrado para o período selecionado.
                              </td>
                            </tr>
                          ) : (
                            displayTransactions.map((tx) => {
                              const cat = categories.find(c => c.id === tx.categoryId);
                              const acc = accounts.find(a => a.id === tx.accountId);
                              const isEntrada = tx.type === 'entrada';
                              const dateVal = (isEntrada 
                                ? (tx.dataRecebido || tx.date) 
                                : (tx.dataLancamento || tx.date)
                              )?.split('-').reverse().join('/') || '—';
                              const vencimentoVal = !isEntrada && tx.dataVencimento ? tx.dataVencimento.split('-').reverse().join('/') : null;
                              const isDone = isEntrada ? tx.recebido !== 'nao' : tx.pago !== 'nao';
                              const personEntity = isEntrada ? (tx.recebidoDe || '—') : (tx.vaiPagarQuem || '—');
                              const paymentMethodVal = (tx.paymentMethod || tx.formaPagamento)?.toUpperCase() || '—';
                              const installmentVal = tx.parcelamento === 'sim' 
                                ? `${tx.numeroParcelas || 1}x` 
                                : tx.parcelamento === 'recorrente' 
                                  ? 'Recorr.' 
                                  : (tx.installments || 'À Vista');

                              return (
                                <tr key={tx.id} className="hover:bg-zinc-50/50">
                                  {/* 1. Data */}
                                  <td className="py-1 px-1 font-mono text-zinc-600 text-center whitespace-nowrap">
                                    <span className="font-semibold text-zinc-800 text-[6.5px] block">{dateVal}</span>
                                    {vencimentoVal && vencimentoVal !== dateVal && (
                                      <span className="block text-[5.5px] text-zinc-400 font-normal">V:{vencimentoVal}</span>
                                    )}
                                  </td>
                                  {/* 2. Descrição */}
                                  <td className="py-1 px-1 font-semibold text-zinc-900 truncate" title={tx.description}>
                                    {tx.description}
                                  </td>
                                  {/* 3. Valor */}
                                  <td className={`py-1 px-1 font-bold font-mono text-right whitespace-nowrap ${isEntrada ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isEntrada ? '+ ' : '- '}{formatCurrency(tx.value)}
                                  </td>
                                  {/* 4. Tipo */}
                                  <td className="py-1 px-1 text-center whitespace-nowrap">
                                    <span className={`px-1 py-0.5 rounded text-[6px] font-bold uppercase inline-block ${isEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                      {isEntrada ? 'Rec' : 'Desp'}
                                    </span>
                                  </td>
                                  {/* 5. Categoria */}
                                  <td className="py-1 px-1 whitespace-nowrap">
                                    <span className={`inline-block px-1 py-0.5 rounded text-[6px] font-medium truncate max-w-full ${
                                      isEntrada 
                                        ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                                        : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                                    }`}>
                                      {cat?.name || '—'}{tx.subcategory ? ` • ${tx.subcategory}` : ''}
                                    </span>
                                  </td>
                                  {/* 6. Conta Bancária */}
                                  <td className="py-1 px-1 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      {acc && <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={11} />}
                                      <span className="font-medium text-zinc-800 truncate text-[6.5px]">{acc?.name || '—'}</span>
                                    </div>
                                  </td>
                                  {/* 7. Recebido / Pago */}
                                  <td className="py-1 px-1 text-center whitespace-nowrap">
                                    <span className={`inline-flex items-center justify-center px-1 py-0.5 rounded-full text-[6px] font-bold ${
                                      isDone 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : (isEntrada ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')
                                    }`}>
                                      {isDone ? 'Sim' : 'Não'}
                                    </span>
                                  </td>
                                  {/* 8. Recebido de / Pagar quem */}
                                  <td className="py-1 px-1 text-zinc-700 truncate text-[6.5px]" title={personEntity}>
                                    {personEntity}
                                  </td>
                                  {/* 9. Forma de Pagamento */}
                                  <td className="py-1 px-1 text-center whitespace-nowrap">
                                    {paymentMethodVal !== '—' ? (
                                      <span className="px-0.5 py-0.2 rounded text-[6px] font-mono font-bold bg-zinc-100 border border-zinc-200 text-zinc-700">
                                        {paymentMethodVal}
                                      </span>
                                    ) : '—'}
                                  </td>
                                  {/* 10. Parcelamento */}
                                  <td className="py-1 px-1 text-center text-zinc-600 whitespace-nowrap text-[6.5px]">
                                    {installmentVal}
                                  </td>
                                  {/* 11. Observações */}
                                  <td className="py-1 px-1 text-zinc-500 italic truncate text-[6px]" title={tx.observation || ''}>
                                    {tx.observation || '—'}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-zinc-200 bg-zinc-50 font-bold text-[7.5px] text-zinc-700">
                            <td className="py-1.5 px-1" colSpan={2}>
                              Total ({displayTransactions.length} {txFilterType === 'saida' ? 'despesas' : txFilterType === 'entrada' ? 'receitas' : 'lançamentos'})
                            </td>
                            <td className={`py-1.5 px-1 font-mono text-right ${txFilterType === 'saida' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {txFilterType === 'saida'
                                ? `- ${formatCurrency(displayTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0))}`
                                : txFilterType === 'entrada'
                                  ? `+ ${formatCurrency(displayTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.value, 0))}`
                                  : (reportSuperavit >= 0 ? `+ ${formatCurrency(reportSuperavit)}` : `- ${formatCurrency(Math.abs(reportSuperavit))}`)}
                            </td>
                            <td colSpan={8}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* Modal: Print / Export Balanço Patrimonial (Publication Quality A4 Landscape) */}
        {showPrintBalancoModal && (() => {
          const rangeBase = getBalancoPeriodDateRange(balancoBaseYear, balancoPeriodScope);
          const rangeComp = getBalancoPeriodDateRange(balancoCompYear, balancoPeriodScope);

          const calcVar = (base: number, comp: number) => {
            const diff = base - comp;
            const pct = comp !== 0 ? ((base - comp) / Math.abs(comp)) * 100 : (base > 0 ? 100 : 0);
            return { diff, pct };
          };

          const renderBadge = (diff: number, pct: number, isExpense = false) => {
            if (!balancoCompareEnabled) return null;
            if (diff === 0) {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  0.0%
                </span>
              );
            }
            const isPositive = diff > 0;
            const isGood = isExpense ? !isPositive : isPositive;
            const colorClass = isGood 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${colorClass}`}>
                {isPositive ? '+' : ''}{pct.toFixed(1)}%
              </span>
            );
          };

          // 1. Ativo Circulante
          let printTotalCircBase = 0;
          let printTotalCircComp = 0;
          const printAccounts = accounts.map(acc => {
            const bBal = getAccountBalanceAtDate(acc.id, rangeBase.end);
            const cBal = balancoCompareEnabled ? getAccountBalanceAtDate(acc.id, rangeComp.end) : 0;
            printTotalCircBase += bBal;
            printTotalCircComp += cBal;
            return { acc, bBal, cBal, v: calcVar(bBal, cBal) };
          });
          const printCircVar = calcVar(printTotalCircBase, printTotalCircComp);

          // 2. Ativo Imobilizado
          let printTotalImobBase = 0;
          let printTotalImobComp = 0;
          const printAssets = fixedAssets.map(fa => {
            const inBase = fa.acquisitionDate <= rangeBase.end;
            const inComp = fa.acquisitionDate <= rangeComp.end;
            const bVal = inBase ? (fa.currentValue || fa.acquisitionValue) : 0;
            const cVal = inComp ? fa.acquisitionValue : 0;
            printTotalImobBase += bVal;
            printTotalImobComp += cVal;
            return { fa, inBase, inComp, bVal, cVal, v: calcVar(bVal, cVal) };
          });
          const printImobVar = calcVar(printTotalImobBase, printTotalImobComp);

          const printTotalAtivoBase = printTotalCircBase + printTotalImobBase;
          const printTotalAtivoComp = printTotalCircComp + printTotalImobComp;
          const printTotalAtivoVar = calcVar(printTotalAtivoBase, printTotalAtivoComp);

          // 3. Receitas
          const printBaseInflows = transactions.filter(t => {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            return t.type === 'entrada' && d >= rangeBase.start && d <= rangeBase.end;
          });
          const printCompInflows = transactions.filter(t => {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            return t.type === 'entrada' && d >= rangeComp.start && d <= rangeComp.end;
          });

          const printRevCats = categories.filter(c => c.type === 'entrada' || c.type === 'ambas').map(cat => {
            const bSum = printBaseInflows.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.value, 0);
            const cSum = balancoCompareEnabled ? printCompInflows.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.value, 0) : 0;
            const subcats = (cat.subcategories || []).map(sub => {
              const subBase = printBaseInflows.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((s, t) => s + t.value, 0);
              const subComp = balancoCompareEnabled ? printCompInflows.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((s, t) => s + t.value, 0) : 0;
              return { sub, subBase, subComp, v: calcVar(subBase, subComp) };
            }).filter(s => s.subBase > 0 || s.subComp > 0);
            return { cat, bSum, cSum, v: calcVar(bSum, cSum), subcats };
          }).filter(c => c.bSum > 0 || c.cSum > 0);

          const printTotalRecBase = printBaseInflows.reduce((s, t) => s + t.value, 0);
          const printTotalRecComp = printCompInflows.reduce((s, t) => s + t.value, 0);
          const printRecVar = calcVar(printTotalRecBase, printTotalRecComp);

          // 4. Despesas
          const printBaseOutflows = transactions.filter(t => {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            return t.type === 'saida' && d >= rangeBase.start && d <= rangeBase.end;
          });
          const printCompOutflows = transactions.filter(t => {
            const d = t.dataRecebido || t.dataLancamento || t.date;
            return t.type === 'saida' && d >= rangeComp.start && d <= rangeComp.end;
          });

          const printExpCats = categories.filter(c => c.type === 'saida' || c.type === 'ambas').map(cat => {
            const bSum = printBaseOutflows.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.value, 0);
            const cSum = balancoCompareEnabled ? printCompOutflows.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.value, 0) : 0;
            const subcats = (cat.subcategories || []).map(sub => {
              const subBase = printBaseOutflows.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((s, t) => s + t.value, 0);
              const subComp = balancoCompareEnabled ? printCompOutflows.filter(t => t.categoryId === cat.id && t.subcategory === sub).reduce((s, t) => s + t.value, 0) : 0;
              return { sub, subBase, subComp, v: calcVar(subBase, subComp) };
            }).filter(s => s.subBase > 0 || s.subComp > 0);
            return { cat, bSum, cSum, v: calcVar(bSum, cSum), subcats };
          }).filter(c => c.bSum > 0 || c.cSum > 0);

          const printTotalDespBase = printBaseOutflows.reduce((s, t) => s + t.value, 0);
          const printTotalDespComp = printCompOutflows.reduce((s, t) => s + t.value, 0);
          const printDespVar = calcVar(printTotalDespBase, printTotalDespComp);

          // 5. Resultado
          const printSuperavitBase = printTotalRecBase - printTotalDespBase;
          const printSuperavitComp = printTotalRecComp - printTotalDespComp;
          const printSuperavitVar = calcVar(printSuperavitBase, printSuperavitComp);
          const printPatrimonioBase = printTotalAtivoBase + printSuperavitBase;
          const printPatrimonioComp = printTotalAtivoComp + printSuperavitComp;
          const printPatrimonioVar = calcVar(printPatrimonioBase, printPatrimonioComp);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col z-[100] overflow-y-auto p-3 sm:p-6"
              onClick={() => setShowPrintBalancoModal(false)}
            >
              {/* Modal Controls Header Bar */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-[1240px] w-full mx-auto mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl no-print shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Printer size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Impressão & Exportação do Balanço Patrimonial</h3>
                    <p className="text-[11px] text-zinc-400">Layout contábil oficial configurado em folha A4 com cabeçalho do Ministério Nova Vida</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Printer size={15} />
                    <span>Imprimir / Salvar em PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBalancoPDF}
                    disabled={isGeneratingBalancoPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGeneratingBalancoPDF ? (
                      <Loader2 size={15} className="animate-spin text-indigo-400" />
                    ) : (
                      <Download size={15} />
                    )}
                    <span>{isGeneratingBalancoPDF ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBalancoExcel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrintBalancoModal(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
                    title="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="max-w-[1240px] w-full mx-auto pb-12 flex justify-center"
              >
                <div
                  id="balanco-printable-sheet"
                  className="printable-area bg-white text-zinc-900 border border-zinc-200 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-[1020px] select-text font-sans text-left"
                >
                  {/* 1. Official Header matching user request */}
                  <div className="flex items-center gap-5 pb-5 border-b-2 border-zinc-900 text-left">
                    <MNVLogo size={80} />
                    <div className="flex flex-col items-start justify-center">
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                        MINISTÉRIO NOVA VIDA
                      </h1>
                      <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide mt-0.5">
                        AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                      </p>
                      <p className="text-xs font-mono font-bold text-zinc-600">
                        CNPJ: 62.471.271-0001-82
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-zinc-300 w-full">
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-indigo-900">
                          BALANÇO PATRIMONIAL DO EXERCÍCIO ENCERRADO EM 31 DE DEZEMBRO DE {balancoBaseYear}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* 2. Resumo Analítico em Cards */}
                  <div className="grid grid-cols-6 gap-3 my-5">
                    <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                      <span className="block text-[8px] uppercase font-bold text-zinc-500">Ativo Circulante</span>
                      <span className="text-xs font-black font-mono text-zinc-900">{formatCurrency(printTotalCircBase)}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                      <span className="block text-[8px] uppercase font-bold text-zinc-500">Ativo Imobilizado</span>
                      <span className="text-xs font-black font-mono text-zinc-900">{formatCurrency(printTotalImobBase)}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50">
                      <span className="block text-[8px] uppercase font-bold text-indigo-700">Total do Ativo</span>
                      <span className="text-xs font-black font-mono text-indigo-900">{formatCurrency(printTotalAtivoBase)}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50">
                      <span className="block text-[8px] uppercase font-bold text-emerald-700">Total Receitas</span>
                      <span className="text-xs font-black font-mono text-emerald-800">+{formatCurrency(printTotalRecBase)}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-rose-200 bg-rose-50">
                      <span className="block text-[8px] uppercase font-bold text-rose-700">Total Despesas</span>
                      <span className="text-xs font-black font-mono text-rose-800">-{formatCurrency(printTotalDespBase)}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-zinc-300 bg-zinc-100">
                      <span className="block text-[8px] uppercase font-bold text-zinc-700">Superávit Líquido</span>
                      <span className={`text-xs font-black font-mono ${printSuperavitBase >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(printSuperavitBase)}
                      </span>
                    </div>
                  </div>

                  {/* 3. QUADRO 1: ATIVO CIRCULANTE & NÃO CIRCULANTE */}
                  <div className="space-y-4 mb-6">
                    <div className="border-b border-zinc-300 pb-1 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                        1. ATIVOS DA ENTIDADE (CIRCULANTE E NÃO CIRCULANTE)
                      </h3>
                      <span className="text-xs font-mono font-black text-indigo-900">
                        Total Ativo: {formatCurrency(printTotalAtivoBase)}
                      </span>
                    </div>

                    {/* 1.1 Ativo Circulante */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-zinc-700 mb-1">
                        1.1 Ativo Circulante (Disponibilidades: Bancos e Caixa)
                      </h4>
                      <table className="w-full text-left border-collapse text-[10px] border border-zinc-200">
                        <thead>
                          <tr className="bg-zinc-100 border-b border-zinc-200 font-bold uppercase text-zinc-700 text-[8px]">
                            <th className="py-1.5 px-3">Conta / Instituição</th>
                            <th className="py-1.5 px-3">Tipo da Conta</th>
                            <th className="py-1.5 px-3 text-right">Saldo em {balancoBaseYear}</th>
                            {balancoCompareEnabled && (
                              <>
                                <th className="py-1.5 px-3 text-right text-zinc-600">Saldo em {balancoCompYear}</th>
                                <th className="py-1.5 px-3 text-right">Variação (R$)</th>
                                <th className="py-1.5 px-3 text-right">Variação (%)</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-zinc-800">
                          {printAccounts.map(({ acc, bBal, cBal, v }) => (
                            <tr key={acc.id} className="hover:bg-zinc-50">
                              <td className="py-1.5 px-3 font-semibold">
                                <div className="flex items-center gap-2">
                                  <BankLogo bankName={acc.bankName} imageUrl={acc.image} size={16} />
                                  <span>{acc.name} ({acc.bankName})</span>
                                </div>
                              </td>
                              <td className="py-1.5 px-3">{getAccountTypeLabel(acc.type)}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold">{formatCurrency(bBal)}</td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className="py-1.5 px-3 text-right font-mono text-zinc-600">{formatCurrency(cBal)}</td>
                                  <td className={`py-1.5 px-3 text-right font-mono font-bold ${v.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                  </td>
                                  <td className="py-1.5 px-3 text-right">{renderBadge(v.diff, v.pct)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-zinc-100 font-bold border-t border-zinc-300 text-zinc-900">
                            <td colSpan={2} className="py-1.5 px-3 uppercase text-[8px]">Subtotal Ativo Circulante</td>
                            <td className="py-1.5 px-3 text-right font-mono text-indigo-900 font-black">{formatCurrency(printTotalCircBase)}</td>
                            {balancoCompareEnabled && (
                              <>
                                <td className="py-1.5 px-3 text-right font-mono text-zinc-600 font-bold">{formatCurrency(printTotalCircComp)}</td>
                                <td className={`py-1.5 px-3 text-right font-mono font-bold ${printCircVar.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {printCircVar.diff > 0 ? '+' : ''}{formatCurrency(printCircVar.diff)}
                                </td>
                                <td className="py-1.5 px-3 text-right">{renderBadge(printCircVar.diff, printCircVar.pct)}</td>
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* 1.2 Ativo Não Circulante (Imobilizado) */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-zinc-700 mb-1">
                        1.2 Ativo Não Circulante (Imobilizado / Bens Móveis, Imóveis e Equipamentos)
                      </h4>
                      <table className="w-full text-left border-collapse text-[10px] border border-zinc-200">
                        <thead>
                          <tr className="bg-zinc-100 border-b border-zinc-200 font-bold uppercase text-zinc-700 text-[8px]">
                            <th className="py-1.5 px-3">Bem Patrimonial</th>
                            <th className="py-1.5 px-3">Categoria</th>
                            <th className="py-1.5 px-3">Aquisição</th>
                            <th className="py-1.5 px-3 text-right">Valor em {balancoBaseYear}</th>
                            {balancoCompareEnabled && (
                              <>
                                <th className="py-1.5 px-3 text-right text-zinc-600">Valor em {balancoCompYear}</th>
                                <th className="py-1.5 px-3 text-right">Variação (R$)</th>
                                <th className="py-1.5 px-3 text-right">Variação (%)</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-zinc-800">
                          {printAssets.map(({ fa, inBase, inComp, bVal, cVal, v }) => (
                            <tr key={fa.id} className="hover:bg-zinc-50">
                              <td className="py-1.5 px-3 font-semibold">
                                {fa.name}
                                {fa.description && <span className="block text-[8px] text-zinc-500 font-normal">{fa.description}</span>}
                              </td>
                              <td className="py-1.5 px-3 font-medium text-zinc-600">{fa.category}</td>
                              <td className="py-1.5 px-3 font-mono text-zinc-600">{fa.acquisitionDate ? fa.acquisitionDate.split('-').reverse().join('/') : '—'}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold">
                                {inBase ? formatCurrency(bVal) : '—'}
                              </td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className="py-1.5 px-3 text-right font-mono text-zinc-600">{inComp ? formatCurrency(cVal) : '—'}</td>
                                  <td className={`py-1.5 px-3 text-right font-mono font-bold ${v.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                  </td>
                                  <td className="py-1.5 px-3 text-right">{renderBadge(v.diff, v.pct)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-zinc-100 font-bold border-t border-zinc-300 text-zinc-900">
                            <td colSpan={3} className="py-1.5 px-3 uppercase text-[8px]">Subtotal Ativo Imobilizado</td>
                            <td className="py-1.5 px-3 text-right font-mono text-amber-800 font-black">{formatCurrency(printTotalImobBase)}</td>
                            {balancoCompareEnabled && (
                              <>
                                <td className="py-1.5 px-3 text-right font-mono text-zinc-600 font-bold">{formatCurrency(printTotalImobComp)}</td>
                                <td className={`py-1.5 px-3 text-right font-mono font-bold ${printImobVar.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {printImobVar.diff > 0 ? '+' : ''}{formatCurrency(printImobVar.diff)}
                                </td>
                                <td className="py-1.5 px-3 text-right">{renderBadge(printImobVar.diff, printImobVar.pct)}</td>
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Total Geral do Ativo */}
                    <div className="p-2.5 bg-zinc-900 text-white rounded-xl flex justify-between items-center text-xs font-black">
                      <span className="uppercase tracking-wider">TOTAL DO ATIVO CONSOLIDADO (1.1 + 1.2)</span>
                      <div className="flex items-center gap-6 font-mono text-xs">
                        <span>{balancoBaseYear}: {formatCurrency(printTotalAtivoBase)}</span>
                        {balancoCompareEnabled && (
                          <span className="text-zinc-400 font-normal">vs {balancoCompYear}: {formatCurrency(printTotalAtivoComp)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. QUADRO 2: DEMONSTRAÇÃO DE RECEITAS */}
                  <div className="space-y-2 mb-6">
                    <div className="border-b border-zinc-300 pb-1 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                        2. DEMONSTRAÇÃO DAS RECEITAS OPERACIONAIS (+)
                      </h3>
                      <span className="text-xs font-mono font-black text-emerald-700">
                        Total Receitas: +{formatCurrency(printTotalRecBase)}
                      </span>
                    </div>

                    <table className="w-full text-left border-collapse text-[10px] border border-zinc-200">
                      <thead>
                        <tr className="bg-emerald-50 border-b border-zinc-200 font-bold uppercase text-emerald-900 text-[8px]">
                          <th className="py-1.5 px-3">Categoria de Receita</th>
                          <th className="py-1.5 px-3">Grupo Principal</th>
                          <th className="py-1.5 px-3 text-right">Exercício {balancoBaseYear}</th>
                          {balancoCompareEnabled && (
                            <>
                              <th className="py-1.5 px-3 text-right text-zinc-600">Exercício {balancoCompYear}</th>
                              <th className="py-1.5 px-3 text-right">Variação (R$)</th>
                              <th className="py-1.5 px-3 text-right">Variação (%)</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-800">
                        {printRevCats.map(({ cat, bSum, cSum, v, subcats }) => (
                          <React.Fragment key={cat.id}>
                            <tr className="bg-zinc-50/50 font-bold">
                              <td className="py-1.5 px-3 text-zinc-900">{cat.name}</td>
                              <td className="py-1.5 px-3 text-zinc-600 font-normal">{cat.mainCategory || 'Receitas Gerais'}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-emerald-800">+{formatCurrency(bSum)}</td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className="py-1.5 px-3 text-right font-mono text-zinc-600 font-medium">+{formatCurrency(cSum)}</td>
                                  <td className={`py-1.5 px-3 text-right font-mono ${v.diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                  </td>
                                  <td className="py-1.5 px-3 text-right">{renderBadge(v.diff, v.pct)}</td>
                                </>
                              )}
                            </tr>
                            {subcats.map(({ sub, subBase, subComp, v: sv }) => (
                              <tr key={sub} className="text-[9px] text-zinc-600">
                                <td className="py-1 px-3 pl-6">• {sub}</td>
                                <td className="py-1 px-3 italic">Subcategoria</td>
                                <td className="py-1 px-3 text-right font-mono text-zinc-800">+{formatCurrency(subBase)}</td>
                                {balancoCompareEnabled && (
                                  <>
                                    <td className="py-1 px-3 text-right font-mono text-zinc-500">+{formatCurrency(subComp)}</td>
                                    <td className="py-1 px-3 text-right font-mono">{sv.diff > 0 ? '+' : ''}{formatCurrency(sv.diff)}</td>
                                    <td className="py-1 px-3 text-right font-mono">{sv.pct.toFixed(1)}%</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-100/70 font-black border-t-2 border-emerald-300 text-emerald-950">
                          <td colSpan={2} className="py-1.5 px-3 uppercase text-[9px]">TOTAL DAS RECEITAS</td>
                          <td className="py-1.5 px-3 text-right font-mono text-emerald-900 text-xs">+{formatCurrency(printTotalRecBase)}</td>
                          {balancoCompareEnabled && (
                            <>
                              <td className="py-1.5 px-3 text-right font-mono text-zinc-700 text-xs">+{formatCurrency(printTotalRecComp)}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-xs">{printRecVar.diff > 0 ? '+' : ''}{formatCurrency(printRecVar.diff)}</td>
                              <td className="py-1.5 px-3 text-right">{renderBadge(printRecVar.diff, printRecVar.pct)}</td>
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* 5. QUADRO 3: DEMONSTRAÇÃO DE DESPESAS */}
                  <div className="space-y-2 mb-6">
                    <div className="border-b border-zinc-300 pb-1 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-wider text-rose-800">
                        3. DEMONSTRAÇÃO DAS DESPESAS OPERACIONAIS (-)
                      </h3>
                      <span className="text-xs font-mono font-black text-rose-700">
                        Total Despesas: -{formatCurrency(printTotalDespBase)}
                      </span>
                    </div>

                    <table className="w-full text-left border-collapse text-[10px] border border-zinc-200">
                      <thead>
                        <tr className="bg-rose-50 border-b border-zinc-200 font-bold uppercase text-rose-900 text-[8px]">
                          <th className="py-1.5 px-3">Categoria de Despesa</th>
                          <th className="py-1.5 px-3">Grupo Principal</th>
                          <th className="py-1.5 px-3 text-right">Exercício {balancoBaseYear}</th>
                          {balancoCompareEnabled && (
                            <>
                              <th className="py-1.5 px-3 text-right text-zinc-600">Exercício {balancoCompYear}</th>
                              <th className="py-1.5 px-3 text-right">Variação (R$)</th>
                              <th className="py-1.5 px-3 text-right">Variação (%)</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-800">
                        {printExpCats.map(({ cat, bSum, cSum, v, subcats }) => (
                          <React.Fragment key={cat.id}>
                            <tr className="bg-zinc-50/50 font-bold">
                              <td className="py-1.5 px-3 text-zinc-900">{cat.name}</td>
                              <td className="py-1.5 px-3 text-zinc-600 font-normal">{cat.mainCategory || 'Despesas Gerais'}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-rose-800">-{formatCurrency(bSum)}</td>
                              {balancoCompareEnabled && (
                                <>
                                  <td className="py-1.5 px-3 text-right font-mono text-zinc-600 font-medium">-{formatCurrency(cSum)}</td>
                                  <td className={`py-1.5 px-3 text-right font-mono ${v.diff <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {v.diff > 0 ? '+' : ''}{formatCurrency(v.diff)}
                                  </td>
                                  <td className="py-1.5 px-3 text-right">{renderBadge(v.diff, v.pct, true)}</td>
                                </>
                              )}
                            </tr>
                            {subcats.map(({ sub, subBase, subComp, v: sv }) => (
                              <tr key={sub} className="text-[9px] text-zinc-600">
                                <td className="py-1 px-3 pl-6">• {sub}</td>
                                <td className="py-1 px-3 italic">Subcategoria</td>
                                <td className="py-1 px-3 text-right font-mono text-zinc-800">-{formatCurrency(subBase)}</td>
                                {balancoCompareEnabled && (
                                  <>
                                    <td className="py-1 px-3 text-right font-mono text-zinc-500">-{formatCurrency(subComp)}</td>
                                    <td className="py-1 px-3 text-right font-mono">{sv.diff > 0 ? '+' : ''}{formatCurrency(sv.diff)}</td>
                                    <td className="py-1 px-3 text-right font-mono">{sv.pct.toFixed(1)}%</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-rose-100/70 font-black border-t-2 border-rose-300 text-rose-950">
                          <td colSpan={2} className="py-1.5 px-3 uppercase text-[9px]">TOTAL DAS DESPESAS</td>
                          <td className="py-1.5 px-3 text-right font-mono text-rose-900 text-xs">-{formatCurrency(printTotalDespBase)}</td>
                          {balancoCompareEnabled && (
                            <>
                              <td className="py-1.5 px-3 text-right font-mono text-zinc-700 text-xs">-{formatCurrency(printTotalDespComp)}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-xs">{printDespVar.diff > 0 ? '+' : ''}{formatCurrency(printDespVar.diff)}</td>
                              <td className="py-1.5 px-3 text-right">{renderBadge(printDespVar.diff, printDespVar.pct, true)}</td>
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* 6. QUADRO 4: SÍNTESE DO RESULTADO OPERACIONAL & PATRIMÔNIO LÍQUIDO */}
                  <div className="border border-zinc-300 rounded-xl p-3.5 bg-zinc-50 mb-6 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
                      4. SÍNTESE DO RESULTADO CONTÁBIL & PATRIMÔNIO LÍQUIDO CONSOLIDADO
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Total Receitas:</span>
                        <span className="font-mono font-bold text-emerald-800">+{formatCurrency(printTotalRecBase)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Total Despesas:</span>
                        <span className="font-mono font-bold text-rose-800">-{formatCurrency(printTotalDespBase)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Superávit do Exercício:</span>
                        <span className={`font-mono font-black ${printSuperavitBase >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {formatCurrency(printSuperavitBase)}
                        </span>
                      </div>
                      <div className="bg-indigo-100 p-2 rounded-lg border border-indigo-200">
                        <span className="text-[9px] text-indigo-900 font-black uppercase block">Patrimônio Líquido Total:</span>
                        <span className="font-mono font-black text-indigo-950 text-sm">{formatCurrency(printPatrimonioBase)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 7. TERMO DE ENCERRAMENTO E ASSINATURAS LEGAIS */}
                  <div className="pt-6 border-t-2 border-zinc-900 space-y-6 page-break-inside-avoid">
                    <p className="text-[9px] text-zinc-600 text-center leading-relaxed max-w-3xl mx-auto italic">
                      "Certificamos sob as penas da lei que o presente Balanço Patrimonial e as respectivas Demonstrações Contábeis refletem com exatidão a situação financeira, orçamentária e patrimonial do Ministério Nova Vida no encerramento do exercício de {balancoBaseYear}."
                    </p>

                    <div className="grid grid-cols-3 gap-8 pt-4 text-center text-zinc-800">
                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[10px] font-black uppercase text-zinc-900">Pr. Presidente</p>
                        <p className="text-[8px] text-zinc-500">Diretoria Executiva</p>
                        <p className="text-[7px] text-zinc-400">Ministério Nova Vida</p>
                      </div>

                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[10px] font-black uppercase text-zinc-900">1º Tesoureiro(a)</p>
                        <p className="text-[8px] text-zinc-500">Diretoria Financeira</p>
                        <p className="text-[7px] text-zinc-400">Ministério Nova Vida</p>
                      </div>

                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[10px] font-black uppercase text-zinc-900">Conselho Fiscal / CRC</p>
                        <p className="text-[8px] text-zinc-500">Contabilidade & Auditoria</p>
                        <p className="text-[7px] text-zinc-400">Ministério Nova Vida</p>
                      </div>
                    </div>

                    <div className="text-center pt-1 text-[9px] font-mono text-zinc-400">
                      Pirassununga/SP, {getPeriodClosingDescription(balancoBaseYear, balancoPeriodScope).toLowerCase()}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Modal: Print / Export Demonstrativo Operacional (DRE / Fluxo de Caixa Mês a Mês) */}
        {showPrintDREModal && (() => {
          const {
            DRE_MONTHS_LIST,
            yearInitialCash,
            monthlyInflow,
            monthlyOutflow,
            monthlyResult,
            monthlyStartCash,
            monthlyEndCash,
            totalInflowYear,
            totalOutflowYear,
            totalResultYear,
            endCashYear,
            incomeCategories,
            expenseCategories
          } = dreCalculations;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col z-[100] overflow-y-auto p-3 sm:p-6"
              onClick={() => setShowPrintDREModal(false)}
            >
              {/* Modal Controls Header Bar (hidden during printing) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-[1240px] w-full mx-auto mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl no-print shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Printer size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Demonstrativo Operacional (DRE / Fluxo de Caixa) — Exercício de {dreSelectedYear}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Configurado para impressão e exportação em página A4 (Paisagem) sem cortes de colunas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
                    title="Imprimir na impressora ou salvar PDF"
                  >
                    <Printer size={15} />
                    <span>Imprimir / Salvar em PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDREPDF}
                    disabled={isGeneratingDREPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-zinc-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Baixar arquivo PDF formatado direto"
                  >
                    {isGeneratingDREPDF ? (
                      <Loader2 size={15} className="animate-spin text-indigo-400" />
                    ) : (
                      <Download size={15} />
                    )}
                    <span>{isGeneratingDREPDF ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDREExcel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrintDREModal(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
                    title="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-[1240px] w-full mx-auto pb-12 flex justify-center overflow-x-auto"
              >
                <div
                  id="dre-printable-sheet"
                  className="printable-area bg-white text-zinc-900 border border-zinc-200 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-[1140px] select-text font-sans text-left box-border"
                >
                  {/* Official Header */}
                  <div className="flex items-center gap-4 pb-4 border-b-2 border-zinc-900 text-left mb-5">
                    <MNVLogo size={65} />
                    <div className="flex flex-col items-start justify-center">
                      <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900 leading-tight">
                        MINISTÉRIO NOVA VIDA
                      </h1>
                      <p className="text-[10.5px] font-bold text-zinc-700 uppercase tracking-wide mt-0.5">
                        AV. DR. IVO XAVIER FERREIRA, 3038 - VILA SÃO PEDRO - PIRASSUNUNGA/SP
                      </p>
                      <p className="text-[10.5px] font-mono font-bold text-zinc-600">
                        CNPJ: 62.471.271-0001-82
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-zinc-300 w-full">
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-indigo-900">
                          DEMONSTRATIVO DE RESULTADO (DRE) E FLUXO DE CAIXA OPERACIONAL MÊS A MÊS - EXERCÍCIO DE {dreSelectedYear}
                        </h2>
                        <p className="text-[9.5px] font-mono text-zinc-500 uppercase mt-0.5">
                          Visualização Anual Consolidada de 01 de Janeiro a 31 de Dezembro de {dreSelectedYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-5 gap-2.5 mb-5">
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col justify-between" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <span className="block text-[7.5px] uppercase font-bold text-zinc-500">Saldo Inicial (01/Jan)</span>
                      <span className="text-xs font-black font-mono text-zinc-900 mt-1 truncate">{formatCurrency(yearInitialCash)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col justify-between" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                      <span className="block text-[7.5px] uppercase font-bold text-emerald-700">Receitas Operacionais (+)</span>
                      <span className="text-xs font-black font-mono text-emerald-900 mt-1 truncate">+{formatCurrency(totalInflowYear)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 flex flex-col justify-between" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3' }}>
                      <span className="block text-[7.5px] uppercase font-bold text-rose-700">Despesas Operacionais (-)</span>
                      <span className="text-xs font-black font-mono text-rose-900 mt-1 truncate">-{formatCurrency(totalOutflowYear)}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between`} style={{ backgroundColor: totalResultYear >= 0 ? '#ecfdf5' : '#fff1f2', borderColor: totalResultYear >= 0 ? '#a7f3d0' : '#fecdd3' }}>
                      <span className={`block text-[7.5px] uppercase font-bold ${totalResultYear >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                        Resultado ({totalResultYear >= 0 ? 'Superávit' : 'Déficit'})
                      </span>
                      <span className={`text-xs font-black font-mono mt-1 truncate ${totalResultYear >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {totalResultYear >= 0 ? '+' : ''}{formatCurrency(totalResultYear)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl border text-white flex flex-col justify-between" style={{ backgroundColor: '#4338ca', borderColor: '#3730a3' }}>
                      <span className="block text-[7.5px] uppercase font-bold text-white/90">Saldo Final (31/Dez)</span>
                      <span className="text-xs font-black font-mono text-white mt-1 truncate">{formatCurrency(endCashYear)}</span>
                    </div>
                  </div>

                  {/* Complete 12-Month Table (14 columns fixed at 100% width) */}
                  <div className="mb-6 overflow-hidden rounded-xl border border-zinc-300">
                    <table className="w-full text-left border-collapse table-fixed text-[7.5px]">
                      <thead>
                        <tr className="bg-zinc-100 border-b border-zinc-300 font-bold uppercase text-zinc-700 text-[7.5px]">
                          <th className="py-2 px-2 w-[22%] border-r border-zinc-300">Estrutura / Categoria</th>
                          {DRE_MONTHS_LIST.map(m => (
                            <th key={m.key} className="py-2 px-1 text-right border-r border-zinc-300 w-[5.75%]">
                              {m.label}
                            </th>
                          ))}
                          <th className="py-2 px-1.5 text-right font-black bg-zinc-200 text-zinc-900 w-[9%]">
                            Total {dreSelectedYear}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-800 text-[7.5px]">
                        {/* 1. Saldo Inicial */}
                        <tr className="bg-zinc-50 font-bold">
                          <td className="py-1.5 px-2 text-zinc-900 border-r border-zinc-300 truncate">
                            SALDO INICIAL DE DISPONIBILIDADES
                          </td>
                          {monthlyStartCash.map((val, idx) => (
                            <td key={idx} className="py-1.5 px-1 text-right font-mono border-r border-zinc-200 text-zinc-700 whitespace-nowrap">
                              {formatCurrency(val)}
                            </td>
                          ))}
                          <td className="py-1.5 px-1.5 text-right font-mono font-black bg-zinc-100 text-zinc-900 whitespace-nowrap">
                            {formatCurrency(yearInitialCash)}
                          </td>
                        </tr>

                        {/* 2. RECEITAS HEADER */}
                        <tr className="bg-emerald-100 border-t-2 border-emerald-300 font-black text-emerald-950" style={{ backgroundColor: '#d1fae5' }}>
                          <td colSpan={14} className="py-1.5 px-2 text-[8px] tracking-wide uppercase font-black">
                            1. RECEITAS E ENTRADAS OPERACIONAIS (+)
                          </td>
                        </tr>

                        {incomeCategories.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="py-3 px-4 text-center text-zinc-400 italic">
                              Nenhuma receita registrada no exercício de {dreSelectedYear}.
                            </td>
                          </tr>
                        ) : (
                          incomeCategories.map(cat => (
                            <React.Fragment key={cat.id}>
                              <tr className="bg-emerald-50/30 font-bold hover:bg-emerald-50/50">
                                <td className="py-1 px-2 text-zinc-900 border-r border-zinc-300 truncate">
                                  {cat.name}
                                </td>
                                {cat.months.map((val, mIdx) => (
                                  <td key={mIdx} className="py-1 px-1 text-right font-mono border-r border-zinc-200 text-emerald-800 whitespace-nowrap">
                                    {val > 0 ? formatCurrency(val) : '-'}
                                  </td>
                                ))}
                                <td className="py-1 px-1.5 text-right font-mono font-bold bg-emerald-50 text-emerald-900 whitespace-nowrap">
                                  {formatCurrency(cat.total)}
                                </td>
                              </tr>
                              {cat.subcategoriesList?.map(sub => (
                                <tr key={sub.name} className="text-[7px] text-zinc-600 bg-white">
                                  <td className="py-0.5 px-2 pl-4 italic border-r border-zinc-300 text-zinc-600 truncate">
                                    • {sub.name}
                                  </td>
                                  {sub.months.map((sVal, smIdx) => (
                                    <td key={smIdx} className="py-0.5 px-1 text-right font-mono border-r border-zinc-200 text-zinc-600 whitespace-nowrap">
                                      {sVal > 0 ? formatCurrency(sVal) : '-'}
                                    </td>
                                  ))}
                                  <td className="py-0.5 px-1.5 text-right font-mono font-medium bg-zinc-50 text-zinc-700 whitespace-nowrap">
                                    {formatCurrency(sub.total)}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))
                        )}

                        {/* TOTAL RECEITAS */}
                        <tr className="bg-emerald-100 font-black border-t border-b-2 border-emerald-300 text-emerald-950" style={{ backgroundColor: '#a7f3d0' }}>
                          <td className="py-1.5 px-2 border-r border-emerald-300 font-bold truncate">
                            TOTAL DE RECEITAS OPERACIONAIS (+)
                          </td>
                          {monthlyInflow.map((val, idx) => (
                            <td key={idx} className="py-1.5 px-1 text-right font-mono border-r border-emerald-200 text-emerald-950 font-bold whitespace-nowrap">
                              {formatCurrency(val)}
                            </td>
                          ))}
                          <td className="py-1.5 px-1.5 text-right font-mono font-black bg-emerald-200 text-emerald-950 whitespace-nowrap">
                            {formatCurrency(totalInflowYear)}
                          </td>
                        </tr>

                        {/* 3. DESPESAS HEADER */}
                        <tr className="bg-rose-100 border-t-2 border-rose-300 font-black text-rose-950" style={{ backgroundColor: '#ffe4e6' }}>
                          <td colSpan={14} className="py-1.5 px-2 text-[8px] tracking-wide uppercase font-black">
                            2. DESPESAS E SAÍDAS OPERACIONAIS (-)
                          </td>
                        </tr>

                        {expenseCategories.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="py-3 px-4 text-center text-zinc-400 italic">
                              Nenhuma despesa registrada no exercício de {dreSelectedYear}.
                            </td>
                          </tr>
                        ) : (
                          expenseCategories.map(cat => (
                            <React.Fragment key={cat.id}>
                              <tr className="bg-rose-50/30 font-bold hover:bg-rose-50/50">
                                <td className="py-1 px-2 text-zinc-900 border-r border-zinc-300 truncate">
                                  {cat.name}
                                </td>
                                {cat.months.map((val, mIdx) => (
                                  <td key={mIdx} className="py-1 px-1 text-right font-mono border-r border-zinc-200 text-rose-800 whitespace-nowrap">
                                    {val > 0 ? `-${formatCurrency(val)}` : '-'}
                                  </td>
                                ))}
                                <td className="py-1 px-1.5 text-right font-mono font-bold bg-rose-50 text-rose-900 whitespace-nowrap">
                                  -{formatCurrency(cat.total)}
                                </td>
                              </tr>
                              {cat.subcategoriesList?.map(sub => (
                                <tr key={sub.name} className="text-[7px] text-zinc-600 bg-white">
                                  <td className="py-0.5 px-2 pl-4 italic border-r border-zinc-300 text-zinc-600 truncate">
                                    • {sub.name}
                                  </td>
                                  {sub.months.map((sVal, smIdx) => (
                                    <td key={smIdx} className="py-0.5 px-1 text-right font-mono border-r border-zinc-200 text-zinc-600 whitespace-nowrap">
                                      {sVal > 0 ? `-${formatCurrency(sVal)}` : '-'}
                                    </td>
                                  ))}
                                  <td className="py-0.5 px-1.5 text-right font-mono font-medium bg-zinc-50 text-zinc-700 whitespace-nowrap">
                                    -{formatCurrency(sub.total)}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))
                        )}

                        {/* TOTAL DESPESAS */}
                        <tr className="bg-rose-100 font-black border-t border-b-2 border-rose-300 text-rose-950" style={{ backgroundColor: '#fecdd3' }}>
                          <td className="py-1.5 px-2 border-r border-rose-300 font-bold truncate">
                            TOTAL DE DESPESAS OPERACIONAIS (-)
                          </td>
                          {monthlyOutflow.map((val, idx) => (
                            <td key={idx} className="py-1.5 px-1 text-right font-mono border-r border-rose-200 text-rose-950 font-bold whitespace-nowrap">
                              -{formatCurrency(val)}
                            </td>
                          ))}
                          <td className="py-1.5 px-1.5 text-right font-mono font-black bg-rose-200 text-rose-950 whitespace-nowrap">
                            -{formatCurrency(totalOutflowYear)}
                          </td>
                        </tr>

                        {/* 4. RESULTADO OPERACIONAL */}
                        <tr className="bg-zinc-100 font-black border-t-2 border-zinc-400 text-zinc-950" style={{ backgroundColor: '#f4f4f5' }}>
                          <td className="py-1.5 px-2 border-r border-zinc-300 font-black truncate">
                            RESULTADO DO MÊS (SUPERÁVIT / DÉFICIT)
                          </td>
                          {monthlyResult.map((val, idx) => (
                            <td key={idx} className={`py-1.5 px-1 text-right font-mono font-black border-r border-zinc-300 whitespace-nowrap ${val >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {val > 0 ? `+${formatCurrency(val)}` : val < 0 ? formatCurrency(val) : 'R$ 0,00'}
                            </td>
                          ))}
                          <td className={`py-1.5 px-1.5 text-right font-mono font-black whitespace-nowrap ${totalResultYear >= 0 ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'}`}>
                            {totalResultYear > 0 ? `+${formatCurrency(totalResultYear)}` : formatCurrency(totalResultYear)}
                          </td>
                        </tr>

                        {/* 5. SALDO FINAL ACUMULADO */}
                        <tr className="bg-indigo-100 font-black border-t-2 border-indigo-400 text-indigo-950" style={{ backgroundColor: '#e0e7ff' }}>
                          <td className="py-2 px-2 border-r border-indigo-300 font-black truncate">
                            SALDO FINAL DE DISPONIBILIDADES (CAIXA / BANCOS)
                          </td>
                          {monthlyEndCash.map((val, idx) => (
                            <td key={idx} className="py-2 px-1 text-right font-mono font-black border-r border-indigo-200 text-indigo-950 whitespace-nowrap">
                              {formatCurrency(val)}
                            </td>
                          ))}
                          <td className="py-2 px-1.5 text-right font-mono font-black bg-indigo-200 text-indigo-950 whitespace-nowrap">
                            {formatCurrency(endCashYear)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Termo de Encerramento e Assinaturas Legais */}
                  <div className="pt-5 border-t-2 border-zinc-900 space-y-5 page-break-inside-avoid">
                    <p className="text-[8.5px] text-zinc-600 text-center leading-relaxed max-w-3xl mx-auto italic">
                      "Certificamos sob as penas da lei que o presente Demonstrativo de Resultado (DRE) e Fluxo de Caixa Operacional reflete fielmente as movimentações de entradas, saídas e disponibilidades financeiras do Ministério Nova Vida no exercício de {dreSelectedYear}."
                    </p>

                    <div className="grid grid-cols-3 gap-6 pt-3 text-center text-zinc-800">
                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[9.5px] font-black uppercase text-zinc-900">Pr. Presidente</p>
                        <p className="text-[7.5px] text-zinc-500">Diretoria Executiva</p>
                        <p className="text-[6.5px] text-zinc-400">Ministério Nova Vida</p>
                      </div>

                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[9.5px] font-black uppercase text-zinc-900">1º Tesoureiro(a)</p>
                        <p className="text-[7.5px] text-zinc-500">Diretoria Financeira</p>
                        <p className="text-[6.5px] text-zinc-400">Ministério Nova Vida</p>
                      </div>

                      <div>
                        <div className="border-b border-zinc-900 w-4/5 mx-auto mb-1"></div>
                        <p className="text-[9.5px] font-black uppercase text-zinc-900">Conselho Fiscal / CRC</p>
                        <p className="text-[7.5px] text-zinc-500">Contabilidade & Auditoria</p>
                        <p className="text-[6.5px] text-zinc-400">Ministério Nova Vida</p>
                      </div>
                    </div>

                    <div className="text-center pt-1 text-[8px] font-mono text-zinc-400">
                      Pirassununga/SP, 31 de dezembro de {dreSelectedYear}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Modal: Fixed Asset (Create / Edit) */}
        {showAddAssetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddAssetModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-left ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${isHighContrast ? 'text-indigo-600' : 'text-indigo-500'}`} />
                  <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>
                    {editingAssetId ? 'Editar Bem Patrimonial' : 'Cadastrar Novo Bem Patrimonial (Ativo)'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddAssetModal(false)} 
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    isHighContrast ? 'text-zinc-400 hover:text-zinc-700' : 'text-zinc-500 hover:text-white'
                  }`}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAsset} className="p-6 space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                  }`}>
                    Nome do Bem / Ativo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Templo Sede, Sistema de Som Behringer, Van 16L..."
                    value={assetFormName}
                    onChange={(e) => setAssetFormName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Categoria do Bem *
                    </label>
                    <select
                      value={assetFormCategory}
                      onChange={(e) => setAssetFormCategory(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      }`}
                    >
                      <option value="Imóveis e Terrenos">Imóveis e Terrenos</option>
                      <option value="Veículos">Veículos</option>
                      <option value="Equipamentos e Instrumentos">Equipamentos e Instrumentos</option>
                      <option value="Mobiliário e TI">Mobiliário e TI</option>
                      <option value="Outros Bens">Outros Bens</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Data de Aquisição *
                    </label>
                    <input
                      type="date"
                      required
                      value={assetFormDate}
                      onChange={(e) => setAssetFormDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Valor de Aquisição (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={assetFormAcqValue}
                      onChange={(e) => setAssetFormAcqValue(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                      Valor Atual Avaliado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Igual à aquisição se vazio"
                      value={assetFormCurValue}
                      onChange={(e) => setAssetFormCurValue(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                  }`}>
                    Descrição / Observações Patrimoniais
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalhes sobre localização, número de patrimônio, estado de conservação..."
                    value={assetFormDesc}
                    onChange={(e) => setAssetFormDesc(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none ${
                      isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAssetModal(false)}
                    className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${
                      isHighContrast ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                  >
                    {editingAssetId ? 'Salvar Alterações' : 'Cadastrar Bem'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Bulk Import Transactions (Excel / CSV) */}
        <BulkImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          accounts={accounts}
          categories={categories}
          onImport={handleBulkImportTransactions}
          isHighContrast={isHighContrast}
        />

        {/* Modal: Bulk Import Categories (Excel / CSV) */}
        <BulkCategoryImportModal
          isOpen={showBulkCategoryImportModal}
          onClose={() => setShowBulkCategoryImportModal(false)}
          existingCategories={categories}
          onImport={handleBulkImportCategories}
          isHighContrast={isHighContrast}
        />

        {/* Modal: Bulk Import Transfers (Excel / CSV) */}
        <BulkTransferImportModal
          isOpen={showBulkTransferImportModal}
          onClose={() => setShowBulkTransferImportModal(false)}
          accounts={accounts}
          onImport={handleBulkImportTransfers}
          isHighContrast={isHighContrast}
        />

      </AnimatePresence>

      {/* PRINT-OPTIMIZED DYNAMIC MEDIA HOOK STYLES */}
      <style>{`
        @media print {
          @page {
            size: ${showPrintReportModal ? 'portrait' : 'landscape'};
            margin: 5mm;
          }
          html, body {
            background: white !important;
            color: #18181b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #report-printable-sheet, #report-printable-sheet *,
          #balanco-printable-sheet, #balanco-printable-sheet *,
          #dre-printable-sheet, #dre-printable-sheet *,
          #printable-report-area, #printable-report-area * {
            visibility: visible !important;
          }
          #report-printable-sheet,
          #balanco-printable-sheet,
          #dre-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .fixed, [role="dialog"], .backdrop-blur-md {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}
