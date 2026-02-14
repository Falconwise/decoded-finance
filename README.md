# decoded.finance

**Saudi IPO Analysis & Corporate Finance Platform**  
Built with Astro 5.x · React · TanStack Table · Tailwind CSS

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site will be available at `http://localhost:4321`

---

## Project Structure

```
src/
├── components/
│   ├── core/         → Header, Footer, BaseHead (SEO)
│   ├── home/         → Hero, FeaturedCaseStudy, IPOPreview
│   └── ipo-tracker/  → IPOTable.tsx (React + TanStack Table)
├── content/
│   ├── blog/         → Blog posts (.mdx)
│   └── case-studies/ → Case studies (.mdx)
├── data/
│   └── ipo-data.ts   → IPO records (TypeScript)
├── layouts/
│   └── BaseLayout.astro
├── pages/            → All routes
├── styles/
│   └── global.css    → Brand system CSS
└── utils/
    └── utils.ts      → Formatting helpers
```

---

## Content Management

### Adding a Blog Post

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
author: "Abdul Gaffar Mohammed, CFA"
publishedDate: "2026-03-01"
reading_time: 5
tags: ["valuation", "saudi-markets"]
description: "A brief description of the post."
featured: false
---

Your content in Markdown here...
```

### Adding a Case Study

Create a new `.mdx` file in `src/content/case-studies/`:

```mdx
---
title: "Company Name IPO Analysis"
company: "Company Name"
sector: "Financials"
ipo_date: "2026-03-01"
offer_price: 50
valuation_sar: 5000000000
recommendation: "Buy"
target_price: 60
reading_time: 15
publishedDate: "2026-03-15"
tags: ["ipo", "financials"]
description: "Brief description of the analysis."
---

Your analysis content here...
```

### Updating IPO Data

Edit `src/data/ipo-data.ts` — add or modify records in the `ipos` array. Each record follows the `IPORecord` interface.

---

## Configuration

### Formspree (Contact Form)

1. Create an account at [formspree.io](https://formspree.io)
2. Create a new form
3. Replace `YOUR_FORM_ID` in `src/pages/contact.astro` with your form endpoint ID

### Site URL

Update the `site` property in `astro.config.mjs` if deploying to a different domain.

---

## Deployment to Cloudflare Pages

1. Push to a Git repository (GitHub/GitLab)
2. Connect repository to Cloudflare Pages
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy

Or deploy manually:
```bash
npm run build
npx wrangler pages deploy dist
```

---

## Brand Kit

- **Primary (Sage Olive):** `#7A8B72`
- **Accent (Antique Copper):** `#B86E4B`
- **Background (Alabaster):** `#F4F1EA`
- **Text (Graphite):** `#333333`
- **Headings:** Playfair Display 700
- **Body:** Lato 400/700
- **Data:** JetBrains Mono

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Astro 5.x | Static site generator |
| React 19 | Interactive components (islands) |
| TanStack Table v8 | IPO data grid |
| Tailwind CSS 3 | Utility-first styling |
| MDX | Content authoring |
| TypeScript | Type safety |

---

Built by Abdul Gaffar Mohammed, CFA · [decoded.finance](https://decoded.finance)
