
import { GoogleGenAI } from "@google/genai";
import { Prospect, GroundingSource, InteractionAnalysis, SearchSource } from '../types';

const model = "gemini-2.5-flash";

const persona = `Você é um copywriter especialista em prospecção de vendas B2B para gestores de tráfego, analista de marketing digital, analista de mídias sociais, copywriter, analista de SEO, e designer de marketing digitas, com foco em análise profunda de presença digital e conversão de leads via WhatsApp.`;

export interface ApiCredentials {
  apiKey: string;
  provider: 'gemini' | 'openai';
}

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
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    let text = response.text.trim();
    // Use a more robust regex to find the JSON object, even if there's text before/after.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
      if (!parsed.greeting || !parsed.mainMessage || !parsed.closingMessage) {
        // Log the problematic response for easier debugging
        console.error("IA response is missing required keys:", text);
        throw new Error("A resposta da IA está incompleta ou em formato inesperado.");
      }
    } catch (err) {
      console.error("Resposta inválida da IA:", text);
      throw new Error("A IA retornou um JSON inválido. Tente novamente com um prompt diferente.");
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao chamar a IA:", error);
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar mensagem: ${error.message}`);
    }
    throw new Error("Erro inesperado ao processar a mensagem.");
  }
}

export async function getFunnelSuggestion(
  prospect: Prospect,
  apiCredentials: ApiCredentials
): Promise<string> {
  const ai = await getClient(apiCredentials);
  const stageMap = {
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
`;

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    const text = response.text.trim();
    if (!text) {
      return "Não foi possível gerar uma sugestão no momento.";
    }
    return text.replace(/"/g, ''); // Remove quotes
  } catch (error) {
    console.error("Erro ao gerar sugestão de funil:", error);
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar sugestão: ${error.message}`);
    }
    throw new Error("Erro desconhecido ao gerar sugestão.");
  }
}

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
`;

  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    
    let text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }


    if (!text) {
      throw new Error("A IA não retornou um resultado válido.");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao analisar a interação:", error);
    if (error instanceof Error) {
      throw new Error(`Falha ao analisar interação: ${error.message}`);
    }
    throw new Error("Erro inesperado ao analisar a interação.");
  }
}


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
1.  **Ponto de Partida:** Sua busca DEVE começar diretamente na plataforma Instagram (instagram.com). Use a busca do Instagram para encontrar perfis PÚBLICOS e COMERCIAIS que correspondam à consulta do usuário.
2.  **Qualificação:** Um perfil é um bom prospect se for claramente um negócio (não conta pessoal), com biografia completa e, idealmente, um link ou informações de contato.
3.  **Extração de Dados:** Após validar o perfil do Instagram, use o conteúdo desse perfil (bio, posts) e o link no perfil para encontrar o site oficial, telefone, etc.
`);
  }

  if (searchSources.includes('google')) {
      sourceInstructions.push(`
**Instruções para Busca no Google:**
1.  **Fonte da Verdade:** Sua primeira tarefa é usar a Busca Google para encontrar o SITE OFICIAL do prospect. Este site é a fonte primária de informações.
2.  **Validação de Canais:** Após encontrar o site, inspecione seu conteúdo (rodapé, cabeçalho, página de contato) para extrair o link EXATO do Instagram e o número de WhatsApp.
`);
  }

  const prompt = `
Atue como um prospectador de clientes B2B experiente e minucioso, com foco total em qualidade e veracidade das informações. Seu objetivo é encontrar e entregar somente prospects reais e qualificados, com todos os canais e contatos corretos. Sua prioridade é qualidade, não quantidade. Prefira entregar menos leads (entre 5 a 10), mas todos 100% verificados e reais.

**Plano de Execução da Busca (Siga estas regras rigorosamente):**
${sourceInstructions.join('\n')}

**Regras de Validação e Qualidade (Aplicam-se a TODAS as buscas):**
- **VALIDAÇÃO CRÍTICA DO INSTAGRAM:** Antes de retornar QUALQUER \`instagramUrl\`, você DEVE verificar internamente se a URL leva a um perfil PÚBLICO e ATIVO. Se você encontrar uma página que diz "Esta página não está disponível", "Sorry, this page isn't available", ou qualquer erro similar, você está PROIBIDO de usar essa URL. O campo \`instagramUrl\` DEVE ser \`null\`. Não há exceções a esta regra.
- **Jamais Invente Dados:** A precisão é mais importante que o preenchimento. Se um dado não puder ser validado, o campo correspondente será \`null\`.
- **Validação do WhatsApp:** O número encontrado deve estar ativo, vinculado ao prospect, e OBRIGATORIAMENTE formatado no padrão internacional E.164 (ex: +5521999999999) usando a Localização informada (${location}) como referência para o código do país.
- **Qualidade Acima de Tudo:** Não entregue dados parciais. Somente envie prospects completos e 100% verificados.

Após a prospecção validada, atue como o seguinte especialista para analisar cada prospect:
${persona}

Sua missão combinada é encontrar entre 5 e 10 negócios relevantes e entregar uma análise completa para cada um, ajudando o usuário a decidir se vale a pena investir tempo e como converter o cliente.

**Busca do Usuário:**
- Consulta: ${userQuery}
- Localização: ${location}
- Fontes: ${searchSources.join(', ')}

**Para cada prospect encontrado, realize a seguinte análise:**
1.  **Análise do Site/Landing Page:** Avalie se é voltado para alta conversão, a clareza do CTA e possíveis melhorias.
2.  **Análise do Instagram:** Avalie a BIO, link na bio, uso de destaques, qualidade do feed e frequência de posts.
3.  **Verificação de Anúncios e Pixel:** Verifique se há indícios de anúncios ativos (Google, Facebook, Instagram) e a instalação de pixels de rastreamento.
4.  **Análise do Google Meu Negócio (GMN):** Investigue minuciosamente se o prospect possui um perfil no GMN. Se sim, avalie a completude do perfil (horários, fotos de qualidade, posts recentes), a quantidade e a qualidade das avaliações (reviews) e se o negócio responde a elas. Se não tiver um perfil ou se ele estiver mal otimizado, destaque isso como uma grande oportunidade de melhoria.
5.  **Análise do Google Local Services (GLS) - CONDICIONAL:** APENAS para prospecções em países onde o serviço está disponível (como EUA, Canadá, e países europeus selecionados), investigue se o prospect tem um perfil ativo no GLS e se possui os selos "Google Guaranteed" ou "Google Screened". Se não tiver, isso é uma oportunidade CRÍTICA. **Essa análise DEVE ser incluída no 'analysisBreakdown'.**

**Formato de saída OBRIGATÓRIO (JSON apenas, sem texto adicional):**
[
  {
    "name": "string (Nome do negócio)",
    "description": "string (Descrição curta e objetiva do que o negócio faz)",
    "phone": "string (Telefone para contato. OBRIGATÓRIO formatar no padrão internacional E.164, como +5521999999999, usando a localização (${location}) como referência para o código do país)",
    "address": "string | null (Endereço físico real e validado, se disponível)",
    "website": "string | null",
    "instagramUrl": "string | null (URL completa e VALIDADA de um perfil ATIVO)",
    "aiScore": "number (de 0 a 100). IMPORTANTE: Quanto MAIS problemas e oportunidades de melhoria você encontrar (site ruim, sem pixel, instagram fraco, GMN/GLS inexistente ou ruim), MAIOR deve ser o score, pois representa maior potencial para o vendedor. Um score baixo (ex: < 30) significa que o prospect já está bem otimizado e é uma prioridade menor.",
    "nextRecommendedAction": "string (A principal próxima ação recomendada para o vendedor)",
    "analysis": "string (Um resumo conciso da sua Análise, destacando pontos do Site, Instagram, Anúncios/Pixel, GMN e, se aplicável, GLS. Ex: 'Site lento, mas com um perfil GMN forte e mal aproveitado, e sem presença no Google Local Services.')",
    "analysisBreakdown": [
      {
        "finding": "string (Um ponto forte ou oportunidade encontrada. Incluir achados sobre GMN e GLS aqui.)",
        "evidence": "string (A evidência que comprova o achado, ex: 'O GMN não tem posts há 3 meses' ou 'Não foi encontrado um perfil no Google Local Services para este negócio.')"
      },
      {
        "finding": "string (Um ponto fraco ou desafio encontrado)",
        "evidence": "string (A evidência que comprova o achado)"
      }
    ],
    "improvementSuggestions": "string (Liste exatamente 3 melhorias prioritárias em formato de texto, separadas por quebra de linha (\\n). Se houver problemas no GMN ou GLS, uma das sugestões DEVE ser sobre isso.)"
  }
]
`;

  try {
    const googleSearchTool = { googleSearch: {} };

    const config: { tools?: { googleSearch: {} }[] } = {};
    if (searchSources.includes('google') || searchSources.includes('instagram')) {
      config.tools = [googleSearchTool];
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const text = response.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Invalid JSON response from findProspects:", text);
      throw new Error("A IA não retornou uma lista de prospects válida.");
    }
    const jsonString = jsonMatch[0];

    const rawProspects = JSON.parse(jsonString);
    const filtered = rawProspects.filter((p: any) => p.phone && p.name);

    const prospects: Prospect[] = filtered.map((p: any) => ({
      ...p,
      phone: p.phone.toString(),
      address: p.address || null,
      status: 'new',
      aiScore: p.aiScore || 50,
      analysisBreakdown: p.analysisBreakdown || [],
      nextRecommendedAction: p.nextRecommendedAction || 'Iniciar contato',
      improvementSuggestions: p.improvementSuggestions || '',
      analysis: p.analysis || '',
      website: p.website || null,
      instagramUrl: p.instagramUrl || null,
    }));

    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(
        (c): c is GroundingSource => !!(c && c.web?.uri)
      ) || []) as GroundingSource[];

    return { prospects, sources };
  } catch (err) {
    console.error("Erro ao buscar prospects:", err);
    throw new Error("A IA falhou ao buscar prospects. Refine sua busca ou tente novamente.");
  }
}
