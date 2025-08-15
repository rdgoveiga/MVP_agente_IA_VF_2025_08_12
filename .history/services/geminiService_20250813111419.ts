/** Tenta extrair JSON a partir de um texto da IA (com ou sem ```json ... ```). */
function safeJsonFromText(text: string) {
  if (!text) return null;

  // 1) Bloco markdown ```json
  const md =
    text.match(/```json([\s\S]*?)```/i) ||
    text.match(/```([\s\S]*?)```/); // fallback se vier sem "json"
  if (md && md[1]) {
    const s = md[1].trim();
    try { return JSON.parse(s); } catch {}
  }

  // 2) Diretamente (sem ruído)
  try { return JSON.parse(text); } catch {}

  // 3) Recorte entre a 1ª { e a última }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const slice = text.slice(start, end + 1);
    try { return JSON.parse(slice); } catch {}
  }

  // 4) Pula prefixos até a primeira linha que começa com {
  const lines = text.split('\n');
  const idx = lines.findIndex(l => l.trim().startsWith('{') || l.trim().startsWith('['));
  if (idx >= 0) {
    const rest = lines.slice(idx).join('\n');
    try { return JSON.parse(rest); } catch {}
  }

  return null;
}

import { GoogleGenAI } from "@google/genai";
import { Prospect, GroundingSource, InteractionAnalysis, SearchSource } from '../types';

const MODEL_ID = "gemini-2.5-flash";

const persona = `Você é um copywriter especialista em prospecção de vendas B2B para gestores de tráfego, analista de marketing digital, analista de mídias sociais, copywriter, analista de SEO, e designer de marketing digitas, com foco em análise profunda de presença digital e conversão de leads via WhatsApp.`;

export interface ApiCredentials {
  apiKey: string;
  provider: 'gemini' | 'openai';
}

/** Cliente Gemini (somente Google por enquanto) */
async function getClient(credentials: ApiCredentials): Promise<GoogleGenAI> {
  const { apiKey, provider } = credentials;
  if (provider !== 'gemini') {
    throw new Error("Somente o provedor Google Gemini é suportado no momento.");
  }
  if (!apiKey) {
    throw new Error("A chave de API do usuário não foi fornecida. Por favor, configure-a.");
  }
  return new GoogleGenAI({ apiKey });
}

/** Pega o texto de resposta, cobrindo variações do SDK. */
function getResponseText(resp: any): string {
  // seu código anterior usava resp.text; mantemos com fallback
  const t =
    (resp && typeof resp.text === 'string' && resp.text) ||
    (resp && resp.text && typeof resp.text === 'function' && resp.text()) ||
    (resp && resp.response && typeof resp.response.text === 'function' && resp.response.text()) ||
    '';
  return (typeof t === 'string' ? t : '').trim();
}

/** Normaliza sugestões de melhoria: aceita string[] ou string */
function normalizeImprovementSuggestions(v: any): string {
  if (Array.isArray(v)) return v.map(x => String(x)).join('\n');
  if (typeof v === 'string') return v;
  return '';
}

/** Normaliza breakdown: garante array de objetos {finding,evidence} */
function normalizeBreakdown(v: any): Array<{ finding: string; evidence: string }> {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((item: any) => ({
      finding: String(item?.finding ?? ''),
      evidence: String(item?.evidence ?? ''),
    }));
  }
  if (typeof v === 'object') {
    return [{
      finding: String((v as any).finding ?? ''),
      evidence: String((v as any).evidence ?? ''),
    }];
  }
  return [];
}

/** Sanitiza telefone para string (mantém + e dígitos) */
function normalizePhone(v: any): string | null {
  if (!v) return null;
  const s = String(v).replace(/[^\d+]/g, '');
  return s || null;
}

/* ===================== GERAÇÃO DE MENSAGEM ===================== */

export async function generateCustomMessage(
  prospect: Prospect,
  userMessageModel: string,
  apiCredentials: ApiCredentials
): Promise<{ greeting: string; mainMessage: string; closingMessage: string }> {
  const ai = await getClient(apiCredentials);
  const userContext = userMessageModel.trim()
    ? `**Contexto do Usuário (usar para agregar valor):**\n${userMessageModel}`
    : '';

  const prompt = `
${persona}

Sua tarefa é criar uma mensagem de prospecção para WhatsApp em 3 partes, com base nas informações abaixo.

${userContext}

**Dados do Prospect:**
- Nome: ${prospect.name}
- Setor: ${prospect.description}
- Análise da IA: ${prospect.analysis}
- Sugestões de Melhoria: ${prospect.improvementSuggestions}
- Site: ${prospect.website || 'Não informado'}
- Instagram: ${prospect.instagramUrl || 'Não informado'}

**Formato da resposta OBRIGATÓRIO (JSON Válido com 3 chaves):**
{
  "greeting": "A mensagem de abertura. Seja amigável e contextualizado.",
  "mainMessage": "A mensagem principal. Apresente valor claro, conectando com uma dor ou oportunidade da análise.",
  "closingMessage": "A mensagem de fechamento. Inclua uma chamada para ação (CTA) específica e clara."
}

Responda apenas com o JSON. NÃO adicione explicações ou texto adicional.
`.trim();

  try {
    const response = await (ai as any).models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });

    const text = getResponseText(response);
    const parsed = safeJsonFromText(text);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.greeting ||
      !parsed.mainMessage ||
      !parsed.closingMessage
    ) {
      console.error("Resposta inválida da IA (generateCustomMessage):", text);
      throw new Error("A IA retornou um JSON inválido ou incompleto.");
    }

    return parsed as { greeting: string; mainMessage: string; closingMessage: string };
  } catch (error) {
    console.error("Erro ao chamar a IA:", error);
    const msg = error instanceof Error ? error.message : 'erro desconhecido';
    throw new Error(`Falha ao gerar mensagem: ${msg}`);
  }
}

/* ===================== SUGESTÃO DE PRÓXIMA AÇÃO ===================== */

export async function getFunnelSuggestion(
  prospect: Prospect,
  apiCredentials: ApiCredentials
): Promise<string> {
  const ai = await getClient(apiCredentials);
  const stageMap: Record<string, string> = {
    new: 'Novo Prospect',
    contacted: 'Contato Iniciado',
    negotiating: 'Em Negociação',
    won: 'Contrato Fechado'
  };

  const currentStage = stageMap[prospect.status];

  const prompt = `
${persona}

Você também é um coach de vendas B2B. Com base nas informações do prospect e seu estágio no funil, gere a PRÓXIMA MELHOR AÇÃO recomendada para o vendedor.

**Dados do Prospect:**
- Nome: ${prospect.name}
- Análise da IA: ${prospect.analysis}
- Score de Potencial: ${prospect.aiScore}
- Estágio Atual no Funil: ${currentStage}

**Formato OBRIGATÓRIO:** Apenas uma string com a sugestão. Seja direto e acionável.
Exemplo: "Agendar uma chamada de 15 minutos para apresentar as 3 melhorias sugeridas."

Não adicione explicações ou markdown.
`.trim();

  try {
    const response = await (ai as any).models.generateContent({ model: MODEL_ID, contents: prompt });
    const text = getResponseText(response);
    return text ? text.replace(/^"+|"+$/g, '') : "Não foi possível gerar uma sugestão no momento.";
  } catch (error) {
    console.error("Erro ao gerar sugestão de funil:", error);
    const msg = error instanceof Error ? error.message : 'erro desconhecido';
    throw new Error(`Falha ao gerar sugestão: ${msg}`);
  }
}

/* ===================== ANÁLISE DE INTERAÇÃO ===================== */

export async function analyzeInteractionAndSuggestResponse(
  prospect: Prospect,
  conversationText: string,
  apiCredentials: ApiCredentials
): Promise<InteractionAnalysis> {
  const ai = await getClient(apiCredentials);
  const prompt = `
${persona}

Analise o histórico da conversa com o prospect abaixo. Identifique a objeção principal, sugira uma resposta estratégica para superá-la e defina a nova próxima ação.

**Dados do Prospect:**
- Nome: ${prospect.name}
- Análise prévia da IA: ${prospect.analysis}
- Estágio no Funil: ${prospect.status}

**Conversa:**
---
${conversationText}
---

**Formato OBRIGATÓRIO (JSON Válido):**
{
  "suggestedResponse": "string (a resposta para enviar ao prospect, quebrando a objeção)",
  "newNextAction": "string (a nova próxima ação para o vendedor após a resposta)"
}

Responda apenas com o JSON.
`.trim();

  try {
    const response = await (ai as any).models.generateContent({ model: MODEL_ID, contents: prompt });
    const text = getResponseText(response);
    const parsed = safeJsonFromText(text);

    if (!parsed || typeof parsed !== 'object' || !parsed.suggestedResponse || !parsed.newNextAction) {
      console.error("Resposta inválida da IA (analyzeInteraction):", text);
      throw new Error("A IA não retornou um JSON válido.");
    }
    return parsed as InteractionAnalysis;
  } catch (error) {
    console.error("Erro ao analisar a interação:", error);
    const msg = error instanceof Error ? error.message : 'erro desconhecido';
    throw new Error(`Falha ao analisar interação: ${msg}`);
  }
}

/* ===================== BUSCA DE PROSPECTS ===================== */

export async function findProspects(
  userQuery: string,
  searchSources: SearchSource[],
  location: string,
  apiCredentials: ApiCredentials
): Promise<{ prospects: Prospect[]; sources: GroundingSource[] }> {
  const ai = await getClient(apiCredentials);

  const sourceInstructions: string[] = [];

  if (searchSources.includes('instagram')) {
    sourceInstructions.push(`
**Instruções para Busca no Instagram:**
1.  **Ponto de Partida:** Sua busca DEVE começar diretamente no Instagram (instagram.com). Procure perfis PÚBLICOS e COMERCIAIS.
2.  **Qualificação:** Perfil é bom prospect se for claramente um negócio (não pessoal), com bio completa e link/contato.
3.  **Extração de Dados:** A partir do perfil válido, recupere site oficial, telefone e outros contatos.
`.trim());
  }

  if (searchSources.includes('google')) {
    sourceInstructions.push(`
**Instruções para Busca no Google:**
1.  **Fonte da Verdade:** Use a busca Google para encontrar o SITE OFICIAL do prospect.
2.  **Validação de Canais:** No site, extraia Instagram oficial e WhatsApp/Telefone corretos.
`.trim());
  }

  const prompt = `
Atue como um prospectador B2B minucioso. Entregue apenas prospects reais e validados (qualidade > quantidade).

**Plano:**
${sourceInstructions.join('\n')}

**Regras de Qualidade:**
- **Instagram:** Nunca retorne URL de perfil inexistente/inacessível. Se não validar, use null.
- **Não invente dados:** se não validar, deixe null.
- **WhatsApp/Telefone:** sempre formato internacional E.164 usando ${location} como referência.
- **Análise:** site, Instagram, anúncios/pixel, Google Meu Negócio (GMN) e, se aplicável, Google Local Services (GLS).

**Consulta do Usuário:** ${userQuery}
**Localização:** ${location}
**Fontes:** ${searchSources.join(', ')}

**Saída OBRIGATÓRIA (JSON apenas):**
[
  {
    "name": "string",
    "description": "string",
    "phone": "string no formato E.164",
    "address": "string | null",
    "website": "string | null",
    "instagramUrl": "string | null",
    "aiScore": number,
    "nextRecommendedAction": "string",
    "analysis": "string",
    "analysisBreakdown": [
      {"finding":"string","evidence":"string"}
    ],
    "improvementSuggestions": "string (3 itens separados por \\n)"
  }
]
`.trim();

  try {
    // habilita ferramenta de busca (seu código já usava esse formato)
    const googleSearchTool = { googleSearch: {} };
    const config: { tools?: { googleSearch: {} }[] } = {};
    if (searchSources.includes('google') || searchSources.includes('instagram')) {
      config.tools = [googleSearchTool];
    }

    const response = await (ai as any).models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config,
    });

    const text = getResponseText(response);
    const parsed = safeJsonFromText(text);

    const rawProspects: any[] =
      (Array.isArray(parsed) ? parsed :
        (parsed && Array.isArray((parsed as any).prospects) ? (parsed as any).prospects : [])) as any[];

    if (!Array.isArray(rawProspects) || rawProspects.length === 0) {
      console.error("Invalid JSON response from findProspects:", text);
      throw new Error("A IA não retornou uma lista de prospects válida.");
    }

    // Filtra mínimos e normaliza campos
    const filtered = rawProspects.filter((p: any) => p && (p.phone || p.whatsapp || p.telefone) && p.name);

    const prospects: Prospect[] = filtered.map((p: any) => {
      const phone = normalizePhone(p.phone ?? p.whatsapp ?? p.telefone);
      return {
        ...p,
        name: String(p.name ?? ''),
        description: String(p.description ?? ''),
        phone: phone || '',
        address: p.address ?? null,
        status: 'new',
        aiScore: Number.isFinite(p.aiScore) ? Number(p.aiScore) : 50,
        analysisBreakdown: normalizeBreakdown(p.analysisBreakdown),
        nextRecommendedAction: String(p.nextRecommendedAction ?? 'Iniciar contato'),
        improvementSuggestions: normalizeImprovementSuggestions(p.improvementSuggestions),
        analysis: String(p.analysis ?? ''),
        website: p.website ?? null,
        instagramUrl: p.instagramUrl ?? null,
      } as Prospect;
    });

    // Tenta extrair fontes/grounding se existir no objeto de resposta
    const candidates = (response as any)?.candidates ?? (response as any)?.response?.candidates ?? [];
    const chunks =
      candidates?.[0]?.groundingMetadata?.groundingChunks ??
      candidates?.[0]?.grounding_metadata?.grounding_chunks ??
      [];
    const sources = (chunks || [])
      .filter((c: any) => c?.web?.uri)
      .map((c: any) => ({ web: { uri: c.web.uri } })) as GroundingSource[];

    return { prospects, sources };
  } catch (err) {
    console.error("Erro ao buscar prospects:", err);
    throw new Error("A IA falhou ao buscar prospects. Refine sua busca ou tente novamente.");
  }
}
