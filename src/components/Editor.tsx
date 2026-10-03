import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  CheckCircle,
  Printer,
  Search,
  Check,
  Users,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Folder
} from 'lucide-react';
import { Document, Member } from '../types';

const isPersonField = (fieldId: string) => {
  const idLower = fieldId.toLowerCase();
  return idLower.includes('assinatura') || 
         idLower.includes('pres') || 
         idLower.includes('tes') || 
         idLower.includes('nome') || 
         idLower.includes('membro') || 
         idLower.includes('responsavel') || 
         idLower.includes('sindico') || 
         idLower.includes('proprietario') || 
         idLower.includes('secretario') || 
         idLower.includes('secretaria') || 
         idLower.includes('autor') || 
         idLower.includes('pessoa');
};

interface EditorProps {
  selectedDocument: Document | null;
  onUpdateDocument: (doc: Document) => void;
  onAnalyzeDocument: (text: string) => void;
  isHighContrast: boolean;
  members: Member[];
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  subfolders: Record<string, string[]>;
}

export default function Editor({ 
  selectedDocument, 
  onUpdateDocument,
  onAnalyzeDocument,
  isHighContrast,
  members,
  documents,
  onAddDocument,
  subfolders
}: EditorProps) {
  // If no document is selected, we fall back to a standard blank template state
  const doc = selectedDocument || ({
    id: 'blank',
    name: 'Documento Sem Nome.docx',
    type: 'docx' as any,
    folder: 'ORDINÁRIA' as any,
    size: '0 KB',
    creator: 'Admin',
    date: '2026-04-25',
    entity: 'MINISTÉRIO NOVA VIDA',
    address: 'Av. Dr. Ivo Xavier Ferreira, 3038 - Vila São Pedro - Pirassununga/SP',
    localidade: 'Pirassununga',
    convocacao1: '18:00',
    convocacao2: '18:15',
    tipoAssembleia: 'Geral Ordinária',
    ordemDoDia: 'a) - Aprovação das Contas do Ministério\nb) - Eleição de novos membros do Conselho\nc) - Eleição de novo membro da Diretoria\nd) - Eleição de novos membros do Conselho Fiscal',
    signatures: [
      { name: 'Ítalo Diego Mariano', role: 'Presidente' },
      { name: 'Patrícia Gonçalves Rombe', role: 'Tesoureira' }
    ]
  } as Document);

  // Compute standard dynamic folders
  const computedFolders = Array.from(new Set([
    'EXTRAORDINÁRIA', 
    'ORDINÁRIA', 
    'GERAL', 
    ...documents.map(d => d.folder.split('/')[0].toUpperCase()).filter(Boolean)
  ]));

  // Traditional Form State
  const [entity, setEntity] = useState(doc.entity || '');
  const [address, setAddress] = useState(doc.address || '');
  const [date, setDate] = useState(doc.date || '');
  const [localidade, setLocalidade] = useState(doc.localidade || '');
  const [convocacao1, setConvocacao1] = useState(doc.convocacao1 || '');
  const [convocacao2, setConvocacao2] = useState(doc.convocacao2 || '');
  const [tipoAssembleia, setTipoAssembleia] = useState(doc.tipoAssembleia || 'Geral Ordinária');
  const [ordemDoDia, setOrdemDoDia] = useState(doc.ordemDoDia || '');
  const [signatures, setSignatures] = useState<Array<{ name: string; role: string }>>(
    doc.signatures || []
  );

  // Traditional Signer addition states
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerRole, setNewSignerRole] = useState('Presidente');

  // Rich Template States
  const [isRichTemplate, setIsRichTemplate] = useState(doc.isRichTemplate || false);

  // Copy destination folder states
  const [copyFolder, setCopyFolder] = useState<string>('ORDINÁRIA');
  const [copySubfolder, setCopySubfolder] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [richFields, setRichFields] = useState<Array<{ id: string; originalText: string; currentValue: string }>>([]);
  const [richAlineas, setRichAlineas] = useState<Array<{ id: string; text: string }>>([]);
  const [activeAlineas, setActiveAlineas] = useState<string[]>(doc.selectedAlineas || []);
  const [showRedInPreview, setShowRedInPreview] = useState(true);

  // Members search popup state inside Editor
  const [activeSearchFieldId, setActiveSearchFieldId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Interactive zoom and save feedback
  const [zoom, setZoom] = useState<number>(100);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Focus tracking and Refs for formatting panel
  const [focusedField, setFocusedField] = useState<'entity' | 'address' | 'ordemDoDia' | null>(null);
  const entityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const ordemRef = useRef<HTMLTextAreaElement>(null);

  // Apply formatting tags helper
  const applyFormatting = (type: 'bold' | 'italic' | 'center' | 'left' | 'right') => {
    let ref: HTMLInputElement | HTMLTextAreaElement | null = null;
    let value = '';
    let setValue: (val: string) => void = () => {};

    if (focusedField === 'entity') {
      ref = entityRef.current;
      value = entity;
      setValue = setEntity;
    } else if (focusedField === 'address') {
      ref = addressRef.current;
      value = address;
      setValue = setAddress;
    } else if (focusedField === 'ordemDoDia') {
      ref = ordemRef.current;
      value = ordemDoDia;
      setValue = setOrdemDoDia;
    }

    if (!ref) return;

    const start = ref.selectionStart ?? 0;
    const end = ref.selectionEnd ?? 0;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    if (type === 'bold') {
      formattedText = `**${selectedText}**`;
    } else if (type === 'italic') {
      formattedText = `*${selectedText}*`;
    } else if (type === 'center') {
      formattedText = `[align=center]${selectedText || 'Texto Centralizado'}[/align]`;
    } else if (type === 'left') {
      formattedText = `[align=left]${selectedText || 'Texto Alinhado à Esquerda'}[/align]`;
    } else if (type === 'right') {
      formattedText = `[align=right]${selectedText || 'Texto Alinhado à Direita'}[/align]`;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    setValue(newValue);

    // Refocus the input
    setTimeout(() => {
      if (ref) {
        ref.focus();
        const newCursorPos = start + formattedText.length;
        ref.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Convert basic markdown/alignment markers to safe visual HTML inside preview
  const renderFormattedText = (text: string) => {
    if (!text) return '';
    // Escape standard HTML first to prevent code injection
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse alignment block tags
    escaped = escaped
      .replace(/\[align=center\](.*?)\[\/align\]/g, '<div style="text-align: center; width: 100%;">$1</div>')
      .replace(/\[align=right\](.*?)\[\/align\]/g, '<div style="text-align: right; width: 100%;">$1</div>')
      .replace(/\[align=left\](.*?)\[\/align\]/g, '<div style="text-align: left; width: 100%;">$1</div>');

    // Parse bold & italic
    escaped = escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert newlines to <br />
    return escaped.replace(/\n/g, '<br />');
  };

  // Sync form state when active document switches
  useEffect(() => {
    setEntity(doc.entity || '');
    setAddress(doc.address || '');
    setDate(doc.date || '');
    setLocalidade(doc.localidade || '');
    setConvocacao1(doc.convocacao1 || '');
    setConvocacao2(doc.convocacao2 || '');
    setTipoAssembleia(doc.tipoAssembleia || 'Geral Ordinária');
    setOrdemDoDia(doc.ordemDoDia || '');
    setSignatures(doc.signatures || []);

    // Rich Template Parsing
    if (doc.isRichTemplate && doc.richContent) {
      setIsRichTemplate(true);
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(doc.richContent, 'text/html');
      
      const fields: Array<{ id: string; originalText: string; currentValue: string }> = [];
      const fieldEls = parsedDoc.querySelectorAll('[data-field-id]');
      fieldEls.forEach((el) => {
        const id = el.getAttribute('data-field-id') || '';
        const originalText = el.textContent || '';
        const savedVal = doc.richFieldsData?.[id] || originalText;
        fields.push({
          id,
          originalText: originalText.trim(),
          currentValue: savedVal.trim()
        });
      });
      setRichFields(fields);

      const alineas: Array<{ id: string; text: string }> = [];
      const alineaEls = parsedDoc.querySelectorAll('[data-alinea-id]');
      alineaEls.forEach((el) => {
        const id = el.getAttribute('data-alinea-id') || '';
        const text = el.textContent || '';
        alineas.push({
          id,
          text: text.trim()
        });
      });
      setRichAlineas(alineas);
      setActiveAlineas(doc.selectedAlineas || alineas.map(a => a.id));
    } else {
      setIsRichTemplate(false);
      setRichFields([]);
      setRichAlineas([]);
      setActiveAlineas([]);
    }

    const parts = doc.folder.split('/');
    setCopyFolder(parts[0] || 'ORDINÁRIA');
    setCopySubfolder(parts[1] || '');
  }, [selectedDocument]);

  const handleAddSignature = () => {
    if (!newSignerName.trim()) {
      alert('Por favor, digite o nome do assinante.');
      return;
    }
    setSignatures([...signatures, { name: newSignerName, role: newSignerRole }]);
    setNewSignerName('');
  };

  const handleRemoveSignature = (index: number) => {
    const updated = signatures.filter((_, idx) => idx !== index);
    setSignatures(updated);
  };

  const handleUpdate = () => {
    if (isRichTemplate) {
      // Compile and save rich templates
      const updatedDoc: Document = {
        ...doc,
        richFieldsData: richFields.reduce((acc, f) => {
          acc[f.id] = f.currentValue;
          return acc;
        }, {} as Record<string, string>),
        selectedAlineas: activeAlineas,
        richContent: doc.richContent // Keep base template instrumented html
      };
      onUpdateDocument(updatedDoc);
    } else {
      // Traditional templates
      const updatedDoc: Document = {
        ...doc,
        entity,
        address,
        date,
        localidade,
        convocacao1,
        convocacao2,
        tipoAssembleia,
        ordemDoDia,
        signatures
      };
      onUpdateDocument(updatedDoc);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveCopy = () => {
    const targetFolderFull = copySubfolder ? `${copyFolder}/${copySubfolder}` : copyFolder;
    const baseName = doc.name.replace(/\.[^/.]+$/, "");
    const extension = doc.name.split('.').pop() || 'docx';
    const copiedDoc: Document = {
      ...doc,
      id: `doc-copy-${Date.now()}`,
      name: `${baseName} (Cópia).${extension}`,
      folder: targetFolderFull,
      date: new Date().toISOString().split('T')[0],
      entity,
      address,
      localidade,
      convocacao1,
      convocacao2,
      tipoAssembleia,
      ordemDoDia,
      signatures,
      isRichTemplate,
      richContent: doc.richContent,
      selectedAlineas: activeAlineas,
      richFieldsData: richFields.reduce((acc, f) => {
        acc[f.id] = f.currentValue;
        return acc;
      }, {} as Record<string, string>)
    };

    onAddDocument(copiedDoc);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleAISuggestions = () => {
    const contextText = isRichTemplate 
      ? `Modelo Inteligente: ${doc.name}. Conteúdo dos campos: ${richFields.map(f => f.currentValue).join(', ')}`
      : `Entidade: ${entity}. Endereço: ${address}. Pauta atual: ${ordemDoDia}`;
    onAnalyzeDocument(contextText);
  };

  // Convert "2026-04-25" style to elegant Portuguese long-form date
  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return '___ de _________ de _____';
    try {
      const [year, month, day] = dateStr.split('-');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthIdx = parseInt(month) - 1;
      return `${parseInt(day)} de ${monthNames[monthIdx] || 'Abril'} de ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Compile Editor Live HTML
  const renderEditorLiveHtml = () => {
    if (!doc.richContent) return '';
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(doc.richContent, 'text/html');
    
    // Replace fields with current state values
    richFields.forEach((field) => {
      const el = parsedDoc.querySelector(`[data-field-id="${field.id}"]`);
      if (el) {
        el.textContent = field.currentValue;
        if (showRedInPreview) {
          el.setAttribute('style', 'color: #ef4444; font-weight: bold; background-color: rgba(239, 68, 68, 0.08); padding: 0 4px; border-bottom: 1px dashed #ef4444; border-radius: 4px;');
        } else {
          el.setAttribute('style', 'color: #18181b; font-weight: normal; border-bottom: none;');
        }
      }
    });

    // Hide unchecked alíneas
    richAlineas.forEach((alinea) => {
      const el = parsedDoc.querySelector(`[data-alinea-id="${alinea.id}"]`);
      if (el) {
        if (activeAlineas.includes(alinea.id)) {
          const style = el.getAttribute('style') || '';
          if (style.includes('display: none')) {
            el.setAttribute('style', style.replace('display: none', ''));
          }
        } else {
          const style = el.getAttribute('style') || '';
          el.setAttribute('style', `${style}; display: none;`);
        }
      }
    });

    return parsedDoc.body.innerHTML;
  };

  const handleToggleAlinea = (id: string) => {
    if (activeAlineas.includes(id)) {
      setActiveAlineas(activeAlineas.filter(item => item !== id));
    } else {
      setActiveAlineas([...activeAlineas, id]);
    }
  };

  const handleSelectMemberForField = (fieldId: string, memberName: string) => {
    const updated = richFields.map(f => {
      if (f.id === fieldId) {
        return { ...f, currentValue: memberName };
      }
      return f;
    });
    setRichFields(updated);
    setActiveSearchFieldId(null);
    setMemberSearchQuery('');
  };

  return (
    <div className={`flex h-[calc(100vh-80px)] overflow-hidden font-sans ${isHighContrast ? 'bg-white' : 'bg-zinc-950'}`}>
      
      {/* Left Sidebar: Form inputs to configure document details */}
      <aside className={`w-[400px] border-r flex flex-col flex-shrink-0 ${
        isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800/60 bg-zinc-900/10'
        }`}>
          <div>
            <h1 className={`text-sm font-extrabold uppercase tracking-wider ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>
              {isRichTemplate ? 'Modelo Inteligente' : 'Editor de Atas'}
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Preencha os campos para atualizar o preview.</p>
          </div>
          <button 
            onClick={handleAISuggestions}
            title="Sugerir melhorias com Gemini"
            className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide border border-indigo-500/20"
          >
            <Sparkles size={11} className="animate-pulse" /> Melhorar IA
          </button>
        </div>

        {/* Dynamic Sidebar switch between traditional and rich-core layouts */}
        {isRichTemplate ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
            
            {/* Visual highlight toggle */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
            }`}>
              <div>
                <p className={`font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Destaques em Vermelho</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Destaca os campos editáveis no documento.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRedInPreview(!showRedInPreview)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                  showRedInPreview ? 'bg-red-500' : 'bg-zinc-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showRedInPreview ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Extracted Fields */}
            {richFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                  Campos em Vermelho (Editáveis)
                </h3>
                <div className="space-y-3">
                  {richFields.map((field) => (
                    <div key={field.id} className="space-y-1.5 relative">
                      <label className="font-semibold text-zinc-500 block">
                        Original: <span className="italic text-zinc-400 font-normal">{field.originalText}</span>
                      </label>
                      <div className="relative flex items-center gap-1.5">
                        <input 
                          type="text" 
                          value={field.currentValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRichFields(richFields.map(f => f.id === field.id ? { ...f, currentValue: val } : f));
                          }}
                          className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                            isPersonField(field.id) ? 'pr-8' : ''
                          } ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-white'
                          }`}
                        />
                        {isPersonField(field.id) && (
                          <button
                            type="button"
                            title="Buscar Membro"
                            onClick={() => {
                              setActiveSearchFieldId(activeSearchFieldId === field.id ? null : field.id);
                              setMemberSearchQuery('');
                            }}
                            className={`p-2 rounded-xl border shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                              activeSearchFieldId === field.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : isHighContrast
                                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-600'
                                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                            }`}
                          >
                            <Users size={12} />
                          </button>
                        )}

                        {/* Autocomplete dropdown popover for editor */}
                        <AnimatePresence>
                          {activeSearchFieldId === field.id && (
                            <div className={`absolute right-0 left-0 top-[105%] z-50 p-2.5 border rounded-xl shadow-xl space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar ${
                              isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                            }`}>
                              <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1">
                                <Search size={11} className="text-zinc-500" />
                                <input 
                                  type="text" 
                                  placeholder="Buscar membro..."
                                  value={memberSearchQuery}
                                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                                  className="w-full bg-transparent border-none text-[11px] focus:outline-none text-zinc-100"
                                  autoFocus
                                />
                              </div>
                              <div className="space-y-1">
                                {members
                                  .filter(m => 
                                    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
                                    m.cargo.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                  )
                                  .map((m) => (
                                    <button
                                      key={m.id}
                                      type="button"
                                      onClick={() => handleSelectMemberForField(field.id, m.name)}
                                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-all ${
                                        isHighContrast ? 'hover:bg-zinc-100 text-zinc-800' : 'hover:bg-zinc-800 text-zinc-200'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-[11px] font-bold">{m.name}</p>
                                        <p className="text-[9px] text-zinc-500">{m.cargo}</p>
                                      </div>
                                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400">Selecionar</span>
                                    </button>
                                  ))}
                                {members.filter(m => 
                                  m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
                                  m.cargo.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                ).length === 0 && (
                                  <p className="text-[10px] text-zinc-500 italic text-center py-2">Nenhum membro encontrado.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Alíneas Checklist */}
            {richAlineas.length > 0 && (
              <div className="space-y-4">
                <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/60'}`} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center justify-between">
                  <span>Alíneas / Cláusulas Ativas</span>
                  <span className="text-[8px] font-bold uppercase bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full">
                    {activeAlineas.length}/{richAlineas.length} ativas
                  </span>
                </h3>
                <div className="space-y-2">
                  {richAlineas.map((alinea) => {
                    const isActive = activeAlineas.includes(alinea.id);
                    return (
                      <div 
                        key={alinea.id}
                        onClick={() => handleToggleAlinea(alinea.id)}
                        className={`p-2.5 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all hover:bg-indigo-600/5 active:scale-99 ${
                          isActive
                            ? 'border-indigo-500/40 bg-indigo-600/5'
                            : isHighContrast ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900/10'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-500 bg-transparent'
                        }`}>
                          {isActive && <Check size={11} strokeWidth={3} />}
                        </div>
                        <p className={`text-[10px] leading-normal font-sans ${
                          isActive ? 'text-zinc-200 font-medium' : 'text-zinc-500 line-through'
                        }`}>
                          {alinea.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Salvar Cópia */}
            <div className={`p-4 border rounded-xl space-y-3 mt-6 ${
              isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Salvar uma Cópia</p>
                <Folder size={14} className="text-indigo-500" />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Gere um novo documento independente com os dados atuais salvando-o na pasta escolhida abaixo.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 block">Pasta Principal</label>
                  <select
                    value={copyFolder}
                    onChange={(e) => {
                      setCopyFolder(e.target.value);
                      setCopySubfolder('');
                    }}
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none ${
                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    {computedFolders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 block">Subpasta</label>
                  <select
                    value={copySubfolder}
                    onChange={(e) => setCopySubfolder(e.target.value)}
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none ${
                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    <option value="">Nenhuma (Raiz)</option>
                    {(subfolders[copyFolder] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {copySuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg text-[10px] font-semibold text-center">
                  Cópia criada com sucesso!
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCopy}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all border border-zinc-700"
              >
                Criar Cópia do Documento
              </button>
            </div>
          </div>
        ) : (
          /* TRADITIONAL FORM BODY CONTAINER */
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
            
            {/* Section: Identificação */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Cabeçalho e Identificação</h3>
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Título da Entidade</label>
                <input 
                  ref={entityRef}
                  onFocus={() => setFocusedField('entity')}
                  type="text" 
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  placeholder="Ex: MINISTÉRIO NOVA VIDA"
                  className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Endereço da Sede</label>
                <textarea 
                  ref={addressRef}
                  onFocus={() => setFocusedField('address')}
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Dr. Ivo Xavier Ferreira, 3038"
                  className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors resize-none leading-relaxed ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                  }`}
                />
              </div>
            </div>

            <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/60'}`} />

            {/* Section: Convocatória Assembly */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Detalhes da Convocação</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Data Oficial</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Localidade / Cidade</label>
                  <input 
                    type="text" 
                    value={localidade}
                    onChange={(e) => setLocalidade(e.target.value)}
                    placeholder="Ex: Pirassununga"
                    className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">1ª Convocação</label>
                  <input 
                    type="time" 
                    value={convocacao1}
                    onChange={(e) => setConvocacao1(e.target.value)}
                    className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">2ª Convocação</label>
                  <input 
                    type="time" 
                    value={convocacao2}
                    onChange={(e) => setConvocacao2(e.target.value)}
                    className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Tipo de Assembleia</label>
                <select 
                  value={tipoAssembleia}
                  onChange={(e) => setTipoAssembleia(e.target.value)}
                  className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-white'
                  }`}
                >
                  <option value="Geral Ordinária">Geral Ordinária</option>
                  <option value="Geral Extraordinária">Geral Extraordinária</option>
                </select>
              </div>
            </div>

            <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/60'}`} />

            {/* Section: Ordem do Dia (Pauta) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Ordem do Dia / Pauta</h3>
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Tópicos (um por linha)</label>
                <textarea 
                  ref={ordemRef}
                  onFocus={() => setFocusedField('ordemDoDia')}
                  rows={5}
                  value={ordemDoDia}
                  onChange={(e) => setOrdemDoDia(e.target.value)}
                  placeholder="Ex: a) Leitura e aprovação do balanço..."
                  className={`w-full rounded-xl border py-2 px-3 focus:border-indigo-500 focus:outline-none transition-colors resize-none font-mono leading-relaxed ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                  }`}
                />
              </div>
            </div>

            <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/60'}`} />

            {/* Section: Signatures */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Assinaturas e Cargos</h3>
              
              {/* Existing signers list */}
              <div className="space-y-2">
                {signatures.map((sig, idx) => (
                  <div key={idx} className={`p-3 border rounded-xl flex items-center justify-between ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <div>
                      <p className={`font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>{sig.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">{sig.role}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveSignature(idx)}
                      type="button"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-200' : 'text-zinc-600 hover:text-red-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form to append new signer */}
              <div className={`p-3 border rounded-xl space-y-2.5 ${
                isHighContrast ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Adicionar Assinatura</p>
                
                {/* Signer members autocomplete search */}
                <div className="space-y-1 relative">
                  <div className="flex items-center gap-1 border rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition-colors">
                    <Search size={12} className="text-zinc-500" />
                    <input 
                      type="text"
                      value={newSignerName}
                      onChange={(e) => {
                        setNewSignerName(e.target.value);
                        setMemberSearchQuery(e.target.value);
                        setActiveSearchFieldId('new-signer');
                      }}
                      placeholder="Buscar membro..."
                      className={`w-full bg-transparent border-none text-xs focus:outline-none ${
                        isHighContrast ? 'text-zinc-950 placeholder-zinc-400' : 'text-zinc-100 placeholder-zinc-600'
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {activeSearchFieldId === 'new-signer' && memberSearchQuery.trim() !== '' && (
                      <div className={`absolute right-0 left-0 top-[105%] z-50 p-2.5 border rounded-xl shadow-xl space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar ${
                        isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                      }`}>
                        {members
                          .filter(m => m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setNewSignerName(m.name);
                                setNewSignerRole(m.cargo);
                                setActiveSearchFieldId(null);
                              }}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-all ${
                                isHighContrast ? 'hover:bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-800 text-zinc-200'
                              }`}
                            >
                              <div>
                                <p className="text-[11px] font-bold">{m.name}</p>
                                <p className="text-[9px] text-zinc-500">{m.cargo}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newSignerRole}
                    onChange={(e) => setNewSignerRole(e.target.value)}
                    className={`border rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none ${
                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    <option value="Presidente">Presidente</option>
                    <option value="Presidente de Mesa">Presidente de Mesa</option>
                    <option value="Secretário(a)">Secretário(a)</option>
                    <option value="Secretário de Mesa">Secretário de Mesa</option>
                    <option value="Tesoureiro(a)">Tesoureiro(a)</option>
                    <option value="Síndico(a)">Síndico(a)</option>
                    <option value="Conselheiro(a)">Conselheiro(a)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSignature}
                    className={`px-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all border ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    <Plus size={13} /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Section: Salvar Cópia */}
            <div className={`p-4 border rounded-xl space-y-3 mt-6 ${
              isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Salvar uma Cópia</p>
                <Folder size={14} className="text-indigo-500" />
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Gere um novo documento independente com os dados atuais salvando-o na pasta escolhida abaixo.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 block">Pasta Principal</label>
                  <select
                    value={copyFolder}
                    onChange={(e) => {
                      setCopyFolder(e.target.value);
                      setCopySubfolder('');
                    }}
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none ${
                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    {computedFolders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 block">Subpasta</label>
                  <select
                    value={copySubfolder}
                    onChange={(e) => setCopySubfolder(e.target.value)}
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none ${
                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    <option value="">Nenhuma (Raiz)</option>
                    {(subfolders[copyFolder] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {copySuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg text-[10px] font-semibold text-center">
                  Cópia criada com sucesso!
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCopy}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all border border-zinc-700"
              >
                Criar Cópia do Documento
              </button>
            </div>
          </div>
        )}

        {/* Footer save update action block */}
        <div className={`p-4 border-t flex flex-col gap-2 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800/80 bg-zinc-950'
        }`}>
          {saveSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 justify-center mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <CheckCircle size={14} /> Documento atualizado com sucesso!
            </div>
          )}
          <button 
            onClick={handleUpdate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save size={15} /> Atualizar Documento
          </button>
        </div>

        {/* Floating formatting toolbar for traditional editable fields */}
        <AnimatePresence>
          {!isRichTemplate && focusedField && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute bottom-[88px] left-1/2 -translate-x-1/2 flex items-center justify-between p-1.5 rounded-xl border shadow-xl z-50 backdrop-blur-md w-[calc(100%-24px)] max-w-[330px] formatting-toolbar ${
                isHighContrast 
                  ? 'bg-white/95 border-zinc-200 text-zinc-800' 
                  : 'bg-zinc-950/90 border-zinc-800 text-zinc-100 shadow-indigo-500/5'
              }`}
            >
              <div className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-500 border-r border-zinc-800/10 dark:border-zinc-800/80 mr-1 flex items-center gap-1 select-none shrink-0">
                <Type size={10} /> Formatar {focusedField === 'entity' ? 'Entidade' : focusedField === 'address' ? 'Endereço' : 'Pauta'}
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
                  className={`p-1.5 rounded-lg hover:bg-indigo-600/15 text-zinc-400 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer`}
                  title="Negrito"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
                  className={`p-1.5 rounded-lg hover:bg-indigo-600/15 text-zinc-400 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer`}
                  title="Itálico"
                >
                  <Italic size={13} />
                </button>
                <div className="h-4 w-px bg-zinc-800/10 dark:bg-zinc-800/80 mx-1 shrink-0" />
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFormatting('left'); }}
                  className={`p-1.5 rounded-lg hover:bg-indigo-600/15 text-zinc-400 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer`}
                  title="Alinhar à Esquerda"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFormatting('center'); }}
                  className={`p-1.5 rounded-lg hover:bg-indigo-600/15 text-zinc-400 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer`}
                  title="Alinhar ao Centro"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFormatting('right'); }}
                  className={`p-1.5 rounded-lg hover:bg-indigo-600/15 text-zinc-400 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer`}
                  title="Alinhar à Direita"
                >
                  <AlignRight size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Right Canvas: Elegant live sheet rendering preview of the actual document! */}
      <main className={`flex-1 flex flex-col relative overflow-hidden ${
        isHighContrast ? 'bg-zinc-100/60' : 'bg-zinc-900/40'
      }`}>
        
        {/* Top Header Utilities for printing and direct feedback */}
        <div className={`h-12 border-b px-6 flex items-center justify-between z-10 ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'border-zinc-800 bg-zinc-950/20'
        }`}>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {isRichTemplate ? 'Visualização do Modelo Inteligente' : 'Visualização Oficial da Ata'}
          </span>
          <button 
            onClick={() => window.print()} 
            className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
              isHighContrast ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Printer size={12} /> Imprimir / PDF
          </button>
        </div>

        {/* Document Rendering Workspace */}
        <div className="flex-1 overflow-auto p-12 flex items-start justify-center custom-scrollbar">
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-[720px] bg-white text-zinc-900 p-16 shadow-2xl rounded-sm min-h-[1010px] flex flex-col justify-between font-serif relative transition-all duration-300 select-text border border-zinc-300 printable-area"
          >
            {isRichTemplate ? (
              /* Rich Template content dynamically filled with states */
              <div className="flex-1 flex flex-col justify-between h-full font-serif text-sm text-zinc-800 leading-relaxed">
                <div 
                  className="rich-document-content text-justify space-y-4"
                  dangerouslySetInnerHTML={{ __html: renderEditorLiveHtml() }}
                />
                

              </div>
            ) : (
              /* Traditional fields layout */
              <>
                {/* Header / Identification */}
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-bold tracking-wider font-sans uppercase text-zinc-800" dangerouslySetInnerHTML={{ __html: renderFormattedText(entity || 'MINISTÉRIO NOVA VIDA') }} />
                  <p className="text-[10px] font-sans text-zinc-500 tracking-wide text-center" dangerouslySetInnerHTML={{ __html: renderFormattedText(address || 'Endereço da sede social') }} />
                  
                  <div className="w-full flex items-center justify-center gap-2 py-4">
                    <div className="h-px bg-zinc-300 flex-1" />
                    <span className="text-sm font-sans font-extrabold tracking-[0.2em] text-zinc-800 uppercase underline">CONVOCAÇÃO</span>
                    <div className="h-px bg-zinc-300 flex-1" />
                  </div>
                </div>

                {/* Prose Content of Assembly summons */}
                <div className="space-y-6 text-sm leading-relaxed text-justify text-zinc-700 mt-6 flex-1">
                  <p>
                    De acordo com as disposições estatutárias vigentes, ficam convocados todos os membros associados e representantes legais do{' '}
                    <strong className="text-zinc-900" dangerouslySetInnerHTML={{ __html: renderFormattedText(entity || 'MINISTÉRIO NOVA VIDA') }} /> para se reunirem em Assembleia{' '}
                    <strong className="text-zinc-900">{tipoAssembleia || 'Geral Ordinária'}</strong>, a realizar-se em primeira chamada na localidade de{' '}
                    <strong className="text-zinc-900">{localidade || 'Pirassununga'}</strong>, no dia{' '}
                    <strong className="text-zinc-900">{formatLongDate(date)}</strong>.
                  </p>

                  {/* Call timing details block */}
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-5 space-y-3 font-sans">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-800 text-center">Horários e Convocação</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-center">
                      <div className="p-3 bg-white border border-zinc-100 rounded-lg">
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">1ª Convocação</p>
                        <p className="text-base font-extrabold text-indigo-600 mt-1">{convocacao1 || '18:00'} min</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">com quórum estatutário</p>
                      </div>
                      <div className="p-3 bg-white border border-zinc-100 rounded-lg">
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">2ª Convocação</p>
                        <p className="text-base font-extrabold text-indigo-600 mt-1">{convocacao2 || '18:15'} min</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">com qualquer quórum</p>
                      </div>
                    </div>
                  </div>

                  {/* Order of the Day lists */}
                  <div className="space-y-3 mt-6">
                    <p className="font-bold font-sans text-xs uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">Ordem do Dia / Pauta de Deliberações</p>
                    {ordemDoDia ? (
                      <div 
                        className="space-y-2 text-xs text-zinc-600 pl-2 leading-relaxed font-sans text-justify"
                        dangerouslySetInnerHTML={{ __html: renderFormattedText(ordemDoDia) }}
                      />
                    ) : (
                      <p className="text-zinc-400 italic text-xs">Nenhum tópico de pauta cadastrado.</p>
                    )}
                  </div>
                </div>

                {/* Bottom Signatures section */}
                <div className="mt-12 space-y-10">
                  <p className="text-right text-xs font-sans text-zinc-500 mr-2">
                    {localidade || 'Pirassununga'}, {formatLongDate(date)}.
                  </p>

                  <div className="grid grid-cols-2 gap-8 text-center pt-6 border-t border-zinc-200/60 font-sans">
                    {signatures.map((sig, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="w-48 h-px bg-zinc-300 mx-auto mb-2" />
                        <p className="text-xs font-extrabold text-zinc-800">{sig.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{sig.role}</p>
                      </div>
                    ))}
                    {signatures.length === 0 && (
                      <div className="col-span-2 py-4">
                        <p className="text-[10px] text-zinc-400 italic font-bold uppercase tracking-wide">Sem assinaturas cadastradas no documento.</p>
                      </div>
                    )}
                  </div>
                </div>


              </>
            )}
          </div>
        </div>

        {/* Footer Zoom controls */}
        <div className={`h-10 border-t flex items-center justify-center gap-4 px-6 z-10 select-none ${
          isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-t border-zinc-800/80'
        }`}>
          <button 
            onClick={() => setZoom(Math.max(60, zoom - 10))}
            className={`p-1 rounded cursor-pointer transition-colors ${
              isHighContrast ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-mono font-semibold text-zinc-400 w-12 text-center">{zoom}%</span>
          <button 
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className={`p-1 rounded cursor-pointer transition-colors ${
              isHighContrast ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ZoomIn size={14} />
          </button>
        </div>

      </main>
    </div>
  );
}
