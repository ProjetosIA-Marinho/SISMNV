# SELECTCARS — Design System

## 1. Conceito e Estilo

Um sistema editorial de curadoria premium, construído sobre alto contraste entre superfícies claras e blocos pretos absolutos. A linguagem visual é minimalista e confiante, com tipografia bold como elemento de assinatura e fotografia de produto (veículos) isolada sobre fundos neutros. Não há decoração supérflua: hierarquia, espaço negativo e contraste tipográfico fazem o trabalho de comunicar exclusividade.

**Palavras-chave:** editorial, minimal, alto-contraste, premium, estruturado, confiante

---

## 2. Sistema de Cores

### Cores Primitivas

| Token | Valor (aprox.) | Uso |
|---|---|---|
| `neutral-0` | `#FFFFFF` | Branco puro (cards, texto sobre preto) |
| `neutral-50` | `#F6F5F3` | Fundo base da aplicação (off-white quente) |
| `neutral-100` | `#EDECE9` | Fundo de inputs/filtros |
| `neutral-200` | `#DEDDD9` | Bordas e divisores sutis |
| `neutral-400` | `#9A9893` | Texto terciário / placeholders |
| `neutral-600` | `#6B6963` | Texto secundário |
| `neutral-900` | `#141414` | Texto primário |
| `neutral-950` | `#0D0D0D` | Preto absoluto (seções de contraste, CTAs) |

### Cores Semânticas

| Token | Mapeado para | Função |
|---|---|---|
| `color-background` | `neutral-50` | Fundo principal das páginas |
| `color-surface` | `neutral-0` | Cards, painéis, containers elevados |
| `color-surface-inverse` | `neutral-950` | Seções editoriais de destaque (blocos pretos) |
| `color-text-primary` | `neutral-900` | Títulos e corpo de texto |
| `color-text-inverse` | `neutral-0` | Texto sobre fundo preto |
| `color-text-muted` | `neutral-600` | Legendas, metadados, labels secundárias |
| `color-border` | `neutral-200` | Bordas de cards, inputs, chips |
| `color-accent` (ação) | `neutral-950` | Botões primários (pill preto), estados ativos |
| `color-success` | `#2E7D4F` (inferido) | Disponibilidade / confirmações |
| `color-warning` | `#B8862E` (inferido) | Estados "reservado", alertas leves |
| `color-error` | `#B23B3B` (inferido) | Estados de erro (não observado diretamente) |

> Não há uso de cor saturada como identidade — a marca se apoia em preto/branco/neutros. Cor é reservada estritamente a badges de status pontuais.

---

## 3. Tipografia

- **Estilo geral:** Sans-serif grotesk, geométrica, sem serifas — peso variando de regular a bold com saltos marcados entre níveis.
- **Hierarquia:**
  - `H1` — grande, bold, tracking levemente negativo (títulos editoriais, ex: "Carros que não se encontram.")
  - `H2` — médio-bold, usado em nomes de veículos e títulos de seção
  - `Body` — regular, texto corrido de descrições
  - `Caption / Eyebrow` — uppercase, tamanho pequeno, letter-spacing amplo (ex: "COLEÇÃO · SHOWROOM SÃO PAULO")
- **Distribuição de peso:** contraste forte entre bold (headlines) e regular (corpo), sem pesos intermediários visíveis.
- **Tendência de espaçamento:** tight no corpo de texto, loose e uppercase nos labels/eyebrows.

---

## 4. Espaçamento e Layout

- **Escala de espaçamento sugerida:** `4 / 8 / 16 / 24 / 32 / 48 / 64`
- **Densidade:** balanceada a espaçosa — respiro generoso entre cards e seções.
- **Grid:** estrutura de 12 colunas; grade de cards em 3 colunas no catálogo, com sidebar de filtros fixa lateral.
- **Ritmo vertical:** seções alternam fundo claro/escuro em blocos cheios (full-bleed), criando pausas visuais fortes entre conteúdos.

---

## 5. Formas e Linguagem de UI

- **Border radius:**
  - Cards e imagens: sutil (`8–12px`)
  - Botões e chips de filtro: **pill** (totalmente arredondado)
- **Stroke:** fino (`1px`), usado em chips não-selecionados e divisores
- **Estilo de componente:** flat — sem elevação/gradiente, distinção por preenchimento sólido (preto = ativo/primário) vs. contorno (inativo/secundário)

---

## 6. Detalhes Visuais

- **Sombras:** nenhuma ou quase imperceptível — o sistema evita profundidade artificial
- **Bordas:** sutis, `neutral-200`, usadas para delimitar cards e inputs sem criar peso visual
- **Decorações:** ausentes — sem gradientes, ruído ou blur; toda a riqueza visual vem da fotografia dos veículos e do contraste tipográfico
- **Badges/Tags:** pills pequenas com texto uppercase (ex: "RARO", "NOVO", "RESERVADO", "ÚLTIMA UNIDADE"), fundo claro com borda fina

---

## 7. Contraste e Acessibilidade

- **Nível de contraste:** alto — preto quase puro sobre branco/off-white, e o inverso em blocos de destaque
- **Abordagem de legibilidade:** hierarquia construída por peso e tamanho tipográfico, não por cor
- **Uso de cor para hierarquia:** cor é evitada como sinalizador primário; ênfase vem de preto sólido vs. neutros claros

---

## Notas Finais

- Sistema deve permanecer estritamente monocromático + neutros, com cor reservada a badges funcionais pontuais.
- Priorizar espaço em branco generoso e blocos de contraste total (preto/branco) como recurso editorial de ritmo.
- Fotografia de produto (carros) deve sempre estar isolada, sem fundo complexo, para manter a limpeza do sistema.
- Este sistema deve funcionar tanto para páginas de catálogo (data-dense) quanto para páginas editoriais (storytelling), mantendo a mesma linguagem tipográfica e de espaçamento.
