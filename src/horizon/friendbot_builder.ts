import { CallBuilder } from "./call_builder.js";
import type { HttpClient } from "../http-client/index.js";

/** @category Network / Horizon */
export class FriendbotBuilder extends CallBuilder<any> {
  constructor(serverUrl: URL, httpClient: HttpClient, address: string) {
    super(serverUrl, httpClient);
    this.setPath("friendbot");
    this.url.searchParams.set("addr", address);
  }
}
