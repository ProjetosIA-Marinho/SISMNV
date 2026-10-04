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
  Sparkles,
  Clipboard,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  ArrowRight,
  Landmark,
  FileText,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BankAccount, Transfer } from '../types';

interface BulkTransferImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onImport: (newTransfers: Transfer[]) => void;
  isHighContrast?: boolean;
}

interface ParsedTransferRow {
  id: string;
  selected: boolean;
  date: string; // YYYY-MM-DD
  sourceAccountId: string;
  destinationAccountId: string;
  value: number;
  observation: string;
  errors: string[];
}

export const BulkTransferImportModal: React.FC<BulkTransferImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onImport,
  isHighContrast = false
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedTransferRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  // Default values
  const [defaultSourceId, setDefaultSourceId] = useState<string>(accounts[0]?.id || '');
  const [defaultDestId, setDefaultDestId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');

  // Bulk modification states
  const [bulkSourceId, setBulkSourceId] = useState('');
  const [bulkDestId, setBulkDestId] = useState('');
  const [bulkDate, setBulkDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Normalization helper
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Helper to parse dates from various formats
  const parseDateValue = (raw: any): string => {
    if (!raw) return new Date().toISOString().split('T')[0];

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

    // DD/MM/YYYY
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

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  };

  // Helper to parse currency values
  const parseCurrencyValue = (raw: any): number => {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === 'number') return Math.abs(raw);

    let str = String(raw).trim();
    str = str.replace(/[R$\s]/g, '');

    if (str.includes(',') && str.includes('.')) {
      if (str.indexOf('.') < str.indexOf(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    }

    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.abs(num);
  };

  // Helper to find account by text
  const matchAccount = (raw: any, fallbackId: string): string => {
    if (!raw) return fallbackId;
    const str = String(raw).trim();
    const norm = normalizeText(str);
    if (!norm) return fallbackId;

    const direct = accounts.find(a => 
      normalizeText(a.name) === norm ||
      normalizeText(a.bankName) === norm ||
      normalizeText(a.accountNumber) === norm ||
      normalizeText(`${a.name} ${a.bankName}`) === norm
    );
    if (direct) return direct.id;

    const partial = accounts.find(a => 
      normalizeText(a.name).includes(norm) ||
      norm.includes(normalizeText(a.name)) ||
      normalizeText(a.bankName).includes(norm) ||
      norm.includes(normalizeText(a.bankName))
    );
    if (partial) return partial.id;

    return fallbackId;
  };

  // Row validator
  const validateRow = (row: {
    sourceAccountId: string;
    destinationAccountId: string;
    value: number;
    date: string;
  }): string[] => {
    const errors: string[] = [];

    if (!row.sourceAccountId) {
      errors.push('Conta de origem é obrigatória');
    }
    if (!row.destinationAccountId) {
      errors.push('Conta de destino é obrigatória');
    }
    if (row.sourceAccountId && row.destinationAccountId && row.sourceAccountId === row.destinationAccountId) {
      errors.push('A conta de origem não pode ser igual à conta de destino');
    }
    if (!row.value || row.value <= 0) {
      errors.push('Valor da transferência deve ser maior que zero');
    }
    if (!row.date || isNaN(new Date(row.date).getTime())) {
      errors.push('Data inválida');
    }

    return errors;
  };

  // Process array of raw objects
  const processRawData = (data: Record<string, any>[]) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado encontrado no arquivo ou texto fornecido.');
      return;
    }

    const rows: ParsedTransferRow[] = [];

    data.forEach((item, index) => {
      const keys = Object.keys(item);
      const getVal = (possibleHeaders: string[]): any => {
        for (const k of keys) {
          const normK = normalizeText(k);
          if (possibleHeaders.some(ph => normK === normalizeText(ph) || normK.includes(normalizeText(ph)))) {
            return item[k];
          }
        }
        return undefined;
      };

      const rawDate = getVal(['data', 'datatransferencia', 'dia', 'date', 'dt']);
      const rawSource = getVal(['contaorigem', 'origem', 'de', 'contadebito', 'bancoorigem', 'sourceaccount', 'saidade']);
      const rawDest = getVal(['contadestino', 'destino', 'para', 'contacredito', 'bancodestino', 'destinationaccount', 'entradapara']);
      const rawValue = getVal(['valor', 'valortransferido', 'quantia', 'total', 'value', 'amount', 'vlr']);
      const rawObs = getVal(['observacao', 'observacoes', 'historico', 'descricao', 'obs', 'memo', 'detalhes', 'description']);

      if (!rawDate && !rawSource && !rawDest && !rawValue) return;

      const date = parseDateValue(rawDate);
      const value = parseCurrencyValue(rawValue);
      const sourceAccountId = matchAccount(rawSource, defaultSourceId);
      const destinationAccountId = matchAccount(rawDest, defaultDestId);
      const observation = rawObs ? String(rawObs).trim() : '';

      const errors = validateRow({
        sourceAccountId,
        destinationAccountId,
        value,
        date
      });

      rows.push({
        id: `parsed-tf-${Date.now()}-${index}`,
        selected: errors.length === 0,
        date,
        sourceAccountId,
        destinationAccountId,
        value,
        observation,
        errors
      });
    });

    if (rows.length === 0) {
      alert('Nenhum registro válido pôde ser extraído.');
      return;
    }

    setParsedRows(rows);
  };

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setSelectedFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        processRawData(jsonData);
      } catch (err) {
        console.error('Erro ao processar arquivo:', err);
        alert('Erro ao ler a planilha. Verifique a estrutura do arquivo.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      alert('Erro na leitura do arquivo.');
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Paste Processing
  const handleProcessPaste = () => {
    if (!pasteContent.trim()) {
      alert('Cole o conteúdo da tabela ou planilha antes de processar.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = pasteContent.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        alert('É necessário colar pelo menos 1 linha de cabeçalho e 1 linha de dados.');
        setIsProcessing(false);
        return;
      }

      const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

      const data: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
        });
        data.push(rowObj);
      }

      setSelectedFileName('Conteúdo Colado da Área de Transferência');
      processRawData(data);
    } catch (err) {
      console.error('Erro ao processar texto colado:', err);
      alert('Não foi possível interpretar o texto colado. Certifique-se de que os dados estão separados por tabulação, ponto e vírgula ou vírgula.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Template generators
  const handleDownloadExcelTemplate = () => {
    const defaultAcc1 = accounts[0]?.name || 'Conta Caixa Físico';
    const defaultAcc2 = accounts[1]?.name || 'Banco do Brasil - CC';
    const defaultAcc3 = accounts[2]?.name || 'Reserva Santander';

    const sampleData = [
      {
        'Data': '15/07/2026',
        'Conta Origem': defaultAcc1,
        'Conta Destino': defaultAcc2,
        'Valor': 1250.00,
        'Observações': 'Depósito de dinheiro das ofertas no banco'
      },
      {
        'Data': '18/07/2026',
        'Conta Origem': defaultAcc2,
        'Conta Destino': defaultAcc3,
        'Valor': 3500.00,
        'Observações': 'Aporte mensal para fundo de obras e reformas'
      },
      {
        'Data': '22/07/2026',
        'Conta Origem': defaultAcc2,
        'Conta Destino': defaultAcc1,
        'Valor': 400.00,
        'Observações': 'Saque para suprimento do caixa miúdo'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transferencias_Modelo');

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 28 },
      { wch: 16 },
      { wch: 45 }
    ];

    XLSX.writeFile(workbook, 'modelo_importacao_transferencias_sismnv.xlsx');
  };

  const handleDownloadCSVTemplate = () => {
    const defaultAcc1 = accounts[0]?.name || 'Conta Caixa Físico';
    const defaultAcc2 = accounts[1]?.name || 'Banco do Brasil - CC';

    const csvContent = [
      'Data;Conta Origem;Conta Destino;Valor;Observações',
      `15/07/2026;${defaultAcc1};${defaultAcc2};1250,00;Depósito de dinheiro das ofertas no banco`,
      `18/07/2026;${defaultAcc2};${accounts[2]?.name || 'Reserva Santander'};3500,00;Aporte mensal de reformas`,
      `22/07/2026;${defaultAcc2};${defaultAcc1};400,00;Saque para suprimento de caixa miúdo`
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_transferencias_sismnv.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Row update handlers
  const updateRow = (id: string, field: keyof ParsedTransferRow, value: any) => {
    setParsedRows(prev => prev.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        const errors = validateRow({
          sourceAccountId: updated.sourceAccountId,
          destinationAccountId: updated.destinationAccountId,
          value: updated.value,
          date: updated.date
        });
        return {
          ...updated,
          errors,
          selected: errors.length === 0 ? updated.selected : false
        };
      }
      return row;
    }));
  };

  const removeRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  const toggleSelectRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = (checked: boolean) => {
    setParsedRows(prev => prev.map(r => ({
      ...r,
      selected: checked && r.errors.length === 0
    })));
  };

  // Bulk Apply
  const applyBulkSource = () => {
    if (!bulkSourceId) return;
    setParsedRows(prev => prev.map(r => {
      if (!r.selected) return r;
      const updated = { ...r, sourceAccountId: bulkSourceId };
      const errors = validateRow({
        sourceAccountId: updated.sourceAccountId,
        destinationAccountId: updated.destinationAccountId,
        value: updated.value,
        date: updated.date
      });
      return { ...updated, errors };
    }));
  };

  const applyBulkDest = () => {
    if (!bulkDestId) return;
    setParsedRows(prev => prev.map(r => {
      if (!r.selected) return r;
      const updated = { ...r, destinationAccountId: bulkDestId };
      const errors = validateRow({
        sourceAccountId: updated.sourceAccountId,
        destinationAccountId: updated.destinationAccountId,
        value: updated.value,
        date: updated.date
      });
      return { ...updated, errors };
    }));
  };

  const applyBulkDate = () => {
    if (!bulkDate) return;
    setParsedRows(prev => prev.map(r => {
      if (!r.selected) return r;
      const updated = { ...r, date: bulkDate };
      const errors = validateRow({
        sourceAccountId: updated.sourceAccountId,
        destinationAccountId: updated.destinationAccountId,
        value: updated.value,
        date: updated.date
      });
      return { ...updated, errors };
    }));
  };

  // Calculations
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter(r => r.errors.length === 0).length;
    const invalid = parsedRows.filter(r => r.errors.length > 0).length;
    const selected = parsedRows.filter(r => r.selected && r.errors.length === 0).length;
    const totalValue = parsedRows
      .filter(r => r.selected && r.errors.length === 0)
      .reduce((sum, r) => sum + r.value, 0);

    return { total, valid, invalid, selected, totalValue };
  }, [parsedRows]);

  const filteredRows = useMemo(() => {
    if (previewFilter === 'valid') return parsedRows.filter(r => r.errors.length === 0);
    if (previewFilter === 'invalid') return parsedRows.filter(r => r.errors.length > 0);
    return parsedRows;
  }, [parsedRows, previewFilter]);

  // Final Import action
  const handleConfirmImport = () => {
    const validSelectedRows = parsedRows.filter(r => r.selected && r.errors.length === 0);
    if (validSelectedRows.length === 0) {
      alert('Nenhuma transferência válida selecionada para importação.');
      return;
    }

    const newTransfers: Transfer[] = validSelectedRows.map((r, idx) => ({
      id: `tf-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      sourceAccountId: r.sourceAccountId,
      destinationAccountId: r.destinationAccountId,
      value: r.value,
      date: r.date,
      observation: r.observation || undefined
    }));

    onImport(newTransfers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isHighContrast
            ? 'bg-white border-zinc-300 text-zinc-900'
            : 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-indigo-950/20'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between gap-4 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <RefreshCw size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Importação em Massa de Transferências
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Excel & CSV
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Transfira saldos entre contas bancárias e caixas da igreja importando planilhas em lote.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {parsedRows.length === 0 ? (
            <div className="space-y-6">
              {/* Tabs for Source Mode */}
              <div className="flex border-b border-zinc-800 gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Upload size={16} />
                  <span>Carregar Arquivo (.xlsx / .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'paste'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Clipboard size={16} />
                  <span>Copiar & Colar Planilha</span>
                </button>
              </div>

              {/* Template Download Prompt */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isHighContrast ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">
                      Precisa do modelo com as contas cadastradas?
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Baixe a planilha pronta com as colunas: <strong>Data | Conta Origem | Conta Destino | Valor | Observações</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <Download size={13} />
                    <span>Modelo Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCSVTemplate}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      isHighContrast ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <FileText size={13} />
                    <span>Modelo CSV</span>
                  </button>
                </div>
              </div>

              {/* Upload Tab Area */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                      : isHighContrast
                        ? 'border-zinc-300 hover:border-indigo-500 bg-zinc-50 hover:bg-indigo-50/20'
                        : 'border-zinc-800 hover:border-indigo-500/60 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />

                  <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-200">
                    Arraste e solte o arquivo aqui ou clique para selecionar
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Formatos suportados: Microsoft Excel (.xlsx, .xls) e Arquivos de Texto (.csv)
                  </p>
                </div>
              )}

              {/* Paste Tab Area */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>Cole as linhas copiadas do seu Excel ou Google Sheets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = [
                          'Data\tConta Origem\tConta Destino\tValor\tObservações',
                          `15/07/2026\t${accounts[0]?.name || 'Caixa'}\t${accounts[1]?.name || 'Banco'}\t1250,00\tDepósito de ofertas`,
                          `18/07/2026\t${accounts[1]?.name || 'Banco'}\t${accounts[2]?.name || 'Poupança'}\t3500,00\tAporte reservas`
                        ].join('\n');
                        setPasteContent(sample);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                    >
                      Preencher Exemplo
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder={`Data\tConta Origem\tConta Destino\tValor\tObservações\n15/07/2026\tConta Caixa\tBanco do Brasil\t1500,00\tAporte no banco`}
                    className={`w-full p-4 rounded-xl font-mono text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 scrollbar-thin ${
                      isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
                    }`}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleProcessPaste}
                      disabled={!pasteContent.trim() || isProcessing}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
                    >
                      <Sparkles size={14} />
                      <span>Processar Transferências</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Default fallbacks configuration */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800/80'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Landmark size={14} className="text-indigo-400" />
                  Contas Padrão (utilizadas caso a planilha não informe origem/destino)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Conta de Origem Padrão:
                    </label>
                    <select
                      value={defaultSourceId}
                      onChange={(e) => setDefaultSourceId(e.target.value)}
                      className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                      Conta de Destino Padrão:
                    </label>
                    <select
                      value={defaultDestId}
                      onChange={(e) => setDefaultDestId(e.target.value)}
                      className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW & VALIDATION SCREEN */
            <div className="space-y-4">
              {/* Top summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Total Lido</span>
                  <span className="text-base sm:text-lg font-black text-zinc-200">{stats.total} transferências</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 block">Válidas para Importar</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">{stats.valid}</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  stats.invalid > 0
                    ? isHighContrast ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-800/40'
                    : isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                }`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${stats.invalid > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                    Com Pendência / Erro
                  </span>
                  <span className={`text-base sm:text-lg font-black ${stats.invalid > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                    {stats.invalid}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/20 border-indigo-800/40'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 block">Volume Selecionado</span>
                  <span className="text-base sm:text-lg font-black text-indigo-400">{formatCurrency(stats.totalValue)}</span>
                </div>
              </div>

              {/* Bulk Adjustment Bar */}
              <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                isHighContrast ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Ajuste em Massa (Selecionados):
                  </span>

                  {/* Set Source */}
                  <div className="flex items-center gap-1">
                    <select
                      value={bulkSourceId}
                      onChange={(e) => setBulkSourceId(e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Origem...</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkSource}
                      disabled={!bulkSourceId}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>

                  {/* Set Destination */}
                  <div className="flex items-center gap-1">
                    <select
                      value={bulkDestId}
                      onChange={(e) => setBulkDestId(e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Destino...</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkDest}
                      disabled={!bulkDestId}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>

                  {/* Set Date */}
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={applyBulkDate}
                      disabled={!bulkDate}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Filter and Reset */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      previewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Todas ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      previewFilter === 'valid' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Válidas ({stats.valid})
                  </button>
                  {stats.invalid > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('invalid')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        previewFilter === 'invalid' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Erros ({stats.invalid})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setParsedRows([])}
                    className="ml-2 text-zinc-400 hover:text-rose-400 text-xs font-semibold cursor-pointer underline"
                  >
                    Limpar / Carregar Outro
                  </button>
                </div>
              </div>

              {/* Editable Table of Parsed Transfers */}
              <div className={`border rounded-xl overflow-x-auto scrollbar-thin ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${
                      isHighContrast ? 'bg-zinc-50 text-zinc-500 border-zinc-200' : 'bg-zinc-900/40 text-zinc-400 border-zinc-800'
                    }`}>
                      <th className="p-3 w-10 text-center select-none">
                        <input
                          type="checkbox"
                          checked={stats.valid > 0 && stats.selected === stats.valid}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
                          title="Selecionar todas válidas"
                        />
                      </th>
                      <th className="p-3 w-32">Data</th>
                      <th className="p-3 min-w-[180px]">Conta Origem (Saída)</th>
                      <th className="p-3 min-w-[180px]">Conta Destino (Entrada)</th>
                      <th className="p-3 w-32">Valor (R$)</th>
                      <th className="p-3 min-w-[200px]">Observação / Histórico</th>
                      <th className="p-3 text-right w-16">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-xs">
                    {filteredRows.map((row) => {
                      const hasError = row.errors.length > 0;
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            hasError
                              ? isHighContrast ? 'bg-rose-50/50' : 'bg-rose-950/20'
                              : row.selected
                                ? isHighContrast ? 'bg-indigo-50/60' : 'bg-indigo-950/20'
                                : 'hover:bg-zinc-500/5'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              disabled={hasError}
                              onChange={() => toggleSelectRow(row.id)}
                              className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer disabled:opacity-30"
                            />
                          </td>

                          {/* Data */}
                          <td className="p-3">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                              className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none w-full ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </td>

                          {/* Origem */}
                          <td className="p-3">
                            <select
                              value={row.sourceAccountId}
                              onChange={(e) => updateRow(row.id, 'sourceAccountId', e.target.value)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded border focus:outline-none w-full ${
                                isHighContrast ? 'bg-white border-zinc-200 text-red-600 font-bold' : 'bg-zinc-900 border-zinc-800 text-rose-400 font-bold'
                              }`}
                            >
                              <option value="">Selecione a origem...</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                              ))}
                            </select>
                          </td>

                          {/* Destino */}
                          <td className="p-3">
                            <select
                              value={row.destinationAccountId}
                              onChange={(e) => updateRow(row.id, 'destinationAccountId', e.target.value)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded border focus:outline-none w-full ${
                                isHighContrast ? 'bg-white border-zinc-200 text-emerald-600 font-bold' : 'bg-zinc-900 border-zinc-800 text-emerald-400 font-bold'
                              }`}
                            >
                              <option value="">Selecione o destino...</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                              ))}
                            </select>
                          </td>

                          {/* Valor */}
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.value || ''}
                              onChange={(e) => updateRow(row.id, 'value', parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className={`text-[11px] font-mono font-bold px-2 py-1 rounded border focus:outline-none w-full ${
                                isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-indigo-400'
                              }`}
                            />
                          </td>

                          {/* Observações & Erros */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={row.observation}
                                onChange={(e) => updateRow(row.id, 'observation', e.target.value)}
                                placeholder="Histórico da transferência..."
                                className={`text-[11px] px-2 py-1 rounded border focus:outline-none w-full ${
                                  isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                                }`}
                              />
                              {hasError && (
                                <div className="flex flex-wrap gap-1 text-[10px] text-rose-400">
                                  {row.errors.map((err, errIdx) => (
                                    <span key={errIdx} className="inline-flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                      <AlertTriangle size={10} /> {err}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Ações */}
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remover linha"
                            >
                              <Trash2 size={13} />
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

        {/* Footer with Actions */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="text-xs text-zinc-400">
            {parsedRows.length > 0 ? (
              <span>
                <strong className="text-indigo-400">{stats.selected}</strong> de <strong>{stats.valid}</strong> transferências válidas selecionadas para importação.
              </span>
            ) : (
              <span>Selecione uma planilha ou cole os dados para iniciar o mapeamento.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isHighContrast
                  ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                  : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Cancelar
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={stats.selected === 0}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-95"
              >
                <Check size={14} />
                <span>Importar {stats.selected} Transferência(s)</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
