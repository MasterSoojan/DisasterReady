"use client";

import {
  Component,
  Suspense,
  type ReactNode,
  useSyncExternalStore,
} from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

function subscribeMotion(listener: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
export function useReducedLearningMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let webGLAvailable: boolean | undefined;
function canRenderWebGL() {
  if (webGLAvailable !== undefined) return webGLAvailable;
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    webGLAvailable = !!probe;
    // Release the temporary capability probe; Canvas owns its actual context.
    probe?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webGLAvailable = false;
  }
  return webGLAvailable;
}
const subscribeCapability = () => () => {};

/** Decoration cannot block learning. Reduced motion uses the existing CSS background. */
export function DecorativeCanvas({ children, ...props }: CanvasProps) {
  const reducedMotion = useReducedLearningMotion();
  const capable = useSyncExternalStore(
    subscribeCapability,
    () => !reducedMotion && canRenderWebGL(),
    () => false,
  );
  if (!capable) return null;
  return (
    <SceneBoundary>
      <Canvas {...props} fallback={null}>
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
