'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-rose-400">Application Error</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
