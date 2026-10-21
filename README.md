# SceneSense: AI-Powered Contextual Viewing Assistant

> **Amazon Developer Hackathon Submission**  
> An intelligent, TV-inspired contextual viewing companion that synchronizes educational video playback with real-time concept tracking, an offline-first RAG chat assistant, simple concept breakdowns (ELI5), interactive comprehension quizzes, and session notebooks.

---

## Architecture Overview

```
                                      +-----------------------------+
                                      |    TV / Web Client (React)  |
                                      |    - Cinematic Video Player |
                                      |    - X-Ray Context HUD      |
                                      |    - Ask SceneSense Chat    |
                                      |    - ELI5 Concept Explainer |
                                      |    - Interactive Quiz       |
                                      +--------------+--------------+
                                                     |
                                                     | JSON / REST
                                                     v
+-----------------------------------------------------------------------------------------+
|                                SceneSense Backend (Node.js)                              |
|                                                                                         |
|  +--------------------+   +---------------------+   +--------------------------------+  |
|  | /api/video         |   | /api/chat           |   | /api/quiz                      |  |
|  | /api/context       |   | /api/explain        |   | /api/summary                   |  |
|  +---------+----------+   +----------+----------+   +---------------+----------------+  |
|            |                         |                              |                   |
|            |                         v                              |                   |
|            |          +-------------------------------+             |                   |
|            |          |  IAIService Abstraction Layer  |             |                   |
|            |          +---------------+---------------+             |                   |
|            |                          |                             |                   |
|            |        +-----------------+-----------------+           |                   |
|            |        |                                   |           |                   |
|            v        v                                   v           v                   |
|  +-----------------------+                    +-----------------------+                 |
|  | LocalContextAIService |                    | ExternalAIService     |                 |
|  | - Offline RAG Engine  |                    | - Optional OpenAI     |                 |
|  | - Cue / Scene Scorer  |                    | - Optional Gemini     |                 |
|  | - Zero Key Required   |                    | - Fallback Protected  |                 |
|  +-----------------------+                    +-----------------------+                 |
+-----------------------------------------------------------------------------------------+
                                 |                                |
                                 v                                v
               +----------------------------------+ +----------------------------------+
               | Prepared: MCP Tool Specifications | | Prepared: Alexa+ Multimodal ASK  |
               | - scenesense_get_current_scene   | | - AskSceneSenseIntent            |
               | - scenesense_ask_question        | | - ExplainSceneIntent             |
               | - scenesense_explain_scene       | | - QuizMeIntent                   |
               +----------------------------------+ +----------------------------------+
```

---

## Core Features

1. **Synchronized Educational Video & Transcript HUD**:
   - Sample educational video on NASA's James Webb Space Telescope (infrared astronomy, 18-segment gold mirror, cryogenic sunshield, cosmic dawn, exoplanets).
   - Real-time transcript tracking that highlights the currently spoken cue.
   - Interactive seek: clicking any transcript line instantly jumps the video to that moment.
2. **Context-Grounded "Ask SceneSense" Chat**:
   - Out of the box, runs on a zero-dependency **Local Contextual RAG Engine** that scores keywords, proximity to current playback time, and active scene concepts.
   - Automatically provides clickable citation timestamps (`[0:55]`) that seek the video to relevant proof points.
   - Intelligent follow-up suggestions for deeper exploration.
   - Replaceable backend adapter (`IAIService`): seamlessly activate OpenAI or Gemini simply by setting `AI_PROVIDER` and your API key in `.env`.
3. **Simple Explanation Mode (ELI5)**:
   - One-click concept simplification with real-world everyday analogies (e.g., comparing cosmological redshift to an ambulance siren or infrared cameras to night vision goggles).
   - Includes quick-check questions for active learning.
4. **Interactive Comprehension Challenge (Quiz)**:
   - Dynamic multiple-choice questions linked to specific video scenes.
   - Evaluated objectively on the backend (never hardcoded fake success).
   - Instant feedback with scientific explanations and "Rewatch Scene" jump buttons for any missed questions.
5. **Learning History & Executive Summary**:
   - Five synthesized key takeaways and full scene-by-scene timeline overview.
   - Personal viewing notebook: save chat answers, quiz scores, or create custom timestamped notes.
   - One-click export to Markdown (`.md`).
6. **Extensible Integrations Architecture**:
   - **Model Context Protocol (MCP)**: Formally defines 4 MCP Tool schemas (`scenesense_get_current_scene`, `scenesense_ask_question`, etc.) ready for stdio or SSE server connection.
   - **Amazon Alexa+**: Skill request/response envelope and intent schemas defined for hands-free couch viewing.
   - Status: Architecturally defined and tested; external connectivity will be activated upon deploying to the respective host.

---

## Quickstart Guide (Windows / Mac / Linux)

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9.x+

### 1. Install Dependencies
Run the following command from the project root (`scenesense`):
```powershell
npm run install:all
```
*(This installs root, backend `server`, and frontend `client` packages).*

### 2. Configure Environment (Optional)
The project runs **100% offline with zero API keys required** by default!
If you wish to test with external LLMs, copy the environment template:
```powershell
Copy-Item .env.example .env
```
Edit `.env` to configure your preferred AI provider:
```ini
PORT=5000
NODE_ENV=development
AI_PROVIDER=local       # Options: local | openai | gemini
OPENAI_API_KEY=
```

### 3. Run the Development Environment
Run both backend server and Vite frontend concurrently with a single command:
```powershell
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Running the Automated Tests

SceneSense includes automated test suites covering both the backend context engine and frontend UI components:

```powershell
# Run all tests (Server + Client)
npm test

# Run only server tests
npm --prefix server run test

# Run only client tests
npm --prefix client run test
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check & active AI engine status |
| `GET` | `/api/video` | Video metadata, scenes, and transcript cues |
| `GET` | `/api/context?time={sec}` | Real-time scene, active cue, and glossary |
| `POST` | `/api/chat` | Ask SceneSense questions with transcript citations |
| `GET` | `/api/explain?time={sec}` | Plain-English ELI5 breakdown & analogy |
| `GET` | `/api/quiz` | Sanitized comprehension questions |
| `POST` | `/api/quiz/submit` | Objective quiz evaluation & score calculation |
| `GET` | `/api/summary` | Executive takeaways & scene timeline |
| `GET` | `/api/integrations/status` | MCP & Alexa+ readiness schemas |

---

## Project Structure

```
scenesense/
├── .env.example                # Environment configuration template
├── README.md                   # Complete documentation
├── package.json                # Root concurrent scripts
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── data/videoData.ts   # Educational video dataset (NASA James Webb)
│   │   ├── services/
│   │   │   ├── aiService.ts    # Replaceable IAIService interface
│   │   │   ├── localAi.ts      # Zero-dependency offline RAG engine
│   │   │   └── externalAi.ts   # Optional OpenAI/Gemini adapter
│   │   ├── integrations/
│   │   │   ├── mcpTools.ts     # MCP Tool schemas & handlers
│   │   │   └── alexaSkill.ts   # Alexa+ ASK Intent contracts & handlers
│   │   ├── routes/api.ts       # Express REST API routes
│   │   └── index.ts            # Express server initialization
│   └── tests/api.test.ts       # Supertest backend test suite
│
└── client/                     # React + Vite + TypeScript Frontend
    ├── src/
    │   ├── components/         # VideoPlayer, ContextPanel, ChatDrawer, etc.
    │   ├── services/api.ts     # Typed API client
    │   ├── types/index.ts      # Shared data contracts
    │   ├── App.tsx             # Main view orchestrator
    │   └── main.tsx            # React root
    └── tests/                  # Vitest + React Testing Library suite
```
