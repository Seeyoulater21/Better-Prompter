# Better Prompter

Better Prompter is a Brave-first web teleprompter for Elgato Prompter workflows.

It provides a black 16:9 operator workspace, exact live preview, clean fullscreen prompter output, editable text blocks, clip stock management, autosave, JSON import/export, and a macOS launcher.

## MVP Target

- Browser: Brave desktop on macOS
- Display: Elgato Prompter as an extended display
- App type: local web app
- Persistence: local autosave plus JSON import/export
- Launcher: `Better Prompter.command`

## Usage

Double-click `Better Prompter.command` on macOS to start or adopt the local Vite server, open Brave, view status/logs, restart the app, or quit safely.

The launcher uses port `5173` and writes app logs to `.launcher-logs/app.log`.

Use `Export JSON` to download the current Project File as `better-prompter-project.json`.

Use `Import JSON` to restore a valid Better Prompter Project File and reset playback to the first Block in the imported active Clip.

## Planning Docs

- [PRD.md](./PRD.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CONTEXT.md](./CONTEXT.md)
- [AGENTS.md](./AGENTS.md)
- [Design spec](./docs/superpowers/specs/2026-05-26-better-prompter-design.md)
- [Implementation plan](./docs/superpowers/plans/2026-05-26-better-prompter.md)

## Current Status

MVP implementation is in progress through approved GitHub issues.
