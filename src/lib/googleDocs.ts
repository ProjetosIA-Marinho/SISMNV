import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App and Auth once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace documents readonly scope
provider.addScope('https://www.googleapis.com/auth/documents.readonly');

// Cache the access token in memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Extractor helper for Document ID from Google Docs URL or direct ID
export function extractDocId(urlOrId: string): string {
  const cleaned = urlOrId.trim();
  const match = cleaned.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : cleaned;
}

// Fetch Document JSON from Google API
export async function fetchGoogleDoc(documentId: string, accessToken: string): Promise<any> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to fetch document: ${response.statusText}. Details: ${errorDetails}`);
  }

  return response.json();
}

export interface ParsedGoogleDoc {
  title: string;
  fullText: string;
  entity?: string;
  address?: string;
  ordemDoDia?: string;
  localidade?: string;
  tipoAssembleia?: string;
  date?: string;
}

export function parseGoogleDoc(doc: any): ParsedGoogleDoc {
  const title = doc.title || 'Documento Importado';
  let fullText = '';

  if (doc.body && doc.body.content) {
    for (const element of doc.body.content) {
      if (element.paragraph && element.paragraph.elements) {
        for (const el of element.paragraph.elements) {
          if (el.textRun && el.textRun.content) {
            fullText += el.textRun.content;
          }
        }
      }
    }
  }

  const lines = fullText.split('\n');
  let entity = '';
  let address = '';
  let ordemDoDia = '';
  let localidade = '';
  let tipoAssembleia = '';
  let date = '';

  let currentSection: 'entity' | 'address' | 'ordem' | 'local' | 'tipo' | 'date' | null = null;
  let sectionLines: string[] = [];

  const saveSection = (section: string, lines: string[]) => {
    const text = lines.join('\n').trim();
    if (section === 'entity') entity = text;
    else if (section === 'address') address = text;
    else if (section === 'ordem') ordemDoDia = text;
    else if (section === 'local') localidade = text;
    else if (section === 'tipo') tipoAssembleia = text;
    else if (section === 'date') date = text;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('entidade:') || 
      lower.startsWith('associação:') || 
      lower.startsWith('igreja:') || 
      lower.startsWith('nome da entidade:') ||
      lower.startsWith('empresa:')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'entity';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else if (
      lower.startsWith('endereço:') || 
      lower.startsWith('local:') || 
      lower.startsWith('rua:') || 
      lower.startsWith('localização:')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'address';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else if (
      lower.startsWith('ordem do dia:') || 
      lower.startsWith('pauta:') || 
      lower.startsWith('assuntos:') || 
      lower.startsWith('ordem do dia')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'ordem';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else if (
      lower.startsWith('localidade:') || 
      lower.startsWith('cidade:') || 
      lower.startsWith('município:')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'local';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else if (
      lower.startsWith('assembleia:') || 
      lower.startsWith('tipo da assembleia:') || 
      lower.startsWith('tipo de assembleia:') ||
      lower.startsWith('tipo de reunião:')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'tipo';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else if (
      lower.startsWith('data:') || 
      lower.startsWith('data da assembleia:') || 
      lower.startsWith('dia:') ||
      lower.startsWith('data da reunião:')
    ) {
      if (currentSection && sectionLines.length > 0) saveSection(currentSection, sectionLines);
      currentSection = 'date';
      sectionLines = [trimmed.substring(trimmed.indexOf(':') + 1).trim()];
    } else {
      if (currentSection) {
        sectionLines.push(trimmed);
      }
    }
  }

  if (currentSection && sectionLines.length > 0) {
    saveSection(currentSection, sectionLines);
  }

  // Fallback to fullText if no structured fields are parsed
  if (!ordemDoDia) {
    ordemDoDia = fullText.trim();
  }

  return {
    title,
    fullText: fullText.trim(),
    entity: entity || undefined,
    address: address || undefined,
    ordemDoDia: ordemDoDia || undefined,
    localidade: localidade || undefined,
    tipoAssembleia: tipoAssembleia || undefined,
    date: date || undefined,
  };
}
