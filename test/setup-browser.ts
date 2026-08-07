// Some bundled deps reach for the Node-style `global`; alias it to globalThis
// so they don't blow up at module load. This matches the polyfill pattern other
// bundlers apply for browser builds.
if (typeof (globalThis as any).global === "undefined") {
  (globalThis as any).global = globalThis;
}
