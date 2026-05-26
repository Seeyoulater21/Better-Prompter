import type { Clip, PrompterProject, PrompterSettings, ScriptBlock } from "../types";

const REQUIRED_NUMBER_SETTINGS: Array<keyof Pick<
  PrompterSettings,
  | "fontSizePt"
  | "horizontalMarginPercent"
  | "verticalMarginPercent"
  | "lineSpacingPercent"
  | "scrollSpeedPercent"
>> = [
  "fontSizePt",
  "horizontalMarginPercent",
  "verticalMarginPercent",
  "lineSpacingPercent",
  "scrollSpeedPercent",
];

const REQUIRED_BOOLEAN_SETTINGS: Array<keyof Pick<
  PrompterSettings,
  "mirrorOutput" | "showReadLinePreview" | "showReadLineOutput" | "showSafeFramePreview" | "showSafeFrameOutput"
>> = ["mirrorOutput", "showReadLinePreview", "showReadLineOutput", "showSafeFramePreview", "showSafeFrameOutput"];

const REQUIRED_COLOR_SETTINGS: Array<keyof Pick<PrompterSettings, "textColor" | "backgroundColor">> = [
  "textColor",
  "backgroundColor",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSettings(value: unknown): value is PrompterSettings {
  if (!isRecord(value)) return false;

  return (
    REQUIRED_NUMBER_SETTINGS.every((key) => typeof value[key] === "number") &&
    REQUIRED_BOOLEAN_SETTINGS.every((key) => typeof value[key] === "boolean") &&
    REQUIRED_COLOR_SETTINGS.every((key) => typeof value[key] === "string")
  );
}

function isBlock(value: unknown): value is ScriptBlock {
  return isRecord(value) && typeof value.id === "string" && typeof value.text === "string";
}

function isClip(value: unknown): value is Clip {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    Array.isArray(value.blocks) &&
    value.blocks.length > 0 &&
    value.blocks.every(isBlock)
  );
}

function isProject(value: unknown): value is PrompterProject {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (!isSettings(value.settings)) return false;
  if (!Array.isArray(value.clips) || value.clips.length === 0 || !value.clips.every(isClip)) return false;
  if (typeof value.activeClipId !== "string") return false;

  const clipIds = value.clips.map((clip) => clip.id);
  const blockIds = value.clips.flatMap((clip) => clip.blocks.map((block) => block.id));

  return (
    value.clips.some((clip) => clip.id === value.activeClipId) &&
    new Set(clipIds).size === clipIds.length &&
    new Set(blockIds).size === blockIds.length
  );
}

export function parseProjectJson(json: string): PrompterProject {
  const value = JSON.parse(json) as unknown;
  if (!isProject(value)) {
    throw new Error("Unsupported project file");
  }

  return value;
}

export function serializeProjectJson(project: PrompterProject): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}
