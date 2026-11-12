import { Component, MarkdownRenderer, type App } from "obsidian";
import type { Pin } from "./pins";

/** The box that holds the stuck callout at the top of a pane, drawn the way Obsidian draws any callout. */
export class PinOverlay {
  private readonly el: HTMLElement;
  private readonly component = new Component();
  private shown: string | null = null;

  constructor(host: HTMLElement, private readonly app: App) {
    this.el = host.createDiv({ cls: "sticky-callout-overlay" });
    this.el.hide();
    this.component.load();
  }

  /** Show `pin`, or hide the box when it is null. */
  set(pin: Pin | null, sourcePath: string, maxHeightPx: number) {
    if (!pin) {
      this.shown = null;
      this.el.hide();
      this.el.empty();
      return;
    }
    this.el.setCssProps({ "--sticky-callout-max-height": `${maxHeightPx}px` });
    if (pin.text !== this.shown) {
      this.shown = pin.text;
      void this.draw(pin.text, sourcePath);
    }
    this.el.show();
  }

  destroy() {
    this.component.unload();
    this.el.remove();
  }

  private async draw(text: string, sourcePath: string) {
    const holder = createDiv();
    await MarkdownRenderer.render(this.app, text, holder, sourcePath, this.component);
    if (this.shown === text) this.el.replaceChildren(holder);
  }
}
