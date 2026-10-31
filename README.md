# 🕵️ AI Mystery Room

**Every Mystery Has a Truth. Can You Find It?**

AI Mystery Room is an AI-powered fictional investigation platform where users become detectives and solve unique mysteries generated from their own story ideas.

Enter a scenario, explore suspects, investigate evidence, analyze clues, and identify the culprit. Every mystery is designed to provide an interactive detective experience with a hidden solution revealed only after the final accusation.

## ✨ Features

- **AI-Powered Mystery Generation:** Create unique fictional investigations from custom scenarios using Google Gemini.
- **Multiple Suspects:** Investigate characters with different backgrounds, motives, and alibis.
- **Interactive Evidence:** Explore fictional documents, chat conversations, images, and CCTV-style evidence.
- **Investigation Timeline:** Examine events and identify inconsistencies.
- **Detective Notes:** Record observations and deductions during an investigation.
- **Final Accusation:** Select one suspect as the culprit.
- **Solution Reveal:** Discover the actual culprit and understand the reasoning behind the case.
- **Detective Scoring:** Receive a score based on your investigation and final accusation.

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, Vite, React Router |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI Integration | Google Gemini API |
| Validation | Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Image & Video Generation | Google Gemini (optional) |
| Media Storage | Cloudinary (optional) |
| Deployment | Vercel and Render |

## 🏗️ Project Structure

```text
AI-Mystery-Room/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── README.md
├── SPEC.md
├── package.json
├── package-lock.json
├── render.yaml
└── vercel.json
```

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js 20 or later
- npm
- MongoDB (local installation or MongoDB Atlas)
- Google Gemini API key

Optional for image and video evidence:
- Gemini media-generation access
- Cloudinary account and credentials

### 1. Clone the repository

```bash
git clone https://github.com/lokeshnetha01/Ai---Mystery-Room.git
```

### 2. Navigate to the project

```bash
cd Ai---Mystery-Room
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory using `backend/.env.example` as a reference.

Configure the required variables:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_long_random_secret
```

Use the model configuration documented in the backend environment example and configuration.

**Important:** Never commit `.env` files, API keys, database credentials, or other secrets to GitHub.

### 5. Start the application

From the project root, run:

```bash
npm run dev
```

### 6. Open the application

Frontend:

http://localhost:5173

Backend health check:

http://localhost:5000/api/v1/health

The frontend can start without a database connection, but mystery generation and gameplay features require the backend, MongoDB, and Gemini to be configured correctly.

## 🎨 Optional Media Generation

The application supports optional AI-generated image and video evidence.

The media-generation pipeline uses:

1. Google Gemini for image or video generation.
2. Cloudinary for storing generated media.
3. Backend services for managing asset generation and status.
4. The frontend for displaying available evidence.

Configure the relevant environment variables in `backend/.env`:

```env
IMAGE_PROVIDER=google-gemini
IMAGE_API_KEY=your_google_api_key
IMAGE_MODEL=gemini-3.1-flash-image

VIDEO_PROVIDER=google-gemini
VIDEO_API_KEY=your_google_api_key
VIDEO_MODEL=gemini-omni-flash-preview

MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

These are optional integrations. Actual media generation depends on model availability, API access, quota, and valid Cloudinary configuration.

Without the required configuration, media assets may be marked unavailable while the rest of the investigation experience remains usable.

## 📜 Available Commands

Run these commands from the project root:

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start frontend and backend |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm test` | Run backend tests |
| `npm run build` | Build the frontend |
| `npm start` | Start the backend |

## 🚀 Deployment

The project is configured for deployment using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary (optional)

Deployment configuration files:

- [`vercel.json`](./vercel.json)
- [`render.yaml`](./render.yaml)

### Deployment overview

1. Connect the GitHub repository to Vercel.
2. Configure the frontend build using the repository's Vercel configuration.
3. Deploy the backend using the Render Blueprint.
4. Configure the required backend environment variables in Render.
5. Configure the MongoDB Atlas connection and access permissions.
6. Verify the backend health endpoint.
7. Verify frontend-to-backend communication.
8. Test mystery generation, investigation sessions, accusations, and verdict retrieval.

**Deployment note:** Confirm the actual service URLs and environment configuration before deploying. If the backend hostname changes, update the frontend API rewrite configuration accordingly.

## 🔐 Security

Security is an important part of AI Mystery Room.

- Gemini API keys remain on the backend.
- The correct culprit is stored securely on the server.
- The hidden solution is not included in public case responses.
- Verdict access is restricted to the relevant investigation session.
- Accusations are validated by the backend.
- Generated content is validated before being stored.
- User input and AI-generated content are treated as untrusted data.

## 📌 Development Status

The project includes the core mystery-generation and investigation workflow, backend API, database integration, and deployment configuration.

The existing development checks report:

- Backend automated tests: 24 passing.
- Frontend production build: passing.
- API workflow smoke checks: passing.
- Solution secrecy and session-isolation checks: passing.
- Basic responsive, keyboard-navigation, and accessibility checks: passing.

**Current media limitation:** Image and video generation remains deferred and disabled until the required integrations are configured and verified.

Physical-device and standalone screen-reader testing have not been completed.

Refer to [`task.md`](./task.md) and [`implementation-decisions.md`](./implementation-decisions.md) for development details and implementation decisions.

## 🔮 Future Improvements

- More realistic AI-generated visual evidence.
- Improved simulated CCTV investigations.
- More mystery genres and difficulty levels.
- Enhanced detective scoring.
- Additional investigation interactions.
- Improved mobile experience.

## 👨‍💻 Author

**Lokesh Netha**

GitHub: [@lokeshnetha01](https://github.com/lokeshnetha01)

Project Repository: [AI Mystery Room](https://github.com/lokeshnetha01/Ai---Mystery-Room)

---

*The AI creates the mystery. The backend protects the truth. You solve the case.*
