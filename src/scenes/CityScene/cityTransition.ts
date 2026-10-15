const ease = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
/** Phase 1.5 occupies .67–.98 of the original journey. Pure/reversible scroll state. */
export function cityTransition(progress: number) {
  const phase = (progress - 0.67) / 0.31;
  return {
    lift: ease(0.2, 0.9, phase),
    flatten: ease(0.45, 0.7, phase),
    emerge: ease(0.56, 0.7, progress),
    mapInteraction: ease(0.94, 0.955, progress),
  };
}
