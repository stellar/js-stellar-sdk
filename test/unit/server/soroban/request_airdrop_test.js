const { Account, Keypair, StrKey, Networks, xdr, hash, nativeToScVal } =
  StellarSdk;
const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#requestAirdrop", function () {
  function accountLedgerEntryData(accountId, sequence) {
    return new xdr.LedgerEntryData.account(
      new xdr.AccountEntry({
        accountId: xdr.AccountId.publicKeyTypeEd25519(
          StrKey.decodeEd25519PublicKey(accountId),
        ),
        balance: xdr.Int64.fromString("1"),
        seqNum: xdr.SequenceNumber.fromString(sequence),
        numSubEntries: 0,
        inflationDest: null,
        flags: 0,
        homeDomain: "",
        // Taken from a real response. idk.
        thresholds: Buffer.from("AQAAAA==", "base64"),
        signers: [],
        ext: new xdr.AccountEntryExt(0),
      }),
    );
  }

  // Create a mock transaction meta for the account we're going to request an airdrop for
  function transactionMetaFor(accountId, sequence) {
    return new xdr.TransactionMeta(0, [
      new xdr.OperationMeta({
        changes: [
          xdr.LedgerEntryChange.ledgerEntryCreated(
            new xdr.LedgerEntry({
              lastModifiedLedgerSeq: 0,
              data: accountLedgerEntryData(accountId, sequence),
              ext: new xdr.LedgerEntryExt(0),
            }),
          ),
        ],
      }),
    ]);
  }

  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(this.server.httpClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  function mockGetNetwork(friendbotUrl) {
    const result = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getNetwork",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));
  }

  it("returns true when the account is created", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    const result_meta_xdr = transactionMetaFor(accountId, "1234").toXDR(
      "base64",
    );
    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { result_meta_xdr } }));

    this.server
      .requestAirdrop(accountId)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if the account already exists", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(
        Promise.reject({
          response: {
            status: 400,
            detail:
              "createAccountAlreadyExist (AAAAAAAAAGT/////AAAAAQAAAAAAAAAA/////AAAAAA=)",
          },
        }),
      );

    const accountKey = xdr.LedgerKey.account(
      new xdr.LedgerKeyAccount({
        accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
      }),
    );

    const ledgerTtlKey = xdr.LedgerKey.ttl(
      new xdr.LedgerKeyTtl({ keyHash: hash(accountKey.toXDR()) }),
    );

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [accountKey.toXDR("base64")] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: [
                {
                  key: accountKey.toXDR("base64"),
                  xdr: accountLedgerEntryData(accountId, "1234").toXDR(
                    "base64",
                  ),
                },
              ],
            },
          },
        }),
      );

    this.server
      .requestAirdrop(accountId)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("uses custom friendbotUrl if passed", function (done) {
    const friendbotUrl = "https://custom-friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const result_meta_xdr = transactionMetaFor(accountId, "1234").toXDR(
      "base64",
    );
    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { result_meta_xdr } }));

    this.server
      .requestAirdrop(accountId, friendbotUrl)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("rejects invalid addresses", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=addr%26injected%3D1`)
      .returns(
        Promise.reject({
          response: {
            status: 400,
            type: "https://stellar.org/horizon-errors/bad_request",
            title: "Bad Request",
            detail: "The request you sent was invalid in some way.",
            extras: {
              invalid_field: "addr",
              reason:
                "base32 decode failed: illegal base32 data at input byte 7",
            },
          },
        }),
      );

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.response.extras.reason).to.include("base32 decode failed");
        done();
      });
  });

  it("throws if there is no friendbotUrl set", function (done) {
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, undefined);

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.message).to.be.equal(
          "No friendbot URL configured for current network",
        );
        done();
      });
  });

  it("throws if the request fails", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.reject(new Error("Request failed")));

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.message).to.be.equal("Request failed");
        done();
      });
  });

  it("falls back to RPC if no meta is present", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { hash: "deadbeef" } }));

    const txResult = makeTxResult("SUCCESS");
    txResult.txHash = "deadbeef";
    txResult.resultMetaXdr = transactionMetaFor(accountId, "1234").toXDR(
      "base64",
    );

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: {
          hash: "deadbeef",
        },
      })
      .returns(Promise.resolve({ data: { result: txResult } }));

    this.server
      .requestAirdrop(accountId)
      .then((response) => {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch((err) => done(err));
  });
});

// ripped out of ./get_transaction_test.js
function makeTxResult(status, addSoroban = true) {
  const metaV3 = new xdr.TransactionMeta(
    3,
    new xdr.TransactionMetaV3({
      ext: new xdr.ExtensionPoint(0),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta: new xdr.SorobanTransactionMeta({
        ext: new xdr.SorobanTransactionMetaExt(0),
        events: [],
        diagnosticEvents: [],
        returnValue: nativeToScVal(1234),
      }),
    }),
  );

  // only injected in the success case
  //
  // this data was picked from a random transaction in horizon:
  // aa6a8e198abe53c7e852e4870413b29fe9ef04da1415a97a5de1a4ae489e11e2
  const successInfo = {
    ledger: 1234,
    createdAt: 123456789010,
    applicationOrder: 2,
    feeBump: false,
    envelopeXdr:
      "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
    resultXdr:
      "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
    resultMetaXdr: metaV3.toXDR("base64"),
  };

  if (!addSoroban) {
    // replace the V3 Soroban meta with a "classic" V2 version
    successInfo.resultMetaXdr =
      "AAAAAgAAAAIAAAADAtL5awAAAAAAAAAAS0CFMhOtWUKJWerx66zxkxORaiH6/3RUq7L8zspD5RoAAAAAAcm9QAKVkpMAAHpMAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAC0vi5AAAAAGTB02oAAAAAAAAAAQLS+WsAAAAAAAAAAEtAhTITrVlCiVnq8eus8ZMTkWoh+v90VKuy/M7KQ+UaAAAAAAHJvUAClZKTAAB6TQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL5awAAAABkwdd1AAAAAAAAAAEAAAAGAAAAAwLS+VQAAAACAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAAEySDkgAAAAAAAAAAkJVU0lORVNTAAAAAAAAAAC3JfDeo9vreItKNPoe74EkFIqWybeUQNFvLvURhHtskAAAAAAeQtHTL5f6TAAAXH0AAAAAAAAAAAAAAAAAAAABAtL5awAAAAIAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAAATJIOSAAAAAAAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAB5C0dNHf4CAAACLCQAAAAAAAAAAAAAAAAAAAAMC0vlUAAAAAQAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAAJCVVNJTkVTUwAAAAAAAAAAtyXw3qPb63iLSjT6Hu+BJBSKlsm3lEDRby71EYR7bJAAAAAAAABAL3//////////AAAAAQAAAAEAE3H3TnhnuQAAAAAAAAAAAAAAAAAAAAAAAAABAtL5awAAAAEAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAAAAQC9//////////wAAAAEAAAABABNx9J6Z4RkAAAAAAAAAAAAAAAAAAAAAAAAAAwLS+WsAAAAAAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAH37+zXQCXdRTAAASZAAAApIAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAABbBXKIigAAABhZWyiOAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL0awAAAABkwbqrAAAAAAAAAAEC0vlrAAAAAAAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAB9+/s10Al3UUwAAEmQAAAKSAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAWwVyiIoAAAAYWVsojgAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAALS9GsAAAAAZMG6qwAAAAAAAAAA";
  }

  return {
    status,
    txHash: "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8",
    latestLedger: 100,
    latestLedgerCloseTime: 12345,
    oldestLedger: 50,
    oldestLedgerCloseTime: 500,
    ...(status === "SUCCESS" && successInfo),
  };
}
