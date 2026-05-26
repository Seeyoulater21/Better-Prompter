# Better Prompter PRD

## Summary

Better Prompter replaces the current Elgato Creator's Prompter workflow with a focused local web app for script editing and teleprompter playback.

## Audience

Primary user: a solo creator/operator using Brave on macOS with an Elgato Prompter connected as an external display.

## Problem

The existing Prompter app is not good enough for reliable script preparation and playback. The user needs an app where editing, clip management, live preview, and output behavior are predictable.

## Goals

- Provide a black 16:9 operator workspace.
- Show an exact scaled Teleprompt View in the operator workspace.
- Show a clean fullscreen output window on the Elgato display.
- Support editable text blocks with split-at-cursor behavior.
- Support multiple script clips prepared in advance.
- Preserve script text after closing and reopening.
- Support JSON import/export for backup and transfer.
- Provide a macOS `.command` launcher to start/adopt/open the app.

## Non-Goals

- Login
- Cloud sync
- Multi-user collaboration
- Stream Deck integration
- Tutorial overlays
- Tooltips
- Rich text formatting
- AI script generation
- Desktop wrapper

## Core Workflow

1. Launch the app with `Better Prompter.command`.
2. Open the app in Brave.
3. Create or select a clip.
4. Edit script text in blocks.
5. Use `Control + Enter` to split a block at the cursor.
6. Open the Prompter output window.
7. Move or fullscreen the output on the Elgato display.
8. Press Play/Pause or Spacebar to control scrolling.
9. Export JSON when backup or transfer is needed.

## Success Criteria

- App opens in Brave on macOS.
- Closing and reopening preserves the last script.
- JSON import/export works.
- Clip add/delete/select works.
- Block add/delete/duplicate/edit/split works.
- Clicking a block jumps playback to that block.
- Play/Pause and Spacebar control scrolling.
- Teleprompt View matches the output renderer.
- Output window has only black background and white script text by default.
- Mirror output and guide toggles work.
- Manual output fallback works if Brave blocks multi-screen APIs.
- Launcher can start/adopt/restart/open/log/quit the app.
