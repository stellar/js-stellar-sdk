import {CallBuilder} from "./call_builder";
import {OrderbookCallBuilder} from "./orderbook_call_builder";
import {BadRequestError} from "./errors";

/**
 * Creates a new {@link OfferCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#offers}.
 *
 * @see [Offers for Account](https://www.stellar.org/developers/horizon/reference/offers-for-account.html)
 * @class OfferCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {string} resource Resource to query offers
 * @param {...string} resourceParams Parameters for selected resource
 */
export class OfferCallBuilder extends CallBuilder {
    constructor(serverUrl, resource, ...resourceParams) {
        super(serverUrl);
        if (resource === 'accounts') {
            this.url.segment([resource, ...resourceParams, 'offers']);
        } else {
            throw new BadRequestError("Bad resource specified for offer:", resource);
        }
    }

}
