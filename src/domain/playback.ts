import type { PlaybackState, PrompterProject } from "../types";

function getFirstBlockId(project: PrompterProject): string {
  const activeClip = project.clips.find((clip) => clip.id === project.activeClipId) ?? project.clips[0];
  return activeClip.blocks[0].id;
}

export function createPlaybackState(project: PrompterProject): PlaybackState {
  return {
    activeBlockId: getFirstBlockId(project),
    isPlaying: false,
    scrollOffsetPx: 0,
  };
}

export function togglePlayback(playback: PlaybackState): PlaybackState {
  return {
    ...playback,
    isPlaying: !playback.isPlaying,
  };
}

export function jumpToBlock(playback: PlaybackState, blockId: string): PlaybackState {
  return {
    ...playback,
    activeBlockId: blockId,
    scrollOffsetPx: 0,
  };
}

export function getScrollDelta(scrollSpeedPercent: number, elapsedMs: number): number {
  const boundedSpeed = Math.min(100, Math.max(0, scrollSpeedPercent));
  const minPixelsPerSecond = 12;
  const maxPixelsPerSecond = 180;
  const pixelsPerSecond = minPixelsPerSecond + ((maxPixelsPerSecond - minPixelsPerSecond) * boundedSpeed) / 100;

  return (pixelsPerSecond * elapsedMs) / 1000;
}
