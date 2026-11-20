# Lingua Ledger

A language notebook built with HTML, CSS, and vanilla JavaScript. Add words with multiple meanings, review them in flip cards, and turn rough notes into corrected explanations and examples.

Vocabulary and saved notes live in `localStorage` for the current browser and site origin. They do not sync across browsers, devices, or deployments, and clearing site data removes them. Only the note you submit is sent to OpenAI; vocabulary stays in the browser.

## Deploy to Vercel (recommended)

1. Import `AmirGFno/language-notes-app` into Vercel. Use the repository root and the **Other** framework preset. Leave build and output settings at their defaults; no build step is needed.
2. In **Project Settings → Environment Variables**, add `OPENAI_API_KEY` to **Production** (and **Preview** if you want AI notes in previews). Use an OpenAI project key with API billing enabled. Optionally set `OPENAI_MODEL`; the default is `gpt-4o-mini`.
3. Deploy or redeploy after saving environment variables. Open the Vercel site and submit a test note. The frontend calls `/api/improve-note` on the same origin by default.

Never put your key in `config.js`, frontend files, or GitHub Pages settings. `.env.example` documents the server-side variables and contains no credentials.

## GitHub Pages frontend + Vercel API

1. Deploy the API to Vercel using the instructions above.
2. Set `FRONTEND_ORIGIN` in Vercel to `https://amirgfno.github.io`, or to your Pages custom origin. Do not include the repository path or a trailing slash. Redeploy Vercel.
3. Set `window.NOTE_API_ENDPOINT` in `config.js` to your public Vercel deployment URL followed by `/api/improve-note`, then land that change on `main`. This setting is public and does not contain the key. It also applies to the Vercel-hosted frontend, so use the stable public production URL.
4. In GitHub, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included workflow deploys on pushes to `main` and can be run manually from `main`. It uploads only the four frontend assets; `/api` and environment files are not published.

Pages can run vocabulary without an API. AI notes require the configured Vercel endpoint. The origin check is for browser cross-origin requests, **not authentication**: scripts outside a browser can still call a public API. Set OpenAI project limits and monitor usage; before sharing the app widely, add abuse protection (e.g. authenticated access and server-side rate limiting).

## Local development

- For vocabulary and the static UI: run `python3 -m http.server 8000` from the repo root and open `http://localhost:8000`.
- For the full app: copy `.env.example` to `.env.local`, set the API key, then run `npx vercel dev` and follow the Vercel CLI setup prompts. With the default `config.js`, the local frontend uses the local function.
