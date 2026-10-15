/** Resolve public assets on localhost and under a GitHub Pages project path. */
export function assetUrl(path: string) {
  const base = import.meta.env?.BASE_URL ?? "/";
  return `${base}${path.replace(/^\/+/, "")}`;
}
