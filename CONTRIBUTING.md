# Contributing to Pawerful

Thank you for helping Pawerful grow. Contributions can be code, documentation, design feedback, accessibility fixes, bug reports, or carefully scoped feature ideas.

## Before you start

1. Search the existing issues to avoid duplicates.
2. For anything larger than a small fix, open an issue before writing code.
3. Keep changes focused. Pawerful is an early-stage project and small pull requests are easier to review safely.
4. Never commit API keys, `.env` files, pet photos, or other private data.

## Local setup

```bash
git clone https://github.com/njlandarch-sudo/Pawerful.git
cd Pawerful
npm install
cp .env.example .env.local
npx vercel dev
```

The full scan flow needs the serverless API. `npm run dev` is useful for UI-only work.

## Development workflow

1. Create a branch from `main`.
2. Make one coherent change.
3. Run `npm run build`.
4. Test the affected flow manually on both a narrow and a wide viewport.
5. Open a pull request using the repository template.

Suggested branch names:

- `fix/short-description`
- `feature/short-description`
- `docs/short-description`
- `refactor/short-description`

## Project conventions

- Use React function components and hooks.
- Match the existing Tailwind-based visual language.
- Reuse existing colors, spacing, rounded shapes, and motion patterns.
- Avoid adding large dependencies for small conveniences.
- Prefer extracting one logical component at a time over rewriting the whole app.
- Preserve the API response contract unless the related frontend and documentation change in the same pull request.

The analysis endpoint currently returns data shaped like this:

```json
{
  "breed": "specific breed name",
  "mode": "current vibe",
  "humanSafe": "green",
  "dogSafe": "green",
  "stats": [
    { "label": "Energy", "value": 75 },
    { "label": "Sass", "value": 60 },
    { "label": "Affection", "value": 90 }
  ],
  "diary": "a short first-person line"
}
```

## AI-assisted contributions

AI-assisted work is welcome. Before submitting it, please:

- read and understand every changed file;
- remove invented dependencies, commands, and claims;
- test the actual behavior;
- check that no secret or private data entered the diff;
- explain the user-facing effect in the pull request.

## Bug reports

A useful bug report includes:

- what you expected;
- what happened;
- steps to reproduce;
- browser and device;
- screenshots or console output with secrets and personal data removed.

## Pull requests

Pull requests should be reviewable and honest about remaining limitations. A polished description is less important than a clear explanation of what changed, why, and how it was tested.

