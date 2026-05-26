import { MonitorUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppearancePanel } from "./components/AppearancePanel";
import { BlockEditor } from "./components/BlockEditor";
import { ClipControls } from "./components/ClipControls";
import { PlaybackControls } from "./components/PlaybackControls";
import { TeleprompterRenderer } from "./components/TeleprompterRenderer";
import { createDefaultProject } from "./domain/defaultProject";
import {
  addBlockAfter,
  addClip,
  deleteBlock,
  deleteClip,
  duplicateBlock,
  setActiveClip,
  splitBlockAt,
  updateBlockText,
} from "./domain/projectActions";
import {
  createPlaybackState,
  getBlockScrollOffsetForReadLine,
  getScrollDelta,
  jumpToBlock,
  togglePlayback,
} from "./domain/playback";
import {
  DEFAULT_OUTPUT_VIEWPORT,
  getOutputViewport,
  openPrompterOutput,
  syncPrompterOutput,
  type OutputViewport,
} from "./output/outputWindow";
import { loadAutosavedProject, saveAutosavedProject } from "./storage/localProjectStore";
import type { PrompterProject } from "./types";

const FALLBACK_PREVIEW_SCALE = 1 / 3;

function loadInitialProject(): PrompterProject {
  return loadAutosavedProject() ?? createDefaultProject();
}

function getActiveClip(project: PrompterProject) {
  return project.clips.find((clip) => clip.id === project.activeClipId) ?? project.clips[0];
}

function activeClipHasBlock(project: PrompterProject, blockId: string): boolean {
  return getActiveClip(project).blocks.some((block) => block.id === blockId);
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

export function App() {
  const [initialProject] = useState(loadInitialProject);
  const [project, setProject] = useState(initialProject);
  const [playback, setPlayback] = useState(() => createPlaybackState(initialProject));
  const activeClip = getActiveClip(project);
  const lastFrame = useRef<number | null>(null);
  const outputWindowRef = useRef<Window | null>(null);
  const outputResizeCleanupRef = useRef<(() => void) | null>(null);
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [outputViewport, setOutputViewport] = useState<OutputViewport>(DEFAULT_OUTPUT_VIEWPORT);
  const [previewScale, setPreviewScale] = useState(FALLBACK_PREVIEW_SCALE);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveAutosavedProject(project);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " || isTextEntryTarget(event.target) || isTextEntryTarget(document.activeElement)) return;
      event.preventDefault();
      setPlayback((current) => togglePlayback(current));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const surface = previewSurfaceRef.current;
    if (!surface) return;

    const updatePreviewScale = () => {
      const rect = surface.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      setPreviewScale(Math.min(1, rect.width / outputViewport.width, rect.height / outputViewport.height));
    };

    updatePreviewScale();

    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(updatePreviewScale);
    observer.observe(surface);
    return () => observer.disconnect();
  }, [outputViewport.height, outputViewport.width]);

  useEffect(() => {
    return () => outputResizeCleanupRef.current?.();
  }, []);

  useEffect(() => {
    if (!playback.isPlaying) {
      lastFrame.current = null;
      return;
    }

    let frameId = 0;
    const tick = (time: number) => {
      const previous = lastFrame.current ?? time;
      const delta = getScrollDelta(project.settings.scrollSpeedPercent, time - previous);
      lastFrame.current = time;
      setPlayback((current) => ({ ...current, scrollOffsetPx: current.scrollOffsetPx + delta }));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [playback.isPlaying, project.settings.scrollSpeedPercent]);

  function renderOutputHtml() {
    return renderToStaticMarkup(
      <TeleprompterRenderer
        activeBlockId={playback.activeBlockId}
        mode="output"
        project={project}
        scrollOffsetPx={playback.scrollOffsetPx}
      />,
    );
  }

  function getReadLineScrollOffset(blockId: string, currentScrollOffsetPx: number) {
    const surface = previewSurfaceRef.current;
    const canvas = surface?.querySelector<HTMLElement>("[data-testid='prompter-canvas']");
    const block = Array.from(surface?.querySelectorAll<HTMLElement>("[data-prompter-block-id]") ?? []).find(
      (item) => item.dataset.prompterBlockId === blockId,
    );

    if (!canvas || !block) return 0;

    const canvasRect = canvas.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    return getBlockScrollOffsetForReadLine({
      blockTopPx: blockRect.top,
      canvasTopPx: canvasRect.top,
      currentScrollOffsetPx,
      readLineTopPx: canvasRect.top + canvasRect.height / 2,
      scale: previewScale,
    });
  }

  async function openOutput() {
    const result = await openPrompterOutput(renderOutputHtml());
    outputResizeCleanupRef.current?.();
    outputResizeCleanupRef.current = null;
    outputWindowRef.current = result.window;
    setOutputViewport(result.viewport);

    if (result.window) {
      const handleResize = () => {
        setOutputViewport(getOutputViewport(result.window));
      };
      result.window.addEventListener("resize", handleResize);
      outputResizeCleanupRef.current = () => result.window?.removeEventListener("resize", handleResize);
    }
  }

  useEffect(() => {
    if (!outputWindowRef.current || outputWindowRef.current.closed) return;
    syncPrompterOutput(outputWindowRef.current, renderOutputHtml());
  }, [project, playback.activeBlockId, playback.scrollOffsetPx]);

  const replaceProject = (nextProject: PrompterProject, nextActiveBlockId?: string) => {
    setProject(nextProject);
    setPlayback((current) =>
      jumpToBlock(current, nextActiveBlockId ?? getActiveClip(nextProject).blocks[0].id),
    );
  };

  const selectBlock = (blockId: string) => {
    setPlayback((current) => jumpToBlock(current, blockId, getReadLineScrollOffset(blockId, current.scrollOffsetPx)));
  };

  return (
    <main className="app-shell">
      <section className="workspace-frame">
        <header className="topbar">
          <strong>Better Prompter</strong>
          <div className="topbar-actions">
            <button className="output-button" onClick={openOutput} type="button">
              <MonitorUp aria-hidden="true" size={17} />
              <span>Open Prompter Output</span>
            </button>
            <ClipControls
              activeClipId={project.activeClipId}
              clips={project.clips}
              onAddClip={() => {
                const nextProject = addClip(project);
                replaceProject(nextProject);
              }}
              onDeleteClip={() => {
                const nextProject = deleteClip(project, project.activeClipId);
                replaceProject(nextProject);
              }}
              onSelectClip={(clipId) => {
                const nextProject = setActiveClip(project, clipId);
                replaceProject(nextProject);
              }}
            />
          </div>
        </header>
        <div className="workspace-main">
          <div className="left-column">
            <AppearancePanel
              onChange={(settings) => setProject((current) => ({ ...current, settings }))}
              settings={project.settings}
            />
            <section className="panel teleprompt-panel" aria-labelledby="teleprompt-heading">
              <h2 id="teleprompt-heading">Teleprompt View</h2>
              <div
                className="teleprompt-surface"
                ref={previewSurfaceRef}
                style={{ aspectRatio: `${outputViewport.width} / ${outputViewport.height}` }}
              >
                <TeleprompterRenderer
                  activeBlockId={playback.activeBlockId}
                  mode="preview"
                  project={project}
                  scale={previewScale}
                  scrollOffsetPx={playback.scrollOffsetPx}
                />
              </div>
            </section>
          </div>
          <BlockEditor
            activeBlockId={playback.activeBlockId}
            clip={activeClip}
            onAddBlockAfter={(blockId) => {
              const result = addBlockAfter(project, blockId);
              replaceProject(result.project, result.newBlockId);
            }}
            onDeleteBlock={(blockId) => {
              const nextProject = deleteBlock(project, blockId);
              const nextActiveBlockId = activeClipHasBlock(nextProject, playback.activeBlockId)
                ? playback.activeBlockId
                : undefined;
              replaceProject(nextProject, nextActiveBlockId);
            }}
            onDuplicateBlock={(blockId) => {
              const nextProject = duplicateBlock(project, blockId);
              replaceProject(nextProject, blockId);
            }}
            onSelectBlock={selectBlock}
            onSplitBlock={(blockId, cursorIndex) => {
              const result = splitBlockAt(project, blockId, cursorIndex);
              replaceProject(result.project, result.newBlockId);
            }}
            onUpdateBlockText={(blockId, text) => setProject((current) => updateBlockText(current, blockId, text))}
          />
        </div>
        <PlaybackControls isPlaying={playback.isPlaying} onToggle={() => setPlayback((current) => togglePlayback(current))} />
      </section>
    </main>
  );
}
