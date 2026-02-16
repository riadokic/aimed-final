"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { UploadedReport } from "@/types/aimed";

interface FileUploadProps {
  onFileSelect: (file: UploadedReport) => void;
  onClear: () => void;
  selectedFile: UploadedReport | null;
  className?: string;
}

const ACCEPTED_TYPES: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function FileUpload({ onFileSelect, onClear, selectedFile, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      const fileType = ACCEPTED_TYPES[file.type];
      if (!fileType) {
        setError("Podržani formati: PDF, DOCX");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Maksimalna veličina fajla: 10 MB");
        return;
      }
      onFileSelect({ file, name: file.name, type: fileType, size: file.size });
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
      // Reset so same file can be selected again
      e.target.value = "";
    },
    [validateAndSelect]
  );

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── File selected state ──
  if (selectedFile) {
    return (
      <div className={cn("rounded-2xl border border-aimed-gray-200 bg-aimed-white p-5", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aimed-gray-100">
              {selectedFile.type === "pdf" ? (
                <PdfIcon className="h-5 w-5 text-aimed-red" />
              ) : (
                <DocIcon className="h-5 w-5 text-aimed-blue" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-aimed-black truncate max-w-[240px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-aimed-gray-400">
                {selectedFile.type.toUpperCase()} · {formatSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="rounded-lg p-2 text-aimed-gray-400 transition-colors duration-200 hover:bg-aimed-gray-100 hover:text-aimed-gray-700"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Drop zone state ──
  return (
    <div className={cn(className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors duration-200",
          isDragging
            ? "border-aimed-black bg-aimed-gray-100"
            : "border-aimed-gray-200 bg-aimed-white hover:border-aimed-gray-400 hover:bg-aimed-gray-50"
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aimed-gray-100">
          <UploadIcon className="h-5 w-5 text-aimed-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-aimed-black">
            {isDragging ? "Pustite fajl ovdje" : "Prevucite fajl ili kliknite"}
          </p>
          <p className="mt-1 text-xs text-aimed-gray-400">PDF ili DOCX, do 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-aimed-red">{error}</p>
      )}
    </div>
  );
}

// ── Icons ──

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
