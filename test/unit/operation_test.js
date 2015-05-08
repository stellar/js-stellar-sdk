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
            expect(op.toXDR("hex").toString()).to.be.equal("0000000000000000899b2840ed5636c56ddc5f14b23975f79f1ba2388d2694e4c56ecdddc960e5ef0000000155534400cd4eb80f3b5f4ed04b2762349cdf7df25862ca115c4bcaed647ca8c228ecfd7b00000000000003e80000002000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e8");
        });
    });

    describe(".changeTrust()", function () {
        it("creates a changeTrustOp", function () {
            let currency = new StellarLib.Currency("USD", "gsZRJCfkv69PBw1Cz8qJfb9k4i3EXiJenxdrYKCog3mWbk5thPb");
            let op = StellarLib.Operation.changeTrust({currency: currency});
            expect(op.toXDR("hex").toString()).to.be.equal("00000000000000030000000155534400cd4eb80f3b5f4ed04b2762349cdf7df25862ca115c4bcaed647ca8c228ecfd7b7fffffffffffffff");
        });
    });
});