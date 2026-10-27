import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-surface-sunken">
      <p className="text-6xl font-bold text-brand-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">This timeline does not exist</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        The view you are looking for may have moved, or the era has not been mapped yet.
      </p>
      <Link
        to="/globe"
        className="mt-6 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-[#04121d] transition-colors hover:bg-brand-400"
      >
        Back to the globe
      </Link>
    </div>
  );
}
