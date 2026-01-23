---
name: astro-optimization
description: Optimization techniques and patterns for Astro SSR in Green Hill project. Use for API routes, middleware, and performance tuning.
---

# Astro Optimization

Best practices for the Green Hill Astro SSR application.

## Core Concepts

### 1. SSR & API Routes

Since we use `output: 'server'`, all API routes under `src/pages/api` are dynamic.

- Use `export const GET/POST` handlers.
- Return `Response` objects (standard Request/Response API).
- **Important**: Do not use `fs` directly in pages if possible; use API routes for server-side logic.

### 2. Middleware (`src/middleware.js`)

Used for authentication.

- Check `cookies` for `admin_token`.
- Redirect unauthenticated users from `/admin`.
- Attach `locals.user` if needed.

### 3. Image Optimization

Use `<Image />` component from `astro:assets` where possible, but for dynamic user uploads (in `/public/uploads`), standard `<img>` tags are often easier unless we implement an image service.

## Performance Tips

- **Preloading**: Use `<link rel="preload">` for critical assets (fonts).
- **Caching**: Configure Nginx to cache static assets in `/dist/client`.
