import { describe, expect, it } from "vitest";
import { createDefaultProject } from "./defaultProject";
import { createPlaybackState, getScrollDelta, jumpToBlock, togglePlayback } from "./playback";

describe("playback", () => {
  it("starts paused on the first block in the active clip", () => {
    const project = createDefaultProject();

    expect(createPlaybackState(project)).toEqual({
      activeBlockId: "block-1",
      isPlaying: false,
      scrollOffsetPx: 0,
    });
  });

  it("toggles play and pause without changing the active block", () => {
    const start = createPlaybackState(createDefaultProject());
    const playing = togglePlayback(start);
    const paused = togglePlayback(playing);

    expect(playing).toEqual({ ...start, isPlaying: true });
    expect(paused).toEqual(start);
  });

  it("jumps to a block and resets scroll offset", () => {
    const start = {
      activeBlockId: "block-1",
      isPlaying: true,
      scrollOffsetPx: 120,
    };

    expect(jumpToBlock(start, "block-2")).toEqual({
      activeBlockId: "block-2",
      isPlaying: true,
      scrollOffsetPx: 0,
    });
  });

  it("maps scroll speed to elapsed scroll pixels", () => {
    expect(getScrollDelta(50, 1000)).toBeGreaterThan(0);
    expect(getScrollDelta(100, 1000)).toBeGreaterThan(getScrollDelta(50, 1000));
    expect(getScrollDelta(50, 0)).toBe(0);
  });
});
