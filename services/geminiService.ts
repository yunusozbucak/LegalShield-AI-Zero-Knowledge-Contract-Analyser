import { AnalysisResult } from "../types";
import { maskPII, unmaskPII } from "./piiService";

/**
 * Masks PII in the browser, sends only the masked text to the server-side
 * /api/analyze function, then restores the original values locally.
 * The Gemini API key lives on the server and is never shipped to the client.
 */
export const analyzeContract = async (text: string): Promise<AnalysisResult> => {
  // 1. PII Redaction (Client-Side): real data never leaves the browser
  const { maskedText, piiMap } = maskPII(text);

  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: maskedText }),
    });
  } catch {
    throw new Error("Could not reach the analysis server. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(payload?.error || "An error occurred during contract analysis. Please try again.");
  }

  // 2. PII Restoration (Client-Side)
  return unmaskPII(payload, piiMap) as AnalysisResult;
};
