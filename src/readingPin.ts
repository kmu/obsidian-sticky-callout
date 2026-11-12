import { MarkdownView } from "obsidian";
import type StickyCalloutPlugin from "./main";
import { PinOverlay } from "./overlay";
import { findPins, limitPx, pinAbove } from "./pins";

/** Keeps the pinned callout on screen in reading view, for every open note. */
class ReadingPin {
  private readonly overlay: PinOverlay;
  private frame = 0;
  private readonly onScroll = () => this.schedule();

  constructor(private readonly view: MarkdownView, private readonly plugin: StickyCalloutPlugin) {
    this.overlay = new PinOverlay(view.contentEl, plugin.app);
    // scroll events do not bubble, so listen on the way down to catch whichever element scrolls
    view.contentEl.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    this.schedule();
  }

  schedule() {
    window.cancelAnimationFrame(this.frame);
    this.frame = window.requestAnimationFrame(() => this.refresh());
  }

  destroy() {
    window.cancelAnimationFrame(this.frame);
    this.view.contentEl.removeEventListener("scroll", this.onScroll, { capture: true });
    this.overlay.destroy();
  }

  private refresh() {
    const { view } = this;
    if (view.getMode() !== "preview" || !view.file) {
      this.overlay.set(null, "", 0);
      return;
    }
    const pin = pinAbove(findPins(view.data), Math.floor(view.previewMode.getScroll()));
    this.overlay.set(pin, view.file.path, limitPx(view.contentEl.clientHeight, this.plugin.settings.maxHeightPercent));
  }
}

export function registerReadingPin(plugin: StickyCalloutPlugin): void {
  const panes = new Map<MarkdownView, ReadingPin>();

  const sync = () => {
    const open = new Set<MarkdownView>();
    plugin.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) open.add(leaf.view);
    });
    for (const [view, pane] of panes) {
      if (!open.has(view)) {
        pane.destroy();
        panes.delete(view);
      }
    }
    for (const view of open) {
      const pane = panes.get(view) ?? new ReadingPin(view, plugin);
      panes.set(view, pane);
      pane.schedule();
    }
  };

  plugin.registerEvent(plugin.app.workspace.on("layout-change", sync));
  plugin.registerEvent(plugin.app.workspace.on("file-open", sync));
  plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", sync));
  plugin.register(() => {
    for (const pane of panes.values()) pane.destroy();
    panes.clear();
  });
  plugin.app.workspace.onLayoutReady(sync);
}
