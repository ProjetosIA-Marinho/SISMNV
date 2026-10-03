import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  fetchGoogleDoc, 
  parseGoogleDoc, 
  extractDocId, 
  initAuth, 
  logout 
} from '../lib/googleDocs';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  UploadCloud, 
  Eye, 
  Edit3, 
  Trash2, 
  Filter, 
  X,
  Check,
  CheckCircle,
  List,
  LayoutGrid,
  MoreVertical,
  CornerUpRight,
  Star
} from 'lucide-react';
import { Document, Tab } from '../types';

interface DocumentsProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocument: (doc: Document) => void;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  onSelectDocument: (doc: Document) => void;
  setCurrentTab: (tab: Tab) => void;
  searchQuery: string;
  isHighContrast: boolean;
  folders: string[];
  setFolders: React.Dispatch<React.SetStateAction<string[]>>;
  subfolders: Record<string, string[]>;
  setSubfolders: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

function RealDocumentCover({ doc, isHighContrast, isLarge = false }: { doc: Document; isHighContrast: boolean; isLarge?: boolean }) {
  const isAta = doc.name.toLowerCase().includes('ata') || (doc.tipoAssembleia && doc.tipoAssembleia.toLowerCase().includes('ata'));
  const isConvocacao = doc.name.toLowerCase().includes('convocação') || doc.name.toLowerCase().includes('convocacao');
  
  // Format order of the day into small lines
  const agendaItems = doc.ordemDoDia
    ? doc.ordemDoDia.split('\n').map(item => item.trim()).filter(Boolean).slice(0, isLarge ? 5 : 3)
    : ['a) Aprovação de atas anteriores', 'b) Eleição de novos cargos', 'c) Outros assuntos gerais'];

  return (
    <div className={`w-full h-full p-4 flex flex-col justify-between text-left select-none relative overflow-hidden transition-all duration-300 ${
      isHighContrast 
        ? 'bg-zinc-50 border-t border-zinc-200' 
        : 'bg-zinc-900 border-t border-zinc-800'
    }`}>
      {/* Subtle paper watermark texture background */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
        isHighContrast ? 'bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px]' : 'bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]'
      }`} />

      {/* Decorative vertical line representing an official book margin */}
      <div className={`absolute left-3.5 top-0 bottom-0 w-px border-l border-dashed ${
        isHighContrast ? 'border-zinc-300' : 'border-zinc-800'
      }`} />

      <div className={`${isLarge ? 'pl-6 space-y-4' : 'pl-3 space-y-2'} relative z-10`}>
        {/* Entity Header */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span className={`font-bold tracking-widest uppercase truncate ${
            isLarge ? 'text-[10px] max-w-[320px]' : 'text-[8px] max-w-[180px]'
          } ${
            isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            {doc.entity || 'ENTIDADE RECONHECIDA'}
          </span>
        </div>

        {/* Divider */}
        <div className={`h-[1px] w-full ${isHighContrast ? 'bg-zinc-200' : 'bg-zinc-800'}`} />

        {/* Document Title / Type */}
        <div className={isLarge ? 'space-y-1' : 'space-y-0.5'}>
          <span className={`font-extrabold text-indigo-500 uppercase tracking-widest block ${isLarge ? 'text-[9px]' : 'text-[7px]'}`}>
            {isConvocacao ? 'Convocatória Oficial' : isAta ? 'Ata de Reunião' : 'Documento / Ata'}
          </span>
          <h4 className={`font-black tracking-tight leading-snug uppercase ${
            isLarge ? 'text-[15px]' : 'text-[11px]'
          } ${
            isHighContrast ? 'text-zinc-900' : 'text-zinc-100'
          }`}>
            {doc.tipoAssembleia || 'Assembleia Geral Ordinária'}
          </h4>
        </div>

        {/* Address and details (large view only) */}
        {isLarge && (
          <div className="text-[9px] text-zinc-500 space-y-0.5">
            <p><strong>Local:</strong> {doc.address || 'Não informado'}</p>
            <p><strong>Primeira Convocação:</strong> {doc.convocacao1 || '18:00'} | <strong>Segunda Convocação:</strong> {doc.convocacao2 || '18:30'}</p>
          </div>
        )}

        {/* Mock Paragraph Lines + Agenda */}
        <div className={`${isLarge ? 'space-y-2 pt-2' : 'space-y-1 pt-1'}`}>
          <p className={`font-semibold uppercase tracking-wider ${isLarge ? 'text-[9px]' : 'text-[7px]'} text-indigo-400/80`}>Ordem do Dia:</p>
          {agendaItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1">
              <span className={`text-indigo-500 font-bold shrink-0 ${isLarge ? 'text-[10px] mt-0.5' : 'text-[7px] mt-0.5'}`}>▸</span>
              <p className={`font-medium leading-tight ${
                isLarge ? 'text-[10px] line-clamp-3' : 'text-[7px] line-clamp-1'
              } ${
                isHighContrast ? 'text-zinc-600' : 'text-zinc-400'
              }`}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area: Signatures and Date */}
      <div className={`${isLarge ? 'pl-6 pt-4' : 'pl-3 pt-2'} relative z-10 flex items-end justify-between`}>
        <div className="space-y-1">
          <p className={`font-semibold uppercase tracking-wider text-zinc-500 ${isLarge ? 'text-[8px]' : 'text-[6px]'}`}>Assinaturas</p>
          <div className="flex gap-2">
            {doc.signatures && doc.signatures.slice(0, 2).map((sig, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                <div className={`h-[1px] ${isLarge ? 'w-18' : 'w-12'} ${isHighContrast ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                <p className={`font-extrabold truncate ${
                  isLarge ? 'text-[8px] max-w-[90px]' : 'text-[6px] max-w-[60px]'
                } ${
                  isHighContrast ? 'text-zinc-700' : 'text-zinc-300'
                }`}>
                  {sig.name}
                </p>
                <p className="text-[5px] text-zinc-500 scale-90 origin-left truncate max-w-[60px]">{sig.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date stamp representation */}
        <div className={`rounded border font-bold font-mono tracking-wider shrink-0 ${
          isLarge ? 'px-2 py-1 text-[8px]' : 'px-1.5 py-0.5 text-[6px]'
        } ${
          isHighContrast 
            ? 'bg-zinc-100 border-zinc-200 text-zinc-600' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
        }`}>
          {doc.date}
        </div>
      </div>
    </div>
  );
}

export default function Documents({
  documents,
  onAddDocument,
  onDeleteDocument,
  onUpdateDocument,
  setDocuments,
  onSelectDocument,
  setCurrentTab,
  searchQuery,
  isHighContrast,
  folders,
  setFolders,
  subfolders,
  setSubfolders
}: DocumentsProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedDocPreview, setSelectedDocPreview] = useState<Document | null>(null);

  // Folder and Subfolder Context Menu and Modal States
  const [activeFolderMenu, setActiveFolderMenu] = useState<string | null>(null);
  const [activeSubfolderMenu, setActiveSubfolderMenu] = useState<string | null>(null);

  const [showRenameFolderModal, setShowRenameFolderModal] = useState<boolean>(false);
  const [folderToRename, setFolderToRename] = useState<string>('');
  const [renameFolderNewName, setRenameFolderNewName] = useState<string>('');

  const [showRenameSubfolderModal, setShowRenameSubfolderModal] = useState<boolean>(false);
  const [subfolderToRename, setSubfolderToRename] = useState<string>('');
  const [renameSubfolderNewName, setRenameSubfolderNewName] = useState<string>('');

  const [showTransferFolderModal, setShowTransferFolderModal] = useState<boolean>(false);
  const [folderToTransfer, setFolderToTransfer] = useState<string>('');
  const [transferDestinationFolder, setTransferDestinationFolder] = useState<string>('');

  // Drag and drop styles indicators
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverSubfolder, setDragOverSubfolder] = useState<string | null>(null);

  // State for creating new folder
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // State for creating new subfolder
  const [showNewSubfolderModal, setShowNewSubfolderModal] = useState<boolean>(false);
  const [newSubfolderName, setNewSubfolderName] = useState<string>('');
  
  // State for creating new document modal
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocFolder, setNewDocFolder] = useState<string>('ORDINÁRIA');
  const [newDocSubfolder, setNewDocSubfolder] = useState<string>('');
  const [newDocType, setNewDocType] = useState<'pdf' | 'doc' | 'docx'>('docx');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: 'pdf' | 'doc' | 'docx' } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [newDocEntity, setNewDocEntity] = useState<string>('');
  const [newDocAddress, setNewDocAddress] = useState<string>('');
  const [newDocOrdem, setNewDocOrdem] = useState<string>('');

  // Dropdown states for filters (represented visually/interactively)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Todos');
  const [showTypeFilter, setShowTypeFilter] = useState<boolean>(false);

  // Favorites filter state
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Document right-click context menu states
  const [contextMenuDoc, setContextMenuDoc] = useState<{ id: string; x: number; y: number } | null>(null);

  // Document action modals states
  const [showRenameDocModal, setShowRenameDocModal] = useState<boolean>(false);
  const [docToRename, setDocToRename] = useState<Document | null>(null);
  const [renameDocNewName, setRenameDocNewName] = useState<string>('');

  const [showMoveDocModal, setShowMoveDocModal] = useState<boolean>(false);
  const [docToMove, setDocToMove] = useState<Document | null>(null);
  const [moveDocDestination, setMoveDocDestination] = useState<string>( '');

  // Google Docs Import states
  const [showGoogleDocsModal, setShowGoogleDocsModal] = useState<boolean>(false);
  const [googleDocUrl, setGoogleDocUrl] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setGoogleAuthError(null);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
      }
    } catch (err: any) {
      setGoogleAuthError(err.message || 'Erro ao realizar login.');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleImportGoogleDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleDocUrl.trim()) {
      alert('Por favor, informe a URL ou o ID do documento Google Docs.');
      return;
    }
    if (!googleToken) {
      alert('Você precisa estar autenticado com o Google para importar.');
      return;
    }

    setIsImporting(true);
    setGoogleAuthError(null);

    try {
      const docId = extractDocId(googleDocUrl);
      const rawDoc = await fetchGoogleDoc(docId, googleToken);
      const parsed = parseGoogleDoc(rawDoc);

      const images = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmMB4oZWBRTSJo4Msm6G03SR07_RMsmK1sI7sDDGHer2vQUj71eDayxnXww1H-nQWQfRgJT5Tf3PtDUEeS3gOn6CGmSM0zXH1t611XqFJZ_ZgzDu6P-UWBBo3LuiArdcfTGs5btyLXXXXOSs_4vHH9_NpMYh9tC6THKkvI5pkYV7EEaL1ZGu61XvXuT_vJl1pyWo7EYdvx9yNZc1W4AuROdDyzY1ZlrGNT2lvPOurDtQcgx3p56FiI5A',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDrsCc1qJPMsSsPd5TMwMO_6Mh8RIwizuPIstBj5U0dfuh06udiKstFKzuemcGeH8pdAw41lHv_hDYMYp5Mgqt7ixVVxojd_ZuasFvjaz76lWGE-8ztGzVHDikIbEG-OYJRh6HqsQ936hGvMr-qFsJtAonpsBBu-LVt29DoOu2_nAiu5js398uRoV04biNp-kBWVPTkA_nW0MWJdWa7eyqxSCSSYhjP11lDXzT77auKrOs2SLNcyrIq3A',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDLJARLaNLyVB72dyzoWkJ_FrbMMgATpjIYk7tGZaQFj330vutVLbUHGYdDmBW3688UnluZVvTdctHggLJejIbO6wgvhlgJ0R-EWHwAsIaRzpwQqQBbeniu6BKyQYmx3brLkEUw0KN1JyXqgJxn9BMOEKUMwwrvE2f1v8RIIJxxkC5RkxPt8BTbfxhSd3aLXAx-YpjqE59WDqhEAICb6QDPkSps6-J60OzRQXdtq3TK7lAyohyDNIWW4A'
      ];
      const randomImg = images[Math.floor(Math.random() * images.length)];

      const finalFolder = selectedFolder === 'ALL' ? 'GERAL' : selectedFolder;

      const importedDoc: Document = {
        id: `doc-gdocs-${Date.now()}`,
        name: parsed.title,
        type: 'docx',
        folder: finalFolder,
        size: `${Math.ceil(parsed.fullText.length / 1024) || 5} KB`,
        creator: googleUser?.displayName || 'Google Importer',
        date: parsed.date || new Date().toISOString().split('T')[0],
        imagePreview: randomImg,
        entity: parsed.entity || parsed.title.toUpperCase(),
        address: parsed.address || 'Endereço Importado do Google Docs',
        localidade: parsed.localidade || 'São Paulo',
        convocacao1: '18:00',
        convocacao2: '18:30',
        tipoAssembleia: parsed.tipoAssembleia || 'Geral Ordinária',
        ordemDoDia: parsed.ordemDoDia || parsed.fullText,
        signatures: [
          { name: googleUser?.displayName || 'Presidente Google', role: 'Presidente' }
        ]
      };

      onAddDocument(importedDoc);
      setShowGoogleDocsModal(false);
      setGoogleDocUrl('');
      handleOpenInEditor(importedDoc);
    } catch (err: any) {
      console.error('Import error:', err);
      setGoogleAuthError(err.message || 'Erro ao importar documento do Google Docs. Verifique as permissões de compartilhamento ou tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  // Filter documents based on: Search Query, Folder Category, Type Filter
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.entity && doc.entity.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const parts = doc.folder.split('/');
    const docParent = parts[0] || '';
    const docSub = parts[1] || '';

    const matchesFolder = selectedFolder === 'ALL' || docParent.toUpperCase() === selectedFolder.toUpperCase();
    const matchesSubfolder = selectedSubfolder === null || docSub.toUpperCase() === selectedSubfolder.toUpperCase();
    const matchesType = selectedTypeFilter === 'Todos' || doc.type === selectedTypeFilter.toLowerCase();
    const matchesFavorite = !showOnlyFavorites || !!doc.isFavorite;
    
    return matchesSearch && matchesFolder && matchesSubfolder && matchesType && matchesFavorite;
  });

  // Sort documents by name
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortAsc) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const handleFileChange = (file: File) => {
    const name = file.name;
    const extension = name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf' || extension === 'docx' || extension === 'doc') {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
        
      setUploadedFile({
        name: name,
        size: sizeStr,
        type: extension as 'pdf' | 'doc' | 'docx'
      });
      
      const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;
      setNewDocName(nameWithoutExt);
      setNewDocType(extension as any);
    } else {
      alert('Apenas arquivos nos formatos PDF, DOCX ou DOC são aceitos.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      alert('Por favor, informe o nome do documento.');
      return;
    }
    if (!uploadedFile) {
      alert('Por favor, selecione ou arraste um arquivo para fazer o upload.');
      return;
    }

    // Assigning a realistic mock template image
    const images = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmMB4oZWBRTSJo4Msm6G03SR07_RMsmK1sI7sDDGHer2vQUj71eDayxnXww1H-nQWQfRgJT5Tf3PtDUEeS3gOn6CGmSM0zXH1t611XqFJZ_ZgzDu6P-UWBBo3LuiArdcfTGs5btyLXXXXOSs_4vHH9_NpMYh9tC6THKkvI5pkYV7EEaL1ZGu61XvXuT_vJl1pyWo7EYdvx9yNZc1W4AuROdDyzY1ZlrGNT2lvPOurDtQcgx3p56FiI5A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrsCc1qJPMsSsPd5TMwMO_6Mh8RIwizuPIstBj5U0dfuh06udiKstFKzuemcGeH8pdAw41lHv_hDYMYp5Mgqt7ixVVxojd_ZuasFvjaz76lWGE-8ztGzVHDikIbEG-OYJRh6HqsQ936hGvMr-qFsJtAonpsBBu-LVt29DoOu2_nAiu5js398uRoV04biNp-kBWVPTkA_nW0MWJdWa7eyqxSCSSYhjP11lDXzT77auKrOs2SLNcyrIq3A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLJARLaNLyVB72dyzoWkJ_FrbMMgATpjIYk7tGZaQFj330vutVLbUHGYdDmBW3688UnluZVvTdctHggLJejIbO6wgvhlgJ0R-EWHwAsIaRzpwQqQBbeniu6BKyQYmx3brLkEUw0KN1JyXqgJxn9BMOEKUMwwrvE2f1v8RIIJxxkC5RkxPt8BTbfxhSd3aLXAx-YpjqE59WDqhEAICb6QDPkSps6-J60OzRQXdtq3TK7lAyohyDNIWW4A'
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];

    const finalFolder = newDocSubfolder ? `${newDocFolder}/${newDocSubfolder}` : newDocFolder;

    const createdDoc: Document = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith(`.${newDocType}`) ? newDocName : `${newDocName}.${newDocType}`,
      type: newDocType,
      folder: finalFolder,
      size: uploadedFile ? uploadedFile.size : '124 KB',
      creator: 'Admin User',
      date: new Date().toISOString().split('T')[0],
      imagePreview: randomImg,
      entity: newDocEntity || 'NOME DA ENTIDADE',
      address: newDocAddress || 'Endereço da Entidade Representativa',
      localidade: 'São Paulo',
      convocacao1: '18:00',
      convocacao2: '18:30',
      tipoAssembleia: 'Geral Ordinária',
      ordemDoDia: newDocOrdem || 'a) Discussão e aprovação de atas\nb) Eleição de novos cargos e diretores',
      signatures: [
        { name: 'Admin User', role: 'Administrador' }
      ]
    };

    onAddDocument(createdDoc);
    
    // Dynamically ensure the folders list contains this folder
    const folderUpper = newDocFolder.toUpperCase();
    if (!folders.includes(folderUpper)) {
      setFolders([...folders, folderUpper]);
    }

    // Reset and close
    setNewDocName('');
    setNewDocEntity('');
    setNewDocAddress('');
    setNewDocOrdem('');
    setUploadedFile(null);
    setShowUploadModal(false);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFolder = newFolderName.trim().toUpperCase();
    if (!cleanFolder) {
      alert('Por favor, informe o nome da pasta.');
      return;
    }
    if (folders.includes(cleanFolder)) {
      alert('Esta pasta já existe!');
      return;
    }
    setFolders([...folders, cleanFolder]);
    setSelectedFolder(cleanFolder);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleCreateSubfolder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = newSubfolderName.trim();
    if (!cleanSub) {
      alert('Por favor, informe o nome da subpasta.');
      return;
    }
    
    const parent = selectedFolder;
    if (parent === 'ALL') {
      alert('Por favor, selecione uma pasta principal primeiro.');
      return;
    }

    const currentSubs = subfolders[parent] || [];
    if (currentSubs.map(s => s.toLowerCase()).includes(cleanSub.toLowerCase())) {
      alert('Esta subpasta já existe!');
      return;
    }

    setSubfolders({
      ...subfolders,
      [parent]: [...currentSubs, cleanSub]
    });
    setSelectedSubfolder(cleanSub);
    setNewSubfolderName('');
    setShowNewSubfolderModal(false);
  };

  // 1. Rename folder action handler
  const handleRenameFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oldName = folderToRename;
    const newName = renameFolderNewName.trim().toUpperCase();
    if (!newName || oldName === newName) return;

    if (folders.includes(newName)) {
      alert('Já existe uma pasta com esse nome!');
      return;
    }

    // Update folders list
    setFolders(prev => prev.map(f => f.toUpperCase() === oldName.toUpperCase() ? newName : f));

    // Update subfolders map
    setSubfolders(prev => {
      const updated = { ...prev };
      if (updated[oldName]) {
        updated[newName] = updated[oldName];
        delete updated[oldName];
      }
      return updated;
    });

    // Update all documents in this folder or its subfolders
    setDocuments(prevDocs => prevDocs.map(doc => {
      const parts = doc.folder.split('/');
      if (parts[0].toUpperCase() === oldName.toUpperCase()) {
        parts[0] = newName;
        return {
          ...doc,
          folder: parts.join('/')
        };
      }
      return doc;
    }));

    if (selectedFolder.toUpperCase() === oldName.toUpperCase()) {
      setSelectedFolder(newName);
    }

    setShowRenameFolderModal(false);
    setFolderToRename('');
    setRenameFolderNewName('');
    setActiveFolderMenu(null);
  };

  // 2. Delete folder action handler
  const handleDeleteFolder = (folderName: string) => {
    if (!confirm(`Deseja realmente excluir a pasta "${folderName}"? Todos os documentos nela serão movidos para a pasta principal "GERAL".`)) {
      return;
    }

    // Remove from folders list
    setFolders(prev => prev.filter(f => f.toUpperCase() !== folderName.toUpperCase()));

    // Remove from subfolders map
    setSubfolders(prev => {
      const updated = { ...prev };
      delete updated[folderName];
      return updated;
    });

    // Update documents to GERAL
    setDocuments(prevDocs => prevDocs.map(doc => {
      const parts = doc.folder.split('/');
      if (parts[0].toUpperCase() === folderName.toUpperCase()) {
        return {
          ...doc,
          folder: 'GERAL'
        };
      }
      return doc;
    }));

    if (selectedFolder.toUpperCase() === folderName.toUpperCase()) {
      setSelectedFolder('ALL');
      setSelectedSubfolder(null);
    }

    setActiveFolderMenu(null);
  };

  // 3. Rename subfolder action handler
  const handleRenameSubfolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oldSubName = subfolderToRename;
    const newSubName = renameSubfolderNewName.trim();
    if (!newSubName || oldSubName === newSubName) return;

    const parent = selectedFolder;
    const currentSubs = subfolders[parent] || [];
    if (currentSubs.map(s => s.toLowerCase()).includes(newSubName.toLowerCase())) {
      alert('Já existe uma subpasta com esse nome nesta pasta!');
      return;
    }

    setSubfolders(prev => {
      const updated = { ...prev };
      if (updated[parent]) {
        updated[parent] = updated[parent].map(s => s === oldSubName ? newSubName : s);
      }
      return updated;
    });

    setDocuments(prevDocs => prevDocs.map(doc => {
      const targetPath = `${parent}/${oldSubName}`.toUpperCase();
      if (doc.folder.toUpperCase() === targetPath) {
        return {
          ...doc,
          folder: `${parent}/${newSubName}`
        };
      }
      return doc;
    }));

    if (selectedSubfolder === oldSubName) {
      setSelectedSubfolder(newSubName);
    }

    setShowRenameSubfolderModal(false);
    setSubfolderToRename('');
    setRenameSubfolderNewName('');
    setActiveSubfolderMenu(null);
  };

  // 4. Delete subfolder action handler
  const handleDeleteSubfolder = (subfolderName: string) => {
    if (!confirm(`Deseja realmente excluir a subpasta "${subfolderName}"? Os documentos nela serão movidos para a raiz da pasta "${selectedFolder}".`)) {
      return;
    }

    setSubfolders(prev => {
      const updated = { ...prev };
      if (updated[selectedFolder]) {
        updated[selectedFolder] = updated[selectedFolder].filter(s => s !== subfolderName);
      }
      return updated;
    });

    setDocuments(prevDocs => prevDocs.map(doc => {
      const targetPath = `${selectedFolder}/${subfolderName}`.toUpperCase();
      if (doc.folder.toUpperCase() === targetPath) {
        return {
          ...doc,
          folder: selectedFolder
        };
      }
      return doc;
    }));

    if (selectedSubfolder === subfolderName) {
      setSelectedSubfolder(null);
    }

    setActiveSubfolderMenu(null);
  };

  // 5. Transfer folder handler (nest folder into another as a subfolder)
  const handleTransferFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const srcFolder = folderToTransfer;
    const destFolder = transferDestinationFolder;
    if (!srcFolder || !destFolder || srcFolder === destFolder) return;

    setSubfolders(prev => {
      const updated = { ...prev };
      const existingSubfolders = updated[destFolder] || [];
      if (!existingSubfolders.includes(srcFolder)) {
        updated[destFolder] = [...existingSubfolders, srcFolder];
      }
      return updated;
    });

    setDocuments(prevDocs => prevDocs.map(doc => {
      const parts = doc.folder.split('/');
      if (parts[0].toUpperCase() === srcFolder.toUpperCase()) {
        const remaining = parts.slice(1);
        return {
          ...doc,
          folder: [destFolder, srcFolder, ...remaining].join('/')
        };
      }
      return doc;
    }));

    setFolders(prev => prev.filter(f => f.toUpperCase() !== srcFolder.toUpperCase()));

    if (selectedFolder.toUpperCase() === srcFolder.toUpperCase()) {
      setSelectedFolder(destFolder);
      setSelectedSubfolder(srcFolder);
    }

    setShowTransferFolderModal(false);
    setFolderToTransfer('');
    setTransferDestinationFolder('');
    setActiveFolderMenu(null);
  };

  // Document level helpers: toggle favorite, rename, move
  const handleToggleFavorite = (doc: Document) => {
    const updated = { ...doc, isFavorite: !doc.isFavorite };
    onUpdateDocument(updated);
  };

  const handleRenameDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToRename || !renameDocNewName.trim()) return;

    const oldExt = docToRename.name.split('.').pop();
    let newName = renameDocNewName.trim();
    if (oldExt && !newName.toLowerCase().endsWith(`.${oldExt.toLowerCase()}`)) {
      newName = `${newName}.${oldExt}`;
    }

    const updated = {
      ...docToRename,
      name: newName
    };

    onUpdateDocument(updated);
    setShowRenameDocModal(false);
    setDocToRename(null);
    setRenameDocNewName('');
  };

  const handleMoveDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToMove || !moveDocDestination) return;

    const updated = {
      ...docToMove,
      folder: moveDocDestination
    };

    onUpdateDocument(updated);
    setShowMoveDocModal(false);
    setDocToMove(null);
    setMoveDocDestination('');
  };

  const handleOpenInEditor = (doc: Document) => {
    onSelectDocument(doc);
    setSelectedDocPreview(null);
    setCurrentTab('editor');
  };

  const typesList = ['Todos', 'DOCX', 'PDF', 'DOC'];

  // Conditional High-contrast classes
  const textMutedClass = 'text-zinc-500 font-bold';
  const textTitleClass = isHighContrast ? 'text-zinc-800' : 'text-zinc-200';
  const textSubClass = isHighContrast ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto w-full font-sans"
    >
      {/* Folder Categories Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pastas / Categorias</h2>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl transition-all border border-indigo-500/20 uppercase tracking-wider cursor-pointer"
            >
              <Folder size={12} />
              + Nova Pasta
            </button>
            <button 
              type="button"
              onClick={() => {
                setNewDocFolder(selectedFolder === 'ALL' ? 'ORDINÁRIA' : selectedFolder);
                setShowUploadModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl transition-all border border-emerald-500/20 uppercase tracking-wider cursor-pointer"
            >
              <UploadCloud size={12} />
              Fazer Upload
            </button>
            <button 
              type="button"
              onClick={() => setShowGoogleDocsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl transition-all border border-blue-500/20 uppercase tracking-wider cursor-pointer"
            >
              <svg className="w-3 h-3 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                <path d="M10 9H8"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
              </svg>
              <span>Importar GDocs</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* ALL FOLDERS */}
          <div 
            onClick={() => { setSelectedFolder('ALL'); setSelectedSubfolder(null); }}
            className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
              selectedFolder === 'ALL'
                ? 'bg-indigo-600/10 border-indigo-500/80'
                : isHighContrast
                  ? 'bg-white border-zinc-200 hover:bg-zinc-50'
                  : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                selectedFolder === 'ALL' ? 'bg-indigo-600 text-white' : isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Folder size={18} />
              </div>
              <span className={`font-bold text-xs tracking-wide ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>TODOS OS DOCUMENTOS</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {documents.length}
            </span>
          </div>

          {/* DYNAMIC FOLDERS */}
          {folders.map((folderName) => {
            const isSelected = selectedFolder.toUpperCase() === folderName.toUpperCase();
            const isDragOver = dragOverFolder === folderName;
            
            // Count documents in this folder (either exact parent or subfolders of it)
            const docCount = documents.filter(d => {
              const parts = d.folder.toUpperCase().split('/');
              return parts[0] === folderName.toUpperCase();
            }).length;

            return (
              <div 
                key={folderName}
                onClick={() => { setSelectedFolder(folderName); setSelectedSubfolder(null); }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-folder', folderName);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.types.includes('application/x-folder') || e.dataTransfer.types.includes('application/x-document')) {
                    setDragOverFolder(folderName);
                  }
                }}
                onDragLeave={() => {
                  setDragOverFolder(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverFolder(null);

                  const draggedFolder = e.dataTransfer.getData('application/x-folder');
                  const draggedDocId = e.dataTransfer.getData('application/x-document');

                  if (draggedFolder) {
                    if (draggedFolder.toUpperCase() !== folderName.toUpperCase()) {
                      // Move draggedFolder to be a subfolder of folderName
                      setSubfolders(prev => {
                        const updated = { ...prev };
                        const existing = updated[folderName] || [];
                        if (!existing.includes(draggedFolder)) {
                          updated[folderName] = [...existing, draggedFolder];
                        }
                        return updated;
                      });

                      // Update documents
                      setDocuments(prevDocs => prevDocs.map(doc => {
                        const parts = doc.folder.split('/');
                        if (parts[0].toUpperCase() === draggedFolder.toUpperCase()) {
                          const remaining = parts.slice(1);
                          return {
                            ...doc,
                            folder: [folderName, draggedFolder, ...remaining].join('/')
                          };
                        }
                        return doc;
                      }));

                      // Remove from top-level list
                      setFolders(prev => prev.filter(f => f.toUpperCase() !== draggedFolder.toUpperCase()));

                      // Select target
                      setSelectedFolder(folderName);
                      setSelectedSubfolder(draggedFolder);
                    }
                  } else if (draggedDocId) {
                    // Dragged document to folder
                    setDocuments(prevDocs => prevDocs.map(doc => {
                      if (doc.id === draggedDocId) {
                        return {
                          ...doc,
                          folder: folderName
                        };
                      }
                      return doc;
                    }));
                  }
                }}
                className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all group/folder relative ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500/80'
                    : isHighContrast
                      ? 'bg-white border-zinc-200 hover:bg-zinc-50'
                      : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900'
                } ${isDragOver ? 'border-dashed border-indigo-500 scale-102 bg-indigo-500/10' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${
                    isSelected ? 'bg-indigo-600 text-white' : isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <Folder size={18} />
                  </div>
                  <span className={`font-bold text-xs tracking-wide uppercase truncate max-w-[110px] ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    {folderName}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0 relative">
                  {/* Quick Upload button to this specific folder */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewDocFolder(folderName);
                      setShowUploadModal(true);
                    }}
                    title={`Fazer upload para ${folderName}`}
                    className="opacity-0 group-hover/folder:opacity-100 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md"
                  >
                    <UploadCloud size={11} />
                  </button>

                  {/* Actions Dropdown Button (vertical three-dots conforming with the uploaded design image) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFolderMenu(activeFolderMenu === folderName ? null : folderName);
                      }}
                      className={`p-1.5 rounded-lg transition-all hover:bg-zinc-500/10 ${
                        isHighContrast ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-white'
                      }`}
                      title="Mais ações"
                    >
                      <MoreVertical size={13} />
                    </button>

                    {/* Dropdown Menu Portal */}
                    {activeFolderMenu === folderName && (
                      <div 
                        className={`absolute right-0 mt-1 w-36 border rounded-xl shadow-xl py-1 z-50 text-left ${
                          isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToTransfer(folderName);
                            setTransferDestinationFolder('');
                            setShowTransferFolderModal(true);
                            setActiveFolderMenu(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-indigo-500/5 hover:text-indigo-500 flex items-center gap-2 transition-colors"
                        >
                          <CornerUpRight size={12} />
                          <span>Transferir</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToRename(folderName);
                            setRenameFolderNewName(folderName);
                            setShowRenameFolderModal(true);
                            setActiveFolderMenu(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-indigo-500/5 hover:text-indigo-500 flex items-center gap-2 transition-colors"
                        >
                          <Edit3 size={12} />
                          <span>Mudar o nome</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folderName);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-red-500/5 hover:text-red-500 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isHighContrast ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {docCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subfolder list - only visible when a specific parent folder is selected */}
        {selectedFolder !== 'ALL' && (
          <div className={`mt-5 p-4 rounded-2xl border ${
            isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/20 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="text-indigo-500 w-4 h-4" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  Subpastas de {selectedFolder}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSubfolderModal(true)}
                className="px-2.5 py-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg border border-indigo-500/20 uppercase tracking-wider cursor-pointer transition-all"
              >
                + Nova Subpasta
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* "Todas" subfolders option */}
              <button
                onClick={() => setSelectedSubfolder(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                  selectedSubfolder === null
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isHighContrast
                      ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                Todas as Subpastas
              </button>

              {/* List of custom subfolders */}
              {(subfolders[selectedFolder] || []).map((sub) => {
                const isSubSelected = selectedSubfolder === sub;
                const isDragOver = dragOverSubfolder === sub;
                // Count documents in this specific subfolder
                const subDocCount = documents.filter(d => d.folder.toUpperCase() === `${selectedFolder}/${sub}`.toUpperCase()).length;
                return (
                  <div
                    key={sub}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.types.includes('application/x-document')) {
                        setDragOverSubfolder(sub);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverSubfolder(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverSubfolder(null);
                      const draggedDocId = e.dataTransfer.getData('application/x-document');
                      if (draggedDocId) {
                        setDocuments(prevDocs => prevDocs.map(doc => {
                          if (doc.id === draggedDocId) {
                            return {
                              ...doc,
                              folder: `${selectedFolder}/${sub}`
                            };
                          }
                          return doc;
                        }));
                      }
                    }}
                    className={`rounded-xl text-xs font-semibold cursor-pointer transition-all border flex items-center gap-1.5 p-1 pl-3 ${
                      isSubSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isHighContrast
                          ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    } ${isDragOver ? 'border-dashed border-indigo-500 bg-indigo-500/10 scale-102' : ''}`}
                  >
                    <span onClick={() => setSelectedSubfolder(sub)} className="py-1">{sub}</span>
                    
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSubSelected ? 'bg-indigo-700 text-indigo-200' : isHighContrast ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {subDocCount}
                    </span>

                    {/* Subfolder 3-dots Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubfolderMenu(activeSubfolderMenu === sub ? null : sub);
                        }}
                        className={`p-1 rounded hover:bg-black/10 transition-colors ${
                          isSubSelected ? 'text-indigo-200 hover:text-white' : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                        title="Opções da subpasta"
                      >
                        <MoreVertical size={11} />
                      </button>

                      {activeSubfolderMenu === sub && (
                        <div 
                          className={`absolute left-0 mt-1 w-32 border rounded-xl shadow-xl py-1 z-50 text-left ${
                            isHighContrast ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubfolderToRename(sub);
                              setRenameSubfolderNewName(sub);
                              setShowRenameSubfolderModal(true);
                              setActiveSubfolderMenu(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-indigo-500/5 hover:text-indigo-500 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 size={11} />
                            <span>Mudar o nome</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubfolder(sub);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-red-500/5 hover:text-red-500 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={11} />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* If empty */}
              {(!subfolders[selectedFolder] || subfolders[selectedFolder].length === 0) && (
                <p className="text-[11px] text-zinc-500 italic py-1 pl-1">Esta pasta ainda não possui subpastas.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Options and Sorting Bar */}
      <div className={`flex flex-wrap gap-3 items-center justify-between border-t border-b py-4 ${
        isHighContrast ? 'border-zinc-200' : 'border-zinc-800/80'
      }`}>
        <div className="flex flex-wrap gap-2 items-center relative">
          <span className="text-zinc-500 text-xs font-semibold mr-1 flex items-center gap-1">
            <Filter size={12} /> Filtrar:
          </span>
          {/* Type Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className={`px-3.5 py-1.5 border rounded-xl text-xs flex items-center gap-1 transition-all ${
                isHighContrast 
                  ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-indigo-500/50'
              }`}
            >
              Tipo: <span className="text-indigo-500 font-bold">{selectedTypeFilter}</span>
            </button>
            {showTypeFilter && (
              <div className={`absolute left-0 mt-2 w-32 border rounded-xl shadow-xl py-1 z-30 ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                {typesList.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTypeFilter(t);
                      setShowTypeFilter(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      selectedTypeFilter === t 
                        ? 'text-indigo-600 bg-indigo-500/5 font-bold' 
                        : isHighContrast 
                          ? 'text-zinc-700 hover:bg-zinc-50' 
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites Filter Toggle */}
          <button 
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3.5 py-1.5 border rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              showOnlyFavorites 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold' 
                : isHighContrast 
                  ? 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            <Star size={13} className={showOnlyFavorites ? 'fill-amber-500 text-amber-500' : ''} />
            <span>Favoritos</span>
          </button>

          <button className={`px-3.5 py-1.5 border rounded-xl text-xs transition-colors ${
            isHighContrast ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
          }`}>
            Pessoas
          </button>
          <button className={`px-3.5 py-1.5 border rounded-xl text-xs transition-colors ${
            isHighContrast ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
          }`}>
            Modificado
          </button>
        </div>

        {/* Sorting and View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => setSortAsc(!sortAsc)}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/15 cursor-pointer"
          >
            Nome {sortAsc ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          </button>

          {/* Segmented layout switcher conforming to the provided image */}
          <div className={`flex items-center rounded-full p-0.5 border h-8 overflow-hidden ${
            isHighContrast ? 'border-zinc-200 bg-zinc-100' : 'border-zinc-800 bg-zinc-950'
          }`}>
            {/* List button [✓ ☰] */}
            <button 
              onClick={() => setViewMode('list')}
              title="Visualizar em Lista"
              className={`h-full rounded-full px-3 flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isHighContrast 
                    ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Check size={11} className={`transition-all duration-200 ${viewMode === 'list' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
              <List size={13} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              title="Visualizar em Grade"
              className={`h-full rounded-full px-3 flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isHighContrast 
                    ? 'bg-transparent text-zinc-500 hover:text-zinc-800' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Check size={11} className={`transition-all duration-200 ${viewMode === 'grid' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'}`} />
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid Section */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Documentos Recentes</h2>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Interactive Document Cards */}
            {sortedDocs.map((doc) => (
              <div 
                key={doc.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-document', doc.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuDoc({
                    id: doc.id,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                className={`flex flex-col border hover:border-indigo-500 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-sm relative ${
                  isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                {/* Card Header information */}
                <div className={`p-4 flex items-center justify-between border-b ${
                  isHighContrast ? 'border-zinc-100 bg-zinc-50' : 'border-b border-zinc-800/80 bg-zinc-900/30'
                }`}>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${
                        isHighContrast ? 'text-zinc-800' : 'text-zinc-200'
                      }`}>
                        {doc.name}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-medium">Criado por {doc.creator}</p>
                    </div>
                  </div>

                  {/* Dropdown controls */}
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(doc);
                      }}
                      title={doc.isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
                      className={`p-1 rounded transition-all cursor-pointer ${
                        doc.isFavorite 
                          ? 'text-amber-500 hover:scale-110' 
                          : isHighContrast 
                            ? 'text-zinc-300 hover:text-amber-500 hover:bg-zinc-100' 
                            : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Star size={13} className={doc.isFavorite ? 'fill-amber-500' : ''} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Tem certeza que deseja excluir o documento: ${doc.name}?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      title="Excluir"
                      className={`p-1 rounded transition-all ${
                        isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-600 hover:text-red-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDocPreview(doc);
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

                {/* Document Mock/Image Preview Area */}
                <div 
                  onClick={() => setSelectedDocPreview(doc)}
                  className={`aspect-[4/3] overflow-hidden relative ${isHighContrast ? 'bg-zinc-50' : 'bg-zinc-900/50'}`}
                >
                  <RealDocumentCover doc={doc} isHighContrast={isHighContrast} />
                  {/* Hover overlay indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <span className="px-3 py-1.5 bg-zinc-900/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-600 transition-colors">
                      <Eye size={12} /> Preview
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInEditor(doc);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500 transition-colors"
                    >
                      <Edit3 size={12} /> Editar
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Upload / Create New Document bento card */}
            <div 
              onClick={() => setShowUploadModal(true)}
              className={`flex flex-col border-2 border-dashed rounded-2xl items-center justify-center p-6 min-h-[220px] cursor-pointer group transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white border-zinc-300 hover:border-indigo-500 hover:bg-zinc-50/50 shadow-sm' 
                  : 'bg-zinc-950/40 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900/20'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={20} className="text-indigo-500" />
              </div>
              <span className={`text-xs font-bold transition-colors ${
                isHighContrast ? 'text-zinc-700 group-hover:text-indigo-600' : 'text-zinc-400 group-hover:text-indigo-400'
              }`}>
                Fazer Upload de Documento
              </span>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-xs text-center font-medium leading-relaxed">
                Envie arquivos PDF, DOCX ou DOC das suas atas, relatórios ou formulários diretamente para o sistema.
              </p>
            </div>

            {/* Google Docs Import bento card */}
            <div 
              onClick={() => setShowGoogleDocsModal(true)}
              className={`flex flex-col border-2 border-dashed rounded-2xl items-center justify-center p-6 min-h-[220px] cursor-pointer group transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white border-zinc-300 hover:border-blue-500 hover:bg-zinc-50/50 shadow-sm' 
                  : 'bg-zinc-950/40 border-zinc-800 hover:border-blue-500 hover:bg-zinc-900/20'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  <path d="M10 9H8"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                </svg>
              </div>
              <span className={`text-xs font-bold transition-colors ${
                isHighContrast ? 'text-zinc-700 group-hover:text-blue-600' : 'text-zinc-400 group-hover:text-blue-400'
              }`}>
                Importar do Google Docs
              </span>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-xs text-center font-medium leading-relaxed">
                Cole a URL de um documento compartilhado ou público do Google Docs para importá-lo diretamente como ata.
              </p>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {sortedDocs.map((doc) => (
              <div 
                key={doc.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-document', doc.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuDoc({
                    id: doc.id,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer group transition-all duration-300 shadow-sm ${
                  isHighContrast 
                    ? 'bg-white border-zinc-200 hover:border-indigo-500 hover:bg-zinc-50' 
                    : 'bg-zinc-950/40 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900/10'
                }`}
                onClick={() => setSelectedDocPreview(doc)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        {doc.name}
                      </p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        doc.folder === 'ORDINÁRIA' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {doc.folder}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-medium">
                      <span>Criador: <strong className={isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}>{doc.creator}</strong></span>
                      <span>•</span>
                      <span>Data: <strong className={isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}>{doc.date}</strong></span>
                      <span>•</span>
                      <span>Tamanho: <strong className={isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}>{doc.size}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(doc);
                    }}
                    title={doc.isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      doc.isFavorite 
                        ? 'text-amber-500 hover:scale-110' 
                        : isHighContrast 
                          ? 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-100' 
                          : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Star size={14} className={doc.isFavorite ? 'fill-amber-500' : ''} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInEditor(doc);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isHighContrast ? 'bg-zinc-100 hover:bg-indigo-50 text-indigo-600' : 'bg-zinc-800 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <Edit3 size={11} /> Editar
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocPreview(doc);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      isHighContrast ? 'text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100' : 'text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Tem certeza que deseja excluir o documento: ${doc.name}?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      isHighContrast ? 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100' : 'text-zinc-600 hover:text-red-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* List trigger to upload card */}
            <div 
              onClick={() => setShowUploadModal(true)}
              className={`flex items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer group transition-all duration-300 ${
                isHighContrast 
                  ? 'bg-white border-zinc-300 hover:border-indigo-500 hover:bg-zinc-50/50' 
                  : 'bg-zinc-950/40 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadCloud size={16} className="text-indigo-500" />
                <span className={`text-xs font-bold ${isHighContrast ? 'text-zinc-700' : 'text-zinc-400'}`}>
                  Fazer Upload de Documento (PDF, DOCX, DOC)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Popups & Modals */}
      <AnimatePresence>
        {/* 1. Modal for detailed document viewing preview */}
        {selectedDocPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setSelectedDocPreview(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>{selectedDocPreview.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Categoria: {selectedDocPreview.folder} | Data: {selectedDocPreview.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDocPreview(null)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Visual file rendering preview */}
                <div className={`aspect-auto p-4 flex items-center justify-center min-h-[300px] w-full ${
                  isHighContrast ? 'bg-zinc-100' : 'bg-zinc-950/80'
                }`}>
                  <div className={`w-[290px] h-[390px] rounded-xl shadow-xl border overflow-hidden ${
                    isHighContrast ? 'border-zinc-250 bg-white' : 'border-zinc-800 bg-zinc-900'
                  }`}>
                    <RealDocumentCover doc={selectedDocPreview} isHighContrast={isHighContrast} isLarge={true} />
                  </div>
                </div>

                {/* Summary information about document content */}
                <div className={`p-6 space-y-5 overflow-y-auto max-h-[420px] border-l ${
                  isHighContrast ? 'border-zinc-200 bg-white' : 'border-zinc-800/60 bg-zinc-900'
                }`}>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Entidade Representativa</h4>
                    <p className={`text-xs font-bold mt-1 ${isHighContrast ? 'text-zinc-950' : 'text-zinc-200'}`}>{selectedDocPreview.entity || 'Ministério Nova Vida'}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{selectedDocPreview.address || 'Av. Dr. Ivo Xavier Ferreira, 3038'}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Ordem do Dia / Pauta</h4>
                    <pre className={`text-xs p-3 rounded-xl border mt-1 font-mono whitespace-pre-line leading-relaxed ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'text-zinc-300 bg-zinc-950 border-zinc-800/80'
                    }`}>
                      {selectedDocPreview.ordemDoDia || 'a) Abertura de sessão\nb) Eleição de novos cargos'}
                    </pre>
                  </div>

                  {selectedDocPreview.signatures && selectedDocPreview.signatures.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Assinaturas Associadas</h4>
                      <div className="space-y-1.5 mt-1.5">
                        {selectedDocPreview.signatures.map((sig, idx) => (
                          <div key={idx} className={`flex justify-between text-xs border p-2.5 rounded-lg ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800/60 text-zinc-300'
                          }`}>
                            <span className="font-semibold">{sig.name}</span>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{sig.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-2">
                    <button 
                      onClick={() => handleOpenInEditor(selectedDocPreview)}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      <Edit3 size={14} /> Abrir no Editor
                    </button>
                    <button 
                      onClick={() => alert('Download do arquivo simulado com sucesso em formato PDF.')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                        isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. Modal for creating / uploading a new document */}
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowUploadModal(false);
              setUploadedFile(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>Fazer Upload de Documento</h3>
                <button 
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                  }}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="p-6 space-y-4">
                {/* Drag and Drop Zone conforming to guidelines */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : uploadedFile
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : isHighContrast
                      ? 'border-zinc-300 hover:border-indigo-400 bg-zinc-50'
                      : 'border-zinc-800 hover:border-indigo-500 bg-zinc-950'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <Check size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold truncate max-w-[280px] ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">{uploadedFile.size} • {uploadedFile.type.toUpperCase()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 underline cursor-pointer"
                      >
                        Remover Arquivo
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block w-full">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isHighContrast ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          Arraste seu arquivo aqui ou clique para buscar
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1">Formatos aceitos: PDF, DOCX ou DOC</p>
                      </div>
                    </label>
                  )}
                </div>

                {uploadedFile && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">Nome do Documento *</label>
                      <input
                        type="text"
                        required
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="Nome para exibição do arquivo"
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 ${
                          isHighContrast 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                            : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1">Tipo Identificado</label>
                        <input
                          type="text"
                          disabled
                          value={newDocType.toUpperCase()}
                          className={`w-full border rounded-xl px-3 py-2 text-xs opacity-75 font-bold ${
                            isHighContrast ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1">Pasta Destino</label>
                        <select
                          value={newDocFolder}
                          onChange={(e) => {
                            setNewDocFolder(e.target.value);
                            setNewDocSubfolder('');
                          }}
                          className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 ${
                            isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-white'
                          }`}
                        >
                          {folders.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1">Subpasta (Opcional)</label>
                      <select
                        value={newDocSubfolder}
                        onChange={(e) => setNewDocSubfolder(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 ${
                          isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-white'
                        }`}
                      >
                        <option value="">Nenhuma (Salvar na raiz da pasta)</option>
                        {(subfolders[newDocFolder] || []).map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadedFile(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadedFile}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                      uploadedFile
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 cursor-pointer'
                        : 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Salvar Documento
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Google Docs Import Modal */}
        {showGoogleDocsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowGoogleDocsModal(false);
              setGoogleDocUrl('');
              setGoogleAuthError(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                    <path d="M10 9H8"/>
                    <path d="M16 13H8"/>
                    <path d="M16 17H8"/>
                  </svg>
                  <h3 className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                    Importar do Google Docs
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setShowGoogleDocsModal(false);
                    setGoogleDocUrl('');
                    setGoogleAuthError(null);
                  }}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Auth section */}
                {!googleUser ? (
                  <div className={`p-5 rounded-xl border text-center space-y-4 ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.14 0-5.69-2.55-5.69-5.69s2.55-5.69 5.69-5.69c1.4 0 2.67.5 3.66 1.34l3.12-3.12C18.81 3.51 15.75 2.1 12.24 2.1 6.57 2.1 2 6.67 2 12.34s4.57 10.24 10.24 10.24c5.94 0 9.87-4.18 9.87-10.05 0-.64-.08-1.25-.22-1.85H12.24z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className={`text-xs font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                        Conecte sua Conta Google
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
                        Para acessar seus documentos e importá-los, você precisa autenticar com sua conta Google.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      <span>Entrar com o Google</span>
                    </button>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {googleUser.photoURL ? (
                        <img referrerPolicy="no-referrer" src={googleUser.photoURL} className="w-8 h-8 rounded-full border border-zinc-200" alt={googleUser.displayName || 'Google User'} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs font-sans">
                          {googleUser.displayName?.[0] || 'G'}
                        </div>
                      )}
                      <div className="text-left">
                        <p className={`text-[11px] font-bold ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                          {googleUser.displayName}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-medium">{googleUser.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignOut}
                      className="px-2.5 py-1.5 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-500 rounded-lg text-[9px] font-bold cursor-pointer transition-all"
                    >
                      Sair
                    </button>
                  </div>
                )}

                {/* Import form */}
                {googleUser && (
                  <form onSubmit={handleImportGoogleDoc} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Link ou ID do Google Docs
                      </label>
                      <input
                        type="text"
                        value={googleDocUrl}
                        onChange={(e) => setGoogleDocUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/.../edit"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                          isHighContrast 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-850' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-blue-500'
                        }`}
                        disabled={isImporting}
                      />
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        O documento deve estar compartilhado ou sua conta conectada deve ter permissão de leitura para ele.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isImporting || !googleDocUrl.trim()}
                      className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isImporting || !googleDocUrl.trim()
                          ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10'
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Importando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          <span>Importar Conteúdo</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Error Banner */}
                {googleAuthError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-semibold leading-relaxed">
                    {googleAuthError}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {showNewFolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewFolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <Folder size={14} className="text-indigo-500" />
                  Criar Nova Pasta
                </h3>
                <button 
                  onClick={() => setShowNewFolderModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Nome da Pasta *</label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ex: AUDITORIA, FINANCEIRO"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 uppercase ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Criar Pasta
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* 4. Modal for creating a new subfolder */}
        {showNewSubfolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewSubfolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <Folder size={14} className="text-indigo-500" />
                  Criar Nova Subpasta em {selectedFolder}
                </h3>
                <button 
                  onClick={() => setShowNewSubfolderModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubfolder} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Nome da Subpasta *</label>
                  <input
                    type="text"
                    required
                    value={newSubfolderName}
                    onChange={(e) => setNewSubfolderName(e.target.value)}
                    placeholder="Ex: 2026, Urgentes, Diretoria"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewSubfolderModal(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Criar Subpasta
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* 5. Modal for renaming folders */}
        {showRenameFolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowRenameFolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <Folder size={14} className="text-indigo-500" />
                  Renomear Pasta: {folderToRename}
                </h3>
                <button 
                  onClick={() => setShowRenameFolderModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRenameFolderSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Novo Nome *</label>
                  <input
                    type="text"
                    required
                    value={renameFolderNewName}
                    onChange={(e) => setRenameFolderNewName(e.target.value)}
                    placeholder="Novo nome da pasta"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 uppercase ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRenameFolderModal(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Salvar Nome
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* 6. Modal for renaming subfolders */}
        {showRenameSubfolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowRenameSubfolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <Folder size={14} className="text-indigo-500" />
                  Renomear Subpasta: {subfolderToRename}
                </h3>
                <button 
                  onClick={() => setShowRenameSubfolderModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRenameSubfolderSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Novo Nome *</label>
                  <input
                    type="text"
                    required
                    value={renameSubfolderNewName}
                    onChange={(e) => setRenameSubfolderNewName(e.target.value)}
                    placeholder="Novo nome da subpasta"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRenameSubfolderModal(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Salvar Nome
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* 7. Modal for transferring folders */}
        {showTransferFolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTransferFolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <CornerUpRight size={14} className="text-indigo-500" />
                  Transferir Pasta: {folderToTransfer}
                </h3>
                <button 
                  onClick={() => setShowTransferFolderModal(false)}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleTransferFolderSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Mover para dentro da pasta (como subpasta):</label>
                  <select
                    required
                    value={transferDestinationFolder}
                    onChange={(e) => setTransferDestinationFolder(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  >
                    <option value="">Selecione a pasta destino...</option>
                    {folders
                      .filter((f) => f.toUpperCase() !== folderToTransfer.toUpperCase())
                      .map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferFolderModal(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!transferDestinationFolder}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                      transferDestinationFolder
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 cursor-pointer'
                        : 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Mover / Transferir
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Custom Context Menu for Documents */}
        {contextMenuDoc && (
          <div 
            className="fixed inset-0 z-50 cursor-default bg-transparent"
            onClick={() => setContextMenuDoc(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenuDoc(null);
            }}
          >
            <div 
              className={`fixed border rounded-2xl shadow-2xl py-2 z-50 w-48 text-left ${
                isHighContrast ? 'bg-white border-zinc-200 shadow-zinc-200 text-zinc-800' : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
              }`}
              style={{ top: `${contextMenuDoc.y}px`, left: `${contextMenuDoc.x}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3.5 py-1.5 border-b border-zinc-500/10 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Ações do Documento</p>
                <p className="text-[11px] font-bold truncate mt-0.5 max-w-[150px]" title={documents.find(d => d.id === contextMenuDoc.id)?.name}>
                  {documents.find(d => d.id === contextMenuDoc.id)?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const doc = documents.find(d => d.id === contextMenuDoc.id);
                  if (doc) {
                    setDocToRename(doc);
                    // Pre-fill name without extension for nicer renaming
                    const dotIndex = doc.name.lastIndexOf('.');
                    const nameOnly = dotIndex !== -1 ? doc.name.substring(0, dotIndex) : doc.name;
                    setRenameDocNewName(nameOnly);
                    setShowRenameDocModal(true);
                  }
                  setContextMenuDoc(null);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-indigo-500/5 hover:text-indigo-500 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Renomear</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = documents.find(d => d.id === contextMenuDoc.id);
                  if (doc) {
                    setDocToMove(doc);
                    setMoveDocDestination(doc.folder);
                    setShowMoveDocModal(true);
                  }
                  setContextMenuDoc(null);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-indigo-500/5 hover:text-indigo-500 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <CornerUpRight size={13} />
                <span>Mover para Pasta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = documents.find(d => d.id === contextMenuDoc.id);
                  if (doc) {
                    handleToggleFavorite(doc);
                  }
                  setContextMenuDoc(null);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-500/5 hover:text-amber-500 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Star size={13} className={documents.find(d => d.id === contextMenuDoc.id)?.isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
                <span>{documents.find(d => d.id === contextMenuDoc.id)?.isFavorite ? 'Remover Favorito' : 'Tornar Favorito'}</span>
              </button>
              <div className="h-px bg-zinc-500/10 my-1" />
              <button
                type="button"
                onClick={() => {
                  const doc = documents.find(d => d.id === contextMenuDoc.id);
                  if (doc && confirm(`Deseja realmente excluir o documento "${doc.name}"?`)) {
                    onDeleteDocument(doc.id);
                  }
                  setContextMenuDoc(null);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-500/5 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal for renaming documents */}
        {showRenameDocModal && docToRename && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowRenameDocModal(false);
              setDocToRename(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <FileText size={14} className="text-indigo-500" />
                  Renomear Documento
                </h3>
                <button 
                  onClick={() => {
                    setShowRenameDocModal(false);
                    setDocToRename(null);
                  }}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRenameDocSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Novo Nome do Arquivo *</label>
                  <input
                    type="text"
                    required
                    value={renameDocNewName}
                    onChange={(e) => setRenameDocNewName(e.target.value)}
                    placeholder="Novo nome do arquivo"
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 ${
                      isHighContrast 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400' 
                        : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                    }`}
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">A extensão original será preservada (.{(docToRename.name.split('.').pop() || '')})</span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRenameDocModal(false);
                      setDocToRename(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Salvar Nome
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal for moving documents */}
        {showMoveDocModal && docToMove && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowMoveDocModal(false);
              setDocToMove(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl ${
                isHighContrast ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                isHighContrast ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isHighContrast ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  <CornerUpRight size={14} className="text-indigo-500" />
                  Mover Documento
                </h3>
                <button 
                  onClick={() => {
                    setShowMoveDocModal(false);
                    setDocToMove(null);
                  }}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    isHighContrast ? 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleMoveDocSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">Escolha a pasta / subpasta de destino:</label>
                  <select
                    required
                    value={moveDocDestination}
                    onChange={(e) => setMoveDocDestination(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-indigo-500 ${
                      isHighContrast ? 'bg-zinc-50 border-zinc-200 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  >
                    {/* Top Level Folders */}
                    {folders.map(f => (
                      <React.Fragment key={f}>
                        <option value={f}>{f} (Pasta principal)</option>
                        {/* Subfolders nested under it */}
                        {(subfolders[f] || []).map(sub => (
                          <option key={`${f}/${sub}`} value={`${f}/${sub}`}>
                            &nbsp;&nbsp;↳ {f} / {sub}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoveDocModal(false);
                      setDocToMove(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      isHighContrast ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                  >
                    Mover Arquivo
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
