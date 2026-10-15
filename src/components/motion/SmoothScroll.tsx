import { useEffect, useRef, type ReactNode } from "react";
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
    const landmark = (event: Event) =>
      (event as CustomEvent<boolean>).detail ? l.stop() : l.start();
    window.addEventListener("melb:landmark-active", landmark);
    return () => {
      window.removeEventListener("melb:landmark-active", landmark);
      gsap.ticker.remove(tick);
      l.off("scroll", ScrollTrigger.update);
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);
  return (
    <ScrollContext.Provider
      value={(target) => {
        if (lenis.current) {
          // Lazy page content may mount after Lenis measured the loading screen.
          lenis.current.resize();
          lenis.current.scrollTo(target, { offset: 0 });
        }
        else {
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
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}
