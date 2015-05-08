
export class ResultPage {

    /**
    * A page of a result collection.
    * @param {object} json - The response JSON from Horizon.
    */
    constructor(json) {
        this.records = json._embedded.records;
        this.next = json._links.next.href;
        // this.prev = json._links.prev.href;
        // this.prev = json._links.previous.href;
    }
}