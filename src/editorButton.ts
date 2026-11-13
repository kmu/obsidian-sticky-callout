import type { Extension, Range, Text } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from "@codemirror/view";
import { createPinButton } from "./pinButton";
import { findCallouts, togglePin } from "./pins";

/** Toggle `pin` on the callout head at 0-based `line`; does nothing if that line is no longer a callout head. */
export function togglePinAtLine(view: EditorView, line: number): void {
  if (line < 0 || line >= view.state.doc.lines) return;
  const { from, to, text } = view.state.doc.line(line + 1);
  const next = togglePin(text);
  if (next !== null) view.dispatch({ changes: { from, to, insert: next } });
}

class PinButtonWidget extends WidgetType {
  constructor(private readonly pinned: boolean) {
    super();
  }

  eq(other: PinButtonWidget) {
    return other.pinned === this.pinned;
  }

  toDOM(view: EditorView) {
    const button = createPinButton(this.pinned, () => togglePinAtLine(view, view.state.doc.lineAt(view.posAtDOM(button)).number - 1));
    return button;
  }

  ignoreEvent() {
    return true;
  }
}

function buttons(doc: Text): DecorationSet {
  const ranges: Range<Decoration>[] = findCallouts(doc.toString()).map((c) =>
    Decoration.widget({ widget: new PinButtonWidget(c.pinned), side: 1 }).range(doc.line(c.start + 1).to),
  );
  return Decoration.set(ranges);
}

/** A pin button at the end of every top-level callout head line in the editor. */
export function editorButtonExtension(): Extension {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = buttons(view.state.doc);
      }
      update(update: ViewUpdate) {
        if (update.docChanged) this.decorations = buttons(update.state.doc);
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}
