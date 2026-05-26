# Better Prompter Context

Better Prompter is a local teleprompter app for preparing script clips, editing text blocks, and sending clean text output to an Elgato Prompter display.

## Language

**Clip**:
A full script for one video. A project has one or more Clips.
_Avoid_: Chapter, scene, file

**Block**:
An editable text segment inside a Clip. A Clip has one or more Blocks.
_Avoid_: Chapter, paragraph, card

**Operator Workspace**:
The main app window used by the person controlling the script, settings, preview, clips, and playback.
_Avoid_: dashboard, admin, control room

**Teleprompt View**:
The scaled preview inside the Operator Workspace that uses the exact same renderer as the Prompter Output.
_Avoid_: thumbnail, mock preview, preview image

**Prompter Output**:
The clean window intended for the Elgato display. It shows only rendered teleprompter text and optional guide overlays.
_Avoid_: second screen UI, external dashboard

**Appearance Settings**:
Project-level settings that control rendered text appearance across clips.
_Avoid_: theme settings, editor settings

**Guide Overlay**:
Optional read line or safe frame drawn on the Teleprompt View or Prompter Output.
_Avoid_: helper text, tutorial, annotation

**Project File**:
The exported `.json` backup or transfer file for a Better Prompter project.
_Avoid_: document, database, save file

**Autosave Snapshot**:
The latest project state stored locally in the browser so closing and reopening preserves work.
_Avoid_: cloud sync, backup

## Flagged Ambiguities

**Chapter**:
The initial sketches used “chapter,” but the resolved app language is **Block** for editable text segments and **Clip** for a full video script.

**Preview**:
Generic “preview” is ambiguous. Use **Teleprompt View** for the exact in-app scaled renderer.

## Example Dialogue

Domain expert: “I need eight clips ready before recording.”

Developer: “That means the Project has eight Clips. Each Clip contains Blocks of script text.”

Domain expert: “When I click a text section, the prompter should jump there.”

Developer: “Clicking a Block jumps playback to that Block. It does not use previous or next controls.”

Domain expert: “The small preview must show exactly what the Elgato sees.”

Developer: “That is the Teleprompt View. It shares the renderer with the Prompter Output.”
