type OutputMode = "managed" | "manual";

type OutputResult = {
  mode: OutputMode;
  window: Window | null;
};

type ScreenDetails = {
  screens: ScreenLike[];
};

type ScreenLike = {
  availHeight: number;
  availLeft: number;
  availTop: number;
  availWidth: number;
  isPrimary?: boolean;
  label?: string;
};

type WindowWithScreenDetails = Window & {
  getScreenDetails?: () => Promise<ScreenDetails>;
};

const OUTPUT_CSS = `
html,
body,
#output-root {
  margin: 0;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

body {
  font-family: Aptos, "SF Pro Display", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.prompter-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0;
}

.prompter-scroll-layer {
  position: absolute;
  inset: 0;
  white-space: pre-wrap;
  transition: transform 80ms linear;
}

.prompter-block {
  margin: 0 0 0.9em;
  font-weight: 750;
}

.prompter-safe-frame {
  position: absolute;
  z-index: 2;
  inset: 8%;
  border: 1px solid rgba(244, 244, 244, 0.28);
  pointer-events: none;
}

.prompter-read-line {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(125, 211, 252, 0.8);
  pointer-events: none;
}
`;

function hasUsableBounds(screen: ScreenLike): boolean {
  return screen.availWidth > 0 && screen.availHeight > 0;
}

function getExternalScreen(screens: ScreenLike[]): ScreenLike | undefined {
  const usableScreens = screens.filter(hasUsableBounds);
  return (
    usableScreens.find((screen) => screen.label?.toLowerCase().includes("elgato")) ??
    usableScreens.find((screen) => screen.isPrimary === false) ??
    usableScreens[1]
  );
}

export function syncPrompterOutput(target: Window, html: string) {
  const root = target.document.getElementById?.("output-root");
  if (root) {
    root.innerHTML = html;
    return;
  }

  target.document.open();
  target.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Better Prompter Output</title>
<style>${OUTPUT_CSS}</style>
</head>
<body>
<div id="output-root">${html}</div>
</body>
</html>`);
  target.document.close();
}

function openManualWindow(html: string): OutputResult {
  if (typeof window.open !== "function") {
    return { mode: "manual", window: null };
  }

  const target = window.open("", "better-prompter-output", "popup=yes,width=1024,height=600");
  if (target) {
    syncPrompterOutput(target, html);
    target.focus();
  }

  return { mode: "manual", window: target };
}

export async function openPrompterOutput(html: string): Promise<OutputResult> {
  const currentWindow = window as WindowWithScreenDetails;

  if (!currentWindow.getScreenDetails) {
    return openManualWindow(html);
  }

  try {
    const details = await currentWindow.getScreenDetails();
    const externalScreen = getExternalScreen(details.screens);

    if (!externalScreen) {
      return openManualWindow(html);
    }

    if (typeof window.open !== "function") {
      return { mode: "manual", window: null };
    }

    const target = window.open(
      "",
      "better-prompter-output",
      `popup=yes,left=${externalScreen.availLeft},top=${externalScreen.availTop},width=${externalScreen.availWidth},height=${externalScreen.availHeight}`,
    );

    if (!target) {
      return openManualWindow(html);
    }

    syncPrompterOutput(target, html);
    target.focus();
    void target.document.documentElement.requestFullscreen?.().catch(() => undefined);

    return { mode: "managed", window: target };
  } catch {
    return openManualWindow(html);
  }
}
