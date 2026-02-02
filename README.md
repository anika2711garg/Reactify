# Reactify ⚡️

**Reactify** is an AI-powered tool that transforms any website URL or screenshot into production-ready React + Tailwind CSS components. It scrapes website content, allows you to select specific sections, and uses advanced AI to generate clean, responsive code.

**🌐 Live Demo:** [https://drive.google.com/file/d/1ZE6uiDaW4oSKuaDjvUVfflyeTkAJhY5H/view?usp=drive_link](#)

## Here is the Deployed Link
https://reactify-3f22.vercel.app/

## 🚀 Features

### Core Functionality
- **URL to Component:** Paste a URL, select a section, and get code.
- **Screenshot Fallback:** Automatically handles screenshots if text scraping fails.
- **Live Preview:** Real-time rendering of generated code with a mobile/desktop toggle.
- **Iterative Refinement:** Chat with the AI to tweak the design (e.g., "Make the background blue").

### UI & UX
- **Style Selector:** Choose from **Minimal**, **Modern**, **Dense**, or **Brutalist** variants.
- **History & Saving:** Your generated components are automatically saved locally.
- **Comparison Mode:** Toggle between the "Original" screenshot and the "Code" preview.
- **Export:** One-click download of `.tsx` files.
- **Tooltips:** Helpful on-hover explanations for all key features.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Models:**
  - **Groq (Llama 3):** For ultra-fast initial code generation.
  - **Google Gemini 1.5 Pro:** For multimodal understanding (screenshots) and complex logic.
- **Scraping:** Puppeteer / Playwright (Server-side).

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/reactify.git
    cd reactify
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    
5.  **Open your browser:**
    Navigate to `http://localhost:3000` to start building!




