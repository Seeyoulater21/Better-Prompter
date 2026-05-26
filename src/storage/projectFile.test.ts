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

  it("keeps JSON compatible with the design spec schema", () => {
    const project = createDefaultProject();
    const parsed = JSON.parse(serializeProjectJson(project)) as unknown;

    expect(parsed).toEqual({
      version: 1,
      settings: {
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

  it("rejects invalid project JSON", () => {
    expect(() => parseProjectJson('{"version":2}')).toThrow("Unsupported project file");
  });

  it("rejects project JSON with missing required settings", () => {
    const project = createDefaultProject();
    const json = serializeProjectJson({
      ...project,
      settings: { ...project.settings, textColor: undefined as unknown as string },
    });

    expect(() => parseProjectJson(json)).toThrow("Unsupported project file");
  });

  it("rejects project JSON when the active clip does not exist", () => {
    const project = createDefaultProject();

    expect(() => parseProjectJson(serializeProjectJson({ ...project, activeClipId: "missing" }))).toThrow(
      "Unsupported project file",
    );
  });

  it("rejects project JSON with duplicate clip ids", () => {
    const project = createDefaultProject();
    const duplicate = {
      ...project,
      clips: [...project.clips, { ...project.clips[0], blocks: [{ id: "block-2", text: "" }] }],
    };

    expect(() => parseProjectJson(serializeProjectJson(duplicate))).toThrow("Unsupported project file");
  });

  it("rejects project JSON with duplicate block ids", () => {
    const project = createDefaultProject();
    const duplicate = {
      ...project,
      clips: [
        {
          ...project.clips[0],
          blocks: [...project.clips[0].blocks, { id: "block-1", text: "duplicate" }],
        },
      ],
    };

    expect(() => parseProjectJson(serializeProjectJson(duplicate))).toThrow("Unsupported project file");
  });
});
