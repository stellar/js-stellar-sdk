import { dirname, resolve } from "path";

/**
 * Test-isolation backstops shared by every vitest config, so protection does
 * not depend on which runner a test file happens to execute under —
 * `test/unit` runs under both the node and the browser config.
 *
 * Vitest restores spies and unstubs globals between tests, so a test that
 * forgets to undo either one cannot leak into the tests that follow. This
 * matters most under the browser config, which shares a single iframe — and
 * therefore a single module registry — across every test file.
 *
 * Scope is spies and `vi.stubGlobal` only. Module-level state — a `vi.mock`,
 * or a mutation of an SDK singleton like `Config` or `SERVER_TIME_MAP` — is
 * not restored, and under a shared registry it outlives the file that set it.
 */
export const mockSafeguards = {
  restoreMocks: true,
  unstubGlobals: true,
} as const;

export function aliasHttpClientToAxiosSource(isAxios: boolean) {
  const fetchClientSource = resolve(__dirname, "../src/http-client/index.js");
  const fetchClientDirectory = resolve(__dirname, "../src/http-client");
  const axiosClientSource = resolve(__dirname, "../src/http-client/axios.ts");

  return {
    name: "alias-http-client-to-axios-source",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (!isAxios || !importer || !source.startsWith(".")) {
        return null;
      }

      const resolvedSource = resolve(dirname(importer), source);
      if (
        resolvedSource === fetchClientSource ||
        resolvedSource === fetchClientDirectory
      ) {
        return axiosClientSource;
      }

      return null;
    },
  };
}
