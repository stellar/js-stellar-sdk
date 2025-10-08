import { CallBuilder } from "./call_builder";
import { HttpClient } from "../http-client";

export class FriendbotBuilder extends CallBuilder<any> {
  constructor(serverUrl: URI, httpClient: HttpClient, address: string) {
    super(serverUrl, httpClient);
    this.url.segment("friendbot");
    this.url.setQuery("addr", address);
  }
}
