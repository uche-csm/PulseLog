import { GoogleGenAI, Type } from "@google/genai";
import { Account, AIAnalysis } from '../types';

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export async function analyzeAccountSentiment(account: Account): Promise<AIAnalysis> {
  const ai = getAI();
  const interactionsSummary = account.interactions.map(i => 
    `Date: ${i.date}, Tone: ${i.tone}, Type: ${i.type}, Discussion: ${i.discussionPoints}, Risks: ${i.risks}, Opportunities: ${i.opportunities}, NPS: ${i.nps}`
  ).join('\n---\n');

  const prompt = `
    Analyze the following customer health metrics and interaction history for account "${account.name}". 
    You are the "Strategic Advisor to Uchechukwu Precious, a Customer Success Manager" with 20 years of Enterprise experience.
    
    CRITICAL HEALTH DATA:
    - Net Promoter Score (NPS): ${account.metrics.nps}/10
    - Multi-threading Score: ${account.metrics.multiThreadingScore}/10 (Stakeholder coverage)
    - Health Score: ${account.metrics.healthScore}%
    - Expansion Pipeline: $${account.metrics.expansionPipeline}
    - Final Days to Renewal: ${account.metrics.daysToRenewal}
    - Strategic Alignment: ${account.metrics.strategicAlignment}%
    - Engagement: ${account.metrics.engagementLevel}

    INTERACTION LOGS:
    ${interactionsSummary}
    
    As a seasoned executive with 20 years of experience, identify:
    1. THE PROBLEM: Immediate risk signals or blockers.
    2. ACCOUNT HISTORY: Contextual patterns in their interaction history.
    3. THE SOLUTION: High-leverage strategic playbooks.

    Your tone should be authoritative, strategic, and concise. 
    The "summary" field in the return JSON should follow this structure exactly: 
    "PROBLEM: [Observation]. HISTORY: [Context]. SOLUTION: [Strategic Recommendation]."
    
    Return a strategic analysis in JSON format exactly matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, enum: ['Rising', 'Declining', 'Stable', 'Volatile'] },
            summary: { type: Type.STRING },
            riskSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunitySignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            churnRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            expansionPotential: { type: Type.STRING, enum: ['None', 'Low', 'Medium', 'High'] },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['trend', 'summary', 'riskSignals', 'opportunitySignals', 'churnRisk', 'expansionPotential', 'recommendedActions']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback logic
    return {
      trend: 'Stable',
      summary: 'PROBLEM: Data sync delay. HISTORY: Regular quarterly reviews. SOLUTION: Engage executive stakeholder.',
      riskSignals: [],
      opportunitySignals: [],
      churnRisk: 'Low',
      expansionPotential: 'None',
      recommendedActions: ['Manual review required']
    };
  }
}

export async function chatWithAdvisor(account: Account, query: string): Promise<string> {
  const ai = getAI();
  const interactionsSummary = account.interactions.map(i => 
    `Date: ${i.date}, Tone: ${i.tone}, Type: ${i.type}, Discussion: ${i.discussionPoints}, Notes: ${i.notes}`
  ).join('\n---\n');

  const prompt = `
    You are an elite AI Strategy Assistant for a Customer Success Manager named Uchechukwu Precious.
    You have all the data about the account "${account.name}".
    
    ACCOUNT DESCRIPTION: ${account.description}
    HEALTH SCORE: ${account.metrics.healthScore}%
    NPS: ${account.metrics.nps}
    RENEWAL DAYS: ${account.metrics.daysToRenewal}
    
    INTERACTION HISTORY:
    ${interactionsSummary}
    
    USER QUERY: "${query}"
    
    Your task:
    1. If they ask for an email draft, write a high-stakes, professional, and empathetic email.
    2. If they ask for a playbook, provide a step-by-step strategic guide.
    3. If they ask a general question, answer as a brilliant strategic advisor.
    
    Tone: Authoritative, polished, and executive-ready.
    Response should be in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "I apologize, I'm having trouble connecting to the strategy core. Please try again in a moment.";
  }
}
