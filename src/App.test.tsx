import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { openPrompterOutput, syncPrompterOutput } from "./output/outputWindow";

const outputWindowMock = vi.hoisted(() => ({
  outputWindow: { addEventListener: vi.fn(), closed: false, removeEventListener: vi.fn() },
  openPrompterOutput: vi.fn(),
  syncPrompterOutput: vi.fn(),
}));

vi.mock("./output/outputWindow", () => ({
  DEFAULT_OUTPUT_VIEWPORT: { width: 1024, height: 600 },
  getOutputViewport: vi.fn(() => ({ width: 1016, height: 600 })),
  openPrompterOutput: outputWindowMock.openPrompterOutput,
  syncPrompterOutput: outputWindowMock.syncPrompterOutput,
}));

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    outputWindowMock.openPrompterOutput.mockResolvedValue({
      mode: "manual",
      viewport: { width: 1016, height: 600 },
      window: outputWindowMock.outputWindow as unknown as Window,
    });
    outputWindowMock.syncPrompterOutput.mockClear();
    outputWindowMock.outputWindow.addEventListener.mockClear();
    outputWindowMock.outputWindow.removeEventListener.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shows the operator workspace controls without previous or next controls", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Select clip")).toBeInTheDocument();
    expect(screen.getByLabelText("Add clip")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete clip")).toBeInTheDocument();
  });

  it("uses the spacebar to toggle playback when focus is outside text entry", () => {
    render(<App />);

    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.keyDown(window, { key: " " });

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("does not use the spacebar to toggle playback while typing in a block", () => {
    render(<App />);

    const textarea = screen.getByLabelText("Block 1");
    textarea.focus();
    fireEvent.keyDown(window, { key: " " });

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("splits a block at the cursor and moves focus to the new block", () => {
    render(<App />);

    const textarea = screen.getByLabelText("Block 1") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "firstsecond" } });
    textarea.setSelectionRange(5, 5);
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(screen.getByDisplayValue("first")).toBeInTheDocument();
    expect(screen.getByDisplayValue("second")).toBeInTheDocument();
    expect(screen.getByLabelText("Block 2")).toHaveFocus();
  });

  it("adds and selects clips from the top bar", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Add clip"));
    fireEvent.change(screen.getByLabelText("Select clip"), { target: { value: "clip-1" } });

    expect(screen.getByLabelText("Select clip")).toHaveValue("clip-1");
  });

  it("keeps the active block when deleting a different block", () => {
    render(<App />);

    fireEvent.click(within(screen.getByTestId("block-row-block-1")).getByLabelText("Add block after"));
    fireEvent.click(within(screen.getByTestId("block-row-block-2")).getByLabelText("Add block after"));
    fireEvent.click(within(screen.getByTestId("block-row-block-2")).getByLabelText("Delete block"));

    expect(screen.getByLabelText("Block 2")).toHaveFocus();
  });

  it("restores edited text from autosave on remount", () => {
    const { unmount } = render(<App />);

    fireEvent.change(screen.getByLabelText("Block 1"), { target: { value: "saved script" } });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    unmount();
    render(<App />);

    expect(screen.getByDisplayValue("saved script")).toBeInTheDocument();
  });

  it("opens a clean prompter output from the shared renderer", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Block 1"), { target: { value: "output only text" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open Prompter Output" }));
    });

    const outputHtml = vi.mocked(openPrompterOutput).mock.calls[0]?.[0] ?? "";
    expect(openPrompterOutput).toHaveBeenCalledOnce();
    expect(outputHtml).toContain("output only text");
    expect(outputHtml).toContain("prompter-canvas-output");
    expect(outputHtml).not.toContain("Text Edit / Blocks");
    expect(outputHtml).not.toContain("Play");
  });

  it("sizes the Teleprompt View from the opened output viewport", async () => {
    const { container } = render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open Prompter Output" }));
    });

    expect(container.querySelector(".teleprompt-surface")).toHaveStyle({
      aspectRatio: "1016 / 600",
    });
  });

  it("syncs the output window when project state changes", async () => {
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open Prompter Output" }));
    });
    vi.mocked(syncPrompterOutput).mockClear();

    act(() => {
      fireEvent.change(screen.getByLabelText("Block 1"), { target: { value: "updated output text" } });
    });

    expect(syncPrompterOutput).toHaveBeenCalledWith(
      outputWindowMock.outputWindow,
      expect.stringContaining("updated output text"),
    );
  });

  it("clicking a block scrolls output so the block aligns with the read line", async () => {
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getRect(this: HTMLElement) {
      const element = this;
      const blockId = element.dataset.prompterBlockId;

      if (
        element.classList.contains("teleprompt-viewport-slot") ||
        element.classList.contains("teleprompt-surface") ||
        element.classList.contains("prompter-canvas")
      ) {
        return {
          bottom: 360,
          height: 360,
          left: 0,
          right: 640,
          top: 0,
          width: 640,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      if (blockId === "block-2") {
        return {
          bottom: 270,
          height: 30,
          left: 0,
          right: 100,
          top: 240,
          width: 100,
          x: 0,
          y: 240,
          toJSON: () => ({}),
        };
      }

      return originalGetBoundingClientRect.call(element);
    });

    render(<App />);

    fireEvent.click(within(screen.getByTestId("block-row-block-1")).getByLabelText("Add block after"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open Prompter Output" }));
    });
    vi.mocked(syncPrompterOutput).mockClear();

    fireEvent.click(screen.getByTestId("block-row-block-2"));

    expect(syncPrompterOutput).toHaveBeenCalledWith(
      outputWindowMock.outputWindow,
      expect.stringContaining("translateY(-100px)"),
    );
  });
});
