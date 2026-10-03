import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Users, 
  Send, 
  Clipboard, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  X,
  Trash2,
  Plus,
  LayoutGrid,
  List,
  Check,
  AlertCircle,
  UploadCloud,
  Eye,
  EyeOff,
  Search,
  Briefcase,
  UserCheck,
  FileText
} from 'lucide-react';
import { Document, Tab, Template, Member } from '../types';

interface TemplatesProps {
  documents: Document[];
  templates: Template[];
  members: Member[];
  onSelectDocument: (doc: Document) => void;
  onAddTemplate: (tpl: Template) => void;
  onDeleteTemplate: (id: string) => void;
  setCurrentTab: (tab: Tab) => void;
  isHighContrast: boolean;
}

// Curated default template with red-text fields and alíneas to test immediately
const PRESET_TEMPLATE_HTML = `<div style="font-family: serif; max-width: 650px; margin: 0 auto; color: #18181b; line-height: 1.6;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 24px; color: #000; font-size: 1.3rem;">
    ATA DE REUNIÃO EXTRAORDINÁRIA DE CONDOMÍNIO - <span style="color: red;">CONDOMÍNIO RESIDENCIAL BELA VISTA</span>
  </h2>
  
  <p style="margin-bottom: 14px; text-align: justify;">
    Aos <span style="color: red;">15 de Julho de 2026</span>, na sede administrativa localizada no endereço <span style="color: red;">Avenida das Nações, 1420 - Centro</span>, reuniu-se a assembleia sob a coordenação do(a) síndico(a) <span style="color: red;">Ricardo Silva</span> e assessorado por <span style="color: red;">Mariana Oliveira</span> na qualidade de secretário(a).
  </p>

  <p style="margin-bottom: 14px; text-align: justify;">
    O quórum de instalação foi verificado e as discussões iniciadas. Foram apresentadas e colocadas em votação as seguintes alíneas de pauta:
  </p>

  <div class="alinea" style="margin-left: 20px; margin-bottom: 8px; font-size: 0.9rem;">
    a) Aprovação do orçamento para pintura externa da fachada do bloco principal.
  </div>
  <div class="alinea" style="margin-left: 20px; margin-bottom: 8px; font-size: 0.9rem;">
    b) Discussão sobre a implantação de painéis solares nas áreas de uso comum.
  </div>
  <div class="alinea" style="margin-left: 20px; margin-bottom: 8px; font-size: 0.9rem;">
    c) Instalação de novas travas eletrônicas e sistema facial na portaria 2.
  </div>
  <div class="alinea" style="margin-left: 20px; margin-bottom: 8px; font-size: 0.9rem;">
    d) Aquisição de novos equipamentos de academia com fundos de reserva.
  </div>

  <p style="margin-bottom: 24px; text-align: justify; margin-top: 14px;">
    Nada mais havendo a tratar, a sessão foi encerrada e lavrou-se a presente ata que será devidamente assinada.
  </p>

  <div style="margin-top: 48px; display: flex; justify-content: space-between; gap: 40px;">
    <div style="flex: 1; text-align: center;">
      <p style="margin-bottom: 4px;">_________________________________________</p>
      <p style="font-weight: bold; font-size: 0.95rem; margin-bottom: 2px;"><span style="color: red;">Ricardo Silva</span></p>
      <p style="font-size: 0.8rem; color: #71717a;">Síndico Geral / Presidente</p>
    </div>
    <div style="flex: 1; text-align: center;">
      <p style="margin-bottom: 4px;">_________________________________________</p>
      <p style="font-weight: bold; font-size: 0.95rem; margin-bottom: 2px;"><span style="color: red;">Mariana Oliveira</span></p>
      <p style="font-size: 0.8rem; color: #71717a;">Secretária Executiva</p>
    </div>
  </div>
</div>`;

export default function Templates({
  documents,
  templates,
  members,
  onSelectDocument,
  onAddTemplate,
  onDeleteTemplate,
  setCurrentTab,
  isHighContrast
}: TemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [creationTab, setCreationTab] = useState<'standard' | 'smart'>('standard');

  // Form states for STANDARD template
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Atas');
  const [customCategory, setCustomCategory] = useState('');
  const [entity, setEntity] = useState('');
  const [address, setAddress] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [convocacao1, setConvocacao1] = useState('19:00');
  const [convocacao2, setConvocacao2] = useState('19:30');
  const [tipoAssembleia, setTipoAssembleia] = useState('Geral Ordinária');
  const [ordemDoDia, setOrdemDoDia] = useState('');
  const [presidentName, setPresidentName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');

  // Form states for SMART template (red-text parser)
  const [smartTitle, setSmartTitle] = useState('');
  const [smartCategory, setSmartCategory] = useState('Atas');
  const [smartDescription, setSmartDescription] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [instrumentedHtml, setInstrumentedHtml] = useState('');
  const [extractedFields, setExtractedFields] = useState<Array<{ id: string; originalText: string; currentValue: string }>>([]);
  const [extractedAlineas, setExtractedAlineas] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedAlineas, setSelectedAlineas] = useState<string[]>([]);
  const [showRedHighlights, setShowRedHighlights] = useState(true);

  // Members search and autocomplete popup
  const [activeSearchFieldId, setActiveSearchFieldId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Resolve styles/icons dynamically for templates grid
  const resolvedTemplates = templates.map((tpl) => {
    let icon = BookOpen;
    let color = 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20';
    
    switch (tpl.category?.toUpperCase()) {
      case 'ATAS':
        icon = Users;
        color = 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20';
        break;
      case 'CONVOCATÓRIAS':
      case 'CONVOCATORIAS':
        icon = Send;
        color = 'bg-pink-600/10 text-pink-400 border-pink-500/20';
        break;
      case 'COMERCIAL':
        icon = FileCode;
        color = 'bg-amber-600/10 text-amber-400 border-amber-500/20';
        break;
      case 'QUÓRUM':
      case 'QUORUM':
        icon = Clipboard;
        color = 'bg-green-600/10 text-green-400 border-green-500/20';
        break;
    }
    
    return { ...tpl, icon, color };
  });

  const handleApplyTemplate = (tpl: any) => {
    const doc: Document = {
      id: `doc-template-${Date.now()}`,
      name: `${tpl.title}.docx`,
      type: 'docx',
      folder: 'GERAL',
      size: '15 KB',
      creator: 'Sistema',
      date: new Date().toISOString().split('T')[0],
      entity: tpl.fields?.entity || 'ENTIDADE',
      address: tpl.fields?.address || 'ENDEREÇO',
      localidade: tpl.fields?.localidade || 'CIDADE',
      convocacao1: tpl.fields?.convocacao1 || '19:00',
      convocacao2: tpl.fields?.convocacao2 || '19:30',
      tipoAssembleia: tpl.fields?.tipoAssembleia || 'Geral',
      ordemDoDia: tpl.fields?.ordemDoDia || '',
      signatures: tpl.fields?.signatures || [],
      imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuaHr0aDaB63WcWIgNiIJ-Kz-h5eVKYLZtf5VEZwnVtyE7t2-TJ55KMcBhbXxf6UVeCeoy2NszbXz3FyJTKdtFzvnV-NgCJkGjakFqDuRIY36dvUrB0_Ioe-lYUgRinuAKEun6cPiJrmKA-khUsJvx8rCD86CWObt4dd7NM9FEIW79s0sjlnlvx6cK2O87n0gsztYSkT2JVYyaaMMYT_NsjOay2s1N1Z_OzhicfLu0fF3oY-1Rj5H-mfYiODGMcK1AiWE',
      isRichTemplate: tpl.isRichTemplate,
      richContent: tpl.richContent,
      selectedAlineas: tpl.selectedAlineas,
      richFieldsData: tpl.richFieldsData
    };

    onSelectDocument(doc);
    setSelectedTemplate(null);
    setCurrentTab('editor');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o título do modelo.');
      return;
    }

    const finalCategory = category === 'Outro' ? (customCategory.trim() || 'Geral') : category;
    
    const signatures = [];
    if (presidentName.trim()) {
      signatures.push({ name: presidentName.trim(), role: 'Presidente de Mesa' });
    }
    if (secretaryName.trim()) {
      signatures.push({ name: secretaryName.trim(), role: 'Secretário de Mesa' });
    }
    if (signatures.length === 0) {
      signatures.push({ name: 'Presidente do Conselho', role: 'Presidente' });
    }

    const newTpl: Template = {
      id: `tpl-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Modelo de documento customizado.',
      category: finalCategory,
      fields: {
        entity: entity.trim() || 'ENTIDADE NÃO ESPECIFICADA',
        address: address.trim() || 'ENDEREÇO NÃO ESPECIFICADO',
        localidade: localidade.trim() || 'São Paulo',
        convocacao1,
        convocacao2,
        tipoAssembleia,
        ordemDoDia: ordemDoDia.trim() || '1. Expediente geral e comunicados da diretoria;\n2. Deliberações e pauta do dia;\n3. Assuntos diversos e encerramento.',
        signatures
      }
    };

    onAddTemplate(newTpl);
    setShowAddModal(false);
    
    // Clear states
    setTitle('');
    setDescription('');
    setEntity('');
    setAddress('');
    setLocalidade('');
    setOrdemDoDia('');
    setPresidentName('');
    setSecretaryName('');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este modelo de documento?')) {
      onDeleteTemplate(id);
    }
  };

  // --- SMART MODEL PARSING & LOGIC ---
  const handleParseContent = (content: string, isHtml: boolean = true) => {
    let baseHtml = content;
    
    if (!isHtml) {
      // Convert plain text markdown/braces format to compliant span HTML
      baseHtml = content
        .replace(/\[red:(.*?)\]/g, '<span style="color: red;">$1</span>')
        .replace(/<red>(.*?)<\/red>/g, '<span style="color: red;">$1</span>')
        .replace(/\{\{(.*?)\}\}/g, '<span style="color: red;">$1</span>')
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('a)') || trimmed.startsWith('b)') || trimmed.startsWith('c)') || trimmed.startsWith('d)') || /^\s*[0-9]+[).]\s*/.test(trimmed)) {
            return `<div class="alinea" style="margin-left: 20px; margin-bottom: 8px;">${line}</div>`;
          }
          return `<p style="margin-bottom: 12px; text-align: justify;">${line}</p>`;
        })
        .join('');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(baseHtml, 'text/html');
    
    // 1. Identify all red colored elements
    const elements = doc.querySelectorAll('*');
    const fields: Array<{ id: string; originalText: string; currentValue: string }> = [];
    let fieldCounter = 0;

    elements.forEach((el) => {
      const style = el.getAttribute('style') || '';
      const colorAttr = el.getAttribute('color') || '';
      
      const isRedSpan = (el.tagName === 'SPAN' || el.tagName === 'STRONG' || el.tagName === 'P') && 
        (style.includes('color: red') || style.includes('color: rgb(255, 0, 0)') || style.includes('color:#ef4444') || style.includes('color: #ef4444') || style.includes('color: rgb(239, 68, 68)'));
      const isRedFont = el.tagName === 'FONT' && (colorAttr === 'red' || colorAttr === '#ef4444' || colorAttr === '#ff0000');
      const isRedTag = el.tagName === 'RED';
      
      if (isRedSpan || isRedFont || isRedTag) {
        const originalText = el.textContent || '';
        if (originalText.trim()) {
          const id = `field-${fieldCounter++}`;
          el.setAttribute('data-field-id', id);
          fields.push({
            id,
            originalText: originalText.trim(),
            currentValue: originalText.trim()
          });
        }
      }
    });

    // 2. Identify all Alíneas (bullet lists or lettered listings)
    const alineas: Array<{ id: string; text: string }> = [];
    let alineaCounter = 0;
    
    const allParagraphsAndDivs = doc.querySelectorAll('p, div, li');
    allParagraphsAndDivs.forEach((el) => {
      const text = el.textContent || '';
      const trimText = text.trim();
      
      // Matches a) b) c) or 1) 2) or - list items
      const matchesAlinea = /^\s*([a-zA-Z0-9\-–\s]+[)\.])\s*(.*)$/.test(trimText);
      const isAlineaClass = el.classList.contains('alinea');
      
      if ((matchesAlinea || isAlineaClass) && trimText.length > 2) {
        const id = `alinea-${alineaCounter++}`;
        el.setAttribute('data-alinea-id', id);
        alineas.push({
          id,
          text: trimText
        });
      }
    });

    setExtractedFields(fields);
    setExtractedAlineas(alineas);
    setSelectedAlineas(alineas.map(a => a.id));
    setInstrumentedHtml(doc.body.innerHTML);
    setPastedContent(content);
  };

  // Loads our elegant condenser Condo example instantly
  const handleLoadPreset = () => {
    handleParseContent(PRESET_TEMPLATE_HTML, true);
    setSmartTitle('Modelo de Condomínio Inteligente');
    setSmartDescription('Template importado com seções de alíneas editáveis e assinaturas.');
  };

  // Handles dynamic file reads
  const handleSmartFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);

    if (isImage) {
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Base template structure incorporating the uploaded PNG/JPG as a clean backdrop page template
        const baseContent = `<div style="font-family: sans-serif; text-align: center; color: #18181b;">
          <h2 style="font-weight: bold; margin-bottom: 20px; font-size: 1.25rem;">DOCUMENTO DIGITALIZADO</h2>
          <div style="margin: 16px auto; max-width: 100%; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <img src="${dataUrl}" style="width: 100%; height: auto; max-height: 480px; object-fit: contain; display: block;" />
          </div>
          <div style="margin-top: 24px; text-align: left; border-top: 1px solid #f4f4f5; padding-top: 16px; font-size: 0.9rem; line-height: 1.6;">
            <p style="margin-bottom: 12px;"><strong>Ata de Assembleia Geral / Modelo de Assinatura de Imagem</strong></p>
            <p style="margin-bottom: 10px;">
              Entidade Vinculada: <span style="color: red;">[NOME DA ENTIDADE]</span>
            </p>
            <p style="margin-bottom: 10px;">
              Data do Registro: <span style="color: red;">[DATA DE INSTALAÇÃO]</span>
            </p>
            <p style="margin-bottom: 10px;">
              Presidente de Mesa / Síndico: <span style="color: red;">[NOME DO PRESIDENTE]</span>
            </p>
            <p style="margin-bottom: 12px;">Pauta de Deliberações extraídas da imagem base:</p>
            <div class="alinea" style="margin-left: 20px; margin-bottom: 8px;">
              a) Homologação dos termos do documento em imagem digitalizado acima;
            </div>
            <div class="alinea" style="margin-left: 20px; margin-bottom: 8px;">
              b) Deliberação sobre os tópicos gerais e assinaturas do modelo importado.
            </div>
          </div>
        </div>`;
        
        handleParseContent(baseContent, true);
        setSmartTitle(file.name.replace(/\.[^/.]+$/, ''));
        setSmartDescription('Modelo inteligente criado com base em arquivo de imagem.');
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
        handleParseContent(text, isHtml);
        setSmartTitle(file.name.replace(/\.[^/.]+$/, ''));
        setSmartDescription('Modelo inteligente criado com base em arquivo de texto/HTML.');
      };
      reader.readAsText(file);
    }
  };

  // Compiles real-time parsed preview on the right
  const getLiveHtml = () => {
    if (!instrumentedHtml) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(instrumentedHtml, 'text/html');
    
    // Fill dynamic inputs
    extractedFields.forEach((field) => {
      const el = doc.querySelector(`[data-field-id="${field.id}"]`);
      if (el) {
        el.textContent = field.currentValue || field.originalText;
        if (showRedHighlights) {
          el.setAttribute('style', 'color: #ef4444; font-weight: bold; background-color: rgba(239, 68, 68, 0.08); padding: 0 4px; border-bottom: 1px dashed #ef4444; border-radius: 4px;');
        } else {
          el.setAttribute('style', 'color: #18181b; font-weight: normal; border-bottom: none;');
        }
      }
    });

    // Hide unchecked alíneas
    extractedAlineas.forEach((alinea) => {
      const el = doc.querySelector(`[data-alinea-id="${alinea.id}"]`);
      if (el) {
        if (selectedAlineas.includes(alinea.id)) {
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

    return doc.body.innerHTML;
  };

  // Toggle alínea selection helper
  const handleToggleAlinea = (id: string) => {
    if (selectedAlineas.includes(id)) {
      setSelectedAlineas(selectedAlineas.filter(item => item !== id));
    } else {
      setSelectedAlineas([...selectedAlineas, id]);
    }
  };

  // Handle autocomplete selection
  const handleSelectMemberForField = (fieldId: string, member: Member) => {
    const updated = extractedFields.map(f => {
      if (f.id === fieldId) {
        return { ...f, currentValue: member.name };
      }
      return f;
    });
    setExtractedFields(updated);
    setActiveSearchFieldId(null);
    setMemberSearchQuery('');
  };

  // Saves compiled template to library and directly pre-fills active document in editor!
  const handleSaveAndPreFillSmart = () => {
    if (!smartTitle.trim()) {
      alert('Por favor, informe o título do modelo inteligente.');
      return;
    }

    const finalHtml = getLiveHtml();
    
    const newTpl: Template = {
      id: `tpl-smart-${Date.now()}`,
      title: smartTitle.trim(),
      description: smartDescription.trim() || 'Modelo Inteligente criado via importação.',
      category: smartCategory,
      fields: {
        entity: extractedFields[0]?.currentValue || 'Entidade',
        address: extractedFields[1]?.currentValue || 'Sede Social',
        localidade: 'Cidade',
        convocacao1: '18:00',
        convocacao2: '18:30',
        tipoAssembleia: 'Geral',
        ordemDoDia: extractedAlineas
          .filter(a => selectedAlineas.includes(a.id))
          .map(a => a.text)
          .join('\n'),
        signatures: []
      },
      isRichTemplate: true,
      richContent: instrumentedHtml, // Store base instrumented html
      selectedAlineas,
      richFieldsData: extractedFields.reduce((acc, f) => {
        acc[f.id] = f.currentValue;
        return acc;
      }, {} as Record<string, string>)
    };

    // Save Template in database
    onAddTemplate(newTpl);

    // Apply template and go to editor!
    const doc: Document = {
      id: `doc-smart-${Date.now()}`,
      name: `${smartTitle.trim()}.docx`,
      type: 'docx',
      folder: 'GERAL',
      size: '18 KB',
      creator: 'Sistema',
      date: new Date().toISOString().split('T')[0],
      entity: extractedFields[0]?.currentValue || 'Entidade',
      address: extractedFields[1]?.currentValue || 'Sede',
      localidade: 'Cidade',
      convocacao1: '18:00',
      convocacao2: '18:30',
      tipoAssembleia: 'Geral',
      ordemDoDia: extractedAlineas
        .filter(a => selectedAlineas.includes(a.id))
        .map(a => a.text)
        .join('\n'),
      signatures: [],
      isRichTemplate: true,
      richContent: instrumentedHtml, // Keep original instrumented content
      selectedAlineas,
      richFieldsData: extractedFields.reduce((acc, f) => {
        acc[f.id] = f.currentValue;
        return acc;
      }, {} as Record<string, string>)
    };

    onSelectDocument(doc);
    setShowAddModal(false);
    
    // Clear smart state
    setSmartTitle('');
    setSmartDescription('');
    setPastedContent('');
    setInstrumentedHtml('');
    setExtractedFields([]);
    setExtractedAlineas([]);
    setSelectedAlineas([]);
    
    // Go to Editor
    setCurrentTab('editor');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto w-full font-sans"
    >
      {/* Header and control actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-indigo-500">
            <BookOpen className="w-8 h-8" />
            <h2 className={`text-3xl font-extrabold tracking-tight ${isHighContrast ? 'text-zinc-900' : 'text-white'}`}>Documentos para Assembleia</h2>
          </div>
          <p className={`text-sm ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Insira, exclua ou escolha um esqueleto estrutural otimizado para iniciar a edição do seu documento.
          </p>
        </div>

        {/* View Switcher and Add Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center rounded-full p-0.5 border h-9 overflow-hidden ${
            isHighContrast ? 'border-zinc-200 bg-zinc-100' : 'border-zinc-800 bg-zinc-950'
          }`}>
            <button 
              onClick={() => setViewMode('list')}
              title="Visualizar em Lista"
              className={`h-full rounded-full px-3.5 flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isHighContrast 
                    ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Check size={11} className={`transition-all duration-200 ${viewMode === 'list' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
              <List size={13} /> Lista
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              title="Visualizar em Grade"
              className={`h-full rounded-full px-3.5 flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-all ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isHighContrast 
                    ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Check size={11} className={`transition-all duration-200 ${viewMode === 'grid' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
              <LayoutGrid size={13} /> Grade
            </button>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              setCreationTab('standard');
            }}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={14} /> Novo Modelo
          </button>
        </div>
      </div>

      {/* Grid or List View Container */}
      {resolvedTemplates.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border border-dashed ${
          isHighContrast ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-950/25'
        }`}>
          <AlertCircle size={32} className="text-zinc-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">Nenhum modelo cadastrado.</p>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-2"
          >
            Criar meu primeiro modelo de documento
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {resolvedTemplates.map((tpl) => {
            const Icon = tpl.icon;
            // Aesthetic preview images matching Documents.tsx card visual layout
            const mockPreviewImage = tpl.isRichTemplate 
              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrsCc1qJPMsSsPd5TMwMO_6Mh8RIwizuPIstBj5U0dfuh06udiKstFKzuemcGeH8pdAw41lHv_hDYMYp5Mgqt7ixVVxojd_ZuasFvjaz76lWGE-8ztGzVHDikIbEG-OYJRh6HqsQ936hGvMr-qFsJtAonpsBBu-LVt29DoOu2_nAiu5js398uRoV04biNp-kBWVPTkA_nW0MWJdWa7eyqxSCSSYhjP11lDXzT77auKrOs2SLNcyrIq3A'
              : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA';

            return (
              <div 
                key={tpl.id}
                className={`flex flex-col border hover:border-indigo-500 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-sm relative ${
                  isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                }`}
                onClick={() => setSelectedTemplate(tpl)}
              >
                {/* Header matching Documents.tsx styling */}
                <div className={`p-4 flex items-center justify-between border-b ${
                  isHighContrast ? 'border-zinc-100 bg-zinc-50' : 'border-zinc-850 bg-zinc-900/30'
                }`}>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                      <Icon size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${
                        isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                      }`}>
                        {tpl.title}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">{tpl.category}</p>
                    </div>
                  </div>

                  {/* Actions matching Documents.tsx */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleDeleteClick(e, tpl.id)}
                      title="Excluir Modelo"
                      className={`p-1 rounded transition-all ${
                        isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-600 hover:text-red-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tpl);
                      }}
                      title="Visualizar"
                      className={`p-1 rounded transition-all ${
                        isHighContrast ? 'text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Area matching Documents.tsx */}
                <div 
                  className={`aspect-[4/3] overflow-hidden relative ${isHighContrast ? 'bg-zinc-50' : 'bg-zinc-900/50'}`}
                >
                  <img 
                    src={mockPreviewImage} 
                    alt={tpl.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-104 transition-all duration-500"
                  />
                  {tpl.isRichTemplate && (
                    <span className="absolute top-3 left-3 text-[8px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-md">
                      Inteligente
                    </span>
                  )}
                  {/* Hover Overlay containing primary Actions */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <span className="px-3 py-1.5 bg-zinc-900/95 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-zinc-800 transition-colors">
                      <Eye size={12} /> Preview
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tpl);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500 transition-colors"
                    >
                      Usar Modelo <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create New Model Bento Card to exactly match Pastas Upload Bento Card */}
          <div 
            onClick={() => {
              setShowAddModal(true);
              setCreationTab('standard');
            }}
            className={`flex flex-col border-2 border-dashed rounded-2xl items-center justify-center p-6 min-h-[220px] cursor-pointer group transition-all duration-300 ${
              isHighContrast 
                ? 'bg-white border-zinc-300 hover:border-indigo-500 hover:bg-zinc-50/50 shadow-sm' 
                : 'bg-zinc-950/40 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900/20'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-indigo-500" />
            </div>
            <span className={`text-xs font-bold transition-colors ${
              isHighContrast ? 'text-zinc-700 group-hover:text-indigo-600' : 'text-zinc-400 group-hover:text-indigo-400'
            }`}>
              Novo Modelo de Documento
            </span>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-xs text-center font-medium leading-relaxed">
              Crie um novo modelo estruturado de ata ou documento para usar como esqueleto automatizado.
            </p>
          </div>
        </div>
      ) : (
        /* List View matching Documents.tsx styling */
        <div className="space-y-3 animate-in fade-in duration-200">
          {resolvedTemplates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div 
                key={tpl.id}
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer group transition-all duration-300 shadow-sm ${
                  isHighContrast 
                    ? 'bg-white border-zinc-200 hover:border-indigo-500 hover:bg-zinc-50' 
                    : 'bg-zinc-950/40 border-zinc-850 hover:border-indigo-500 hover:bg-zinc-900/10'
                }`}
                onClick={() => setSelectedTemplate(tpl)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {tpl.title}
                      </p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 shrink-0`}>
                        {tpl.category}
                      </span>
                      {tpl.isRichTemplate && (
                        <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                          Inteligente
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 truncate max-w-2xl font-medium leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button 
                    onClick={(e) => handleDeleteClick(e, tpl.id)}
                    title="Excluir Modelo"
                    className={`p-1.5 rounded transition-all ${
                      isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-600 hover:text-red-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(tpl);
                    }}
                    title="Usar Modelo"
                    className={`p-1.5 rounded transition-all ${
                      isHighContrast ? 'text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Eye size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insert Template Dialog Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl w-full overflow-hidden shadow-2xl transition-all ${
                creationTab === 'smart' ? 'max-w-6xl' : 'max-w-2xl'
              } ${
                isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2 text-indigo-500">
                  <Plus size={16} />
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isHighContrast ? 'text-zinc-850' : 'text-zinc-200'}`}>
                    Criar Novo Modelo de Documento
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Segmented Control Switcher for Creation Modes */}
              <div className={`p-3 border-b flex justify-center ${
                isHighContrast ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-950/20 border-zinc-850'
              }`}>
                <div className={`flex rounded-full p-0.5 border h-9 overflow-hidden max-w-md w-full ${
                  isHighContrast ? 'border-zinc-200 bg-zinc-100' : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <button
                    type="button"
                    onClick={() => setCreationTab('standard')}
                    className={`flex-1 rounded-full text-xs font-bold transition-all ${
                      creationTab === 'standard'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isHighContrast ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Formulário Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationTab('smart')}
                    className={`flex-1 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      creationTab === 'smart'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isHighContrast ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles size={13} className="text-amber-400" /> Upload Inteligente por Cores
                  </button>
                </div>
              </div>

              {/* TAB 1: STANDARD CREATION FORM */}
              {creationTab === 'standard' && (
                <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  
                  {/* Basic info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Título do Modelo *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Ata de Reunião Extraordinária"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all ${
                          isHighContrast 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:bg-zinc-950/40'
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                      <div className="flex gap-2">
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`p-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                            isHighContrast 
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <option value="Atas">Atas</option>
                          <option value="Convocatórias">Convocatórias</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Quórum">Quórum</option>
                          <option value="Outro">Outro...</option>
                        </select>
                        
                        {category === 'Outro' && (
                          <input 
                            type="text" 
                            placeholder="Nova Categoria"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className={`flex-1 p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all ${
                              isHighContrast 
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Descrição do Template</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Ideal para documentar eleições do conselho diretivo."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all ${
                        isHighContrast 
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    />
                  </div>

                  {/* Structured details wrapper */}
                  <div className={`p-4 rounded-xl border space-y-3.5 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-150' : 'bg-zinc-950 border-zinc-800/60'
                  }`}>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Dados Padrão da Entidade</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome da Entidade / Empresa</label>
                      <input 
                        type="text" 
                        placeholder="Ex: MINISTÉRIO NOVA VIDA"
                        value={entity}
                        onChange={(e) => setEntity(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Endereço da Sede</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Rua das Flores, 100"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cidade / Localidade</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Pirassununga"
                          value={localidade}
                          onChange={(e) => setLocalidade(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">1ª Convocação</label>
                        <input 
                          type="text" 
                          value={convocacao1}
                          onChange={(e) => setConvocacao1(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">2ª Convocação</label>
                        <input 
                          type="text" 
                          value={convocacao2}
                          onChange={(e) => setConvocacao2(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tipo de Assembleia</label>
                        <input 
                          type="text" 
                          value={tipoAssembleia}
                          onChange={(e) => setTipoAssembleia(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Ordem do Dia / Pauta Inicial (Uma por linha)</label>
                      <textarea 
                        rows={3}
                        placeholder="Ex: a) Eleição da diretoria;&#10;b) Prestação de contas do exercício fiscal anterior."
                        value={ordemDoDia}
                        onChange={(e) => setOrdemDoDia(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 whitespace-pre ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Default signatures section */}
                  <div className={`p-4 rounded-xl border space-y-3.5 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-150' : 'bg-zinc-950 border-zinc-800/60'
                  }`}>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Assinaturas do Modelo</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Presidente de Mesa</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Ítalo Diego Mariano"
                          value={presidentName}
                          onChange={(e) => setPresidentName(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Secretário de Mesa</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Patrícia Gonçalves Rombe"
                          value={secretaryName}
                          onChange={(e) => setSecretaryName(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Salvar Modelo <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SMART CORES (RED = EDITABLE) CREATION FLOW */}
              {creationTab === 'smart' && (
                <div className="flex flex-col lg:flex-row h-[72vh] overflow-hidden">
                  
                  {/* Left panel: parameters and extracted fields (45% width) */}
                  <div className={`lg:w-[45%] flex flex-col h-full border-r overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                  }`}>
                    
                    {/* Meta properties */}
                    <div className="space-y-3.5">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-amber-400" /> Identificação do Modelo Inteligente
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Título do Modelo *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ex: Contrato de Serviços"
                            value={smartTitle}
                            onChange={(e) => setSmartTitle(e.target.value)}
                            className={`w-full py-1.5 px-2.5 rounded-lg border text-xs focus:outline-none focus:border-indigo-500 ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                          <select 
                            value={smartCategory}
                            onChange={(e) => setSmartCategory(e.target.value)}
                            className={`w-full py-1.5 px-2 rounded-lg border text-xs focus:outline-none ${
                              isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                            }`}
                          >
                            <option value="Atas">Atas</option>
                            <option value="Convocatórias">Convocatórias</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Quórum">Quórum</option>
                            <option value="Outro">Geral</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Extração automática de campos editáveis (vermelhos)."
                          value={smartDescription}
                          onChange={(e) => setSmartDescription(e.target.value)}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs focus:outline-none ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-850'}`} />

                    {/* File Input and presets */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Inserir Conteúdo do Documento</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* File Upload Trigger */}
                        <div className="relative">
                          <input 
                            type="file" 
                            accept=".html,.htm,.txt,.md,.png,.jpg,.jpeg" 
                            onChange={handleSmartFileUpload}
                            className="hidden" 
                            id="smart-file-upload" 
                          />
                          <label 
                            htmlFor="smart-file-upload" 
                            className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-center cursor-pointer transition-all active:scale-98 ${
                              isHighContrast 
                                ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700' 
                                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300'
                            }`}
                          >
                            <UploadCloud size={13} /> Upload HTML/TXT/PNG
                          </label>
                        </div>

                        {/* Preset Test Case Button */}
                        <button
                          type="button"
                          onClick={handleLoadPreset}
                          className="w-full py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                        >
                          <Sparkles size={12} className="animate-pulse" /> Carregar Exemplo
                        </button>
                      </div>

                      {/* Manual text area pasting */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Ou cole HTML / Texto do Documento:</label>
                          <span className="text-[8px] text-zinc-500 italic">Preencha {"{{campo}}"} para demarcar em vermelho!</span>
                        </div>
                        <textarea 
                          rows={4}
                          value={pastedContent}
                          onChange={(e) => handleParseContent(e.target.value, false)}
                          placeholder="Digite ou cole seu esqueleto de ata ou documento aqui...&#10;Dica: Use {{campo}} para criar um campo editável vermelho automaticamente!"
                          className={`w-full p-2.5 rounded-xl border font-mono text-[10px] focus:outline-none resize-none leading-relaxed ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                          }`}
                        />
                      </div>
                    </div>

                    {extractedFields.length > 0 && (
                      <>
                        <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-850'}`} />

                        {/* Extracted Editable Fields list (Red texts) */}
                        <div className="space-y-3 relative">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 flex items-center justify-between">
                            <span>Campos em Vermelho (Editáveis)</span>
                            <span className="text-[8px] font-bold uppercase bg-red-500/10 text-red-400 py-0.5 px-2 rounded-full">
                              {extractedFields.length} detectados
                            </span>
                          </h4>

                          <div className="space-y-3 max-h-[300px] pr-1">
                            {extractedFields.map((field) => (
                              <div key={field.id} className="space-y-1.5 relative">
                                <label className="text-[9px] font-bold uppercase text-zinc-500 block">
                                  Campo Original: <span className="italic text-zinc-400">{field.originalText}</span>
                                </label>
                                
                                <div className="relative flex items-center gap-1.5">
                                  <input 
                                    type="text" 
                                    value={field.currentValue}
                                    onChange={(e) => {
                                      const updatedVal = e.target.value;
                                      setExtractedFields(extractedFields.map(f => f.id === field.id ? { ...f, currentValue: updatedVal } : f));
                                    }}
                                    className={`w-full py-1.5 px-2.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-8 ${
                                      isHighContrast ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900/40 border-zinc-800 text-white'
                                    }`}
                                  />
                                  
                                  {/* Member Search Trigger Icon Button */}
                                  <button
                                    type="button"
                                    title="Buscar na aba Membros"
                                    onClick={() => {
                                      setActiveSearchFieldId(activeSearchFieldId === field.id ? null : field.id);
                                      setMemberSearchQuery('');
                                    }}
                                    className={`p-1.5 rounded-lg border shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                                      activeSearchFieldId === field.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : isHighContrast
                                          ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-600'
                                          : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                                    }`}
                                  >
                                    <Users size={12} />
                                  </button>

                                  {/* Autocomplete Popover Dropdown */}
                                  <AnimatePresence>
                                    {activeSearchFieldId === field.id && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className={`absolute right-0 left-0 top-[105%] z-50 p-2.5 border rounded-xl shadow-xl space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar ${
                                          isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                                        }`}
                                      >
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
                                                onClick={() => handleSelectMemberForField(field.id, m)}
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
                                            ))
                                          }
                                          {members.filter(m => 
                                            m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
                                            m.cargo.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                          ).length === 0 && (
                                            <p className="text-[10px] text-zinc-500 italic text-center py-2">Nenhum membro encontrado.</p>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {extractedAlineas.length > 0 && (
                      <>
                        <div className={`h-px ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-850'}`} />

                        {/* Extracted Alíneas Section with toggle checklist */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 flex items-center justify-between">
                            <span>Alíneas / Sub-tópicos Ativos</span>
                            <span className="text-[8px] font-bold uppercase bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full">
                              {selectedAlineas.length}/{extractedAlineas.length} ativos
                            </span>
                          </h4>

                          <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                            {extractedAlineas.map((alinea) => {
                              const isActive = selectedAlineas.includes(alinea.id);
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
                      </>
                    )}
                  </div>

                  {/* Right panel: dynamic live A4 doc rendering (55% width) */}
                  <div className={`lg:w-[55%] flex flex-col h-full overflow-hidden ${
                    isHighContrast ? 'bg-zinc-100/80' : 'bg-zinc-900/60'
                  }`}>
                    {/* Toolbar */}
                    <div className={`p-3 border-b flex justify-between items-center shrink-0 ${
                      isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                    }`}>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500">Live Preview A4</span>
                      
                      {/* Highlighting toggle */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-zinc-500">Ver Vermelhos:</span>
                        <button
                          type="button"
                          onClick={() => setShowRedHighlights(!showRedHighlights)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                            showRedHighlights ? 'bg-red-500' : 'bg-zinc-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            showRedHighlights ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Sheet Canvas scroll outer */}
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                      {instrumentedHtml ? (
                        <div 
                          className="w-[510px] bg-white text-zinc-900 p-8 shadow-xl min-h-[720px] rounded border border-zinc-200 select-text font-serif scale-100 origin-top text-[11px]"
                          dangerouslySetInnerHTML={{ __html: getLiveHtml() }}
                        />
                      ) : (
                        <div className="m-auto text-center space-y-3.5 max-w-sm">
                          <div className="w-12 h-12 bg-zinc-800/10 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-zinc-400">Nenhum Documento Carregado</p>
                            <p className="text-[11px] text-zinc-500 mt-1">Carregue um arquivo .html/.txt ou clique em "Carregar Exemplo" para preencher instantaneamente!</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom action drawer */}
                    <div className={`p-4 border-t flex justify-end gap-3 shrink-0 ${
                      isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-850'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAndPreFillSmart}
                        disabled={!instrumentedHtml || !smartTitle.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        Salvar e Preencher no Editor <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Dialog overlay for clicking cards */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2 text-indigo-500">
                  <Sparkles size={14} className="animate-pulse" />
                  <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Outline do Template</h3>
                </div>
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Título do Template</h4>
                  <p className={`text-xs font-extrabold mt-1 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>{selectedTemplate.title}</p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Estrutura Pré-preenchida</h4>
                  <div className={`mt-2 space-y-2 text-xs p-4 rounded-xl border max-h-[300px] overflow-y-auto ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800/80'
                  }`}>
                    {selectedTemplate.isRichTemplate ? (
                      <div className="text-[10px] font-serif leading-relaxed text-zinc-700">
                        <p className="text-zinc-400 font-bold uppercase tracking-wide text-[8px] mb-2">Visualização Rápida:</p>
                        <div dangerouslySetInnerHTML={{ __html: selectedTemplate.richContent }} />
                      </div>
                    ) : (
                      <>
                        <p className={isHighContrast ? 'text-zinc-800' : 'text-zinc-400'}><strong className="text-zinc-500">Entidade:</strong> {selectedTemplate.fields?.entity}</p>
                        <p className={isHighContrast ? 'text-zinc-800' : 'text-zinc-400'}><strong className="text-zinc-500">Assembleia:</strong> {selectedTemplate.fields?.tipoAssembleia}</p>
                        <div className={`w-full h-px my-2 ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800/80'}`} />
                        <p className={`font-bold block mb-1 ${isHighContrast ? 'text-zinc-900' : 'text-zinc-200'}`}>Ordem do Dia / Pauta:</p>
                        <pre className={`text-[11px] whitespace-pre-wrap font-mono leading-relaxed ${
                          isHighContrast ? 'text-zinc-700' : 'text-zinc-400'
                        }`}>
                          {selectedTemplate.fields?.ordemDoDia}
                        </pre>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Usar no Editor <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
