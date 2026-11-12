import { describe, expect, it } from "vitest";
import manifest from "../manifest.json";
import pkg from "../package.json";

describe("manifest", () => {
  it("names the plugin and matches package.json", () => {
    expect(manifest.id).toBe("sticky-callout");
    expect(manifest.version).toBe(pkg.version);
  });
});
