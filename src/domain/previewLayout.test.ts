import { describe, expect, it } from "vitest";
import { fitViewportToBounds } from "./previewLayout";

describe("previewLayout", () => {
  it("fits a tall output viewport into a shorter Teleprompt View slot without squashing", () => {
    const fit = fitViewportToBounds({
      availableHeight: 429,
      availableWidth: 995,
      viewport: { width: 1024, height: 600 },
    });

    expect(fit).toEqual({
      height: 429,
      scale: 0.715,
      width: 732.16,
    });
  });

  it("fits an output viewport into a width-limited Teleprompt View slot", () => {
    const fit = fitViewportToBounds({
      availableHeight: 500,
      availableWidth: 314,
      viewport: { width: 1024, height: 600 },
    });

    expect(fit).toEqual({
      height: 183.98,
      scale: 0.3066,
      width: 314,
    });
  });
});
