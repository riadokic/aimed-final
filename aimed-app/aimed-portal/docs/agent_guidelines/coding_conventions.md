# Coding Conventions — AIMED

## General Rules

- **Language**: TypeScript, strict mode
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS only — no CSS modules, no styled-components
- **Formatting**: Follow Prettier defaults (no custom config needed for MVP)

---

## File Naming

- Components: `kebab-case.tsx` (e.g., `record-button.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-audio-recorder.ts`)
- Utils/services: `kebab-case.ts` (e.g., `aimed-api.ts`)
- Types: `kebab-case.ts` (e.g., `aimed.ts`)
- Pages: `page.tsx` inside route directories (Next.js convention)

---

## Component Structure

```typescript
// 1. Imports
import { useState } from 'react';

// 2. Types (if component-specific)
interface RecordButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

// 3. Component (named export, not default)
export function RecordButton({ onRecordingComplete, disabled }: RecordButtonProps) {
  // hooks first
  const [isRecording, setIsRecording] = useState(false);

  // handlers
  function handleClick() {
    // ...
  }

  // render
  return (
    <button onClick={handleClick} disabled={disabled}>
      {isRecording ? 'Zaustavi' : 'Snimaj'}
    </button>
  );
}
```

### Rules
- Named exports, not default exports
- Props interface defined above the component
- No `React.FC` — use plain function signatures
- Hooks at the top of the component body
- Event handlers as regular functions (not arrow functions assigned to const)

---

## State Management

- **Local state**: `useState` for component state
- **Shared state**: Props drilling for MVP (max 2-3 levels)
- **Complex state**: `useReducer` if a component has 3+ related state variables
- **No Redux/Zustand** for MVP — unnecessary complexity

---

## API Calls

- All API calls go through `services/aimed-api.ts`
- Components never call `fetch` directly
- Hooks (`use-aimed-api.ts`) wrap the service for React integration
- Error handling at the hook level, not in components

---

## Error Handling

- Use try/catch in async functions
- Map technical errors to user-friendly Bosnian messages
- Never show raw error messages to users
- Log errors to console in development
- No error tracking service for MVP

---

## TypeScript

- Strict mode enabled
- No `any` types — use `unknown` and narrow
- Interface for object shapes, type for unions/aliases
- No enums — use string literal unions:
  ```typescript
  type RecordingState = 'idle' | 'recording' | 'paused' | 'processing' | 'done' | 'error';
  ```

---

## Tailwind Usage

- Use utility classes directly in JSX
- Extract repeated patterns to components, not to `@apply` rules
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes:
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

---

## Imports

- Use path aliases: `@/components/...`, `@/hooks/...`, `@/services/...`
- Group imports: React → Next.js → external → internal → types
- No barrel files (index.ts re-exports) — import directly from the file

---

## Comments

- No JSDoc on every function — only where logic is non-obvious
- No "// TODO" without a specific description
- Bosnian medical terms in comments are fine when clarifying domain logic

---

## Testing (Post-MVP)

- No tests for MVP — focus on shipping
- When added: Vitest + React Testing Library
- Test behavior, not implementation
- Focus on: API integration, report parsing, recording flow
