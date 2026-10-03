import { Document, Member, Activity, Template } from './types';

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-ministerio',
    name: 'Convocação Ministério Nova Vida.docx',
    type: 'docx',
    folder: 'ORDINÁRIA',
    size: '18 KB',
    creator: 'Ítalo Diego Mariano',
    date: '2026-04-15',
    imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA',
    entity: 'MINISTÉRIO NOVA VIDA',
    address: 'Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP',
    localidade: 'Pirassununga',
    convocacao1: '18:00',
    convocacao2: '18:30',
    tipoAssembleia: 'Geral Ordinária',
    ordemDoDia: 'a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;\nb) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;\nc) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;\nd) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;\ne) - Outros assuntos de interesse do Ministério.',
    signatures: [
      { name: 'Ítalo Diego Mariano Da Silva Marinho', role: 'Pr. Presidente' },
      { name: 'Patrícia Gonçalves Rombe Marinho', role: 'Tesoureira' }
    ],
    isRichTemplate: true,
    richContent: `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #111827; line-height: 1.5; padding: 10px 15px; background-color: #ffffff;">
  <!-- Header / Identification -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 6px 0; color: #000000; letter-spacing: 0.5px;">MINISTÉRIO NOVA VIDA</h1>
    <p style="font-size: 14px; margin: 0 0 6px 0; font-weight: bold;">
      <span style="color: red;" data-field-id="field-endereco-cabecalho">Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP</span>
    </p>
    <p style="font-size: 14px; margin: 0; color: #000000; font-weight: bold;">
      CNPJ: <span style="color: red;" data-field-id="field-cnpj">16656565/23</span>
    </p>
  </div>

  <!-- CONVOCAÇÃO -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 19px; font-weight: bold; text-decoration: underline; margin: 0; color: #000000; letter-spacing: 1px;">CONVOCAÇÃO</h2>
  </div>

  <!-- Intro paragraph -->
  <p style="text-align: justify; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px 0; text-indent: 45px; color: #111827;">
    De acordo com as disposições estatutárias, ficam convocados os associados deste Ministério, para se reunirem em Assembleia <span style="color: red;" data-field-id="field-tipo-assembleia">Geral Ordinária</span>, na <span style="color: red;" data-field-id="field-endereco-intro">Avenida Dr. Ivo Xavier Ferreira, 3038, Vila São Pedro - Pirassununga-SP</span>, no dia <span style="color: red;" data-field-id="field-data-intro">25 de abril de 2026</span>, nos seguintes horários:
  </p>

  <!-- Table for Horários e Convocação -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #000000; font-size: 14px;">
    <thead>
      <tr>
        <th colspan="2" style="border-bottom: 1px solid #000000; padding: 10px; text-align: center; font-size: 15px; font-weight: bold; color: #000000; background-color: #ffffff;">
          Horários e Convocação
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <!-- 1ª Convocação -->
        <td style="width: 50%; border-right: 1px solid #000000; padding: 14px; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: #000000; letter-spacing: 0.5px;">1ª CONVOCAÇÃO</div>
          <div style="font-weight: bold; font-size: 17px; margin-bottom: 6px;">
            <span style="color: red;" data-field-id="field-hora-1">18h00min</span>
          </div>
          <div style="font-size: 11.5px; color: #1f2937; line-height: 1.4; max-width: 220px; margin: 0 auto;">
            com o "quórum" de metade mais um dos associados
          </div>
        </td>
        <!-- 2ª Convocação -->
        <td style="width: 50%; padding: 14px; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: #000000; letter-spacing: 0.5px;">2ª CONVOCAÇÃO</div>
          <div style="font-weight: bold; font-size: 17px; margin-bottom: 6px;">
            <span style="color: red;" data-field-id="field-hora-2">18h30min</span>
          </div>
          <div style="font-size: 11.5px; color: #1f2937; line-height: 1.4; max-width: 200px; margin: 0 auto;">
            com o "quórum" de 1/3 dos associados
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Vertical spacer line -->
  <div style="height: 24px;"></div>

  <!-- ORDEM DO DIA -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin: 0; color: #000000; letter-spacing: 0.5px;">ORDEM DO DIA</h2>
  </div>

  <!-- Alineas -->
  <div style="margin-bottom: 24px; font-size: 13.5px; line-height: 1.6; color: #111827;">
    <div class="alinea" data-alinea-id="alinea-a" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-a">a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-b" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-b">b) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-c" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-c">c) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-d" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-d">d) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-e" style="margin-bottom: 12px; text-align: justify;">
      e) - Outros assuntos de interesse do Ministério.
    </div>
  </div>

  <!-- Closing paragraph -->
  <p style="text-align: justify; font-size: 14.5px; line-height: 1.6; margin: 0 0 32px 0; text-indent: 45px; color: #111827;">
    Os "Participantes", isto é, aqueles que ainda não fazem parte do "Rol de Associados" deste Ministério, podem assistir à Assembleia, porém, sem compor o respectivo "quorum", e sem direito de voto.
  </p>

  <!-- Location and date -->
  <div style="text-align: right; font-size: 14px; margin-bottom: 50px; color: #111827; padding-right: 15px;">
    Pirassununga, <span style="color: red;" data-field-id="field-data-rodape">15 de abril de 2026</span>.
  </div>

  <!-- Signatures block -->
  <table style="width: 100%; border: none; font-size: 14px; margin-top: 40px;">
    <tbody>
      <tr>
        <td style="width: 50%; text-align: center; border: none; padding: 0 10px; vertical-align: top;">
          <div style="font-weight: bold; margin-bottom: 3px;">
            <span style="color: red;" data-field-id="field-assinatura-pres">Ítalo Diego Mariano Da Silva Marinho</span>
          </div>
          <div style="color: #4b5563; font-size: 13px;">Pr. Presidente</div>
        </td>
        <td style="width: 50%; text-align: center; border: none; padding: 0 10px; vertical-align: top;">
          <div style="font-weight: bold; margin-bottom: 3px;">
            <span style="color: red;" data-field-id="field-assinatura-tes">Patrícia Gonçalves Rombe Marinho</span>
          </div>
          <div style="color: #4b5563; font-size: 13px;">Tesoureira</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>`,
    selectedAlineas: ['alinea-a', 'alinea-b', 'alinea-c', 'alinea-d', 'alinea-e'],
    richFieldsData: {
      'field-endereco-cabecalho': 'Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP',
      'field-cnpj': '16656565/23',
      'field-tipo-assembleia': 'Geral Ordinária',
      'field-endereco-intro': 'Avenida Dr. Ivo Xavier Ferreira, 3038, Vila São Pedro - Pirassununga-SP',
      'field-data-intro': '25 de abril de 2026',
      'field-hora-1': '18h00min',
      'field-hora-2': '18h30min',
      'field-alinea-a': 'a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;',
      'field-alinea-b': 'b) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;',
      'field-alinea-c': 'c) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;',
      'field-alinea-d': 'd) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;',
      'field-data-rodape': '15 de abril de 2026',
      'field-assinatura-pres': 'Ítalo Diego Mariano Da Silva Marinho',
      'field-assinatura-tes': 'Patrícia Gonçalves Rombe Marinho'
    }
  },
  {
    id: 'doc-1',
    name: 'esqueleto da Ata com Eleição de Diretoria',
    type: 'docx',
    folder: 'EXTRAORDINÁRIA',
    size: '1.2 MB',
    creator: 'Ricardo Silva',
    date: '2026-05-15',
    imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHoCx7zauWtM2AxcoTXkOi_IhoJ5BEkIUlM04I4dOiwSYis14Xh8LM8oPIDkVhp6gpIIAOq5aoHCurmYLDGR3yGzTdBai6ch2yIRJkG7JlGAdyPKqMytDzx2C1c26JRYYN1OLkIOOwDEn0dEze7OcRo7DY1P25v9sFUWjjQr9BTKvDs3nDhOqS_TcQvTEBsSJAtTk6VpNP_ebzbtdHIs3FXbNpkYAlht-_FRppRLFdSjeHJkcZuKP5UA',
    entity: 'MINISTÉRIO NOVA VIDA',
    address: 'Av. Dr. Ivo Xavier Ferreira, 3038 - Vila São Pedro - Pirassununga/SP',
    localidade: 'Pirassununga',
    convocacao1: '18:00',
    convocacao2: '18:15',
    tipoAssembleia: 'Geral Ordinária',
    ordemDoDia: 'a) - Aprovação das Contas do Ministério\nb) - Eleição de novos membros do Conselho\nc) - Eleição de novo membro da Diretoria\nd) - Eleição de novos membros do Conselho Fiscal\ne) - Outros assuntos de interesse do Ministério',
    signatures: [
      { name: 'Ítalo Diego Mariano', role: 'Presidente' },
      { name: 'Patrícia Gonçalves Rombe', role: 'Tesoureira' }
    ]
  },
  {
    id: 'doc-2',
    name: 'informações associados.docx',
    type: 'docx',
    folder: 'ORDINÁRIA',
    size: '840 KB',
    creator: 'Mariana Oliveira',
    date: '2026-06-02',
    imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmMB4oZWBRTSJo4Msm6G03SR07_RMsmK1sI7sDDGHer2vQUj71eDayxnXww1H-nQWQfRgJT5Tf3PtDUEeS3gOn6CGmSM0zXH1t611XqFJZ_ZgzDu6P-UWBBo3LuiArdcfTGs5btyLXXXXOSs_4vHH9_NpMYh9tC6THKkvI5pkYV7EEaL1ZGu61XvXuT_vJl1pyWo7EYdvx9yNZc1W4AuROdDyzY1ZlrGNT2lvPOurDtQcgx3p56FiI5A',
    entity: 'ASSOCIAÇÃO DE MORADORES',
    address: 'Rua das Palmeiras, 120 - Centro',
    localidade: 'São Paulo',
    convocacao1: '19:00',
    convocacao2: '19:30',
    tipoAssembleia: 'Geral Extraordinária',
    ordemDoDia: '1) Discussão das taxas condominiais\n2) Reforma da portaria principal\n3) Eleição do novo síndico administrador',
    signatures: [
      { name: 'Alex Morgan', role: 'Presidente do Conselho' },
      { name: 'Jane Smith', role: 'Secretária Executiva' }
    ]
  },
  {
    id: 'doc-3',
    name: 'QUORUM ABR 25.docx',
    type: 'docx',
    folder: 'EXTRAORDINÁRIA',
    size: '512 KB',
    creator: 'Ricardo Silva',
    date: '2026-04-25',
    imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrsCc1qJPMsSsPd5TMwMO_6Mh8RIwizuPIstBj5U0dfuh06udiKstFKzuemcGeH8pdAw41lHv_hDYMYp5Mgqt7ixVVxojd_ZuasFvjaz76lWGE-8ztGzVHDikIbEG-OYJRh6HqsQ936hGvMr-qFsJtAonpsBBu-LVt29DoOu2_nAiu5js398uRoV04biNp-kBWVPTkA_nW0MWJdWa7eyqxSCSSYhjP11lDXzT77auKrOs2SLNcyrIq3A',
    entity: 'CONGRESSO NACIONAL DE SÍNDICOS',
    address: 'Auditório Principal, Av. Paulista 1000',
    localidade: 'São Paulo',
    convocacao1: '09:00',
    convocacao2: '09:30',
    tipoAssembleia: 'Geral Ordinária',
    ordemDoDia: 'a) Abertura solene\nb) Palestra: Gestão Orçamentária Eficiente\nc) Homologação dos novos membros associados',
    signatures: [
      { name: 'Ricardo Silva', role: 'Presidente da Comissão' },
      { name: 'Carlos Eduardo', role: 'Tesoureiro Geral' }
    ]
  },
  {
    id: 'doc-4',
    name: 'reunião dir, cons, cons...',
    type: 'pdf',
    folder: 'ORDINÁRIA',
    size: '2.4 MB',
    creator: 'Jane Smith',
    date: '2026-07-10',
    imagePreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLJARLaNLyVB72dyzoWkJ_FrbMMgATpjIYk7tGZaQFj330vutVLbUHGYdDmBW3688UnluZVvTdctHggLJejIbO6wgvhlgJ0R-EWHwAsIaRzpwQqQBbeniu6BKyQYmx3brLkEUw0KN1JyXqgJxn9BMOEKUMwwrvE2f1v8RIIJxxkC5RkxPt8BTbfxhSd3aLXAx-YpjqE59WDqhEAICb6QDPkSps6-J60OzRQXdtq3TK7lAyohyDNIWW4A',
    entity: 'CONSELHO DELIBERATIVO',
    address: 'Sala de Conferências 3, Ala Norte',
    localidade: 'Rio de Janeiro',
    convocacao1: '14:00',
    convocacao2: '14:15',
    tipoAssembleia: 'Geral Ordinária',
    ordemDoDia: '1) Leitura da ata anterior\n2) Avaliação de resultados financeiros Q2\n3) Planejamento estratégico anual',
    signatures: [
      { name: 'Beatriz Ramos', role: 'Conselheira Jurídica' },
      { name: 'Rick Kim', role: 'Secretário do Conselho' }
    ]
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'Ricardo Silva',
    email: 'ricardo.silva@auraquery.com',
    cargo: 'Conselho Administrativo',
    nivelAcesso: 'Admin',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIxD8qi2gRluPQ6XDvqMHw0x7qjtzsI33_6vyp3sVyfy50OxroP8JsfJOBmkIxkn9zNVI7Otcmy8FUgkEsX8Z4-Rmwuavg8aqamCY8xCyPjnyp4_zZxCJNvtD0q44R48UhfIelxSo2r_GnfU_KlUMGtQQ3DKmbERSXNa2qRKeO7WfNnco2iJA_cMvgSMZ3ROiPtogXhlxfaDFc1ycaAHZj0CHdpu2NXfkcOnmZwt6rTdhTYHLPnAIoYQ',
    cpf: '111.222.333-44',
    estadoCivil: 'Casado',
    nomeConjuge: 'Fernanda de Souza Silva',
    dataNascimento: '1985-06-15',
    telefone: '(11) 98888-7777',
    rua: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    cep: '01310-100',
    dataInicio: '2025-01-01',
    dataTermino: '2026-12-31'
  },
  {
    id: 'mem-2',
    name: 'Mariana Oliveira',
    email: 'mariana.o@auraquery.com',
    cargo: 'Diretoria',
    nivelAcesso: 'Editor',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArGVb-uVa1SdApjoN4NypDZY3tFdPAec9sCR0leIXlRcNtjo28RNCYfsAb_bKvjw0FR2vPBoKV5gnEDld7Nu2YbHtUchYOw_AJYFGq4xgrFIVTUo0AcUN2XmJKXwALBfzIzXO_AyfDhQFynyHDZl2Z8aeIRDNrS2P0ofgKn84XoNLPa0ZXAaPLe4OpEa9-hx8kT_CBd7xpCqt_gCnA-S1rlQoH687iJj0Rr55-PZai2j-3k3y3eep8hA',
    cpf: '555.666.777-88',
    estadoCivil: 'Solteiro',
    dataNascimento: '1990-11-20',
    telefone: '(11) 97777-6666',
    rua: 'Rua das Palmeiras',
    numero: '120',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01226-010',
    dataInicio: '2025-01-01',
    dataTermino: '2026-12-31'
  },
  {
    id: 'mem-3',
    name: 'Carlos Eduardo',
    email: 'carlos.edu@auraquery.com',
    cargo: 'Conselho Fiscal',
    nivelAcesso: 'Editor',
    status: 'Inativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADX5iIWCqtZTMjSNfKK5cUvyJ51ocFXr7ViYOgijQahmefTiplcNSJbtGb_ze8cfDJyvJt6WN33smpkR1kx6AK2ZnyEp-abs8lu4QT7rn1xD7xkCjHfTfHG6jLPFOvZml6LqtfnZ5Kzc-KxzS_iqPguKWpyf1EQgx_VohcExF57QcqPLSjUp5QzIqANsbWqnU9I9wg4jE_vta2W0-LkimEOZmYdi_T9xb0SwvNOxk-Xsm0g3yFDD7PyA',
    cpf: '999.888.777-66',
    estadoCivil: 'Divorciado',
    dataNascimento: '1978-04-10',
    telefone: '(11) 96666-5555',
    rua: 'Avenida Brigadeiro Luís Antônio',
    numero: '2500',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    cep: '01402-000',
    dataInicio: '2024-06-01',
    dataTermino: '2025-05-31'
  },
  {
    id: 'mem-4',
    name: 'Beatriz Ramos',
    email: 'beatriz.ramos@auraquery.com',
    cargo: 'Conselho Administrativo',
    nivelAcesso: 'Viewer',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuR8pyHZShUytEsm6WttREjpNZ8IWav9EkIX400OuOrjCh8sp5V7hrZK61svHrUHs9BQyP-lgEnEYsNMUmDk2vBW-ChCtDfr0TPQremdGwaBKG653DLg4P_E7m9-fDWQ3i5QJl8aVEvWSLiwFyiLhqgoPWaEscQXXjCW2p7zE-RQYZZ-alAOvEE-6uDI-8mDOut2c4wCBiGIWLQi_yIaJTyyRGR0zUX5L1ewsaNW5ogPz8njmPCg9R-w',
    cpf: '222.333.444-55',
    estadoCivil: 'União Estável',
    nomeConjuge: 'Roberto Alencar Ramos',
    dataNascimento: '1988-09-05',
    telefone: '(11) 95555-4444',
    rua: 'Rua Augusta',
    numero: '500',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    cep: '01305-000',
    dataInicio: '2025-01-01',
    dataTermino: '2026-12-31'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    workspace: 'MS-83EH2',
    fileName: 'top_spending_customers.sql',
    fileType: 'sql',
    editorName: 'Alex Morgan',
    editorInitials: 'AM',
    editorBg: 'bg-indigo-600',
    timeAgo: 'há 2 min'
  },
  {
    id: 'act-2',
    workspace: 'WS-D57L2',
    fileName: 'quarterly_revenue_report.pdf',
    fileType: 'pdf',
    editorName: 'Jane Smith',
    editorInitials: 'JS',
    editorBg: 'bg-pink-600',
    timeAgo: 'há 45 min'
  },
  {
    id: 'act-3',
    workspace: 'MS-83EH2',
    fileName: 'new_user_onboarding.doc',
    fileType: 'doc',
    editorName: 'Rick Kim',
    editorInitials: 'RK',
    editorBg: 'bg-amber-600',
    timeAgo: 'há 1 hora'
  }
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl-ministerio',
    title: 'Assembleia Ministério Nova Vida',
    description: 'Convocação oficial do Ministério Nova Vida com campos inteligentes para todos os dados em vermelho da imagem.',
    category: 'Convocatórias',
    fields: {
      entity: 'MINISTÉRIO NOVA VIDA',
      address: 'Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP',
      localidade: 'Pirassununga',
      convocacao1: '18:00',
      convocacao2: '18:30',
      tipoAssembleia: 'Geral Ordinária',
      ordemDoDia: 'a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;\nb) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;\nc) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;\nd) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;\ne) - Outros assuntos de interesse do Ministério.',
      signatures: [
        { name: 'Ítalo Diego Mariano Da Silva Marinho', role: 'Pr. Presidente' },
        { name: 'Patrícia Gonçalves Rombe Marinho', role: 'Tesoureira' }
      ]
    },
    isRichTemplate: true,
    richContent: `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #111827; line-height: 1.5; padding: 10px 15px; background-color: #ffffff;">
  <!-- Header / Identification -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 6px 0; color: #000000; letter-spacing: 0.5px;">MINISTÉRIO NOVA VIDA</h1>
    <p style="font-size: 14px; margin: 0 0 6px 0; font-weight: bold;">
      <span style="color: red;" data-field-id="field-endereco-cabecalho">Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP</span>
    </p>
    <p style="font-size: 14px; margin: 0; color: #000000; font-weight: bold;">
      CNPJ: <span style="color: red;" data-field-id="field-cnpj">16656565/23</span>
    </p>
  </div>

  <!-- CONVOCAÇÃO -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 19px; font-weight: bold; text-decoration: underline; margin: 0; color: #000000; letter-spacing: 1px;">CONVOCAÇÃO</h2>
  </div>

  <!-- Intro paragraph -->
  <p style="text-align: justify; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px 0; text-indent: 45px; color: #111827;">
    De acordo com as disposições estatutárias, ficam convocados os associados deste Ministério, para se reunirem em Assembleia <span style="color: red;" data-field-id="field-tipo-assembleia">Geral Ordinária</span>, na <span style="color: red;" data-field-id="field-endereco-intro">Avenida Dr. Ivo Xavier Ferreira, 3038, Vila São Pedro - Pirassununga-SP</span>, no dia <span style="color: red;" data-field-id="field-data-intro">25 de abril de 2026</span>, nos seguintes horários:
  </p>

  <!-- Table for Horários e Convocação -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #000000; font-size: 14px;">
    <thead>
      <tr>
        <th colspan="2" style="border-bottom: 1px solid #000000; padding: 10px; text-align: center; font-size: 15px; font-weight: bold; color: #000000; background-color: #ffffff;">
          Horários e Convocação
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <!-- 1ª Convocação -->
        <td style="width: 50%; border-right: 1px solid #000000; padding: 14px; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: #000000; letter-spacing: 0.5px;">1ª CONVOCAÇÃO</div>
          <div style="font-weight: bold; font-size: 17px; margin-bottom: 6px;">
            <span style="color: red;" data-field-id="field-hora-1">18h00min</span>
          </div>
          <div style="font-size: 11.5px; color: #1f2937; line-height: 1.4; max-width: 220px; margin: 0 auto;">
            com o "quórum" de metade mais um dos associados
          </div>
        </td>
        <!-- 2ª Convocação -->
        <td style="width: 50%; padding: 14px; text-align: center; vertical-align: top;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: #000000; letter-spacing: 0.5px;">2ª CONVOCAÇÃO</div>
          <div style="font-weight: bold; font-size: 17px; margin-bottom: 6px;">
            <span style="color: red;" data-field-id="field-hora-2">18h30min</span>
          </div>
          <div style="font-size: 11.5px; color: #1f2937; line-height: 1.4; max-width: 200px; margin: 0 auto;">
            com o "quórum" de 1/3 dos associados
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Vertical spacer line -->
  <div style="height: 24px;"></div>

  <!-- ORDEM DO DIA -->
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin: 0; color: #000000; letter-spacing: 0.5px;">ORDEM DO DIA</h2>
  </div>

  <!-- Alineas -->
  <div style="margin-bottom: 24px; font-size: 13.5px; line-height: 1.6; color: #111827;">
    <div class="alinea" data-alinea-id="alinea-a" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-a">a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-b" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-b">b) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-c" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-c">c) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-d" style="margin-bottom: 12px; text-align: justify;">
      <span style="color: red;" data-field-id="field-alinea-d">d) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;</span>
    </div>
    <div class="alinea" data-alinea-id="alinea-e" style="margin-bottom: 12px; text-align: justify;">
      e) - Outros assuntos de interesse do Ministério.
    </div>
  </div>

  <!-- Closing paragraph -->
  <p style="text-align: justify; font-size: 14.5px; line-height: 1.6; margin: 0 0 32px 0; text-indent: 45px; color: #111827;">
    Os "Participantes", isto é, aqueles que ainda não fazem parte do "Rol de Associados" deste Ministério, podem assistir à Assembleia, porém, sem compor o respectivo "quorum", e sem direito de voto.
  </p>

  <!-- Location and date -->
  <div style="text-align: right; font-size: 14px; margin-bottom: 50px; color: #111827; padding-right: 15px;">
    Pirassununga, <span style="color: red;" data-field-id="field-data-rodape">15 de abril de 2026</span>.
  </div>

  <!-- Signatures block -->
  <table style="width: 100%; border: none; font-size: 14px; margin-top: 40px;">
    <tbody>
      <tr>
        <td style="width: 50%; text-align: center; border: none; padding: 0 10px; vertical-align: top;">
          <div style="font-weight: bold; margin-bottom: 3px;">
            <span style="color: red;" data-field-id="field-assinatura-pres">Ítalo Diego Mariano Da Silva Marinho</span>
          </div>
          <div style="color: #4b5563; font-size: 13px;">Pr. Presidente</div>
        </td>
        <td style="width: 50%; text-align: center; border: none; padding: 0 10px; vertical-align: top;">
          <div style="font-weight: bold; margin-bottom: 3px;">
            <span style="color: red;" data-field-id="field-assinatura-tes">Patrícia Gonçalves Rombe Marinho</span>
          </div>
          <div style="color: #4b5563; font-size: 13px;">Tesoureira</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>`,
    selectedAlineas: ['alinea-a', 'alinea-b', 'alinea-c', 'alinea-d', 'alinea-e'],
    richFieldsData: {
      'field-endereco-cabecalho': 'Av. Dr. Ivo Xavier Ferreira, 3038 – Vila São Pedro – Pirassununga/SP',
      'field-cnpj': '16656565/23',
      'field-tipo-assembleia': 'Geral Ordinária',
      'field-endereco-intro': 'Avenida Dr. Ivo Xavier Ferreira, 3038, Vila São Pedro - Pirassununga-SP',
      'field-data-intro': '25 de abril de 2026',
      'field-hora-1': '18h00min',
      'field-hora-2': '18h30min',
      'field-alinea-a': 'a) - Aprovação das Contas do Ministério, do Relatório de Administração, do Balanço Patrimonial e Demonstração da Situação Econômica do exercício encerrado em 31 de dezembro de 2025, com parecer favorável do Conselho Fiscal;',
      'field-alinea-b': 'b) - Eleição de novos membros do Conselho do Ministério, fixação do respectivo mandato e posse dos eleitos;',
      'field-alinea-c': 'c) - Eleição de novo membro da Diretoria, fixação do respectivo mandato e posse dos eleitos;',
      'field-alinea-d': 'd) - Eleição de novos membros do Conselho Fiscal, fixação do respectivo mandato, nomeação do seu Presidente e posse dos eleitos;',
      'field-data-rodape': '15 de abril de 2026',
      'field-assinatura-pres': 'Ítalo Diego Mariano Da Silva Marinho',
      'field-assinatura-tes': 'Patrícia Gonçalves Rombe Marinho'
    }
  },
  {
    id: 'tpl-1',
    title: 'Template de Ata Geral',
    description: 'Ideal para reuniões ordinárias de condomínio ou diretoria administrativa.',
    category: 'Atas',
    fields: {
      entity: 'CONDOMÍNIO RESIDENCIAL BELA VISTA',
      address: 'Rua das Flores, 450 - Bairro Jardim, São Paulo/SP',
      localidade: 'São Paulo',
      convocacao1: '19:00',
      convocacao2: '19:30',
      tipoAssembleia: 'Geral Ordinária',
      ordemDoDia: 'a) Prestação de contas do exercício de 2025;\nb) Aprovação da previsão orçamentária anual para 2026;\nc) Eleição do corpo diretivo (Síndico, Subsíndico e Conselho).',
      signatures: [
        { name: 'Ítalo Diego Mariano', role: 'Presidente de Mesa' },
        { name: 'Patrícia Gonçalves Rombe', role: 'Secretária de Mesa' }
      ]
    }
  },
  {
    id: 'tpl-2',
    title: 'Convocação Oficial de Assembleia',
    description: 'Aviso formal para chamamento de associados e membros eleitores.',
    category: 'Convocatórias',
    fields: {
      entity: 'MINISTÉRIO NOVA VIDA',
      address: 'Av. Dr. Ivo Xavier Ferreira, 3038 - Vila São Pedro - Pirassununga/SP',
      localidade: 'Pirassununga',
      convocacao1: '18:00',
      convocacao2: '18:15',
      tipoAssembleia: 'Geral Ordinária',
      ordemDoDia: 'a) Aprovação das contas e balanço patrimonial;\nb) Eleição de novos membros do conselho diretor;\nc) Deliberações sobre novos projetos comunitários.',
      signatures: [
        { name: 'Pr. Marcos Oliveira', role: 'Diretor Presidente' },
        { name: 'Beatriz Ramos', role: 'Diretora Secretária' }
      ]
    }
  },
  {
    id: 'tpl-3',
    title: 'Proposta Comercial Padrão',
    description: 'Documento descritivo de escopo, cronograma e orçamentos comerciais.',
    category: 'Comercial',
    fields: {
      entity: 'AURAQUERY ENTERPRISE LABS',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
      localidade: 'São Paulo',
      convocacao1: '10:00',
      convocacao2: '10:30',
      tipoAssembleia: 'Geral Extraordinária',
      ordemDoDia: '1. Apresentação do escopo técnico da plataforma de gestão;\n2. Detalhamento de valores, licenças corporativas e SLA;\n3. Cronograma de implantação e treinamento operacional.',
      signatures: [
        { name: 'Ricardo Silva', role: 'Gerente de Contas' },
        { name: 'Alex Morgan', role: 'Consultor de TI' }
      ]
    }
  },
  {
    id: 'tpl-4',
    title: 'Lista de Quórum e Presença',
    description: 'Estruturação de planilha de verificação para quórum em decisões legais.',
    category: 'Quórum',
    fields: {
      entity: 'COOPERATIVA AGRÍCOLA REGIONAL',
      address: 'Rodovia BR-101, Km 45 - Zona Rural',
      localidade: 'Ribeirão Preto',
      convocacao1: '08:00',
      convocacao2: '08:30',
      tipoAssembleia: 'Geral Ordinária',
      ordemDoDia: 'a) Chamada geral dos cooperados associados;\nb) Verificação do quórum mínimo de dois terços;\nc) Início das votações de pauta orçamentária.',
      signatures: [
        { name: 'Carlos Eduardo', role: 'Secretário de Mesa' },
        { name: 'Rick Kim', role: 'Conselheiro Fiscal' }
      ]
    }
  }
];
