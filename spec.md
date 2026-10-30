# AI MYSTERY ROOM

## Master Project Specification — Single Source of Truth

**Version:** 1.0
**Project Type:** AI-Powered Interactive Mystery Investigation Platform
**Development Methodology:** Spec-Driven Development (SDD)
**Frontend:** React.js
**Backend:** Node.js + Express.js
**Database:** MongoDB
**AI Integration:** Google Gemini API
**Primary Development Agent:** OpenAI Codex

---

# 1. PROJECT OVERVIEW

## 1.1 Project Description

AI Mystery Room is an AI-powered interactive mystery investigation platform where users can create and solve fictional mystery cases using their own story ideas.

The user provides a small scenario, story, or incident. Based on this input, the AI generates a complete fictional investigation containing:

- A mystery case description.
- A list of suspects.
- A hidden culprit.
- Motives and backgrounds.
- AI-generated evidence.
- Digital conversations resembling WhatsApp chats.
- AI-generated images.
- CCTV-style recordings.
- Additional clues and investigation details.

The user investigates the available evidence, analyzes the suspects, connects clues, and finally selects the person they believe is responsible.

The application evaluates the user's answer against the actual culprit and provides an explanation based on the evidence.

## 1.2 Core Concept

**User provides a story → AI creates a mystery → User investigates evidence → User identifies the culprit → AI reveals the solution.**

The main objective is to create an engaging detective experience where every mystery is generated dynamically rather than relying on predefined cases.

## 1.3 Project Vision

Build an interactive digital detective platform that combines generative AI, storytelling, visual evidence, and logical reasoning.

The platform should make users feel like real investigators rather than simply answering multiple-choice questions.

---

# 2. PROJECT OBJECTIVES

The application must achieve the following objectives:

1. Allow users to create mysteries using their own story ideas.
2. Generate unique fictional investigations using Gemini.
3. Create multiple suspects with different personalities, backgrounds, and motives.
4. Generate realistic-looking but clearly fictional investigation evidence.
5. Support different evidence formats, including text, images, and videos.
6. Ensure that evidence is logically connected to the actual culprit.
7. Allow users to examine and analyze evidence independently.
8. Allow users to submit their final culprit selection.
9. Reveal the correct answer with a logical explanation.
10. Provide an engaging, responsive, and visually immersive interface.

---

# 3. TARGET USERS

### Primary users

- People interested in detective stories.
- Mystery and crime-fiction enthusiasts.
- Students interested in logical reasoning.
- Users who enjoy interactive investigation games.

### User roles

**Investigator (Guest User)**

- Creates a mystery.
- Investigates suspects.
- Examines evidence.
- Submits a culprit.
- Views the final solution.

**Administrator (Future Scope)**

- Monitors generated cases.
- Manages inappropriate content.
- Monitors application usage.
- Manages system configurations.

For the initial MVP, the application should work without mandatory registration or login.

---

# 4. TECHNOLOGY STACK

## 4.1 Frontend

| Technology   | Purpose                    |
| ------------ | -------------------------- |
| React.js     | Frontend application       |
| Vite         | Development and build tool |
| React Router | Page navigation            |
| Tailwind CSS | Styling and responsive UI  |
| Axios        | Backend API communication  |
| Lucide React | Icons                      |

## 4.2 Backend

| Technology | Purpose                            |
| ---------- | ---------------------------------- |
| Node.js    | JavaScript runtime                 |
| Express.js | Backend framework                  |
| MongoDB    | Database                           |
| Mongoose   | MongoDB object modeling            |
| Gemini API | AI mystery generation              |
| Multer     | Media upload handling, if required |
| Zod        | Request and AI response validation |

## 4.3 AI and Media Generation

| Component                 | Responsibility                           |
| ------------------------- | ---------------------------------------- |
| Google Gemini             | Mystery generation and reasoning         |
| Gemini structured output  | Generate structured investigation data   |
| Image generation provider | Generate fictional visual evidence       |
| Video generation provider | Generate fictional CCTV-style recordings |
| Media storage             | Store generated images and videos        |

**Important implementation rule:** Gemini is the primary AI reasoning and text-generation provider. Image and video generation must use supported Google media-generation models or explicitly configured compatible providers. Do not assume that every Gemini model can directly generate images or videos.

Use provider adapters so the media-generation implementation can change without rewriting the application.

## 4.4 Development Environment

- Git and GitHub for version control.
- Visual Studio Codefor development.
- OpenAI Codex for spec-driven implementation.
- Postman for API testing.
- MongoDB Atlas for cloud database hosting.
- Environment variables for API keys and configuration.

---

# 5. COMPLETE USER WORKFLOW

The following workflow defines the expected end-to-end application behavior.

## Step 1: Landing Page

The user opens the website.

The landing page should contain:

- Application logo and name.
- Navigation bar.
- Hero section explaining the concept.
- Short description of the mystery-solving experience.
- Create Mystery button.
- How It Works section.
- Features section.
- Footer.

Primary CTA: **Create Your Mystery**

## Step 2: Story Submission

When the user clicks Create Your Mystery, navigate to the mystery creation page.

The user should be able to enter:

- Mystery title (optional).
- Story or scenario description (required).
- Mystery category (optional).
- Difficulty level.
- Preferred number of suspects.

### Example input

Title: The Missing Diamond

Scenario:

"During a private party at a luxury hotel, a valuable diamond disappears from a locked exhibition room. Five people had access to the building, but nobody admits seeing anything suspicious."

Category options:

- Theft
- Murder (fictional, non-graphic)
- Disappearance
- Cyber Mystery
- General Mystery

Difficulty options:

- Easy
- Medium
- Hard

Suspect count: 3–6.

The application must validate the user's input before sending it to the backend.

## Step 3: Mystery Generation

After the user clicks Generate Mystery:

1. Frontend sends the scenario to the backend.
2. Backend validates the request.
3. Backend sends a structured generation prompt to Gemini.
4. Gemini generates the complete mystery investigation.
5. Backend validates the AI response.
6. Backend generates the required media evidence.
7. Media files are uploaded to configured storage.
8. The completed mystery is saved in MongoDB.
9. Frontend receives the mystery ID and navigates to the investigation page.

Display meaningful progress messages:

- Analyzing your story.
- Creating suspects.
- Building the investigation timeline.
- Generating digital evidence.
- Preparing investigation files.
- Your mystery is ready.

These progress messages must reflect actual backend job stages, not fabricated completion claims.

If media generation is slow, allow the user to see the completed text-based investigation while individual media assets continue processing, provided their status is clearly displayed.

## Step 4: Investigation Dashboard

This is the main gameplay interface.

The user should see:

### A. Case Overview

- Mystery title.
- Case ID.
- Scenario description.
- Incident date and time (fictional).
- Location (fictional).
- Difficulty.
- Investigation status.

### B. Suspect Profiles

Each suspect should have:

- Name.
- Age (fictional).
- Occupation.
- Profile image (AI-generated).
- Short background.
- Relationship with the victim or incident.
- Possible motive.
- Alibi.
- Relevant information.

The actual culprit must not be directly disclosed.

### C. Evidence Room

Evidence should be presented in separate categories.

**1. Digital Conversations**

WhatsApp-style fictional chat records containing:

- Sender name.
- Receiver name or group.
- Message text.
- Timestamp.
- Conversation participants.
- Optional attachment.
- Important clues.

The interface should resemble a digital chat investigation interface without using WhatsApp's official branding or implying that the messages are authentic.

**2. Image Evidence**

Examples:

- Crime scene photographs (fictional).
- Objects found at the location.
- Photographs of suspects.
- CCTV screenshots.
- Documents.
- Suspicious objects.

Each image should contain:

- Image preview.
- Evidence title.
- Description.
- Timestamp.
- Evidence ID.

**3. CCTV Recordings**

The user should be able to:

- Play and pause recordings.
- View the recording duration.
- See a fictional camera ID.
- Read the location and recording timestamp.
- View generated clips or clearly identified synthetic CCTV sequences.

**4. Additional Documents**

Examples:

- Witness statements.
- Investigation reports.
- Notes.
- Entry logs.
- Call records.
- Receipts.

Every piece of evidence must have a unique ID and belong to the relevant mystery.

### D. Investigation Notes

Allow users to write personal observations.

Users should be able to:

- Add notes.
- Edit notes.
- Delete notes.

Notes should be saved against the mystery.

### E. Suspect Comparison

Provide a way to compare suspects based on:

- Motives.
- Alibis.
- Statements.
- Evidence connections.
- Contradictions.

This should help users investigate instead of simply guessing.

## Step 5: Culprit Selection

After investigating, the user clicks:

**Accuse a Suspect**

Display the list of suspects.

The user selects one suspect and submits the final answer.

Before submission, show a confirmation message:

"Are you sure you want to submit your final accusation? You may not be able to change your answer."

The initial MVP should allow only one final accusation per case.

## Step 6: Result and Solution Reveal

After submission, the backend checks the selected suspect against the stored culprit ID.

Display one of two results.

### Correct Accusation

- Congratulations message.
- Correct suspect name.
- Success animation.
- Explanation of the culprit's motive.
- Important evidence that exposed the culprit.
- How the clues connect.

### Incorrect Accusation

- Incorrect accusation message.
- Selected suspect.
- Correct culprit's identity.
- Explanation of why the selected suspect was innocent.
- Evidence that points toward the actual culprit.
- Complete solution and investigation timeline.

The application must explain the solution using the original generated case data, not generate a new contradictory answer.

---

# 6. FUNCTIONAL REQUIREMENTS

These requirements define what the application must do.

| ID    | Requirement                            | Priority |
| ----- | -------------------------------------- | -------- |
| FR-01 | Display the landing page               | Must     |
| FR-02 | Accept user-provided mystery scenarios | Must     |
| FR-03 | Validate user input                    | Must     |
| FR-04 | Generate mysteries through Gemini      | Must     |
| FR-05 | Generate multiple suspects             | Must     |
| FR-06 | Generate a hidden culprit              | Must     |
| FR-07 | Generate interconnected evidence       | Must     |
| FR-08 | Generate fictional chat evidence       | Must     |
| FR-09 | Generate image evidence                | Must     |
| FR-10 | Support CCTV-style video evidence      | Must     |
| FR-11 | Save mysteries in MongoDB              | Must     |
| FR-12 | Display investigation dashboard        | Must     |
| FR-13 | Display suspect profiles               | Must     |
| FR-14 | Display evidence by category           | Must     |
| FR-15 | Provide personal investigation notes   | Should   |
| FR-16 | Allow final suspect selection          | Must     |
| FR-17 | Validate culprit selection             | Must     |
| FR-18 | Reveal investigation solution          | Must     |
| FR-19 | Support responsive layouts             | Must     |
| FR-20 | Handle generation failures             | Must     |

Priority definitions:

- Must: Required for the MVP.
- Should: Important but can follow the core implementation.
- Could: Optional enhancement.

---

# 7. AI MYSTERY GENERATION ENGINE

This is the most important component of the project.

The AI must generate a complete investigation, not just a story.

## 7.1 AI Generation Requirements

The generation engine must create:

1. Case overview.
2. Incident details.
3. Suspects.
4. One actual culprit.
5. Victim information, when applicable.
6. Motives.
7. Investigation timeline.
8. Alibis.
9. Digital conversations.
10. Image evidence descriptions and generation prompts.
11. CCTV recording descriptions and generation prompts.
12. Additional clues.
13. Evidence relationships.
14. Correct solution.
15. Explanation of the solution.

## 7.2 Mystery Consistency Rules

These rules are mandatory.

- Exactly one culprit per mystery.
- The culprit must be one of the generated suspects.
- Every suspect must have a believable background.
- Every suspect should have a plausible reason for being investigated.
- The culprit must have a consistent motive.
- Evidence must support the actual solution.
- There must be enough clues to identify the culprit logically.
- At least one clue should contradict the culprit's alibi or expose an important inconsistency.
- Innocent suspects should have believable explanations for suspicious evidence.
- Evidence must not contradict the established timeline.
- The solution must be determined before the investigation is shown to the user.
- No evidence should reveal the culprit directly unless the user solves its meaning.
- The same case must always have the same culprit and solution.

**Critical:** Generate the complete mystery once, validate it, and store it. Never ask Gemini to independently decide the culprit again when the user submits an accusation.

## 7.3 Structured AI Output

Gemini must return structured JSON rather than unstructured paragraphs.

Use the following as the logical output contract:

```json
{
  "case": {
    "title": "The Missing Diamond",
    "category": "Theft",
    "difficulty": "Medium",
    "description": "A diamond disappeared...",
    "location": "Grand Royal Hotel",
    "incidentDate": "2026-10-20T20:00:00Z"
  },
  "victim": {
    "name": "Richard Cole",
    "background": "..."
  },
  "suspects": [
    {
      "id": "S1",
      "name": "Alex Morgan",
      "occupation": "Event Manager",
      "background": "...",
      "motive": "...",
      "alibi": "...",
      "profileImagePrompt": "..."
    }
  ],
  "evidence": [
    {
      "id": "E1",
      "type": "chat",
      "title": "Suspicious Conversation",
      "description": "...",
      "timestamp": "2026-10-20T19:30:00Z",
      "content": {},
      "mediaPrompt": null,
      "relatedSuspectIds": ["S1"],
      "reveals": "..."
    }
  ],
  "timeline": [],
  "solution": {
    "culpritId": "S1",
    "motive": "...",
    "explanation": "...",
    "evidenceIds": ["E1"]
  }
}
```

This is an illustrative contract, not a complete fixed response. The implementation must define and validate the complete Zod schema, including all nested fields and evidence-type-specific content.

## 7.4 Protect the Culprit Information

The actual culprit must remain secret during the investigation.

The backend must maintain a strict separation between:

- Public investigation data.
- Private solution data.

The API must never expose:

- Culprit ID.
- Actual motive if it directly reveals the answer.
- Hidden solution.
- Private reasoning used to construct the mystery.

The frontend must receive only the public case data until the final accusation is submitted.

Do not rely on CSS hiding, disabled UI elements, or frontend filtering to protect the culprit.

## 7.5 AI Validation

Before saving the generated case, validate:

- Exactly one valid culprit exists.
- Culprit ID belongs to the suspects list.
- Every evidence ID is unique.
- All related suspect IDs exist.
- Evidence timestamps are valid.
- The timeline is logically consistent.
- Evidence references are valid.
- The solution references existing evidence.
- The case satisfies the minimum evidence requirements.

If validation fails, retry generation with a correction prompt, with a strict retry limit.

Never silently accept an invalid case.

---

# 8. MEDIA GENERATION SYSTEM

The application must support AI-created visual and video evidence.

## 8.1 Image Generation

Generate images for:

- Suspect profile photographs.
- Scene photographs.
- Important objects.
- Suspicious locations.
- Documents where visual representation is useful.

Each image must be associated with an evidence ID or suspect ID.

Image generation prompts should use the already-established story context so that images remain consistent with the case.

## 8.2 CCTV Video Generation

Generate fictional CCTV-style recordings containing:

- Camera perspective.
- Location.
- Recording time.
- Appropriate visual atmosphere.
- Relevant incident activity.
- Clip duration.

The recording must be consistent with the investigation timeline.

## 8.3 Video Fallback

If the configured video-generation service is unavailable:

- Do not create a fake playable video URL.
- Mark the evidence as unavailable or pending.
- Provide a clearly labeled synthetic CCTV frame sequence only if it is generated and actually playable.
- Allow the user to continue investigating other evidence.

## 8.4 Media Storage

Do not store large binary media files directly inside MongoDB documents.

Store files in an object storage service such as Cloudinary or Google Cloud Storage.

MongoDB should store:

- File URL or storage key.
- File type.
- File size.
- Evidence ID.
- Generation status.
- Creation timestamp.

Media URLs must be validated before returning them to the frontend.

---

# 9. DATABASE DESIGN

Use MongoDB with Mongoose.

The database should contain the following collections.

## 9.1 Mysteries Collection

Purpose: Store the generated mystery and its public and private investigation data.

Fields:

- \_id
- title
- originalScenario
- category
- difficulty
- status
- location
- incidentDate
- victim
- suspects
- publicEvidence
- timeline
- solution
- generationStatus
- createdAt
- updatedAt

The solution must be stored privately and never exposed through public mystery endpoints.

## 9.2 Evidence Collection

Purpose: Store evidence separately for better organization and media management.

Fields:

- \_id
- mysteryId
- evidenceId
- type
- title
- description
- timestamp
- content
- mediaUrl
- mediaStorageKey
- mediaStatus
- relatedSuspectIds
- createdAt

Evidence types:

- chat
- image
- video
- document
- witness_statement
- system_log

## 9.3 Investigation Notes Collection

Fields:

- \_id
- mysteryId
- sessionId
- content
- createdAt
- updatedAt

For the guest MVP, associate notes with a securely generated anonymous investigation session.

## 9.4 Accusations Collection

Fields:

- \_id
- mysteryId
- sessionId
- selectedSuspectId
- isCorrect
- submittedAt

Use a unique constraint on mysteryId + sessionId to prevent multiple final accusations from the same investigation session.

## 9.5 Database Relationships

- One mystery contains multiple suspects.
- One mystery contains multiple evidence records.
- One mystery contains one private solution.
- One investigation session can create multiple notes.
- One investigation session can submit one final accusation per mystery.

Use appropriate indexes on mysteryId, evidenceId, sessionId, and createdAt.

---

# 10. BACKEND ARCHITECTURE

Follow a modular MVC-inspired architecture.

Recommended structure:

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── gemini.js
│   │   └── storage.js
│   │
│   ├── models/
│   │   ├── Mystery.js
│   │   ├── Evidence.js
│   │   ├── Note.js
│   │   └── Accusation.js
│   │
│   ├── controllers/
│   │   ├── mysteryController.js
│   │   ├── evidenceController.js
│   │   ├── noteController.js
│   │   └── accusationController.js
│   │
│   ├── routes/
│   │   ├── mysteryRoutes.js
│   │   ├── evidenceRoutes.js
│   │   ├── noteRoutes.js
│   │   └── accusationRoutes.js
│   │
│   ├── services/
│   │   ├── mysteryGenerator.js
│   │   ├── evidenceGenerator.js
│   │   ├── imageGenerator.js
│   │   ├── videoGenerator.js
│   │   └── solutionValidator.js
│   │
│   ├── validators/
│   │   ├── mysterySchema.js
│   │   └── requestSchemas.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── sessionMiddleware.js
│   │
│   ├── utils/
│   │   ├── prompts.js
│   │   └── apiResponse.js
│   │
│   └── server.js
│
├── tests/
├── .env.example
└── package.json
```

The architecture may be adjusted when implementation requires it, but responsibilities must remain separated.

---

# 11. API SPECIFICATION

All APIs must use JSON except where media uploads are explicitly required.

Base URL:

`/api/v1`

## 11.1 Mystery APIs

| Method | Endpoint             | Purpose                         |
| ------ | -------------------- | ------------------------------- |
| POST   | /mysteries           | Create and generate a mystery   |
| GET    | /mysteries/          | Retrieve public mystery details |
| GET    | /mysteries//status   | Check generation progress       |
| GET    | /mysteries//evidence | Retrieve public evidence        |
| GET    | /mysteries//suspects | Retrieve suspect information    |

## 11.2 Evidence APIs

| Method | Endpoint             | Purpose                               |
| ------ | -------------------- | ------------------------------------- |
| GET    | /evidence/           | Retrieve individual evidence          |
| GET    | /mysteries//evidence | Retrieve evidence belonging to a case |

## 11.3 Notes APIs

| Method | Endpoint          | Purpose                      |
| ------ | ----------------- | ---------------------------- |
| POST   | /mysteries//notes | Create investigation note    |
| GET    | /mysteries//notes | Retrieve investigation notes |
| PATCH  | /notes/           | Update investigation note    |
| DELETE | /notes/           | Delete investigation note    |

## 11.4 Accusation APIs

| Method | Endpoint                | Purpose                              |
| ------ | ----------------------- | ------------------------------------ |
| POST   | /mysteries//accusations | Submit final accusation              |
| GET    | /mysteries//result      | Retrieve the result after submission |

## 11.5 API Request Examples

Create mystery:

```json
{
  "title": "The Missing Diamond",
  "scenario": "A diamond disappeared during a private party.",
  "category": "Theft",
  "difficulty": "Medium",
  "suspectCount": 5
}
```

Submit accusation:

```json
{
  "selectedSuspectId": "S2"
}
```

The backend must derive the investigation session from a secure session cookie rather than trusting a session ID supplied in the request body.

## 11.6 API Response Standards

Use a consistent response format.

Success:

```json
{
  "success": true,
  "message": "Mystery generated successfully",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Mystery generation failed",
  "error": {
    "code": "GENERATION_FAILED"
  }
}
```

Use appropriate HTTP status codes:

- 200: Successful request.
- 201: Resource created.
- 202: Generation accepted and processing.
- 400: Invalid request.
- 401: Authentication required, if applicable.
- 403: Unauthorized access.
- 404: Resource not found.
- 409: Duplicate accusation or conflicting state.
- 429: Rate limit exceeded.
- 500: Internal server error.
- 503: External AI or storage service unavailable.

---

# 12. FRONTEND PAGE SPECIFICATION

The frontend should contain the following pages.

## Page 1: Landing Page

Route: `/`

Components:

- Navbar.
- Hero section.
- Create Mystery CTA.
- How It Works.
- Feature cards.
- Footer.

## Page 2: Create Mystery

Route: `/create`

Components:

- Story input area.
- Category selector.
- Difficulty selector.
- Suspect count selector.
- Generate button.
- Input validation messages.

## Page 3: Generation Page

Route: `/generating/:id`

Components:

- Loading animation.
- Current generation stage.
- Progress indicator.
- Error and retry handling.

## Page 4: Investigation Dashboard

Route: `/case/:id`

Components:

- Case header.
- Case overview.
- Suspect profiles.
- Evidence navigation.
- Evidence viewer.
- Investigation notes.
- Accuse a Suspect button.

## Page 5: Accusation Page

Route: `/case/:id/accuse`

Components:

- Suspect selection.
- Suspect summaries.
- Final submission confirmation.

## Page 6: Results Page

Route: `/case/:id/result`

Components:

- Correct/incorrect result.
- Selected suspect.
- Actual culprit.
- Motive.
- Evidence breakdown.
- Full investigation explanation.
- Play Again / Create Another Mystery CTA.

---

# 13. UI/UX DESIGN REQUIREMENTS

## 13.1 Design Direction

The application should have a dark detective-investigation atmosphere.

Visual inspiration:

- Detective investigation rooms.
- Classified investigation files.
- Digital evidence dashboards.
- Crime investigation boards.
- Surveillance control rooms.

## 13.2 Color Palette

Suggested design tokens:

| Element              | Color   |
| -------------------- | ------- |
| Main background      | #0B0F14 |
| Secondary background | #141B23 |
| Card background      | #1B2530 |
| Primary accent       | #D6A84F |
| Secondary accent     | #6CA6CD |
| Main text            | #F5F5F5 |
| Secondary text       | #A5AFBA |
| Error                | #E56B6F |
| Success              | #70C49A |

Use these as initial design tokens. Maintain consistent colors throughout the application.

## 13.3 UI Principles

- Dark theme as the default.
- Professional and modern layout.
- Smooth transitions and animations.
- Clear typography.
- Evidence should be easy to navigate.
- Important clues should not be visually hidden.
- Mobile-friendly design.
- Accessible buttons and controls.
- Loading, empty, and error states for all major components.

Avoid making the interface overly complicated or cluttered.

---

# 14. NON-FUNCTIONAL REQUIREMENTS

## Performance

- Frontend pages should load quickly.
- Avoid unnecessary API calls.
- Use lazy loading for images and videos.
- Paginate or limit evidence retrieval where appropriate.
- Run media generation asynchronously.
- Avoid blocking the server while waiting for long-running AI operations.

## Security

- Store API keys only in backend environment variables.
- Never expose Gemini API keys in frontend code.
- Validate all incoming requests.
- Sanitize user-generated content.
- Implement rate limiting.
- Use secure session cookies.
- Protect private solution data.
- Restrict access to notes and accusations by session.
- Validate media types and file sizes.
- Prevent unauthorized access to mystery resources.

## Reliability

- Handle Gemini API errors.
- Handle media-generation failures.
- Provide meaningful error messages.
- Support generation retries without creating duplicate mysteries.
- Preserve generated mystery consistency.
- Never lose the original culprit and solution after generation.

## Scalability

- Separate AI services from API controllers.
- Use asynchronous generation jobs.
- Use external media storage.
- Keep database queries efficient.
- Make AI model configuration environment-driven.

## Accessibility

- Provide meaningful alt text for evidence images.
- Ensure keyboard navigation.
- Use sufficient text contrast.
- Provide accessible labels for controls.

---

# 15. ENVIRONMENT VARIABLES

Create `.env.example` in the backend.

Expected configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=

GEMINI_API_KEY=
GEMINI_TEXT_MODEL=

IMAGE_PROVIDER=
IMAGE_API_KEY=

VIDEO_PROVIDER=
VIDEO_API_KEY=

MEDIA_STORAGE_PROVIDER=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=
SESSION_SECRET=
```

Requirements:

- Never commit `.env` files.
- Include `.env.example` in Git.
- Validate required environment variables at application startup.
- Keep frontend and backend environment variables separate.
- Never expose private keys through Vite environment variables.

Model names and providers must be configurable rather than hardcoded throughout the application.

---

# 16. ERROR HANDLING

The application must handle the following scenarios:

| Scenario                   | Expected behavior                                    |
| -------------------------- | ---------------------------------------------------- |
| Empty story input          | Display validation error                             |
| Very short story           | Ask user to provide more details                     |
| Gemini API failure         | Display retry option                                 |
| Invalid AI JSON            | Validate and retry generation                        |
| Image generation failure   | Mark individual evidence unavailable                 |
| Video generation failure   | Display unavailable status or valid fallback         |
| MongoDB connection failure | Return service error                                 |
| Invalid mystery ID         | Display case not found                               |
| Invalid suspect selection  | Reject accusation                                    |
| Duplicate accusation       | Return conflict response                             |
| Expired session            | Ask user to restart or recover the session           |
| Network interruption       | Preserve available case data and retry safe requests |

Do not reveal internal API keys, stack traces, or private AI prompts in frontend error messages.

---

# 17. TESTING REQUIREMENTS

Testing must cover frontend, backend, AI integration, and security.

## 17.1 Functional Testing

- Landing page loads.
- User can submit a story.
- Mystery generation works.
- Suspects are displayed.
- Evidence is displayed correctly.
- Images load.
- Videos play when available.
- Investigation notes work.
- Culprit selection works.
- Correct answers are evaluated correctly.
- Incorrect answers are evaluated correctly.
- Results display the complete solution.

## 17.2 AI Testing

- Gemini returns valid structured output.
- Exactly one culprit is generated.
- Culprit belongs to the suspect list.
- Evidence supports the solution.
- No contradictory timestamps exist.
- Suspect information is consistent.
- Public API responses do not reveal the culprit.
- AI output cannot override backend validation.

## 17.3 Security Testing

- Attempt to access private solution data.
- Attempt to submit an invalid suspect ID.
- Attempt duplicate accusations.
- Attempt to access another session's notes.
- Verify that API keys are not exposed.
- Verify session and cookie security.

## 17.4 Automated Testing

Use:

- Vitest for frontend tests.
- Jest or Vitest for backend tests.
- Supertest for API integration tests.

---

# 18. PROJECT DEVELOPMENT PHASES

Codex must develop the application in the following stages.

## Phase 1: Project Foundation

- Create React + Vite frontend.
- Create Express backend.
- Configure MongoDB.
- Set up folder structure.
- Configure environment variables.
- Set up error handling.
- Verify frontend/backend connectivity.

**Completion condition:** Basic application runs successfully.

## Phase 2: Frontend UI

- Develop landing page.
- Develop mystery creation form.
- Develop generation interface.
- Develop investigation dashboard.
- Develop suspect cards.
- Develop evidence viewer.
- Develop accusation interface.
- Develop results page.

**Completion condition:** All main screens work with mock data.

## Phase 3: AI Integration

- Integrate Gemini.
- Create mystery-generation prompts.
- Implement structured JSON responses.
- Implement Zod validation.
- Implement culprit consistency rules.
- Implement public/private data separation.

**Completion condition:** Valid fictional mysteries can be generated and saved.

## Phase 4: Evidence Generation

- Generate fictional chat records.
- Generate image evidence.
- Generate CCTV-style videos.
- Integrate media storage.
- Link media to evidence records.
- Implement asynchronous generation status.

**Completion condition:** Investigation evidence is accessible and correctly associated with its mystery.

## Phase 5: Investigation Logic

- Display mystery details.
- Display suspect information.
- Display evidence.
- Implement notes.
- Implement final accusation.
- Implement answer validation.
- Implement solution reveal.

**Completion condition:** Complete end-to-end mystery-solving workflow works.

## Phase 6: Testing and Optimization

- Fix UI issues.
- Test backend APIs.
- Test AI consistency.
- Test session isolation.
- Optimize media loading.
- Test mobile responsiveness.
- Verify security.

**Completion condition:** MVP passes all critical acceptance tests.

## Phase 7: Deployment

- Deploy frontend.
- Deploy backend.
- Configure production MongoDB.
- Configure AI API credentials.
- Configure media storage.
- Verify production environment.
- Test deployed application.

**Completion condition:** The application works in production.

---

# 19. MVP SCOPE VS FUTURE ENHANCEMENTS

Codex must prioritize the MVP and must not implement every future feature immediately.

## MVP — Version 1.0

The first release must include:

- Landing page.
- Story submission.
- Difficulty selection.
- Suspect generation.
- Hidden culprit generation.
- AI-generated evidence.
- Chat evidence.
- Image evidence.
- CCTV-style video evidence when the configured provider supports it.
- Investigation dashboard.
- Suspect profiles.
- Evidence viewer.
- Culprit selection.
- Result and solution reveal.
- Guest investigation sessions.
- MongoDB persistence.

## Future Enhancements — Version 2.0

These features are not required for the first release:

1. User registration and login.
2. User profile dashboard.
3. Mystery history.
4. Saved investigations.
5. Mystery difficulty customization.
6. Multiplayer investigation mode.
7. Friends can investigate the same case.
8. Leaderboards.
9. Scoring system.
10. Investigation timer.
11. Hints system.
12. AI detective assistant.
13. AI-generated voice recordings.
14. More realistic interactive evidence.
15. Community-created mysteries.

Do not build future enhancements unless the MVP is complete and stable.

---

# 20. ACCEPTANCE CRITERIA

The application will be considered successfully implemented when all the following conditions are satisfied.

### Core Application

- [ ] Landing page works.
- [ ] User can submit a custom scenario.
- [ ] Input validation works.
- [ ] User can choose difficulty and suspect count.

### AI Engine

- [ ] Gemini generates a complete mystery.
- [ ] Exactly one culprit exists.
- [ ] All suspects have unique IDs.
- [ ] Evidence is logically connected.
- [ ] Mystery is saved in MongoDB.
- [ ] Culprit information remains private.

### Evidence System

- [ ] Chat evidence is displayed.
- [ ] AI-generated image evidence is accessible.
- [ ] CCTV-style video evidence is playable when generated.
- [ ] Evidence is linked to the correct mystery.
- [ ] Generation failures are handled.

### Investigation

- [ ] Suspects can be examined.
- [ ] Evidence can be viewed.
- [ ] Notes can be created and edited.
- [ ] User can select a suspect.
- [ ] Duplicate accusations are prevented.

### Results

- [ ] Correct accusation is recognized.
- [ ] Incorrect accusation is recognized.
- [ ] Actual culprit is revealed.
- [ ] Explanation is consistent with generated evidence.

### Quality

- [ ] Frontend and backend work together.
- [ ] Responsive UI works.
- [ ] API keys remain private.
- [ ] Critical security tests pass.
- [ ] No major application errors remain.

---

# 21. CODEX DEVELOPMENT INSTRUCTIONS

This section contains mandatory instructions for the AI development agent.

## 21.1 Source of Truth

This document is the authoritative specification for AI Mystery Room.

Codex must:

1. Read this entire specification before starting development.
2. Treat it as the primary reference for requirements and architecture.
3. Avoid inventing features that are not requested.
4. Avoid removing or changing defined functionality without justification.
5. Follow the defined technology stack.
6. Maintain consistent naming conventions.
7. Follow the defined API contracts.
8. Maintain the separation between public and private investigation data.
9. Keep the implementation modular and maintainable.
10. Update project documentation whenever an approved requirement changes.

## 21.2 Development Rules

- Do not generate the entire project in one uncontrolled implementation step.
- Build the project in the phases defined in this document.
- Do not skip backend architecture and database design.
- Do not hardcode API keys.
- Do not use mock data as a permanent replacement for required AI functionality.
- Do not expose the culprit through frontend state or public APIs.
- Do not generate fake media URLs.
- Do not claim that an image or video has been generated unless a provider has returned a valid asset.
- Do not duplicate API calls unnecessarily.
- Do not install unnecessary dependencies.
- Do not create unnecessary components.
- Use reusable components.
- Maintain consistent UI design.
- Handle errors properly.
- Write tests for critical functionality.
- Keep the project runnable after every development phase.

## 21.3 Change Management

Whenever a requirement changes:

1. Update this master specification.
2. Identify affected frontend components.
3. Identify affected backend services.
4. Identify affected database schemas.
5. Identify affected API contracts.
6. Update tests.
7. Implement the change.
8. Verify that existing functionality still works.

Do not silently deviate from the specification.

## 21.4 Progress Tracking

Maintain a `tasks.md` file.

Track each task using:

- `[ ]` Not started.
- `[~]` In progress.
- `[x]` Completed.
- `[!]` Blocked.

Codex must update this file after completing each meaningful task.

Maintain an `implementation-decisions.md` file to document important technical decisions, deviations, and reasons.

---

# 22. DEFINITION OF DONE

A feature is not considered complete merely because its code has been written.

A feature is complete only when:

1. Its functionality is implemented.
2. Its UI is integrated.
3. Its backend logic works.
4. Its database operations work, where applicable.
5. Its error handling is implemented.
6. Its relevant tests pass.
7. It follows this specification.
8. It has been verified in the running application.

The MVP is complete only when the entire mystery creation, investigation, accusation, and solution-reveal workflow works end to end.

---

# 23. FINAL PRODUCT SUMMARY

AI Mystery Room is an AI-powered fictional investigation platform where users transform their own story ideas into interactive detective cases.

The application uses Gemini to create the investigation, suspects, culprit, clues, and digital evidence. It uses configured media-generation services to create fictional visual and video evidence.

Users investigate the case through a digital evidence dashboard, analyze suspects, connect clues, and submit their final accusation.

The application then reveals the actual culprit and explains the complete mystery.

**The central product principle is:**

"Every mystery should feel like a complete investigation, where the answer can be discovered through evidence rather than random guessing."

---

**END OF MASTER SPECIFICATION**

**Document status:** Authoritative project specification for AI Mystery Room Version 1.0.
