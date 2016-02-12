describe("server.js tests", function () {
  beforeEach(function () {
    this.server = new StellarSdk.Server('https://horizon-live.stellar.org:1337');
    this.axiosMock = sinon.mock(axios);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('Server._sendResourceRequest', function () {

    describe("requests all ledgers", function () {
      let ledgersResponse = {
        "_embedded": {
          "records": [
            {
              "_links": {
                "effects": {
                  "href": "/ledgers/1/effects{?cursor,limit,order}",
                  "templated": true
                },
                "operations": {
                  "href": "/ledgers/1/operations{?cursor,limit,order}",
                  "templated": true
                },
                "self": {
                  "href": "/ledgers/1"
                },
                "transactions": {
                  "href": "/ledgers/1/transactions{?cursor,limit,order}",
                  "templated": true
                }
              },
              "id": "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
              "paging_token": "4294967296",
              "hash": "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
              "sequence": 1,
              "transaction_count": 0,
              "operation_count": 0,
              "closed_at": "1970-01-01T00:00:00Z"
            }
          ]
        },
        "_links": {
          "next": {
            "href": "/ledgers?order=asc\u0026limit=1\u0026cursor=4294967296"
          },
          "prev": {
            "href": "/ledgers?order=desc\u0026limit=1\u0026cursor=4294967296"
          },
          "self": {
            "href": "/ledgers?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers'))
            .returns(Promise.resolve({data: ledgersResponse}));

          this.server.ledgers()
            .call()
            .then(response => {
              expect(response.records).to.be.deep.equal(ledgersResponse._embedded.records);
              expect(response.next).to.be.function;
              expect(response.prev).to.be.function;
              done();
            })
            .catch(function (err) {
              done(err);
            });
        })
      });

      describe("with options", function () {
        beforeEach(function() {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers?limit=1&cursor=b&order=asc'))
            .returns(Promise.resolve({data: ledgersResponse}));
        });

        it("requests the correct endpoint", function (done) {
          this.server.ledgers()
            .limit("1")
            .cursor("b")
            .order("asc")
            .call()
            .then(response => {
              expect(response.records).to.be.deep.equal(ledgersResponse._embedded.records);
              expect(response.next).to.be.function;
              expect(response.prev).to.be.function;
              done();
            })
        });

        it("can call .next() on the result to retrieve the next page", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers?order=asc&limit=1&cursor=4294967296'))
            .returns(Promise.resolve(({data: ledgersResponse})));

          this.server
            .ledgers()
            .limit("1")
            .cursor("b")
            .order("asc")
            .call()
            .then(function(page) {
              page.next().then(function(response) {
                expect(response.records).to.be.deep.equal(ledgersResponse._embedded.records);
                expect(response.next).to.be.function;
                expect(response.prev).to.be.function;
                done();
              });
            });
        });
      });

      describe("as stream", function () {
        it("attaches onmessage handler to an EventSource", function (done) {
          let eventSource = this.server.ledgers()
            .stream({
              onmessage: function (res) {
                eventSource.close();
                expect(res.test).to.be.equal("body");
                done();
              }
            });

          eventSource.onmessage({data: '{"test": "body"}'});
        });
      });
    });

    describe("requests a single ledger", function () {
      let singleLedgerResponse = {
        "_links": {
          "effects": {
            "href": "/ledgers/1/effects{?cursor,limit,order}",
            "templated": true
          },
          "operations": {
            "href": "/ledgers/1/operations{?cursor,limit,order}",
            "templated": true
          },
          "self": {
            "href": "/ledgers/1"
          },
          "transactions": {
            "href": "/ledgers/1/transactions{?cursor,limit,order}",
            "templated": true
          }
        },
        "id": "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
        "paging_token": "4294967296",
        "hash": "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
        "sequence": 1,
        "transaction_count": 0,
        "operation_count": 0,
        "closed_at": "1970-01-01T00:00:00Z"
      };

      describe("for a non existent ledger", function () {
        it("throws a NotFoundError", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/1'))
            .returns(Promise.reject({status: 404, data: {}}));

          this.server.ledgers()
            .ledger("1")
            .call()
            .then(function () {
              done("didn't throw an error");
            })
            .catch(StellarSdk.NotFoundError, function (err) {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      });
      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/1'))
            .returns(Promise.resolve({data: singleLedgerResponse}));

          this.server.ledgers()
            .ledger("1")
            .call()
            .then(function (response) {
              expect(response).to.be.deep.equal(singleLedgerResponse);
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });

      describe("with options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/1?limit=1&cursor=b&order=asc'))
            .returns(Promise.resolve({data: singleLedgerResponse}));

          this.server.ledgers()
            .ledger("1")
            .limit("1")
            .cursor("b")
            .order("asc")
            .call()
            .then(function (response) {
              expect(response).to.be.deep.equal(singleLedgerResponse);
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
    });

    describe("requests a sub resource", function (done) {
      let transactionsResponse = {
        "_embedded": {
          "records": [
            {
              "_links": {
                "account": {
                  "href": "/accounts/GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"
                },
                "effects": {
                  "href": "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3/effects{?cursor,limit,order}",
                  "templated": true
                },
                "ledger": {
                  "href": "/ledgers/34"
                },
                "operations": {
                  "href": "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3/operations{?cursor,limit,order}",
                  "templated": true
                },
                "precedes": {
                  "href": "/transactions?cursor=146028892160\u0026order=asc"
                },
                "self": {
                  "href": "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3"
                },
                "succeeds": {
                  "href": "/transactions?cursor=146028892160\u0026order=desc"
                }
              },
              "id": "991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3",
              "paging_token": "146028892160",
              "hash": "991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3",
              "ledger": 34,
              "created_at": "2015-09-29T23:38:10Z",
              "account": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
              "account_sequence": 1,
              "max_fee": 0,
              "fee_paid": 0,
              "operation_count": 1,
              "result_code": 0,
              "result_code_s": "tx_success",
              "envelope_xdr": "AAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3AAAAZAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAZc2EuuEa2W1PAKmaqVquHuzUMHaEiRs//+ODOfgWiz8AAFrzEHpAAAAAAAAAAAABVvwF9wAAAECdBs6M1RCYGMBFKqFb4hmJ3wafkfSE8oXELydY/U1VBmfHcr6QtHmRPgAhkf5dUBwHigKhNKcpvb6v66ClyGoN",
              "result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAA=",
              "result_meta_xdr": "AAAAAAAAAAEAAAACAAAAAAAAACIAAAAAAAAAAGXNhLrhGtltTwCpmqlarh7s1DB2hIkbP//jgzn4Fos/AABa8xB6QAAAAAAiAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAAACIAAAAAAAAAAGL8HQvQkbK2HA3WVjRrKmjX00fG8sLI7m0ERwJW/AX3DeBbwJbpv5wAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA"
            }
          ]
        },
        "_links": {
          "next": {
            "href": "/transactions?order=asc\u0026limit=1\u0026cursor=146028892160"
          },
          "prev": {
            "href": "/transactions?order=desc\u0026limit=1\u0026cursor=146028892160"
          },
          "self": {
            "href": "/transactions?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/1/transactions'))
            .returns(Promise.resolve({data: transactionsResponse}));

          this.server.transactions()
            .forLedger("1")
            .call()
            .then(function (response) {
              expect(response.records).to.be.deep.equal(transactionsResponse._embedded.records);
              expect(response.next).to.be.function;
              expect(response.prev).to.be.function;
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
      describe("with options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock.expects('get')
            .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/1/transactions?cursor=b&limit=1&order=asc'))
            .returns(Promise.resolve({data: transactionsResponse}));

          this.server.transactions()
            .forLedger("1")
            .cursor("b")
            .limit("1")
            .order("asc")
            .call()
            .then(function (response) {
              expect(response.records).to.be.deep.equal(transactionsResponse._embedded.records);
              expect(response.next).to.be.function;
              expect(response.prev).to.be.function;
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
      describe("as stream", function () {
        it("attaches onmessage handler to an EventSource", function (done) {
          var eventSource = this.server.transactions()
            .forLedger("1")
            .stream({
              onmessage: function (res) {
                eventSource.close();
                expect(res.test).to.be.equal("body");
                done();
              }
            });

          eventSource.onmessage({data: '{"test": "body"}'});
        });
      });
    });
  });

  describe('Server.submitTransaction', function() {
    it("sends a transaction", function(done) {
      let keypair = StellarSdk.Keypair.random();
      let account = new StellarSdk.Account(keypair.accountId(), "56199647068161");
      let transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.payment({
          destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: StellarSdk.Asset.native(),
          amount: "100.50"
        }))
        .build();
      transaction.sign(keypair)

      let blob = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
      this.axiosMock.expects('post')
        .withArgs('https://horizon-live.stellar.org:1337/transactions', `tx=${blob}`)
        .returns(Promise.resolve({data: {}}));

      this.server.submitTransaction(transaction)
        .then(function() {
          done();
        })
        .catch(function (err) {
          done(err);
        })
    });
  });

  describe("Server._parseResult", function () {
    it("creates link functions", function () {
      var callBuilder = this.server.ledgers();
      var json = callBuilder._parseResponse({
        "_links": {
          "test": function () {
            return "hi";
          }
        }
      });
      expect(typeof json.test).to.be.equal("function");
    });
  });

  describe("Smoke tests for the rest of the builders", function() {
    describe("AccountCallBuilder", function() {
      let singleAccountResponse = {
        "_links": {
          "effects": {
            "href": "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/effects{?cursor,limit,order}",
            "templated": true
          },
          "offers": {
            "href": "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/offers{?cursor,limit,order}",
            "templated": true
          },
          "operations": {
            "href": "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/operations{?cursor,limit,order}",
            "templated": true
          },
          "self": {
            "href": "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
          },
          "transactions": {
            "href": "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/transactions{?cursor,limit,order}",
            "templated": true
          }
        },
        "id": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
        "paging_token": "146028892161",
        "account_id": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
        "sequence": 146028888090,
        "subentry_count": 0,
        "inflation_destination": null,
        "home_domain": "",
        "thresholds": {
          "low_threshold": 0,
          "med_threshold": 0,
          "high_threshold": 0
        },
        "flags": {
          "auth_required": false,
          "auth_revocable": false
        },
        "balances": [
          {
            "asset_type": "native",
            "balance": "9760000.3997400"
          }
        ],
        "signers": [
          {
            "public_key": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
            "weight": 1
          }
        ]
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K'))
          .returns(Promise.resolve({data: singleAccountResponse}));

        this.server.accounts()
          .accountId("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(singleAccountResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("OfferCallBuilder", function() {
      let offersResponse = {
        "_embedded": {
          "records": []
        },
        "_links": {
          "next": {
            "href": "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/offers?order=asc\u0026limit=10\u0026cursor="
          },
          "prev": {
            "href": "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/offers?order=desc\u0026limit=10\u0026cursor="
          },
          "self": {
            "href": "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/offers?order=asc\u0026limit=10\u0026cursor="
          }
        }
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/offers?order=asc'))
          .returns(Promise.resolve({data: offersResponse}));

        this.server.offers('accounts', "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(offersResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("rejects the wrong resource", function(done) {
        expect(() => this.server.offers('ledgers', '123').call()).to.throw(/Bad resource specified/);
        done();
      });
    });

    describe("OrderbookCallBuilder", function() {
      let orderBookResponse = {
        "bids": [],
        "asks": [],
        "base": {
          "asset_type": "native",
          "asset_code": "",
          "asset_issuer": ""
        },
        "counter": {
          "asset_type": "credit_alphanum4",
          "asset_code": "USD",
          "asset_issuer": "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
        }
      };

      it("requests the correct endpoint native/credit", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/order_book?selling_asset_type=native&buying_asset_type=credit_alphanum4&buying_asset_code=USD&buying_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG'))
          .returns(Promise.resolve({data: orderBookResponse}));

        this.server.orderbook(StellarSdk.Asset.native(), new StellarSdk.Asset('USD', "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"))
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(orderBookResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("requests the correct endpoint credit/native", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/order_book?selling_asset_type=credit_alphanum4&selling_asset_code=USD&selling_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG&buying_asset_type=native'))
          .returns(Promise.resolve({data: orderBookResponse}));

        this.server.orderbook(new StellarSdk.Asset('USD', "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"), StellarSdk.Asset.native())
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(orderBookResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("trades() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/order_book/trades?selling_asset_type=native&buying_asset_type=credit_alphanum4&buying_asset_code=USD&buying_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG'))
          .returns(Promise.resolve({data: orderBookResponse}));

        this.server.orderbook(StellarSdk.Asset.native(), new StellarSdk.Asset('USD', "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"))
          .trades()
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(orderBookResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("PathsCallBuilder", function() {
      let pathsResponse = {
        "_embedded": {
            "records": [
                {
                    "destination_amount": "20.0000000",
                    "destination_asset_code": "EUR",
                    "destination_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "destination_asset_type": "credit_alphanum4",
                    "path": [],
                    "source_amount": "30.0000000",
                    "source_asset_code": "USD",
                    "source_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "source_asset_type": "credit_alphanum4"
                },
                {
                    "destination_amount": "20.0000000",
                    "destination_asset_code": "EUR",
                    "destination_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "destination_asset_type": "credit_alphanum4",
                    "path": [
                        {
                            "asset_code": "1",
                            "asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                            "asset_type": "credit_alphanum4"
                        }
                    ],
                    "source_amount": "20.0000000",
                    "source_asset_code": "USD",
                    "source_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "source_asset_type": "credit_alphanum4"
                },
                {
                    "destination_amount": "20.0000000",
                    "destination_asset_code": "EUR",
                    "destination_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "destination_asset_type": "credit_alphanum4",
                    "path": [
                        {
                            "asset_code": "21",
                            "asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                            "asset_type": "credit_alphanum4"
                        },
                        {
                            "asset_code": "22",
                            "asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                            "asset_type": "credit_alphanum4"
                        }
                    ],
                    "source_amount": "20.0000000",
                    "source_asset_code": "USD",
                    "source_asset_issuer": "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                    "source_asset_type": "credit_alphanum4"
                }        ]
        },
        "_links": {
            "self": {
                "href": "/paths"
            }
        }
      };

    it("requests the correct endpoint", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://horizon-live.stellar.org:1337/paths?destination_account=GAEDTJ4PPEFVW5XV2S7LUXBEHNQMX5Q2GM562RJGOQG7GVCE5H3HIB4V&source_account=GARSFJNXJIHO6ULUBK3DBYKVSIZE7SC72S5DYBCHU7DKL22UXKVD7MXP&destination_amount=20.0&destination_asset_type=credit_alphanum4&destination_asset_code=EUR&destination_asset_issuer=GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN'))
        .returns(Promise.resolve({data: pathsResponse}));

      this.server.paths("GARSFJNXJIHO6ULUBK3DBYKVSIZE7SC72S5DYBCHU7DKL22UXKVD7MXP","GAEDTJ4PPEFVW5XV2S7LUXBEHNQMX5Q2GM562RJGOQG7GVCE5H3HIB4V", new StellarSdk.Asset('EUR', 'GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN'), '20.0')
        .call()
        .then(function (response) {
          expect(response.records).to.be.deep.equal(pathsResponse._embedded.records);
          expect(response.next).to.be.function;
          expect(response.prev).to.be.function;
          done();
        })
      .catch(function (err) {
        done(err);
      })
    });
  });

    describe("EffectCallBuilder", function() {
      let effectsResponse = {
        "_embedded": {
          "records": [
            {
              "_links": {
                "operation": {
                  "href": "/operations/146028892161"
                },
                "precedes": {
                  "href": "/effects?cursor=146028892161-1\u0026order=asc"
                },
                "succeeds": {
                  "href": "/effects?cursor=146028892161-1\u0026order=desc"
                }
              },
              "account": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              "paging_token": "146028892161-1",
              "starting_balance": "10000000.0",
              "type": 0,
              "type_s": "account_created"
            }
          ]
        },
        "_links": {
          "next": {
            "href": "/effects?order=asc\u0026limit=1\u0026cursor=146028892161-1"
          },
          "prev": {
            "href": "/effects?order=desc\u0026limit=1\u0026cursor=146028892161-1"
          },
          "self": {
            "href": "/effects?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/effects?cursor=b'))
          .returns(Promise.resolve({data: effectsResponse}));

        this.server.effects()
          .cursor("b")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(effectsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/accounts/GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE/effects'))
          .returns(Promise.resolve({data: effectsResponse}));

        this.server.effects()
          .forAccount("GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(effectsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/transactions/ef37d6770c40c3bdb6adba80759f2819971396d1c3dfb7b5611f63ad72a9a4ae/effects'))
          .returns(Promise.resolve({data: effectsResponse}));

        this.server.effects()
          .forTransaction("ef37d6770c40c3bdb6adba80759f2819971396d1c3dfb7b5611f63ad72a9a4ae")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(effectsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("rejects two filters", function (done) {
        expect(() => this.server.effects().forOperation("blah").forLedger('234').call()).to.throw(/Too many filters/);
        done();
      });
    });

    describe("OperationCallBuilder", function() {
      let operationsResponse = {
        "_embedded": {
          "records": [
            {
              "_links": {
                "effects": {
                  "href": "/operations/146028892161/effects{?cursor,limit,order}",
                  "templated": true
                },
                "precedes": {
                  "href": "/operations?cursor=146028892161\u0026order=asc"
                },
                "self": {
                  "href": "/operations/146028892161"
                },
                "succeeds": {
                  "href": "/operations?cursor=146028892161\u0026order=desc"
                },
                "transaction": {
                  "href": "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3"
                }
              },
              "account": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              "funder": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
              "id": 146028892161,
              "paging_token": "146028892161",
              "starting_balance": "10000000.0",
              "type": 0,
              "type_s": "create_account"
            }
          ]
        },
        "_links": {
          "next": {
            "href": "/operations?order=asc\u0026limit=1\u0026cursor=146028892161"
          },
          "prev": {
            "href": "/operations?order=desc\u0026limit=1\u0026cursor=146028892161"
          },
          "self": {
            "href": "/operations?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("operation() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/operations/123456789'))
          .returns(Promise.resolve({data: operationsResponse}));

        this.server.operations()
          .operation("123456789")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(operationsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/accounts/GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE/operations'))
          .returns(Promise.resolve({data: operationsResponse}));

        this.server.operations()
          .forAccount("GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(operationsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forLedger() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/123456789/operations'))
          .returns(Promise.resolve({data: operationsResponse}));

        this.server.operations()
          .forLedger("123456789")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(operationsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/transactions/blah/operations'))
          .returns(Promise.resolve({data: operationsResponse}));

        this.server.operations()
          .forTransaction("blah")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(operationsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("PaymentCallBuilder", function() {
      let paymentsResponse = {
        "_embedded": {
          "records": [
            {
              "_links": {
                "effects": {
                  "href": "/operations/146028892161/effects{?cursor,limit,order}",
                  "templated": true
                },
                "precedes": {
                  "href": "/operations?cursor=146028892161\u0026order=asc"
                },
                "self": {
                  "href": "/operations/146028892161"
                },
                "succeeds": {
                  "href": "/operations?cursor=146028892161\u0026order=desc"
                },
                "transaction": {
                  "href": "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3"
                }
              },
              "account": "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              "funder": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
              "id": 146028892161,
              "paging_token": "146028892161",
              "starting_balance": "10000000.0",
              "type": 0,
              "type_s": "create_account"
            }
          ]
        },
        "_links": {
          "next": {
            "href": "/payments?order=asc\u0026limit=1\u0026cursor=146028892161"
          },
          "prev": {
            "href": "/payments?order=desc\u0026limit=1\u0026cursor=146028892161"
          },
          "self": {
            "href": "/payments?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/payments'))
          .returns(Promise.resolve({data: paymentsResponse}));

        this.server.payments()
          .forAccount("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(paymentsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forLedger() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/ledgers/123456789/payments'))
          .returns(Promise.resolve({data: paymentsResponse}));

        this.server.payments()
          .forLedger("123456789")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(paymentsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/transactions/77277606902d80a03a892536ebff8466726a4e55c3923ec2d3eeb3aa5bdc3731/payments'))
          .returns(Promise.resolve({data: paymentsResponse}));

        this.server.payments()
          .forTransaction("77277606902d80a03a892536ebff8466726a4e55c3923ec2d3eeb3aa5bdc3731")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(paymentsResponse._embedded.records);
            expect(response.next).to.be.function;
            expect(response.prev).to.be.function;
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("FriendbotCallBuilder", function() {
      let friendbotResponse = {
        "ledger": 2
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock.expects('get')
          .withArgs(sinon.match('https://horizon-live.stellar.org:1337/friendbot?addr=GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K'))
          .returns(Promise.resolve({data: friendbotResponse}));

        this.server.friendbot("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .call()
          .then(function (response) {
            expect(response.ledger).to.be.equal(friendbotResponse.ledger);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
  })
});
