import { afterEach, describe, expect, it, vi } from "vitest";
import { openPrompterOutput, syncPrompterOutput } from "./outputWindow";

function createOutputWindow() {
  return {
    document: {
      close: vi.fn(),
      documentElement: {
        requestFullscreen: vi.fn().mockResolvedValue(undefined),
      },
      open: vi.fn(),
      write: vi.fn(),
    },
    focus: vi.fn(),
  };
}

describe("outputWindow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "getScreenDetails");
  });

  it("opens a manual fallback window when screen details are unavailable", async () => {
    const opened = createOutputWindow();
    const open = vi.spyOn(window, "open").mockReturnValue(opened as unknown as Window);

    const result = await openPrompterOutput("<div>output</div>");

    expect(result.mode).toBe("manual");
    expect(result.window).toBe(opened);
    expect(open).toHaveBeenCalledWith("", "better-prompter-output", expect.stringContaining("width=1024"));
    expect(opened.document.write).toHaveBeenCalledWith(expect.stringContaining("<div>output</div>"));
  });

  it("does not throw when popup opening is unavailable", async () => {
    const originalOpen = window.open;
    Object.defineProperty(window, "open", { configurable: true, value: undefined });

    try {
      await expect(openPrompterOutput("<div>output</div>")).resolves.toEqual({ mode: "manual", window: null });
    } finally {
      Object.defineProperty(window, "open", { configurable: true, value: originalOpen });
    }
  });

  it("uses managed placement when screen details expose a usable external screen", async () => {
    const opened = createOutputWindow();
    vi.spyOn(window, "open").mockReturnValue(opened as unknown as Window);
    Object.defineProperty(window, "getScreenDetails", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        screens: [
          { availHeight: 900, availLeft: 0, availTop: 0, availWidth: 1440, isPrimary: true },
          { availHeight: 600, availLeft: 1440, availTop: 0, availWidth: 1024, isPrimary: false, label: "Elgato Prompter" },
        ],
      }),
    });

    const result = await openPrompterOutput("<div>managed</div>");

    expect(result.mode).toBe("managed");
    expect(window.open).toHaveBeenCalledWith(
      "",
      "better-prompter-output",
      expect.stringContaining("left=1440,top=0,width=1024,height=600"),
    );
  });

  it("falls back to manual when the external screen dimensions are unusable", async () => {
    const opened = createOutputWindow();
    const open = vi.spyOn(window, "open").mockReturnValue(opened as unknown as Window);
    Object.defineProperty(window, "getScreenDetails", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        screens: [
          { availHeight: 900, availLeft: 0, availTop: 0, availWidth: 1440, isPrimary: true },
          { availHeight: 0, availLeft: 1440, availTop: 0, availWidth: 0, isPrimary: false, label: "Elgato Prompter" },
        ],
      }),
    });

    const result = await openPrompterOutput("<div>manual</div>");

    expect(result.mode).toBe("manual");
    expect(open).toHaveBeenCalledWith("", "better-prompter-output", expect.stringContaining("width=1024"));
  });

  it("syncs output html into an existing output window", () => {
    const opened = createOutputWindow();

    syncPrompterOutput(opened as unknown as Window, "<div>updated</div>");

    expect(opened.document.open).toHaveBeenCalled();
    expect(opened.document.write).toHaveBeenCalledWith(expect.stringContaining("<div>updated</div>"));
    expect(opened.document.close).toHaveBeenCalled();
  });

  it("updates an existing output root without rewriting the document", () => {
    const opened = createOutputWindow();
    const root = { innerHTML: "" };
    Object.assign(opened.document, {
      getElementById: vi.fn().mockReturnValue(root),
    });

    syncPrompterOutput(opened as unknown as Window, "<div>live update</div>");

    expect(root.innerHTML).toBe("<div>live update</div>");
    expect(opened.document.open).not.toHaveBeenCalled();
    expect(opened.document.write).not.toHaveBeenCalled();
    expect(opened.document.close).not.toHaveBeenCalled();
  });
});
