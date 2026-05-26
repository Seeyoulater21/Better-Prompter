# Better Prompter Architecture

## Overview

Better Prompter is a client-only React app served locally by Vite. The app keeps domain logic separate from UI components so project data, playback, persistence, and rendering can be tested independently.

## Stack

- Vite
- React
- TypeScript
- Vitest
- React Testing Library
- CSS
- Browser `localStorage`
- JSON import/export
- Chromium Window Management API feature detection
- Pure bash macOS `.command` launcher

## Main Units

## Project Domain

Files:

- `src/types.ts`
- `src/domain/defaultProject.ts`
- `src/domain/projectActions.ts`
- `src/domain/playback.ts`

Responsibilities:

- Define project, clip, block, settings, and playback types.
- Create default projects.
- Mutate project state with pure functions.
- Calculate playback scroll deltas.

## Persistence

Files:

- `src/storage/localProjectStore.ts`
- `src/storage/projectFile.ts`

Responsibilities:

- Autosave the latest project snapshot locally.
- Load the last snapshot on app start.
- Serialize project JSON for export.
- Parse and validate project JSON on import.

## Renderer

File:

- `src/components/TeleprompterRenderer.tsx`

Responsibilities:

- Render the current clip using shared output rules.
- Power both the operator Teleprompt View and output window.
- Apply font size, margins, line spacing, colors, mirror mode, scroll position, and guide overlays.

The operator preview and output window must share this renderer. Preview may scale the canvas; it must not use separate layout logic.

## Editor And Controls

Files:

- `src/components/AppearancePanel.tsx`
- `src/components/ClipControls.tsx`
- `src/components/BlockEditor.tsx`
- `src/components/PlaybackControls.tsx`
- `src/App.tsx`

Responsibilities:

- Edit appearance settings.
- Add/delete/select clips.
- Free-edit text blocks.
- Split blocks with `Control + Enter`.
- Jump playback when a block is clicked.
- Toggle playback with Play/Pause and Spacebar.

## Output Window

File:

- `src/output/outputWindow.ts`

Responsibilities:

- Feature-detect `window.getScreenDetails`.
- Try to open output on an external screen when Brave permits it.
- Fall back to a manual output window.
- Sync output HTML whenever project or playback state changes.

### Technical Validation Spike

Issue #1 uses `spikes/brave-output-validation.html` to validate the Brave and Elgato output path before the full app is built.

The supported architecture must not require `window.getScreenDetails`. The output flow is:

1. On user click, feature-detect `window.getScreenDetails`.
2. If available and permission is granted, try managed placement with `window.open` using external screen bounds.
3. If the API is missing, permission is denied, no external screen is found, or fullscreen fails, open a normal Prompter Output window.
4. The user can drag the normal output window to the Elgato display and enter fullscreen manually.

Managed placement is best-effort. Manual output is part of the supported MVP path, not an error state.

The spike page is a validation harness only. Production implementation still belongs in `src/output/outputWindow.ts`, sharing the teleprompter renderer output and keeping the Prompter Output free of controls.

## Launcher

File:

- `Better Prompter.command`

Responsibilities:

- Start or adopt the local app server.
- Show a Terminal TUI.
- Open Brave to the local app URL.
- Show logs and status.
- Restart the app.
- Quit safely without killing adopted processes.

## Risk Notes

- Browser multi-screen behavior depends on Brave permissions and Chromium support.
- Script text loss is a core risk, so autosave and JSON export must be verified.
- Output preview drift is a core risk, so renderer sharing is mandatory.
- Spacebar must not steal input while typing in a textarea.
- Brave and Elgato behavior must be manually verified on the target machine. If managed placement fails, the MVP still proceeds through the manual output fallback.
