import { CallBuilder } from "./call_builder";
import { NotFoundError, NetworkError, BadRequestError } from "./errors";

const allowedResolutions = [60000, 300000, 900000, 3600000, 86400000, 604800000];

/**
 * Trade Aggregations facilitate efficient gathering of historical trade data.
 * Do not create this object directly, use {@link Server#tradeAggregation}.
 *
 * @class TradeAggregationCallBuilder
 * @extends CallBuilder
 * @constructor
 * @param {string} serverUrl serverUrl Horizon server URL.
 * @param {Asset} base base asset
 * @param {Asset} counter counter asset
 * @param {long} start_time lower time boundary represented as millis since epoch
 * @param {long} end_time upper time boundary represented as millis since epoch
 * @param {long} resolution segment duration as millis since epoch. *Supported values are 1 minute (60000), 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
 */
export class TradeAggregationCallBuilder extends CallBuilder {
  constructor (serverUrl, base, counter, start_time, end_time, resolution){
    super(serverUrl);
    
    this.url.segment('trade_aggregations');
    if (!base.isNative()) {
        this.url.addQuery("base_asset_type", base.getAssetType());
        this.url.addQuery("base_asset_code", base.getCode());
        this.url.addQuery("base_asset_issuer", base.getIssuer());
    } else {
        this.url.addQuery("base_asset_type", 'native');
    }
    if (!counter.isNative()) {
        this.url.addQuery("counter_asset_type", counter.getAssetType());
        this.url.addQuery("counter_asset_code", counter.getCode());
        this.url.addQuery("counter_asset_issuer", counter.getIssuer());
    } else {
        this.url.addQuery("counter_asset_type", 'native');
    }
    if ((typeof start_time === 'undefined') || (typeof end_time === 'undefined')) {
        throw new BadRequestError("Invalid time bounds", [start_time, end_time]);
    }else{
        this.url.addQuery("start_time", start_time);
        this.url.addQuery("end_time", end_time);
    }
    if (!this.isValidResolution(resolution)) {
        throw new BadRequestError("Invalid resolution", resolution);
    }else{
        this.url.addQuery("resolution", resolution);
    }


  }

  /**
   * @private
   * @param {long} resolution 
   */
  isValidResolution(resolution){
    let found = false;

    for (let i = 0; i < allowedResolutions.length; i++) {
        if (allowedResolutions[i] == resolution) {
            found = true;
            break;
        }       
    }
    return found;
  }

    
}
