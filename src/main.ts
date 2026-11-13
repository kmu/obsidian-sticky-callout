import { Plugin, debounce } from "obsidian";
import { editorPinExtension } from "./editorPin";
import { registerReadingButton } from "./readingButton";
import { registerReadingPin } from "./readingPin";
import { StickyCalloutSettingTab } from "./settingsTab";

export interface Settings {
  /** Tallest the stuck callout may be, as a percentage of the pane height. */
  maxHeightPercent: number;
}

export const DEFAULT_SETTINGS: Settings = { maxHeightPercent: 30 };

export default class StickyCalloutPlugin extends Plugin {
  settings: Settings = { ...DEFAULT_SETTINGS };

  /** Redrawers of the open panes; run when a setting changes. */
  readonly refreshers = new Set<() => void>();

  private readonly saveLater = debounce(() => void this.saveData(this.settings), 500, true);

  setMaxHeightPercent(percent: number) {
    this.settings.maxHeightPercent = percent;
    for (const refresh of this.refreshers) refresh();
    this.saveLater();
  }

  async onload() {
    this.settings = { ...DEFAULT_SETTINGS, ...((await this.loadData()) as Partial<Settings> | null) };
    this.registerEditorExtension(editorPinExtension(this));
    registerReadingPin(this);
    registerReadingButton(this);
    this.addSettingTab(new StickyCalloutSettingTab(this));
  }
}
