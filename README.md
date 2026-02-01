# Website → React Component Generator

An intelligent tool for creators to instantly convert website sections into production-grade React + Tailwind components.

## 🚀 Live Demo

[Insert Live Demo URL Here]

## ✨ Features

-   **URL Scraping**: Extracts content and structure from public websites.
-   **Intelligent Parsing**: Automatically detects logical sections (Hero, Pricing, Testimonials).
-   **AI Generation**: Converts raw HTML into clean, accessible **React** components using **Tailwind CSS**.
-   **Live Preview**: Real-time rendering of generated code.
-   **Mobile/Desktop Toggle**: Test responsiveness instantly.
-   **Iterative Refinement**: Chat with the AI to tweak designs (e.g., "Make it dark mode").
-   **Export**: Download `.tsx` files directly.

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS v4
-   **AI**: Google Gemini 1.5 Flash (via Vercel AI SDK / Custom integration)
-   **Scraping**: Playwright + Cheerio
-   **Live Preview**: `react-live`
-   **Icons**: `lucide-react`

## 🏗️ Architecture

1.  **Scraping Layer (`/api/scrape`)**:
    -   Uses **Playwright** (headless) to fetch the full DOM, handling JS-heavy sites.
    -   Uses **Cheerio** to parse and verify section heuristics.

2.  **Generation Layer (`/api/generate`)**:
    -   Feeds cleaned HTML into **Gemini 1.5 Flash**.
    -   System prompt enforces strictly valid React + Tailwind code.

3.  **Iteration Layer (`/api/iterate`)**:
    -   Maintains context of the current code.
    -   Applies natural language transformations to the AST/Text.

4.  **Frontend**:
    -   **Workspace**: A split-pane IDE-like environment.
    -   **LivePreview**: Sandboxed component rendering.

## 📦 Setup & Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/component-generator.git
    cd component-generator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # Ensure Playwright browsers are installed
    npx playwright install chromium
    ```

3.  **Environment Variables**
    Create a `.env.local` file:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## ⚠️ Known Limitations

-   **Complex Interactivity**: The AI generates *UI structure* perfectly, but complex logic (carousels, tabs) might need manual wiring.
-   **Images**: Uses original URLs. If the source site has hotlink protection, images may not load.
-   **Auth Walls**: Only works on public URLS.
-   **Rate Limits**: Dependent on the AI provider's limits.

## 📷 Screenshots

*(Add screenshots of the Workspace and Input flow here)*
