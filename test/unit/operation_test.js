describe('Operation', function() {

    describe(".payment()", function () {
        it("creates a paymentOp", function () {
            var destination = "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC";
            var amount = 1000;
            var currency = new StellarLib.Currency("USD", "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb");
            let op = StellarLib.Operation.payment({
                destination: destination,
                currency: currency,
                amount: amount
            });
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("payment");
            expect(obj.destination).to.be.equal(destination);
            expect(Number(obj.amount)).to.be.equal(amount);
            expect(obj.currency.equals(currency)).to.be.true;
        });
    });

    describe(".changeTrust()", function () {
        it("creates a changeTrustOp", function () {
            let currency = new StellarLib.Currency("USD", "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb");
            let op = StellarLib.Operation.changeTrust({currency: currency});
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("changeTrust");
            expect(obj.line.equals(currency)).to.be.true;
        });
    });

    describe(".allowTrust()", function () {
        it("creates a allowTrustOp", function () {
            let trustor = "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb";
            let currencyCode = "USD";
            let authorize = true;
            let op = StellarLib.Operation.allowTrust({
                trustor: trustor,
                currencyCode: currencyCode,
                authorize: authorize
            });
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("allowTrust");
            expect(obj.trustor).to.be.equal(trustor);
            expect(obj.currencyCode).to.be.equal(currencyCode);
            expect(obj.authorize).to.be.equal(authorize);
        });
    });

    describe(".setOptions()", function () {
        it("creates a setOptionsOp", function () {
            var opts = {};
            opts.inflationDest = "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb";
            opts.clearFlags = 1;
            opts.setFlags = 1;
            opts.thresholds = {
                weight: 0,
                low: 1,
                medium: 2,
                high: 3
            };
            opts.signer = {
                address: "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb",
                weight: 1
            };
            opts.homeDomain = "www.example.com";
            let op = StellarLib.Operation.setOptions(opts);
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("setOptions");
            expect(obj.inflationDest).to.be.equal(opts.inflationDest);
            expect(obj.clearFlags).to.be.equal(opts.clearFlags);
            expect(obj.setFlags).to.be.equal(opts.setFlags);
            expect(obj.thresholds.weight).to.be.equal(opts.thresholds.weight);
            expect(obj.thresholds.low).to.be.equal(opts.thresholds.low);
            expect(obj.thresholds.medium).to.be.equal(opts.thresholds.medium);
            expect(obj.thresholds.high).to.be.equal(opts.thresholds.high);
            expect(obj.signer.address).to.be.equal(opts.signer.address);
            expect(obj.signer.weight).to.be.equal(opts.signer.weight);
            expect(obj.homeDomain).to.be.equal(opts.homeDomain);
        });
    });

    describe(".createOffer", function () {
        it("creates a createOfferOp", function () {
            var opts = {};
            opts.takerGets = new StellarLib.Currency("USD", "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb");
            opts.takerPays = new StellarLib.Currency("USD", "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb");
            opts.amount = 1000;
            opts.price = 3.07;
            opts.offerId = 1;
            let op = StellarLib.Operation.createOffer(opts);
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("createOffer");
            expect(obj.takerGets.equals(opts.takerGets)).to.be.true;
            expect(obj.takerPays.equals(opts.takerPays)).to.be.true;
            expect(Number(obj.amount)).to.be.equal(opts.amount);
            expect(obj.price).to.be.equal(opts.price);
            expect(Number(obj.offerId)).to.be.equal(opts.offerId);
        });
    });

    describe(".accountMerge", function () {
        it("creates a accountMergeOp", function () {
            var opts = {};
            opts.destination = "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb";
            let op = StellarLib.Operation.accountMerge(opts);
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("accountMerge");
            expect(obj.destination).to.be.equal(opts.destination);
        });
    });

    describe(".inflation", function () {
        it("creates a inflationOp", function () {
            let op = StellarLib.Operation.inflation();
            var xdr = op.toXDR("hex");
            var operation = StellarLib.xdr.Operation.fromXDR(new Buffer(xdr, "hex"));
            var obj = StellarLib.Operation.operationToObject(operation._attributes);
            expect(obj.type).to.be.equal("inflation");
        });
    });
});