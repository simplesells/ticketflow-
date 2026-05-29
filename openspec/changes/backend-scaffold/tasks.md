# Tasks

- [x] task-001: Initialize Node project with TypeScript
  **Spec:** `backend-project#Requirement-5 100%`
  **CI:** `npx tsc --noEmit`
  **AD:** none
  - Create `backend/package.json` with project metadata
  - Create `backend/tsconfig.json` with strict settings
  - Create directory structure: `src/`, `src/db/`, `src/routes/`

- [x] task-002: Install production dependencies
  **Spec:** `backend-project#Requirement-1 100%`
  **CI:** none
  **AD:** none
  - Install `express`, `cors`, `better-sqlite3`
  - Install dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`

- [x] task-003: Configure npm scripts
  **Spec:** `backend-project#Requirement-1 100%`
  **CI:** none
  **AD:** none
  - Add `dev` script using `tsx watch src/main.ts`
  - Add `start` script using `tsx src/main.ts`
  - Add `build` script using `tsc`

- [x] task-004: Create Express server entry point
  **Spec:** `backend-project#Requirement-1 100%`
  **CI:** none
  **AD:** none
  - Create `src/main.ts` with Express app setup
  - Support `PORT` environment variable, default 3000
  - Log startup message with port number

- [x] task-005: Add CORS middleware
  **Spec:** `backend-project#Requirement-4 100%`
  **CI:** none
  **AD:** none
  - Configure CORS to allow `http://localhost:5173` origin
  - Enable JSON request parsing

- [x] task-006: Implement health check endpoint
  **Spec:** `backend-project#Requirement-2 100%`
  **CI:** none
  **AD:** none
  - Create `GET /health` route returning `{"status": "ok"}` with 200 status

- [x] task-007: Verify TypeScript compilation
  **Spec:** `backend-project#Requirement-5 100%`
  **CI:** `npx tsc --noEmit`
  **AD:** none
  - Run `npx tsc --noEmit` in backend directory, ensure zero errors
  - Run `npm run dev`, verify server starts on port 3000
  - Curl `http://localhost:3000/health`, verify response
