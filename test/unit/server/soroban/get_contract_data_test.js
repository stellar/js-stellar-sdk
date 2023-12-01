const { Address, xdr, nativeToScVal, hash } = StellarSdk;
const { Server, AxiosClient, Durability } = StellarSdk.SorobanRpc;

describe('Server#getContractData', function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const address = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5';
  const key = nativeToScVal(['Admin']);

  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new xdr.ExtensionPoint(0),
      contract: new Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key,
      val: key // lazy
    })
  );

  // the key is a subset of the val
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntry.contractData().contract(),
      durability: ledgerEntry.contractData().durability(),
      key: ledgerEntry.contractData().key()
    })
  );

  const ledgerTtlEntry = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(ledgerKey.toXDR()),
      liveUntilLedgerSeq: 1000
    })
  );

  it('contract data key found', function (done) {
    let result = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry,
      liveUntilLedgerSeq: 1000
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [[ledgerKey.toXDR('base64')]]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  liveUntilLedgerSeq: ledgerTtlEntry.ttl().liveUntilLedgerSeq(),
                  lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
                  key: ledgerKey.toXDR('base64'),
                  xdr: ledgerEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );

    this.server
      .getContractData(address, key, Durability.Persistent)
      .then(function (response) {
        expect(response.key.toXDR('base64')).to.eql(result.key.toXDR('base64'));
        expect(response.val.toXDR('base64')).to.eql(result.val.toXDR('base64'));
        expect(response.liveUntilLedgerSeq).to.eql(1000);
        done();
      })
      .catch((err) => done(err));
  });

  it('contract data key not found', function (done) {
    // clone and change durability to test this case
    const ledgerKeyDupe = xdr.LedgerKey.fromXDR(ledgerKey.toXDR());
    ledgerKeyDupe
      .contractData()
      .durability(xdr.ContractDataDurability.temporary());

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [[ledgerKeyDupe.toXDR('base64')]]
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractData(address, key, Durability.Temporary)
      .then(function (_response) {
        done(new Error('Expected error'));
      })
      .catch(function (err) {
        done(
          err.code == 404
            ? null
            : new Error('Expected error code 404, got: ' + err.code)
        );
      });
  });

  it('fails on hex address (was deprecated now unsupported)', function (done) {
    let hexAddress = '0'.repeat(63) + '1';
    this.server
      .getContractData(hexAddress, key, Durability.Persistent)
      .then((reply) => done(new Error(`should fail, got: ${reply}`)))
      .catch((error) => {
        expect(error).to.contain(/unsupported contract id/i);
        done();
      });
  });
});
