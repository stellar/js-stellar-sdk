import { dirname, resolve } from "path";

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
