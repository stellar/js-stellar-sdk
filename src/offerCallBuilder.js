import {CallBuilder} from "./callBuilder";
import {OrderbookCallBuilder} from "./orderbookCallBuilder";
import {BadRequestError} from "./errors";
let URI = require("URIjs");

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
        } 
        // else if (resource === 'orderbook') {
        //     let orderbook_caller = new OrderbookCallBuilder(URI(this.url), ...resourceParams);
        //     this.url = URI(orderbook_caller.url.segment(['orderbook', 'offers']));
        // }
        else {
            throw new BadRequestError("Bad resource specified for offer:", resource);
        }
    }

}
