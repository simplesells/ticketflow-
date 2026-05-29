# Tasks

- [x] task-001: Define status transition rules
  **Spec:** `status-flow#Requirement-2 100%`
  **CI:** `npx tsc --noEmit`
  **AD:** none
  - Define transition map: 待处理→处理中, 处理中→已解决, 已解决→已关闭
  - Export a `isValidTransition(from, to)` helper function

- [x] task-002: Add PATCH /:id/status route
  **Spec:** `status-flow#Requirement-1,3 100%`
  **CI:** none
  **AD:** none
  - Add PATCH route in workorders.ts
  - Validate status field is present in body
  - Call `isValidTransition` to check legality
  - Return 400 if illegal, 200 + updated workorder if legal
  - Record history entry on successful change

- [x] task-003: Verify status flow
  **Spec:** `status-flow#Requirement-1,2,3 100%`
  **CI:** none
  **AD:** none
  - Test legal transition: 待处理 → 处理中 (should succeed)
  - Test illegal transition: 待处理 → 已关闭 (should fail 400)
  - Test complete flow path: 待处理 → 处理中 → 已解决 → 已关闭
  - Verify history array has correct entries
