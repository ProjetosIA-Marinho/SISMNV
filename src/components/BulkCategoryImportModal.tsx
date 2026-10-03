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
  Layers,
  Tags,
  Check,
  RefreshCw,
  FolderTree,
  Hash,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TransactionCategory } from '../types';

interface BulkCategoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: TransactionCategory[];
  onImport: (categoriesToSave: TransactionCategory[], mergeStrategy: 'merge' | 'replace') => void;
  isHighContrast?: boolean;
}

interface ParsedCategoryRow {
  id: string;
  selected: boolean;
  code: string;
  name: string;
  type: 'entrada' | 'saida' | 'ambas';
  group: string;
  parentCategory: string;
  description: string;
  colorKey: string;
  subcategories: string[];
  subcategoriesRaw: string;
  isExisting: boolean;
  errors: string[];
}

const COLOR_PALETTE: Record<string, { label: string; class: string }> = {
  emerald: { label: 'Esmeralda / Verde', class: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' },
  blue: { label: 'Azul', class: 'bg-blue-500/15 text-blue-500 border-blue-500/20' },
  purple: { label: 'Roxo', class: 'bg-purple-500/15 text-purple-500 border-purple-500/20' },
  amber: { label: 'Âmbar / Laranja', class: 'bg-amber-500/15 text-amber-500 border-amber-500/20' },
  rose: { label: 'Rosa / Vermelho', class: 'bg-rose-500/15 text-rose-500 border-rose-500/20' },
  sky: { label: 'Céu / Azul Claro', class: 'bg-sky-500/15 text-sky-500 border-sky-500/20' },
  indigo: { label: 'Índigo', class: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/20' },
};

export const BulkCategoryImportModal: React.FC<BulkCategoryImportModalProps> = ({
  isOpen,
  onClose,
  existingCategories,
  onImport,
  isHighContrast = false
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCategoryRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'replace'>('merge');
  
  // Default values
  const [defaultType, setDefaultType] = useState<'entrada' | 'saida' | 'ambas'>('saida');
  const [defaultGroup, setDefaultGroup] = useState<string>('Despesas Fixas');
  
  // Bulk action states
  const [bulkGroup, setBulkGroup] = useState('');
  const [bulkType, setBulkType] = useState('');
  const [bulkParentCategory, setBulkParentCategory] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalization helper
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Helper to validate a row
  const validateRow = (name: string): string[] => {
    const errors: string[] = [];
    if (!name || !name.trim()) {
      errors.push('Nome da categoria obrigatório');
    }
    return errors;
  };

  // Process array of raw objects
  const processRawData = (data: Record<string, any>[]) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado encontrado no arquivo ou texto fornecido.');
      return;
    }

    const rows: ParsedCategoryRow[] = [];
    const colorKeys = Object.keys(COLOR_PALETTE);

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

      const rawCode = getVal(['codigo', 'cod', 'code', 'id']) || '';
      const rawName = getVal(['categoria', 'categoriapai', 'nome', 'titulocategoria', 'category', 'name']) || '';
      const rawType = getVal(['tipo', 'fluxo', 'tipodefluxo', 'natureza', 'type']) || '';
      const rawGroup = getVal(['grupo', 'classificacao', 'classificacaodre', 'macro', 'grupomacro', 'maincategory']) || '';
      const rawParent = getVal(['categoriapai', 'pai', 'parent', 'parentcategory', 'categoriaorigem']) || '';
      const rawDesc = getVal(['descricao', 'detalhes', 'observacao', 'obs', 'description', 'finalidade']) || '';
      const rawSubs = getVal(['subcategorias', 'subcategoria', 'subcategories', 'itens', 'subitens']) || '';
      const rawColor = getVal(['cor', 'color', 'coloracao']) || '';

      const name = String(rawName).trim();
      if (!name && !rawSubs) return; // Skip empty row

      // Determine Code (Auto generate if empty, e.g., 1.01 or index)
      let code = String(rawCode).trim();
      if (!code) {
        code = `${index + 1}`.padStart(2, '0');
      }

      // Determine Type
      let type: 'entrada' | 'saida' | 'ambas' = defaultType;
      if (rawType) {
        const normT = normalizeText(String(rawType));
        if (normT.includes('amb')) type = 'ambas';
        else if (normT.startsWith('e') || normT.startsWith('r') || normT.includes('rec') || normT.includes('entr')) type = 'entrada';
        else if (normT.startsWith('s') || normT.startsWith('d') || normT.includes('desp') || normT.includes('said')) type = 'saida';
      }

      // Determine Group
      let group = String(rawGroup).trim() || defaultGroup;
      if (!group) {
        group = type === 'entrada' ? 'Receitas' : 'Despesas Fixas';
      }

      // Determine Parent Category
      const parentCategory = String(rawParent).trim();

      // Determine Description
      const description = String(rawDesc).trim();

      // Determine Subcategories
      const subcategoriesStr = String(rawSubs || '').trim();
      let subcategories: string[] = [];
      if (subcategoriesStr) {
        subcategories = subcategoriesStr
          .split(/[,;\/|•\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }

      // Determine Color
      let colorKey = colorKeys[index % colorKeys.length];
      if (rawColor) {
        const normC = normalizeText(String(rawColor));
        const matchedColor = colorKeys.find(c => normC.includes(normalizeText(c)));
        if (matchedColor) colorKey = matchedColor;
      } else if (group.toLowerCase().includes('rec') || type === 'entrada') {
        colorKey = 'emerald';
      } else if (group.toLowerCase().includes('fix')) {
        colorKey = 'rose';
      } else if (group.toLowerCase().includes('inv')) {
        colorKey = 'indigo';
      } else {
        colorKey = 'amber';
      }

      // Check if matches existing category
      const isExisting = existingCategories.some(
        c => normalizeText(c.name) === normalizeText(name)
      );

      const errors = validateRow(name);

      rows.push({
        id: `parsed-cat-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        selected: errors.length === 0,
        code,
        name: name || `Categoria ${index + 1}`,
        type,
        group,
        parentCategory,
        description,
        colorKey,
        subcategories,
        subcategoriesRaw: subcategories.join(', '),
        isExisting,
        errors
      });
    });

    if (rows.length === 0) {
      alert('Nenhuma categoria válida encontrada nos dados.');
      return;
    }

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
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        
        processRawData(jsonData);
      } catch (error) {
        console.error('Erro ao ler planilha de categorias:', error);
        alert('Erro ao ler a planilha. Certifique-se de que é um arquivo Excel (.xlsx/.xls) ou CSV válido.');
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

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle pasted text
  const handleParsePastedText = () => {
    if (!pasteContent.trim()) {
      alert('Cole o conteúdo da tabela ou lista antes de processar.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = pasteContent.trim().split(/\r?\n/);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      let sep = '\t';
      if (firstLine.includes('\t')) sep = '\t';
      else if (firstLine.includes(';')) sep = ';';
      else if (firstLine.includes(',')) sep = ',';

      const headers = lines[0].split(sep).map(h => h.trim());
      const hasHeaders = headers.some(h => {
        const nh = normalizeText(h);
        return nh.includes('categoria') || nh.includes('tipo') || nh.includes('grupo') || nh.includes('nome') || nh.includes('codigo');
      });

      const dataRows: Record<string, any>[] = [];

      if (hasHeaders) {
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
      } else {
        // Plain format: Código, Categoria, Tipo, Grupo, Categoria Pai, Descrição, Subcategorias
        lines.forEach((line, idx) => {
          const cleanLine = line.trim();
          if (!cleanLine) return;
          const parts = cleanLine.split(sep).map(p => p.trim());
          dataRows.push({
            'Código': parts[0] || `${idx + 1}`.padStart(2, '0'),
            'Categoria': parts[1] || parts[0] || '',
            'Tipo': parts[2] || 'saida',
            'Grupo': parts[3] || 'Despesas Variáveis',
            'Categoria Pai': parts[4] || '',
            'Descrição': parts[5] || '',
            'Subcategorias': parts[6] || ''
          });
        });
      }

      processRawData(dataRows);
      setSelectedFileName('Conteúdo colado da área de transferência');
    } catch (err) {
      console.error(err);
      alert('Falha ao processar o texto colado. Verifique o formato.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download sample template with 6 standardized columns
  const handleDownloadTemplate = () => {
    try {
      const sampleCategories = [
        {
          'Código': '1.01',
          'Categoria': 'Dízimos',
          'Tipo': 'Receita',
          'Grupo': 'Receitas',
          'Categoria Pai': 'Dízimos e Ofertas',
          'Descrição': 'Arrecadação de dízimos de membros e congregados',
          'Subcategorias': 'Membros, Visitantes, Transferências Online, PIX'
        },
        {
          'Código': '1.02',
          'Categoria': 'Ofertas Especiais e Missões',
          'Tipo': 'Receita',
          'Grupo': 'Receitas',
          'Categoria Pai': 'Dízimos e Ofertas',
          'Descrição': 'Ofertas com destinação específica para evangelismo e missões',
          'Subcategorias': 'Missões Sertão, Projetos Globais, Missão Urbana'
        },
        {
          'Código': '2.01',
          'Categoria': 'Despesas com Pessoal e Pastoral',
          'Tipo': 'Despesa',
          'Grupo': 'Despesas Fixas',
          'Categoria Pai': 'Despesas Operacionais',
          'Descrição': 'Remuneração pastoral, encargos trabalhistas e ajuda de custo',
          'Subcategorias': 'Prebenda Pastoral, FGTS, INSS, Ajuda de Custo'
        },
        {
          'Código': '2.02',
          'Categoria': 'Utilidades e Manutenção do Templo',
          'Tipo': 'Despesa',
          'Grupo': 'Despesas Fixas',
          'Categoria Pai': 'Despesas Operacionais',
          'Descrição': 'Contas de consumo recorrentes e conservação física do templo',
          'Subcategorias': 'Energia Elétrica (Enel), Água e Esgoto, Internet Fibra, Aluguel do Salão, Limpeza'
        },
        {
          'Código': '3.01',
          'Categoria': 'Departamentos e Ministérios',
          'Tipo': 'Despesa',
          'Grupo': 'Despesas Variáveis',
          'Categoria Pai': 'Atividades Eclesiásticas',
          'Descrição': 'Verbas direcionadas aos departamentos de jovens, crianças, música e casais',
          'Subcategorias': 'Ministério Infantil, Jovens, Louvor e Música, Casais, Mídia'
        },
        {
          'Código': '4.01',
          'Categoria': 'Investimentos e Aquisições',
          'Tipo': 'Despesa',
          'Grupo': 'Investimentos',
          'Categoria Pai': 'Patrimônio',
          'Descrição': 'Aquisição de equipamentos, reformas estruturais e novos instrumentos',
          'Subcategorias': 'Equipamentos de Som, Iluminação LED, Instrumentos Musicais, Mobiliário'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleCategories);
      ws['!cols'] = [
        { wch: 12 }, // Código
        { wch: 34 }, // Categoria
        { wch: 14 }, // Tipo
        { wch: 22 }, // Grupo
        { wch: 28 }, // Categoria Pai
        { wch: 45 }, // Descrição
        { wch: 60 }  // Subcategorias
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Plano de Categorias');

      const wsInstructions = XLSX.utils.json_to_sheet([
        { 'Estrutura Padrão': '1. Código: Identificador numérico ou estrutural (ex: 1.01, 2.01.01).' },
        { 'Estrutura Padrão': '2. Categoria: Nome principal da categoria.' },
        { 'Estrutura Padrão': '3. Tipo: "Receita", "Despesa" ou "Ambas".' },
        { 'Estrutura Padrão': '4. Grupo: Grupo macro (ex: "Receitas", "Despesas Fixas", "Despesas Variáveis", "Investimentos").' },
        { 'Estrutura Padrão': '5. Categoria Pai: Nome do grupo/categoria pai de nível superior (ou vazio se for raiz).' },
        { 'Estrutura Padrão': '6. Descrição: Finalidade ou detalhamento da categoria.' },
        { 'Estrutura Padrão': '7. Subcategorias: Subitens separados por vírgula (,).' }
      ]);
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

      XLSX.writeFile(wb, 'modelo_importacao_categorias_sismnv.xlsx');
    } catch (e) {
      console.error('Erro ao baixar modelo:', e);
      alert('Erro ao gerar a planilha modelo de categorias.');
    }
  };

  // Update a row
  const updateRow = (id: string, updates: Partial<ParsedCategoryRow>) => {
    setParsedRows(prev =>
      prev.map(row => {
        if (row.id === id) {
          const updated = { ...row, ...updates };
          if (updates.subcategoriesRaw !== undefined) {
            updated.subcategories = updates.subcategoriesRaw
              .split(/[,;\/|•\n]/)
              .map(s => s.trim())
              .filter(s => s.length > 0);
          }
          const errors = validateRow(updated.name);
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

  // Delete a row
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
    const allSelected = parsedRows.every(r => r.selected);
    setParsedRows(prev =>
      prev.map(r => (r.errors.length === 0 ? { ...r, selected: !allSelected } : r))
    );
  };

  // Bulk Apply Group
  const applyBulkGroup = () => {
    if (!bulkGroup) return;
    setParsedRows(prev =>
      prev.map(r => ({
        ...r,
        group: bulkGroup
      }))
    );
    setBulkGroup('');
  };

  // Bulk Apply Type
  const applyBulkType = () => {
    if (!bulkType) return;
    setParsedRows(prev =>
      prev.map(r => ({
        ...r,
        type: bulkType as any
      }))
    );
    setBulkType('');
  };

  // Bulk Apply Parent Category
  const applyBulkParentCategory = () => {
    if (!bulkParentCategory) return;
    setParsedRows(prev =>
      prev.map(r => ({
        ...r,
        parentCategory: bulkParentCategory
      }))
    );
    setBulkParentCategory('');
  };

  // Add empty manual row
  const handleAddEmptyRow = () => {
    const newRow: ParsedCategoryRow = {
      id: `parsed-cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      selected: true,
      code: `${parsedRows.length + 1}`.padStart(2, '0'),
      name: '',
      type: defaultType,
      group: defaultGroup,
      parentCategory: '',
      description: '',
      colorKey: 'indigo',
      subcategories: [],
      subcategoriesRaw: '',
      isExisting: false,
      errors: ['Nome da categoria obrigatório']
    };
    setParsedRows([newRow, ...parsedRows]);
  };

  // Statistics
  const stats = useMemo(() => {
    const selected = parsedRows.filter(r => r.selected && r.errors.length === 0);
    const totalSelected = selected.length;
    const newCount = selected.filter(r => !r.isExisting).length;
    const mergeCount = selected.filter(r => r.isExisting).length;
    const totalSubcategories = selected.reduce((sum, r) => sum + r.subcategories.length, 0);

    return {
      totalRows: parsedRows.length,
      totalSelected,
      newCount,
      mergeCount,
      totalSubcategories
    };
  }, [parsedRows]);

  // Final Confirmation
  const handleConfirmImport = () => {
    const toImport = parsedRows.filter(r => r.selected && r.errors.length === 0);
    if (toImport.length === 0) {
      alert('Nenhuma categoria válida selecionada para importação.');
      return;
    }

    let updatedList: TransactionCategory[] = mergeStrategy === 'replace' ? [] : [...existingCategories];

    toImport.forEach((row, idx) => {
      const colorObj = COLOR_PALETTE[row.colorKey] || COLOR_PALETTE.emerald;
      const normRowName = normalizeText(row.name);
      
      const existingIdx = updatedList.findIndex(
        c => normalizeText(c.name) === normRowName
      );

      if (existingIdx >= 0 && mergeStrategy === 'merge') {
        // Merge subcategories
        const currentSubs = updatedList[existingIdx].subcategories || [];
        const combinedSubs = Array.from(
          new Set([...currentSubs, ...row.subcategories])
        );

        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          code: row.code || updatedList[existingIdx].code,
          name: row.name.trim(),
          type: row.type,
          group: row.group,
          mainCategory: row.group as any,
          parentCategory: row.parentCategory || updatedList[existingIdx].parentCategory,
          description: row.description || updatedList[existingIdx].description,
          color: colorObj.class,
          subcategories: combinedSubs
        };
      } else {
        // Create new
        const newCat: TransactionCategory = {
          id: `cat-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          code: row.code || `${updatedList.length + 1}`.padStart(2, '0'),
          name: row.name.trim(),
          type: row.type,
          group: row.group,
          mainCategory: row.group as any,
          parentCategory: row.parentCategory || undefined,
          description: row.description || undefined,
          color: colorObj.class,
          subcategories: row.subcategories
        };
        updatedList.push(newCat);
      }
    });

    onImport(updatedList, mergeStrategy);
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

      {/* Modal Card */}
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
              <FolderTree size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Importar Categorias e Grupos em Massa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Código / Categoria / Tipo / Grupo / Pai / Descrição
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Importe sua estrutura completa de categorias padronizadas via planilha Excel (.xlsx) ou CSV.
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
              title="Baixar planilha de exemplo para categorias"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {parsedRows.length === 0 ? (
            /* STEP 1: UPLOAD / PASTE SELECTION */
            <div className="space-y-6">
              {/* Tab Selector & Mobile Download */}
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
                    <span>Copiar e Colar Lista</span>
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

              {/* Default Configurations */}
              <div className={`p-4 rounded-xl border ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/80'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Padrões & Modo de Importação
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Tipo de Fluxo Padrão
                    </label>
                    <select
                      value={defaultType}
                      onChange={e => setDefaultType(e.target.value as any)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="saida">Saída (Despesas)</option>
                      <option value="entrada">Entrada (Receitas)</option>
                      <option value="ambas">Ambas (Receitas e Despesas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Grupo Padrão
                    </label>
                    <select
                      value={defaultGroup}
                      onChange={e => setDefaultGroup(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="Despesas Fixas">Despesas Fixas</option>
                      <option value="Despesas Variáveis">Despesas Variáveis</option>
                      <option value="Receitas">Receitas</option>
                      <option value="Investimentos">Investimentos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Se a categoria já existir:
                    </label>
                    <select
                      value={mergeStrategy}
                      onChange={e => setMergeStrategy(e.target.value as any)}
                      className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="merge">Mesclar subcategorias e dados (Recomendado)</option>
                      <option value="replace">Substituir categorias existentes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* UPLOAD ZONE */}
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
                    <FolderTree size={30} />
                  </div>

                  <h4 className="text-base font-bold text-zinc-100">
                    {isProcessing ? 'Processando arquivo...' : 'Arraste a planilha de categorias aqui'}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mt-1.5">
                    Envie seu arquivo <span className="font-semibold text-indigo-400">.XLSX</span>, <span className="font-semibold text-emerald-400">.XLS</span> ou <span className="font-semibold text-amber-400">.CSV</span> com colunas: Código, Categoria, Tipo, Grupo, Categoria Pai e Descrição.
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all">
                      Selecionar Arquivo no Computador
                    </span>
                  </div>
                </div>
              )}

              {/* PASTE ZONE */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>Cole as linhas de categorias (Código, Categoria, Tipo, Grupo, Categoria Pai, Descrição):</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        Dica: Cole direto de uma planilha Excel ou Google Sheets
                      </span>
                    </label>
                    <textarea
                      rows={9}
                      value={pasteContent}
                      onChange={e => setPasteContent(e.target.value)}
                      placeholder={`Código\tCategoria\tTipo\tGrupo\tCategoria Pai\tDescrição\tSubcategorias\n1.01\tDízimos\tReceita\tReceitas\tDízimos e Ofertas\tArrecadação de dízimos de membros\tMembros, Visitantes, Online\n2.01\tEnergia e Água\tDespesa\tDespesas Fixas\tDespesas Operacionais\tContas de consumo mensal\tEnergia Elétrica, Água e Esgoto`}
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
                      <span>{isProcessing ? 'Processando...' : 'Processar e Visualizar Categorias'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: PREVIEW & ADJUSTMENTS */
            <div className="space-y-4">
              {/* Summary Badges */}
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
                    <Plus size={12} /> Novas Categorias
                  </p>
                  <p className="text-lg font-bold mt-1 text-emerald-400">
                    {stats.newCount}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-800/30'
                }`}>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <RefreshCw size={12} /> Mesclar com Existentes
                  </p>
                  <p className="text-lg font-bold mt-1 text-indigo-300">
                    {stats.mergeCount}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isHighContrast ? 'bg-purple-50 border-purple-200' : 'bg-purple-950/20 border-purple-800/30'
                }`}>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Tags size={12} /> Total Subcategorias
                  </p>
                  <p className="text-lg font-bold mt-1 text-purple-300">
                    {stats.totalSubcategories}
                  </p>
                </div>
              </div>

              {/* Toolbar & Bulk Actions */}
              <div className={`p-3.5 rounded-xl border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 ${
                isHighContrast ? 'bg-zinc-100/70 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/80'
              }`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddEmptyRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Adicionar Linha</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={bulkGroup}
                      onChange={e => setBulkGroup(e.target.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Aplicar Grupo a Todos...</option>
                      <option value="Receitas">Receitas</option>
                      <option value="Despesas Fixas">Despesas Fixas</option>
                      <option value="Despesas Variáveis">Despesas Variáveis</option>
                      <option value="Investimentos">Investimentos</option>
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkGroup}
                      disabled={!bulkGroup}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={bulkType}
                      onChange={e => setBulkType(e.target.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <option value="">Aplicar Tipo a Todos...</option>
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                      <option value="ambas">Ambas</option>
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkType}
                      disabled={!bulkType}
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

              {/* Standardized 6-Column Categories Table */}
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
                          checked={parsedRows.length > 0 && parsedRows.every(r => r.selected)}
                          onChange={toggleSelectAll}
                          className="rounded border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-2 w-24 font-bold uppercase tracking-wider text-[10px]">Código</th>
                      <th className="py-3 px-2 min-w-[170px] font-bold uppercase tracking-wider text-[10px]">Categoria</th>
                      <th className="py-3 px-2 w-24 font-bold uppercase tracking-wider text-[10px]">Tipo</th>
                      <th className="py-3 px-2 w-36 font-bold uppercase tracking-wider text-[10px]">Grupo</th>
                      <th className="py-3 px-2 min-w-[150px] font-bold uppercase tracking-wider text-[10px]">Categoria Pai</th>
                      <th className="py-3 px-2 min-w-[180px] font-bold uppercase tracking-wider text-[10px]">Descrição</th>
                      <th className="py-3 px-2 min-w-[160px] font-bold uppercase tracking-wider text-[10px]">Subcategorias</th>
                      <th className="py-3 px-2 w-12 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-medium">
                    {parsedRows.map(row => {
                      const hasError = row.errors.length > 0;
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

                          {/* 1. Código */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.code}
                              onChange={e => updateRow(row.id, { code: e.target.value })}
                              placeholder="1.01"
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-indigo-400'
                              }`}
                            />
                          </td>

                          {/* 2. Categoria */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => updateRow(row.id, { name: e.target.value })}
                              placeholder="Nome da categoria"
                              className={`w-full px-2.5 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold ${
                                !row.name.trim()
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

                          {/* 3. Tipo */}
                          <td className="py-2 px-2">
                            <select
                              value={row.type}
                              onChange={e => updateRow(row.id, { type: e.target.value as any })}
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            >
                              <option value="saida">Saída</option>
                              <option value="entrada">Entrada</option>
                              <option value="ambas">Ambas</option>
                            </select>
                          </td>

                          {/* 4. Grupo */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.group}
                              onChange={e => updateRow(row.id, { group: e.target.value })}
                              placeholder="Ex: Despesas Fixas"
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </td>

                          {/* 5. Categoria Pai */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.parentCategory}
                              onChange={e => updateRow(row.id, { parentCategory: e.target.value })}
                              placeholder="Categoria Pai (se houver)"
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                              }`}
                            />
                          </td>

                          {/* 6. Descrição */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.description}
                              onChange={e => updateRow(row.id, { description: e.target.value })}
                              placeholder="Finalidade ou detalhes..."
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-400 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                              }`}
                            />
                          </td>

                          {/* Subcategorias */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.subcategoriesRaw}
                              onChange={e => updateRow(row.id, { subcategoriesRaw: e.target.value })}
                              placeholder="Sub 1, Sub 2..."
                              className={`w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                isHighContrast ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                              }`}
                            />
                          </td>

                          {/* Delete */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remover linha"
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
                Arquivo: <span className="text-zinc-200">{selectedFileName || 'Categorias'}</span>
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
                <span>Confirmar e Importar {stats.totalSelected} {stats.totalSelected === 1 ? 'Categoria' : 'Categorias'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
