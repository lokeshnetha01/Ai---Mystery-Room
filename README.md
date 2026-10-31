# AI Mystery Room

An AI-powered fictional investigation platform built from the authoritative requirements in [spec.md](./spec.md). Users submit a scenario, inspect a generated case, and make one final accusation before the stored solution can be revealed.

## Stack

- React, Vite, React Router, Axios, and Lucide React
- Node.js, Express, Mongoose, and Zod
- MongoDB
- Google Gemini Interactions API for structured case generation
- Optional Google image/video generation and Cloudinary media storage

## Requirements

- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key
- Optional: Google media-generation access and a Cloudinary account for playable evidence assets

## Local setup

1. Install dependencies from the project root:

   ```powershell
   npm.cmd install
   ```

2. Create `backend/.env` from `backend/.env.example` if you do not already have one. Set `MONGODB_URI`, `GEMINI_API_KEY`, and a long random `SESSION_SECRET`. The default text model is `gemini-3.8-flash`.

3. Start the frontend and API:

   ```powershell
   npm.cmd run dev
   ```

4. Open <http://localhost:5173>. The API health endpoint is <http://localhost:5000/api/v1/health>.

Only one dev server pair should use ports 5173 and 5000 at a time. If Vite selects a different port because 5173 is occupied, set `CLIENT_URL` in `backend/.env` to that frontend origin before testing API requests.

The frontend can run without MongoDB, but case, notes, and accusation APIs need a live database. Gemini must be configured for mystery generation.

## Optional media generation

To generate and store image and video evidence, configure the relevant provider and Cloudinary values in `backend/.env` (or the equivalent Render environment variables):

```dotenv
IMAGE_PROVIDER=google-gemini
IMAGE_API_KEY=your-google-key
IMAGE_MODEL=gemini-3.1-flash-image
VIDEO_PROVIDER=google-gemini
VIDEO_API_KEY=your-google-key
VIDEO_MODEL=gemini-omni-flash-preview
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

Images and video need both a Google Gemini API key with media model access and a Cloudinary account. The app generates each asset in the backend, stores it in Cloudinary, and displays its status while generation is in progress. Without valid provider and storage credentials, media is marked unavailable. The API does not invent media URLs.

## Commands

- `npm.cmd run dev` — run frontend and backend together
- `npm.cmd run dev:frontend` — run Vite only
- `npm.cmd run dev:backend` — run Express only
- `npm.cmd test` — run backend tests
- `npm.cmd run build` — build the frontend
- `npm.cmd start` — start the backend

## Deployment: Vercel + Render

Deployment configuration is included in [`vercel.json`](./vercel.json) and [`render.yaml`](./render.yaml). Import the repository into both providers from the repository root. Vercel builds the React app from the npm workspace and serves `frontend/dist`; the Render Blueprint creates the Node API and uses `/api/v1/health` as its health check. The Vercel rewrite proxies `/api/v1/*` to `https://ai-mystery-room-api.onrender.com`, keeping guest-session cookies same-origin in the browser. If Render assigns a different service URL, update that rewrite destination and redeploy Vercel.

Setup order:

1. Push the repository to a Git provider and create the Vercel project with the repository root (`.`) as its project root. Keep the build command and output directory from `vercel.json`. Note the production Vercel URL.
2. Create the Render service from the repository's Blueprint (`render.yaml`). Set `CLIENT_URL` to the exact Vercel production origin (for example, `https://your-project.vercel.app`). Enter `MONGODB_URI`, `GEMINI_API_KEY`, and the Cloudinary cloud name, API key, and API secret in Render's environment setup. The separate `IMAGE_API_KEY` and `VIDEO_API_KEY` are optional; when blank, the app uses `GEMINI_API_KEY`. Render generates `SESSION_SECRET`.
3. In MongoDB Atlas, allow the Render service's outbound IP range and ensure the database user has only the permissions needed by this app. Keep database and Gemini credentials in Render's secret environment variables; never commit them.
4. Confirm Render is healthy at `https://ai-mystery-room-api.onrender.com/api/v1/health`. If its hostname differs, update the Vercel rewrite destination in `vercel.json`, commit, and redeploy.
5. Redeploy Vercel, then test the deployed landing page, case generation, investigation session persistence, accusation, and gated result reveal. Check Render logs and Vercel deployment logs if any step fails.

The Render Blueprint enables image/video generation and Cloudinary storage, but these features stay unavailable until valid media and Cloudinary credentials are entered in Render. Google model access and quota can vary by account. The `free` Render plan may sleep when idle and can have a cold start; choose a paid plan if that is unsuitable. Deployment is not complete until both providers have deployed the app and the live workflow has passed.

## Progress

Stages 1–3 and 5–6 have passed their current acceptance checks, including a live Gemini-generated case persisted to MongoDB and a full API workflow smoke covering solution secrecy, notes, accusation, result reveal, and session isolation. The automated backend suite has 24 passing tests and the frontend production build passes. Chrome responsive, touch-emulation, accessibility-tree, form, keyboard-tab, and accusation-dialog focus checks pass. Physical device and standalone screen-reader testing were not performed. Image/video generation remains deferred and disabled. Vercel/Render configuration is prepared; deployment and production verification are pending. See [task.md](./task.md) for stage gates and [implementation-decisions.md](./implementation-decisions.md) for implementation details.
