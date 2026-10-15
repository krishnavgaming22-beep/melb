// Fixed storage, no React updates or allocations in the active render loop.
type FrameWindow = {
  samples: Float32Array;
  index: number;
  count: number;
  calls: number;
  triangles: number;
};
const windows: Record<string, FrameWindow> = {};
export function recordFrame(
  scene: string,
  seconds: number,
  calls: number,
  triangles: number,
) {
  const w =
    windows[scene] ??
    (windows[scene] = {
      samples: new Float32Array(600),
      index: 0,
      count: 0,
      calls: 0,
      triangles: 0,
    });
  if (seconds <= 0 || seconds > 1) return;
  w.samples[w.index] = seconds * 1000;
  w.index = (w.index + 1) % w.samples.length;
  w.count = Math.min(w.samples.length, w.count + 1);
  w.calls = calls;
  w.triangles = triangles;
}
export function frameReport() {
  return Object.fromEntries(
    Object.entries(windows).map(([id, w]) => {
      const values = Array.from(w.samples.slice(0, w.count)).sort(
          (a, b) => a - b,
        ),
        sum = values.reduce((a, b) => a + b, 0);
      return [
        id,
        {
          samples: w.count,
          averageFps: sum ? Math.round((w.count * 1000) / sum) : null,
          p50ms: values[Math.floor(values.length * 0.5)] ?? null,
          p95ms: values[Math.floor(values.length * 0.95)] ?? null,
          longFramesOver50ms: values.filter((v) => v > 50).length,
          lastDrawCalls: w.calls,
          lastTriangles: w.triangles,
        },
      ];
    }),
  );
}
