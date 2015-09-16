import {CallBuilder} from "./call_builder";
import {OrderbookCallBuilder} from "./orderbook_call_builder";
import {BadRequestError} from "./errors";

/**
* @class OfferCallBuilder
*/
export class OfferCallBuilder extends CallBuilder {
    /*
    * @constructor
    */
    constructor(url, resource, ...resourceParams) {
        super(url);
        if (resource === 'accounts') {
            this.url.segment([resource, ...resourceParams, 'offers']);
        } else {
            throw new BadRequestError("Bad resource specified for offer:", resource);
        }
    }

}
