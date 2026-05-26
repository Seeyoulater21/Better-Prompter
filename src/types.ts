export type PrompterSettings = {
  fontSizePt: number;
  horizontalMarginPercent: number;
  verticalMarginPercent: number;
  lineSpacingPercent: number;
  textColor: string;
  backgroundColor: string;
  scrollSpeedPercent: number;
  mirrorOutput: boolean;
  showReadLinePreview: boolean;
  showReadLineOutput: boolean;
  showSafeFramePreview: boolean;
  showSafeFrameOutput: boolean;
};

export type ScriptBlock = {
  id: string;
  text: string;
};

export type Clip = {
  id: string;
  blocks: ScriptBlock[];
};

export type PrompterProject = {
  version: 1;
  settings: PrompterSettings;
  clips: Clip[];
  activeClipId: string;
};

export type PlaybackState = {
  activeBlockId: string;
  isPlaying: boolean;
  scrollOffsetPx: number;
};
