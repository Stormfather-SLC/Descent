# DESCENT — deployment guide

This folder contains the whole game:
- `public/index.html` — the game itself (frontend)
- `api/game.js` — a small backend function that holds your Anthropic API key and talks to Claude on the game's behalf, so players never see your key
- `vercel.json`, `package.json` — hosting config

You need two things before you start:
1. An Anthropic API key — get one at https://console.anthropic.com/settings/keys (this is a *separate* thing from a claude.ai subscription; it's pay-as-you-go and you'll need billing set up).
2. A free Vercel account — https://vercel.com/signup (you can sign up with GitHub).

## Option A: Deploy with the Vercel website (no command line)

1. Put this whole folder in a GitHub repository (create a new repo, upload these files, or drag-and-drop them in GitHub's web uploader).
2. Go to https://vercel.com/new and import that repository.
3. Vercel will detect it automatically — no build command needed, leave defaults.
4. Before deploying, open **Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your key from step 1 above
   - `GAME_ACCESS_CODE` = any password you make up (optional, but recommended — see "Controlling costs" below)
5. Click **Deploy**. In under a minute you'll get a URL like `descent-game.vercel.app` — that's the link you send to playtesters.

## Option B: Deploy with the Vercel CLI

```bash
npm install -g vercel
cd descent-app
vercel login
vercel
```

Follow the prompts (accept defaults). Then set your environment variables:

```bash
vercel env add ANTHROPIC_API_KEY
vercel env add GAME_ACCESS_CODE
```

Then deploy to production:

```bash
vercel --prod
```

## Controlling costs — please read this

Every action a player takes (after floor 1) calls the Claude API, which costs a small amount of money on your Anthropic account. This is normal and cheap per-action, but an open URL with no gate means **anyone who gets the link — or finds it by chance — can play for free on your dime**, with no built-in limit.

The `GAME_ACCESS_CODE` environment variable is a simple lock: if you set it, players must enter that code on the start screen before the game will respond. Share the code only with people you actually want playtesting. If you leave `GAME_ACCESS_CODE` unset, the game is open to anyone with the URL.

This is a lightweight speed bump, not real security — a determined person could still find the code if it leaks. For a small private playtest group it should be plenty. If you want proper per-player rate limiting or usage caps later, that's a bigger addition I can help with once you know you want it.

You can also set spending limits directly in your Anthropic Console under **Billing** as a hard backstop.

## Updating the game later

Edit `public/index.html` (the whole game is one file) and `api/game.js`, then redeploy:
- Website method: push the change to GitHub — Vercel redeploys automatically.
- CLI method: run `vercel --prod` again from this folder.

## Local testing (optional)

```bash
npm install -g vercel
cd descent-app
vercel dev
```

This runs the site and the API function locally so you can test before deploying.
