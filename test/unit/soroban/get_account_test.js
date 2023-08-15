describe('Server#getAccount', function () {
  const { Account, StrKey, xdr } = SorobanClient;

  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('requests the correct method', function (done) {
    const address = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';
    const accountId = xdr.PublicKey.publicKeyTypeEd25519(
      StrKey.decodeEd25519PublicKey(address)
    );

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [
            xdr.LedgerKey.account(
              new xdr.LedgerKeyAccount({
                accountId
              })
            ).toXDR('base64')
          ]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: [
                {
                  xdr: 'AAAAAAAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1g3gtpoE608YAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAQAAAAAY9D8iA'
                }
              ]
            }
          }
        })
      );

    const expected = new Account(address, '1');
    this.server
      .getAccount(address)
      .then(function (response) {
        expect(response).to.be.deep.equal(expected);
        done();
      })
      .catch(done);
  });

  it('throws a useful error when the account is not found', function (done) {
    const address = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';
    const accountId = xdr.PublicKey.publicKeyTypeEd25519(
      StrKey.decodeEd25519PublicKey(address)
    );

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [
            xdr.LedgerKey.account(
              new xdr.LedgerKeyAccount({
                accountId
              })
            ).toXDR('base64')
          ]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: null
            }
          }
        })
      );

    this.server
      .getAccount(address)
      .then(function (_) {
        done(new Error('Expected error to be thrown'));
      })
      .catch(function (err) {
        done(
          err.message === `Account not found: ${address}`
            ? null
            : new Error(`Received unexpected error: ${err.message}`)
        );
      });
  });
});
