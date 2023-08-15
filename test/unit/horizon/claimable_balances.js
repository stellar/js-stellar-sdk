describe('ClaimableBalanceCallBuilder', function () {
  beforeEach(function () {
    this.server = new StellarSdk.Server(
      'https://horizon-live.stellar.org:1337'
    );
    this.axiosMock = sinon.mock(AxiosClient);
    StellarSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('requests the correct endpoint', function (done) {
    let singleBalanceResponse = {
      _links: {
        self: {
          href: 'horizon-live.stellar.org:1337/claimable_balances/00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072'
        }
      },
      id: '00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072',
      asset: 'native',
      amount: '200.0000000',
      sponsor: 'GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL',
      last_modified_ledger: 38888,
      claimants: [
        {
          destination:
            'GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL',
          predicate: {
            unconditional: true
          }
        }
      ],
      paging_token:
        '38888-00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072'
    };

    this.axiosMock
      .expects('get')
      .withArgs(
        sinon.match(
          'https://horizon-live.stellar.org:1337/claimable_balances/00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072'
        )
      )
      .returns(Promise.resolve({ data: singleBalanceResponse }));

    this.server
      .claimableBalances()
      .claimableBalance(
        '00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072'
      )
      .call()
      .then(function (response) {
        expect(response).to.be.deep.equal(singleBalanceResponse);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('adds a "sponsor" query to the endpoint', function (done) {
    const data = {
      _links: {
        self: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        next: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        prev: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc'
        }
      },
      _embedded: {
        records: []
      }
    };

    this.axiosMock
      .expects('get')
      .withArgs(
        sinon.match(
          'https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD'
        )
      )
      .returns(Promise.resolve({ data }));

    this.server
      .claimableBalances()
      .sponsor('GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')
      .call()
      .then(function (response) {
        expect(response.next).to.be.a('function');
        expect(response.prev).to.be.a('function');
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('adds a "claimant" query to the endpoint', function (done) {
    const data = {
      _links: {
        self: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        next: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        prev: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc'
        }
      },
      _embedded: {
        records: []
      }
    };

    this.axiosMock
      .expects('get')
      .withArgs(
        sinon.match(
          'https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD'
        )
      )
      .returns(Promise.resolve({ data }));

    this.server
      .claimableBalances()
      .claimant('GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD')
      .call()
      .then(function (response) {
        expect(response.next).to.be.a('function');
        expect(response.prev).to.be.a('function');
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('adds an "asset" query to the endpoint', function (done) {
    const data = {
      _links: {
        self: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        next: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc'
        },
        prev: {
          href: 'https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc'
        }
      },
      _embedded: {
        records: []
      }
    };

    this.axiosMock
      .expects('get')
      .withArgs(
        sinon.match(
          'https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD'
        )
      )
      .returns(Promise.resolve({ data }));

    this.server
      .claimableBalances()
      .asset(
        new StellarSdk.Asset(
          'USD',
          'GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD'
        )
      )
      .call()
      .then(function (response) {
        expect(response.next).to.be.a('function');
        expect(response.prev).to.be.a('function');
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
