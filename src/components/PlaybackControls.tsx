import { Pause, Play } from "lucide-react";

type PlaybackControlsProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function PlaybackControls({ isPlaying, onToggle }: PlaybackControlsProps) {
  const label = isPlaying ? "Pause" : "Play";
  const Icon = isPlaying ? Pause : Play;

  return (
    <footer className="playback-bar">
      <button aria-label={label} aria-pressed={isPlaying} className="playback-button" onClick={onToggle} type="button">
        <Icon aria-hidden="true" fill="currentColor" size={24} />
        <span>{label}</span>
      </button>
    </footer>
  );
}
