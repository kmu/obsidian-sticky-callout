import { PluginSettingTab, Setting } from "obsidian";
import type StickyCalloutPlugin from "./main";
import { t } from "./t";

export class StickyCalloutSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: StickyCalloutPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName(t("settings.maxHeight"))
      .setDesc(t("settings.maxHeightDesc"))
      .addSlider((s) =>
        s
          .setLimits(10, 80, 5)
          .setValue(this.plugin.settings.maxHeightPercent)
          .onChange((v) => this.plugin.setMaxHeightPercent(v)),
      );
  }
}
