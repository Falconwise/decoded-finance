# QA Gate Report

Date: 2026-02-20 23:49 GMT+3
Project: decoded-finance

## Gate Summary

- **Legal:** ✅ PASS  
  Required legal pages exist and contain substantive policy text with effective date:
  - `src/pages/legal/disclaimer.astro`
  - `src/pages/legal/privacy.astro`
  - `src/pages/legal/terms.astro`

- **Content:** ✅ PASS (quick scan)  
  Core routes and content files present; no obvious TODO/TBD/lorem filler in page content.

- **Technical:** ⚠️ PARTIAL / BLOCKED  
  Static artifact checks passed from existing `dist/`, but fresh build execution is blocked by missing toolchain in runtime (`npm`/`node`/`npx` not found in PATH).

- **Ops (Deploy):** ❌ BLOCKED  
  Cloudflare Pages deployment could not run because `npx` is unavailable in runtime.

## Smoke Checks (artifact-level from `dist/`)

| Route | Expected | Observed | Result | Evidence |
|---|---:|---:|---|---|
| `/` | 200 | 200 | ✅ PASS | `dist/index.html` |
| `/blog` | 200 | 200 | ✅ PASS | `dist/blog/index.html` |
| `/about` | 200 | 200 | ✅ PASS | `dist/about/index.html` |
| `/ipo-tracker` | 200 | 200 | ✅ PASS | `dist/ipo-tracker/index.html` |
| `/legal/disclaimer` | 200 | 200 | ✅ PASS | `dist/legal/disclaimer/index.html` |
| `/legal/privacy` | 200 | 200 | ✅ PASS | `dist/legal/privacy/index.html` |
| `/legal/terms` | 200 | 200 | ✅ PASS | `dist/legal/terms/index.html` |
| `/contact` | 404 | 404 | ✅ PASS | `dist/_redirects` maps `/contact` -> `/404.html 404`, no `dist/contact/index.html` |

## Blocking Command Outputs

### Build attempt
```powershell
npm run build
```
Output:
```text
npm : The term 'npm' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### Deploy attempt
```powershell
npx wrangler pages deploy dist
```
Output:
```text
npx : The term 'npx' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## Deployment URL

- **Not available** (deployment blocked in current runtime).
