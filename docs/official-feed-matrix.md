# Official Feed Matrix

Predict.info should prefer official, public, no-license RSS and Atom feeds wherever possible before relying on generic media aggregation.

## Why

Official feeds are the best near-term source layer for a professional prediction platform because they are:

- closer to settlement truth
- less noisy than generic media coverage
- easier to justify in resolution logic
- usually available without premium wire licensing

## Current Matrix

Configured in [data/official-feeds.json](../data/official-feeds.json).

Default feeds:

- `fed-press-all`
- `fed-speeches`
- `openai-news`

Optional feeds:

- `sec-press`

## Selection Model

The RSS provider resolves feeds in this order:

1. `PREDICTINFO_RSS_FEED_IDS`
2. feeds marked `enabledByDefault` in the matrix
3. any direct `PREDICTINFO_RSS_FEEDS` URLs appended as custom feeds

## Commercial Implication

This lets Predict.info scale source quality in layers:

- `official` feeds for settlement-adjacent signals
- `custom` feeds for temporary experiments
- premium licensed sources later, without rewriting the ingestion model