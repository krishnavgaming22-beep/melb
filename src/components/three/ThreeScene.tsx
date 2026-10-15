import { Canvas } from "@react-three/fiber";
import { Suspense, Component, type ReactNode } from "react";
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    window.dispatchEvent(new Event("melb:scene-failed"));
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">MELBOURNE · 37.8° S / 144.9° E</div>
    ) : (
      this.props.children
    );
  }
}
export function ThreeScene({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <SceneBoundary>
      <Canvas
        shadows
        className="primary-canvas"
        dpr={[1, matchMedia("(max-width: 700px)").matches ? 1.25 : 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 2, 12], fov: 42, near: 0.1, far: 300 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        fallback={
          <div className="scene-fallback">
            Your journey to Melbourne starts here.
          </div>
        }
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
