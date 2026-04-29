<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# askjune.ai // terminal

A blockchain AI terminal powered by the June API (blockchain.info).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import it in [vercel.com](https://vercel.com)
3. Add environment variable in **Project → Settings → Environment Variables**:
   - `JUNE_API_KEY` → your June API key
4. Deploy — done.

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.example .env.local
# Add your JUNE_API_KEY to .env.local
npm run dev
```

> Local dev uses Vite's built-in dev server. The `/api/*` routes won't work locally without Vercel CLI.
> Install it with `npm i -g vercel` then run `vercel dev` instead of `npm run dev`.
