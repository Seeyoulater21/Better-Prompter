# Better Prompter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Better Prompter MVP as a Brave-targeted web app with black 16:9 operator workspace, exact prompter preview/output, editable text blocks, clip stock, autosave, JSON import/export, and a macOS launcher.

**Architecture:** Use a client-only React app with a small domain layer for project data, playback, persistence, and output-window control. Keep the teleprompter renderer shared between the in-app preview and the external output window so preview and output cannot drift. Use a pure bash `.command` launcher to start/adopt the dev server and open Brave.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, CSS, browser `localStorage`, JSON Blob import/export, Chromium Window Management API feature detection, bash 3.2-compatible macOS launcher.

---

## File Structure

- Create `package.json` - scripts and dependencies.
- Create `index.html` - Vite root document.
- Create `tsconfig.json` - strict TypeScript app config.
- Create `tsconfig.node.json` - Vite config TypeScript config.
- Create `vite.config.ts` - Vite + React + Vitest config.
- Create `src/main.tsx` - React entrypoint.
- Create `src/App.tsx` - top-level state wiring and layout.
- Create `src/styles.css` - black 16:9 interface and renderer styles.
- Create `src/types.ts` - project, clip, block, settings, and playback types.
- Create `src/domain/defaultProject.ts` - default settings and starter project.
- Create `src/domain/projectActions.ts` - pure project mutation helpers.
- Create `src/domain/playback.ts` - pure playback helpers.
- Create `src/storage/localProjectStore.ts` - autosave and restore.
- Create `src/storage/projectFile.ts` - JSON import/export helpers.
- Create `src/output/outputWindow.ts` - output window open/sync and screen feature detection.
- Create `src/components/AppearancePanel.tsx` - settings UI.
- Create `src/components/ClipControls.tsx` - clip dropdown and add/delete controls.
- Create `src/components/BlockEditor.tsx` - free-edit block list and split behavior.
- Create `src/components/TeleprompterRenderer.tsx` - shared preview/output renderer.
- Create `src/components/PlaybackControls.tsx` - Play/Pause control.
- Create `src/domain/projectActions.test.ts` - domain behavior tests.
- Create `src/domain/playback.test.ts` - playback helper tests.
- Create `src/storage/localProjectStore.test.ts` - autosave tests.
- Create `src/storage/projectFile.test.ts` - JSON import/export tests.
- Create `src/components/BlockEditor.test.tsx` - editor interaction tests.
- Create `src/components/TeleprompterRenderer.test.tsx` - renderer style/guide tests.
- Create `src/output/outputWindow.test.ts` - output fallback tests.
- Create `Better Prompter.command` - interactive launcher.
- Create `.gitignore` - generated files, logs, dependencies, brainstorm temp files.

## Task 1: Scaffold Vite React TypeScript App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `.gitignore`

- [ ] **Step 1: Create package and config files**

Create `package.json`:

```json
{
  "name": "better-prompter",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Better Prompter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/testSetup.ts",
    globals: true,
  },
});
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.launcher-logs/
.superpowers/
.DS_Store
```

- [ ] **Step 2: Create entrypoint and minimal app**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="workspace-frame">
        <div className="topbar">
          <strong>Better Prompter</strong>
        </div>
        <div className="workspace-main">
          <div className="left-column">
            <div className="panel">Appearance</div>
            <div className="panel">Teleprompt View</div>
          </div>
          <div className="panel">Text Edit / Blocks</div>
        </div>
        <div className="playback-bar">Play/Pause</div>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  background: #050505;
  color: #f4f4f4;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #050505;
}

.workspace-frame {
  width: min(100%, 1400px);
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-rows: 48px 1fr 76px;
  gap: 12px;
  padding: 12px;
  border: 1px solid #282828;
  border-radius: 8px;
  background: #080808;
}

.topbar,
.panel,
.playback-bar {
  border: 1px solid #303030;
  border-radius: 8px;
  background: #151515;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}

.workspace-main {
  min-height: 0;
  display: grid;
  grid-template-columns: 30% 1fr;
  gap: 12px;
}

.left-column {
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
}

.panel {
  min-height: 0;
  overflow: hidden;
  padding: 12px;
}

.playback-bar {
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 4: Verify scaffold**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src/main.tsx src/App.tsx src/styles.css .gitignore
git commit -m "feat: scaffold better prompter app"
```

## Task 2: Project Domain Model And Pure Actions

**Files:**
- Create: `src/types.ts`
- Create: `src/domain/defaultProject.ts`
- Create: `src/domain/projectActions.ts`
- Create: `src/domain/projectActions.test.ts`
- Create: `src/testSetup.ts`

- [ ] **Step 1: Add test setup**

Create `src/testSetup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing domain tests**

Create `src/domain/projectActions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createDefaultProject } from "./defaultProject";
import {
  addBlockAfter,
  addClip,
  deleteClip,
  duplicateBlock,
  splitBlockAt,
  updateBlockText,
} from "./projectActions";

describe("project actions", () => {
  it("creates a project with one clip and one editable block", () => {
    const project = createDefaultProject();

    expect(project.version).toBe(1);
    expect(project.clips).toHaveLength(1);
    expect(project.clips[0].blocks).toHaveLength(1);
    expect(project.activeClipId).toBe(project.clips[0].id);
  });

  it("adds and deletes clips while keeping an active clip", () => {
    const start = createDefaultProject();
    const added = addClip(start);
    const newClip = added.clips[1];
    const deleted = deleteClip(added, start.clips[0].id);

    expect(added.clips).toHaveLength(2);
    expect(added.activeClipId).toBe(newClip.id);
    expect(deleted.clips).toHaveLength(1);
    expect(deleted.activeClipId).toBe(newClip.id);
  });

  it("does not delete the final remaining clip", () => {
    const project = createDefaultProject();
    const result = deleteClip(project, project.activeClipId);

    expect(result).toBe(project);
  });

  it("updates and duplicates a block", () => {
    const project = createDefaultProject();
    const block = project.clips[0].blocks[0];
    const edited = updateBlockText(project, block.id, "hello");
    const duplicated = duplicateBlock(edited, block.id);

    expect(edited.clips[0].blocks[0].text).toBe("hello");
    expect(duplicated.clips[0].blocks).toHaveLength(2);
    expect(duplicated.clips[0].blocks[1].text).toBe("hello");
  });

  it("splits a block at cursor and returns the new block id", () => {
    const project = createDefaultProject();
    const block = project.clips[0].blocks[0];
    const edited = updateBlockText(project, block.id, "first halfsecond half");
    const result = splitBlockAt(edited, block.id, 10);

    expect(result.project.clips[0].blocks).toHaveLength(2);
    expect(result.project.clips[0].blocks[0].text).toBe("first half");
    expect(result.project.clips[0].blocks[1].text).toBe("second half");
    expect(result.newBlockId).toBe(result.project.clips[0].blocks[1].id);
  });

  it("adds an empty block after the selected block", () => {
    const project = createDefaultProject();
    const block = project.clips[0].blocks[0];
    const result = addBlockAfter(project, block.id);

    expect(result.project.clips[0].blocks).toHaveLength(2);
    expect(result.project.clips[0].blocks[1].text).toBe("");
    expect(result.newBlockId).toBe(result.project.clips[0].blocks[1].id);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

Run: `npm test -- src/domain/projectActions.test.ts`

Expected: FAIL because `defaultProject` and `projectActions` modules do not exist.

- [ ] **Step 4: Add types and default project**

Create `src/types.ts`:

```ts
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
```

Create `src/domain/defaultProject.ts`:

```ts
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

let nextId = 1;

export function createId(prefix: string) {
  const id = `${prefix}-${nextId}`;
  nextId += 1;
  return id;
}

export function createDefaultProject(): PrompterProject {
  const clipId = createId("clip");
  const blockId = createId("block");

  return {
    version: 1,
    settings: defaultSettings,
    activeClipId: clipId,
    clips: [
      {
        id: clipId,
        blocks: [
          {
            id: blockId,
            text: "",
          },
        ],
      },
    ],
  };
}
```

- [ ] **Step 5: Add pure project actions**

Create `src/domain/projectActions.ts`:

```ts
import type { Clip, PrompterProject, ScriptBlock } from "../types";
import { createId } from "./defaultProject";

function getActiveClip(project: PrompterProject): Clip {
  const clip = project.clips.find((item) => item.id === project.activeClipId);
  return clip ?? project.clips[0];
}

function updateActiveClip(project: PrompterProject, updater: (clip: Clip) => Clip): PrompterProject {
  const activeClip = getActiveClip(project);
  return {
    ...project,
    activeClipId: activeClip.id,
    clips: project.clips.map((clip) => (clip.id === activeClip.id ? updater(clip) : clip)),
  };
}

export function setActiveClip(project: PrompterProject, clipId: string): PrompterProject {
  if (!project.clips.some((clip) => clip.id === clipId)) return project;
  return { ...project, activeClipId: clipId };
}

export function addClip(project: PrompterProject): PrompterProject {
  const clip: Clip = {
    id: createId("clip"),
    blocks: [{ id: createId("block"), text: "" }],
  };

  return {
    ...project,
    activeClipId: clip.id,
    clips: [...project.clips, clip],
  };
}

export function deleteClip(project: PrompterProject, clipId: string): PrompterProject {
  if (project.clips.length <= 1) return project;

  const clips = project.clips.filter((clip) => clip.id !== clipId);
  const activeClipId = project.activeClipId === clipId ? clips[0].id : project.activeClipId;

  return {
    ...project,
    activeClipId,
    clips,
  };
}

export function updateBlockText(project: PrompterProject, blockId: string, text: string): PrompterProject {
  return updateActiveClip(project, (clip) => ({
    ...clip,
    blocks: clip.blocks.map((block) => (block.id === blockId ? { ...block, text } : block)),
  }));
}

export function addBlockAfter(project: PrompterProject, blockId: string): { project: PrompterProject; newBlockId: string } {
  const newBlock: ScriptBlock = { id: createId("block"), text: "" };
  const updated = updateActiveClip(project, (clip) => {
    const index = clip.blocks.findIndex((block) => block.id === blockId);
    const insertAt = index === -1 ? clip.blocks.length : index + 1;
    return {
      ...clip,
      blocks: [...clip.blocks.slice(0, insertAt), newBlock, ...clip.blocks.slice(insertAt)],
    };
  });

  return { project: updated, newBlockId: newBlock.id };
}

export function duplicateBlock(project: PrompterProject, blockId: string): PrompterProject {
  const source = getActiveClip(project).blocks.find((block) => block.id === blockId);
  if (!source) return project;

  const newBlock: ScriptBlock = { id: createId("block"), text: source.text };
  return updateActiveClip(project, (clip) => {
    const index = clip.blocks.findIndex((block) => block.id === blockId);
    return {
      ...clip,
      blocks: [...clip.blocks.slice(0, index + 1), newBlock, ...clip.blocks.slice(index + 1)],
    };
  });
}

export function deleteBlock(project: PrompterProject, blockId: string): PrompterProject {
  return updateActiveClip(project, (clip) => {
    if (clip.blocks.length <= 1) return clip;
    return {
      ...clip,
      blocks: clip.blocks.filter((block) => block.id !== blockId),
    };
  });
}

export function splitBlockAt(
  project: PrompterProject,
  blockId: string,
  cursorIndex: number,
): { project: PrompterProject; newBlockId: string } {
  const activeClip = getActiveClip(project);
  const source = activeClip.blocks.find((block) => block.id === blockId);
  if (!source) return { project, newBlockId: blockId };

  const before = source.text.slice(0, cursorIndex);
  const after = source.text.slice(cursorIndex);
  const newBlock: ScriptBlock = { id: createId("block"), text: after };

  const updated = updateActiveClip(project, (clip) => ({
    ...clip,
    blocks: clip.blocks.flatMap((block) => {
      if (block.id !== blockId) return [block];
      return [{ ...block, text: before }, newBlock];
    }),
  }));

  return { project: updated, newBlockId: newBlock.id };
}
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/domain/projectActions.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/testSetup.ts src/types.ts src/domain/defaultProject.ts src/domain/projectActions.ts src/domain/projectActions.test.ts
git commit -m "feat: add project domain model"
```

## Task 3: Persistence And JSON Project Files

**Files:**
- Create: `src/storage/localProjectStore.ts`
- Create: `src/storage/projectFile.ts`
- Create: `src/storage/localProjectStore.test.ts`
- Create: `src/storage/projectFile.test.ts`

- [ ] **Step 1: Write failing storage tests**

Create `src/storage/localProjectStore.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { loadAutosavedProject, saveAutosavedProject } from "./localProjectStore";

describe("localProjectStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads the latest project snapshot", () => {
    const project = createDefaultProject();
    project.clips[0].blocks[0].text = "saved text";

    saveAutosavedProject(project);

    expect(loadAutosavedProject()?.clips[0].blocks[0].text).toBe("saved text");
  });

  it("returns null when stored JSON is corrupt", () => {
    localStorage.setItem("better-prompter:last-project", "{");

    expect(loadAutosavedProject()).toBeNull();
  });
});
```

Create `src/storage/projectFile.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { parseProjectJson, serializeProjectJson } from "./projectFile";

describe("projectFile", () => {
  it("serializes and parses a project file", () => {
    const project = createDefaultProject();
    project.clips[0].blocks[0].text = "export me";

    const parsed = parseProjectJson(serializeProjectJson(project));

    expect(parsed.clips[0].blocks[0].text).toBe("export me");
  });

  it("rejects invalid project JSON", () => {
    expect(() => parseProjectJson('{"version":2}')).toThrow("Unsupported project file");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/storage/localProjectStore.test.ts src/storage/projectFile.test.ts`

Expected: FAIL because storage modules do not exist.

- [ ] **Step 3: Add local autosave store**

Create `src/storage/localProjectStore.ts`:

```ts
import type { PrompterProject } from "../types";
import { parseProjectJson, serializeProjectJson } from "./projectFile";

const AUTOSAVE_KEY = "better-prompter:last-project";

export function saveAutosavedProject(project: PrompterProject) {
  localStorage.setItem(AUTOSAVE_KEY, serializeProjectJson(project));
}

export function loadAutosavedProject(): PrompterProject | null {
  const value = localStorage.getItem(AUTOSAVE_KEY);
  if (!value) return null;

  try {
    return parseProjectJson(value);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Add JSON parse and serialize helpers**

Create `src/storage/projectFile.ts`:

```ts
import type { PrompterProject } from "../types";

function isProject(value: unknown): value is PrompterProject {
  if (!value || typeof value !== "object") return false;

  const project = value as PrompterProject;
  return (
    project.version === 1 &&
    typeof project.activeClipId === "string" &&
    Array.isArray(project.clips) &&
    project.clips.every(
      (clip) =>
        typeof clip.id === "string" &&
        Array.isArray(clip.blocks) &&
        clip.blocks.every((block) => typeof block.id === "string" && typeof block.text === "string"),
    ) &&
    typeof project.settings?.fontSizePt === "number" &&
    typeof project.settings?.scrollSpeedPercent === "number"
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
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/storage/localProjectStore.test.ts src/storage/projectFile.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/storage/localProjectStore.ts src/storage/projectFile.ts src/storage/localProjectStore.test.ts src/storage/projectFile.test.ts
git commit -m "feat: add project persistence"
```

## Task 4: Shared Teleprompter Renderer

**Files:**
- Create: `src/components/TeleprompterRenderer.tsx`
- Create: `src/components/TeleprompterRenderer.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing renderer tests**

Create `src/components/TeleprompterRenderer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { TeleprompterRenderer } from "./TeleprompterRenderer";

describe("TeleprompterRenderer", () => {
  it("renders block text using project appearance settings", () => {
    const project = createDefaultProject();
    project.clips[0].blocks[0].text = "hello prompter";

    render(<TeleprompterRenderer project={project} mode="preview" activeBlockId={project.clips[0].blocks[0].id} />);

    const canvas = screen.getByTestId("prompter-canvas");
    expect(screen.getByText("hello prompter")).toBeInTheDocument();
    expect(canvas).toHaveStyle({ backgroundColor: "#000000", color: "#ffffff" });
  });

  it("shows preview guides only when preview settings are enabled", () => {
    const project = createDefaultProject();

    render(<TeleprompterRenderer project={project} mode="preview" activeBlockId={project.clips[0].blocks[0].id} />);

    expect(screen.getByTestId("read-line")).toBeInTheDocument();
    expect(screen.getByTestId("safe-frame")).toBeInTheDocument();
  });

  it("hides output guides by default", () => {
    const project = createDefaultProject();

    render(<TeleprompterRenderer project={project} mode="output" activeBlockId={project.clips[0].blocks[0].id} />);

    expect(screen.queryByTestId("read-line")).not.toBeInTheDocument();
    expect(screen.queryByTestId("safe-frame")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/components/TeleprompterRenderer.test.tsx`

Expected: FAIL because `TeleprompterRenderer` does not exist.

- [ ] **Step 3: Add renderer component**

Create `src/components/TeleprompterRenderer.tsx`:

```tsx
import type { PrompterProject } from "../types";

type RendererMode = "preview" | "output";

type TeleprompterRendererProps = {
  project: PrompterProject;
  mode: RendererMode;
  activeBlockId: string;
  scrollOffsetPx?: number;
};

export function TeleprompterRenderer({
  project,
  mode,
  activeBlockId,
  scrollOffsetPx = 0,
}: TeleprompterRendererProps) {
  const clip = project.clips.find((item) => item.id === project.activeClipId) ?? project.clips[0];
  const settings = project.settings;
  const showReadLine = mode === "preview" ? settings.showReadLinePreview : settings.showReadLineOutput;
  const showSafeFrame = mode === "preview" ? settings.showSafeFramePreview : settings.showSafeFrameOutput;

  return (
    <div
      data-testid="prompter-canvas"
      className={`prompter-canvas prompter-canvas-${mode}`}
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor,
        transform: mode === "output" && settings.mirrorOutput ? "scaleX(-1)" : undefined,
      }}
    >
      {showSafeFrame ? <div data-testid="safe-frame" className="prompter-safe-frame" /> : null}
      {showReadLine ? <div data-testid="read-line" className="prompter-read-line" /> : null}
      <div
        className="prompter-scroll-layer"
        style={{
          paddingInline: `${settings.horizontalMarginPercent}%`,
          paddingBlock: `${settings.verticalMarginPercent}%`,
          transform: `translateY(${-scrollOffsetPx}px)`,
        }}
      >
        {clip.blocks.map((block) => (
          <div
            key={block.id}
            className={block.id === activeBlockId ? "prompter-block prompter-block-active" : "prompter-block"}
            style={{
              fontSize: `${settings.fontSizePt}px`,
              lineHeight: `${settings.lineSpacingPercent}%`,
            }}
          >
            {block.text}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add renderer CSS**

Append to `src/styles.css`:

```css
.prompter-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.prompter-scroll-layer {
  position: absolute;
  inset: 0;
  white-space: pre-wrap;
  transition: transform 80ms linear;
}

.prompter-block {
  font-weight: 750;
  margin-bottom: 0.8em;
}

.prompter-safe-frame {
  position: absolute;
  inset: 12%;
  border: 1px dashed rgba(255, 255, 255, 0.22);
  pointer-events: none;
  z-index: 2;
}

.prompter-read-line {
  position: absolute;
  top: 48%;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(250, 204, 21, 0.85);
  pointer-events: none;
  z-index: 3;
}

.prompter-canvas-output {
  border-radius: 0;
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/components/TeleprompterRenderer.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/TeleprompterRenderer.tsx src/components/TeleprompterRenderer.test.tsx src/styles.css
git commit -m "feat: add shared teleprompter renderer"
```

## Task 5: Block Editor And Clip Controls

**Files:**
- Create: `src/components/BlockEditor.tsx`
- Create: `src/components/ClipControls.tsx`
- Create: `src/components/BlockEditor.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing editor tests**

Create `src/components/BlockEditor.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { BlockEditor } from "./BlockEditor";

describe("BlockEditor", () => {
  it("edits block text", async () => {
    const user = userEvent.setup();
    const project = createDefaultProject();
    const onProjectChange = vi.fn();

    render(
      <BlockEditor
        project={project}
        activeBlockId={project.clips[0].blocks[0].id}
        onProjectChange={onProjectChange}
        onJumpToBlock={vi.fn()}
      />,
    );

    await user.type(screen.getByRole("textbox"), "hello");

    expect(onProjectChange).toHaveBeenLastCalledWith(expect.objectContaining({ clips: expect.any(Array) }));
  });

  it("splits a block on Control Enter and jumps to new block", async () => {
    const user = userEvent.setup();
    const project = createDefaultProject();
    project.clips[0].blocks[0].text = "alphabeta";
    const onProjectChange = vi.fn();
    const onJumpToBlock = vi.fn();

    render(
      <BlockEditor
        project={project}
        activeBlockId={project.clips[0].blocks[0].id}
        onProjectChange={onProjectChange}
        onJumpToBlock={onJumpToBlock}
      />,
    );

    const textbox = screen.getByRole("textbox") as HTMLTextAreaElement;
    textbox.setSelectionRange(5, 5);
    await user.keyboard("{Control>}{Enter}{/Control}");

    expect(onProjectChange).toHaveBeenCalled();
    expect(onJumpToBlock).toHaveBeenCalledWith(expect.stringMatching(/^block-/));
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/components/BlockEditor.test.tsx`

Expected: FAIL because `BlockEditor` does not exist.

- [ ] **Step 3: Add BlockEditor**

Create `src/components/BlockEditor.tsx`:

```tsx
import type { PrompterProject } from "../types";
import { addBlockAfter, deleteBlock, duplicateBlock, splitBlockAt, updateBlockText } from "../domain/projectActions";

type BlockEditorProps = {
  project: PrompterProject;
  activeBlockId: string;
  onProjectChange: (project: PrompterProject) => void;
  onJumpToBlock: (blockId: string) => void;
};

export function BlockEditor({ project, activeBlockId, onProjectChange, onJumpToBlock }: BlockEditorProps) {
  const clip = project.clips.find((item) => item.id === project.activeClipId) ?? project.clips[0];

  return (
    <section className="panel block-editor-panel" aria-label="Text Edit / Blocks">
      <div className="panel-title">Text Edit / Blocks</div>
      <div className="block-toolbar">
        <button
          type="button"
          onClick={() => {
            const result = addBlockAfter(project, activeBlockId);
            onProjectChange(result.project);
            onJumpToBlock(result.newBlockId);
          }}
        >
          + Block
        </button>
        <button type="button" onClick={() => onProjectChange(deleteBlock(project, activeBlockId))}>
          Delete
        </button>
        <button type="button" onClick={() => onProjectChange(duplicateBlock(project, activeBlockId))}>
          Duplicate
        </button>
      </div>
      <div className="block-list">
        {clip.blocks.map((block) => (
          <div key={block.id} className={block.id === activeBlockId ? "text-block active" : "text-block"}>
            <button type="button" className="block-handle" onClick={() => onJumpToBlock(block.id)}>
              ≡
            </button>
            <textarea
              value={block.text}
              onClick={() => onJumpToBlock(block.id)}
              onChange={(event) => onProjectChange(updateBlockText(project, block.id, event.currentTarget.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.ctrlKey) {
                  event.preventDefault();
                  const target = event.currentTarget;
                  const result = splitBlockAt(project, block.id, target.selectionStart);
                  onProjectChange(result.project);
                  onJumpToBlock(result.newBlockId);
                }
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add ClipControls**

Create `src/components/ClipControls.tsx`:

```tsx
import type { PrompterProject } from "../types";
import { addClip, deleteClip, setActiveClip } from "../domain/projectActions";

type ClipControlsProps = {
  project: PrompterProject;
  onProjectChange: (project: PrompterProject) => void;
};

export function ClipControls({ project, onProjectChange }: ClipControlsProps) {
  const activeIndex = project.clips.findIndex((clip) => clip.id === project.activeClipId);

  return (
    <div className="clip-controls">
      <select
        value={project.activeClipId}
        onChange={(event) => onProjectChange(setActiveClip(project, event.currentTarget.value))}
        aria-label="Clip"
      >
        {project.clips.map((clip, index) => (
          <option key={clip.id} value={clip.id}>
            Clip {index + 1} / {project.clips.length}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => onProjectChange(addClip(project))} aria-label="Add clip">
        +
      </button>
      <button type="button" onClick={() => onProjectChange(deleteClip(project, project.activeClipId))} aria-label="Delete clip">
        −
      </button>
      <span className="clip-count">Clip {activeIndex + 1} / {project.clips.length}</span>
    </div>
  );
}
```

- [ ] **Step 5: Add editor CSS**

Append to `src/styles.css`:

```css
.panel-title {
  height: 34px;
  margin: -12px -12px 12px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #292929;
  color: #cfcfcf;
  font-size: 11px;
  font-weight: 780;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.clip-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clip-controls select,
.clip-controls button,
.block-toolbar button {
  height: 30px;
  border: 1px solid #3b3b3b;
  border-radius: 6px;
  background: #1d1d1d;
  color: #f2f2f2;
}

.clip-controls select {
  min-width: 170px;
  padding: 0 8px;
}

.clip-controls button {
  width: 30px;
  font-weight: 900;
}

.clip-count {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.block-editor-panel {
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.block-toolbar {
  display: flex;
  gap: 8px;
  padding-bottom: 10px;
}

.block-toolbar button {
  padding: 0 10px;
  font-size: 12px;
  font-weight: 750;
}

.block-list {
  min-height: 0;
  overflow: auto;
}

.text-block {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  min-height: 92px;
  margin-bottom: 10px;
  border: 1px solid #323232;
  border-radius: 8px;
  background: #171717;
}

.text-block.active {
  border-color: #facc15;
  background: rgba(250, 204, 21, 0.055);
}

.block-handle {
  border: 0;
  border-right: 1px solid #333;
  background: transparent;
  color: #868686;
  font-size: 19px;
  font-weight: 900;
}

.text-block textarea {
  min-height: 92px;
  resize: vertical;
  border: 0;
  background: transparent;
  color: #e8e8e8;
  padding: 12px 12px 12px 0;
  font-size: clamp(13px, 1.15vw, 18px);
  line-height: 1.42;
  font-weight: 680;
  outline: none;
}
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/components/BlockEditor.test.tsx src/domain/projectActions.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/BlockEditor.tsx src/components/ClipControls.tsx src/components/BlockEditor.test.tsx src/styles.css
git commit -m "feat: add clip and block editing"
```

## Task 6: Appearance Panel, Playback, And App Wiring

**Files:**
- Create: `src/domain/playback.ts`
- Create: `src/domain/playback.test.ts`
- Create: `src/components/AppearancePanel.tsx`
- Create: `src/components/PlaybackControls.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing playback tests**

Create `src/domain/playback.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getScrollDelta, togglePlayback } from "./playback";

describe("playback", () => {
  it("toggles play pause", () => {
    expect(togglePlayback(false)).toBe(true);
    expect(togglePlayback(true)).toBe(false);
  });

  it("maps speed percent to scroll pixels", () => {
    expect(getScrollDelta(50, 1000)).toBeGreaterThan(0);
    expect(getScrollDelta(100, 1000)).toBeGreaterThan(getScrollDelta(50, 1000));
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/domain/playback.test.ts`

Expected: FAIL because playback module does not exist.

- [ ] **Step 3: Add playback helpers**

Create `src/domain/playback.ts`:

```ts
export function togglePlayback(isPlaying: boolean) {
  return !isPlaying;
}

export function getScrollDelta(scrollSpeedPercent: number, elapsedMs: number) {
  const minPixelsPerSecond = 12;
  const maxPixelsPerSecond = 180;
  const normalized = Math.min(100, Math.max(0, scrollSpeedPercent)) / 100;
  const pixelsPerSecond = minPixelsPerSecond + (maxPixelsPerSecond - minPixelsPerSecond) * normalized;
  return (pixelsPerSecond * elapsedMs) / 1000;
}
```

- [ ] **Step 4: Add AppearancePanel**

Create `src/components/AppearancePanel.tsx`:

```tsx
import type { PrompterProject, PrompterSettings } from "../types";

type AppearancePanelProps = {
  project: PrompterProject;
  onProjectChange: (project: PrompterProject) => void;
};

type NumberSetting = Extract<
  keyof PrompterSettings,
  "fontSizePt" | "horizontalMarginPercent" | "verticalMarginPercent" | "lineSpacingPercent" | "scrollSpeedPercent"
>;

export function AppearancePanel({ project, onProjectChange }: AppearancePanelProps) {
  function updateSetting<Key extends keyof PrompterSettings>(key: Key, value: PrompterSettings[Key]) {
    onProjectChange({
      ...project,
      settings: { ...project.settings, [key]: value },
    });
  }

  function numberInput(label: string, key: NumberSetting) {
    return (
      <label className="setting-row">
        <span>{label}</span>
        <input
          type="number"
          value={project.settings[key]}
          onChange={(event) => updateSetting(key, Number(event.currentTarget.value))}
        />
      </label>
    );
  }

  return (
    <section className="panel settings-panel" aria-label="Appearance">
      <div className="panel-title">Appearance</div>
      {numberInput("Font Size", "fontSizePt")}
      {numberInput("Horizontal Margin", "horizontalMarginPercent")}
      {numberInput("Vertical Margin", "verticalMarginPercent")}
      {numberInput("Line Spacing", "lineSpacingPercent")}
      <label className="setting-row">
        <span>Text Color</span>
        <input type="color" value={project.settings.textColor} onChange={(event) => updateSetting("textColor", event.currentTarget.value)} />
      </label>
      <label className="setting-row">
        <span>Background</span>
        <input
          type="color"
          value={project.settings.backgroundColor}
          onChange={(event) => updateSetting("backgroundColor", event.currentTarget.value)}
        />
      </label>
      {numberInput("Scroll Speed", "scrollSpeedPercent")}
      <label className="setting-row">
        <span>Mirror Output</span>
        <input type="checkbox" checked={project.settings.mirrorOutput} onChange={(event) => updateSetting("mirrorOutput", event.currentTarget.checked)} />
      </label>
      <label className="setting-row">
        <span>Read Line Preview</span>
        <input
          type="checkbox"
          checked={project.settings.showReadLinePreview}
          onChange={(event) => updateSetting("showReadLinePreview", event.currentTarget.checked)}
        />
      </label>
      <label className="setting-row">
        <span>Read Line Output</span>
        <input
          type="checkbox"
          checked={project.settings.showReadLineOutput}
          onChange={(event) => updateSetting("showReadLineOutput", event.currentTarget.checked)}
        />
      </label>
      <label className="setting-row">
        <span>Safe Frame Preview</span>
        <input
          type="checkbox"
          checked={project.settings.showSafeFramePreview}
          onChange={(event) => updateSetting("showSafeFramePreview", event.currentTarget.checked)}
        />
      </label>
      <label className="setting-row">
        <span>Safe Frame Output</span>
        <input
          type="checkbox"
          checked={project.settings.showSafeFrameOutput}
          onChange={(event) => updateSetting("showSafeFrameOutput", event.currentTarget.checked)}
        />
      </label>
    </section>
  );
}
```

- [ ] **Step 5: Add PlaybackControls**

Create `src/components/PlaybackControls.tsx`:

```tsx
type PlaybackControlsProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function PlaybackControls({ isPlaying, onToggle }: PlaybackControlsProps) {
  return (
    <div className="playback-bar">
      <button type="button" className="playback-button" onClick={onToggle} aria-label="Play/Pause">
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Wire app state**

Replace `src/App.tsx` with:

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AppearancePanel } from "./components/AppearancePanel";
import { BlockEditor } from "./components/BlockEditor";
import { ClipControls } from "./components/ClipControls";
import { PlaybackControls } from "./components/PlaybackControls";
import { TeleprompterRenderer } from "./components/TeleprompterRenderer";
import { createDefaultProject } from "./domain/defaultProject";
import { getScrollDelta, togglePlayback } from "./domain/playback";
import { loadAutosavedProject, saveAutosavedProject } from "./storage/localProjectStore";
import type { PlaybackState, PrompterProject } from "./types";

export function App() {
  const initialProject = useMemo(() => loadAutosavedProject() ?? createDefaultProject(), []);
  const firstBlockId = initialProject.clips[0].blocks[0].id;
  const [project, setProject] = useState<PrompterProject>(initialProject);
  const [playback, setPlayback] = useState<PlaybackState>({
    activeBlockId: firstBlockId,
    isPlaying: false,
    scrollOffsetPx: 0,
  });
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => saveAutosavedProject(project), 250);
    return () => window.clearTimeout(handle);
  }, [project]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" && event.target === document.body) {
        event.preventDefault();
        setPlayback((current) => ({ ...current, isPlaying: togglePlayback(current.isPlaying) }));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  function jumpToBlock(blockId: string) {
    setPlayback((current) => ({
      ...current,
      activeBlockId: blockId,
      scrollOffsetPx: 0,
    }));
  }

  return (
    <main className="app-shell">
      <section className="workspace-frame">
        <div className="topbar">
          <strong>Better Prompter</strong>
          <ClipControls project={project} onProjectChange={setProject} />
        </div>
        <div className="workspace-main">
          <div className="left-column">
            <AppearancePanel project={project} onProjectChange={setProject} />
            <section className="panel preview-panel" aria-label="Teleprompt View">
              <div className="panel-title">Teleprompt View</div>
              <TeleprompterRenderer
                project={project}
                mode="preview"
                activeBlockId={playback.activeBlockId}
                scrollOffsetPx={playback.scrollOffsetPx}
              />
            </section>
          </div>
          <BlockEditor project={project} activeBlockId={playback.activeBlockId} onProjectChange={setProject} onJumpToBlock={jumpToBlock} />
        </div>
        <PlaybackControls
          isPlaying={playback.isPlaying}
          onToggle={() => setPlayback((current) => ({ ...current, isPlaying: togglePlayback(current.isPlaying) }))}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Add settings and playback CSS**

Append to `src/styles.css`:

```css
.settings-panel {
  overflow: auto;
}

.setting-row {
  min-height: 28px;
  display: grid;
  grid-template-columns: 1fr 78px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #252525;
  color: #bdbdbd;
  font-size: 12px;
}

.setting-row input[type="number"],
.setting-row input[type="color"] {
  width: 100%;
  height: 24px;
  border: 1px solid #363636;
  border-radius: 5px;
  background: #202020;
  color: #f2f2f2;
}

.preview-panel {
  display: grid;
  grid-template-rows: auto 1fr;
}

.playback-button {
  min-width: 160px;
  height: 44px;
  border: 1px solid #3b3b3b;
  border-radius: 6px;
  background: #1d1d1d;
  color: #fff;
  font-size: 20px;
  font-weight: 850;
}
```

- [ ] **Step 8: Run tests and build**

Run: `npm test -- src/domain/playback.test.ts src/components/BlockEditor.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/domain/playback.ts src/domain/playback.test.ts src/components/AppearancePanel.tsx src/components/PlaybackControls.tsx src/App.tsx src/styles.css
git commit -m "feat: wire editor playback and settings"
```

## Task 7: Output Window And Multi-Screen Fallback

**Files:**
- Create: `src/output/outputWindow.ts`
- Create: `src/output/outputWindow.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing output tests**

Create `src/output/outputWindow.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { openPrompterOutput, syncPrompterOutput } from "./outputWindow";

describe("outputWindow", () => {
  it("opens manual fallback window when screen details are unavailable", async () => {
    const opened = { document: { write: vi.fn(), close: vi.fn() }, focus: vi.fn() };
    const open = vi.spyOn(window, "open").mockReturnValue(opened as unknown as Window);

    const result = await openPrompterOutput("<div>output</div>");

    expect(open).toHaveBeenCalled();
    expect(result.mode).toBe("manual");
  });

  it("syncs output html into an existing output window", () => {
    const target = { document: { open: vi.fn(), write: vi.fn(), close: vi.fn() } };

    syncPrompterOutput(target as unknown as Window, "<div>updated</div>");

    expect(target.document.open).toHaveBeenCalled();
    expect(target.document.write).toHaveBeenCalledWith(expect.stringContaining("updated"));
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/output/outputWindow.test.ts`

Expected: FAIL because output module does not exist.

- [ ] **Step 3: Add output window helper**

Create `src/output/outputWindow.ts`:

```ts
type OutputMode = "managed" | "manual";

type OutputResult = {
  mode: OutputMode;
  window: Window | null;
};

type ScreenDetails = {
  screens: Array<{ availLeft: number; availTop: number; availWidth: number; availHeight: number; label?: string }>;
};

type WindowWithScreenDetails = Window & {
  getScreenDetails?: () => Promise<ScreenDetails>;
};

const OUTPUT_CSS = `
html,
body,
#output-root {
  margin: 0;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.prompter-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0;
}

.prompter-scroll-layer {
  position: absolute;
  inset: 0;
  white-space: pre-wrap;
  transition: transform 80ms linear;
}

.prompter-block {
  font-weight: 750;
  margin-bottom: 0.8em;
}

.prompter-safe-frame {
  position: absolute;
  inset: 12%;
  border: 1px dashed rgba(255, 255, 255, 0.22);
  pointer-events: none;
  z-index: 2;
}

.prompter-read-line {
  position: absolute;
  top: 48%;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(250, 204, 21, 0.85);
  pointer-events: none;
  z-index: 3;
}
`;

export function syncPrompterOutput(target: Window, html: string) {
  target.document.open();
  target.document.write(`<!doctype html>
<html>
<head>
<title>Better Prompter Output</title>
<style>
${OUTPUT_CSS}
</style>
</head>
<body>
<div id="output-root">${html}</div>
</body>
</html>`);
  target.document.close();
}

export async function openPrompterOutput(html: string): Promise<OutputResult> {
  const currentWindow = window as WindowWithScreenDetails;

  if (currentWindow.getScreenDetails) {
    try {
      const details = await currentWindow.getScreenDetails();
      const externalScreen = details.screens.find((screen) => screen.label?.toLowerCase().includes("elgato")) ?? details.screens[1];
      if (externalScreen) {
        const target = window.open(
          "",
          "better-prompter-output",
          `popup=yes,left=${externalScreen.availLeft},top=${externalScreen.availTop},width=${externalScreen.availWidth},height=${externalScreen.availHeight}`,
        );
        if (target) {
          syncPrompterOutput(target, html);
          target.focus();
          void target.document.documentElement.requestFullscreen?.().catch(() => undefined);
          return { mode: "managed", window: target };
        }
      }
    } catch {
      // Fall through to manual output window.
    }
  }

  const target = window.open("", "better-prompter-output", "popup=yes,width=1024,height=600");
  if (target) {
    syncPrompterOutput(target, html);
    target.focus();
  }
  return { mode: "manual", window: target };
}
```

- [ ] **Step 4: Wire Open Prompter Output button**

Modify `src/App.tsx`:

```tsx
// Add imports:
import { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { openPrompterOutput, syncPrompterOutput } from "./output/outputWindow";

// Add this ref inside App:
const outputWindowRef = useRef<Window | null>(null);

// Add these functions inside App:
function renderOutputHtml() {
  return renderToStaticMarkup(
    <TeleprompterRenderer
      project={project}
      mode="output"
      activeBlockId={playback.activeBlockId}
      scrollOffsetPx={playback.scrollOffsetPx}
    />,
  );
}

async function openOutput() {
  const result = await openPrompterOutput(renderOutputHtml());
  outputWindowRef.current = result.window;
}

// Add this effect inside App after openOutput:
useEffect(() => {
  if (!outputWindowRef.current || outputWindowRef.current.closed) return;
  syncPrompterOutput(outputWindowRef.current, renderOutputHtml());
}, [project, playback.activeBlockId, playback.scrollOffsetPx]);

// Add button inside topbar before ClipControls:
<button type="button" className="output-button" onClick={openOutput}>
  Open Prompter Output
</button>
```

If `src/App.tsx` already imports `useRef` from React in Task 6, merge the import instead of adding a second React import. The topbar JSX should read:

```tsx
<div className="topbar">
  <strong>Better Prompter</strong>
  <div className="topbar-actions">
    <button type="button" className="output-button" onClick={openOutput}>
      Open Prompter Output
    </button>
    <ClipControls project={project} onProjectChange={setProject} />
  </div>
</div>
```

- [ ] **Step 5: Add topbar button CSS**

Append to `src/styles.css`:

```css
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.output-button {
  height: 30px;
  border: 1px solid #3b3b3b;
  border-radius: 6px;
  background: #1d1d1d;
  color: #f2f2f2;
  padding: 0 12px;
  font-weight: 750;
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/output/outputWindow.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/output/outputWindow.ts src/output/outputWindow.test.ts src/App.tsx src/styles.css
git commit -m "feat: add prompter output window"
```

## Task 8: JSON Import Export Controls

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add export/import UI handlers**

Modify `src/App.tsx` imports:

```tsx
import { parseProjectJson, serializeProjectJson } from "./storage/projectFile";
```

Add these functions inside `App`:

```tsx
function exportProject() {
  const blob = new Blob([serializeProjectJson(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "better-prompter-project.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importProject(file: File) {
  const text = await file.text();
  const nextProject = parseProjectJson(text);
  setProject(nextProject);
  const nextClip = nextProject.clips.find((clip) => clip.id === nextProject.activeClipId) ?? nextProject.clips[0];
  setPlayback({
    activeBlockId: nextClip.blocks[0].id,
    isPlaying: false,
    scrollOffsetPx: 0,
  });
}
```

Add controls inside `.topbar-actions` before `Open Prompter Output`:

```tsx
<button type="button" className="output-button" onClick={exportProject}>
  Export JSON
</button>
<label className="import-button">
  Import JSON
  <input
    type="file"
    accept="application/json"
    onChange={(event) => {
      const file = event.currentTarget.files?.[0];
      if (file) void importProject(file);
      event.currentTarget.value = "";
    }}
  />
</label>
```

- [ ] **Step 2: Add import button CSS**

Append to `src/styles.css`:

```css
.import-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #3b3b3b;
  border-radius: 6px;
  background: #1d1d1d;
  color: #f2f2f2;
  padding: 0 12px;
  font-weight: 750;
  font-size: 13px;
}

.import-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
```

- [ ] **Step 3: Run build and storage tests**

Run: `npm test -- src/storage/projectFile.test.ts src/storage/localProjectStore.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: add project import export controls"
```

## Task 9: macOS Interactive Launcher

**Files:**
- Create: `Better Prompter.command`

- [ ] **Step 1: Create bash launcher**

Create `Better Prompter.command`:

```bash
#!/bin/bash
set -u

APP_NAME="BETTER PROMPTER"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="5173"
LOG_DIR="$APP_DIR/.launcher-logs"
LOG_FILE="$LOG_DIR/app.log"
PID=""
MODE="stopped"
START_TIME=""
SELECTED=0

NC='\033[0m'
FG_BLOCK='\033[38;2;238;238;238m'
SHADOW_MID='\033[38;2;96;96;96m'
SHADOW_DARK='\033[38;2;42;42;42m'
DIM='\033[38;2;140;140;140m'
WHITE='\033[38;2;238;238;238m'
GREEN='\033[38;2;80;220;100m'
RED='\033[38;2;220;60;60m'
YELLOW='\033[38;2;250;204;21m'

MENU_ITEMS=("Status" "Restart App" "Logs: App" "Open Brave" "Quit")
MENU_COUNT=5
MENU_START=12

mkdir -p "$LOG_DIR"

port_is_free() {
  ! lsof -ti:"$1" >/dev/null 2>&1
}

get_pid_on_port() {
  lsof -ti:"$1" 2>/dev/null | head -1
}

is_alive() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

health_dot() {
  if is_alive "$PID"; then
    printf "%b●%b" "$GREEN" "$NC"
  else
    printf "%b●%b" "$RED" "$NC"
  fi
}

start_app() {
  cd "$APP_DIR" || exit 1
  : > "$LOG_FILE"
  npm run dev -- --port "$PORT" >>"$LOG_FILE" 2>&1 &
  PID="$!"
  MODE="started"
  START_TIME="$(date +%s)"
  sleep 1
}

stop_app() {
  if is_alive "$PID"; then
    pkill -P "$PID" 2>/dev/null
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
  fi
}

adopt_or_start_app() {
  if port_is_free "$PORT"; then
    start_app
  else
    PID="$(get_pid_on_port "$PORT")"
    MODE="adopted"
    START_TIME="$(date +%s)"
  fi
}

restart_app() {
  if [[ "$MODE" == "adopted" ]]; then
    lsof -ti:"$PORT" | xargs kill 2>/dev/null
    sleep 1
  else
    stop_app
  fi
  start_app
}

cleanup() {
  printf '\033[0m'
  printf '\033[?25h'
  printf '\033[?1049l'
  stty sane 2>/dev/null
  if [[ "$MODE" == "started" ]]; then
    stop_app
  fi
  printf '\nSession ended\n'
  exit 0
}

trap cleanup EXIT INT TERM HUP

draw_banner_text() {
  local row="$1"
  local col="$2"
  local color="$3"
  printf '\033[%d;%dH%b██████╗ ███████╗████████╗████████╗███████╗██████╗%b' "$row" "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗%b' $((row + 1)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝%b' $((row + 2)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗%b' $((row + 3)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║%b' $((row + 4)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝%b' $((row + 5)) "$col" "$color" "$NC"
}

draw_banner() {
  draw_banner_text 4 6 "$SHADOW_DARK"
  draw_banner_text 3 5 "$SHADOW_MID"
  draw_banner_text 2 3 "$FG_BLOCK"
}

draw_menu_row() {
  local index="$1"
  local row=$((MENU_START + index))
  local marker=" "
  local style="$DIM"
  local dot=""
  if [[ "$index" -eq "$SELECTED" ]]; then
    marker=">"
    style="$WHITE"
  fi
  if [[ "$index" -eq 1 || "$index" -eq 2 ]]; then
    dot=" $(health_dot)"
  fi
  printf '\033[%d;1H\033[2K' "$row"
  printf "%b %s %-22s%b%b" "$style" "$marker" "${MENU_ITEMS[$index]}" "$NC" "$dot"
}

draw_dynamic() {
  local label="$MODE"
  local status_color="$YELLOW"
  if [[ "$MODE" == "started" ]]; then
    status_color="$GREEN"
  fi
  printf '\033[9;1H%bPort:%b %s  %bMode:%b %b%s%b  %bPID:%b %s' "$DIM" "$NC" "$PORT" "$DIM" "$NC" "$status_color" "$label" "$NC" "$DIM" "$NC" "${PID:-none}"
  local i=0
  while [[ "$i" -lt "$MENU_COUNT" ]]; do
    draw_menu_row "$i"
    i=$((i + 1))
  done
  printf '\033[20;1H%b↑/↓ select  Enter run  q quit%b' "$DIM" "$NC"
}

draw_full() {
  printf '\033[?2026h'
  printf '\033[1;1H\033[J'
  draw_banner
  draw_dynamic
  printf '\033[?2026l'
}

draw_partial() {
  local old="$1"
  local new="$2"
  printf '\033[?2026h'
  draw_menu_row "$old"
  draw_menu_row "$new"
  printf '\033[?2026l'
}

view_status() {
  printf '\033[?2026h'
  printf '\033[1;1H\033[J'
  printf "%bStatus%b\n\n" "$WHITE" "$NC"
  printf "URL: http://localhost:%s\n" "$PORT"
  printf "PID: %s\n" "${PID:-none}"
  printf "Mode: %s\n" "$MODE"
  printf "Log: %s\n\n" "$LOG_FILE"
  printf "%bPress Enter or b to go back. q quits.%b" "$DIM" "$NC"
  printf '\033[?2026l'
  while true; do
    IFS= read -rsn1 KEY
    if [[ "$KEY" == "" || "$KEY" == "b" ]]; then
      return
    elif [[ "$KEY" == "q" ]]; then
      exit 0
    fi
  done
}

view_logs() {
  while true; do
    printf '\033[?2026h'
    printf '\033[1;1H\033[J'
    printf "%bLogs: App%b\n\n" "$WHITE" "$NC"
    tail -30 "$LOG_FILE" 2>/dev/null
    printf "\n%bPress r refresh, Enter or b back, q quit.%b" "$DIM" "$NC"
    printf '\033[?2026l'
    IFS= read -rsn1 KEY
    if [[ "$KEY" == "" || "$KEY" == "b" ]]; then
      return
    elif [[ "$KEY" == "q" ]]; then
      exit 0
    fi
  done
}

open_brave() {
  open -a "Brave Browser" "http://localhost:$PORT" 2>/dev/null || open "http://localhost:$PORT"
}

execute_action() {
  case "$SELECTED" in
    0) view_status ;;
    1) restart_app ;;
    2) view_logs ;;
    3) open_brave ;;
    4) exit 0 ;;
  esac
}

printf '\033[?1049h'
printf '\033[?25l'
adopt_or_start_app
draw_full

while true; do
  IFS= read -rsn1 KEY
  if [[ "$KEY" == $'\x1b' ]]; then
    IFS= read -rsn2 ARROW
    case "$ARROW" in
      "[A")
        OLD_SELECTED="$SELECTED"
        SELECTED=$(( (SELECTED - 1 + MENU_COUNT) % MENU_COUNT ))
        draw_partial "$OLD_SELECTED" "$SELECTED"
        ;;
      "[B")
        OLD_SELECTED="$SELECTED"
        SELECTED=$(( (SELECTED + 1) % MENU_COUNT ))
        draw_partial "$OLD_SELECTED" "$SELECTED"
        ;;
    esac
  elif [[ "$KEY" == "" ]]; then
    execute_action
    draw_full
  elif [[ "$KEY" == "q" ]]; then
    exit 0
  fi
done
```

- [ ] **Step 2: Make launcher executable**

Run: `chmod +x "Better Prompter.command"`

Expected: file has executable bit.

- [ ] **Step 3: Syntax check launcher**

Run: `bash -n "Better Prompter.command"`

Expected: no output and exit code 0.

- [ ] **Step 4: Commit**

```bash
git add "Better Prompter.command"
git commit -m "feat: add macos launcher"
```

## Task 10: Final Verification

**Files:**
- Modify: files found by verification only when a failing check identifies a concrete issue.

- [ ] **Step 1: Run full automated checks**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `bash -n "Better Prompter.command"`

Expected: PASS.

- [ ] **Step 2: Run local app**

Run: `npm run dev -- --port 5173`

Expected: Vite prints a local URL containing `http://127.0.0.1:5173/`.

- [ ] **Step 3: Manual Brave verification**

Open Brave to `http://localhost:5173`.

Verify:

- App loads black 16:9 workspace.
- Text typed in a block appears in Teleprompt View.
- Refresh page keeps typed text.
- Close tab and reopen app keeps typed text.
- Add clip increases dropdown count.
- Delete clip removes current clip when more than one exists.
- `Control + Enter` splits text and active highlight moves to the new block.
- Clicking a block moves active highlight to that block.
- Play/Pause button toggles scroll.
- Spacebar toggles scroll when focus is not inside a textarea.
- Export JSON downloads a file.
- Import JSON restores a file.
- Open Prompter Output opens a clean black output window.
- Output window contains no settings, no block editor, and no playback controls.
- Output window updates while Play/Pause scroll changes.

- [ ] **Step 4: Fix verification failures**

For each failed verification item, write or update a focused test that reproduces it, change the minimal related file, then rerun:

```bash
npm test
npm run build
```

Expected: both pass before continuing.

- [ ] **Step 5: Commit verification fixes**

If files changed:

```bash
git add <changed-files>
git commit -m "fix: polish better prompter verification"
```

If no files changed, do not create an empty commit.
