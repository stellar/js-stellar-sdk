import { CallBuilder } from "./call_builder";

export class FriendbotBuilder extends CallBuilder<any> {
  constructor(serverUrl: URI, address: string) {
    super(serverUrl);
    this.segment("friendbot");
    this.url.searchParams.set("addr", address);
  }
}
