// Browser setup file for Vitest browser testing
// This file loads the built browser bundle and makes it available globally

import { Buffer } from 'buffer';

export {}; // Make this file a module to allow top-level await

// Set a flag to indicate we're in browser environment
(window as any).__STELLAR_SDK_BROWSER_TEST__ = true;

// Polyfill for Node.js global object that some packages expect
if (typeof global === "undefined") {
  (window as any).global = window;
}

// Make Buffer available globally
(window as any).Buffer = Buffer;

// Try to load different bundle variants in order of preference
const bundleVariants = [
  "stellar-sdk-minimal",
  "stellar-sdk-no-axios",
  "stellar-sdk-no-eventsource",
  "stellar-sdk",
];

let bundleLoaded = false;
let lastError: Error | null = null;

await Promise.all(
  bundleVariants.map(async (bundleName) => {
    if (bundleLoaded) return;
    try {
      const script = document.createElement("script");
      script.src = `/dist/${bundleName}.js`;
      script.type = "text/javascript";
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          if (typeof (window as any).StellarSdk !== "undefined") {
            bundleLoaded = true;
            resolve();
          } else {
            reject(new Error(`StellarSdk not found in ${bundleName} bundle`));
          }
        };
        script.onerror = () =>
          reject(new Error(`Failed to load script for ${bundleName}`));
      });
    } catch (error) {
      lastError = error as Error;
      // Remove the failed script
      const scripts = document.querySelectorAll(
        `script[src="/dist/${bundleName}.js"]`,
      );
      scripts.forEach((script) => script.remove());
    }
  }),
);

// Verify that StellarSdk is available globally
if (!bundleLoaded) {
  throw new Error(
    `Failed to load any StellarSdk bundle. Last error: ${lastError ? (lastError as Error).message : "Unknown error"}`,
  );
}
