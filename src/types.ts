export interface Document {
  id: string;
  name: string;
  type: 'sql' | 'pdf' | 'doc' | 'docx';
  folder: string;
  size: string;
  imagePreview?: string;
  creator: string;
  date: string;
  // Dynamic fields for assembly documents (used in Editor)
  entity?: string;
  address?: string;
  localidade?: string;
  convocacao1?: string;
  convocacao2?: string;
  tipoAssembleia?: string;
  ordemDoDia?: string;
  signatures?: Array<{ name: string; role: string }>;
  // Rich template properties
  isRichTemplate?: boolean;
  richContent?: string;
  selectedAlineas?: string[];
  richFieldsData?: Record<string, string>;
  isFavorite?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  cargo: 'Conselho Administrativo' | 'Diretoria' | 'Conselho Fiscal' | string;
  nivelAcesso: 'Admin' | 'Editor' | 'Viewer';
  status: 'Ativo' | 'Inativo';
  avatar?: string;
  cpf?: string;
  estadoCivil?: 'Solteiro' | 'Casado' | 'Divorciado' | 'União Estável' | 'Viúvo';
  nomeConjuge?: string;
  dataNascimento?: string;
  telefone?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  dataInicio?: string;
  dataTermino?: string;
  funcao?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accessLevel: 'Admin' | 'Editor' | 'Viewer';
  avatar?: string;
  rememberMe?: boolean;
}

export interface Activity {
  id: string;
  workspace: string;
  fileName: string;
  fileType: 'sql' | 'pdf' | 'doc' | 'docx';
  editorName: string;
  editorInitials: string;
  editorBg: string;
  timeAgo: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time: string;
  type: string;
}

export type Tab = 'overview' | 'documents' | 'members' | 'templates' | 'editor' | 'settings' | 'finance';

export type BankAccountType = 'caixa_fisico' | 'conta_corrente' | 'conta_poupanca' | 'conta_investimento';

export interface BankAccount {
  id: string;
  name: string;
  agency: string;
  accountNumber: string;
  bankName: string;
  initialBalance: number;
  currentBalance: number;
  image?: string;
  accountType?: BankAccountType;
  initialBalanceDate?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'entrada' | 'saida' | 'ambas';
  color: string; // Tailwind hex or class representation
  subcategories?: string[]; // List of subcategory names
  mainCategory?: 'Despesas Fixas' | 'Despesas Variáveis' | 'Investimentos' | 'Receitas';
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  categoryId: string;
  subcategory?: string; // Selected subcategory name
  accountId: string;
  date: string;
  observation?: string;
  // New fields from Brazilian Portuguese user request
  recebido?: 'sim' | 'nao';
  recebidoDe?: string;
  dataRecebido?: string;
  dataLancamento?: string;
  parcelamento?: 'sim' | 'nao' | 'recorrente';
  frequenciaParcelas?: 'anual' | 'mensal' | 'quinzenal' | 'semanal' | 'diario' | '';
  numeroParcelas?: number;
  formaPagamento?: 'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | '';
  pago?: 'sim' | 'nao';
  vaiPagarQuem?: string;
  dataVencimento?: string;
  receiptImage?: string; // Imagem do recibo digitalizado em Base64
}

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  value: number;
  date: string;
  observation?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: {
    entity: string;
    address: string;
    localidade: string;
    convocacao1: string;
    convocacao2: string;
    tipoAssembleia: string;
    ordemDoDia: string;
    signatures: Array<{ name: string; role: string }>;
  };
  isRichTemplate?: boolean;
  richContent?: string;
  selectedAlineas?: string[];
  richFieldsData?: Record<string, string>;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: 'Imóveis e Terrenos' | 'Veículos' | 'Equipamentos e Instrumentos' | 'Mobiliário e TI' | 'Outros Bens';
  acquisitionValue: number;
  currentValue: number;
  acquisitionDate: string;
  description?: string;
}

