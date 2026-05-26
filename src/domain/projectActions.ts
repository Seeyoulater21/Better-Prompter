import type { Clip, PrompterProject, ScriptBlock } from "../types";

type BlockResult = {
  project: PrompterProject;
  newBlockId: string;
};

function getActiveClip(project: PrompterProject): Clip {
  return project.clips.find((clip) => clip.id === project.activeClipId) ?? project.clips[0];
}

function nextId(project: PrompterProject, prefix: "clip" | "block"): string {
  const ids =
    prefix === "clip"
      ? project.clips.map((clip) => clip.id)
      : project.clips.flatMap((clip) => clip.blocks.map((block) => block.id));
  const nextNumber =
    ids.reduce((highest, id) => {
      const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
      if (!match) return highest;
      return Math.max(highest, Number(match[1]));
    }, 0) + 1;

  return `${prefix}-${nextNumber}`;
}

function updateActiveClip(project: PrompterProject, updater: (clip: Clip) => Clip): PrompterProject {
  const activeClip = getActiveClip(project);
  const updatedClip = updater(activeClip);

  if (updatedClip === activeClip && activeClip.id === project.activeClipId) return project;

  return {
    ...project,
    activeClipId: activeClip.id,
    clips: project.clips.map((clip) => (clip.id === activeClip.id ? updatedClip : clip)),
  };
}

export function setActiveClip(project: PrompterProject, clipId: string): PrompterProject {
  if (!project.clips.some((clip) => clip.id === clipId)) return project;
  return { ...project, activeClipId: clipId };
}

export function addClip(project: PrompterProject): PrompterProject {
  const clip: Clip = {
    id: nextId(project, "clip"),
    blocks: [{ id: nextId(project, "block"), text: "" }],
  };

  return {
    ...project,
    clips: [...project.clips, clip],
    activeClipId: clip.id,
  };
}

export function deleteClip(project: PrompterProject, clipId: string): PrompterProject {
  if (project.clips.length <= 1) return project;
  if (!project.clips.some((clip) => clip.id === clipId)) return project;

  const clips = project.clips.filter((clip) => clip.id !== clipId);
  const activeClipId = project.activeClipId === clipId ? clips[0].id : project.activeClipId;

  return {
    ...project,
    clips,
    activeClipId,
  };
}

export function updateBlockText(project: PrompterProject, blockId: string, text: string): PrompterProject {
  return updateActiveClip(project, (clip) => {
    if (!clip.blocks.some((block) => block.id === blockId)) return clip;

    return {
      ...clip,
      blocks: clip.blocks.map((block) => (block.id === blockId ? { ...block, text } : block)),
    };
  });
}

export function addBlockAfter(project: PrompterProject, blockId: string): BlockResult {
  const newBlock: ScriptBlock = { id: nextId(project, "block"), text: "" };
  const updatedProject = updateActiveClip(project, (clip) => {
    const index = clip.blocks.findIndex((block) => block.id === blockId);
    const insertAt = index === -1 ? clip.blocks.length : index + 1;

    return {
      ...clip,
      blocks: [...clip.blocks.slice(0, insertAt), newBlock, ...clip.blocks.slice(insertAt)],
    };
  });

  return { project: updatedProject, newBlockId: newBlock.id };
}

export function duplicateBlock(project: PrompterProject, blockId: string): PrompterProject {
  const activeClip = getActiveClip(project);
  const source = activeClip.blocks.find((block) => block.id === blockId);
  if (!source) return project;

  const newBlock: ScriptBlock = { id: nextId(project, "block"), text: source.text };

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
    if (!clip.blocks.some((block) => block.id === blockId)) return clip;

    return {
      ...clip,
      blocks: clip.blocks.filter((block) => block.id !== blockId),
    };
  });
}

export function splitBlockAt(project: PrompterProject, blockId: string, cursorIndex: number): BlockResult {
  const activeClip = getActiveClip(project);
  const source = activeClip.blocks.find((block) => block.id === blockId);
  if (!source) return { project, newBlockId: blockId };

  const splitIndex = Math.max(0, Math.min(cursorIndex, source.text.length));
  const before = source.text.slice(0, splitIndex);
  const after = source.text.slice(splitIndex);
  const newBlock: ScriptBlock = { id: nextId(project, "block"), text: after };

  const updatedProject = updateActiveClip(project, (clip) => ({
    ...clip,
    blocks: clip.blocks.flatMap((block) => {
      if (block.id !== blockId) return [block];
      return [{ ...block, text: before }, newBlock];
    }),
  }));

  return { project: updatedProject, newBlockId: newBlock.id };
}
