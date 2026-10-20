/** At most one automatic refresh per loaded build, including across navigation. */
export function claimChunkRecovery(
  storage: Pick<Storage, "getItem" | "setItem">,
  buildId: string,
): boolean {
  const key = `melb:chunk-recovery:${buildId}`;
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    // Without a persistent guard, leave the error UI available rather than loop.
    return false;
  }
}
