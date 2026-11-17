import { Component, MarkdownRenderer, type App } from "obsidian";
import { createPinButton } from "./pinButton";
import { columnBox, type Pin } from "./pins";

/** The box that holds the stuck callout at the top of a pane, drawn the way Obsidian draws any callout. */
export class PinOverlay {
  private readonly el: HTMLElement;
  private readonly body: HTMLElement;
  private readonly button: HTMLElement;
  private onUnpin: () => void = () => {};
  private readonly component = new Component();
  private shown: string | null = null;

  constructor(private readonly host: HTMLElement, private readonly app: App) {
    this.el = host.createDiv({ cls: "sticky-callout-overlay" });
    this.body = this.el.createDiv({ cls: "sticky-callout-overlay-body" });
    this.button = createPinButton(true, () => this.onUnpin());
    this.button.addClass("sticky-callout-overlay-button");
    this.el.appendChild(this.button);
    this.el.hide();
    this.component.load();
  }

  /**
   * Show `pin` over `column` (the element holding the note's text, so the stuck callout lines up
   * with it at any width), or hide the box when `pin` is null.
   */
  set(pin: Pin | null, sourcePath: string, maxHeightPx: number, column: HTMLElement | null = null, onUnpin: () => void = () => {}) {
    this.onUnpin = onUnpin;
    if (!pin) {
      this.shown = null;
      this.el.hide();
      this.body.empty();
      return;
    }
    this.el.setCssProps({ "--sticky-callout-max-height": `${maxHeightPx}px` });
    this.align(column);
    if (pin.text !== this.shown) {
      this.shown = pin.text;
      void this.draw(pin.text, sourcePath);
    }
    this.el.show();
  }

  private align(column: HTMLElement | null) {
    const box = column && columnBox(this.host.getBoundingClientRect(), column.getBoundingClientRect());
    this.el.setCssProps({
      "--sticky-callout-left": box ? `${box.left}px` : "",
      "--sticky-callout-width": box ? `${box.width}px` : "",
    });
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
