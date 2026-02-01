# Technical Write-up

## 1. What was the hardest part?
The most challenging aspect was **ensuring the generated code is immediately runnable** in the `react-live` preview.
-   *The Problem*: AI often hallucinates imports or uses valid React patterns that `react-live` (which uses `Function()` under the hood) struggles with, like complex `export default` syntax or `import` statements.
-   *The Solution*: I built a robust regex-based "transpiler" in `LivePreview.tsx` that strips imports, removes TypeScript interfaces (runtime), and ensures the component is returned as an expression or rendered explicitly.

## 2. How did you decide component boundaries?
I used a heuristic approach combined with DOM analysis:
-   **Semantic Tags**: Priority given to `<section>`, `<header>`, and `<footer>`.
-   **Content Density**: Fallback to looking at `<div>` elements with significant text content or specific class names (e.g., "hero", "container").
-   **AI Context**: I feed the AI a generous chunk of surrounding HTML so it can infer where the "logic" of the component starts and ends, even if my heuristic cut it strictly by tags.

## 3. What broke, and how did you handle it?
**Playwright on Serverless**:
-   *Issue*: Running full browsers in serverless functions (like Vercel) is heavy and prone to timeouts or size limits.
-   *Handling*: I optimized the Playwright launch args (`headless`, `no-sandbox`) and added timeouts. For a real production app, I would offload this to a dedicated scraping API (like Browserless.io or BrightData) or a long-running Node.js worker, but for this demo, the API route handles it with tight timeouts.

**AI "Hallucinations"**:
-   *Issue*: Gemini sometimes returned Markdown code blocks or natural language explanations despite strict system prompts.
-   *Handling*: I added a post-processing step in the API route to strip markdown fences (` ```tsx `) and ensuring purely code output.

## 4. How did you use AI in your workflow?
I used AI (Gemini) in two ways:
1.  **The Core Feature**: It powers the actual HTML-to-React conversion.
2.  **Development Assistant**: I used it to generate the initial project boilerplate, write standard UI components (like the `Workspace` layout), and debug some sticky TypeScript errors in the scraping logic.

## 5. What would you improve with more time?
-   **AST-based Transformations**: Instead of regex for cleaning up code for `react-live`, I would use `babel-standalone` or `swc` for safer, more correct transformations.
-   **Screenshot capabilities**: Add a mechanism to screenshot the DOM element before generating, to use as a "reference" for the AI (multimodal input) to achieve higher visual fidelity.
-   **Component Library**: Allow users to save generated components to a local library/database.
