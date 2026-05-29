# Tasks

- [x] task-001: Create work order form page
  **Spec:** `workorder-interaction#Requirement-1 100%`
  **CI:** none
  **AD:** none
  - Create `WorkOrderForm.tsx` with controlled form inputs
  - Validate required fields (title, description, type, priority)
  - On submit, call `createWorkOrder`, redirect to detail page
  - Add route `/new` in App.tsx

- [x] task-002: Create work order detail page
  **Spec:** `workorder-interaction#Requirement-2,3 100%`
  **CI:** none
  **AD:** none
  - Create `WorkOrderDetail.tsx` showing full work order info
  - Display status history timeline
  - Show "next status" buttons based on current status
  - Call `updateWorkOrderStatus` on button click, refresh after
  - Add route `/:id` in App.tsx
