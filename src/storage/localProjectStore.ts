import type { PrompterProject } from "../types";
import { parseProjectJson, serializeProjectJson } from "./projectFile";

const AUTOSAVE_KEY = "better-prompter:last-project";

export function saveAutosavedProject(project: PrompterProject): void {
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
