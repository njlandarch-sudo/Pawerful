**Repository Summary**
- **Stack:** Vite + React (React 19) with Tailwind CSS. Entry points: [index.html](index.html) → [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx).
- **Purpose:** Single-page UI demo app (client-only). No backend services; mock data lives in `TRENDS_DATA` and `POSTS_DB` inside `src/App.jsx`.

**Big Picture / Architecture**
- Single-page app served by Vite. Global styling via Tailwind; app components are implemented inline in `src/App.jsx` rather than split across many files.
- Visual/UI logic, sample data, and simple image-upload flows are colocated in `src/App.jsx`. Treat this file as the primary surface for UI changes and experiments.
- Integrations: uses `@google/generative-ai` client (instantiated with `import.meta.env.VITE_GEMINI_API_KEY`) — the app expects a Gemini API key in env to enable generative features.

**Developer workflows (commands)**
- Start dev server: `npm run dev` (uses Vite with HMR).
- Build for production: `npm run build`.
- Preview production build: `npm run preview`.
- Linting: `npm run lint` (ESLint configured in repo).

**Important files to inspect or modify**
- App entry: [index.html](index.html)
- React mount: [src/main.jsx](src/main.jsx)
- Main UI and logic: [src/App.jsx](src/App.jsx)
- Build config: [vite.config.js](vite.config.js)
- Tailwind config: [tailwind.config.js](tailwind.config.js)
- Scripts & deps: [package.json](package.json)

**Project-specific conventions & patterns**
- Single-file components: The project implements many components inside `src/App.jsx` (Header, TrendingCommunities, ShowroomHero, PetDetailsForm, etc.). When adding features, prefer either:
  - adding a new small component inside `src/` and importing it from `src/App.jsx`, or
  - splitting logically grouped components into `src/components/` if the change is large.
- Styling: utility-first Tailwind classes are used everywhere (no CSS modules). Avoid introducing separate CSS unless necessary; extend Tailwind via `tailwind.config.js`.
- Mock data and images: `TRENDS_DATA` and `POSTS_DB` are in-memory arrays inside `src/App.jsx`. For persistence or API integration, replace usage sites with fetch calls and keep the UI contract (objects with id, title, image, etc.).
- Image handling: file inputs use `URL.createObjectURL(...)` for preview before any upload logic — maintain that approach for quick local previews.

**Integration notes & env vars**
- Gemini / Generative AI: `const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)` is created in `src/App.jsx`. Provide `VITE_GEMINI_API_KEY` in a local `.env` file (Vite requires `VITE_` prefix) to enable these features.
- Third-party icons: `@phosphor-icons/react` is used heavily. Keep imports consolidated (the file imports many icons at top of `src/App.jsx`).

**Editing guidelines for AI coding agents**
- Make minimal, focused edits. This repo prefers cosmetic/UI tweaks and small feature additions rather than heavy refactors.
- Preserve Tailwind class patterns and existing animation/utility choices (e.g., `rounded-[32px]`, `animate-in`, `group-hover:*`).
- When adding new components, export defaults from new files and import them in `src/App.jsx`. Name files under `src/components/` when size warrants splitting.
- Avoid adding large dependencies without stating trade-offs. New tools should be added to `package.json` and included in `devDependencies` if only used for development.

**Examples (where to change common tasks)**
- Change the primary app UI: edit [src/App.jsx](src/App.jsx).
- Update dev/build commands: edit [package.json](package.json).
- Toggle generative AI usage: look for `GoogleGenerativeAI` in [src/App.jsx](src/App.jsx) and guard calls behind availability of `import.meta.env.VITE_GEMINI_API_KEY`.

**What this file intentionally does NOT cover**
- Internal design decisions not visible in the repo (CI, deployment settings, or private API keys) — ask the maintainer for missing runtime secrets or infra details.

If anything here is unclear or you'd like me to expand/merge specific wording with an existing guidance file, tell me which section to refine.
