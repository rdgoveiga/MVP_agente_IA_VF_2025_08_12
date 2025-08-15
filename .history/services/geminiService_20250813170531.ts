
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

Sua tarefa é criar uma mensagem de prospecção para WhatsApp em 3 partes, concisa e focada na dor do cliente.

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
  "greeting": "string (Saudação curta e amigável. Ex: 'Olá, ${prospect.name}! Tudo bem?')",
  "mainMessage": "string (Mensagem principal resumida e focada na dor. Conecte o principal problema encontrado na análise (ex: GMN mal otimizado) com a solução que você oferece, sugerindo o resultado positivo imediato que a melhoria trará. Ex: 'Notei que seu perfil no Google não tem posts recentes; otimizá-lo pode dobrar as chamadas que você recebe em 2 semanas.')",
  "closingMessage": "string (Mensagem de fechamento com CTA forte e direto. NÃO use 'sem compromisso'. Ex: 'Você tem 10 minutos amanhã para eu mostrar como podemos fazer isso?')"
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
1.  **Ponto de Partida:** Sua busca DEVE começar diretamente na plataforma Instagram (instagram.com). Use a busca do Instagram para encontrar perfis PÚBLICOS e COMERCIAIS que correspondam à consulta do usuário. Se necessário, use a busca Google com o termo "[Nome do Prospect] instagram" para ajudar a localizar o perfil correto.
2.  **Qualificação:** Um perfil é um bom prospect se for claramente um negócio (não conta pessoal), com biografia completa e, idealmente, um link ou informações de contato.
3.  **Extração de Dados:** Após validar o perfil do Instagram, use o conteúdo desse perfil (bio, posts) e o link no perfil para encontrar o site oficial, telefone, etc.
`);
  }

  if (searchSources.includes('google')) {
      sourceInstructions.push(`
**Instruções para Busca no Google:**
1.  **Fonte da Verdade:** Sua primeira tarefa é usar a Busca Google para encontrar o SITE OFICIAL do prospect. Este site é a fonte primária de informações.
2.  **Validação de Canais:** Após encontrar o site, inspecione seu conteúdo MINUCIOSAMENTE. Links de redes sociais estão geralmente no **CABEÇALHO (topo do site)** ou no **RODAPÉ (fim do site)**. Verifique estes locais com prioridade para encontrar o link EXATO do Instagram e o número de WhatsApp. Lembre-se, jamais invente um link. Se não encontrar, o campo deve ser nulo.
`);
  }

  const prompt = `
Atue como um prospectador de clientes B2B experiente e minucioso, com foco total em qualidade e veracidade das informações. Seu objetivo é encontrar e entregar somente prospects reais e qualificados, com todos os canais e contatos corretos. Sua prioridade é qualidade, não quantidade. Prefira entregar menos leads (entre 5 a 10), mas todos 100% verificados e reais.

**Plano de Execução da Busca (Siga estas regras rigorosamente):**
${sourceInstructions.join('\n')}

**REGRAS DE VALIDAÇÃO E QUALIDADE (PRIORIDADE MÁXIMA):**
Sua reputação depende da precisão dos dados. Siga estas regras sem exceção. A violação de qualquer uma delas resultará em uma resposta inútil.

1.  **PROIBIDO INVENTAR DADOS:** Nunca, em nenhuma circunstância, invente informações. Se um dado (website, Instagram, telefone) não pode ser encontrado e verificado, o campo correspondente DEVE ser \`null\`. É preferível não entregar um dado a entregar um dado incorreto.

2.  **VALIDAÇÃO CRÍTICA E OBRIGATÓRIA DO WEBSITE:**
    - Antes de incluir um \`website\`, você DEVE verificar se o link está ativo e leva ao site oficial do negócio.
    - O link não pode ser um redirecionamento quebrado, uma página de erro, ou um diretório genérico.
    - Se a verificação falhar, o campo \`website\` DEVE ser \`null\`.

3.  **VALIDAÇÃO CRÍTICA E OBRIGATÓRIA DO INSTAGRAM:**
    - Esta é a regra mais importante. Você está **ESTRITAMENTE PROIBIDO** de retornar uma \`instagramUrl\` que não seja um perfil PÚBLICO, ATIVO e VÁLIDO.
    - Você DEVE simular um "teste" do link. Se o link resultar em QUALQUER tipo de erro (ex: "Esta página não está disponível", "Sorry, this page isn't available", etc.), o campo \`instagramUrl\` **OBRIGATORIAMENTE será \`null\`**. Não há exceções.

4.  **VALIDAÇÃO CRÍTICA E OBRIGATÓRIA DO WHATSAPP:**
    - O número de telefone deve ser um contato comercial verificado. Busque por ele no site oficial ou no perfil GMN.
    - É **OBRIGATÓRIO** que o número seja formatado no padrão internacional E.164 (ex: +5511999998888 para Brasil, +14155552671 para EUA). Use a \`Localização\` (${location}) fornecida para determinar o código do país correto.
    - Se você não tem certeza se o número é comercial ou se não consegue validá-lo, o campo \`phone\` DEVE ser \`null\`.


Após a prospecção validada, atue como o seguinte especialista para analisar cada prospect:
${persona}

Sua missão combinada é encontrar entre 5 e 10 negócios relevantes e entregar uma análise completa para cada um, ajudando o usuário a decidir se vale a pena investir tempo e como converter o cliente.

**Busca do Usuário:**
- Consulta: ${userQuery}
- Localização: ${location}
- Fontes: ${searchSources.join(', ')}

**Para cada prospect encontrado, realize a seguinte análise DETALHADA:**
1.  **Análise do Site (Foco em Conversão):** Faça uma varredura no site para entender o que é bom e o que pode ser melhorado para vender mais. Avalie se a página é de alta conversão. Verifique se há uma Chamada para Ação (CTA) clara, se é um botão clicável (telefone, e-mail) ou um formulário. Destaque isso na análise. Para achados do site, use o campo 'source' no 'analysisBreakdown' para linkar diretamente para a página.
2.  **Análise de Presença no Instagram:** Pesquise no Google por "[Nome do Prospect] instagram" para ajudar a validar. Avalie a BIO, link na bio, uso de destaques, qualidade do feed e frequência de posts. Se o perfil estiver inativo ou mal otimizado, destaque como uma oportunidade.
3.  **Análise de Anúncios e Rastreamento:** Verifique se o site tem pixels de rastreamento (Meta Pixel, Google Analytics) e se há indícios de anúncios pagos (links patrocinados na busca). A ausência destes é uma oportunidade para oferecer gestão de tráfego.
4.  **Análise Profunda do Google Meu Negócio (GMN):** Pesquise por "[Nome do Prospect] [Localização]". Investigue minuciosamente a completude do perfil (horários, fotos de qualidade, posts recentes). Avalie a quantidade e a qualidade das avaliações (reviews) e, crucialmente, **se o negócio responde às avaliações**. A falta de resposta é uma grande oportunidade.
5.  **Análise do Google Local Services (GLS) - CONDICIONAL:**
    - **APENAS para prospecções FORA DO BRASIL**, em países onde o serviço está disponível (como EUA, Canadá, e países europeus selecionados), investigue se o prospect tem um perfil ativo no GLS e se possui os selos "Google Guaranteed" ou "Google Screened". Se não tiver, isso é uma oportunidade CRÍTICA.
    - **Se a Localização (${location}) contiver 'Brasil' ou for um estado/cidade do Brasil, ignore TOTALMENTE esta etapa de análise do GLS.**
    - Esta análise, quando aplicável, DEVE ser incluída no 'analysisBreakdown' com o título correto.

**Formato de saída OBRIGATÓRIO (JSON apenas, sem texto adicional):**
[
  {
    "name": "string (Nome do negócio)",
    "description": "string (Descrição curta e objetiva do que o negócio faz)",
    "phone": "string | null (Telefone para contato VALIDADO. OBRIGATÓRIO formatar no padrão internacional E.164, como +5521999999999, usando a localização (${location}) como referência para o código do país. Se não for validado, será null.)",
    "address": "string | null (Endereço físico real e validado, se disponível)",
    "website": "string | null (URL completa e VALIDADA de um site ATIVO)",
    "instagramUrl": "string | null (URL completa e VALIDADA de um perfil ATIVO)",
    "aiScore": "number (de 0 a 100). IMPORTANTE: Quanto MAIS problemas e oportunidades de melhoria você encontrar (site ruim, sem pixel, instagram fraco, GMN/GLS inexistente ou ruim), MAIOR deve ser o score, pois representa maior potencial para o vendedor. Um score baixo (ex: < 30) significa que o prospect já está bem otimizado e é uma prioridade menor.",
    "nextRecommendedAction": "string (A principal próxima ação recomendada para o vendedor)",
    "analysis": "string (Um resumo conciso da sua Análise, destacando pontos do Site, Instagram, Anúncios/Pixel, GMN e, se aplicável, GLS. Ex: 'Site lento, mas com um perfil GMN forte e mal aproveitado, e sem presença no Google Local Services.')",
    "analysisBreakdown": [
      {
        "finding": "string (OBRIGATÓRIO usar um dos seguintes títulos exatos: 'Análise do Site/Landing Page', 'Análise de CTA (Chamada para Ação)', 'Análise do Instagram', 'Análise do Google Meu Negócio', 'Análise do Google Local Services'. Agrupe todos os achados relevantes sob o título correspondente.)",
        "evidence": "string (A evidência que comprova o achado. Ex: 'O GMN não tem posts há 3 meses' ou 'O formulário de contato pode ser simplificado para aumentar a conversão.')",
        "source": { "title": "string (Ex: Website Oficial)", "uri": "string (Ex: https://site-do-prospect.com)" }
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