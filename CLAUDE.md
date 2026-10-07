@AGENTS.md

# Kurious

- Product and UI language: Spanish first. Every user-facing text goes in `messages/es.json`, `pt.json` and `en.json` with the same keys (`src/i18n/messages.test.ts` checks it). Use `Link`, `useRouter` and `redirect` from `@/i18n/navigation`, not from `next/*`.
- Design: one uniform style across the app, taken from the approved v4 Map and Idea mockups. Use the theme colors in `src/app/globals.css`; orange (`fire`) only for the most-voted idea. Fraunces (`font-display`) for titles, Nunito for the rest. No monospace fonts and no emoji in the UI; icons are inline SVG.
- Map and 3D are plain JavaScript (MapLibre, Three.js), mounted once from a client component and removed on unmount. Never re-render them through React state.
- Business logic, permissions (RLS) and anything that needs a secret or costs money live in Supabase (migrations, functions), not in Next.js. Never put a secret in a `NEXT_PUBLIC_` variable.
- Login: read the signed-in person with `getCurrentUser()` from `src/features/auth/session.ts` (verified JWT claims). Server Actions cannot call `getLocale()` (next/root-params only works while rendering a route), so forms send their language in a hidden `locale` field.
- Database changes are new files in `supabase/migrations/`; never edit an applied migration.
- Before finishing a change run `npm run check` (lint, typecheck, format and unit tests).

## Rules

@.claude/rules/comentarios-codigo.md
@.claude/rules/idioma-codigo.md
@.claude/rules/git-commits.md
