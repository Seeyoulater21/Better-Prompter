import { beforeEach, describe, expect, it } from "vitest";
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

  it("returns null when stored JSON has an invalid schema", () => {
    localStorage.setItem("better-prompter:last-project", JSON.stringify({ version: 1, clips: [] }));

    expect(loadAutosavedProject()).toBeNull();
  });
});
