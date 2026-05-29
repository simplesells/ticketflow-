# Tasks

- [x] task-001: Create database connection module
  **Spec:** `workorder-crud#Requirement-1 100%`
  **CI:** `npx tsc --noEmit`
  **AD:** none
  - Create `src/db/database.ts` with better-sqlite3 initialization
  - On module load, create `workorders` table if not exists
  - Export `db` instance for route handlers to use

- [x] task-002: Seed sample data
  **Spec:** `workorder-crud#Requirement-1 100%`
  **CI:** none
  **AD:** none
  - Create `src/db/seed.ts` with 5 sample work orders
  - Call seed function after database init, skip if data already exists

- [x] task-003: Create work order route handler with Express Router
  **Spec:** `workorder-crud#Requirement-2,3,4,5 100%`
  **CI:** none
  **AD:** none
  - Create `src/routes/workorders.ts` with Express Router
  - Implement `GET /` (list with optional `?status=` filter)
  - Implement `GET /:id` (detail, 404 if not found)
  - Implement `POST /` (create, validate required fields, return 201)
  - Implement `DELETE /:id` (delete, 404 if not found)
  - Helper: `generateCode()` for WO-YYYYMMDD-NNNN format
  - Helper: `rowToWorkOrder()` to parse JSON history field

- [x] task-004: Mount routes in main.ts
  **Spec:** `workorder-crud#Requirement-2 100%`
  **CI:** none
  **AD:** none
  - Import and mount workorder router at `/api/workorders` in `src/main.ts`
  - Initialize database on server start

- [x] task-005: Verify API endpoints
  **Spec:** `workorder-crud#Requirement-2,3,4,5 100%`
  **CI:** none
  **AD:** none
  - Start server, curl GET `/api/workorders` → 200 + array
  - Curl POST `/api/workorders` with test data → 201 + new work order
  - Curl GET `/api/workorders/1` → 200 + detail
  - Curl DELETE `/api/workorders/1` → 200
  - Curl GET `/api/workorders/999` → 404
  - Curl POST with missing title → 400
