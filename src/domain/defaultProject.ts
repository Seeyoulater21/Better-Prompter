import type { PrompterProject, PrompterSettings } from "../types";

export const defaultSettings: PrompterSettings = {
  fontSizePt: 72,
  horizontalMarginPercent: 12,
  verticalMarginPercent: 18,
  lineSpacingPercent: 120,
  textColor: "#ffffff",
  backgroundColor: "#000000",
  scrollSpeedPercent: 42,
  mirrorOutput: true,
  showReadLinePreview: true,
  showReadLineOutput: false,
  showSafeFramePreview: true,
  showSafeFrameOutput: false,
};

export function createDefaultProject(): PrompterProject {
  return {
    version: 1,
    settings: { ...defaultSettings },
    clips: [
      {
        id: "clip-1",
        blocks: [
          {
            id: "block-1",
            text: "",
          },
        ],
      },
    ],
    activeClipId: "clip-1",
  };
}
