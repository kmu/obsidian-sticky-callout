import { Component, MarkdownRenderer, type App } from "obsidian";
import { createPinButton } from "./pinButton";
import type { Pin } from "./pins";

/** The box that holds the stuck callout at the top of a pane, drawn the way Obsidian draws any callout. */
export class PinOverlay {
  private readonly el: HTMLElement;
  private readonly body: HTMLElement;
  private readonly button: HTMLElement;
  private onUnpin: () => void = () => {};
  private readonly component = new Component();
  private shown: string | null = null;

  constructor(host: HTMLElement, private readonly app: App) {
    this.el = host.createDiv({ cls: "sticky-callout-overlay" });
    this.body = this.el.createDiv({ cls: "sticky-callout-overlay-body" });
    this.button = createPinButton(true, () => this.onUnpin());
    this.button.addClass("sticky-callout-overlay-button");
    this.el.appendChild(this.button);
    this.el.hide();
    this.component.load();
  }

  /** Show `pin`, or hide the box when it is null. */
  set(pin: Pin | null, sourcePath: string, maxHeightPx: number, onUnpin: () => void = () => {}) {
    this.onUnpin = onUnpin;
    if (!pin) {
      this.shown = null;
      this.el.hide();
      this.body.empty();
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
    if (this.shown === text) this.body.replaceChildren(holder);
  }
}
