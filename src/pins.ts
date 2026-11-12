/** A top-level callout marked `|pin`. Lines are 0-based and `end` is inclusive. */
export interface Pin {
  start: number;
  end: number;
  text: string;
}

const HEAD = /^>[ \t]?\[!([^\]|]+)((?:\|[^\]]*)?)\]/;
const FENCE = /^\s{0,3}(```|~~~)/;

function isPinHead(line: string): boolean {
  const head = HEAD.exec(line);
  return head !== null && head[2].split("|").includes("pin");
}

export function findPins(doc: string): Pin[] {
  const lines = doc.split("\n");
  const pins: Pin[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const mark = FENCE.exec(lines[i])?.[1];
    if (mark) {
      if (fence === null) fence = mark;
      else if (fence === mark) fence = null;
      continue;
    }
    if (fence !== null || !isPinHead(lines[i])) continue;
    let end = i;
    while (end + 1 < lines.length && lines[end + 1].startsWith(">")) end++;
    pins.push({ start: i, end, text: lines.slice(i, end + 1).join("\n") });
    i = end;
  }
  return pins;
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
