import {Keypair} from "stellar-base";

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

    /**
    * Constructs a new Account given the master keypair.
    * @param {Keypair} master - The master keypair for the account.
    * @param {object} opts
    * @param {number} opts.seqNum - The account sequence number
    */
    constructor(master, opts={}) {
        this._masterKeypair = master;
        this.seqNum = opts.seqNum || 1;
    }

    get masterKeypair() {
        return this._masterKeypair;
    }

    set masterKeypair(keypair) {
        throw new Error("cannot set the master keypair, construct a new account");
    }
}
