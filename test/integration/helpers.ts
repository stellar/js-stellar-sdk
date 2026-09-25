import * as http from "http";

/**
 * Binds `server` to an OS-assigned free port and resolves with that port.
 *
 * These tests used to draw a random port and pass it to `listen`, which
 * collided often enough to fail CI. Port 0 cannot collide. The `error`
 * listener matters just as much: `listen` does not hand a bind failure to its
 * callback, it emits `error` — so a clash used to surface as an uncaught
 * exception plus a promise that never settled, and the test died on its
 * timeout instead of reporting the conflict.
 */
export function listenOnFreePort(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, () => {
      server.removeListener("error", reject);
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error(`expected a TCP address, got ${String(address)}`));
        return;
      }
      resolve(address.port);
    });
  });
}
