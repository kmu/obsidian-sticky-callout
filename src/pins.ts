/** A top-level callout marked `|pin`. Lines are 0-based and `end` is inclusive. */
export interface Pin {
  start: number;
  end: number;
  text: string;
}

const HEAD = /^>[ \t]?\[!([^\]|]+)((?:\|[^\]]*)?)\]/;
const FENCE = /^\s{0,3}(```|~~~)/;

/** A top-level callout. Lines are 0-based and `end` is inclusive. */
export interface Callout extends Pin {
  pinned: boolean;
}

function metadataOf(line: string): string[] | null {
  const head = HEAD.exec(line);
  return head === null ? null : head[2].split("|").slice(1);
}

/** Whether a callout head line is pinned; null if the line is not a callout head. */
export function headInfo(line: string): { pinned: boolean } | null {
  const meta = metadataOf(line);
  return meta === null ? null : { pinned: meta.includes("pin") };
}

export function findCallouts(doc: string): Callout[] {
  const lines = doc.split("\n");
  const callouts: Callout[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const mark = FENCE.exec(lines[i])?.[1];
    if (mark) {
      if (fence === null) fence = mark;
      else if (fence === mark) fence = null;
      continue;
    }
    const meta = fence === null ? metadataOf(lines[i]) : null;
    if (meta === null) continue;
    let end = i;
    while (end + 1 < lines.length && lines[end + 1].startsWith(">")) end++;
    callouts.push({ start: i, end, text: lines.slice(i, end + 1).join("\n"), pinned: meta.includes("pin") });
    i = end;
  }
  return callouts;
}

export function findPins(doc: string): Pin[] {
  return findCallouts(doc)
    .filter((c) => c.pinned)
    .map(({ start, end, text }) => ({ start, end, text }));
}

/** The callout head with `pin` added to its metadata, or removed if it is there; null if the line is not a callout head. */
export function togglePin(line: string): string | null {
  const head = HEAD.exec(line);
  if (head === null) return null;
  const meta = head[2].split("|").slice(1);
  const next = meta.includes("pin") ? meta.filter((m) => m !== "pin") : [...meta, "pin"];
  const prefix = head[0].slice(0, head[0].length - head[2].length - 1);
  return prefix + next.map((m) => `|${m}`).join("") + "]" + line.slice(head[0].length);
}

/** The pin to keep on screen when `topLine` is the first visible line: the latest one whose start has scrolled past. */
export function pinAbove(pins: Pin[], topLine: number): Pin | null {
  let found: Pin | null = null;
  for (const pin of pins) if (pin.start < topLine) found = pin;
  return found;
}

export function limitPx(paneHeight: number, percent: number): number {
  return Math.max(0, Math.round((paneHeight * percent) / 100));
}
