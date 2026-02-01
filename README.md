# Website → React Component Generator

A production-ready tool for creators to turn website sections into clean, editable React + Tailwind components using AI.

![CleanShot 2024-01-31 at 13 00 00](https://github.com/placeholder-image-url.png)

## 🚀 Features

-   **URL Scraping**: Enter any public URL to extract its structure.
-   **Smart Section Detection**: Automatically identifies Hero, Features, Pricing, and other logical sections.
-   **AI Generation**: Converts raw HTML into production-ready React (TypeScript) + Tailwind CSS code.
-   **Live Preview**: Real-time rendering of generated components.
-   **Iterative Refinement**: Chat-style interface to tweak designs (e.g., "Make the button blue", "Reduce padding").
-   **Code Export**: Copy clean, accessible TSX code.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS v4, Lucide Icons.
-   **Preview Engine**: `react-live` for safe in-browser rendering.
-   **Backend**: Next.js API Routes (Node.js).
-   **Scraping**: Playwright (Headless Browser) + Cheerio (HTML Parsing).
-   **AI**: OpenAI API (GPT-4o) for intelligent code generation.

## 🏗 Architecture

### 1. Scraping Pipeline (`/api/scrape`)
-   **Playwright**: Launches a headless Chromium instance to load the page. We use `waitUntil: 'domcontentloaded'` and a short `networkidle` wait to ensure dynamic content is captured.
-   **Cheerio**: cleaner and parser.
    -   Removes scripts, trackers, and ads.
    -   Heuristics: Identifies sections based on `<section>`, `<header>`, `<footer>` tags and class names like "hero", "feature", etc.

### 2. Component Generation (`/api/generate`)
-   **System Prompt**: Enforces strict TypeScript + Tailwind-only rules.
-   **Input**: Receives specific HTML section.
-   **Output**: Functional React component string.

### 3. Iteration Engine (`/api/iterate`)
-   **Context**: Takes the *current* code and a user *instruction*.
-   **AI**: Applies the requested changes without rewriting the entire logic.

## 📦 Setup & Installation

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    npx playwright install chromium
    ```
3.  **Environment Variables**:
    Create `.env.local` and add:
    ```env
    OPENAI_API_KEY=sk-...
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## ⚠️ Known Limitations

1.  **Complex SPAs**: Sites that require extensive interaction or login to view content are blocked.
2.  **Styles**: We do not scrape external CSS files due to complexity. The AI approximates the *visual vibe* based on the HTML structure and standard Tailwind classes.
3.  **Images**: We use the original image URLs. If the source site blocks hotlinking, images may not load.
4.  **Security**: The generated code is evaluated in the browser. While we intend for it to be safe, avoid pasting malicious HTML instructions.

## 🧠 AI Prompt Strategy

We use a specialized "Frontend Expert" system prompt that prioritizes:
-   **Maintainability**: Prefer standard Tailwind classes over arbitrary values.
-   **Responsiveness**: Always adding `md:` and `lg:` modifiers.
-   **Accessibility**: Using semantic HTML tags.

---

Built for the **Intern Assignment**.
