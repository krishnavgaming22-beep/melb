import { useEffect, useRef, useCallback, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "lenis/dist/lenis.css";
gsap.registerPlugin(ScrollTrigger);
import { ScrollContext } from "./ScrollContext";
export { useScrollTo } from "./ScrollContext";
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const locks = new Set<string>();
    const landmark = (event: Event) => {
      (event as CustomEvent<boolean>).detail
        ? locks.add(event.type)
        : locks.delete(event.type);
      locks.size ? l.stop() : l.start();
    };
    window.addEventListener("melb:landmark-active", landmark);
    window.addEventListener("melb:menu-active", landmark);
    return () => {
      window.removeEventListener("melb:landmark-active", landmark);
      window.removeEventListener("melb:menu-active", landmark);
      gsap.ticker.remove(tick);
      l.off("scroll", ScrollTrigger.update);
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);
  const scrollTo = useCallback((target: string | number) => {
    if (lenis.current) {
      // Lazy page content may mount after Lenis measured the loading screen.
      lenis.current.resize();
      lenis.current.scrollTo(target, { offset: 0 });
    } else {
      const el =
        typeof target === "string" ? document.querySelector(target) : null;
      window.scrollTo({
        top:
          typeof target === "number"
            ? target
            : (el?.getBoundingClientRect().top ?? 0) + window.scrollY,
        behavior: "instant",
      });
    }
  }, []);
  return (
    <ScrollContext.Provider value={scrollTo}>{children}</ScrollContext.Provider>
  );
}
