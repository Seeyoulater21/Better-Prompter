import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
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
});
