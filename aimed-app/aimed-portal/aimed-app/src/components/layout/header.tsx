"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HelpModal } from "@/components/layout/help-modal";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-aimed-gray-200 bg-aimed-white dark:bg-[#0F0F11] px-8 transition-colors duration-300">
        <div>
          <h1 className="text-xl font-semibold text-aimed-black">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-aimed-gray-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {action && <div className="mr-2">{action}</div>}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-aimed-gray-500 transition-colors duration-200 hover:bg-aimed-gray-100 hover:text-aimed-black"
            title="Pomoć"
          >
            <HelpIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Pomoć</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}
