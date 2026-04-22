# PROJECT_CONTEXT.md

> **READ THIS FIRST.** This file is the single source of truth for the project across multiple Claude Code sessions. Every session begins by reading this file. At the end of every session, this file MUST be updated to reflect what was built.

---

## What we're building

A recruitment screening platform for **Biz Group** (L&D consultancy, Dubai). HR creates AI voice-screening agents for specific roles. Candidates call a shareable link, have a structured 10–12 minute conversation with the AI, and HR reviews the AI's triage decision in a dashboard.

### The flow, end to end

1. HR fills out a form in our dashboard: role title, scenarios, culture statements, etc.
2. Our backend calls the ElevenLabs API to create a new Conversational AI agent with a generated system prompt.
3. ElevenLabs returns an `agent_id` and we fetch the shareable link.
4. HR copies that link and shares it with candidates (email, WhatsApp, LinkedIn).
5. Candidate opens the link → talks to the agent on ElevenLabs' hosted page.
6. Call ends → ElevenLabs sends a post-call webhook to n8n with transcript + metadata.
7. n8n runs a triage AI (separate prompt) that scores the candidate and decides: invite / needs_review / decline.
8. n8n writes the result to Supabase.
9. HR reviews candidates in our dashboard, takes action (invite/reject/hold).

---

## Architecture decisions (locked in — do not change without asking)

- **Framework**: Next.js 16+ App Router, TypeScript
- **Database**: Supabase (Postgres + Auth)
- **Auth**: Supabase Auth, email/password, single-tenant (Biz Group internal users only)
- **Hosting**: Vercel (assume this, but don't deploy during build sessions)
- **Voice platform**: ElevenLabs Conversational AI
- **Post-call processing**: n8n (user manages the workflow, we only provide the webhook payload shape)
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming (dark mode via `.dark` class)
- **UI components**: shadcn/ui primitives (manually installed), ElevenLabs UI components (ConversationBar, Orb, LiveWaveform)
- **Deployment scope**: Single-tenant. No `org_id` in schema yet. Plan for multi-tenant later.
- **Package manager**: npm (must use `npm.cmd` due to admin restrictions; `npx` unavailable)
- **Working directory**: `C:\Dev\biz-screening` (migrated from OneDrive path to avoid long path issues)

## Things we are explicitly NOT doing in early sessions

- No multi-org / multi-tenant
- No rate limiting, queueing, or scale optimisations
- No agent versioning (Session 4 adds this)

---

## Tech stack reference

### NPM packages we will use

- `next`, `react`, `react-dom`, `typescript`, `@types/*`
- `tailwindcss`, `postcss`, `autoprefixer`
- `@supabase/supabase-js`, `@supabase/ssr`
- `@elevenlabs/elevenlabs-js` — the official Node.js SDK for managing agents server-side
- `@elevenlabs/react` — React SDK for voice conversations (useConversation, ConversationProvider)
- `zod` — for form validation
- `lucide-react` — icons
- `class-variance-authority`, `clsx`, `tailwind-merge` — shadcn/ui utility deps
- `@radix-ui/react-slot` — shadcn/ui button primitive
- `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` — Orb 3D visualization

### Env vars (stored in `.env.local`, never committed)

```
NEXT_PUBLIC_SUPABASE_URL=https://piibpasptbkdfaqeqhot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hEZS7I8RabdpPtkA0ZEb_Q_VtFETBzG   # (publishable key — replaces legacy anon key)
SUPABASE_SERVICE_ROLE_KEY=<set in .env.local>
ELEVENLABS_API_KEY=<set in .env.local>
ELEVENLABS_DEFAULT_VOICE_ID=eXpIbVcVbLo8ZJQDlDnl
N8N_WEBHOOK_URL=
```

> **Note:** Supabase now uses "publishable" keys instead of "anon" keys. The env var name `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works — it's the same key under a new label.

### ElevenLabs API endpoints we use

- `POST /v1/convai/agents/create` — create a new agent with our system prompt + voice + webhook
- `GET /v1/convai/agents/{agent_id}/link` — get the shareable URL for HR to distribute
- `PATCH /v1/convai/agents/{agent_id}` — update agent prompt (Session 4 versioning)
- Post-call webhook (transcription) — ElevenLabs POSTs to n8n when a call ends

---

## Database schema (single source of truth)

This schema is defined in Session 1 as a Supabase migration. Don't duplicate it elsewhere.

### `roles` table
| column | type | notes |
|---|---|---|
| `id` | uuid, PK, default uuid_generate_v4() | |
| `title` | text, not null | e.g. "Customer Support Specialist (Axonify)" |
| `company_name` | text, default 'Biz Group' | |
| `hiring_manager_email` | text | Where to send review notifications |
| `job_description` | text | Raw pasted JD, used for scenario generation |
| `call_duration_min` | int, default 10 | |
| `call_duration_max` | int, default 12 | |
| `call_hard_limit_minutes` | int, default 15 | |
| `notice_period_threshold_weeks` | int, default 2 | |
| `language_requirements` | text | Full spoken Q2 question |
| `capture_arabic_capability` | boolean, default false | |
| `scenario_questions` | jsonb | Array of ScenarioQuestion (see reference/types.ts) |
| `logic_question` | jsonb | LogicQuestion object |
| `feedback_question` | text | |
| `feedback_probe` | text | |
| `culture_intro` | text | |
| `culture_statements` | jsonb | Array of CultureStatement (exactly 4) |
| `scoring_rubric` | jsonb | Record<string, ScoringRubric> |
| `voice_id` | text, not null | ElevenLabs voice ID (Session 4 adds picker) |
| `elevenlabs_agent_id` | text | Populated after agent creation |
| `shareable_link` | text | Populated from GET /link |
| `status` | text, default 'draft' | draft / active / archived |
| `created_by` | uuid, FK auth.users.id | |
| `created_at` | timestamptz, default now() | |
| `updated_at` | timestamptz, default now() | |

### `candidates` table
| column | type | notes |
|---|---|---|
| `id` | uuid, PK, default uuid_generate_v4() | |
| `role_id` | uuid, FK roles.id, not null | |
| `elevenlabs_conversation_id` | text, unique | From webhook payload |
| `candidate_name` | text | |
| `candidate_email` | text | |
| `candidate_phone` | text | |
| `notice_period` | text | |
| `language_profile` | text | |
| `arabic_capability` | boolean | |
| `scenario_responses` | jsonb | Object keyed by question id |
| `logic_answer` | text | |
| `logic_correct` | boolean | |
| `feedback_response` | text | |
| `culture_ratings` | jsonb | Object with q10_* fields |
| `call_outcome` | text | completed / consent_declined / partial / abandoned / dnc_requested |
| `call_duration_seconds` | int | |
| `transcript` | jsonb | Full ElevenLabs transcript |
| `triage_decision` | text | invite / needs_review / decline / null |
| `triage_confidence` | numeric(3,2) | 0.00 – 1.00 |
| `triage_reasoning` | text | |
| `triage_concerns` | text[] | |
| `triage_scores` | jsonb | Per-question scores from triage AI |
| `hr_action` | text | invited / rejected / on_hold / null |
| `hr_notes` | text | |
| `hr_action_at` | timestamptz | |
| `hr_action_by` | uuid, FK auth.users.id | |
| `created_at` | timestamptz, default now() | |

### RLS policies

- Authenticated users can read/write all rows in both tables (single-tenant, all Biz Group users have equal access)
- `candidates` INSERTs from n8n use the service role key (bypasses RLS)

---

## File structure

```
biz-screening/
├── PROJECT_CONTEXT.md               ← you are here, update at end of each session
├── reference/                        ← source of truth for prompt engine, don't modify
│   ├── types.ts
│   ├── buildAgentPrompt.ts
│   └── axonify.config.ts
├── .env.local                        ← never committed
├── next.config.ts
├── tsconfig.json
├── package.json
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── src/
│   ├── middleware.ts                  ← Supabase Auth middleware (protects /dashboard/*)
│   ├── app/
│   │   ├── globals.css               ← Tailwind v4 entry, CSS custom properties, dark mode tokens
│   │   ├── layout.tsx                ← Root layout with theme init script
│   │   ├── page.tsx                  ← landing / redirect to /dashboard
│   │   ├── login/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx              ← role list table with dark mode
│   │   │   ├── logout-button.tsx
│   │   │   ├── theme-toggle.tsx      ← dark/light mode toggle
│   │   │   └── roles/
│   │   │       ├── new/page.tsx      ← create role form
│   │   │       └── [id]/
│   │   │           ├── page.tsx      ← role detail + shareable link
│   │   │           ├── edit/         ← role edit page
│   │   │           ├── copy-link-button.tsx
│   │   │           ├── deploy-button.tsx
│   │   │           ├── delete-button.tsx
│   │   │           └── regenerate-link-button.tsx
│   │   ├── talk/
│   │   │   └── [agentId]/
│   │   │       ├── page.tsx          ← candidate-facing interview page (two-column layout)
│   │   │       └── call-panel.tsx    ← Orb + ConversationBar + real-time transcript
│   │   └── api/
│   │       └── roles/
│   │           ├── route.ts          ← POST create, triggers ElevenLabs
│   │           └── [id]/
│   │               ├── deploy/route.ts
│   │               └── regenerate-link/route.ts
│   ├── lib/
│   │   ├── utils.ts                  ← cn() utility (clsx + tailwind-merge)
│   │   ├── supabase/
│   │   │   ├── client.ts             ← browser client
│   │   │   ├── server.ts             ← server client
│   │   │   └── admin.ts              ← service role client
│   │   ├── elevenlabs/
│   │   │   ├── client.ts             ← ElevenLabs SDK initialisation
│   │   │   └── createAgent.ts        ← create + fetch link
│   │   └── prompt-engine/
│   │       ├── types.ts              ← copied from reference/
│   │       ├── buildAgentPrompt.ts   ← copied from reference/
│   │       └── configs/
│   │           └── axonify.config.ts ← copied from reference/
│   └── components/
│       └── ui/                       ← shadcn/ui primitives + ElevenLabs UI components
│           ├── button.tsx            ← shadcn Button (CVA variants)
│           ├── card.tsx              ← shadcn Card
│           ├── separator.tsx         ← shadcn Separator
│           ├── textarea.tsx          ← shadcn Textarea
│           ├── conversation-bar.tsx  ← ElevenLabs ConversationBar (voice + text input)
│           ├── live-waveform.tsx     ← ElevenLabs LiveWaveform (canvas audio viz)
│           └── orb.tsx               ← ElevenLabs Orb (Three.js 3D visualization)
```

---

## Current state — CLAUDE CODE UPDATES THIS SECTION AT END OF EACH SESSION

### Session 1: Foundation — COMPLETE

**Completed:**
- Next.js 16.2.4 project scaffolded (App Router, TypeScript, Tailwind CSS v4, Turbopack)
- Supabase migration `0001_initial_schema.sql`: `roles` (26 cols) + `candidates` (27 cols), RLS policies, `updated_at` trigger
- Supabase Auth: middleware protecting `/dashboard/*`, login page with sign-in/sign-up toggle
- Supabase clients: browser (`client.ts`), server (`server.ts`), admin/service-role (`admin.ts`)
- Prompt engine: `types.ts`, `buildAgentPrompt.ts`, `configs/axonify.config.ts` — all copied from `reference/`
- ElevenLabs: SDK client init (`client.ts`), `createAgent.ts` (creates agent + fetches shareable link)
- Create-role form (`/dashboard/roles/new`): all fields, pre-populated with Axonify defaults, JSON text areas for complex fields, "Deploy agent" + "Save as draft" actions
- `POST /api/roles`: full Zod validation, inserts role, optionally deploys to ElevenLabs
- `POST /api/roles/[id]/deploy`: deploys a draft role to ElevenLabs, updates status to active
- Dashboard (`/dashboard`): role list table with status badges, "View" links, "Create new role" button
- Role detail page (`/dashboard/roles/[id]`): read-only view of all fields, shareable link display + copy button, deploy button for drafts, delete button, regenerate link button

### Session 1.5: UI Polish & Candidate Talk Page — COMPLETE

**Completed:**
- **Dark mode**: Full implementation using CSS custom properties (14 semantic tokens in `:root` / `.dark`), Tailwind v4 `@custom-variant dark`, ThemeToggle component, localStorage persistence with flash-prevention inline script in `layout.tsx`
- **Voice ID**: Updated default to `eXpIbVcVbLo8ZJQDlDnl`
- **Candidate talk page** (`/talk/[agentId]`):
  - Two-column responsive layout: left panel shows job details (company, title, description, interview details, tips); right panel has the call interface
  - Server component fetches role data from Supabase by `elevenlabs_agent_id`
  - `generateMetadata()` for dynamic page title
- **Call panel** (`call-panel.tsx`):
  - ElevenLabs Orb (Three.js 3D WebGL visualization) — dynamically imported, SSR disabled, reacts to agent state (listening/talking/thinking)
  - ElevenLabs ConversationBar — voice + text input, waveform visualization, mic toggle, keyboard text input
  - Real-time chat transcript with auto-scroll, user bubbles (blue, right-aligned) and agent bubbles (surface color, left-aligned)
  - "Thinking" animation dots between user speech and AI response
  - Captures both voice transcripts (via `onMessage`) and text input (via `onSendMessage`)
  - WebRTC connection for lowest latency
- **shadcn/ui components** (manually installed from registry, no CLI): Button, Card, Separator, Textarea
- **ElevenLabs UI components** (manually installed from `ui.elevenlabs.io` registry JSON): ConversationBar, LiveWaveform, Orb
- **`cn()` utility** in `src/lib/utils.ts` (clsx + tailwind-merge)
- **CSS theme tokens** for shadcn/ui: `--color-card`, `--color-primary`, `--color-accent`, `--color-muted`, `--color-border`, `--color-input`, `--color-ring`, etc.

### Session 2: n8n data flow — NOT YET STARTED

Planned: `src/app/api/webhooks/elevenlabs/route.ts`, candidate processing, triage write-back from n8n.

### Session 3: Review panel — NOT YET STARTED

Planned: `dashboard/roles/[id]/candidates/page.tsx`, HR actions (invite/reject/hold).

### Session 4: Polish — NOT YET STARTED

Planned: `lib/elevenlabs/updateAgent.ts`, agent versioning, voice picker.
