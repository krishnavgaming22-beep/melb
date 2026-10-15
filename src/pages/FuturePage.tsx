import { Link, useLocation } from "react-router-dom";
import { routes } from "../data/chapters";
export default function FuturePage() {
  const path = useLocation().pathname;
  const title = routes.find(([p]) => p === path)?.[1];
  return (
    <section className="future-page">
      <span className="eyebrow">MELB. / THE NEXT CHAPTER</span>
      <h1>{title ?? "A little off course."}</h1>
      <p>
        {title
          ? "Full experience coming in a later phase."
          : "This destination could not be found."}
      </p>
      <Link to="/" className="text-link">
        Return to the arrival ↗
      </Link>
    </section>
  );
}
