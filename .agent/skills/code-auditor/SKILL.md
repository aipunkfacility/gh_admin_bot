---
name: code-auditor
description: Quality assurance skill for auditing code. Use before merges to check for security, performance, and best practices.
---

# Code Auditor

Checklists and guidelines for maintaining code quality.

## Audit Checklists

### 1. Astro / Frontend

- [ ] **Hydration**: Is `client:load` used only where necessary? (Performance)
- [ ] **Images**: Are images optimized (WebP/Avif)? Do they have `alt` tags? (SEO/Perf)
- [ ] **Security**: Is `set:html` usage sanitized? (XSS)

### 2. Backend / API

- [ ] **Validation**: Are all inputs validated (zod/Joi)?
- [ ] **Auth**: Is `admin_token` checked for protected routes?
- [ ] **Error Handling**: Are errors logged and not leaked to client (stack traces)?

### 3. Telegram Bot

- [ ] **Session**: Is session state cleaned up after flow end?
- [ ] **Throttling**: Are bulk notifications limited (30 msg/sec limit)?
- [ ] **Escaping**: Is HTML/Markdown escaped in user inputs?

## Security Audit

**Critical Checks:**

1. `.env` vars are NOT committed.
2. `admin_password` is strong.
3. API endpoints rate-limited (future).

## Automated Checks

- Run `npm run lint` (if available).
- Run `npm audit`.
