import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold font-mono text-blue-400 mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The cubing algorithm or stage you were looking for could not be found.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Return to Algocube
      </Link>
    </div>
  );
}
