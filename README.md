# Predict.info

Predict.info is a news-driven forecasting platform prototype built with Next.js. The product direction is simple: each prediction market should show a clear question, a visible probability, the evidence timeline that moved the odds, and the reporting sources behind that move.

This repository currently contains a multi-page product prototype with:

- a landing page that positions Predict.info as an evidence-led forecasting product
- market index and market detail pages
- news index and news detail pages
- an about page explaining product logic and architecture
- a JSON-backed content layer with thin API endpoints for future CMS or database integration

## Product Direction

Predict.info is designed to feel closer to a serious information product than a casino-style interface.

- Markets are first-class objects with explicit settlement rules.
- News is treated as evidence, not decorative content.
- Forecast movement is explained through linked timelines and source reporting.
- The current prototype favors simple structure over premature backend complexity.

## Tech Stack

- Next.js Pages Router
- React 18
- JSON-backed content source in `data/`
- Static generation for public pages
- API routes in `pages/api/` for future data integration

## Project Structure

```text
components/        Reusable UI elements and layout components
data/              JSON content source for site, markets, and news
lib/               Content loading and data access helpers
pages/             Route-level pages and API endpoints
styles/            CSS modules for layout, listing, detail, and homepage views
global.css         Shared design tokens and global styles
next.config.js     Next.js configuration
```

## Local Development

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev     # start local development server
npm run build   # create a production build
npm run start   # start the production server
```

## Data Model

The current content model is intentionally simple and file-based.

- `data/site.json` stores brand metadata, navigation, and site-level principles.
- `data/markets.json` stores forecast questions, tags, curves, timelines, and settlement rules.
- `data/news.json` stores news stories, takeaways, and linked market slugs.
- `lib/contentApi.js` is the single access layer used by pages and API routes.

This means the next migration step can replace JSON reads inside `lib/contentApi.js` with a CMS, database, or external market feed without rewriting page structure.

## Live Data Adapters

The repository now includes an optional live data layer in `lib/liveData.js`.

It is intentionally separate from the current page content model so you can test real external feeds without breaking the editorial market and news pages.

Supported providers now:

- `polymarket` for live market snapshots
- `newsapi` for live headline ingestion

Copy `.env.example` to `.env.local` and set:

```bash
PREDICTINFO_ENABLE_LIVE_DATA=true
PREDICTINFO_ENABLE_LIVE_OVERLAY=true
PREDICTINFO_MARKET_PROVIDER=polymarket
PREDICTINFO_NEWS_PROVIDER=newsapi
NEWSAPI_KEY=your_key_here
```

New live API routes:

- `GET /api/live/status`
- `GET /api/live/markets`
- `GET /api/live/news`

These routes return normalized external data that can later be merged into the main UI once you decide which live fields should override the editorial defaults.

When `PREDICTINFO_ENABLE_LIVE_OVERLAY=true`, `lib/contentApi.js` will keep using your editorial records as the base model and only overlay live fields such as probability, move, volume, liquidity, status, and live headline/source metadata when a configured match is found.

This is the intended production direction: live feeds update market state, while your own rules, evidence timelines, linked-market relationships, and settlement logic remain under your control.

## API Endpoints

The repository includes minimal API routes for future frontend or external integration work:

- `GET /api/site`
- `GET /api/markets`
- `GET /api/markets/[slug]`
- `GET /api/news`
- `GET /api/news/[slug]`
- `GET /api/live/status`
- `GET /api/live/markets`
- `GET /api/live/news`

## Deployment

The app is ready to deploy to Vercel or any Node-compatible platform that supports Next.js.

Typical production flow:

```bash
npm install
npm run build
npm run start
```

If deploying to Vercel, the default Next.js settings are sufficient for the current prototype.

## Roadmap

- Replace JSON files with a real editorial backend or CMS.
- Add market filtering, sorting, and search.
- Add methodology, source-quality labels, and resolution history.
- Introduce auth and user-level watchlists once the data layer is live.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
