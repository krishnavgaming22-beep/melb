import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const media = matchMedia("(hover:hover) and (pointer:fine)");
    if (reduced || !media.matches) return;
    let x = -100,
      y = -100,
      cx = x,
      cy = y,
      visible = false;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      visible = true;
      const target = e.target instanceof Element ? e.target : null;
      const control = target?.closest("a,button,[data-cursor]");
      const native = !!target?.closest(
        "input,textarea,select,canvas,[contenteditable]",
      );
      ref.current?.classList.toggle("is-active", !!control);
      if (ref.current) {
        ref.current.style.opacity = native ? "0" : "1";
        ref.current.dataset.context = target?.closest(".street-film")
          ? "film"
          : control
            ? "link"
            : "";
      }
    };
    const hide = () => {
      visible = false;
      if (ref.current) ref.current.style.opacity = "0";
    };
    const tick = () => {
      if (!visible || document.hidden) return;
      const damping = 1 - Math.exp((-24 * gsap.ticker.deltaRatio()) / 60);
      cx += (x - cx) * damping;
      cy += (y - cy) * damping;
      if (ref.current)
        ref.current.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      gsap.ticker.remove(tick);
      hide();
    };
  }, [reduced]);
  return (
    <div
      ref={ref}
      className="cursor"
      aria-hidden="true"
      style={reduced ? { display: "none" } : undefined}
    />
  );
}
