import {Keypair} from "js-stellar-base";

export class Account {

    static random() {
        let keypair =  Keypair.random();
        return new this(keypair);
    }

    static fromSeed(seed) {
        let keypair = Keypair.fromSeed(seed);
        return new this(keypair);
    }

    static fromAddress(address) {
        let keypair = Keypair.fromAddress(address);
        return new this(keypair);
    }

    static fromMaster() {
        let keypair = Keypair.master();
        return new this(keypair);
    }

    constructor(keypair) {
        this._keypair = keypair;
    }
}