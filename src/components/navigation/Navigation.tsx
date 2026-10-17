import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { mainJourney } from "../../data/chapters";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent("melb:menu-active", { detail: true }));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "Tab") {
        const links = panel.current?.querySelectorAll<HTMLAnchorElement>("a");
        if (!links) return;
        const first = links[0],
          last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          button.current?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          button.current?.focus();
        } else if (document.activeElement === button.current) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      window.dispatchEvent(
        new CustomEvent("melb:menu-active", { detail: false }),
      );
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-header ${open ? "menu-open" : ""}`}>
        <Link className="wordmark" to="/" aria-label="MELB. home">
          MELB.
        </Link>
        <span className="header-place">MELBOURNE, AUSTRALIA</span>
        <button
          ref={button}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span className="menu-lines" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>
      {open && (
        <div
          id="menu"
          ref={panel}
          className="menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Explore MELB."
        >
          <span className="eyebrow">ARRIVE. EXPLORE. BELONG.</span>
          <nav>
            {mainJourney.map(([to, label], i) => (
              <Link
                to={to}
                key={to}
                onClick={() => {
                  setOpen(false);
                  button.current?.focus();
                }}
              >
                <span>0{i + 1}</span>
                {label}
                <b>↗</b>
              </Link>
            ))}
          </nav>
          <span className="menu-foot">
            A different perspective on Melbourne.
          </span>
        </div>
      )}
    </>
  );
}
