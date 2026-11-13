import type StickyCalloutPlugin from "./main";
import { createPinButton } from "./pinButton";
import { togglePinInFile } from "./pinFile";
import { headInfo } from "./pins";

/** Adds a pin button to the title of every top-level callout in reading view. */
export function registerReadingButton(plugin: StickyCalloutPlugin): void {
  plugin.registerMarkdownPostProcessor((el, ctx) => {
    const info = ctx.getSectionInfo(el);
    if (!info) return;
    const head = headInfo(info.text.split("\n")[info.lineStart] ?? "");
    const callout = el.matches(".callout") ? el : el.querySelector<HTMLElement>(".callout");
    const title = callout?.querySelector<HTMLElement>(":scope > .callout-title");
    if (!head || !callout || !title || callout.parentElement?.closest(".callout")) return;
    const button = createPinButton(head.pinned, () => void togglePinInFile(plugin.app, ctx.sourcePath, info.lineStart));
    // before the fold arrow, so both stay at the right edge
    title.insertBefore(button, title.querySelector(".callout-fold"));
  });
}
