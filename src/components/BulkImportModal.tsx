import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  FileText,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clipboard,
  Layers,
  Info,
  DollarSign,
  Calendar,
  Building2,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BankAccount, TransactionCategory, Transaction } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  categories: TransactionCategory[];
  onImport: (newTransactions: Transaction[]) => void;
  isHighContrast?: boolean;
}

interface ParsedTransactionRow {
  id: string;
  selected: boolean;
  type: 'entrada' | 'saida';
  date: string; // YYYY-MM-DD
  description: string;
  value: number;
  categoryId: string;
  subcategory: string;
  accountId: string;
  formaPagamento: 'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | '';
  status: 'concluido' | 'pendente';
  entidade: string; // recebidoDe ou vaiPagarQuem
  observation: string;
  errors: string[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onImport,
  isHighContrast = false
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedTransactionRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid' | 'entrada' | 'saida'>('all');
  
  // Default values for missing columns
  const [defaultAccountId, setDefaultAccountId] = useState<string>(accounts[0]?.id || '');
  const [defaultInflowCatId, setDefaultInflowCatId] = useState<string>(
    categories.find(c => c.type === 'entrada' || c.type === 'ambas')?.id || categories[0]?.id || ''
  );
  const [defaultOutflowCatId, setDefaultOutflowCatId] = useState<string>(
    categories.find(c => c.type === 'saida' || c.type === 'ambas')?.id || categories[0]?.id || ''
  );
  const [defaultStatus, setDefaultStatus] = useState<'concluido' | 'pendente'>('concluido');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | ''>('pix');

  // Bulk modification states
  const [bulkAccountId, setBulkAccountId] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format currency
  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Normalization helper for header matching
  const normalizeHeader = (header: string): string => {
    return header
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Helper to parse dates from various formats (DD/MM/YYYY, YYYY-MM-DD, Excel date serials)
  const parseDateValue = (raw: any): string => {
    if (!raw) return new Date().toISOString().split('T')[0];

    // If it's an Excel numeric date
    if (typeof raw === 'number') {
      try {
        const utc_days = Math.floor(raw - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        const year = date_info.getUTCFullYear();
        const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date_info.getUTCDate()).padStart(2, '0');
        if (year > 1900 && year < 2100) return `${year}-${month}-${day}`;
      } catch (e) {
        // Fallback
      }
    }

    const str = String(raw).trim();

    // DD/MM/YYYY or DD-MM-YYYY
    const brMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (brMatch) {
      const day = brMatch[1].padStart(2, '0');
      const month = brMatch[2].padStart(2, '0');
      let year = brMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    // YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If string can be parsed directly
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  };

  // Helper to parse numbers in pt-BR or standard notation
  const parseCurrencyValue = (raw: any): { value: number; isNegative: boolean } => {
    if (raw === null || raw === undefined) return { value: 0, isNegative: false };
    if (typeof raw === 'number') {
      return { value: Math.abs(raw), isNegative: raw < 0 };
    }

    let str = String(raw).trim();
    const isNegative = str.startsWith('-') || str.includes('(') || str.endsWith('-');
    // Strip currency symbols, spaces, parentheses
    str = str.replace(/[R$\s\(\)]/gi, '');

    // Handle Brazilian format: 1.234,56
    if (str.includes(',') && str.includes('.')) {
      if (str.indexOf('.') < str.indexOf(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    }

    str = str.replace(/[^0-9.-]/g, '');
    const num = parseFloat(str);
    return {
      value: isNaN(num) ? 0 : Math.abs(num),
      isNegative: isNegative || num < 0
    };
  };

  // Helper to find matching category
  const findCategory = (catName: string, subName: string, type: 'entrada' | 'saida'): { categoryId: string; subcategory: string } => {
    const normCat = normalizeHeader(catName);
    const normSub = normalizeHeader(subName);

    if (normCat) {
      // Find category with matching name
      const matched = categories.find(c => {
        const cNorm = normalizeHeader(c.name);
        return cNorm === normCat || cNorm.includes(normCat) || normCat.includes(cNorm);
      });

      if (matched) {
        let matchedSub = '';
        if (normSub && matched.subcategories && matched.subcategories.length > 0) {
          const foundSub = matched.subcategories.find(s => {
            const sNorm = normalizeHeader(s);
            return sNorm === normSub || sNorm.includes(normSub) || normSub.includes(sNorm);
          });
          if (foundSub) matchedSub = foundSub;
        }
        return { categoryId: matched.id, subcategory: matchedSub || subName };
      }
    }

    // Fallback default
    const fallbackId = type === 'entrada' ? defaultInflowCatId : defaultOutflowCatId;
    return { categoryId: fallbackId, subcategory: subName || '' };
  };

  // Helper to find matching account
  const findAccount = (accName: string): string => {
    const norm = normalizeHeader(accName);
    if (norm) {
      const matched = accounts.find(a => {
        const aNorm = normalizeHeader(a.name);
        const bNorm = normalizeHeader(a.bankName);
        return aNorm === norm || bNorm === norm || aNorm.includes(norm) || norm.includes(aNorm) || bNorm.includes(norm);
      });
      if (matched) return matched.id;
    }
    return defaultAccountId || (accounts[0]?.id || '');
  };

  // Validate a row
  const validateRow = (row: Omit<ParsedTransactionRow, 'errors' | 'selected' | 'id'>): string[] => {
    const errors: string[] = [];
    if (!row.description.trim()) {
      errors.push('Descrição obrigatória');
    }
    if (row.value <= 0) {
      errors.push('Valor deve ser maior que R$ 0,00');
    }
    if (!row.date) {
      errors.push('Data inválida');
    }
    if (!row.categoryId) {
      errors.push('Categoria obrigatória');
    }
    if (!row.accountId) {
      errors.push('Conta bancária obrigatória');
    }
    return errors;
  };

  // Process array of raw objects (from XLSX or parsed TSV/CSV)
  const processRawData = (data: Record<string, any>[]) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado encontrado no arquivo ou texto fornecido.');
      return;
    }

    const rows: ParsedTransactionRow[] = [];

    data.forEach((item, index) => {
      // Find key mappings based on normalized headers
      const keys = Object.keys(item);
      const getVal = (possibleHeaders: string[]): any => {
        for (const k of keys) {
          const normK = normalizeHeader(k);
          if (possibleHeaders.some(ph => normK === normalizeHeader(ph) || normK.includes(normalizeHeader(ph)))) {
            return item[k];
          }
        }
        return undefined;
      };

      const rawDate = getVal(['data', 'datalancamento', 'dt', 'date', 'datavencimento']);
      const rawType = getVal(['tipo', 'tipotransacao', 'natureza', 'es', 'type', 'movimento']);
      const rawDesc = getVal(['descricao', 'historico', 'nome', 'detalhes', 'titulo', 'description', 'memo']) || '';
      const rawVal = getVal(['valor', 'valorrs', 'valortotal', 'quantia', 'value', 'amount', 'preco']);
      const rawCat = getVal(['categoria', 'plano', 'planodecontas', 'category']) || '';
      const rawSub = getVal(['subcategoria', 'subcat', 'subcategory']) || '';
      const rawAcc = getVal(['conta', 'banco', 'contabancaria', 'account']) || '';
      const rawPayMethod = getVal(['formadepagamento', 'formapagamento', 'pagamento', 'metodo', 'meiodepagamento']) || '';
      const rawStatus = getVal(['status', 'situacao', 'pago', 'recebido', 'liquidado']) || '';
      const rawPerson = getVal(['recebidode', 'pagoa', 'vaipagarquem', 'fornecedor', 'membro', 'pessoa', 'cliente', 'origem', 'destino']) || '';
      const rawObs = getVal(['observacao', 'obs', 'detalhesadicionais', 'observacoes', 'notes']) || '';

      // Determine value & polarity
      const { value, isNegative } = parseCurrencyValue(rawVal);

      // Determine Type (entrada vs saida)
      let type: 'entrada' | 'saida' = 'entrada';
      if (rawType) {
        const normT = normalizeHeader(String(rawType));
        if (normT.startsWith('d') || normT.startsWith('s') || normT.includes('desp') || normT.includes('saida') || normT.includes('deb')) {
          type = 'saida';
        } else if (normT.startsWith('r') || normT.startsWith('e') || normT.includes('rec') || normT.includes('entr') || normT.includes('cred')) {
          type = 'entrada';
        } else if (isNegative) {
          type = 'saida';
        }
      } else if (isNegative) {
        type = 'saida';
      }

      const parsedDate = parseDateValue(rawDate);
      const parsedDesc = String(rawDesc).trim() || `Lançamento ${index + 1}`;
      const { categoryId, subcategory } = findCategory(String(rawCat), String(rawSub), type);
      const accountId = findAccount(String(rawAcc));

      // Payment method normalization
      let formaPagamento: 'pix' | 'boleto' | 'cartão' | 'dinheiro' | 'débito automático' | 'transferência' | 'cheque' | '' = defaultPaymentMethod;
      if (rawPayMethod) {
        const pmNorm = normalizeHeader(String(rawPayMethod));
        if (pmNorm.includes('pix')) formaPagamento = 'pix';
        else if (pmNorm.includes('bol')) formaPagamento = 'boleto';
        else if (pmNorm.includes('cart') || pmNorm.includes('cred')) formaPagamento = 'cartão';
        else if (pmNorm.includes('dinh') || pmNorm.includes('esp')) formaPagamento = 'dinheiro';
        else if (pmNorm.includes('transf') || pmNorm.includes('ted') || pmNorm.includes('doc')) formaPagamento = 'transferência';
        else if (pmNorm.includes('deb') || pmNorm.includes('aut')) formaPagamento = 'débito automático';
        else if (pmNorm.includes('cheq')) formaPagamento = 'cheque';
      }

      // Status
      let status: 'concluido' | 'pendente' = defaultStatus;
      if (rawStatus) {
        const stNorm = normalizeHeader(String(rawStatus));
        if (stNorm.includes('nao') || stNorm.includes('pend') || stNorm.includes('aberto') || stNorm.includes('agend')) {
          status = 'pendente';
        } else if (stNorm.includes('sim') || stNorm.includes('pago') || stNorm.includes('rec') || stNorm.includes('concl') || stNorm.includes('liq')) {
          status = 'concluido';
        }
      }

      const rowCandidate: Omit<ParsedTransactionRow, 'errors' | 'selected' | 'id'> = {
        type,
        date: parsedDate,
        description: parsedDesc,
        value,
        categoryId,
        subcategory,
        accountId,
        formaPagamento,
        status,
        entidade: String(rawPerson || '').trim(),
        observation: String(rawObs || '').trim()
      };

      const errors = validateRow(rowCandidate);

      rows.push({
        id: `import-row-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        selected: errors.length === 0,
        ...rowCandidate,
        errors
      });
    });

    setParsedRows(rows);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        
        processRawData(jsonData);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao ler a planilha. Certifique-se de que o arquivo é um Excel (.xlsx/.xls) ou CSV válido.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      alert('Erro ao carregar o arquivo selecionado.');
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle pasted text parsing
  const handleParsePastedText = () => {
    if (!pasteContent.trim()) {
      alert('Cole o conteúdo da tabela ou texto antes de processar.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = pasteContent.trim().split(/\r?\n/);
      if (lines.length === 0) return;

      // Detect separator: tab (\t), semicolon (;), or comma (,)
      const firstLine = lines[0];
      let sep = '\t';
      if (firstLine.includes('\t')) sep = '\t';
      else if (firstLine.includes(';')) sep = ';';
      else if (firstLine.includes(',')) sep = ',';

      const headers = lines[0].split(sep).map(h => h.trim());
      const dataRows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(sep).map(v => v.trim());
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        dataRows.push(rowObj);
      }

      if (dataRows.length === 0) {
        alert('Nenhuma linha válida identificada no texto colado.');
        return;
      }

      processRawData(dataRows);
      setSelectedFileName('Conteúdo colado da área de transferência');
    } catch (err) {
      console.error(err);
      alert('Falha ao processar texto colado. Verifique o formato.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate & Download Template
  const handleDownloadTemplate = () => {
    try {
      const sampleRows = [
        {
          'Data': '05/10/2026',
          'Tipo': 'Receita',
          'Descrição': 'Dízimos e Ofertas do Culto de Domingo',
          'Valor': 2450.00,
          'Categoria': categories.find(c => c.type === 'entrada')?.name || 'Dízimos e Ofertas',
          'Subcategoria': 'Dízimos',
          'Conta': accounts[0]?.name || 'Conta Corrente',
          'Forma de Pagamento': 'PIX',
          'Status': 'Recebido',
          'Recebido de / Pago a': 'Membros da Igreja',
          'Observação': 'Culto de celebração'
        },
        {
          'Data': '10/10/2026',
          'Tipo': 'Despesa',
          'Descrição': 'Conta de Energia Elétrica (Enel)',
          'Valor': 380.50,
          'Categoria': categories.find(c => c.type === 'saida')?.name || 'Despesas Fixas',
          'Subcategoria': 'Energia',
          'Conta': accounts[0]?.name || 'Conta Corrente',
          'Forma de Pagamento': 'Boleto',
          'Status': 'Pago',
          'Recebido de / Pago a': 'Enel Distribuição',
          'Observação': 'Vencimento 10/10'
        },
        {
          'Data': '12/10/2026',
          'Tipo': 'Receita',
          'Descrição': 'Doação para Departamento Infantil',
          'Valor': 500.00,
          'Categoria': categories.find(c => c.type === 'entrada')?.name || 'Doações',
          'Subcategoria': 'Infantil',
          'Conta': accounts[0]?.name || 'Conta Corrente',
          'Forma de Pagamento': 'Dinheiro',
          'Status': 'Recebido',
          'Recebido de / Pago a': 'Família Santos',
          'Observação': 'Para festividade das crianças'
        },
        {
          'Data': '15/10/2026',
          'Tipo': 'Despesa',
          'Descrição': 'Material de Limpeza e Higiene',
          'Valor': 175.90,
          'Categoria': categories.find(c => c.type === 'saida')?.name || 'Manutenção',
          'Subcategoria': 'Limpeza',
          'Conta': accounts[0]?.name || 'Caixa Físico',
          'Forma de Pagamento': 'Cartão',
          'Status': 'Pago',
          'Recebido de / Pago a': 'Supermercado Central',
          'Observação': 'Produtos para os banheiros e templo'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleRows);
      ws['!cols'] = [
        { wch: 14 }, // Data
        { wch: 12 }, // Tipo
        { wch: 38 }, // Descrição
        { wch: 14 }, // Valor
        { wch: 24 }, // Categoria
        { wch: 20 }, // Subcategoria
        { wch: 24 }, // Conta
        { wch: 20 }, // Forma de Pagamento
        { wch: 14 }, // Status
        { wch: 26 }, // Recebido de / Pago a
        { wch: 30 }  // Observação
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Modelo Importação SISMNV');

      // Add a reference instructions sheet
      const instructions = [
        { 'Instruções': '1. Preencha as colunas conforme o modelo da primeira aba.' },
        { 'Instruções': '2. Tipos aceitos: "Receita" (Entrada) ou "Despesa" (Saída).' },
        { 'Instruções': '3. Formatos de Data aceitos: DD/MM/AAAA ou AAAA-MM-DD.' },
        { 'Instruções': '4. Formas de Pagamento: PIX, Boleto, Cartão, Dinheiro, Transferência, Cheque, Débito Automático.' },
        { 'Instruções': '5. Você poderá revisar, alterar ou excluir qualquer linha antes de confirmar a importação no sistema.' }
      ];
      const wsHelp = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, wsHelp, 'Como Preencher');

      XLSX.writeFile(wb, 'modelo_importacao_transacoes_sismnv.xlsx');
    } catch (e) {
      console.error('Erro ao baixar modelo:', e);
      alert('Erro ao gerar a planilha modelo.');
    }
  };

  // Modify row
  const updateRow = (id: string, updates: Partial<ParsedTransactionRow>) => {
    setParsedRows(prev =>
      prev.map(row => {
        if (row.id === id) {
          const updated = { ...row, ...updates };
          const errors = validateRow(updated);
          return {
            ...updated,
            errors,
            selected: errors.length === 0 ? updated.selected : false
          };
        }
        return row;
      })
    );
  };

  // Delete row
  const deleteRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // Toggle select row
  const toggleSelectRow = (id: string) => {
    setParsedRows(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const allSelected = filteredRows.every(r => r.selected);
    const targetIds = new Set(filteredRows.map(r => r.id));
    setParsedRows(prev =>
      prev.map(r => {
        if (targetIds.has(r.id) && r.errors.length === 0) {
          return { ...r, selected: !allSelected };
        }
        return r;
      })
    );
  };

  // Bulk account apply
  const applyBulkAccount = () => {
    if (!bulkAccountId) return;
    setParsedRows(prev =>
      prev.map(r => {
        const updated = { ...r, accountId: bulkAccountId };
        return { ...updated, errors: validateRow(updated) };
      })
    );
    setBulkAccountId('');
  };

  // Bulk category apply
  const applyBulkCategory = () => {
    if (!bulkCategoryId) return;
    setParsedRows(prev =>
      prev.map(r => {
        const updated = { ...r, categoryId: bulkCategoryId };
        return { ...updated, errors: validateRow(updated) };
      })
    );
    setBulkCategoryId('');
  };

  // Filtered rows for preview
  const filteredRows = useMemo(() => {
    return parsedRows.filter(r => {
      if (previewFilter === 'valid') return r.errors.length === 0;
      if (previewFilter === 'invalid') return r.errors.length > 0;
      if (previewFilter === 'entrada') return r.type === 'entrada';
      if (previewFilter === 'saida') return r.type === 'saida';
      return true;
    });
  }, [parsedRows, previewFilter]);

  // Statistics
  const stats = useMemo(() => {
    const selected = parsedRows.filter(r => r.selected && r.errors.length === 0);
    const totalSelected = selected.length;
    const totalEntradas = selected.filter(r => r.type === 'entrada').reduce((acc, r) => acc + r.value, 0);
    const totalSaidas = selected.filter(r => r.type === 'saida').reduce((acc, r) => acc + r.value, 0);
    const netBalance = totalEntradas - totalSaidas;
    const validCount = parsedRows.filter(r => r.errors.length === 0).length;
    const invalidCount = parsedRows.filter(r => r.errors.length > 0).length;

    return {
      totalRows: parsedRows.length,
      totalSelected,
      totalEntradas,
      totalSaidas,
      netBalance,
      validCount,
      invalidCount
    };
  }, [parsedRows]);

  // Final confirmation & import
  const handleConfirmImport = () => {
    const toImport = parsedRows.filter(r => r.selected && r.errors.length === 0);
    if (toImport.length === 0) {
      alert('Nenhum lançamento válido selecionado para importação.');
      return;
    }

    const newTransactions: Transaction[] = toImport.map((row, idx) => {
      const now = Date.now() + idx;
      const isEntrada = row.type === 'entrada';

      return {
        id: `tx-bulk-${now}-${Math.random().toString(36).substr(2, 6)}`,
        description: row.description.trim(),
        value: row.value,
        type: row.type,
        categoryId: row.categoryId,
        subcategory: row.subcategory || undefined,
        accountId: row.accountId,
        date: row.date,
        observation: row.observation ? row.observation.trim() : undefined,
        recebido: isEntrada ? (row.status === 'concluido' ? 'sim' : 'nao') : undefined,
        recebidoDe: isEntrada ? (row.entidade || undefined) : undefined,
        dataRecebido: isEntrada && row.status === 'concluido' ? row.date : undefined,
        dataLancamento: row.date,
        parcelamento: 'nao',
        formaPagamento: row.formaPagamento || undefined,
        pago: !isEntrada ? (row.status === 'concluido' ? 'sim' : 'nao') : undefined,
        vaiPagarQuem: !isEntrada ? (row.entidade || undefined) : undefined,
        dataVencimento: !isEntrada ? row.date : undefined
      };
    });

    onImport(newTransactions);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setParsedRows([]);
    setPasteContent('');
    setSelectedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isHighContrast
            ? 'bg-white text-zinc-900 border-zinc-300'
            : 'bg-zinc-950 text-zinc-100 border-zinc-800'
        }`}
      >
        {/* Header */}
        <div className={`p-5 sm:px-6 border-b flex items-center justify-between shrink-0 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/15 text-indigo-500 border border-indigo-500/20">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Importar Receitas e Despesas em Massa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Excel & CSV
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Envie uma planilha ou cole dados para lançar múltiplas entradas e saídas de uma só vez.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isHighContrast
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Baixar planilha de exemplo pré-formatada"
            >
              <Download size={14} />
              <span>Baixar Modelo (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {parsedRows.length === 0 ? (
            /* STEP 1: UPLOAD / PASTE VIEW */
            <div className="space-y-6">
              {/* Tab Selector & Mobile Template Download */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className={`inline-flex p-1 rounded-xl border ${
                  isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload size={14} />
                    <span>Upload de Planilha (.xlsx / .csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'paste'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clipboard size={14} />
                    <span>Copiar e Colar Tabela</span>
                  </button>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className={`sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
                    isHighContrast
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <Download size={14} />
                  <span>Baixar Modelo (.xlsx)</span>
                </button>
              </div>

              {/* Default Fallbacks Configuration */}
              <div className={`p-4 rounded-xl border ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/80'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Preenchimento Automático & Padrões (Caso não especificado na planilha)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Conta Bancária Padrão
                    </label>
                    <select
                      value={defaultAccountId}
                      onChange={e => setDefaultAccountId(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Categoria Padrão (Receitas)
                    </label>
                    <select
                      value={defaultInflowCatId}
                      onChange={e => setDefaultInflowCatId(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {categories
                        .filter(c => c.type === 'entrada' || c.type === 'ambas')
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Categoria Padrão (Despesas)
                    </label>
                    <select
                      value={defaultOutflowCatId}
                      onChange={e => setDefaultOutflowCatId(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {categories
                        .filter(c => c.type === 'saida' || c.type === 'ambas')
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Status Padrão
                    </label>
                    <select
                      value={defaultStatus}
                      onChange={e => setDefaultStatus(e.target.value as any)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="concluido">Concluído (Já Recebido / Já Pago)</option>
                      <option value="pendente">Pendente (A Receber / A Pagar)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TAB 1: FILE DROP ZONE */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                      : isHighContrast
                        ? 'border-zinc-300 hover:border-indigo-400 bg-zinc-50 hover:bg-zinc-100/60'
                        : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/20 hover:bg-zinc-900/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg">
                    <Upload size={30} />
                  </div>

                  <h4 className="text-base font-bold text-zinc-100">
                    {isProcessing ? 'Processando arquivo...' : 'Arraste e solte sua planilha aqui'}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mt-1.5">
                    Suporta arquivos <span className="font-semibold text-indigo-400">.XLSX</span>, <span className="font-semibold text-emerald-400">.XLS</span> ou <span className="font-semibold text-amber-400">.CSV</span> exportados de bancos, sistemas legados ou do Excel.
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all">
                      Selecionar Arquivo no Computador
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE TEXT */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>Cole as linhas copiadas do Excel, Google Sheets ou Bloco de Notas:</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        Dica: Inclua a linha de cabeçalho na primeira linha para mapeamento automático
                      </span>
                    </label>
                    <textarea
                      rows={9}
                      value={pasteContent}
                      onChange={e => setPasteContent(e.target.value)}
                      placeholder={`Data\tTipo\tDescrição\tValor\tCategoria\tConta\n01/10/2026\tReceita\tDízimo Mensal\t1500,00\tDízimos\tConta Itaú\n02/10/2026\tDespesa\tEnergia Elétrica\t340,50\tDespesas Fixas\tConta Itaú`}
                      className={`w-full p-4 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                        isHighContrast
                          ? 'bg-white border-zinc-300 text-zinc-800'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder:text-zinc-600'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPasteContent('')}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!pasteContent.trim() || isProcessing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      <Sparkles size={14} />
                      <span>{isProcessing ? 'Processando...' : 'Processar e Visualizar Dados'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions guide */}
              <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/20 border-zinc-800/60'
              }`}>
                <div className="flex gap-3 items-start">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 mb-0.5">Detecção Inteligente</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Reconhece colunas com variações de nomes: Data, Tipo, Descrição/Histórico, Valor, Categoria e Conta Bancária.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 mb-0.5">Receitas e Despesas Juntas</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Importe entradas e saídas no mesmo arquivo. Se o valor for negativo ou o tipo for "Despesa", ele classifica automaticamente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-200 mb-0.5">Revisão Antes de Salvar</h5>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Você pode editar qualquer dado diretamente na tabela de prévia antes de efetivar o lançamento definitivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW & EDITING TABLE */
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Selecionado</p>
                  <p className="text-lg font-black mt-1 text-zinc-100">
                    {stats.totalSelected} <span className="text-xs font-normal text-zinc-500">de {stats.totalRows}</span>
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/30'
                }`}>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpRight size={12} /> Total Receitas
                  </p>
                  <p className="text-lg font-mono font-bold mt-1 text-emerald-400">
                    +{formatCurrency(stats.totalEntradas)}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-800/30'
                }`}>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <ArrowDownRight size={12} /> Total Despesas
                  </p>
                  <p className="text-lg font-mono font-bold mt-1 text-rose-400">
                    -{formatCurrency(stats.totalSaidas)}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-800/30'
                }`}>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Saldo Líquido Previsto</p>
                  <p className={`text-lg font-mono font-bold mt-1 ${stats.netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {stats.netBalance >= 0 ? '+' : ''}{formatCurrency(stats.netBalance)}
                  </p>
                </div>
              </div>

              {/* Table Toolbar & Bulk Actions */}
              <div className={`p-3.5 rounded-xl border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 ${
                isHighContrast ? 'bg-zinc-100/70 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/80'
              }`}>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Todos ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('entrada')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewFilter === 'entrada' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Receitas ({parsedRows.filter(r => r.type === 'entrada').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('saida')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewFilter === 'saida' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Despesas ({parsedRows.filter(r => r.type === 'saida').length})
                  </button>
                  {stats.invalidCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('invalid')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewFilter === 'invalid'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                      }`}
                    >
                      <AlertTriangle size={12} />
                      Com Avisos ({stats.invalidCount})
                    </button>
                  )}
                </div>

                {/* Bulk Modifiers */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={bulkAccountId}
                      onChange={e => setBulkAccountId(e.target.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Aplicar Conta a Todos...</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkAccount}
                      disabled={!bulkAccountId}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={bulkCategoryId}
                      onChange={e => setBulkCategoryId(e.target.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Aplicar Categoria a Todos...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkCategory}
                      disabled={!bulkCategoryId}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/40 cursor-pointer"
                    title="Descartar e carregar outro arquivo"
                  >
                    <RefreshCw size={12} />
                    <span>Recarregar</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className={`rounded-xl border overflow-x-auto max-h-[46vh] ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className={`sticky top-0 z-10 select-none ${
                    isHighContrast ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <tr className="border-b border-zinc-800">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredRows.length > 0 && filteredRows.every(r => r.selected)}
                          onChange={toggleSelectAll}
                          className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-2 w-28 font-bold uppercase tracking-wider text-[10px]">Tipo</th>
                      <th className="py-3 px-2 w-32 font-bold uppercase tracking-wider text-[10px]">Data</th>
                      <th className="py-3 px-2 min-w-[200px] font-bold uppercase tracking-wider text-[10px]">Descrição</th>
                      <th className="py-3 px-2 w-32 font-bold uppercase tracking-wider text-[10px]">Valor (R$)</th>
                      <th className="py-3 px-2 min-w-[150px] font-bold uppercase tracking-wider text-[10px]">Categoria</th>
                      <th className="py-3 px-2 min-w-[150px] font-bold uppercase tracking-wider text-[10px]">Conta</th>
                      <th className="py-3 px-2 min-w-[130px] font-bold uppercase tracking-wider text-[10px]">Pagamento</th>
                      <th className="py-3 px-2 min-w-[140px] font-bold uppercase tracking-wider text-[10px]">Origem / Destino</th>
                      <th className="py-3 px-2 w-12 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {filteredRows.map((row) => {
                      const hasError = row.errors.length > 0;
                      const isEntrada = row.type === 'entrada';
                      const selectedCat = categories.find(c => c.id === row.categoryId);

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            hasError
                              ? 'bg-amber-950/15'
                              : row.selected
                                ? isHighContrast
                                  ? 'bg-indigo-50/40 hover:bg-indigo-50/70'
                                  : 'bg-zinc-900/30 hover:bg-zinc-900/60'
                                : 'opacity-60 hover:opacity-100 hover:bg-zinc-900/20'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              disabled={hasError}
                              onChange={() => toggleSelectRow(row.id)}
                              className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer disabled:opacity-30"
                            />
                          </td>

                          {/* Tipo */}
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newType = isEntrada ? 'saida' : 'entrada';
                                const fallbackCat = newType === 'entrada' ? defaultInflowCatId : defaultOutflowCatId;
                                updateRow(row.id, { type: newType, categoryId: fallbackCat });
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                isEntrada
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                              }`}
                            >
                              {isEntrada ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              <span>{isEntrada ? 'Receita' : 'Despesa'}</span>
                            </button>
                          </td>

                          {/* Data */}
                          <td className="py-2 px-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={e => updateRow(row.id, { date: e.target.value })}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono ${
                                isHighContrast ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </td>

                          {/* Descrição */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.description}
                              onChange={e => updateRow(row.id, { description: e.target.value })}
                              placeholder="Descrição do lançamento"
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                !row.description.trim()
                                  ? 'border-amber-500 bg-amber-500/10'
                                  : isHighContrast
                                    ? 'bg-white border-zinc-300 text-zinc-800'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                            {hasError && (
                              <p className="text-[10px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                                <AlertCircle size={10} /> {row.errors.join(', ')}
                              </p>
                            )}
                          </td>

                          {/* Valor */}
                          <td className="py-2 px-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={row.value || ''}
                                onChange={e => updateRow(row.id, { value: parseFloat(e.target.value) || 0 })}
                                className={`w-full pl-7 pr-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                                  isEntrada ? 'text-emerald-400' : 'text-rose-400'
                                } ${
                                  row.value <= 0
                                    ? 'border-amber-500 bg-amber-500/10'
                                    : isHighContrast
                                      ? 'bg-white border-zinc-300'
                                      : 'bg-zinc-900 border-zinc-800'
                                }`}
                              />
                            </div>
                          </td>

                          {/* Categoria */}
                          <td className="py-2 px-2">
                            <select
                              value={row.categoryId}
                              onChange={e => updateRow(row.id, { categoryId: e.target.value, subcategory: '' })}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              {categories
                                .filter(c => isEntrada ? (c.type === 'entrada' || c.type === 'ambas') : (c.type === 'saida' || c.type === 'ambas'))
                                .map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                          </td>

                          {/* Conta */}
                          <td className="py-2 px-2">
                            <select
                              value={row.accountId}
                              onChange={e => updateRow(row.id, { accountId: e.target.value })}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                              ))}
                            </select>
                          </td>

                          {/* Pagamento */}
                          <td className="py-2 px-2">
                            <select
                              value={row.formaPagamento}
                              onChange={e => updateRow(row.id, { formaPagamento: e.target.value as any })}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              <option value="pix">PIX</option>
                              <option value="boleto">Boleto</option>
                              <option value="cartão">Cartão</option>
                              <option value="dinheiro">Dinheiro</option>
                              <option value="transferência">Transferência</option>
                              <option value="débito automático">Débito Aut.</option>
                              <option value="cheque">Cheque</option>
                            </select>
                          </td>

                          {/* Origem / Destino */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.entidade}
                              onChange={e => updateRow(row.id, { entidade: e.target.value })}
                              placeholder={isEntrada ? 'Recebido de...' : 'Pago a...'}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </td>

                          {/* Ações */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remover este lançamento"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 sm:px-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {parsedRows.length > 0 && (
              <span className="font-semibold">
                Arquivo: <span className="text-zinc-200">{selectedFileName || 'Planilha'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={stats.totalSelected === 0}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Check size={16} />
                <span>Confirmar e Importar {stats.totalSelected} {stats.totalSelected === 1 ? 'Lançamento' : 'Lançamentos'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
