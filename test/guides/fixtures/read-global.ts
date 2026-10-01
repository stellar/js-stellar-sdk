if ("__guideFixtureLeak" in globalThis) {
  throw new Error("state leaked in from another snippet");
}
