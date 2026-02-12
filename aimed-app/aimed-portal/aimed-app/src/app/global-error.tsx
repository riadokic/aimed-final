"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Greška</h1>
            <p className="text-sm text-zinc-600 mb-6">
              Došlo je do neočekivane greške. Molimo pokušajte ponovo.
            </p>
            {error.digest && (
              <p className="text-xs text-zinc-400 mb-4 font-mono">
                Digest: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="w-full bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
