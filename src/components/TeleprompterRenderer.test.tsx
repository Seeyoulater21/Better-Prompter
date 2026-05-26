import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import type { PrompterProject } from "../types";
import { TeleprompterRenderer } from "./TeleprompterRenderer";

function projectWithText(text = "hello prompter"): PrompterProject {
  const project = createDefaultProject();
  project.settings = {
    ...project.settings,
    fontSizePt: 80,
    horizontalMarginPercent: 10,
    verticalMarginPercent: 15,
    lineSpacingPercent: 130,
    textColor: "#f8fafc",
    backgroundColor: "#020617",
  };
  project.clips[0].blocks[0].text = text;
  return project;
}

describe("TeleprompterRenderer", () => {
  it("renders the active clip with project appearance settings", () => {
    const project = projectWithText("shared renderer text");

    render(<TeleprompterRenderer activeBlockId="block-1" mode="output" project={project} scrollOffsetPx={32} />);

    const canvas = screen.getByTestId("prompter-canvas");
    const scrollLayer = screen.getByTestId("prompter-scroll-layer");
    const block = screen.getByText("shared renderer text");

    expect(canvas).toHaveStyle({ backgroundColor: "#020617", color: "#f8fafc" });
    expect(scrollLayer).toHaveStyle({
      paddingInline: "10%",
      paddingBlock: "15%",
      transform: "translateY(-32px)",
    });
    expect(block).toHaveStyle({ fontSize: "80px", lineHeight: "130%" });
  });

  it("uses separate guide toggles for preview and output", () => {
    const project = projectWithText();
    project.settings.showReadLinePreview = true;
    project.settings.showSafeFramePreview = true;
    project.settings.showReadLineOutput = false;
    project.settings.showSafeFrameOutput = false;

    const { rerender } = render(<TeleprompterRenderer activeBlockId="block-1" mode="preview" project={project} />);

    expect(screen.getByTestId("read-line")).toBeInTheDocument();
    expect(screen.getByTestId("safe-frame")).toBeInTheDocument();

    rerender(<TeleprompterRenderer activeBlockId="block-1" mode="output" project={project} />);

    expect(screen.queryByTestId("read-line")).not.toBeInTheDocument();
    expect(screen.queryByTestId("safe-frame")).not.toBeInTheDocument();
  });

  it("mirrors only output mode", () => {
    const project = projectWithText();
    project.settings.mirrorOutput = true;

    const { rerender } = render(<TeleprompterRenderer activeBlockId="block-1" mode="preview" project={project} />);
    expect(screen.getByTestId("prompter-canvas")).not.toHaveStyle({ transform: "scaleX(-1)" });

    rerender(<TeleprompterRenderer activeBlockId="block-1" mode="output" project={project} />);
    expect(screen.getByTestId("prompter-canvas")).toHaveStyle({ transform: "scaleX(-1)" });
  });

  it("scales text and scroll offset for preview rendering", () => {
    const project = projectWithText("scaled preview");

    render(<TeleprompterRenderer activeBlockId="block-1" mode="preview" project={project} scale={0.25} scrollOffsetPx={40} />);

    expect(screen.getByTestId("prompter-scroll-layer")).toHaveStyle({ transform: "translateY(-10px)" });
    expect(screen.getByText("scaled preview")).toHaveStyle({ fontSize: "20px" });
  });

  it("does not add active-block-only styling inside the shared renderer", () => {
    const project = projectWithText("first block");
    project.clips[0].blocks.push({ id: "block-2", text: "second block" });

    render(<TeleprompterRenderer activeBlockId="block-1" mode="preview" project={project} />);

    expect(screen.getByText("first block")).toHaveClass("prompter-block");
    expect(screen.getByText("first block")).not.toHaveClass("is-active");
    expect(screen.getByText("second block")).not.toHaveClass("is-active");
  });
});
