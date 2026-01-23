---
name: qa-engineer
description: Quality Assurance testing skill. Use to verify functionality, run E2E scenarios, and check data consistency.
---

# QA Engineer

Testing strategies and scenarios for Green Hill.

## Manual Test Scenarios

### 1. Booking Flow (Critical)

1. User selects "Excursion" on Site.
2. User fills form -> "Book".
3. **Check**: Telegram Admin receives notification?
4. **Check**: Admin sets status "Confirmed".
5. **Check**: User sees status invalidation (if implemented).

### 2. Admin CRUD

1. Login to Admin Panel.
2. Create new "Transport" item.
   - Upload Image.
   - Set Price.
3. Save.
4. **Check**: Item appears in List?
5. **Check**: Item appears on Public Site?

### 3. Telegram Bot

1. Send `/start`.
2. Navigate: Rentals -> Motorbikes.
3. **Check**: Pagination works?
4. **Check**: Images load? (If HTTPs fixed).

## Automated Testing (Planned)

- **Framework**: Playwright
- **Tests**:
  - `tests/auth.spec.ts` (Login)
  - `tests/api.spec.ts` (API Endpoints)
