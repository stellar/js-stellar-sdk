import type { Server } from "node:net";

/** Listens on a free port and returns it. */
export async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("test server has no TCP port");
  }
  return address.port;
}
