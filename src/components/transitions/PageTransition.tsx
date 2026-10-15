import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const page = useRef<HTMLDivElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mask.current,
        { scaleY: 1 },
        { scaleY: 0, duration: reduced ? 0 : 0.65, ease: "power3.inOut" },
      );
      gsap.fromTo(
        page.current,
        { opacity: 0, y: reduced ? 0 : 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: reduced ? 0 : 0.15,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    });
    return () => ctx.revert();
  }, [location.pathname, reduced]);
  return (
    <>
      <div ref={page}>{children}</div>
      <div ref={mask} className="transition-mask" aria-hidden="true" />
    </>
  );
}
