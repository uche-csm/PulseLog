import { GoogleGenAI, Type } from "@google/genai";
import { Account, AIAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeAccountSentiment(account: Account): Promise<AIAnalysis> {
  const interactionsSummary = account.interactions.map(i => 
    `Date: ${i.date}, Tone: ${i.tone}, Type: ${i.type}, Discussion: ${i.discussionPoints}, Risks: ${i.risks}, Opportunities: ${i.opportunities}, NPS: ${i.nps}`
  ).join('\n---\n');

  const prompt = `
    Analyze the following customer health metrics and interaction history for account "${account.name}".
    
    HEALTH DATA:
    - NPS: ${account.metrics.nps}/10
    - CSAT: ${account.metrics.csat}/5
    - Health Score: ${account.metrics.healthScore}%
    - Ticket Volume: ${account.metrics.ticketVolume}
    - Open High Priority Tickets: ${account.metrics.openHighPriorityTickets}
    - Last QBR: ${account.metrics.lastQBRDate} (Missed: ${account.metrics.isQBRMissed})
    - Product Usage: ${account.metrics.productUsageScore}%
    - Engagement: ${account.metrics.engagementLevel}
    - Last Touch: ${account.metrics.lastTouch}

    INTERACTION HISTORY:
    ${interactionsSummary}
    
    As the Chief of Customer Success, identify specific risk signals (e.g. "Support ticket spike", "Missed QBR") and expansion opportunities.
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
      summary: 'Analysis currently unavailable. Please check back shortly.',
      riskSignals: [],
      opportunitySignals: [],
      churnRisk: 'Low',
      expansionPotential: 'None',
      recommendedActions: ['Manual review required']
    };
  }
}
