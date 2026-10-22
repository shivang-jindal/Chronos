import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white p-6 text-center dark:bg-slate-950">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">This timeline does not exist</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
        The view you are looking for may have moved, or the era has not been mapped yet.
      </p>
      <Link
        to="/globe"
        className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Back to the globe
      </Link>
    </div>
  );
}
