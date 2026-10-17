
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SmoothScroll } from "./components/motion/SmoothScroll";
import { PageTransition } from "./components/transitions/PageTransition";
import { Navigation } from "./components/navigation/Navigation";
import { Cursor } from "./components/ui/Cursor";
import { routes } from "./data/chapters";
const Diagnostics = lazy(() => import("./components/motion/Diagnostics").then(m => ({default:m.Diagnostics})));
const Home = lazy(() => import("./pages/Home/Home"));
const FuturePage = lazy(() => import("./pages/FuturePage"));
const legacyTargets: Record<string, string> = {
  "/why-melbourne": "/#why-melbourne",
  "/explore": "/#discover",
  "/living-in-melbourne": "/#quality-of-life",
  "/sporting-melbourne": "/#sport",
  "/study": "/#education",
};
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <SmoothScroll>
        <Navigation />
        <main id="main">
          <PageTransition>
            <Suspense fallback={<div className="loading-brand">MELB.</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                {routes.slice(1).map(([path]) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <Navigate replace to={legacyTargets[path] ?? "/"} />
                    }
                  />
                ))}
                <Route path="*" element={<FuturePage />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </main>
        <Cursor />
        {(import.meta.env.DEV || new URLSearchParams(location.search).has("bench")) && <Suspense fallback={null}><Diagnostics /></Suspense>}
      </SmoothScroll>
    </BrowserRouter>
  );
}
