import { describe, expect, it } from "vitest";
import { createDefaultProject } from "./defaultProject";
import {
  createPlaybackState,
  getBlockScrollOffsetForReadLine,
  getScrollDelta,
  jumpToBlock,
  togglePlayback,
} from "./playback";

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

  it("jumps to a block with a measured scroll offset", () => {
    const start = {
      activeBlockId: "block-1",
      isPlaying: true,
      scrollOffsetPx: 120,
    };

    expect(jumpToBlock(start, "block-2", 240)).toEqual({
      activeBlockId: "block-2",
      isPlaying: true,
      scrollOffsetPx: 240,
    });
  });

  it("calculates the scroll offset needed to align a block with the read line", () => {
    expect(
      getBlockScrollOffsetForReadLine({
        blockTopPx: 240,
        canvasTopPx: 40,
        currentScrollOffsetPx: 100,
        readLineTopPx: 220,
        scale: 0.5,
      }),
    ).toBe(140);
  });

  it("allows negative read-line scroll offsets for early blocks", () => {
    expect(
      getBlockScrollOffsetForReadLine({
        blockTopPx: 80,
        canvasTopPx: 40,
        currentScrollOffsetPx: 0,
        readLineTopPx: 220,
        scale: 0.5,
      }),
    ).toBe(-280);
  });

  it("maps scroll speed to elapsed scroll pixels", () => {
    expect(getScrollDelta(50, 1000)).toBeGreaterThan(0);
    expect(getScrollDelta(100, 1000)).toBeGreaterThan(getScrollDelta(50, 1000));
    expect(getScrollDelta(50, 0)).toBe(0);
  });
});
