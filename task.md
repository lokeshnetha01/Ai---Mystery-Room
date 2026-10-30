# AI Mystery Room — Task Tracker

Status: `[ ]` not started · `[~]` in progress / acceptance checks pending · `[x]` verified complete · `[!]` externally blocked

Follow the authoritative requirements in `spec.md` and the order in `plan.md`. Keep `tasks.md` aligned with this tracker. Do not mark a stage complete until its acceptance gate passes.

## Stage 1 — Project Foundation
- [x] Inspect the repository and read `spec.md`.
- [x] Create React + Vite and Express workspace foundations.
- [x] Add environment configuration, Mongoose connection setup, middleware, JSON errors, and health endpoint.
- [x] Install dependencies and confirm the frontend build and backend test runner work.
- [x] Make backend `.env` load from either repository-root or backend-workspace commands.
- [x] Reconfirm live MongoDB connectivity; the running API health endpoint reports `connected`.

## Stage 2 — Frontend UI
- [x] Implement landing, validated scenario intake, generation status, investigation, accusation, and results pages.
- [x] Add responsive layouts, evidence categories, suspect comparison, and accessible controls.
- [x] Build successfully and smoke-check the frontend and API health routes.
- [x] Remove the preview fixture when API-backed case pages were connected.

## Stage 3 — AI Integration and Persistence
- [x] Add MongoDB mystery/evidence models, complete Zod schemas, consistency checks, and bounded correction retries.
- [x] Keep solution fields private by default and scope mystery requests to signed guest sessions.
- [x] Migrate structured generation to Google’s current Gemini Interactions API; send a compact structural schema and enforce strict details with Zod after generation.
- [x] Persist accepted case data and report job state; retain generic client-facing failures and safe server diagnostics.
- [x] Verify a real Gemini structured case with 3 suspects, 6 required evidence types, and 5 timeline events; the final complete case passed Zod and semantic validation.
- [x] Verify Mongo persistence and public-response secrecy through live case endpoints with a real Gemini-generated case.

## Stage 4 — Evidence and Media
- [x] Persist evidence in a separate collection and display chat, documents, image/video status, and evidence links.
- [x] Add Google image/video provider adapters and signed Cloudinary uploads; validate public HTTPS media URLs.
- [x] Generate suspect profile images when the optional providers/storage are configured; mark assets unavailable when they are not.
- [~] Live image/video generation and storage are deferred at the user's request. Runtime providers are disabled to prevent repeated quota requests; provider/storage adapters and accurate unavailable states remain in place. Re-enable after eligible quota is available.

## Stage 5 — Investigation Workflow
- [x] Connect public case, suspects, and evidence screens to API responses.
- [x] Add MongoDB-backed, session-scoped notes create/list/update/delete.
- [x] Add suspect-validated final accusation with a unique `(mysteryId, sessionId)` index.
- [x] Gate result reveal on a recorded accusation and derive it from the stored solution.
- [x] Verify full live workflow and cross-session isolation: notes CRUD, accusation uniqueness, result gate, and foreign-session denial all passed.

## Stage 6 — Testing and Optimization
- [x] Add schema, generation retry, serialization, media URL, and investigation-controller tests.
- [x] Run the backend suite and frontend production build.
- [x] Add keyboard navigation for evidence tabs, focus-visible controls, reduced-motion handling, and focus trapping/restoration for accusation confirmation.
- [x] Preserve an in-progress scenario and idempotency key across page reloads; allow retry when the initial request response is interrupted.
- [x] Live AI/database workflow and Stage 6 Chrome review passed. Responsive routes have no horizontal overflow at 320, 390, 768, 1024, and 1280px; mobile tap targets are at least 44px; controls have accessible names; landmarks/table/dialog appear in the accessibility tree; form validation, tab navigation, dialog focus trap, Escape, and focus restoration passed.

## Stage 7 — Deployment
- [x] Document local and production environment needs and startup/build/test commands.
- [x] Prepare Vercel static frontend configuration with SPA fallback and same-origin API proxy to Render.
- [x] Prepare Render Blueprint with production runtime, health check, generated session secret, and image/video providers disabled.
- [~] Create provider projects, configure production MongoDB/Gemini secrets and Vercel origin, deploy, and verify the live workflow. Provider accounts/repository URLs and production credentials must be supplied through their dashboards.

## Current verification
- `npm.cmd test`: 24 backend tests passed after the media configuration and suspect image privacy checks.
- `npm.cmd run build`: frontend production build passed after the notes, accusation, and result UI changes.
- `GET http://localhost:5000/api/v1/health`: API `ok`, database `connected`.
- Latest frontend build after keyboard/accessibility and retry-resilience changes: passed (1,649 modules).
- Chrome responsive checks: landing and intake routes have no horizontal overflow at 320, 390, 768, 1024, and 1280px.
- Chrome touch/accessibility checks: touch CTA opens intake; mobile interactive targets are at least 44px; Chrome accessibility tree exposes banner/main/content-info landmarks and no unnamed interactive controls.
- Chrome form/dialog checks: invalid scenario input is linked through `aria-invalid` and `aria-describedby`; all intake controls have labels; Tab moves from title to scenario; accusation dialog focus enters, traps, closes with Escape, and returns to its opener.
- Suspect comparison is exposed as a semantic table; evidence filters and selected records expose tab/pressed state.
- Latest check after Stage 6 fixes: `npm.cmd test` passed (24 tests); `npm.cmd run build` passed (1,649 modules).
- `node backend/scripts/workflowSmoke.js`: passed live Gemini generation, Mongo persistence, public solution secrecy, notes CRUD, accusation-once rule, result gate, and session isolation. It created a test case in Atlas and deleted its test note.
- Latest frontend review: Chrome accessibility-tree and touch-emulation checks passed. Physical device and standalone Narrator/NVDA testing were not performed.
- Image/video providers are disabled in local runtime configuration per user request; credentials were kept in the ignored `.env` file. Media generation can resume by re-enabling provider settings after quota is available.
- A full Gemini case generation through `gemini-3.8-flash` passed structural and semantic validation. The API request used the configured local key without printing it.
- `vercel.json` validates as JSON; `render.yaml` was reviewed against the Render Blueprint format. Deployment configuration is documented in README; live provider deployment is pending dashboard setup.
