import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !matchMedia(
        "(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
      ).matches
    )
      return;
    let x = -100,
      y = -100,
      cx = x,
      cy = y;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const a = (e.target as HTMLElement).closest("a,button,[data-cursor]");
      ref.current?.classList.toggle("is-active", !!a);
    };
    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (ref.current)
        ref.current.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    };
    window.addEventListener("pointermove", move);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      gsap.ticker.remove(tick);
    };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
