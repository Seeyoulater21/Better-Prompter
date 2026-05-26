import type { PrompterProject } from "../types";

type RendererMode = "preview" | "output";

type TeleprompterRendererProps = {
  activeBlockId: string;
  mode: RendererMode;
  project: PrompterProject;
  scale?: number;
  scrollOffsetPx?: number;
};

export function TeleprompterRenderer({
  mode,
  project,
  scale = 1,
  scrollOffsetPx = 0,
}: TeleprompterRendererProps) {
  const activeClip = project.clips.find((clip) => clip.id === project.activeClipId) ?? project.clips[0];
  const { settings } = project;
  const showReadLine = mode === "preview" ? settings.showReadLinePreview : settings.showReadLineOutput;
  const showSafeFrame = mode === "preview" ? settings.showSafeFramePreview : settings.showSafeFrameOutput;
  const mirrorOutput = mode === "output" && settings.mirrorOutput;

  return (
    <div
      className={`prompter-canvas prompter-canvas-${mode}`}
      data-testid="prompter-canvas"
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor,
        transform: mirrorOutput ? "scaleX(-1)" : undefined,
      }}
    >
      {showSafeFrame ? <div className="prompter-safe-frame" data-testid="safe-frame" /> : null}
      {showReadLine ? <div className="prompter-read-line" data-testid="read-line" /> : null}
      <div
        className="prompter-scroll-layer"
        data-testid="prompter-scroll-layer"
        style={{
          paddingBlock: `${settings.verticalMarginPercent}%`,
          paddingInline: `${settings.horizontalMarginPercent}%`,
          transform: `translateY(-${scrollOffsetPx * scale}px)`,
        }}
      >
        {activeClip.blocks.map((block) => (
          <p
            className="prompter-block"
            key={block.id}
            style={{
              fontSize: `${settings.fontSizePt * scale}px`,
              lineHeight: `${settings.lineSpacingPercent}%`,
            }}
          >
            {block.text}
          </p>
        ))}
      </div>
    </div>
  );
}
