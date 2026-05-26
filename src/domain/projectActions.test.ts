import { describe, expect, it } from "vitest";
import { createDefaultProject } from "./defaultProject";
import {
  addBlockAfter,
  addClip,
  deleteBlock,
  deleteClip,
  duplicateBlock,
  setActiveClip,
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

  it("uses the MVP project schema from the design spec", () => {
    const project = createDefaultProject();

    expect(project).toEqual({
      version: 1,
      settings: {
        fontSizePt: 72,
        horizontalMarginPercent: 12,
        verticalMarginPercent: 18,
        lineSpacingPercent: 120,
        textColor: "#ffffff",
        backgroundColor: "#000000",
        scrollSpeedPercent: 42,
        mirrorOutput: false,
        showReadLinePreview: false,
        showReadLineOutput: false,
        showSafeFramePreview: false,
        showSafeFrameOutput: false,
      },
      clips: [
        {
          id: "clip-1",
          blocks: [
            {
              id: "block-1",
              text: "",
            },
          ],
        },
      ],
      activeClipId: "clip-1",
    });
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

  it("ignores unknown active clip ids", () => {
    const project = createDefaultProject();

    expect(setActiveClip(project, "missing")).toBe(project);
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

  it("does not delete the final remaining block", () => {
    const project = createDefaultProject();
    const block = project.clips[0].blocks[0];

    expect(deleteBlock(project, block.id)).toBe(project);
  });
});
