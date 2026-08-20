# Reactify

**Interface → React + Tailwind.** Paste a public URL or a screenshot. Reactify scrapes or reads the image, lets you pick a section, and returns a runnable component with live preview, code, and chat refine.

**Deployed app:** [https://reactify-3f22.vercel.app/](https://reactify-3f22.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-white?style=flat-square&logo=vercel&logoColor=black)](https://reactify-3f22.vercel.app/)

---

## Pipeline

```
URL | screenshot
        │
        ▼
  scrape / vision          POST /api/scrape  ·  /api/generate
        │
        ▼
  section picker           ranked semantic blocks (hero, article, nav, …)
        │
        ▼
  Groq → Gemini fallback   JSX + Tailwind, JS only
        │
        ▼
  workspace                Source · Preview (react-live) · Code
        │
        ▼
  refine                   local edits or POST /api/iterate  →  Keep / Discard
```

## Capabilities

| Surface | What it does |
| --- | --- |
| **URL ingest** | Cheerio scrape with browser-like headers. Cloudflare / 403 sites should use Screenshot. |
| **Screenshot ingest** | Upload, drop, or paste (`Ctrl+V` / `⌘V`). Gemini vision reconstructs layout, copy, and color. |
| **Section picker** | Choose which part of the page to generate first. No full-site dump. |
| **Live preview** | `react-live` iframe-free canvas, viewport presets, original vs generated compare. |
| **Code panel** | Sanitized JSX, copy, component tree from Babel AST. |
| **Chat refine** | “Change text colour to green”, spacing, minimal, motion. Preview stays until **Keep** or **Discard**. |
| **History** | Local generations, save, duplicate, restore. |

Style presets: **Minimal · Modern · Dense · Brutalist**. Advanced options cover framework flavor, responsive bias, and granularity.

## Architecture

```
app/
  api/scrape     HTML fetch + section extract
  api/generate   HTML or screenshot → component
  api/iterate    instruction + optional screenshot rematch
  api/tree       JSX → component tree
  api/status     { groq, google }  (booleans only)
lib/
  ai.ts          Groq OpenAI-compat, then Gemini REST
  ai/env.ts      GROQ_API_KEY · GOOGLE_API_KEY aliases
  scrape.ts      fetch + block-page handling
  parse.ts       semantic rank + compact HTML
  parser/        Babel walk + instrumented preview paths
```

**Providers.** Groq (`openai/gpt-oss-20b` and fallbacks) for fast text. Gemini (`gemini-3.6-flash` and fallbacks) for vision and quota failover. Retired IDs (`gemini-1.5-*`, `gemini-2.0-*`, `llama-3.1-8b-instant`, …) are skipped.

**Preview contract.** Output is JavaScript JSX only. Imports, TypeScript, and markdown fences are stripped. Truncated drafts are closed or rewritten so `react-live` does not render raw source.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript 5 |
| UI | Tailwind CSS v4, Framer Motion, Lucide |
| Preview | react-live, prism-react-renderer |
| AST | @babel/parser, traverse, generator |
| Scrape | cheerio (no headless browser on Vercel) |
| Models | Groq Chat Completions + Gemini `generateContent` |

## Local setup

```bash
git clone https://github.com/anika2711garg/Reactify.git
cd Reactify
npm install
```

Create `.env.local` next to `package.json`:

```env
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AIza...
```

Optional: `GROQ_MODEL`, `GEMINI_MODEL`. Keys stay server-side. `NEXT_PUBLIC_*` aliases exist only as a fallback.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If 3000 is taken, Next will bind the next free port.

```bash
npm run build
```

## Production (Vercel)

The live instance is **[reactify-3f22.vercel.app](https://reactify-3f22.vercel.app/)**.

`.env.local` is gitignored and is not uploaded. In Vercel → **Settings → Environment Variables** add for **Production** (and Preview if you use it):

| Name | Required |
| --- | --- |
| `GROQ_API_KEY` | Yes |
| `GOOGLE_API_KEY` | Yes (screenshot / vision) |
| `GROQ_MODEL` / `GEMINI_MODEL` | No |

Redeploy after changing variables. Confirm keys loaded at `/api/status` — you want `"groq": true` and `"google": true`.

## API

| Method | Route | Body |
| --- | --- | --- |
| `POST` | `/api/scrape` | `{ url }` |
| `POST` | `/api/generate` | `{ html?, screenshot?, style, requirements, mode }` |
| `POST` | `/api/iterate` | `{ currentCode, instruction, screenshot? }` |
| `POST` | `/api/tree` | `{ code }` |
| `GET` | `/api/status` | — |

## Limits

- Sites behind Cloudflare often return 403 — use the Screenshot tab.
- Generated files stay compact so preview and refine do not truncate mid-`className`.
- Screenshot reconstruction needs a working `GOOGLE_API_KEY` on the server that serves the request.

## Contact

[anika7work@gmail.com](mailto:anika7work@gmail.com)
