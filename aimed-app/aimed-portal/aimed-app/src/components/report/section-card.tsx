"use client";

import { useRef, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  content: string;
  index: number;
  isFocused: boolean;
  isBlurred: boolean;
  onFocus: (index: number) => void;
  onBlur: () => void;
  onChange: (index: number, content: string) => void;
  /** Show "Uredan nalaz" quick-fill for ANAMNEZA/STATUS */
  showNormalToggle?: boolean;
}

export function SectionCard({
  title,
  content,
  index,
  isFocused,
  isBlurred,
  onFocus,
  onBlur,
  onChange,
  showNormalToggle,
}: SectionCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [previousContent, setPreviousContent] = useState<string | null>(null);

  const handleBlur = useCallback(() => {
    onBlur();
    const text = contentRef.current?.textContent ?? "";
    onChange(index, text);
  }, [onBlur, onChange, index]);

  const handleNormalFinding = useCallback(() => {
    // Save current content so user can undo
    setPreviousContent(content);
    const normalText =
      title === "ANAMNEZA"
        ? "Pacijent se ne žali na tegobe. Bez subjektivnih smetnji."
        : "Uredan nalaz. Bez patoloških odstupanja.";
    onChange(index, normalText);
    if (contentRef.current) {
      contentRef.current.textContent = normalText;
    }
  }, [title, onChange, index, content]);

  const handleUndo = useCallback(() => {
    if (previousContent === null) return;
    onChange(index, previousContent);
    if (contentRef.current) {
      contentRef.current.textContent = previousContent;
    }
    setPreviousContent(null);
  }, [previousContent, onChange, index]);

  return (
    <Card
      className={cn(
        "transition-opacity duration-300",
        isBlurred && "opacity-50",
        isFocused && "ring-1 ring-aimed-black/10"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-aimed-gray-500">
          {title}
        </p>
        {showNormalToggle && (
          <div className="flex items-center gap-1">
            {previousContent !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-aimed-gray-400 transition-colors duration-200 hover:bg-aimed-gray-100 hover:text-aimed-gray-700"
              >
                <UndoIcon className="h-3.5 w-3.5" />
                Vrati
              </button>
            )}
            <button
              type="button"
              onClick={handleNormalFinding}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-aimed-gray-400 transition-colors duration-200 hover:bg-aimed-gray-100 hover:text-aimed-gray-700"
            >
              <CheckboxIcon className="h-3.5 w-3.5" />
              Uredan nalaz
            </button>
          </div>
        )}
      </div>
      <div
        ref={contentRef}
        className={cn(
          "min-h-[2rem] whitespace-pre-wrap text-sm leading-relaxed text-aimed-gray-900 outline-none",
          !content && "text-aimed-gray-400"
        )}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => onFocus(index)}
        onBlur={handleBlur}
        data-placeholder="Unesite tekst..."
      >
        {content || ""}
      </div>
    </Card>
  );
}

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}
