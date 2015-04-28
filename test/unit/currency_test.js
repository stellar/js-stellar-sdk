describe('Currency', function() {

    describe("constructor", function () {

        it("throws an error when there's no issuer for non XLM type currency", function () {
            expect(() => new StellarLib.Currency("USD")).to.throw()
        });
    })

    describe("toXdrObject()", function () {
        it("parses a native currency object", function () {
            var currency = new StellarLib.Currency.native();
            var xdr = currency.toXdrObject();
            expect(xdr.toXDR().toString()).to.be.equal(new Buffer([0,0,0,0]).toString());
        });

        it("parses a ISO4217 currency object", function () {
            var currency = new StellarLib.Currency("USD", "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC");
            var xdr = currency.toXdrObject();
            expect(xdr.toXDR("hex").toString())
                .to.be.equal("0000000155534400899b2840ed5636c56ddc5f14b23975f79f1ba2388d2694e4c56ecdddc960e5ef");
        });
    });
});