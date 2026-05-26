import { useEffect, useState } from "react";
import { AppearancePanel } from "./components/AppearancePanel";
import { BlockEditor } from "./components/BlockEditor";
import { ClipControls } from "./components/ClipControls";
import { PlaybackControls } from "./components/PlaybackControls";
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
import { createPlaybackState, jumpToBlock, togglePlayback } from "./domain/playback";
import { loadAutosavedProject, saveAutosavedProject } from "./storage/localProjectStore";
import type { PrompterProject } from "./types";

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

  const replaceProject = (nextProject: PrompterProject, nextActiveBlockId?: string) => {
    setProject(nextProject);
    setPlayback((current) =>
      jumpToBlock(current, nextActiveBlockId ?? getActiveClip(nextProject).blocks[0].id),
    );
  };

  return (
    <main className="app-shell">
      <section className="workspace-frame">
        <header className="topbar">
          <strong>Better Prompter</strong>
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
                style={{
                  backgroundColor: project.settings.backgroundColor,
                  color: project.settings.textColor,
                  fontSize: `${Math.max(18, project.settings.fontSizePt / 3)}px`,
                  lineHeight: `${project.settings.lineSpacingPercent}%`,
                  padding: `${project.settings.verticalMarginPercent / 2}% ${project.settings.horizontalMarginPercent / 2}%`,
                }}
              >
                {activeClip.blocks.map((block) => (
                  <p className={block.id === playback.activeBlockId ? "is-active" : ""} key={block.id}>
                    {block.text}
                  </p>
                ))}
                {project.settings.showReadLinePreview ? <div className="read-line" /> : null}
                {project.settings.showSafeFramePreview ? <div className="safe-frame" /> : null}
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
            onSelectBlock={(blockId) => setPlayback((current) => jumpToBlock(current, blockId))}
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
