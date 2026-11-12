# Sticky Callout

Keep one callout stuck to the top of the note while you scroll. Put your table of contents, today's tasks or a reminder in a callout, and it stays in view however long the note is.

## Use

Add `pin` to the callout's type:

```markdown
> [!note|pin] Today
> - [ ] Reply to the lab
> - [ ] Submit the report
```

- Scroll down, and the callout stays at the top of the pane, in the editor (live preview and source mode) and in reading view.
- With several pinned callouts in a note, only one is stuck at a time: when the next one scrolls past the top, it takes over.
- A tall callout is capped at a share of the pane height (30% by default) and scrolls inside.
- Without the plugin the note shows an ordinary callout, and the note file is never changed.

Only top-level callouts count. A `pin` inside a code block, or in a callout nested in another quote, is ignored.

## Settings

- **Maximum height**: how tall the stuck callout may be, as a share of the pane (10–80%, default 30%).

The interface is in English and Japanese, following Obsidian's language.

## Install

### With BRAT

1. Install **Obsidian42 - BRAT** from Community plugins.
2. Run the command **BRAT: Add a beta plugin for testing** and enter `kmu/obsidian-sticky-callout`.
3. Enable **Sticky Callout** in Settings → Community plugins.

### By hand

1. Download `main.js`, `manifest.json` and `styles.css` from the latest release.
2. Put them in `<your vault>/.obsidian/plugins/sticky-callout/`.
3. Reload Obsidian and enable **Sticky Callout**.

## Build

```sh
npm install
npm test
npm run build
```

## License

MIT
