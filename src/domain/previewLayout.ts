type OutputViewport = {
  width: number;
  height: number;
};

type PreviewBounds = {
  availableHeight: number;
  availableWidth: number;
  viewport: OutputViewport;
};

type PreviewFit = {
  height: number;
  scale: number;
  width: number;
};

function round(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function fitViewportToBounds({ availableHeight, availableWidth, viewport }: PreviewBounds): PreviewFit {
  if (availableWidth <= 0 || availableHeight <= 0 || viewport.width <= 0 || viewport.height <= 0) {
    return { height: 0, scale: 0, width: 0 };
  }

  const scale = Math.min(availableWidth / viewport.width, availableHeight / viewport.height);

  return {
    height: round(viewport.height * scale, 2),
    scale: round(scale, 4),
    width: round(viewport.width * scale, 2),
  };
}
