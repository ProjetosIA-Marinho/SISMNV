import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Info,
  ShieldCheck,
  Zap,
  BookOpen,
  FileText,
  Plus,
  Users,
  Send,
  Clipboard,
  FileCode
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import Documents from './components/Documents';
import Members from './components/Members';
import Templates from './components/Templates';
import Editor from './components/Editor';
import Settings from './components/Settings';
import Finance from './components/Finance';
import Login from './components/Login';

import { Document, Member, Activity, Tab, Template, CalendarEvent, AuthUser } from './types';
import { MNV_LOGO_BASE64 } from './assets/logoMnvBase64';
import { 
  INITIAL_DOCUMENTS, 
  INITIAL_MEMBERS, 
  INITIAL_ACTIVITIES,
  INITIAL_TEMPLATES
} from './mockData';

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'ev-1', date: '2026-07-20', title: 'Assembleia Geral Extraordinária', time: '19:00', type: 'assembly' },
  { id: 'ev-2', date: '2026-07-28', title: 'Reunião de Conselho', time: '18:30', type: 'council' },
  { id: 'ev-3', date: '2026-08-05', title: 'Homologação de Contas', time: '14:00', type: 'admin' },
  { id: 'ev-4', date: '2026-08-18', title: 'Planejamento de Mandato', time: '09:00', type: 'planning' },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  
  // Real active state list loaded from mockData initial values
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [showChooseTemplateModal, setShowChooseTemplateModal] = useState<boolean>(false);

  // Lifted subfolders state
  const [subfolders, setSubfolders] = useState<Record<string, string[]>>({
    'ORDINÁRIA': ['2024', '2025', '2026'],
    'EXTRAORDINÁRIA': ['Urgentes', 'Diretoria'],
    'GERAL': ['Conselho', 'Finanças']
  });

  // Lifted folders state
  const [folders, setFolders] = useState<string[]>(['EXTRAORDINÁRIA', 'ORDINÁRIA', 'GERAL']);

  
  // Currently active document loaded into the form editor
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(INITIAL_DOCUMENTS[0]);
  
  // Real-time interactive search query (filters across multiple tabs dynamically!)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI analysis modal status state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAIResult, setShowAIResult] = useState<boolean>(false);
  const [aiReport, setAIReport] = useState<any>(null);

  // System branding logo (persisted in localStorage)
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    return localStorage.getItem('sismnv_system_logo') || MNV_LOGO_BASE64;
  });

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('sismnv_auth_user') || sessionStorage.getItem('sismnv_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      if (user.rememberMe) {
        localStorage.setItem('sismnv_auth_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('sismnv_auth_user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to save user session', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sismnv_auth_user');
      sessionStorage.removeItem('sismnv_auth_user');
    } catch (err) {
      console.error('Failed to clear user session', err);
    }
  };

  const handleUpdateSystemLogo = (logo: string | null) => {
    setSystemLogo(logo);
    if (logo) {
      try {
        localStorage.setItem('sismnv_system_logo', logo);
      } catch (err) {
        console.error('Failed to save logo to localStorage', err);
      }
    } else {
      localStorage.removeItem('sismnv_system_logo');
    }
  };

  // Global actions
  const handleAddDocument = (newDoc: Document) => {
    setDocuments([newDoc, ...documents]);
    
    // Append a matching activity to the stream
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      workspace: newDoc.folder === 'EXTRAORDINÁRIA' ? 'MS-83EH2' : 'WS-D57L2',
      fileName: newDoc.name,
      fileType: newDoc.type as any,
      editorName: 'Admin User',
      editorInitials: 'AD',
      editorBg: 'bg-indigo-600',
      timeAgo: 'há poucos segundos'
    };
    setActivities([newActivity, ...activities]);
    setSelectedDocument(newDoc);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(documents.find(d => d.id !== id) || null);
    }
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    setSelectedDocument(updatedDoc);

    // Append update log activity
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      workspace: updatedDoc.folder === 'EXTRAORDINÁRIA' ? 'MS-83EH2' : 'WS-D57L2',
      fileName: updatedDoc.name,
      fileType: updatedDoc.type as any,
      editorName: 'Admin User',
      editorInitials: 'AD',
      editorBg: 'bg-indigo-600',
      timeAgo: 'recém editado'
    };
    setActivities([newActivity, ...activities.slice(0, 5)]);
  };

  const handleAddMember = (newMember: Member) => {
    setMembers([newMember, ...members]);
  };

  const handleEditMember = (updatedMember: Member) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleResetData = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setMembers(INITIAL_MEMBERS);
    setActivities(INITIAL_ACTIVITIES);
    setTemplates(INITIAL_TEMPLATES);
    setCalendarEvents(INITIAL_EVENTS);
    setSelectedDocument(INITIAL_DOCUMENTS[0]);
    setSearchQuery('');
  };

  const handleApplyTemplateAndEdit = (tpl: Template) => {
    const doc: Document = {
      id: `doc-template-${Date.now()}`,
      name: `${tpl.title}.docx`,
      type: 'docx',
      folder: 'GERAL',
      size: '15 KB',
      creator: 'Sistema',
      date: new Date().toISOString().split('T')[0],
      entity: tpl.fields?.entity || '',
      address: tpl.fields?.address || '',
      localidade: tpl.fields?.localidade || '',
      convocacao1: tpl.fields?.convocacao1 || '',
      convocacao2: tpl.fields?.convocacao2 || '',
      tipoAssembleia: tpl.fields?.tipoAssembleia || 'Geral',
      ordemDoDia: tpl.fields?.ordemDoDia || '',
      signatures: tpl.fields?.signatures || [],
      imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuaHr0aDaB63WcWIgNiIJ-Kz-h5eVKYLZtf5VEZwnVtyE7t2-TJ55KMcBhbXxf6UVeCeoy2NszbXz3FyJTKdtFzvnV-NgCJkGjakFqDuRIY36dvUrB0_Ioe-lYUgRinuAKEun6cPiJrmKA-khUsJvx8rCD86CWObt4dd7NM9FEIW79s0sjlnlvx6cK2O87n0gsztYSkT2JVYyaaMMYT_NsjOay2s1N1Z_OzhicfLu0fF3oY-1Rj5H-mfYiODGMcK1AiWE',
      isRichTemplate: tpl.isRichTemplate,
      richContent: tpl.richContent,
      selectedAlineas: tpl.selectedAlineas,
      richFieldsData: tpl.richFieldsData
    };

    setDocuments([doc, ...documents]);
    setSelectedDocument(doc);
    setShowChooseTemplateModal(false);
    setCurrentTab('editor');
  };

  // Launch the AI auditor for current document state
  const handleTriggerAI = () => {
    if (!selectedDocument) {
      alert('Nenhum documento selecionado para análise.');
      return;
    }

    setIsAnalyzing(true);

    // Simulate smart analysis timer
    setTimeout(() => {
      // Formulate detailed, dynamic context suggestions based on actual document fields!
      const docName = selectedDocument.name;
      const docEntity = selectedDocument.entity || 'MINISTÉRIO NOVA VIDA';
      const docTime1 = selectedDocument.convocacao1 || '18:00';
      const docTime2 = selectedDocument.convocacao2 || '18:15';
      const signersCount = selectedDocument.signatures?.length || 0;

      // Custom audit rules computed on-the-fly!
      const suggestions = [];
      let score = 100;

      // Rule 1: check timing spacing
      if (docTime1 && docTime2) {
        const [h1, m1] = docTime1.split(':').map(Number);
        const [h2, m2] = docTime2.split(':').map(Number);
        const t1Minutes = h1 * 60 + m1;
        const t2Minutes = h2 * 60 + m2;
        const diff = t2Minutes - t1Minutes;
        if (diff > 0 && diff < 30) {
          suggestions.push({
            type: 'warning',
            title: 'Intervalo de Convocação Insuficiente',
            description: `O intervalo entre a 1ª convocação (${docTime1}) e a 2ª convocação (${docTime2}) é de apenas ${diff} minutos. Recomenda-se um intervalo regulamentar mínimo de 30 minutos para assegurar o quórum de votação.`
          });
          score -= 15;
        } else {
          suggestions.push({
            type: 'success',
            title: 'Janela de Convocação Conforme',
            description: `Janela de convocação regulamentar entre chamadas está de acordo com as diretrizes.`
          });
        }
      }

      // Rule 2: signers compliance
      if (signersCount < 3) {
        suggestions.push({
          type: 'warning',
          title: 'Quórum Mínimo de Assinaturas Executivas',
          description: `O documento possui apenas ${signersCount} assinatura(s) registrada(s). Para homologação plena de atas e convocações oficiais do ${docEntity}, recomenda-se o registro de no mínimo 3 assinantes ativos (Presidente, Secretário e Conselheiro).`
        });
        score -= 20;
      } else {
        suggestions.push({
          type: 'success',
          title: 'Rubricas de Assinaturas Consolidadas',
          description: `Todas as rubricas necessárias para homologação e ata de posse já constam em escopo legal.`
        });
      }

      // Rule 3: check if order of day is filled out
      if (!selectedDocument.ordemDoDia || selectedDocument.ordemDoDia.length < 20) {
        suggestions.push({
          type: 'error',
          title: 'Pauta / Ordem do Dia Pouco Descritiva',
          description: 'A ordem do dia contém pouca ou nenhuma informação sobre os temas a serem deliberados. Descreva de forma detalhada cada tópico para evitar futuras contestações jurídicas.'
        });
        score -= 25;
      } else {
        suggestions.push({
          type: 'success',
          title: 'Ordem do Dia Bem Estruturada',
          description: 'A pauta do dia está descrita de forma sequencial, com tópicos claramente definidos e enumerados.'
        });
      }

      setAIReport({
        score,
        docName,
        entity: docEntity,
        suggestions
      });

      setIsAnalyzing(false);
      setShowAIResult(true);
    }, 1800);
  };

  const handleApplyAIFixes = () => {
    if (!selectedDocument) return;

    // Smart fix: automatically sets correct convocation spacing, entity formatting, and adds a backup signature if missing
    const [h1, m1] = (selectedDocument.convocacao1 || '18:00').split(':').map(Number);
    let newM2 = m1 + 30;
    let newH2 = h1;
    if (newM2 >= 60) {
      newM2 -= 60;
      newH2 += 1;
    }
    const formattedTime2 = `${String(newH2).padStart(2, '0')}:${String(newM2).padStart(2, '0')}`;

    const currentSignatures = selectedDocument.signatures || [];
    const updatedSignatures = [...currentSignatures];
    if (updatedSignatures.length < 3) {
      // Add missing secretary signer
      updatedSignatures.push({
        name: 'Jane Smith',
        role: 'Secretária Executiva'
      });
    }

    const fixedDoc: Document = {
      ...selectedDocument,
      convocacao2: formattedTime2,
      signatures: updatedSignatures
    };

    handleUpdateDocument(fixedDoc);
    setShowAIResult(false);
    alert('As correções automáticas de conformidade da IA (Janela de 30min e Assinatura de Jane Smith) foram aplicadas ao editor com sucesso!');
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <Overview 
            documents={documents}
            members={members}
            activities={activities}
            setCurrentTab={setCurrentTab}
            onSelectDocument={setSelectedDocument}
            isHighContrast={isHighContrast}
            calendarEvents={calendarEvents}
            onUpdateCalendarEvents={setCalendarEvents}
          />
        );
      case 'documents':
        return (
          <Documents 
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onUpdateDocument={handleUpdateDocument}
            setDocuments={setDocuments}
            onSelectDocument={setSelectedDocument}
            setCurrentTab={setCurrentTab}
            searchQuery={searchQuery}
            isHighContrast={isHighContrast}
            folders={folders}
            setFolders={setFolders}
            subfolders={subfolders}
            setSubfolders={setSubfolders}
          />
        );
      case 'members':
        return (
          <Members 
            members={members}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            searchQuery={searchQuery}
            isHighContrast={isHighContrast}
          />
        );
      case 'templates':
        return (
          <Templates 
            documents={documents}
            templates={templates}
            members={members}
            onSelectDocument={setSelectedDocument}
            onAddTemplate={(tpl) => setTemplates([tpl, ...templates])}
            onDeleteTemplate={(id) => setTemplates(templates.filter(t => t.id !== id))}
            setCurrentTab={setCurrentTab}
            isHighContrast={isHighContrast}
          />
        );
      case 'editor':
        return (
          <Editor 
            selectedDocument={selectedDocument}
            onUpdateDocument={handleUpdateDocument}
            onAnalyzeDocument={handleTriggerAI}
            isHighContrast={isHighContrast}
            members={members}
            documents={documents}
            onAddDocument={handleAddDocument}
            subfolders={subfolders}
          />
        );
      case 'settings':
        return (
          <Settings 
            onResetData={handleResetData}
            setCurrentTab={setCurrentTab}
            isHighContrast={isHighContrast}
            onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
            systemLogo={systemLogo}
            onUpdateSystemLogo={handleUpdateSystemLogo}
          />
        );
      case 'finance':
        return (
          <Finance 
            isHighContrast={isHighContrast}
            searchQuery={searchQuery}
          />
        );
      default:
        return <div className="text-zinc-500 uppercase tracking-widest text-center text-xs">Tab em construção...</div>;
    }
  };

  if (!currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        systemLogo={systemLogo}
      />
    );
  }

  return (
    <div className={`min-h-screen flex selection:bg-indigo-600 selection:text-white overflow-x-hidden transition-colors duration-300 ${
      isHighContrast ? 'bg-white text-zinc-800' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Fixed Left navigation panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewDocument={() => {
          setShowChooseTemplateModal(true);
        }}
        isHighContrast={isHighContrast}
        systemLogo={systemLogo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main viewport canvas with standardized top header */}
      <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${
        isSidebarOpen ? 'ml-[260px]' : 'ml-[72px]'
      } ${
        isHighContrast ? 'bg-white' : 'bg-zinc-950'
      }`}>
        <Header 
          currentTab={currentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAnalyze={handleTriggerAI}
          isAnalyzing={isAnalyzing}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isHighContrast={isHighContrast}
          onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
          systemLogo={systemLogo}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic active tab viewport with padding spacing */}
        <main className="p-8 flex-1 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Dynamic Slide-over / Modal for AI Audit Results! */}
      <AnimatePresence>
        {showAIResult && aiReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAIResult(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Header */}
              <div className={`p-5 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2 text-indigo-500">
                  <Sparkles size={16} className="animate-spin-slow" />
                  <h3 className={`text-xs font-bold tracking-wider uppercase ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Relatório de Conformidade IA</h3>
                </div>
                <button 
                  onClick={() => setShowAIResult(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Visual compliance score wheel representation */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800/80'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Pontuação de Conformidade</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Inspeção efetuada no {aiReport.entity}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold tracking-tight ${
                      aiReport.score >= 80 ? 'text-green-500' : aiReport.score >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {aiReport.score}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold">/ 100</span>
                  </div>
                </div>

                {/* Audit critiques listing with warning/success styling */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {aiReport.suggestions.map((sug: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                        sug.type === 'success' 
                          ? isHighContrast
                            ? 'bg-green-500/5 border-green-500/10 text-zinc-700'
                            : 'bg-green-500/5 border-green-500/20 text-zinc-300'
                          : sug.type === 'warning'
                          ? isHighContrast
                            ? 'bg-amber-500/5 border-amber-500/10 text-zinc-700'
                            : 'bg-amber-500/5 border-amber-500/20 text-zinc-300'
                          : isHighContrast
                          ? 'bg-red-500/5 border-red-500/10 text-zinc-700'
                          : 'bg-red-500/5 border-red-500/20 text-zinc-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {sug.type === 'success' ? (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        ) : sug.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h5 className={`font-bold ${isHighContrast ? 'text-zinc-900' : 'text-zinc-100'}`}>{sug.title}</h5>
                        <p className={`mt-1 leading-relaxed text-[11px] ${isHighContrast ? 'text-zinc-600' : 'text-zinc-400'}`}>{sug.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Fix and cancel action buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setShowAIResult(false)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Fechar Relatório
                  </button>
                  <button
                    onClick={handleApplyAIFixes}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Zap size={13} /> Corrigir com IA
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {showChooseTemplateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowChooseTemplateModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-5 border-b flex justify-between items-center shrink-0 ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2.5 text-indigo-500">
                  <BookOpen size={18} />
                  <div>
                    <h3 className={`text-sm font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Escolher Documento para Editar</h3>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Selecione um dos modelos da área Documentos para carregar no editor</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChooseTemplateModal(false)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Templates List container */}
              <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((tpl) => {
                    const IconComp = (() => {
                      switch (tpl.category?.toUpperCase()) {
                        case 'ATAS': return Users;
                        case 'CONVOCATÓRIAS':
                        case 'CONVOCATORIAS': return Send;
                        case 'COMERCIAL': return FileCode;
                        case 'QUÓRUM':
                        case 'QUORUM': return Clipboard;
                        default: return BookOpen;
                      }
                    })();

                    const colorClass = (() => {
                      switch (tpl.category?.toUpperCase()) {
                        case 'ATAS': return 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20';
                        case 'CONVOCATÓRIAS':
                        case 'CONVOCATORIAS': return 'bg-pink-600/10 text-pink-400 border-pink-500/20';
                        case 'COMERCIAL': return 'bg-amber-600/10 text-amber-400 border-amber-500/20';
                        case 'QUÓRUM':
                        case 'QUORUM': return 'bg-green-600/10 text-green-400 border-green-500/20';
                        default: return 'bg-blue-600/10 text-blue-400 border-blue-500/20';
                      }
                    })();

                    return (
                      <div 
                        key={tpl.id}
                        onClick={() => handleApplyTemplateAndEdit(tpl)}
                        className={`p-4 border hover:border-indigo-500 rounded-xl cursor-pointer group transition-all duration-300 flex flex-col justify-between shadow-sm h-40 ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg border ${colorClass}`}>
                              <IconComp size={15} />
                            </div>
                            <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-full ${
                              isHighContrast ? 'bg-zinc-200 border-zinc-300 text-zinc-600' : 'bg-zinc-900 border-zinc-800/80 text-zinc-400'
                            }`}>
                              {tpl.category}
                            </span>
                          </div>
                          <h4 className={`text-xs font-bold group-hover:text-indigo-500 transition-colors ${
                            isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                          }`}>
                            {tpl.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                            {tpl.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">
                          Editar este documento <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer with Blank choice */}
              <div className={`p-4 border-t flex flex-col sm:flex-row gap-3 items-center shrink-0 ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <button
                  onClick={() => {
                    setSelectedDocument(null);
                    setShowChooseTemplateModal(false);
                    setCurrentTab('editor');
                  }}
                  className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border border-dashed flex items-center justify-center gap-1.5 ${
                    isHighContrast 
                      ? 'border-zinc-300 hover:border-indigo-500 text-zinc-600 hover:text-indigo-600 bg-white' 
                      : 'border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-indigo-400 bg-zinc-900/40'
                  }`}
                >
                  <Plus size={14} /> Iniciar com Documento em Branco
                </button>
                <button
                  onClick={() => setShowChooseTemplateModal(false)}
                  className={`w-full sm:w-28 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
