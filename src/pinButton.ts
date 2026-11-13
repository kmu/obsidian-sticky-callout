import { setIcon } from "obsidian";
import { t } from "./t";

/** The pin button drawn on a callout; `pinned` decides its look and its label. */
export function createPinButton(pinned: boolean, onActivate: () => void): HTMLElement {
  const button = createSpan({ cls: "sticky-callout-pin" });
  button.toggleClass("is-pinned", pinned);
  button.setAttrs({ role: "button", tabindex: "0", "aria-label": t(pinned ? "button.unpin" : "button.pin") });
  setIcon(button, "pin");
  // keep the editor caret and the callout's fold toggle out of it
  button.addEventListener("mousedown", (e) => e.preventDefault());
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate();
  });
  button.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    onActivate();
  });
  return button;
}
