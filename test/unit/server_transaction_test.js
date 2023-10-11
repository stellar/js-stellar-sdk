const { Horizon } = StellarSdk;

describe("server.js transaction tests", function () {
  let keypair = StellarSdk.Keypair.random();
  let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(function () {
    this.server = new Horizon.Server("https://horizon-live.stellar.org:1337");
    this.axiosMock = sinon.mock(Horizon.AxiosClient);
    let transaction = new StellarSdk.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET,
      v1: true,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: StellarSdk.Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.blob = encodeURIComponent(
      transaction.toEnvelope().toXDR().toString("base64"),
    );
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("sends a transaction", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: {} }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("adds metadata - tx was too small and was immediately deleted", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/db2c69a07be57eb5baefbfbb72b95c7c20d2c4d6f2a0e84e7c27dd0359055a2f",
        },
      },
      hash: "db2c69a07be57eb5baefbfbb72b95c7c20d2c4d6f2a0e84e7c27dd0359055a2f",
      ledger: 22895637,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAjAAAAAQAAAAAAAAAAAAAAAFyIDdQAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAAAAAEAAAACAAAAAwAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQOJlnAnmSv1igsU/LjpXvuCqS/EcnM7oxgyk4ElnCwOz9YUEcvhXuc9GS2Sz1fMxsWvV9dHhmu3HvBrsphVl5A8=",
      result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAAAAAACAAAAAA==",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1cFQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACU4RoUgEH/OgAAAAiAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXVwVAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJThGhSAQf86AAAACMAAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAA=",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.an.instanceOf(Array);
        expect(res.offerResults[0].offersClaimed).to.be.an.instanceOf(Array);
        expect(typeof res.offerResults[0].effect).to.equal("string");
        expect(res.offerResults[0].wasImmediatelyFilled).to.equal(false);
        expect(res.offerResults[0].wasImmediatelyDeleted).to.equal(true);
        expect(res.offerResults[0].wasPartiallyFilled).to.equal(false);

        expect(res.offerResults[0].operationIndex).to.equal(0);
        expect(res.offerResults[0].amountBought).to.equal("0");
        expect(res.offerResults[0].amountSold).to.equal("0");
        expect(res.offerResults[0].currentOffer).to.equal(undefined);

        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("adds metadata, order immediately fills", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/d88ded94c558790f7e819b85fd35adb10a1e474312c34ebd611495c349a8eb69",
        },
      },
      hash: "d88ded94c558790f7e819b85fd35adb10a1e474312c34ebd611495c349a8eb69",
      ledger: 22895558,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAgAAAAAQAAAAAAAAAAAAAAAFyIDD0AAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAExLQAAAAABAAAAAgAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQHk3Igj+JXqggsJBFl4mrzgACqxWpx87psxu5UHnSskbwRjHZz89NycCZmJL4gN5WN7twm+wK371K9XcRNDiBwQ=",
      result_xdr:
        "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAEAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAABGaF7AAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAACj1/kAAAAAAAAAAAExLP8AAAACAAAAAA==",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1bxgAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACVLWWfQEH/OgAAAAfAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXVvGAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJUtZZ9AQf86AAAACAAAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAoAAAADAV1bvAAAAAIAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAABGaF7AAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAAAAAAgI3IsAEcNfQAmJaAAAAAAAAAAAAAAAAAAAAABAV1bxgAAAAIAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAABGaF7AAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAAAAAAff5ozAEcNfQAmJaAAAAAAAAAAAAAAAAAAAAADAV1bvAAAAAEAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAGBqVoPf/////////8AAAABAAAAAQAAAAgCpVDaAAAAAYGpWg8AAAAAAAAAAAAAAAEBXVvGAAAAAQAAAAB1m3A/FStIp4ybPiuwbAqUFZdVE0htPHeAmDCu9diR/AAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAYEFghZ//////////wAAAAEAAAABAAAACAKlUNoAAAABgQWCFgAAAAAAAAAAAAAAAwFdW7wAAAAAAAAAAHWbcD8VK0injJs+K7BsCpQVl1UTSG08d4CYMK712JH8AAAADqli73gA/DE6AAdSuQAAAAkAAAABAAAAADxBrcULUA9VGVPpmNzec+SrcyoIImWM4pkzHxrJ6RykAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAC22WAyQAAAA6LlZC2AAAAAAAAAAAAAAABAV1bxgAAAAAAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAOqpQcdwD8MToAB1K5AAAACQAAAAEAAAAAPEGtxQtQD1UZU+mY3N5z5KtzKggiZYzimTMfGsnpHKQAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAALaNFPKAAAADouVkLYAAAAAAAAAAAAAAAMBXVmCAAAAAQAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAAAAAB//////////wAAAAEAAAAAAAAAAAAAAAEBXVvGAAAAAQAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAACj1/l//////////wAAAAEAAAAAAAAAAAAAAAMBXVvGAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJUtZZ9AQf86AAAACAAAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFdW8YAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAlOEaX4BB/zoAAAAIAAAAAUAAAABAAAAAIQ/AS7GRUBBd96ykumKKUFE92+oiwRuJ7KXuvPwwTQWAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.an.instanceOf(Array);
        expect(res.offerResults[0].offersClaimed).to.be.an.instanceOf(Array);
        expect(typeof res.offerResults[0].effect).to.equal("string");
        expect(res.offerResults[0].wasImmediatelyFilled).to.equal(true);
        expect(res.offerResults[0].wasImmediatelyDeleted).to.equal(false);
        expect(res.offerResults[0].wasPartiallyFilled).to.equal(false);

        expect(res.offerResults[0].operationIndex).to.equal(0);
        expect(res.offerResults[0].amountSold).to.equal("1.9999999");

        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("adds metadata, order is open", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/e1c2b91141d8c4185dc8c18118f345a269d88c476bdadec695c1b3ecdc999831",
        },
      },
      hash: "e1c2b91141d8c4185dc8c18118f345a269d88c476bdadec695c1b3ecdc999831",
      ledger: 22896129,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAkAAAAAQAAAAAAAAAAAAAAAFyIF70AAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAACYloAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQJYfX7d9Cp609ChIRR5ONhCkSM2a1YLmi21rNLjcw5XFZg5R6Y3ZQ6kwVyJBcgqMwpH9F+NgoybKpepIIaXJiQs=",
      result_xdr:
        "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAARmp8YAAAAAAAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+EAAAAAAJiWgAAAAAEAAAABAAAAAAAAAAAAAAAA",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1eAQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACU4Rn7gEH/OgAAAAjAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXV4BAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJThGfuAQf86AAAACQAAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAUAAAADAV1cAgAAAAEAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAAAo9f5f/////////8AAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXV4BAAAAAQAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAACj1/l//////////wAAAAEAAAABAAAAAACYloAAAAAAAAAAAAAAAAAAAAAAAAAAAwFdXgEAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAlOEZ+4BB/zoAAAAJAAAAAUAAAABAAAAAIQ/AS7GRUBBd96ykumKKUFE92+oiwRuJ7KXuvPwwTQWAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAV1eAQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACU4Rn7gEH/OgAAAAkAAAABgAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAACYloAAAAAAAAAAAAAAAAABXV4BAAAAAgAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAAEZqfGAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAACYloAAAAABAAAAAQAAAAAAAAAAAAAAAA==",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.an.instanceOf(Array);
        expect(res.offerResults[0].offersClaimed).to.be.an.instanceOf(Array);
        expect(typeof res.offerResults[0].effect).to.equal("string");
        expect(res.offerResults[0].wasImmediatelyFilled).to.equal(false);
        expect(res.offerResults[0].amountBought).to.equal("0");
        expect(res.offerResults[0].wasImmediatelyDeleted).to.equal(false);
        expect(res.offerResults[0].wasPartiallyFilled).to.equal(false);
        expect(res.offerResults[0].isFullyOpen).to.equal(true);
        expect(res.offerResults[0].operationIndex).to.equal(0);

        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("adds metadata, partial fill", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/28552ba6a70ab74f6de05319950e2ddad94491159ebc97b14cfcde2d3c7e70a1",
        },
      },
      hash: "28552ba6a70ab74f6de05319950e2ddad94491159ebc97b14cfcde2d3c7e70a1",
      ledger: 22896525,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAlAAAAAQAAAAAAAAAAAAAAAFyIH7sAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAG1Y3jgATEtAAIv23wAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQBa4GPm0vQ/pR5lxfRczMADlKoVxExr68u0VH7VmoRwHELFA45YW2cHEZKnrecWvG0nBtsxHpTGxr1YAUG/A8wE=",
      result_xdr:
        "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAEAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAABGbAwwAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAACAVytcAAAAAAAAAADrciRgAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAARmwS8AAAAAAAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+EAAAAAMnxVIABMS0AAi/bfAAAAAAAAAAAAAAAA",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1fjQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACU4RnigEH/OgAAAAkAAAABgAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAACYloAAAAAAAAAAAAAAAAEBXV+NAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJThGeKAQf86AAAACUAAAAGAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAJiWgAAAAAAAAAAAAAAAAQAAAAsAAAADAV1fggAAAAAAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAOqpIVtwD8MToAB1MMAAAACQAAAAEAAAAAPEGtxQtQD1UZU+mY3N5z5KtzKggiZYzimTMfGsnpHKQAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAALPLm6gAAAADozEtvYAAAAAAAAAAAAAAAEBXV+NAAAAAAAAAAB1m3A/FStIp4ybPiuwbAqUFZdVE0htPHeAmDCu9diR/AAAAA7lbp7PAPwxOgAHUwwAAAAIAAAAAQAAAAA8Qa3FC1APVRlT6Zjc3nPkq3MqCCJljOKZMx8ayekcpAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAApRR5YgAAAAOjMS29gAAAAAAAAAAAAAAAwFdXgEAAAABAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+EAAAAAAKPX+X//////////AAAAAQAAAAEAAAAAAJiWgAAAAAAAAAAAAAAAAAAAAAAAAAABAV1fjQAAAAEAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAAguaLQf/////////8AAAABAAAAAQAAAAAcHZWpAAAAAAAAAAAAAAAAAAAAAAAAAAMBXV+NAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJThGeKAQf86AAAACUAAAAGAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAJiWgAAAAAAAAAAAAAAAAQFdX40AAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAhin3nIBB/zoAAAAJQAAAAcAAAABAAAAAIQ/AS7GRUBBd96ykumKKUFE92+oiwRuJ7KXuvPwwTQWAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAzFOugAAAAAAAAAAAAAAADAV1fggAAAAIAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAAABGbAwwAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAAAAAAgFcrXAIv23wBMS0AAAAAAAAAAAAAAAAAAAAACAAAAAgAAAAB1m3A/FStIp4ybPiuwbAqUFZdVE0htPHeAmDCu9diR/AAAAAAEZsDDAAAAAwFdX4IAAAABAAAAAHWbcD8VK0injJs+K7BsCpQVl1UTSG08d4CYMK712JH8AAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+EAAAABgQWCFn//////////AAAAAQAAAAEAAAAIIq08AgAAAAGBBYIVAAAAAAAAAAAAAAABAV1fjQAAAAEAAAAAdZtwPxUrSKeMmz4rsGwKlBWXVRNIbTx3gJgwrvXYkfwAAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAFg77c/f/////////8AAAABAAAAAQAAAAgirTwCAAAAAWDvtz4AAAAAAAAAAAAAAAABXV+NAAAAAgAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAAEZsEvAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAADJ8VSAATEtAAIv23wAAAAAAAAAAAAAAAA==",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.an.instanceOf(Array);
        expect(res.offerResults[0].offersClaimed).to.be.an.instanceOf(Array);
        expect(res.offerResults[0].offersClaimed).to.have.lengthOf(1);
        expect(res.offerResults[0].effect).to.equal("manageOfferCreated");
        expect(typeof res.offerResults[0].effect).to.equal("string");
        expect(res.offerResults[0].wasImmediatelyFilled).to.equal(false);
        expect(res.offerResults[0].amountBought).to.equal("53.8299095");
        expect(res.offerResults[0].wasImmediatelyDeleted).to.equal(false);
        expect(res.offerResults[0].wasPartiallyFilled).to.equal(true);
        expect(res.offerResults[0].isFullyOpen).to.equal(false);
        expect(res.offerResults[0].operationIndex).to.equal(0);
        expect(res.offerResults[0].currentOffer.selling.type).to.equal(
          "native",
        );
        expect(res.offerResults[0].currentOffer.buying.assetCode).to.equal(
          "BAT",
        );
        expect(res.offerResults[0].currentOffer.buying.issuer).to.equal(
          "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        );

        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("doesn't add metadata to non-offers", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/6c3191f252f2c586c74275c766ce761021513e520eab3bb63d3fd18d0d01492e",
        },
      },
      hash: "6c3191f252f2c586c74275c766ce761021513e520eab3bb63d3fd18d0d01492e",
      ledger: 22893969,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAeAAAAAQAAAAAAAAAAAAAAAFyH7EoAAAAAAAAAAQAAAAAAAAAGAAAAAUJUQwAAAAAAKTpjGpnWX8jImMrLprg+1nHJhiAVINNe+zSvg3bvNiUAAAAAAAAAAAAAAAAAAAABT0FB/wAAAEBDRFjJITX4LIIY2tc8KxVU3Pe7dqZ+BkWft93SCVlEXxiCHnoNop5UEKRoRTvAUh34I6As4IN/QpGGqHmbKv8F",
      result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAGAAAAAAAAAAA=",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1VkQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACVLWYcQEH/OgAAAAdAAAABgAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXVWRAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJUtZhxAQf86AAAAB4AAAAGAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAQAAAADAQpf6AAAAAEAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAABQlRDAAAAAAApOmMamdZfyMiYysumuD7WccmGIBUg0177NK+Ddu82JQAAAAAAAAAAf/////////8AAAABAAAAAAAAAAAAAAACAAAAAQAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAFCVEMAAAAAACk6YxqZ1l/IyJjKy6a4PtZxyYYgFSDTXvs0r4N27zYlAAAAAwFdVZEAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAlS1mHEBB/zoAAAAHgAAAAYAAAABAAAAAIQ/AS7GRUBBd96ykumKKUFE92+oiwRuJ7KXuvPwwTQWAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAV1VkQAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACVLWYcQEH/OgAAAAeAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.undefined;
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("adds metadata about offers, even if some ops are not", function (done) {
    const response = {
      _links: {
        transaction: {
          href: "https://horizon.stellar.org/transactions/6a22d6896140f6f330ef19086827df0780eb2ad3324f3271b38c70cb1cba1c3d",
        },
      },
      hash: "6a22d6896140f6f330ef19086827df0780eb2ad3324f3271b38c70cb1cba1c3d",
      ledger: 22894978,
      envelope_xdr:
        "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAABkAEH/OgAAAAfAAAAAQAAAAAAAAAAAAAAAFyIAGgAAAAAAAAABAAAAAAAAAAGAAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+F//////////wAAAAAAAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAUJBVAAAAAAARkrT28ebM6YQyhVZi1ttlwq/dk6ijTpyTNuHIMgUp+EAAAAAAAAAAQAmJaAAO4evAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAAAAAABACYloAA7h68AAAAAAAAAAAAAAAAAAAABT0FB/wAAAEBPLgxdQVWHP5g6YvkNgJV1j+2uj0aRIe+B2V/EwG40dSCbOOtuaOmX+pj0b7TTWK73/XUFbryZOFViAzHfkw4P",
      result_xdr:
        "AAAAAAAAAZAAAAAAAAAABAAAAAAAAAAGAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAADAAAAAAAAAAAAAAACAAAAAAAAAAMAAAAAAAAAAAAAAAIAAAAA",
      result_meta_xdr:
        "AAAAAQAAAAIAAAADAV1ZggAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACVLWW4QEH/OgAAAAeAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBXVmCAAAAAAAAAACFABFt40Ld/n20+pwgEgNf/EVnafXydsKMajx2T0FB/wAAAAJUtZbhAQf86AAAAB8AAAAFAAAAAQAAAACEPwEuxkVAQXfespLpiilBRPdvqIsEbieyl7rz8ME0FgAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAIAAAADAVqyvQAAAAEAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAAAAAAAf/////////8AAAABAAAAAAAAAAAAAAABAV1ZggAAAAEAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAABQkFUAAAAAABGStPbx5szphDKFVmLW22XCr92TqKNOnJM24cgyBSn4QAAAAAAAAAAf/////////8AAAABAAAAAAAAAAAAAAACAAAAAwFdWYIAAAAAAAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAAlS1luEBB/zoAAAAHwAAAAUAAAABAAAAAIQ/AS7GRUBBd96ykumKKUFE92+oiwRuJ7KXuvPwwTQWAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAV1ZggAAAAAAAAAAhQARbeNC3f59tPqcIBIDX/xFZ2n18nbCjGo8dk9BQf8AAAACVLWW4QEH/OgAAAAfAAAABQAAAAEAAAAAhD8BLsZFQEF33rKS6YopQUT3b6iLBG4nspe68/DBNBYAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res.offerResults).to.be.an.instanceOf(Array);
        expect(res.offerResults).to.have.lengthOf(2);
        expect(res.offerResults[0].offersClaimed).to.be.an.instanceOf(Array);
        expect(typeof res.offerResults[0].effect).to.equal("string");
        expect(res.offerResults[0].operationIndex).to.equal(2);
        expect(res.offerResults[1].offersClaimed).to.be.an.instanceOf(Array);
        expect(typeof res.offerResults[1].effect).to.equal("string");
        expect(res.offerResults[1].operationIndex).to.equal(3);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("checks for memo required by default", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: {} }));
    this.axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          "https://horizon-live.stellar.org:1337/accounts/GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
        ),
      )
      .returns(
        Promise.reject({
          response: { status: 404, statusText: "NotFound", data: {} },
        }),
      )
      .once();

    this.server
      .submitTransaction(this.transaction, { skipMemoRequiredCheck: false })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("submits fee bump transactions", function (done) {
    const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
      keypair,
      "200",
      this.transaction,
      StellarSdk.Networks.TESTNET,
    );

    this.blob = encodeURIComponent(
      feeBumpTx.toEnvelope().toXDR().toString("base64"),
    );

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: {} }));

    this.server
      .submitTransaction(feeBumpTx, { skipMemoRequiredCheck: true })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
