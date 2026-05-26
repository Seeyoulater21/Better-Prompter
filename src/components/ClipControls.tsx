import { Plus, Trash2 } from "lucide-react";
import type { Clip } from "../types";

type ClipControlsProps = {
  activeClipId: string;
  clips: Clip[];
  onAddClip: () => void;
  onDeleteClip: () => void;
  onSelectClip: (clipId: string) => void;
};

export function ClipControls({ activeClipId, clips, onAddClip, onDeleteClip, onSelectClip }: ClipControlsProps) {
  return (
    <div className="clip-controls">
      <label className="sr-only" htmlFor="clip-select">
        Select clip
      </label>
      <select
        aria-label="Select clip"
        id="clip-select"
        onChange={(event) => onSelectClip(event.target.value)}
        value={activeClipId}
      >
        {clips.map((clip, index) => (
          <option key={clip.id} value={clip.id}>
            Clip {index + 1} / {clips.length}
          </option>
        ))}
      </select>
      <button aria-label="Add clip" className="icon-button" onClick={onAddClip} type="button">
        <Plus aria-hidden="true" size={18} />
      </button>
      <button
        aria-label="Delete clip"
        className="icon-button"
        disabled={clips.length <= 1}
        onClick={onDeleteClip}
        type="button"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
