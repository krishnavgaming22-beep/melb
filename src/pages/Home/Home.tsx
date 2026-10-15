import { ArrivalExperience } from "./ArrivalExperience";
import { EditorialJourney } from "./EditorialJourney";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useScrollTo } from "../../components/motion/SmoothScroll";
export default function Home() {
  const { hash } = useLocation();
  const scrollTo = useScrollTo();
  useEffect(() => {
    if (!hash) return;
    const timer = setTimeout(() => {
      if (hash === "#discover")
        window.dispatchEvent(
          new CustomEvent("melb:discover-place", { detail: null }),
        );
      else if (document.getElementById(hash.slice(1))) scrollTo(hash);
    }, 100);
    return () => clearTimeout(timer);
  }, [hash]);
  return (
    <>
      <ArrivalExperience />
      <EditorialJourney />
      <footer className="city-end">
        <a className="wordmark" href="#arrive">
          MELB.
        </a>
        <span>Arrive. Explore. Belong.</span>
        <a className="text-link" href="#arrive">
          BACK TO THE SKY ↑
        </a>
      </footer>
    </>
  );
}
