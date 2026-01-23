---
name: seo-strategist
description: SEO optimization skill for Astro project. Use for generating meta tags, sitemap, structured data, and performance tuning.
---

# SEO Strategist

Guides for maximizing Green Hill's search engine visibility.

## Meta Tags

**Global Verification**:

- [ ] Title is unique per page.
- [ ] Description is 150-160 chars.
- [ ] `canonical` URL is set.
- [ ] `og:image` is present (1200x630).

**Template (Astro)**:

```html
<title>{title} | Green Hill Tours</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:image" content={image} />
```

## Structured Data (JSON-LD)

**Organization (Global)**:

```json
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Green Hill Tours",
  "image": "https://gh-tours.com/logo.png",
  "telephone": "+84..."
}
```

**Product (Excursion/Rental)**:

- Must have `name`, `description`, `price`, `image`.
- Review references in `references/schema.md` (to be created).

## Performance (Core Web Vitals)

- **LCP**: Preload hero images.
- **CLS**: reserve space for async images.
- **INP**: Avoid heavy JS on main thread.
