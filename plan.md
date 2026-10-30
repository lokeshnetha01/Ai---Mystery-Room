# AI Mystery Room Implementation Plan

`spec.md` is the single source of truth. Work follows the seven phases in order, and a phase is not complete until its acceptance checks pass. `task.md` is the item-level tracker; `tasks.md` mirrors its current gate.

## Stage 1 — Project Foundation

**Scope:** React/Vite, Express, MongoDB/Mongoose configuration, environment handling, baseline security, health API, and npm workspace commands.

**Acceptance:** Start the app, load the frontend, verify API health and MongoDB reporting, run the foundation tests.

**Status:** Frontend/build and backend tests pass. The running API health endpoint reports MongoDB `connected`.

## Stage 2 — Frontend UI

**Scope:** Landing, scenario intake, generation status, investigation, accusation, and results screens, with responsive accessible layouts.

**Acceptance:** Build frontend and smoke-check navigation, input validation, and the main screens.

**Status:** UI and production build checks pass. Temporary preview data was removed as API-backed pages were connected.

## Stage 3 — AI Integration and Persistence

**Scope:** Gemini structured generation, complete Zod input/output validation, bounded correction retries, consistency rules, MongoDB persistence, accurate job state, signed guest sessions, and strict public/private solution separation.

**Acceptance:** Generate one valid case through Gemini, persist it to MongoDB, and verify public responses never expose private solution data.

**Status:** Gemini uses the Interactions API and strict Zod validation. The live workflow smoke generated a case, persisted it to MongoDB, and verified public responses omit solution fields before accusation.

## Stage 4 — Evidence and Media

**Scope:** Separate evidence persistence, text evidence, optional Google image/video provider adapters, Cloudinary storage, validated media URLs, and honest per-asset statuses.

**Acceptance:** Verify linked evidence in MongoDB, configured media generation/storage, and provider-failure behavior.

**Status:** Provider/storage adapters and unavailable states are implemented. Live image/video generation is deferred at the user's request, and runtime providers are disabled to avoid further quota requests. Cloudinary upload remains unverified until media is resumed with eligible quota.

## Stage 5 — Investigation Workflow

**Scope:** Public case/evidence APIs, session-scoped notes CRUD, one final accusation per session/case, and result reveal from the stored solution after accusation.

**Acceptance:** Complete one investigation end to end and verify cross-session access is denied.

**Status:** Routes, models, UI wiring, unique accusation index, and controller tests are implemented. The live workflow smoke passed notes CRUD, accusation-once enforcement, gated result reveal, and cross-session denial.

## Stage 6 — Testing and Optimization

**Scope:** API/schema/AI/security/session tests, responsive and accessibility review, and functional fixes.

**Acceptance:** Critical automated checks pass and the running workflow is reviewed against `spec.md`.

**Status:** Verified. The 24 backend tests, frontend production build, and live API persistence/workflow smoke pass. Chrome checks confirm no overflow at 320/390/768/1024/1280px, mobile controls have 44px targets, interactive controls have accessible names, page landmarks and comparison table are semantic, and form/tab/dialog keyboard behavior passes. Physical device and standalone screen-reader testing were not performed.

## Stage 7 — Deployment

**Scope:** Production setup instructions, environment configuration, deployment, and production workflow checks.

**Acceptance:** Verify the deployed application, persistence, AI, media statuses, and protected result flow.

**Status:** Local/production configuration is documented. Deployment needs a target host and production configuration, which are not currently present.

## Operating rules

- Keep the app runnable after each meaningful change.
- Report actual stage results; do not substitute code presence for acceptance.
- Never replace production Gemini functionality with hardcoded mock data.
- Never expose the culprit or solution before a final accusation.
