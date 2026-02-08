# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anki flashcard templates for studying Magic: The Gathering cards. Each template fetches card images from the Scryfall API using a card UUID, then uses HTML5 Canvas to draw colored occlusion overlays that hide specific card regions (rules text, mana cost, etc.) for study.

Templates are static HTML/CSS/JS files copied directly into Anki's card template editor. A Node.js build script generates a GitHub Pages demo site from the production templates.

## Architecture

**Template-per-card-type pattern:** Each MTG card layout (normal, saga, DFC, adventure, split) has its own HTML template with layout-specific occlusion coordinates.

**Core template flow (all templates follow this):**
1. Fetch card JSON from `https://api.scryfall.com/cards/{{UUID}}`
2. Set card image from `data.image_uris.normal` (or `data.card_faces[]` for multi-faced)
3. Get canvas elements and their 2D contexts
4. Set fill color based on `data.color_identity` array
5. Draw `fillRect()` at layout-specific coordinates

**Primary template files (production-ready):**
- `mtg-text-box-front.html` / `mtg-text-box-back.html` / `mtg-text-box.css` — Main template, handles normal cards and sagas
- `mtg-dfc-front.html` / `mtg-dfc-back.html` — Double-faced cards (transform/modal), uses `{{#c1}}`/`{{#c2}}` cloze markers for conditional occlusion per face
- `mtg-adventure-front.html` — Adventure cards with two occlusion regions
- `mtg-split-front.html` / `mtg-split-back.html` — Split cards with 90-degree rotation
- `mtg-saga.html` — Saga-specific template

**Other HTML/JSON files** (creatures.html, spell.html, test.html, etc.) are experimental demos or test data, not production templates.

## Key Implementation Details

**Anki template variables** use Mustache syntax: `{{UUID}}`, `{{Front}}`, `{{cloze:Text}}`, `{{#c1}}`...`{{/c1}}`. These are substituted by Anki before the HTML renders.

**Occlusion coordinates** are calibrated to Scryfall's `normal` image size (488x680). Key rectangles:
- Normal cards: `{x: 24, y: 95, width: 250, height: 43}` (rules text box, canvas units differ from px)
- Saga cards: `{x: 14, y: 17, width: 134, height: 109}` (vertical chapter list)

**Color system:** Maps MTG color identity letters (W/U/B/R/G) to RGB values. Two-color cards use a linear gradient with official guild ordering. Three+ colors use solid gold (`rgb(218, 165, 32)`). Colorless defaults to light brown.

**Guild color ordering** (`sortColorsByGuildOrder`): When a card has exactly 2 colors, they are sorted to match official MTG guild pairs (WU, WB, RW, GW, UB, UR, GU, BR, BG, RG) for consistent gradient direction.

## Demo Site (GitHub Pages)

**Build command:** `npm run build` — runs `build.js`, outputs to `dist/`.

**How it works:** `build.js` reads production templates, replaces Anki-specific tags (`{{UUID}}`, `{{Front}}`, `{{#c1}}...{{/c1}}`, etc.) with sample values, and swaps the Scryfall API `fetch()` call with `Promise.resolve(__cardData)` using pre-fetched JSON. This produces standalone HTML files that render identically to how the templates look in Anki, with no API calls at runtime.

**Key files:**
- `build.js` — Build script (Node.js stdlib only, no dependencies)
- `demo/config.json` — Maps each demo section to its template files, sample card data, and cloze configuration. Add new entries here when adding new template types.
- `demo/data/*.json` — Pre-fetched Scryfall card JSON with `image_uris.normal` rewritten to local paths
- `demo/images/*.jpg` — Committed card images (from Scryfall CDN, ~100KB each)
- `demo/template.html` — HTML shell for the demo page (uses `{{SECTIONS}}` placeholder)
- `dist/` — Build output (gitignored), deployed to GitHub Pages

**GitHub Actions:** `.github/workflows/deploy-pages.yml` runs `npm run build` on push to `main` and deploys `dist/` to GitHub Pages.

**Adding a new template type:**
1. Fetch sample card JSON: `curl 'https://api.scryfall.com/cards/{uuid}' > demo/data/new-card.json`
2. Download the card image to `demo/images/`
3. Rewrite `image_uris.normal` in the JSON to `images/new-card.jpg`
4. Add a new section entry to `demo/config.json`
5. Run `npm run build` to verify
