import type { Extension, Text } from "@codemirror/state";
import { EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { Component, MarkdownRenderer, editorInfoField } from "obsidian";
import type StickyCalloutPlugin from "./main";
import { findPins, limitPx, pinAbove, type Pin } from "./pins";

/** Draws the pinned callout that has scrolled out of the top of an editor over that top edge. */
class EditorPin {
  private readonly el: HTMLElement;
  private readonly component = new Component();
  private shown: string | null = null;
  private cachedDoc: Text | null = null;
  private pins: Pin[] = [];
  private frame = 0;
  private readonly onScroll = () => this.schedule();

  constructor(private readonly view: EditorView, private readonly plugin: StickyCalloutPlugin) {
    this.el = view.dom.createDiv({ cls: "sticky-callout-overlay" });
    this.el.hide();
    this.component.load();
    view.scrollDOM.addEventListener("scroll", this.onScroll, { passive: true });
    this.schedule();
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.geometryChanged || update.heightChanged) this.schedule();
  }

  destroy() {
    window.cancelAnimationFrame(this.frame);
    this.view.scrollDOM.removeEventListener("scroll", this.onScroll);
    this.component.unload();
    this.el.remove();
  }

  private schedule() {
    window.cancelAnimationFrame(this.frame);
    this.frame = window.requestAnimationFrame(() => this.refresh());
  }

  private pinsOf(doc: Text): Pin[] {
    if (doc !== this.cachedDoc) {
      this.cachedDoc = doc;
      this.pins = findPins(doc.toString());
    }
    return this.pins;
  }

  private refresh() {
    const { view } = this;
    const block = view.lineBlockAtHeight(view.scrollDOM.scrollTop);
    const topLine = view.state.doc.lineAt(block.from).number - 1;
    const pin = pinAbove(this.pinsOf(view.state.doc), topLine);
    if (!pin) {
      this.shown = null;
      this.el.hide();
      this.el.empty();
      return;
    }
    this.el.setCssProps({ "--sticky-callout-max-height": `${limitPx(view.dom.clientHeight, this.plugin.settings.maxHeightPercent)}px` });
    if (pin.text !== this.shown) {
      this.shown = pin.text;
      void this.draw(pin.text);
    }
    this.el.show();
  }

  private async draw(text: string) {
    const holder = createDiv();
    const path = this.view.state.field(editorInfoField).file?.path ?? "";
    await MarkdownRenderer.render(this.plugin.app, text, holder, path, this.component);
    if (this.shown === text) this.el.replaceChildren(holder);
  }
}

export function editorPinExtension(plugin: StickyCalloutPlugin): Extension {
  return ViewPlugin.define((view) => new EditorPin(view, plugin));
}
