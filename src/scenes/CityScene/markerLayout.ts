/** Collision suppression leaves coordinates untouched; every destination remains in the list. */
export function crowdedMarkers(
  points: { id: string; x: number; y: number; active: boolean }[],
  selectedId: string | null,
  gap = 40,
) {
  const kept: typeof points = [];
  const hidden = new Set<string>();
  const ordered = [...points].sort(
    (a, b) => Number(b.id === selectedId) - Number(a.id === selectedId),
  );
  for (const point of ordered) {
    if (!point.active) continue;
    if (kept.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < gap))
      hidden.add(point.id);
    else kept.push(point);
  }
  return hidden;
}
