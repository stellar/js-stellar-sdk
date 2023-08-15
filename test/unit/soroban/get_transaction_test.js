describe('Server#getTransaction', function () {
  let keypair = SorobanClient.Keypair.random();
  let account = new SorobanClient.Account(
    keypair.publicKey(),
    '56199647068161'
  );

  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: SorobanClient.Networks.FUTURENET
    })
      .addOperation(
        SorobanClient.Operation.payment({
          destination:
            'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW',
          asset: SorobanClient.Asset.native(),
          amount: '100.50'
        })
      )
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString('hex');
    this.blob = transaction.toEnvelope().toXDR().toString('base64');
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('transaction not found', function (done) {
    const result = {
      status: 'NOT_FOUND',
      latestLedger: 100,
      latestLedgerCloseTime: 12345,
      oldestLedger: 50,
      oldestLedgerCloseTime: 500
    };
    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [this.hash]
      })
      .returns(Promise.resolve({ data: { id: 1, result } }));

    this.server.getTransaction(this.hash).then(function (response) {
      expect(response).to.be.deep.equal(result);
      done();
    });
  });

  xit('transaction pending', function (done) {});

  xit('transaction success', function (done) {});

  xit('transaction error', function (done) {});
});
