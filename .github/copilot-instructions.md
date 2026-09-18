# Pawerful repository instructions

## Project summary

Pawerful is an early-stage, mobile-first pet vibe scanner and memory journal. A user uploads a cat or dog photo, the browser compresses it, and `/api/analyze-pet` asks a multimodal provider for a structured, playful result. Profiles and journey entries are stored locally in the browser.

## Current stack

- React 18 and Vite 5
- Tailwind CSS 3
- Framer Motion
- Phosphor Icons
- Vercel Edge Function at `api/analyze-pet.js`
- Gemini outside mainland China and Doubao in mainland China

Entry path: `index.html` -> `src/main.jsx` -> `src/App.jsx`.

## Important files

- `src/App.jsx`: UI, state, mock feed data, image handling, local persistence, and most components
- `api/analyze-pet.js`: server-side AI routing, prompt, response parsing, and validation
- `public/MainLogo.png`: project logo
- `package.json`: scripts and dependencies
- `README.md`: setup and contributor-facing product overview
- `.env.example`: names of required server-side environment variables

## Runtime behavior

- The client calls `POST /api/analyze-pet` with `imageBase64` and `petType`.
- The edge function uses `req.geo.country`; `CN` selects Doubao and other countries select Gemini.
- When geo data is missing, the current fallback is `CN`.
- The provider must return JSON containing `breed`, `mode`, `humanSafe`, `dogSafe`, `stats`, and `diary`.
- Pet records, user profile data, journey entries, and streak data use `localStorage`.
- There is no current authentication or shared database.

## Environment variables

- `GEMINI_API_KEY`
- `VOLCENGINE_API_KEY`

Both are server-side secrets. Never add a `VITE_` prefix, expose them to client code, print their values, or commit real `.env` files.

## Commands

- `npm install`
- `npm run dev` for UI-only Vite development
- `npx vercel dev` for the UI plus `/api` route
- `npm run build` before submitting a pull request
- `npm run preview` to preview a production build

Do not claim that a lint or test command exists unless it has first been added to `package.json`.

## Editing guidance

- Make small, focused changes and preserve the current user-facing behavior unless the issue says otherwise.
- Match the established warm palette, rounded forms, mobile-first composition, and restrained motion.
- Prefer existing dependencies and patterns.
- `src/App.jsx` is large. Extract one coherent component at a time; do not perform a full rewrite as part of an unrelated feature.
- Keep provider calls in server-side code.
- Preserve the documented API response shape or update frontend code and documentation together.
- Treat AI-generated breed, behavior, and safety output as entertainment, not authoritative advice.
- Never use real user images or credentials in fixtures, issues, commits, or tests.

