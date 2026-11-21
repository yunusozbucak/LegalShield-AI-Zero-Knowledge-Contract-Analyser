import { GoogleGenAI, Type, Schema } from "@google/genai";

/**
 * POST /api/analyze
 * Runs on the server (Vercel Function), so the Gemini API key never reaches the browser.
 * Only PII-masked text is accepted. Nothing is stored; the text exists only for this request.
 */

const MAX_TEXT_LENGTH = 500_000;

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A comprehensive, clear, and professional executive summary of the document. MUST BE IN THE SAME LANGUAGE AS THE DOCUMENT. If the document is Turkish, WRITE THIS IN TURKISH. Max 2 paragraphs.",
    },
    riskScore: {
      type: Type.INTEGER,
      description: "Overall risk score between 0 (Safe) and 100 (High Risk).",
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: ['Termination', 'Liability', 'NDA', 'Jurisdiction', 'Other'],
            description: "Risk category (e.g., Termination, Liability)."
          },
          description: {
            type: Type.STRING,
            description: "Legal explanation of why this is a risk. MUST BE IN THE SAME LANGUAGE AS THE DOCUMENT. If the document is Turkish, WRITE THIS IN TURKISH. Concise and professional."
          },
          severity: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High'],
            description: "Commercial and legal severity level."
          },
          quote: {
            type: Type.STRING,
            description: "The original clause or sentence from the contract text that creates this risk. DO NOT TRANSLATE. Keep in original language."
          }
        },
        required: ['category', 'description', 'severity', 'quote']
      }
    },
    keyDates: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Critical dates in the contract (Effective Date, Expiration, Auto-Renewal, etc.)."
    },
    parties: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Parties to the contract (Entities and Persons)."
    }
  },
  required: ['summary', 'riskScore', 'risks']
};

const systemInstruction = `
    You are the Senior Legal Analyst Engine for "LegalShield AI".
    Your Mission: Scan the contract text to identify corporate risks and reduce operational load.
    
    === LANGUAGE PROTOCOL (CRITICAL) ===
    1. DETECT THE LANGUAGE of the provided contract.
    2. YOU MUST WRITE the "summary" and "description" fields in the EXACT SAME LANGUAGE as the contract.
       - If the contract is in TURKISH, write the summary and ALL descriptions in TURKISH!
       - If the contract is in ENGLISH, write in ENGLISH.
       - NEVER explain a Turkish contract in English.
    3. The "category" field must strictly remain one of the allowed English Enum values.
    4. When extracting the "quote", keep it exactly in the ORIGINAL LANGUAGE of the document. Do not translate the quote.

    === SECURITY & DATA PRIVACY PROTOCOL ===
    The text contains placeholders like [REDACTED_ENTITY_1], [REDACTED_PERSON_1], [REDACTED_MONEY_1] etc.
    These are CRITICAL SENSITIVE MASKS replacing real personal and commercial data.
    
    Strictly adhere to these rules:
    1. ACKNOWLEDGE: Assume these masks represent real valid names, amounts, and contact info.
    2. RISK ANALYSIS: Treat these fields as "fully defined valid data", not as anonymous or missing info.
    3. DETECTION: If you see "[REDACTED_ENTITY_1]" or "[REDACTED_PERSON_1]", record it as a "Party to the Contract".
    4. NO HALLUCINATION: Do NOT try to guess the real name or amount behind the mask.
    5. QUOTES: In "quote" fields, use the text exactly as is, including the masks ([REDACTED_...]).
    ========================================================

    Use the following "Critical Risk Vocabulary" to scan and analyze the text:

    1. **TERMINATION ANALYSIS:**
       - Is there a "Termination for convenience" clause?
       - Do "Short notice periods" create operational risk?
       - Is there a hidden "Auto-renewal" clause?
       - Are there heavy "Penalties" for early termination?

    2. **LIABILITY ANALYSIS:**
       - Is there "Unlimited liability"?
       - Are "Consequential damages" or "Lost profits" excluded?
       - Are there one-sided "Indemnification" obligations?

    3. **NDA & NON-COMPETE:**
       - Is the confidentiality duration "Perpetual"?
       - Is the "Non-compete" clause defined too broadly?

    4. **JURISDICTION:**
       - Is the dispute resolution location costly or distant (e.g., foreign arbitration)?

    TASKS:
    - For every risk identified, extract PROOF (QUOTE) from the text in the ORIGINAL LANGUAGE.
    - Assign a Severity Score (High/Medium/Low) to each risk. Clauses deviating from standard market conditions should be "High".
    - Risk Score: Rate the overall danger level of the document between 0-100.
    
    OUTPUT FORMAT:
    - Provide the response strictly in JSON format matching the schema.
    - The summary must be concise, clear, and executive-focused (readable in 60 seconds).
  `;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return json({ error: "Server is missing GEMINI_API_KEY." }, 500);
  }

  let text: unknown;
  try {
    ({ text } = await request.json());
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return json({ error: "'text' must be a non-empty string." }, 400);
  }

  const userPrompt = `
    Analyze the following contract. 
    CRITICAL REMINDER: Your response MUST be in the SAME LANGUAGE as this contract text. If the text is Turkish, your 'summary' and 'description' fields MUST be in Turkish.

    CONTRACT TEXT:
    ${text.slice(0, MAX_TEXT_LENGTH)}
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Very low temperature for analytical precision
      },
    });

    const resultText = response.text;
    if (!resultText) return json({ error: "AI response was empty." }, 502);

    return json(JSON.parse(resultText));
  } catch (error) {
    console.error("Gemini Analysis Error:", error instanceof Error ? error.message : error);
    return json({ error: "An error occurred during contract analysis. Please try again." }, 502);
  }
}
