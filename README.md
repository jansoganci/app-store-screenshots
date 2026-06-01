# App Store Screenshots — Enhanced Editor

A Next.js + ShadCN editor for App Store and Google Play marketing screenshots.

## Credits & license

This project is based on **[ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots)** by [Parth Jadhav](https://github.com/ParthJadhav) — scaffolded from the [`app-store-screenshots` agent skill](https://github.com/ParthJadhav/app-store-screenshots) (MIT License).

**Original work:** Copyright (c) 2026 Parth Jadhav. See [LICENSE](./LICENSE).

**Editor enhancements:** maintained by [@jansoganci](https://github.com/jansoganci). These changes are also released under MIT; the original copyright and license notice above are preserved.

If you use this fork, please keep this credits section and the LICENSE file.

---

## Enhancements in this fork

Changes on top of the upstream editor template:

| Feature | Description |
|--------|-------------|
| **Label & headline typography** | Per-slide font size, weight, and color in Screen settings |
| **Background modes** | Theme default, solid color, or gradient — gradient uses *your* picked color (not the theme accent blue) |
| **Phone layers (`deviceElements`)** | Add/remove iPhone mockups with **+ Phone** and trash; up to 3 phones per slide |
| **Schema v3** | `deviceElements[]` in project JSON; legacy `two-devices` layouts migrate on load |

New / updated modules:

- `src/lib/color.ts` — background resolution, gradient from slide color
- `src/lib/typography.ts` — default caption sizes
- `src/lib/device-elements.ts` — phone layer model, migration, add/remove helpers

---

## Quick start

```bash
cp app-store-screenshots.json.example app-store-screenshots.json
bun install   # or pnpm / yarn / npm
bun dev       # http://localhost:3000
```

`app-store-screenshots.json` is **gitignored** — copy the example (or let the editor create defaults on first run). Put app icons and screenshots under `public/` locally; uploaded files go to `public/screenshots/uploaded/` and stay local too.

## What's inside

- **Connected canvas editor** (`src/components/editor/`) — screens on one horizontal canvas; export as split crops in Connected mode
- **Screen controls** — reorder slides, edit copy, screenshot pickers, layout switcher
- **Device frames** — iPhone (PNG mockup), iPad, Android phone/tablet, feature graphic
- **Auto-save** — `app-store-screenshots.json` (git-tracked) + `localStorage` cache
- **Multi-device decks** — iOS and Android side by side
- **Export bundle** — zip at App Store / Play Store sizes via `html-to-image`

## Adding screenshots

1. **Inspector → Phones → Pick** — uploads to `public/screenshots/uploaded/<hash>.png`
2. **Static paths** — `public/screenshots/apple/iphone/{locale}/...`

## Exporting

Toolbar → **Export bundle** → zip by platform, device, resolution, and locale.

## Customizing

| Where | What |
|-------|------|
| `src/lib/constants.ts` | Canvas sizes, themes, export dimensions |
| `app-store-screenshots.json` | Deck state: copy, screenshots, transforms, `deviceElements` |
| `src/components/editor/inspector.tsx` | Screen settings UI |
| `src/components/editor/slide-canvas.tsx` | Layout rendering |

## Upstream

- Original repo: https://github.com/ParthJadhav/app-store-screenshots  
- Install the skill: `npx skills add ParthJadhav/app-store-screenshots`

Contributions that benefit everyone may be sent upstream as pull requests to ParthJadhav’s repository.

## Notes

- `mockup.png` — iPhone bezel; see `PHONE_SCREEN` in `src/lib/constants.ts` if you replace it
- **Persistence** — file wins over `localStorage` on load; both update on save
- **Migration** — schema v1/v2 projects upgrade on load; v3 adds `deviceElements` from legacy device transforms
