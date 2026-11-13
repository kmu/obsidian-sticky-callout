import { describe, expect, it } from "vitest";
import { findCallouts, findPins, limitPx, pinAbove, togglePin, type Pin } from "../src/pins";

describe("findPins", () => {
  it("finds a pinned callout with all its lines", () => {
    const pins = findPins("> [!note|pin] Title\n> body\n\ntext");
    expect(pins).toEqual([{ start: 0, end: 1, text: "> [!note|pin] Title\n> body" }]);
  });

  it("accepts folding marks, extra metadata and any case of the type", () => {
    for (const head of ["> [!tip|pin]-", "> [!tip|pin]+ T", "> [!note|a|pin]", "> [!NOTE|pin]"]) {
      expect(findPins(`intro\n${head}\n> x`), head).toHaveLength(1);
    }
  });

  it("ignores callouts that are not pinned", () => {
    for (const head of ["> [!note]", "> [!note|nopin]", "> [!note|pinned]", "> > [!note|pin]", "text [!note|pin]"]) {
      expect(findPins(head), head).toEqual([]);
    }
  });

  it("ignores a pin inside a code fence", () => {
    expect(findPins("```\n> [!note|pin]\n```")).toEqual([]);
    expect(findPins("~~~md\n> [!note|pin]\n~~~")).toEqual([]);
    expect(findPins("```\ncode\n```\n> [!note|pin]")).toHaveLength(1);
  });

  it("ends a callout at the first line that does not start with >", () => {
    const pins = findPins("> [!note|pin]\n> a\nplain\n> [!tip|pin]\n> b");
    expect(pins.map((p) => [p.start, p.end])).toEqual([[0, 1], [3, 4]]);
  });
});

describe("pinAbove", () => {
  const pins: Pin[] = [
    { start: 10, end: 12, text: "a" },
    { start: 50, end: 51, text: "b" },
  ];

  it("shows nothing until the first pin has scrolled past the top", () => {
    expect(pinAbove(pins, 0)).toBeNull();
    expect(pinAbove(pins, 10)).toBeNull();
  });

  it("shows the latest pin that has scrolled past", () => {
    expect(pinAbove(pins, 11)?.text).toBe("a");
    expect(pinAbove(pins, 50)?.text).toBe("a");
    expect(pinAbove(pins, 51)?.text).toBe("b");
    expect(pinAbove(pins, 900)?.text).toBe("b");
  });

  it("copes with no pins", () => {
    expect(pinAbove([], 5)).toBeNull();
  });
});

describe("limitPx", () => {
  it("takes a share of the pane height, rounded", () => {
    expect(limitPx(1000, 30)).toBe(300);
    expect(limitPx(333, 30)).toBe(100);
    expect(limitPx(0, 30)).toBe(0);
  });
});

describe("togglePin", () => {
  it("adds pin to a plain callout and keeps the rest of the line", () => {
    expect(togglePin("> [!note] Title")).toBe("> [!note|pin] Title");
    expect(togglePin("> [!tip]-")).toBe("> [!tip|pin]-");
    expect(togglePin(">[!note]")).toBe(">[!note|pin]");
  });

  it("adds pin after other metadata", () => {
    expect(togglePin("> [!note|wide] T")).toBe("> [!note|wide|pin] T");
  });

  it("removes pin and leaves other metadata", () => {
    expect(togglePin("> [!note|pin] Title")).toBe("> [!note] Title");
    expect(togglePin("> [!tip|pin]+ T")).toBe("> [!tip]+ T");
    expect(togglePin("> [!note|a|pin|b]")).toBe("> [!note|a|b]");
  });

  it("is its own inverse", () => {
    for (const line of ["> [!note] x", "> [!note|a] x", "> [!note|pin]- x"]) {
      expect(togglePin(togglePin(line) as string)).toBe(line);
    }
  });

  it("returns null for a line that is not a callout head", () => {
    for (const line of ["> quote", "text [!note]", "> > [!note]", ""]) expect(togglePin(line), line).toBeNull();
  });
});

describe("findCallouts", () => {
  it("lists every top-level callout with whether it is pinned", () => {
    const doc = "> [!note] a\n> x\n\n> [!tip|pin] b\n\n```\n> [!note] c\n```\n> [!warning] d";
    expect(findCallouts(doc).map((c) => [c.start, c.end, c.pinned])).toEqual([
      [0, 1, false],
      [3, 3, true],
      [8, 8, false],
    ]);
  });
});
