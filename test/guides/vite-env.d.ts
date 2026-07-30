// Minimal typing for import.meta.glob, which vitest provides at runtime.
// The full ambient types live in vite/client, but vite is not a direct
// dependency (pnpm's strict layout hides transitive packages from tsc), and
// this is the only Vite API the guides suite uses.
//
// If vite/client's types ever enter this program (vite becoming a direct
// dependency, or a vitest release pulling them in), tsc will error here:
// vite/client declares `glob` as a property, and a method declaration
// cannot merge with a property of the same name. The fix is to DELETE this
// file and use vite/client instead.
interface ImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
}
