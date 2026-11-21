# LegalShield AI

A privacy-first contract analysis engine: it analyses contracts with AI without keeping them on disk, and the session destroys itself when it ends.

**Live demo:** https://legalshieldai.vercel.app/

## How it works

1. **Upload:** The PDF is parsed in the browser (`services/pdfService.ts`) and never written to disk.
2. **Mask:** Personally identifiable information is redacted with regex patterns before anything leaves the browser (`services/piiService.ts`).
3. **Analyse:** The masked text goes to Google Gemini for a summary and a risk analysis grouped by category (`services/geminiService.ts`). The response uses the document's own language.
4. **Self-destruct:** The results are shown in a session with a countdown timer. When it expires, the session data is wiped.

## Tech stack

React 19 · TypeScript · Vite · Google Gemini (`@google/genai`) · pdf.js · deployed on Vercel

## Getting started

Requires Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/yunusozbucak/LegalShield-AI-Zero-Knowledge-Contract-Analyser.git
cd LegalShield-AI-Zero-Knowledge-Contract-Analyser
npm install
cp .env.example .env.local   # then add your key
npm run dev                  # http://localhost:3000
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

### Environment variables

| Name | Description |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key for local development |
| `API_KEY` | Alternative name, used for Vercel deployments |

> ⚠️ Vite inlines this key into the client bundle at build time, so anyone who opens the deployed app can read it. Restrict the key (by HTTP referrer, with a quota) in Google AI Studio.
