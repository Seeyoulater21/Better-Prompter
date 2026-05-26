import { Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Clip } from "../types";

type BlockEditorProps = {
  activeBlockId: string;
  clip: Clip;
  onAddBlockAfter: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onSplitBlock: (blockId: string, cursorIndex: number) => void;
  onUpdateBlockText: (blockId: string, text: string) => void;
};

export function BlockEditor({
  activeBlockId,
  clip,
  onAddBlockAfter,
  onDeleteBlock,
  onDuplicateBlock,
  onSelectBlock,
  onSplitBlock,
  onUpdateBlockText,
}: BlockEditorProps) {
  const textareas = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    textareas.current[activeBlockId]?.focus();
  }, [activeBlockId]);

  return (
    <section className="panel block-editor" aria-labelledby="blocks-heading">
      <div className="panel-header">
        <h2 id="blocks-heading">Text Edit / Blocks</h2>
      </div>
      <div className="block-list">
        {clip.blocks.map((block, index) => (
          <article
            className={`block-row${block.id === activeBlockId ? " is-active" : ""}`}
            data-testid={`block-row-${block.id}`}
            key={block.id}
            onClick={() => onSelectBlock(block.id)}
          >
            <div className="block-toolbar">
              <span className="block-index">{String(index + 1).padStart(2, "0")}</span>
              <button
                aria-label="Add block after"
                className="icon-button compact"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddBlockAfter(block.id);
                }}
                type="button"
              >
                <Plus aria-hidden="true" size={15} />
              </button>
              <button
                aria-label="Duplicate block"
                className="icon-button compact"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                type="button"
              >
                <Copy aria-hidden="true" size={15} />
              </button>
              <button
                aria-label="Delete block"
                className="icon-button compact"
                disabled={clip.blocks.length <= 1}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                type="button"
              >
                <Trash2 aria-hidden="true" size={15} />
              </button>
            </div>
            <textarea
              aria-label={`Block ${index + 1}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectBlock(block.id);
              }}
              onChange={(event) => onUpdateBlockText(block.id, event.target.value)}
              onKeyDown={(event) => {
                if (event.ctrlKey && event.key === "Enter") {
                  event.preventDefault();
                  onSplitBlock(block.id, event.currentTarget.selectionStart);
                }
              }}
              ref={(element) => {
                textareas.current[block.id] = element;
              }}
              spellCheck={false}
              value={block.text}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
