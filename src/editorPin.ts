import type { Extension, Text } from "@codemirror/state";
import { EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import type StickyCalloutPlugin from "./main";
import { PinOverlay } from "./overlay";
import { findPins, limitPx, pinAbove, type Pin } from "./pins";

/** Keeps the pinned callout that has scrolled out of the top of an editor on screen. */
class EditorPin {
  private readonly overlay: PinOverlay;
  private cachedDoc: Text | null = null;
  private pins: Pin[] = [];
  private frame = 0;
  private readonly onScroll = () => this.schedule();

  constructor(private readonly view: EditorView, private readonly plugin: StickyCalloutPlugin) {
    this.overlay = new PinOverlay(view.dom, plugin.app);
    view.scrollDOM.addEventListener("scroll", this.onScroll, { passive: true });
    this.schedule();
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.geometryChanged || update.heightChanged) this.schedule();
  }

  destroy() {
    window.cancelAnimationFrame(this.frame);
    this.view.scrollDOM.removeEventListener("scroll", this.onScroll);
    this.overlay.destroy();
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
    const path = view.state.field(editorInfoField).file?.path ?? "";
    this.overlay.set(pin, path, limitPx(view.dom.clientHeight, this.plugin.settings.maxHeightPercent));
  }
}

export function editorPinExtension(plugin: StickyCalloutPlugin): Extension {
  return ViewPlugin.define((view) => new EditorPin(view, plugin));
}
