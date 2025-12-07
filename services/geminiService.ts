
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";
import { maskPII, unmaskPII } from "./piiService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A comprehensive, clear, and professional executive summary of the document (STRICTLY IN ENGLISH). Max 2 paragraphs.",
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
            description: "Legal explanation of why this is a risk (STRICTLY IN ENGLISH). Concise and professional."
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
      description: "Critical dates in the contract (Effective Date, Expiration, Auto-Renewal, etc.) in English format."
    },
    parties: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Parties to the contract (Entities and Persons)."
    }
  },
  required: ['summary', 'riskScore', 'risks']
};

export const analyzeContract = async (text: string): Promise<AnalysisResult> => {
  // 1. PII Redaction (Client-Side)
  // Mask sensitive data BEFORE sending to API
  const { maskedText, piiMap } = maskPII(text);

  // Truncate text to fit context window efficiently
  const safeText = maskedText.slice(0, 500000); 

  const prompt = `
    You are the Senior Legal Analyst Engine for "LegalShield AI".
    Your Mission: Scan the following contract text to identify corporate risks and reduce operational load.
    
    === LANGUAGE PROTOCOL (CRITICAL) ===
    1. **OUTPUT LANGUAGE:** All "summary", "description", and "category" fields MUST be written in **ENGLISH**.
    2. **INPUT LANGUAGE:** The source text might be in English, Turkish, or another language.
    3. **QUOTES:** When extracting the "quote", keep it exactly in the **ORIGINAL LANGUAGE** of the document. Do not translate the quote.
    4. **ANALYSIS:** Analyze the meaning in the original language, but write your findings in English.

    === SECURITY & DATA PRIVACY PROTOCOL ===
    The text below contains placeholders like [REDACTED_ENTITY_1], [REDACTED_PERSON_1], [REDACTED_MONEY_1] etc.
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
    - For every risk identified, extract **PROOF (QUOTE)** from the text in the ORIGINAL LANGUAGE.
    - Assign a **Severity Score** (High/Medium/Low) to each risk. Clauses deviating from standard market conditions should be "High".
    - **Risk Score:** Rate the overall danger level of the document between 0-100.

    OUTPUT FORMAT:
    - Provide the response strictly in JSON format.
    - All descriptions must be in professional **Legal English**.
    - The summary must be concise, clear, and executive-focused (readable in 60 seconds).
    
    CONTRACT TEXT:
    ${safeText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Very low temperature for analytical precision
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AI response was empty.");

    // Parse the AI response (which contains masked placeholders)
    const maskedResult = JSON.parse(resultText);

    // 2. PII Restoration (Client-Side)
    // Replace placeholders with original data before showing to user
    const finalResult = unmaskPII(maskedResult, piiMap);

    return finalResult as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("An error occurred during contract analysis. Please try again.");
  }
};
