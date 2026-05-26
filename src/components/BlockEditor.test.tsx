import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlockEditor } from "./BlockEditor";
import type { Clip } from "../types";

const clip: Clip = {
  id: "clip-1",
  blocks: [
    { id: "block-1", text: "firstsecond" },
    { id: "block-2", text: "another block" },
  ],
};

describe("BlockEditor", () => {
  it("edits free text blocks", () => {
    const onUpdateBlockText = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={vi.fn()}
        onDeleteBlock={vi.fn()}
        onDuplicateBlock={vi.fn()}
        onSelectBlock={vi.fn()}
        onSplitBlock={vi.fn()}
        onUpdateBlockText={onUpdateBlockText}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("firstsecond"), { target: { value: "updated text" } });

    expect(onUpdateBlockText).toHaveBeenCalledWith("block-1", "updated text");
  });

  it("splits a block at the cursor with Control Enter", () => {
    const onSplitBlock = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={vi.fn()}
        onDeleteBlock={vi.fn()}
        onDuplicateBlock={vi.fn()}
        onSelectBlock={vi.fn()}
        onSplitBlock={onSplitBlock}
        onUpdateBlockText={vi.fn()}
      />,
    );

    const textarea = screen.getByDisplayValue("firstsecond") as HTMLTextAreaElement;
    textarea.setSelectionRange(5, 5);
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(onSplitBlock).toHaveBeenCalledWith("block-1", 5);
  });

  it("selects a block when its row is clicked", () => {
    const onSelectBlock = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={vi.fn()}
        onDeleteBlock={vi.fn()}
        onDuplicateBlock={vi.fn()}
        onSelectBlock={onSelectBlock}
        onSplitBlock={vi.fn()}
        onUpdateBlockText={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("block-row-block-2"));

    expect(onSelectBlock).toHaveBeenCalledWith("block-2");
  });

  it("selects a textarea block without also bubbling to the row", () => {
    const onSelectBlock = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={vi.fn()}
        onDeleteBlock={vi.fn()}
        onDuplicateBlock={vi.fn()}
        onSelectBlock={onSelectBlock}
        onSplitBlock={vi.fn()}
        onUpdateBlockText={vi.fn()}
      />,
    );

    const textarea = screen.getByLabelText("Block 2");
    fireEvent.click(textarea);

    expect(onSelectBlock).toHaveBeenCalledTimes(1);
    expect(onSelectBlock).toHaveBeenCalledWith("block-2");
  });

  it("reselects the active textarea block when clicked", () => {
    const onSelectBlock = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={vi.fn()}
        onDeleteBlock={vi.fn()}
        onDuplicateBlock={vi.fn()}
        onSelectBlock={onSelectBlock}
        onSplitBlock={vi.fn()}
        onUpdateBlockText={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Block 1"));

    expect(onSelectBlock).toHaveBeenCalledTimes(1);
    expect(onSelectBlock).toHaveBeenCalledWith("block-1");
  });

  it("adds, duplicates, and deletes blocks from row controls", () => {
    const onAddBlockAfter = vi.fn();
    const onDeleteBlock = vi.fn();
    const onDuplicateBlock = vi.fn();

    render(
      <BlockEditor
        activeBlockId="block-1"
        clip={clip}
        onAddBlockAfter={onAddBlockAfter}
        onDeleteBlock={onDeleteBlock}
        onDuplicateBlock={onDuplicateBlock}
        onSelectBlock={vi.fn()}
        onSplitBlock={vi.fn()}
        onUpdateBlockText={vi.fn()}
      />,
    );

    const row = screen.getByTestId("block-row-block-1");
    fireEvent.click(within(row).getByLabelText("Add block after"));
    fireEvent.click(within(row).getByLabelText("Duplicate block"));
    fireEvent.click(within(row).getByLabelText("Delete block"));

    expect(onAddBlockAfter).toHaveBeenCalledWith("block-1");
    expect(onDuplicateBlock).toHaveBeenCalledWith("block-1");
    expect(onDeleteBlock).toHaveBeenCalledWith("block-1");
  });
});
