/* tslint:disable: variable-name */
import { Asset } from "../base/index.js";
import { CallBuilder } from "./call_builder.js";
import { BadRequestError } from "../errors/index.js";
import { HorizonApi } from "./horizon_api.js";
import { ServerApi } from "./server_api.js";
import type { HttpClient } from "../http-client/index.js";

const allowedResolutions = [
  60000, 300000, 900000, 3600000, 86400000, 604800000,
];

/**
 * Trade Aggregations facilitate efficient gathering of historical trade data.
 *
 * Do not create this object directly, use {@link Horizon.Server.tradeAggregation}.
 *
 * @internal
 *
 * @param serverUrl - serverUrl Horizon server URL.
 * @param base - base asset
 * @param counter - counter asset
 * @param start_time - lower time boundary represented as millis since epoch
 * @param end_time - upper time boundary represented as millis since epoch
 * @param resolution - segment duration as millis since epoch. *Supported values are 1 minute (60000), 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
 * @param offset - segments can be offset using this parameter. Expressed in milliseconds. *Can only be used if the resolution is greater than 1 hour. Value must be in whole hours, less than the provided resolution, and less than 24 hours.
 */
export class TradeAggregationCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<TradeAggregationRecord>
> {
  constructor(
    serverUrl: URL,
    httpClient: HttpClient,
    base: Asset,
    counter: Asset,
    start_time: number,
    end_time: number,
    resolution: number,
    offset: number,
  ) {
    super(serverUrl, httpClient);
    this.setPath("trade_aggregations");
    const baseIssuer = base.getIssuer();
    if (!base.isNative() && baseIssuer !== undefined) {
      this.url.searchParams.set("base_asset_type", base.getAssetType());
      this.url.searchParams.set("base_asset_code", base.getCode());
      this.url.searchParams.set("base_asset_issuer", baseIssuer);
    } else {
      this.url.searchParams.set("base_asset_type", "native");
    }
    const counterIssuer = counter.getIssuer();
    if (!counter.isNative() && counterIssuer !== undefined) {
      this.url.searchParams.set("counter_asset_type", counter.getAssetType());
      this.url.searchParams.set("counter_asset_code", counter.getCode());
      this.url.searchParams.set("counter_asset_issuer", counterIssuer);
    } else {
      this.url.searchParams.set("counter_asset_type", "native");
    }
    if (typeof start_time !== "number" || typeof end_time !== "number") {
      throw new BadRequestError("Invalid time bounds", [start_time, end_time]);
    } else {
      this.url.searchParams.set("start_time", start_time.toString());
      this.url.searchParams.set("end_time", end_time.toString());
    }
    if (!this.isValidResolution(resolution)) {
      throw new BadRequestError("Invalid resolution", resolution);
    } else {
      this.url.searchParams.set("resolution", resolution.toString());
    }
    if (!this.isValidOffset(offset, resolution)) {
      throw new BadRequestError("Invalid offset", offset);
    } else {
      this.url.searchParams.set("offset", offset.toString());
    }
  }

  /**
   * @internal
   * @param resolution - Trade data resolution in milliseconds
   * @returns true if the resolution is allowed
   */
  private isValidResolution(resolution: number): boolean {
    return allowedResolutions.some((allowed) => allowed === resolution);
  }

  /**
   * @internal
   * @param offset - Time offset in milliseconds
   * @param resolution - Trade data resolution in milliseconds
   * @returns true if the offset is valid
   */
  private isValidOffset(offset: number, resolution: number): boolean {
    const hour = 3600000;
    return !(offset > resolution || offset >= 24 * hour || offset % hour !== 0);
  }
}

interface TradeAggregationRecord extends HorizonApi.BaseResponse {
  timestamp: number | string;
  trade_count: number | string;
  base_volume: string;
  counter_volume: string;
  avg: string;
  high: string;
  low: string;
  open: string;
  close: string;
}
