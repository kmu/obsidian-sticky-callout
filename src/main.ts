import { Plugin } from "obsidian";
import { editorPinExtension } from "./editorPin";
import { registerReadingPin } from "./readingPin";

export interface Settings {
  /** Tallest the stuck callout may be, as a percentage of the pane height. */
  maxHeightPercent: number;
}

export const DEFAULT_SETTINGS: Settings = { maxHeightPercent: 30 };

export default class StickyCalloutPlugin extends Plugin {
  settings: Settings = { ...DEFAULT_SETTINGS };

  async onload() {
    this.settings = { ...DEFAULT_SETTINGS, ...((await this.loadData()) as Partial<Settings> | null) };
    this.registerEditorExtension(editorPinExtension(this));
    registerReadingPin(this);
  }
}
