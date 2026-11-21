# LegalShield AI

A privacy-first contract analysis engine: it analyses contracts with AI without keeping them on disk, and the session destroys itself when it ends.

**Live demo:** https://legalshieldai.vercel.app/

## How it works

1. **Upload:** The PDF is parsed in the browser (`services/pdfService.ts`) and never written to disk.
2. **Mask:** Personally identifiable information is redacted with regex patterns before anything leaves the browser (`services/piiService.ts`).
3. **Analyse:** Only the masked text is sent to a server-side Vercel Function (`api/analyze.ts`), which calls Google Gemini for a summary and a risk analysis grouped by category. The response uses the document's own language. The API key stays on the server and nothing is stored.
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
| `GEMINI_API_KEY` | Gemini API key (server-side only) |
| `API_KEY` | Alternative name, used for Vercel deployments |

The key is read only by `api/analyze.ts`; it is never bundled into the client. `npm run dev` serves `/api/analyze` locally through a small Vite middleware, so no extra tooling is needed.
