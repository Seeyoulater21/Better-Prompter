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
