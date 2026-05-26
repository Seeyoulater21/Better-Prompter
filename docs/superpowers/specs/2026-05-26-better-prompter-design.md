# Better Prompter Design

Date: 2026-05-26
Status: approved for implementation planning

## Goal

Build a better teleprompter web app for Elgato Prompter usage. The app replaces the current Elgato Creator's Prompter workflow with a fast, black, 16:9 operator workspace, exact live preview, clean fullscreen output, text block editing, clip stock management, autosave, and a macOS launcher.

The MVP targets Brave on macOS. Brave is Chromium-based, so the app will use Chromium multi-screen capabilities when available and fall back to a manual output window when Brave blocks or does not expose the needed APIs.

## Product Shape

The app has two browser windows:

1. Operator workspace
2. Prompter output window

The operator workspace is a 16:9 black interface with four zones:

- Appearance settings
- Text Edit / Blocks
- Teleprompt View
- Playback Controls

The Prompter output window is for the Elgato display. It shows only the teleprompter output: black background, white text, no controls, no labels, no instructional copy, and no editing UI.

The Teleprompt View in the operator workspace is not an approximation. It uses the same renderer as the Prompter output window, scaled down. It must show exactly what the Elgato output is showing, including current scroll position, margins, line spacing, text color, background color, mirror mode, and optional guide overlays.

## Browser And Display Model

Primary browser: Brave desktop on macOS.

Compatibility target: Chromium-based browsers.

The app will feature-detect `window.getScreenDetails`.

When supported and permitted:

- User clicks "Open Prompter Output".
- App requests window-management permission.
- User selects or confirms the Elgato display.
- App opens the output window on that display and enters fullscreen.

When not supported or denied:

- App opens a Prompter output window.
- User drags that window to the Elgato display.
- User uses browser fullscreen manually.

The design must not assume automatic Elgato screen placement works 100% in Brave. Manual fallback is part of the MVP.

Elgato Prompter should be used as an extended display, not as a mirrored display, when separate operator and prompter windows are needed.

## Layout

The operator workspace uses a black theme and a 16:9 layout.

Top bar:

- Project/app identity
- Clip dropdown, e.g. `Clip 3 / 8`
- Add clip button
- Delete clip button

Main area:

- Left column, about 30%
  - Appearance settings on top
  - Teleprompt View below
- Right column, about 70%
  - Text Edit / Blocks

Bottom bar:

- One centered Play/Pause control

There are no Previous or Next controls in MVP.

## Appearance Settings

MVP settings:

- Font Size `[pt]`
- Horizontal Margin `[%]`
- Vertical Margin `[%]`
- Line Spacing `[%]`
- Text Color
- Background Color
- Scroll Speed `[%]`
- Mirror Output toggle
- Show Read Line in Preview toggle
- Show Read Line in Output toggle
- Show Safe Frame in Preview toggle
- Show Safe Frame in Output toggle

Default guide behavior:

- Read line visible in preview
- Read line hidden in output
- Safe frame visible in preview
- Safe frame hidden in output

The output should stay clean by default. Guide overlays may be enabled separately for output when needed.

## Clips

A clip is one full video script.

The top-right dropdown selects the current clip. Users can prepare multiple clips in advance.

MVP clip controls:

- Select clip from dropdown
- Add clip
- Delete clip

Each clip contains its own text blocks. Appearance settings are project-level in MVP so every clip uses the same output style.

## Text Blocks

The Text Edit / Blocks area is a free-edit block editor.

Blocks contain only script text. They do not require visible titles such as `01 Intro`, `Chapter 1`, or similar labels.

Each block supports:

- Free text editing
- Add block
- Delete block
- Duplicate block
- Reorder by drag handle
- Click block to jump playback to that block

MVP UI should not show instructional text or tooltips explaining these behaviors. The behaviors exist, but the interface stays clean.

## Split Behavior

On macOS, `Control + Enter` splits the current block at the cursor.

Before:

```text
หากพนักงาน หรือหน่วยงานที่เกี่ยวข้องภายในกลุ่มธุรกิจฯ มี
การฝ่าฝืน ไม่ปฏิบัติตามกฎหมายและนโยบายฉบับนี้[cursor]จะมีโทษตามกฎหมาย ซึ่งโทษตาม
กฎหมายที่สำคัญที่เกี่ยวข้องกับการปฏิบัติงาน มีดังนี้ค่ะ"
```

After:

```text
Block 1:
หากพนักงาน หรือหน่วยงานที่เกี่ยวข้องภายในกลุ่มธุรกิจฯ มี
การฝ่าฝืน ไม่ปฏิบัติตามกฎหมายและนโยบายฉบับนี้

Block 2:
จะมีโทษตามกฎหมาย ซึ่งโทษตาม
กฎหมายที่สำคัญที่เกี่ยวข้องกับการปฏิบัติงาน มีดังนี้ค่ะ"
```

After splitting, playback jumps to the new block immediately.

## Playback

The control bar has only Play/Pause.

Behavior:

- Play scrolls according to Scroll Speed.
- Pause stops at the current position.
- Spacebar toggles Play/Pause.
- Click a block to jump output to the start of that block.
- Active block is highlighted in the editor.

There are no Previous or Next buttons. Block clicking is the navigation model.

## Renderer

Use one shared teleprompter renderer for:

- Operator Teleprompt View
- Prompter output window

The renderer takes:

- Current clip
- Current block list
- Current playback position
- Appearance settings
- Guide overlay settings
- Mirror setting
- Target dimensions

Preview and output must match. Preview differs only by scale.

The output window must show only the rendered teleprompter content.

## Persistence

Project files are `.json`, but MVP also needs automatic local persistence.

Requirements:

- If user closes browser/app and opens again, script text remains.
- Last project snapshot loads automatically.
- Export `.json` for backup or moving to another machine.
- Import `.json` to restore a project.

Storage model:

- Autosave latest project snapshot in local browser storage.
- Export/import `.json` for explicit project files.

`localStorage` is acceptable for MVP if data volume stays small. If scripts grow large or autosave needs more reliability, use IndexedDB.

## Project File Format

MVP project JSON shape:

```json
{
  "version": 1,
  "settings": {
    "fontSizePt": 72,
    "horizontalMarginPercent": 12,
    "verticalMarginPercent": 18,
    "lineSpacingPercent": 120,
    "textColor": "#ffffff",
    "backgroundColor": "#000000",
    "scrollSpeedPercent": 42,
    "mirrorOutput": true,
    "showReadLinePreview": true,
    "showReadLineOutput": false,
    "showSafeFramePreview": true,
    "showSafeFrameOutput": false
  },
  "clips": [
    {
      "id": "clip-1",
      "blocks": [
        {
          "id": "block-1",
          "text": "..."
        }
      ]
    }
  ],
  "activeClipId": "clip-1"
}
```

Implementation may add `createdAt`, `updatedAt`, or `name` fields later. MVP should keep the schema small and explicit.

## Launcher

Create a macOS `.command` launcher using the interactive launcher spec at:

`/Users/pakdaesedmetapiphat/Mac/Claude Code University/Share docs/interactive-launcher-spec.md`

Launcher requirements:

- Pure bash
- macOS bash 3.2 compatible
- Double-click opens Terminal TUI
- Anti-flicker alternate screen rendering
- Start or adopt the app server port
- Show live health status
- Open Brave to the app URL
- Show logs
- Restart app
- Quit safely

Expected menu:

- Status
- Restart App
- Logs: App
- Open Brave
- Quit

Adopt/start behavior:

- If port is free, launcher starts the web app server and owns that process.
- If port is already in use, launcher adopts the process for monitoring.
- Quit kills only processes started by the launcher.
- Quit does not kill adopted processes.
- Restart of an adopted process may kill the port and restart under launcher ownership.

Launcher should open:

`http://localhost:<port>`

Preferred port can be chosen during implementation.

## Non-Goals For MVP

- Login
- Cloud sync
- Multi-user collaboration
- Stream Deck integration
- Tutorial overlays
- Tooltips
- Rich formatting inside blocks
- AI script generation
- Electron/Tauri desktop wrapper
- Automatic Brave behavior guarantee across every Brave version

## Success Criteria

MVP is successful when:

- App opens in Brave on macOS.
- Closing and reopening preserves the last script.
- Export/import `.json` works.
- Clip dropdown can select clips.
- Add/delete clip works.
- Add/delete/duplicate/reorder/edit block works.
- `Control + Enter` splits a block at cursor and jumps to the new block.
- Clicking a block jumps output to that block.
- Play/Pause button works.
- Spacebar toggles Play/Pause.
- Scroll Speed affects playback.
- Teleprompt View matches output renderer.
- Output window is black with white text and no controls.
- Mirror Output toggle affects output.
- Read line and safe frame toggles work independently for preview and output.
- Brave multi-screen path is attempted when supported.
- Manual output window fallback works when multi-screen API is unavailable or denied.
- Launcher can start/adopt/restart/open/log/quit the app.

## Implementation Notes

Use feature detection for browser APIs. Do not gate core usage behind `getScreenDetails`.

Autosave should be debounced so typing does not write on every keystroke.

Playback state and editor state must share one source of truth so active block, output, and preview do not drift.

The UI must avoid explanatory copy inside the app. Controls should be clear from placement and shape.

The renderer should be isolated from the editor so output behavior can be tested independently.
