import { CallBuilder } from "./call_builder.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

/**
 * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Horizon.Server.ledgers}.
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/list-all-ledgers | All Ledgers}
 *
 * @internal
 * @param serverUrl Horizon server URL.
 * @category Network / Horizon
 */
export class LedgerCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.LedgerRecord>
> {
  constructor(serverUrl: URL, httpClient: HttpClient) {
    super(serverUrl, httpClient);
    this.setPath("ledgers");
  }

  /**
   * Provides information on a single ledger.
   * @param sequence Ledger sequence
   * @returns current LedgerCallBuilder instance
   */
  public ledger(sequence: number | string): this {
    this.filter.push(["ledgers", sequence.toString()]);
    return this;
  }
}
