import { describe, expect, it } from "vitest";
import { findPins, limitPx, pinAbove, type Pin } from "../src/pins";

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
