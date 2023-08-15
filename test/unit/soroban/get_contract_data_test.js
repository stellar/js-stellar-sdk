const xdr = SorobanClient.xdr;
const Address = SorobanClient.Address;

describe('Server#getContractData', function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let address = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5';
  let key = SorobanClient.xdr.ScVal.scvVec([
    SorobanClient.xdr.ScVal.scvSymbol('Admin')
  ]);

  it('key found', function (done) {
    let result = {
      id: address,
      sequence: '1'
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [
            xdr.LedgerKey.contractData(
              new xdr.LedgerKeyContractData({
                contract: new SorobanClient.Contract(address)
                  .address()
                  .toScAddress(),
                key,
                durability: xdr.ContractDataDurability.persistent(),
                bodyType: xdr.ContractEntryBodyType.dataEntry()
              })
            ).toXDR('base64')
          ]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: [result]
            }
          }
        })
      );

    this.server
      .getContractData(address, key, 'persistent')
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('key not found', function (done) {
    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [
            xdr.LedgerKey.contractData(
              new xdr.LedgerKeyContractData({
                contract: new SorobanClient.Contract(address)
                  .address()
                  .toScAddress(),
                key,
                durability: xdr.ContractDataDurability.temporary(),
                bodyType: xdr.ContractEntryBodyType.dataEntry()
              })
            ).toXDR('base64')
          ]
        ]
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractData(address, key, 'temporary')
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
      .getContractData(hexAddress, key, 'persistent')
      .then((reply) => done(new Error(`should fail, got: ${reply}`)))
      .catch((error) => {
        expect(error).to.contain(/unsupported contract id/i);
        done();
      });
  });
});
