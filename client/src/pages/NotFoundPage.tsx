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
        className="btn btn-primary mt-6"
      >
        Back to the globe
      </Link>
    </div>
  );
}
