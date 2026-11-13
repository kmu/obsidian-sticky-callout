import type { App } from "obsidian";
import { togglePin } from "./pins";

/** Toggle `pin` on the callout head at 0-based `line` of the note at `path`; does nothing if the line is no longer a callout head. */
export async function togglePinInFile(app: App, path: string, line: number): Promise<void> {
  const file = app.vault.getFileByPath(path);
  if (!file) return;
  await app.vault.process(file, (data) => {
    const lines = data.split("\n");
    const next = togglePin(lines[line] ?? "");
    if (next === null) return data;
    lines[line] = next;
    return lines.join("\n");
  });
}
