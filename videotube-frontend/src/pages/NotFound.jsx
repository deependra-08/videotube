import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <span className="tally-light" />
      <h1 className="font-(family-name:--font-display) text-4xl">404</h1>
      <p className="text-(--color-muted)">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg)"
      >
        Back home
      </Link>
    </div>
  );
}
