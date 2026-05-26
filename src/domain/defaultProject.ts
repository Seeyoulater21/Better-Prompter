import type { PrompterProject, PrompterSettings } from "../types";

export const defaultSettings: PrompterSettings = {
  fontSizePt: 72,
  horizontalMarginPercent: 12,
  verticalMarginPercent: 18,
  lineSpacingPercent: 120,
  textColor: "#ffffff",
  backgroundColor: "#000000",
  scrollSpeedPercent: 42,
  mirrorOutput: false,
  showReadLinePreview: false,
  showReadLineOutput: false,
  showSafeFramePreview: false,
  showSafeFrameOutput: false,
};

const removedAppearanceToggleSettings = {
  mirrorOutput: false,
  showReadLineOutput: false,
  showReadLinePreview: false,
  showSafeFrameOutput: false,
  showSafeFramePreview: false,
};

export function disableRemovedAppearanceToggles(project: PrompterProject): PrompterProject {
  return {
    ...project,
    settings: {
      ...project.settings,
      ...removedAppearanceToggleSettings,
    },
  };
}

export function createDefaultProject(): PrompterProject {
  return disableRemovedAppearanceToggles({
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
  });
}
