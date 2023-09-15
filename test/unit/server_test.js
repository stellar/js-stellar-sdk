const { HorizonServer } = StellarSdk;
const MockAdapter = require("axios-mock-adapter");

describe("server.js non-transaction tests", function () {
  beforeEach(function () {
    this.server = new HorizonServer("https://horizon-live.stellar.org:1337");
    this.axiosMock = sinon.mock(HorizonAxiosClient);
    StellarSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe("Server.constructor", function () {
    it("throws error for insecure server", function () {
      expect(
        () => new HorizonServer("http://horizon-live.stellar.org:1337")
      ).to.throw(/Cannot connect to insecure horizon server/);
    });

    it("allow insecure server when opts.allowHttp flag is set", function () {
      expect(
        () =>
          new HorizonServer("http://horizon-live.stellar.org:1337", {
            allowHttp: true
          })
      ).to.not.throw();
    });

    it("allow insecure server when global Config.allowHttp flag is set", function () {
      StellarSdk.Config.setAllowHttp(true);
      expect(
        () => new HorizonServer("http://horizon-live.stellar.org:1337")
      ).to.not.throw();
    });
  });

  describe("Server.fetchTimebounds", function () {
    let clock;

    beforeEach(function () {
      // set now to 10050 seconds
      clock = sinon.useFakeTimers(10050 * 1000);
      // use MockAdapter instead of this.axiosMock
      // because we don't want to replace the get function
      // we need to use axios's one so interceptors run!!
      this.axiosMockAdapter = new MockAdapter(HorizonAxiosClient);
    });

    afterEach(function () {
      clock.restore();
      this.axiosMockAdapter.restore();
    });

    // the next two tests are run in a deliberate order!!
    // don't change the order!!
    it("fetches falls back to local time if fetch is bad", function (done) {
      this.axiosMockAdapter
        .onGet("https://horizon-live.stellar.org:1337/")
        .reply(200, {}, {});

      this.server
        .fetchTimebounds(20)
        .then((serverTime) => {
          expect(serverTime).to.eql({ minTime: 0, maxTime: 10070 });
          done();
        })
        .catch((e) => {
          done(e);
        });
    });

    it("fetches if nothing is recorded", function (done) {
      this.axiosMockAdapter
        .onGet("https://horizon-live.stellar.org:1337/")
        .reply(
          200,
          {},
          {
            date: "Wed, 13 Mar 2019 22:15:07 GMT"
          }
        );

      this.server
        .fetchTimebounds(20)
        .then((serverTime) => {
          expect(serverTime).to.eql({
            minTime: 0,
            // this is server time 1552515307 plus 20
            maxTime: 1552515327
          });

          done();
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("Server.fetchBaseFee", function () {
    let response = {
      last_ledger: "256736",
      last_ledger_base_fee: "888",
      ledger_capacity_usage: "0.18",
      max_fee: {
        max: "2000",
        min: "100",
        mode: "2000",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "300",
        p50: "650",
        p60: "2000",
        p70: "2000",
        p80: "2000",
        p90: "2000",
        p95: "2000",
        p99: "2000"
      },
      fee_charged: {
        min: "100",
        max: "100",
        mode: "100",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "100",
        p50: "100",
        p60: "100",
        p70: "100",
        p80: "100",
        p90: "100",
        p95: "100",
        p99: "100"
      }
    };

    it("returns the base reserve", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(
          sinon.match("https://horizon-live.stellar.org:1337/fee_stats")
        )
        .returns(Promise.resolve({ data: response }));

      this.server
        .fetchBaseFee()
        .then((fee) => {
          expect(fee).to.be.equal(888);
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });

    it("returns default value (100) if last_ledger_base_fee is missing", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(
          sinon.match("https://horizon-live.stellar.org:1337/fee_stats")
        )
        .returns(Promise.resolve({ data: {} }));

      this.server
        .fetchBaseFee()
        .then((fee) => {
          expect(fee).to.be.equal(100);
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe("Server.feeStats", function () {
    let response = {
      last_ledger: "256736",
      last_ledger_base_fee: "100",
      ledger_capacity_usage: "0.18",
      max_fee: {
        max: "2000",
        min: "100",
        mode: "2000",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "300",
        p50: "650",
        p60: "2000",
        p70: "2000",
        p80: "2000",
        p90: "2000",
        p95: "2000",
        p99: "2000"
      },
      fee_charged: {
        min: "100",
        max: "100",
        mode: "100",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "100",
        p50: "100",
        p60: "100",
        p70: "100",
        p80: "100",
        p90: "100",
        p95: "100",
        p99: "100"
      }
    };

    it("returns the base reserve", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(
          sinon.match("https://horizon-live.stellar.org:1337/fee_stats")
        )
        .returns(Promise.resolve({ data: response }));

      this.server
        .feeStats()
        .then((feeStats) => {
          expect(feeStats).to.be.equal(response);
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe("Server.loadAccount", function () {
    //prettier-ignore
    let accountResponse = {
      "_links": {
        "self": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS"
        },
        "transactions": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS/transactions{?cursor,limit,order}",
          "templated": true
        },
        "operations": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS/operations{?cursor,limit,order}",
          "templated": true
        },
        "payments": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS/payments{?cursor,limit,order}",
          "templated": true
        },
        "effects": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS/effects{?cursor,limit,order}",
          "templated": true
        },
        "offers": {
          "href": "https://horizon-testnet.stellar.org/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS/offers{?cursor,limit,order}",
          "templated": true
        }
      },
      "id": "GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS",
      "paging_token": "5387216134082561",
      "account_id": "GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS",
      "sequence": "5387216134078475",
      "subentry_count": 5,
      "thresholds": {
        "low_threshold": 0,
        "med_threshold": 0,
        "high_threshold": 0
      },
      "flags": {
        "auth_required": false,
        "auth_revocable": false,
        "auth_immutable": false,
        "auth_clawback_enabled": false
      },
      "balances": [
        {
          "liquidity_pool_id": "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
          "asset_type": "liquidity_pool_shares",
          "balance": "10",
          "limit": "10000",
          "last_modified_ledger": 7877447,
          "is_authorized": false,
          "is_authorized_to_maintain_liabilities": false
        },
        {
          "balance": "5000.0000000",
          "limit": "922337203685.4775807",
          "asset_type": "credit_alphanum4",
          "asset_code": "MDL",
          "asset_issuer": "GAX4CUJEOUA27MDHTLSQCFRGQPEXCC6GMO2P2TZCG7IEBZIEGPOD6HKF"
        },
        {
          "balance": "10000.0000000",
          "limit": "922337203685.4775807",
          "asset_type": "credit_alphanum4",
          "asset_code": "USD",
          "asset_issuer": "GAX4CUJEOUA27MDHTLSQCFRGQPEXCC6GMO2P2TZCG7IEBZIEGPOD6HKF"
        },
        {
          "balance": "70.0998900",
          "asset_type": "native"
        }
      ],
      "signers": [
        {
          "public_key": "GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS",
          "weight": 1
        }
      ],
      "data": {}
    };

    it("returns AccountResponse object", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(
          sinon.match(
            "https://horizon-live.stellar.org:1337/accounts/GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS"
          )
        )
        .returns(Promise.resolve({ data: accountResponse }));

      this.server
        .loadAccount("GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS")
        .then((response) => {
          // Response data
          expect(response.account_id).to.be.equal(
            "GBAH7FQMC3CZJ4WD6GE7G7YXCIU36LC2IHXQ7D5MQAUO4PODOWIVLSFS"
          );
          expect(response.subentry_count).to.be.equal(5);
          expect(response.transactions).to.be.a("function");
          expect(response.operations).to.be.a("function");
          expect(response.payments).to.be.a("function");
          expect(response.effects).to.be.a("function");
          expect(response.offers).to.be.a("function");
          expect(Object.keys(response.flags).length).to.be.equal(4);
          // AccountResponse methods
          expect(response.sequenceNumber()).to.be.equal("5387216134078475");
          expect(response.sequence).to.be.equal("5387216134078475");
          response.incrementSequenceNumber();
          expect(response.sequenceNumber()).to.be.equal("5387216134078476");
          expect(response.sequence).to.be.equal("5387216134078476");
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe("Server._sendResourceRequest", function () {
    describe("requests all ledgers", function () {
      let ledgersResponse = {
        _embedded: {
          records: [
            {
              _links: {
                effects: {
                  href: "/ledgers/1/effects{?cursor,limit,order}",
                  templated: true
                },
                operations: {
                  href: "/ledgers/1/operations{?cursor,limit,order}",
                  templated: true
                },
                self: {
                  href: "/ledgers/1"
                },
                transactions: {
                  href: "/ledgers/1/transactions{?cursor,limit,order}",
                  templated: true
                }
              },
              id: "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
              paging_token: "4294967296",
              hash: "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
              sequence: 1,
              transaction_count: 0,
              operation_count: 0,
              tx_set_operation_count: 0,
              closed_at: "1970-01-01T00:00:00Z"
            }
          ]
        },
        _links: {
          next: {
            href: "/ledgers?order=asc\u0026limit=1\u0026cursor=4294967296"
          },
          prev: {
            href: "/ledgers?order=desc\u0026limit=1\u0026cursor=4294967296"
          },
          self: {
            href: "/ledgers?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match("https://horizon-live.stellar.org:1337/ledgers")
            )
            .returns(Promise.resolve({ data: ledgersResponse }));

          this.server
            .ledgers()
            .call()
            .then((response) => {
              expect(response.records).to.be.deep.equal(
                ledgersResponse._embedded.records
              );
              expect(response.next).to.be.a("function");
              expect(response.prev).to.be.a("function");
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
      });

      describe("with options", function () {
        beforeEach(function () {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                "https://horizon-live.stellar.org:1337/ledgers?limit=1&cursor=b&order=asc"
              )
            )
            .returns(Promise.resolve({ data: ledgersResponse }));
        });

        it("requests the correct endpoint", function (done) {
          this.server
            .ledgers()
            .limit("1")
            .cursor("b")
            .order("asc")
            .call()
            .then((response) => {
              expect(response.records).to.be.deep.equal(
                ledgersResponse._embedded.records
              );
              expect(response.next).to.be.a("function");
              expect(response.prev).to.be.a("function");
              done();
            });
        });

        it("can call .next() on the result to retrieve the next page", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                "https://horizon-live.stellar.org:1337/ledgers?order=asc&limit=1&cursor=4294967296"
              )
            )
            .returns(Promise.resolve({ data: ledgersResponse }));

          this.server
            .ledgers()
            .limit("1")
            .cursor("b")
            .order("asc")
            .call()
            .then(function (page) {
              page.next().then(function (response) {
                expect(response.records).to.be.deep.equal(
                  ledgersResponse._embedded.records
                );
                expect(response.next).to.be.a("function");
                expect(response.prev).to.be.a("function");
                done();
              });
            });
        });
      });
    });

    describe("requests a single ledger", function () {
      let singleLedgerResponse = {
        _links: {
          effects: {
            href: "/ledgers/1/effects{?cursor,limit,order}",
            templated: true
          },
          operations: {
            href: "/ledgers/1/operations{?cursor,limit,order}",
            templated: true
          },
          self: {
            href: "/ledgers/1"
          },
          transactions: {
            href: "/ledgers/1/transactions{?cursor,limit,order}",
            templated: true
          }
        },
        id: "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
        paging_token: "4294967296",
        hash: "63d98f536ee68d1b27b5b89f23af5311b7569a24faf1403ad0b52b633b07be99",
        sequence: 1,
        transaction_count: 0,
        operation_count: 0,
        tx_set_operation_count: 0,
        closed_at: "1970-01-01T00:00:00Z"
      };

      describe("for a non existent ledger", function () {
        it("throws a NotFoundError", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match("https://horizon-live.stellar.org:1337/ledgers/1")
            )
            .returns(
              Promise.reject({
                response: { status: 404, statusText: "NotFound", data: {} }
              })
            );

          this.server
            .ledgers()
            .ledger(1)
            .call()
            .then(function () {
              done("didn't throw an error");
            })
            .catch(function (err) {
              if (err instanceof StellarSdk.NotFoundError) {
                done();
              } else {
                done(err);
              }
            });
        });
      });
      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match("https://horizon-live.stellar.org:1337/ledgers/1")
            )
            .returns(Promise.resolve({ data: singleLedgerResponse }));

          this.server
            .ledgers()
            .ledger("1")
            .call()
            .then(function (response) {
              expect(response).to.be.deep.equal(singleLedgerResponse);
              done();
            })
            .catch(function (err) {
              done(err);
            });
        });
      });

      describe("with options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                "https://horizon-live.stellar.org:1337/ledgers/1?limit=1&cursor=b&order=asc"
              )
            )
            .returns(Promise.resolve({ data: singleLedgerResponse }));

          this.server
            .ledgers()
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
            });
        });
      });
    });

    describe("requests a sub resource", function (done) {
      let transactionsResponse = {
        _links: {
          self: {
            href: "https://horizon.stellar.org/transactions?order=desc\u0026limit=1\u0026cursor="
          },
          next: {
            href: "https://horizon.stellar.org/transactions?order=desc\u0026limit=1\u0026cursor=34156680904183808"
          },
          prev: {
            href: "https://horizon.stellar.org/transactions?order=asc\u0026limit=1\u0026cursor=34156680904183808"
          }
        },
        _embedded: {
          records: [
            {
              _links: {
                self: {
                  href: "https://horizon.stellar.org/transactions/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1"
                },
                account: {
                  href: "https://horizon.stellar.org/accounts/GBURK32BMC7XORYES62HDKY7VTA5MO7JYBDH7KTML4EPN4BV2MIRQOVR"
                },
                ledger: {
                  href: "https://horizon.stellar.org/ledgers/7952722"
                },
                operations: {
                  href: "https://horizon.stellar.org/transactions/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1/operations{?cursor,limit,order}",
                  templated: true
                },
                effects: {
                  href: "https://horizon.stellar.org/transactions/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "https://horizon.stellar.org/transactions?order=asc\u0026cursor=34156680904183808"
                },
                succeeds: {
                  href: "https://horizon.stellar.org/transactions?order=desc\u0026cursor=34156680904183808"
                }
              },
              id: "c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1",
              paging_token: "34156680904183808",
              hash: "c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1",
              ledger: 7952722,
              created_at: "2016-12-09T12:36:51Z",
              source_account:
                "GBURK32BMC7XORYES62HDKY7VTA5MO7JYBDH7KTML4EPN4BV2MIRQOVR",
              source_account_sequence: "25631492944168311",
              fee_charged: 3600,
              max_fee: 3600,
              operation_count: 4,
              envelope_xdr:
                "AAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAABkABbD7UAAAV3AAAAAAAAAAAAAAAEAAAAAAAAAAMAAAABRlVOVAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABfXhAEeeSWkAKXANAAAAAAAAB74AAAABAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAwAAAAAAAAABRlVOVAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAApNO6TmAEeYrnXHsdUAAAAAAAAHvwAAAAEAAAAAaRVvQWC/d0cEl7Rxqx+swdY76cBGf6psXwj28DXTERgAAAADAAAAAAAAAAFVU0QAAAAAAGmKAR/t72Hkil494RcKg8k+pjwhG3yGmd4vn45d9njlAAAACVAvkAAACRT4DX+q6QAAAAAAAAfCAAAAAQAAAABpFW9BYL93RwSXtHGrH6zB1jvpwEZ/qmxfCPbwNdMRGAAAAAMAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABkQTwCl6AxMAGo+PAAAAAAAAB8MAAAAAAAAAATXTERgAAABApox1kE2/f2oYQw/PdJZHUk74JVWRHDPwcqzGP+lSJljl6ABBRPqXewP1jAzpgY+vicDeLR/35/HyDyeAG7H0Aw==",
              result_xdr:
                "AAAAAAAAAZAAAAAAAAAABAAAAAAAAAADAAAAAAAAAAAAAAABAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB74AAAABRlVOVAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABfXhAEeeSWkAKXANAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAQAAAABpFW9BYL93RwSXtHGrH6zB1jvpwEZ/qmxfCPbwNdMRGAAAAAAAAAe/AAAAAAAAAAFGVU5UAAAAAGmKAR/t72Hkil494RcKg8k+pjwhG3yGmd4vn45d9njlAAAACk07pOYAR5iudcex1QAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAEAAAAAaRVvQWC/d0cEl7Rxqx+swdY76cBGf6psXwj28DXTERgAAAAAAAAHwgAAAAAAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAlQL5AAAAkU+A1/qukAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAABAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB8MAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABkQTwCl6AxMAGo+PAAAAAAAAAAAAAAAA",
              result_meta_xdr:
                "AAAAAAAAAAQAAAACAAAAAwB5VlwAAAACAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB74AAAABRlVOVAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABfXhAB0XUa8AEKh4AAAAAAAAAAAAAAAAAAAAAQB5WVIAAAACAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB74AAAABRlVOVAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABfXhAEeeSWkAKXANAAAAAAAAAAAAAAAAAAAAAgAAAAMAeVZcAAAAAgAAAABpFW9BYL93RwSXtHGrH6zB1jvpwEZ/qmxfCPbwNdMRGAAAAAAAAAe/AAAAAAAAAAFGVU5UAAAAAGmKAR/t72Hkil494RcKg8k+pjwhG3yGmd4vn45d9njlAAAACmi91ogADBrzFB8c9gAAAAAAAAAAAAAAAAAAAAEAeVlSAAAAAgAAAABpFW9BYL93RwSXtHGrH6zB1jvpwEZ/qmxfCPbwNdMRGAAAAAAAAAe/AAAAAAAAAAFGVU5UAAAAAGmKAR/t72Hkil494RcKg8k+pjwhG3yGmd4vn45d9njlAAAACk07pOYAR5iudcex1QAAAAAAAAAAAAAAAAAAAAIAAAADAHlWXAAAAAIAAAAAaRVvQWC/d0cEl7Rxqx+swdY76cBGf6psXwj28DXTERgAAAAAAAAHwgAAAAAAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAlQL5AAAA8e9BZqv1MAAAAAAAAAAAAAAAAAAAABAHlZUgAAAAIAAAAAaRVvQWC/d0cEl7Rxqx+swdY76cBGf6psXwj28DXTERgAAAAAAAAHwgAAAAAAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAlQL5AAAAkU+A1/qukAAAAAAAAAAAAAAAAAAAACAAAAAwB5VlwAAAACAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB8MAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABkg0AAFCujYAAM8zAAAAAAAAAAAAAAAAAAAAAQB5WVIAAAACAAAAAGkVb0Fgv3dHBJe0casfrMHWO+nARn+qbF8I9vA10xEYAAAAAAAAB8MAAAABVVNEAAAAAABpigEf7e9h5IpePeEXCoPJPqY8IRt8hpneL5+OXfZ45QAAAAAAAAAABkQTwCl6AxMAGo+PAAAAAAAAAAAAAAAA",
              fee_meta_xdr:
                "AAAAAgAAAAMAeVZcAAAAAAAAAABpFW9BYL93RwSXtHGrH6zB1jvpwEZ/qmxfCPbwNdMRGAAAABc+8zU9AFsPtQAABXYAAAASAAAAAAAAAAAAAAAPZnVudHJhY2tlci5zaXRlAAEAAAAAAAAAAAAAAAAAAAAAAAABAHlZUgAAAAAAAAAAaRVvQWC/d0cEl7Rxqx+swdY76cBGf6psXwj28DXTERgAAAAXPvMzrQBbD7UAAAV3AAAAEgAAAAAAAAAAAAAAD2Z1bnRyYWNrZXIuc2l0ZQABAAAAAAAAAAAAAAAAAAAA",
              memo_type: "none",
              signatures: [
                "pox1kE2/f2oYQw/PdJZHUk74JVWRHDPwcqzGP+lSJljl6ABBRPqXewP1jAzpgY+vicDeLR/35/HyDyeAG7H0Aw=="
              ]
            }
          ]
        }
      };

      describe("without options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                "https://horizon-live.stellar.org:1337/ledgers/7952722/transactions"
              )
            )
            .returns(Promise.resolve({ data: transactionsResponse }));

          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                /^https:\/\/horizon.stellar.org\/transactions\/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1\/operations/
              )
            )
            .returns(Promise.resolve({ data: { operations: [] } }));

          this.server
            .transactions()
            .forLedger(7952722)
            .call()
            .then(function (response) {
              expect(response.records).to.be.deep.equal(
                transactionsResponse._embedded.records
              );
              expect(response.records[0].ledger).to.be.a("function");
              expect(response.records[0].ledger_attr).to.be.equal(7952722);
              expect(response.next).to.be.a("function");
              expect(response.prev).to.be.a("function");

              response.records[0]
                .operations()
                .then(function (response) {
                  expect(response.operations).to.not.be.undefined;
                  done();
                })
                .catch(function (err) {
                  done(err);
                });
            })
            .catch(function (err) {
              done(err);
            });
        });
      });
      describe("with options", function () {
        it("requests the correct endpoint", function (done) {
          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                "https://horizon-live.stellar.org:1337/ledgers/7952722/transactions?cursor=b&limit=1&order=asc"
              )
            )
            .returns(Promise.resolve({ data: transactionsResponse }));

          this.axiosMock
            .expects("get")
            .withArgs(
              sinon.match(
                /^https:\/\/horizon.stellar.org\/transactions\/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1\/operations\?limit=1/
              )
            )
            .returns(Promise.resolve({ data: { operations: [] } }));

          this.server
            .transactions()
            .forLedger("7952722")
            .cursor("b")
            .limit("1")
            .order("asc")
            .call()
            .then(function (response) {
              expect(response.records).to.be.deep.equal(
                transactionsResponse._embedded.records
              );
              expect(response.next).to.be.a("function");
              expect(response.prev).to.be.a("function");
              response.records[0]
                .operations({ limit: 1 })
                .then(function (response) {
                  expect(response.operations).to.not.be.undefined;
                  done();
                })
                .catch(function (err) {
                  done(err);
                });
            })
            .catch(function (err) {
              done(err);
            });
        });
      });
    });
  });

  describe("Server._parseResult", function () {
    it("creates link functions", function () {
      var callBuilder = this.server.ledgers();
      var json = callBuilder._parseResponse({
        _links: {
          test: function () {
            return "hi";
          }
        }
      });
      expect(typeof json.test).to.be.equal("function");
    });
  });

  describe("Smoke tests for the rest of the builders", function () {
    describe("TransactionCallBuilder", function () {
      it("#transaction - requests the correct endpoint", function (done) {
        let singleTranssactionResponse = {
          _links: {
            self: {
              href: "https://horizon-testnet.stellar.org/transactions/6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0"
            },
            account: {
              href: "https://horizon-testnet.stellar.org/accounts/GBCCHT5P34DMK2LTN4SPHBAJCXYFNUEWSM7SDSWEXJA7NN6CA3HNHTM6"
            },
            ledger: {
              href: "https://horizon-testnet.stellar.org/ledgers/121879"
            },
            operations: {
              href: "https://horizon-testnet.stellar.org/transactions/6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0/operations{?cursor,limit,order}",
              templated: true
            },
            effects: {
              href: "https://horizon-testnet.stellar.org/transactions/6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0/effects{?cursor,limit,order}",
              templated: true
            },
            precedes: {
              href: "https://horizon-testnet.stellar.org/transactions?order=asc&cursor=523466319077376"
            },
            succeeds: {
              href: "https://horizon-testnet.stellar.org/transactions?order=desc&cursor=523466319077376"
            }
          },
          id: "6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0",
          paging_token: "523466319077376",
          successful: true,
          hash: "6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0",
          ledger: 121879,
          created_at: "2020-02-06T01:57:18Z",
          source_account:
            "GBCCHT5P34DMK2LTN4SPHBAJCXYFNUEWSM7SDSWEXJA7NN6CA3HNHTM6",
          source_account_sequence: "523406189527045",
          fee_paid: 100,
          fee_charged: 100,
          max_fee: 100,
          operation_count: 1,
          envelope_xdr:
            "AAAAAEQjz6/fBsVpc28k84QJFfBW0JaTPyHKxLpB9rfCBs7TAAAAZAAB3AkAAAAFAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAMBwd6tPbAYimyr/BzBgOosIbrnrzfxfS/gmfqoDSx0IAAAAAHc1lAAAAAAAAAAABwgbO0wAAAECl/OULPE7Q3ikmwIYeECFtxVH4rh8lmk465QLIeHEeEcbYhaTfgfe8VAwKsYf4YqK+YKiSiI0BqJKDr6CeI3QJ",
          result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAA=",
          result_meta_xdr:
            "AAAAAQAAAAIAAAADAAHcFwAAAAAAAAAARCPPr98GxWlzbyTzhAkV8FbQlpM/IcrEukH2t8IGztMAAAAW0UFSDAAB3AkAAAAEAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAHcFwAAAAAAAAAARCPPr98GxWlzbyTzhAkV8FbQlpM/IcrEukH2t8IGztMAAAAW0UFSDAAB3AkAAAAFAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAMAAdwXAAAAAAAAAABEI8+v3wbFaXNvJPOECRXwVtCWkz8hysS6Qfa3wgbO0wAAABbRQVIMAAHcCQAAAAUAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAdwXAAAAAAAAAABEI8+v3wbFaXNvJPOECRXwVtCWkz8hysS6Qfa3wgbO0wAAABazc+0MAAHcCQAAAAUAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAdwXAAAAAAAAAAAwHB3q09sBiKbKv8HMGA6iwhuuevN/F9L+CZ+qgNLHQgAAAAAdzWUAAAHcFwAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
          fee_meta_xdr:
            "AAAAAgAAAAMAAdwUAAAAAAAAAABEI8+v3wbFaXNvJPOECRXwVtCWkz8hysS6Qfa3wgbO0wAAABbRQVJwAAHcCQAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAdwXAAAAAAAAAABEI8+v3wbFaXNvJPOECRXwVtCWkz8hysS6Qfa3wgbO0wAAABbRQVIMAAHcCQAAAAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
          memo_type: "none",
          signatures: [
            "pfzlCzxO0N4pJsCGHhAhbcVR+K4fJZpOOuUCyHhxHhHG2IWk34H3vFQMCrGH+GKivmCokoiNAaiSg6+gniN0CQ=="
          ]
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/transactions/6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0"
            )
          )
          .returns(Promise.resolve({ data: singleTranssactionResponse }));

        this.server
          .transactions()
          .transaction(
            "6bbd8cbd90498a26210a21ec599702bead8f908f412455da300318aba36831b0"
          )
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(singleTranssactionResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      const transactionsResponse = {
        _links: {
          self: {
            href: "https://horizon.stellar.org/transactions?cursor=\u0026limit=3\u0026order=asc"
          },
          next: {
            href: "https://horizon.stellar.org/transactions?cursor=33736968114176\u0026limit=3\u0026order=asc"
          },
          prev: {
            href: "https://horizon.stellar.org/transactions?cursor=12884905984\u0026limit=3\u0026order=desc"
          }
        },
        _embedded: {
          records: [
            {
              memo: "hello world",
              _links: {
                self: {
                  href: "https://horizon.stellar.org/transactions/3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889"
                },
                account: {
                  href: "https://horizon.stellar.org/accounts/GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7"
                },
                ledger: {
                  href: "https://horizon.stellar.org/ledgers/3"
                },
                operations: {
                  href: "https://horizon.stellar.org/transactions/3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889/operations{?cursor,limit,order}",
                  templated: true
                },
                effects: {
                  href: "https://horizon.stellar.org/transactions/3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "https://horizon.stellar.org/transactions?order=asc\u0026cursor=12884905984"
                },
                succeeds: {
                  href: "https://horizon.stellar.org/transactions?order=desc\u0026cursor=12884905984"
                }
              },
              id: "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
              paging_token: "12884905984",
              successful: true,
              hash: "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
              ledger: 3,
              created_at: "2015-09-30T17:15:54Z",
              source_account:
                "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
              source_account_sequence: "1",
              fee_charged: 300,
              max_fee: 300,
              operation_count: 3,
              envelope_xdr:
                "AAAAAAGUcmKO5465JxTSLQOQljwk2SfqAJmZSG6JH6wtqpwhAAABLAAAAAAAAAABAAAAAAAAAAEAAAALaGVsbG8gd29ybGQAAAAAAwAAAAAAAAAAAAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2AAAAAAvrwgAAAAAAAAAAAQAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNgAAAAAN4Lazj4x61AAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABLaqcIQAAAEBKwqWy3TaOxoGnfm9eUjfTRBvPf34dvDA0Nf+B8z4zBob90UXtuCqmQqwMCyH+okOI3c05br3khkH0yP4kCwcE",
              result_xdr:
                "AAAAAAAAASwAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAFAAAAAAAAAAA=",
              result_meta_xdr:
                "AAAAAAAAAAMAAAACAAAAAAAAAAMAAAAAAAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2AAAAAAvrwgAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAMAAAAAAAAAAAGUcmKO5465JxTSLQOQljwk2SfqAJmZSG6JH6wtqpwhDeC2s5t4PNQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAEAAAADAAAAAAAAAAABlHJijueOuScU0i0DkJY8JNkn6gCZmUhuiR+sLaqcIQAAAAAL68IAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAMAAAADAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNgAAAAAL68IAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrObeDzUAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAwAAAAAAAAAAAZRyYo7njrknFNItA5CWPCTZJ+oAmZlIbokfrC2qnCEAAAAAC+vCAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
              fee_meta_xdr:
                "AAAAAgAAAAMAAAABAAAAAAAAAAABlHJijueOuScU0i0DkJY8JNkn6gCZmUhuiR+sLaqcIQ3gtrOnZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAAABlHJijueOuScU0i0DkJY8JNkn6gCZmUhuiR+sLaqcIQ3gtrOnY/7UAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
              memo_type: "text",
              signatures: [
                "SsKlst02jsaBp35vXlI300Qbz39+HbwwNDX/gfM+MwaG/dFF7bgqpkKsDAsh/qJDiN3NOW695IZB9Mj+JAsHBA=="
              ]
            },
            {
              memo: "testpool,faucet,sdf",
              _links: {
                self: {
                  href: "https://horizon.stellar.org/transactions/2db4b22ca018119c5027a80578813ffcf582cda4aa9e31cd92b43cf1bda4fc5a"
                },
                account: {
                  href: "https://horizon.stellar.org/accounts/GALPCCZN4YXA3YMJHKL6CVIECKPLJJCTVMSNYWBTKJW4K5HQLYLDMZTB"
                },
                ledger: {
                  href: "https://horizon.stellar.org/ledgers/7841"
                },
                operations: {
                  href: "https://horizon.stellar.org/transactions/2db4b22ca018119c5027a80578813ffcf582cda4aa9e31cd92b43cf1bda4fc5a/operations{?cursor,limit,order}",
                  templated: true
                },
                effects: {
                  href: "https://horizon.stellar.org/transactions/2db4b22ca018119c5027a80578813ffcf582cda4aa9e31cd92b43cf1bda4fc5a/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "https://horizon.stellar.org/transactions?order=asc\u0026cursor=33676838572032"
                },
                succeeds: {
                  href: "https://horizon.stellar.org/transactions?order=desc\u0026cursor=33676838572032"
                }
              },
              id: "2db4b22ca018119c5027a80578813ffcf582cda4aa9e31cd92b43cf1bda4fc5a",
              paging_token: "33676838572032",
              successful: true,
              hash: "2db4b22ca018119c5027a80578813ffcf582cda4aa9e31cd92b43cf1bda4fc5a",
              ledger: 7841,
              created_at: "2015-10-01T04:15:01Z",
              source_account:
                "GALPCCZN4YXA3YMJHKL6CVIECKPLJJCTVMSNYWBTKJW4K5HQLYLDMZTB",
              source_account_sequence: "12884901890",
              fee_charged: 300,
              max_fee: 300,
              operation_count: 3,
              envelope_xdr:
                "AAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2AAABLAAAAAMAAAACAAAAAAAAAAEAAAATdGVzdHBvb2wsZmF1Y2V0LHNkZgAAAAADAAAAAAAAAAAAAAAAH6Ue1GOPj6Hb/ROPyIFCJpQPMujihEIvJSfK0UfMDIgAAAAAC+vCAAAAAAAAAAAAAAAAALMw4P7yJTyqj6ptNh7BPyXEoT+zVwTcU4JVbGyonvgbAAAAAAvrwgAAAAAAAAAAAAAAAABJlwu05Op/5x1uyrweYsyR6pTTos33hRNZe5IF6blnzwAAAAAL68IAAAAAAAAAAAHwXhY2AAAAQDSBB5eNEKkWIoQbZ1YQabJuE5mW/AKhrHTxw9H3m/sai90YcaZlsAe3ueO9jExjSZF289ZcR4vc0wFw1p/WyAc=",
              result_xdr:
                "AAAAAAAAASwAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
              result_meta_xdr:
                "AAAAAAAAAAMAAAACAAAAAAAAHqEAAAAAAAAAAB+lHtRjj4+h2/0Tj8iBQiaUDzLo4oRCLyUnytFHzAyIAAAAAAvrwgAAAB6hAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAQAAHqEAAAAAAAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2DeC2s4+MeHwAAAADAAAAAgAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAB6hAAAAAAAAAACzMOD+8iU8qo+qbTYewT8lxKE/s1cE3FOCVWxsqJ74GwAAAAAL68IAAAAeoQAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAB6hAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrODoLZ8AAAAAwAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAeoQAAAAAAAAAASZcLtOTqf+cdbsq8HmLMkeqU06LN94UTWXuSBem5Z88AAAAAC+vCAAAAHqEAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAeoQAAAAAAAAAAFvELLeYuDeGJOpfhVQQSnrSkU6sk3FgzUm3FdPBeFjYN4Lazd7T0fAAAAAMAAAACAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAA=",
              fee_meta_xdr:
                "AAAAAgAAAAMAAB55AAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrObeDuoAAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAB6hAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrObeDp8AAAAAwAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
              memo_type: "text",
              signatures: [
                "NIEHl40QqRYihBtnVhBpsm4TmZb8AqGsdPHD0feb+xqL3RhxpmWwB7e5472MTGNJkXbz1lxHi9zTAXDWn9bIBw=="
              ]
            },
            {
              memo: "",
              _links: {
                self: {
                  href: "https://horizon.stellar.org/transactions/3ce2aca2fed36da2faea31352c76c5e412348887a4c119b1e90de8d1b937396a"
                },
                account: {
                  href: "https://horizon.stellar.org/accounts/GALPCCZN4YXA3YMJHKL6CVIECKPLJJCTVMSNYWBTKJW4K5HQLYLDMZTB"
                },
                ledger: {
                  href: "https://horizon.stellar.org/ledgers/7855"
                },
                operations: {
                  href: "https://horizon.stellar.org/transactions/3ce2aca2fed36da2faea31352c76c5e412348887a4c119b1e90de8d1b937396a/operations{?cursor,limit,order}",
                  templated: true
                },
                effects: {
                  href: "https://horizon.stellar.org/transactions/3ce2aca2fed36da2faea31352c76c5e412348887a4c119b1e90de8d1b937396a/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "https://horizon.stellar.org/transactions?order=asc\u0026cursor=33736968114176"
                },
                succeeds: {
                  href: "https://horizon.stellar.org/transactions?order=desc\u0026cursor=33736968114176"
                }
              },
              id: "3ce2aca2fed36da2faea31352c76c5e412348887a4c119b1e90de8d1b937396a",
              paging_token: "33736968114176",
              successful: true,
              hash: "3ce2aca2fed36da2faea31352c76c5e412348887a4c119b1e90de8d1b937396a",
              ledger: 7855,
              created_at: "2015-10-01T04:16:11Z",
              source_account:
                "GALPCCZN4YXA3YMJHKL6CVIECKPLJJCTVMSNYWBTKJW4K5HQLYLDMZTB",
              source_account_sequence: "12884901891",
              fee_charged: 100,
              max_fee: 100,
              operation_count: 1,
              envelope_xdr:
                "AAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2AAAAZAAAAAMAAAADAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAFAAAAAQAAAAAfpR7UY4+Podv9E4/IgUImlA8y6OKEQi8lJ8rRR8wMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwXhY2AAAAQNbDcWsR3s3z8Qzqatcdc/k2L4LXWJMA6eXac8dbXkAdc4ppH25isGC5OwvG06Vwvc3Ce3/r2rYcBP3vxhx18A8=",
              result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAAFAAAAAAAAAAA=",
              result_meta_xdr:
                "AAAAAAAAAAEAAAABAAAAAQAAHq8AAAAAAAAAABbxCy3mLg3hiTqX4VUEEp60pFOrJNxYM1JtxXTwXhY2DeC2s3e09BgAAAADAAAAAwAAAAAAAAABAAAAAB+lHtRjj4+h2/0Tj8iBQiaUDzLo4oRCLyUnytFHzAyIAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA",
              fee_meta_xdr:
                "AAAAAgAAAAMAAB6hAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrN3tPR8AAAAAwAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEAAB6vAAAAAAAAAAAW8Qst5i4N4Yk6l+FVBBKetKRTqyTcWDNSbcV08F4WNg3gtrN3tPQYAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
              memo_type: "text",
              signatures: [
                "1sNxaxHezfPxDOpq1x1z+TYvgtdYkwDp5dpzx1teQB1zimkfbmKwYLk7C8bTpXC9zcJ7f+vathwE/e/GHHXwDw=="
              ]
            }
          ]
        }
      };

      it("forClaimableBalance() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/claimable_balances/000000000102030000000000000000000000000000000000000000000000000000000000/transactions"
            )
          )
          .returns(Promise.resolve({ data: transactionsResponse }));

        this.server
          .transactions()
          .forClaimableBalance(
            "000000000102030000000000000000000000000000000000000000000000000000000000"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              transactionsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("AccountCallBuilder", function () {
      it("requests the correct endpoint", function (done) {
        let singleAccountResponse = {
          _links: {
            effects: {
              href: "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/effects{?cursor,limit,order}",
              templated: true
            },
            offers: {
              href: "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/offers{?cursor,limit,order}",
              templated: true
            },
            operations: {
              href: "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/operations{?cursor,limit,order}",
              templated: true
            },
            self: {
              href: "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
            },
            transactions: {
              href: "/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/transactions{?cursor,limit,order}",
              templated: true
            }
          },
          id: "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
          paging_token: "146028892161",
          account_id:
            "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
          sequence: 146028888090,
          subentry_count: 0,
          inflation_destination: null,
          home_domain: "",
          thresholds: {
            low_threshold: 0,
            med_threshold: 0,
            high_threshold: 0
          },
          flags: {
            auth_required: false,
            auth_revocable: false,
            auth_immutable: false,
            auth_clawback_enabled: false
          },
          balances: [
            {
              asset_type: "native",
              balance: "9760000.3997400"
            }
          ],
          signers: [
            {
              public_key:
                "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              weight: 1
            }
          ]
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
            )
          )
          .returns(Promise.resolve({ data: singleAccountResponse }));

        this.server
          .accounts()
          .accountId("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(singleAccountResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('adds a "signer" query to the endpoint', function (done) {
        let accountsForSignerResponse = {
          _links: {
            self: {
              href: "/accounts?cursor=&limit=10&order=asc&signer=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            },
            next: {
              href: "/accounts?cursor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42&limit=10&order=asc&signer=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            },
            prev: {
              href: "/accounts?cursor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42&limit=10&order=desc&signer=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  self: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
                  },
                  transactions: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/transactions{?cursor,limit,order}",
                    templated: true
                  },
                  operations: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/operations{?cursor,limit,order}",
                    templated: true
                  },
                  payments: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/payments{?cursor,limit,order}",
                    templated: true
                  },
                  effects: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/effects{?cursor,limit,order}",
                    templated: true
                  },
                  offers: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/offers{?cursor,limit,order}",
                    templated: true
                  },
                  trades: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/trades{?cursor,limit,order}",
                    templated: true
                  },
                  data: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/data/{key}",
                    templated: true
                  }
                },
                id: "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                account_id:
                  "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                sequence: "4233832731508737",
                subentry_count: 1,
                last_modified_ledger: 986912,
                last_modified_time: "1970-01-01T00:00:00Z",
                thresholds: {
                  low_threshold: 0,
                  med_threshold: 0,
                  high_threshold: 0
                },
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                },
                balances: [
                  {
                    balance: "0.0000000",
                    limit: "450.0000000",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    last_modified_ledger: 986912,
                    is_authorized: true,
                    asset_type: "credit_alphanum4",
                    asset_code: "USD",
                    asset_issuer:
                      "GDUEG67IE5TJUVWRRTMXDP3Q6EMMZJ6HL5OMWLBYOIUIZEUW2T2PBPJH"
                  },
                  {
                    balance: "9999.9999900",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    asset_type: "native"
                  }
                ],
                signers: [
                  {
                    weight: 1,
                    key: "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                    type: "ed25519_public_key"
                  }
                ],
                data: {},
                paging_token:
                  "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts?signer=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            )
          )
          .returns(Promise.resolve({ data: accountsForSignerResponse }));

        this.server
          .accounts()
          .forSigner("GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              accountsForSignerResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('adds an "asset" query to the endpoint', function (done) {
        let accountsForAssetResponse = {
          _links: {
            self: {
              href: "/accounts?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD\u0026cursor=\u0026limit=10\u0026order=asc"
            },
            next: {
              href: "/accounts?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD\u0026cursor=GC4J73PTB5WN7MOJWOAECPHRCV2UU3WCY37L3BNY6RZVKE23JGQYJMJ6\u0026limit=10\u0026order=asc"
            },
            prev: {
              href: "/accounts?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD\u0026cursor=GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667\u0026limit=10\u0026order=desc"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  self: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667"
                  },
                  transactions: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/transactions{?cursor,limit,order}",
                    templated: true
                  },
                  operations: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/operations{?cursor,limit,order}",
                    templated: true
                  },
                  payments: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/payments{?cursor,limit,order}",
                    templated: true
                  },
                  effects: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/effects{?cursor,limit,order}",
                    templated: true
                  },
                  offers: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/offers{?cursor,limit,order}",
                    templated: true
                  },
                  trades: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/trades{?cursor,limit,order}",
                    templated: true
                  },
                  data: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/data/{key}",
                    templated: true
                  }
                },
                id: "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                account_id:
                  "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                sequence: "3902600558673934",
                subentry_count: 3,
                last_modified_ledger: 983682,
                last_modified_time: "1970-01-01T00:00:00Z",
                thresholds: {
                  low_threshold: 0,
                  med_threshold: 0,
                  high_threshold: 0
                },
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                },
                balances: [
                  {
                    balance: "0.0000000",
                    limit: "25.0000000",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    last_modified_ledger: 983682,
                    is_authorized: true,
                    asset_type: "credit_alphanum4",
                    asset_code: "USD",
                    asset_issuer:
                      "GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD"
                  },
                  {
                    balance: "9999.9998600",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    asset_type: "native"
                  }
                ],
                signers: [
                  {
                    weight: 1,
                    key: "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                    type: "ed25519_public_key"
                  }
                ],
                data: {},
                paging_token:
                  "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667"
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD"
            )
          )
          .returns(Promise.resolve({ data: accountsForAssetResponse }));

        this.server
          .accounts()
          .forAsset(
            new StellarSdk.Asset(
              "USD",
              "GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD"
            )
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              accountsForAssetResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('adds a "sponsor" query to the endpoint', function (done) {
        let accountsForSponsor = {
          _links: {
            self: {
              href: "/accounts?cursor=&limit=10&order=asc&sponsor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            },
            next: {
              href: "/accounts?cursor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42&limit=10&order=asc&sponsor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            },
            prev: {
              href: "/accounts?cursor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42&limit=10&order=desc&sponsor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  self: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
                  },
                  transactions: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/transactions{?cursor,limit,order}",
                    templated: true
                  },
                  operations: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/operations{?cursor,limit,order}",
                    templated: true
                  },
                  payments: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/payments{?cursor,limit,order}",
                    templated: true
                  },
                  effects: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/effects{?cursor,limit,order}",
                    templated: true
                  },
                  offers: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/offers{?cursor,limit,order}",
                    templated: true
                  },
                  trades: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/trades{?cursor,limit,order}",
                    templated: true
                  },
                  data: {
                    href: "/accounts/GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42/data/{key}",
                    templated: true
                  }
                },
                id: "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                account_id:
                  "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                sequence: "4233832731508737",
                subentry_count: 1,
                last_modified_ledger: 986912,
                last_modified_time: "1970-01-01T00:00:00Z",
                thresholds: {
                  low_threshold: 0,
                  med_threshold: 0,
                  high_threshold: 0
                },
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                },
                balances: [
                  {
                    balance: "0.0000000",
                    limit: "450.0000000",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    last_modified_ledger: 986912,
                    is_authorized: true,
                    asset_type: "credit_alphanum4",
                    asset_code: "USD",
                    asset_issuer:
                      "GDUEG67IE5TJUVWRRTMXDP3Q6EMMZJ6HL5OMWLBYOIUIZEUW2T2PBPJH",
                    sponsor:
                      "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
                  },
                  {
                    balance: "9999.9999900",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    asset_type: "native"
                  }
                ],
                signers: [
                  {
                    weight: 1,
                    key: "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                    type: "ed25519_public_key"
                  }
                ],
                data: {},
                paging_token:
                  "GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42",
                num_sponsoring: 0,
                num_sponsored: 3
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts?sponsor=GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42"
            )
          )
          .returns(Promise.resolve({ data: accountsForSponsor }));

        this.server
          .accounts()
          .sponsor("GBCR5OVQ54S2EKHLBZMK6VYMTXZHXN3T45Y6PRX4PX4FXDMJJGY4FD42")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              accountsForSponsor._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it('adds a "liquidity_pool" filter to the endpoint', function (done) {
        const accountsForAssetResponse = {
          _links: {
            self: {
              href: "/accounts?liquidity_pool=dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7&cursor=&limit=10&order=asc"
            },
            next: {
              href: "/accounts?liquidity_pool=dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7&cursor=GC4J73PTB5WN7MOJWOAECPHRCV2UU3WCY37L3BNY6RZVKE23JGQYJMJ6&limit=10&order=asc"
            },
            prev: {
              href: "/accounts?liquidity_pool=dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7&cursor=GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667&limit=10&order=desc"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  self: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667"
                  },
                  transactions: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/transactions{?cursor,limit,order}",
                    templated: true
                  },
                  operations: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/operations{?cursor,limit,order}",
                    templated: true
                  },
                  payments: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/payments{?cursor,limit,order}",
                    templated: true
                  },
                  effects: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/effects{?cursor,limit,order}",
                    templated: true
                  },
                  offers: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/offers{?cursor,limit,order}",
                    templated: true
                  },
                  trades: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/trades{?cursor,limit,order}",
                    templated: true
                  },
                  data: {
                    href: "/accounts/GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667/data/{key}",
                    templated: true
                  }
                },
                id: "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                account_id:
                  "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                sequence: "3902600558673934",
                subentry_count: 3,
                last_modified_ledger: 983682,
                last_modified_time: "1970-01-01T00:00:00Z",
                thresholds: {
                  low_threshold: 0,
                  med_threshold: 0,
                  high_threshold: 0
                },
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                },
                balances: [
                  {
                    liquidity_pool_id:
                      "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
                    asset_type: "liquidity_pool_shares",
                    balance: "10",
                    limit: "10000",
                    last_modified_ledger: 7877447,
                    is_authorized: true,
                    is_authorized_to_maintain_liabilities: false,
                    is_clawback_enabled: false
                  },
                  {
                    balance: "0.0000000",
                    limit: "922337203685.4775807",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    last_modified_ledger: 983682,
                    is_authorized: true,
                    is_authorized_to_maintain_liabilities: false,
                    is_clawback_enabled: false,
                    asset_type: "credit_alphanum4",
                    asset_code: "ARST",
                    asset_issuer:
                      "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO"
                  },
                  {
                    balance: "0.0000000",
                    limit: "922337203685.4775807",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    last_modified_ledger: 983682,
                    is_authorized: true,
                    is_authorized_to_maintain_liabilities: false,
                    is_clawback_enabled: false,
                    asset_type: "credit_alphanum4",
                    asset_code: "USD",
                    asset_issuer:
                      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ"
                  },
                  {
                    balance: "9999.9998600",
                    buying_liabilities: "0.0000000",
                    selling_liabilities: "0.0000000",
                    asset_type: "native"
                  }
                ],
                signers: [
                  {
                    weight: 1,
                    key: "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667",
                    type: "ed25519_public_key"
                  }
                ],
                data: {},
                paging_token:
                  "GBPFGVESMB7HSTQREV354WA4UDGAPS2NCB5DZQ7K2VZM3PSX4TDCV667"
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts?liquidity_pool=dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7"
            )
          )
          .returns(Promise.resolve({ data: accountsForAssetResponse }));

        this.server
          .accounts()
          .forLiquidityPool(
            "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              accountsForAssetResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("OfferCallBuilder", function () {
      const offersResponse = {
        _embedded: {
          records: []
        },
        _links: {
          next: {
            href: "/offers"
          },
          prev: {
            href: "/offers"
          },
          self: {
            href: "/offers"
          }
        }
      };

      it("without params requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/offers?order=asc"
            )
          )
          .returns(Promise.resolve({ data: offersResponse }));
        this.server
          .offers()
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              offersResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("single offer requests the correct endpoint", function (done) {
        const offerResponse = {
          _links: {
            self: {
              href: "https://horizon.stellar.org/offers/12345"
            },
            offer_maker: {
              href: "https://horizon.stellar.org/accounts/GCK4WSNF3F6ZNCMK6BU77ZCZ3NMF3JGU2U3ZAPKXYBKYYCJA72FDBY7K"
            }
          },
          id: 12345,
          paging_token: "12345",
          seller: "GCK4WSNF3F6ZNCMK6BU77ZCZ3NMF3JGU2U3ZAPKXYBKYYCJA72FDBY7K",
          selling: {
            asset_type: "credit_alphanum4",
            asset_code: "NGNT",
            asset_issuer:
              "GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD"
          },
          buying: {
            asset_type: "native"
          },
          amount: "21611.9486669",
          price_r: {
            n: 52836797,
            d: 1396841783
          },
          price: "0.0378259",
          last_modified_ledger: 28285404,
          last_modified_time: "2020-02-18T17:00:56Z"
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match("https://horizon-live.stellar.org:1337/offers/12345")
          )
          .returns(Promise.resolve({ data: offerResponse }));

        this.server
          .offers()
          .offer("12345")
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(offerResponse);
            expect(response.self).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forAccount requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/offers?order=asc"
            )
          )
          .returns(Promise.resolve({ data: offersResponse }));

        this.server
          .offers()
          .forAccount(
            "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
          )
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              offersResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it("selling requests the correct endpoint", function (done) {
        const selling = new StellarSdk.Asset(
          "USD",
          "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
        );

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/offers?selling_asset_type=credit_alphanum4&selling_asset_code=USD&selling_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG&order=asc"
            )
          )
          .returns(Promise.resolve({ data: offersResponse }));

        this.server
          .offers()
          .selling(selling)
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              offersResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it("buying requests the correct endpoint", function (done) {
        const buying = new StellarSdk.Asset(
          "COP",
          "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
        );

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/offers?buying_asset_type=credit_alphanum4&buying_asset_code=COP&buying_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG&order=asc"
            )
          )
          .returns(Promise.resolve({ data: offersResponse }));

        this.server
          .offers()
          .buying(buying)
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              offersResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it("sponsor requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/offers?sponsor=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG&order=asc"
            )
          )
          .returns(Promise.resolve({ data: offersResponse }));

        this.server
          .offers()
          .sponsor("GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG")
          .order("asc")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              offersResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("OrderbookCallBuilder", function () {
      let orderBookResponse = {
        bids: [],
        asks: [],
        base: {
          asset_type: "native",
          asset_code: "",
          asset_issuer: ""
        },
        counter: {
          asset_type: "credit_alphanum4",
          asset_code: "USD",
          asset_issuer:
            "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
        }
      };

      it("requests the correct endpoint native/credit", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/order_book?selling_asset_type=native&buying_asset_type=credit_alphanum4&buying_asset_code=USD&buying_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
            )
          )
          .returns(Promise.resolve({ data: orderBookResponse }));

        this.server
          .orderbook(
            StellarSdk.Asset.native(),
            new StellarSdk.Asset(
              "USD",
              "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
            )
          )
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(orderBookResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("requests the correct endpoint credit/native", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/order_book?selling_asset_type=credit_alphanum4&selling_asset_code=USD&selling_asset_issuer=GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG&buying_asset_type=native"
            )
          )
          .returns(Promise.resolve({ data: orderBookResponse }));

        this.server
          .orderbook(
            new StellarSdk.Asset(
              "USD",
              "GDVDKQFP665JAO7A2LSHNLQIUNYNAAIGJ6FYJVMG4DT3YJQQJSRBLQDG"
            ),
            StellarSdk.Asset.native()
          )
          .call()
          .then(function (response) {
            expect(response).to.be.deep.equal(orderBookResponse);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("TradesCallBuilder", function () {
      it("trades() requests the correct endpoint (no filters)", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&cursor=64199539053039617-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?order=desc&limit=200&cursor=64199539053039617-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199539053039617"
                  }
                },
                id: "64199539053039617-0",
                paging_token: "64199539053039617-0",
                ledger_close_time: "2017-12-07T16:45:19Z",
                offer_id: "278232",
                trade_type: "orderbook",
                base_account:
                  "GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W",
                base_amount: "1269.2134875",
                base_asset_type: "native",
                counter_account:
                  "GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN",
                counter_amount: "19637.5167985",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "JPY",
                counter_asset_issuer:
                  "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                base_is_seller: true,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(sinon.match("https://horizon-live.stellar.org:1337/trades"))
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for assets", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=JPY&counter_asset_issuer=GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM&order=asc&limit=10&cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=JPY&counter_asset_issuer=GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM&order=asc&limit=10&cursor=64199539053039617-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=JPY&counter_asset_issuer=GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM&order=desc&limit=10&cursor=64199539053039617-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199539053039617"
                  }
                },
                id: "64199539053039617-0",
                paging_token: "64199539053039617-0",
                ledger_close_time: "2017-12-07T16:45:19Z",
                offer_id: "278232",
                trade_type: "orderbook",
                base_account:
                  "GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W",
                base_amount: "1269.2134875",
                base_asset_type: "native",
                counter_account:
                  "GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN",
                counter_amount: "19637.5167985",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "JPY",
                counter_asset_issuer:
                  "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                base_is_seller: true,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trades?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=JPY&counter_asset_issuer=GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .forAssetPair(
            StellarSdk.Asset.native(),
            new StellarSdk.Asset(
              "JPY",
              "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM"
            )
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for offer", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?offer_id=278232&order=asc&limit=10&cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?offer_id=278232&order=asc&limit=10&cursor=64199539053039617-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?offer_id=278232&order=desc&limit=10&cursor=64199539053039617-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199539053039617"
                  }
                },
                id: "64199539053039617-0",
                paging_token: "64199539053039617-0",
                ledger_close_time: "2017-12-07T16:45:19Z",
                offer_id: "278232",
                trade_type: "orderbook",
                base_account:
                  "GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W",
                base_amount: "1269.2134875",
                base_asset_type: "native",
                counter_account:
                  "GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN",
                counter_amount: "19637.5167985",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "JPY",
                counter_asset_issuer:
                  "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                base_is_seller: true,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trades?offer_id=278232"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .forOffer("278232")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for account", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/accounts/GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY/trades?cursor=&limit=10&order=asc"
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/accounts/GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY/trades?cursor=77434489365606401-1&limit=10&order=asc"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/accounts/GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY/trades?cursor=77434489365606401-1&limit=10&order=desc"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  self: {
                    href: ""
                  },
                  seller: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GBDTBUKFHJOEAFAVNPGIY65CBIH75DYEZ5VQXOE7YHZM7AJKDNEOW5JG"
                  },
                  buyer: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/77434489365606401"
                  }
                },
                id: "77434489365606401-1",
                paging_token: "77434489365606401-1",
                offer_id: "",
                trade_type: "orderbook",
                seller:
                  "GBDTBUKFHJOEAFAVNPGIY65CBIH75DYEZ5VQXOE7YHZM7AJKDNEOW5JG",
                sold_amount: "",
                sold_asset_type: "",
                buyer:
                  "GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY",
                bought_amount: "",
                bought_asset_type: "",
                created_at: "2018-05-23T22:42:28Z"
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY/trades"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .forAccount(
            "GABJBA4HI4LVKWAYORE7SOAAZMVXDHI566JBSD25O5TRDM7LVID6YOXY"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for paging", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=1&cursor=64199539053039617-0"
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=1&cursor=64199676491993090-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?order=desc&limit=1&cursor=64199676491993090-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GBBHSWC3XSUFKEFDPQO346BCLM3EAJHICWRVSVIQOG4YBIH3A2VCJ6G2"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GDBXANSAUQ5WBFSA6LFQXR5PYVYAQ3T4KI4LHZ3YAAEFI3BS2Z3SFRVG"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199676491993090"
                  }
                },
                id: "64199676491993090-0",
                paging_token: "64199676491993090-0",
                ledger_close_time: "2017-12-07T16:47:59Z",
                offer_id: "278245",
                trade_type: "orderbook",
                base_account:
                  "GBBHSWC3XSUFKEFDPQO346BCLM3EAJHICWRVSVIQOG4YBIH3A2VCJ6G2",
                base_amount: "0.0000128",
                base_asset_type: "credit_alphanum4",
                base_asset_code: "BTC",
                base_asset_issuer:
                  "GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG",
                counter_account:
                  "GDBXANSAUQ5WBFSA6LFQXR5PYVYAQ3T4KI4LHZ3YAAEFI3BS2Z3SFRVG",
                counter_amount: "0.0005000",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "ETH",
                counter_asset_issuer:
                  "GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG",
                base_is_seller: false,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trades?order=asc&limit=1&cursor=64199539053039617-0"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .order("asc")
          .limit("1")
          .cursor("64199539053039617-0")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for type orderbook", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&trade_type=orderbook&cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&trade_type=orderbook&cursor=64199539053039617-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?order=desc&limit=200&trade_type=orderbook&cursor=64199539053039617-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199539053039617"
                  }
                },
                id: "64199539053039617-0",
                paging_token: "64199539053039617-0",
                ledger_close_time: "2017-12-07T16:45:19Z",
                offer_id: "278232",
                trade_type: "orderbook",
                base_account:
                  "GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W",
                base_amount: "1269.2134875",
                base_asset_type: "native",
                counter_account:
                  "GC6APVH2HCFB7QLSTG3U55IYSW7ZRNSCTOZZYZJCNHWX2FONCNJNULYN",
                counter_amount: "19637.5167985",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "JPY",
                counter_asset_issuer:
                  "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                base_is_seller: true,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trades?trade_type=orderbook"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .forType("orderbook")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("trades() requests the correct endpoint for type liquidity_pool", function (done) {
        let tradesResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&trade_type=liquidity_pool&cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/trades?order=asc&limit=200&trade_type=liquidity_pool&cursor=64199539053039617-0"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/trades?order=desc&limit=200&trade_type=liquidity_pool&cursor=64199539053039617-0"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  base: {
                    href: "https://horizon-live.stellar.org:1337/accounts/GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W"
                  },
                  counter: {
                    href: "https://horizon-live.stellar.org:1337/liquidity_pool/dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7"
                  },
                  operation: {
                    href: "https://horizon-live.stellar.org:1337/operations/64199539053039617"
                  }
                },
                id: "64199539053039617-0",
                paging_token: "64199539053039617-0",
                ledger_close_time: "2017-12-07T16:45:19Z",
                offer_id: "4616800602922426369",
                trade_type: "liquidity_pool",
                liquidity_pool_fee_bp: 30,
                base_account:
                  "GB7JKG66CJN3ACX5DX43FOZTTSOI7GZUP547I3BSXIJVUX3NRYUXHE6W",
                base_amount: "1269.2134875",
                base_asset_type: "native",
                counter_liquidity_pool_id:
                  "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
                counter_amount: "19637.5167985",
                counter_asset_type: "credit_alphanum4",
                counter_asset_code: "JPY",
                counter_asset_issuer:
                  "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                base_is_seller: true,
                price: {
                  n: "1",
                  d: "2"
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trades?trade_type=liquidity_pool"
            )
          )
          .returns(Promise.resolve({ data: tradesResponse }));

        this.server
          .trades()
          .forType("liquidity_pool")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradesResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("StrictReceivePathCallBuilder", function () {
      let pathsResponse = {
        _embedded: {
          records: [
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [],
              source_amount: "30.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            },
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [
                {
                  asset_code: "1",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                }
              ],
              source_amount: "20.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            },
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [
                {
                  asset_code: "21",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                },
                {
                  asset_code: "22",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                }
              ],
              source_amount: "20.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            }
          ]
        },
        _links: {
          self: {
            href: "/paths/strict-receive"
          }
        }
      };

      it("requests the correct endpoint when source is an account", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/paths/strict-receive?source_account=GARSFJNXJIHO6ULUBK3DBYKVSIZE7SC72S5DYBCHU7DKL22UXKVD7MXP&destination_amount=20.0&destination_asset_type=credit_alphanum4&destination_asset_code=EUR&destination_asset_issuer=GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
            )
          )
          .returns(Promise.resolve({ data: pathsResponse }));

        this.server
          .strictReceivePaths(
            "GARSFJNXJIHO6ULUBK3DBYKVSIZE7SC72S5DYBCHU7DKL22UXKVD7MXP",
            new StellarSdk.Asset(
              "EUR",
              "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
            ),
            "20.0"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              pathsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it("requests the correct endpoint when source is a list of assets", function (done) {
        let destinationAssets = encodeURIComponent(
          "native,EUR:GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN,USD:GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
        );
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              `https://horizon-live.stellar.org:1337/paths/strict-receive?source_assets=${destinationAssets}&destination_amount=20.0&destination_asset_type=credit_alphanum4&destination_asset_code=EUR&destination_asset_issuer=GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN`
            )
          )
          .returns(Promise.resolve({ data: pathsResponse }));

        let assets = [
          StellarSdk.Asset.native(),
          new StellarSdk.Asset(
            "EUR",
            "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
          ),
          new StellarSdk.Asset(
            "USD",
            "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
          )
        ];

        this.server
          .strictReceivePaths(
            assets,
            new StellarSdk.Asset(
              "EUR",
              "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
            ),
            "20.0"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              pathsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("PathStrictSendCallBuilder", function () {
      let pathsResponse = {
        _embedded: {
          records: [
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [],
              source_amount: "30.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            },
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [
                {
                  asset_code: "1",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                }
              ],
              source_amount: "20.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            },
            {
              destination_amount: "20.0000000",
              destination_asset_code: "EUR",
              destination_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              destination_asset_type: "credit_alphanum4",
              path: [
                {
                  asset_code: "21",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                },
                {
                  asset_code: "22",
                  asset_issuer:
                    "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
                  asset_type: "credit_alphanum4"
                }
              ],
              source_amount: "20.0000000",
              source_asset_code: "USD",
              source_asset_issuer:
                "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN",
              source_asset_type: "credit_alphanum4"
            }
          ]
        },
        _links: {
          self: {
            href: "/paths/strict-send"
          }
        }
      };

      it("requests the correct endpoint when destination is account", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/paths/strict-send?source_asset_type=credit_alphanum4&source_asset_code=EUR&source_asset_issuer=GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN&source_amount=20.0&destination_account=GAEDTJ4PPEFVW5XV2S7LUXBEHNQMX5Q2GM562RJGOQG7GVCE5H3HIB4V"
            )
          )
          .returns(Promise.resolve({ data: pathsResponse }));

        this.server
          .strictSendPaths(
            new StellarSdk.Asset(
              "EUR",
              "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
            ),
            "20.0",
            "GAEDTJ4PPEFVW5XV2S7LUXBEHNQMX5Q2GM562RJGOQG7GVCE5H3HIB4V"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              pathsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      it("requests the correct endpoint when destination is a list of assets", function (done) {
        let destinationAssets = encodeURIComponent(
          "native,EUR:GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN,USD:GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
        );
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              `https://horizon-live.stellar.org:1337/paths/strict-send?source_asset_type=credit_alphanum4&source_asset_code=EUR&source_asset_issuer=GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN&source_amount=20.0&destination_assets=${destinationAssets}`
            )
          )
          .returns(Promise.resolve({ data: pathsResponse }));

        let assets = [
          StellarSdk.Asset.native(),
          new StellarSdk.Asset(
            "EUR",
            "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
          ),
          new StellarSdk.Asset(
            "USD",
            "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
          )
        ];

        this.server
          .strictSendPaths(
            new StellarSdk.Asset(
              "EUR",
              "GDSBCQO34HWPGUGQSP3QBFEXVTSR2PW46UIGTHVWGWJGQKH3AFNHXHXN"
            ),
            "20.0",
            assets
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              pathsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("EffectCallBuilder", function () {
      let effectsResponse = {
        _embedded: {
          records: [
            {
              _links: {
                operation: {
                  href: "/operations/146028892161"
                },
                precedes: {
                  href: "/effects?cursor=146028892161-1\u0026order=asc"
                },
                succeeds: {
                  href: "/effects?cursor=146028892161-1\u0026order=desc"
                }
              },
              account:
                "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              paging_token: "146028892161-1",
              starting_balance: "10000000.0",
              type: 0,
              type_s: "account_created"
            }
          ]
        },
        _links: {
          next: {
            href: "/effects?order=asc\u0026limit=1\u0026cursor=146028892161-1"
          },
          prev: {
            href: "/effects?order=desc\u0026limit=1\u0026cursor=146028892161-1"
          },
          self: {
            href: "/effects?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/effects?cursor=b"
            )
          )
          .returns(Promise.resolve({ data: effectsResponse }));

        this.server
          .effects()
          .cursor("b")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              effectsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE/effects"
            )
          )
          .returns(Promise.resolve({ data: effectsResponse }));

        this.server
          .effects()
          .forAccount(
            "GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              effectsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/transactions/ef37d6770c40c3bdb6adba80759f2819971396d1c3dfb7b5611f63ad72a9a4ae/effects"
            )
          )
          .returns(Promise.resolve({ data: effectsResponse }));

        this.server
          .effects()
          .forTransaction(
            "ef37d6770c40c3bdb6adba80759f2819971396d1c3dfb7b5611f63ad72a9a4ae"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              effectsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("rejects two filters", function (done) {
        expect(() =>
          this.server.effects().forOperation("blah").forLedger("234").call()
        ).to.throw(/Too many filters/);
        done();
      });
    });

    describe("OperationCallBuilder", function () {
      let operationsResponse = {
        _embedded: {
          records: [
            {
              _links: {
                effects: {
                  href: "/operations/146028892161/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "/operations?cursor=146028892161\u0026order=asc"
                },
                self: {
                  href: "/operations/146028892161"
                },
                succeeds: {
                  href: "/operations?cursor=146028892161\u0026order=desc"
                },
                transaction: {
                  href: "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3"
                }
              },
              account:
                "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              funder:
                "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
              id: 146028892161,
              paging_token: "146028892161",
              starting_balance: "10000000.0",
              type: 0,
              type_s: "create_account"
            }
          ]
        },
        _links: {
          next: {
            href: "/operations?order=asc\u0026limit=1\u0026cursor=146028892161"
          },
          prev: {
            href: "/operations?order=desc\u0026limit=1\u0026cursor=146028892161"
          },
          self: {
            href: "/operations?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("operation() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/operations/123456789"
            )
          )
          .returns(Promise.resolve({ data: operationsResponse }));

        this.server
          .operations()
          .operation("123456789")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              operationsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE/operations"
            )
          )
          .returns(Promise.resolve({ data: operationsResponse }));

        this.server
          .operations()
          .forAccount(
            "GCGHCFUB6JKQE42C76BK2LYB3EHKP4WQJE624WTSL3CU2PPDYE5RBMJE"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              operationsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forClaimableBalance() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/claimable_balances/000000000102030000000000000000000000000000000000000000000000000000000000/operations"
            )
          )
          .returns(Promise.resolve({ data: operationsResponse }));

        this.server
          .operations()
          .forClaimableBalance(
            "000000000102030000000000000000000000000000000000000000000000000000000000"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              operationsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forLedger() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/ledgers/123456789/operations"
            )
          )
          .returns(Promise.resolve({ data: operationsResponse }));

        this.server
          .operations()
          .forLedger(123456789)
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              operationsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/transactions/blah/operations"
            )
          )
          .returns(Promise.resolve({ data: operationsResponse }));

        this.server
          .operations()
          .forTransaction("blah")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              operationsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("PaymentCallBuilder", function () {
      let paymentsResponse = {
        _embedded: {
          records: [
            {
              _links: {
                effects: {
                  href: "/operations/146028892161/effects{?cursor,limit,order}",
                  templated: true
                },
                precedes: {
                  href: "/operations?cursor=146028892161\u0026order=asc"
                },
                self: {
                  href: "/operations/146028892161"
                },
                succeeds: {
                  href: "/operations?cursor=146028892161\u0026order=desc"
                },
                transaction: {
                  href: "/transactions/991534d902063b7715cd74207bef4e7bd7aa2f108f62d3eba837ce6023b2d4f3"
                }
              },
              account:
                "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K",
              funder:
                "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
              id: 146028892161,
              paging_token: "146028892161",
              starting_balance: "10000000.0",
              type: 0,
              type_s: "create_account"
            }
          ]
        },
        _links: {
          next: {
            href: "/payments?order=asc\u0026limit=1\u0026cursor=146028892161"
          },
          prev: {
            href: "/payments?order=desc\u0026limit=1\u0026cursor=146028892161"
          },
          self: {
            href: "/payments?order=asc\u0026limit=1\u0026cursor="
          }
        }
      };

      it("forAccount() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/payments"
            )
          )
          .returns(Promise.resolve({ data: paymentsResponse }));

        this.server
          .payments()
          .forAccount(
            "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              paymentsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forLedger() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/ledgers/123456789/payments"
            )
          )
          .returns(Promise.resolve({ data: paymentsResponse }));

        this.server
          .payments()
          .forLedger("123456789")
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              paymentsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("forTransaction() requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/transactions/77277606902d80a03a892536ebff8466726a4e55c3923ec2d3eeb3aa5bdc3731/payments"
            )
          )
          .returns(Promise.resolve({ data: paymentsResponse }));

        this.server
          .payments()
          .forTransaction(
            "77277606902d80a03a892536ebff8466726a4e55c3923ec2d3eeb3aa5bdc3731"
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              paymentsResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("FriendbotCallBuilder", function () {
      let friendbotResponse = {
        ledger: 2
      };

      it("requests the correct endpoint", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/friendbot?addr=GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K"
            )
          )
          .returns(Promise.resolve({ data: friendbotResponse }));

        this.server
          .friendbot("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
          .call()
          .then(function (response) {
            expect(response.ledger).to.be.equal(friendbotResponse.ledger);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("TradeAggregationCallBuilder", function () {
      let tradeAggregationResponse = {
        _links: {
          self: {
            href: "https://horizon.stellar.org/trade_aggregations?base_asset_type=native\u0026counter_asset_type=credit_alphanum4\u0026counter_asset_code=BTC\u0026counter_asset_issuer=GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH\u0026start_time=1512689100000\u0026end_time=1512775500000\u0026resolution=300000"
          },
          next: {
            href: "https://horizon.stellar.org/trade_aggregations?base_asset_type=native\u0026counter_asset_code=BTC\u0026counter_asset_issuer=GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH\u0026counter_asset_type=credit_alphanum4\u0026end_time=1512775500000\u0026resolution=300000\u0026start_time=1512765000000"
          },
          prev: {
            href: ""
          }
        },
        _embedded: {
          records: [
            {
              timestamp: 1512731100000,
              trade_count: 2,
              base_volume: "341.8032786",
              counter_volume: "0.0041700",
              avg: "0.0000122",
              high: "0.0000122",
              low: "0.0000122",
              open: "0.0000122",
              close: "0.0000122"
            },
            {
              timestamp: 1512732300000,
              trade_count: 1,
              base_volume: "233.6065573",
              counter_volume: "0.0028500",
              avg: "0.0000122",
              high: "0.0000122",
              low: "0.0000122",
              open: "0.0000122",
              close: "0.0000122"
            },
            {
              timestamp: 1512764700000,
              trade_count: 1,
              base_volume: "451.0000000",
              counter_volume: "0.0027962",
              avg: "0.0000062",
              high: "0.0000062",
              low: "0.0000062",
              open: "0.0000062",
              close: "0.0000062"
            }
          ]
        }
      };

      it("requests the correct endpoint native/credit", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=BTC&counter_asset_issuer=GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH&start_time=1512689100000&end_time=1512775500000&resolution=300000"
            )
          )
          .returns(Promise.resolve({ data: tradeAggregationResponse }));

        this.server
          .tradeAggregation(
            StellarSdk.Asset.native(),
            new StellarSdk.Asset(
              "BTC",
              "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH"
            ),
            1512689100000,
            1512775500000,
            300000,
            0
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradeAggregationResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("requests the correct endpoint credit/native", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/trade_aggregations?base_asset_type=credit_alphanum4&base_asset_code=BTC&base_asset_issuer=GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH&counter_asset_type=native&start_time=1512689100000&end_time=1512775500000&resolution=300000"
            )
          )
          .returns(Promise.resolve({ data: tradeAggregationResponse }));

        this.server
          .tradeAggregation(
            new StellarSdk.Asset(
              "BTC",
              "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH"
            ),
            StellarSdk.Asset.native(),
            1512689100000,
            1512775500000,
            300000,
            0
          )
          .call()
          .then(function (response) {
            expect(response.records).to.be.deep.equal(
              tradeAggregationResponse._embedded.records
            );
            expect(response.next).to.be.a("function");
            expect(response.prev).to.be.a("function");
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("AssetsCallBuilder", function () {
      it("requests the correct endpoint", function (done) {
        let assetsResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/assets?order=asc\u0026limit=1\u0026cursor="
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/assets?order=asc\u0026limit=1\u0026cursor=9HORIZONS_GB2HXY7UEDCSHOWZ4553QFGFILNU73OFS2P4HU5IB3UUU66TWPBPVTGW_credit_alphanum12"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/assets?order=desc\u0026limit=1\u0026cursor=9HORIZONS_GB2HXY7UEDCSHOWZ4553QFGFILNU73OFS2P4HU5IB3UUU66TWPBPVTGW_credit_alphanum12"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  toml: {
                    href: ""
                  }
                },
                asset_type: "credit_alphanum12",
                asset_code: "9HORIZONS",
                asset_issuer:
                  "GB2HXY7UEDCSHOWZ4553QFGFILNU73OFS2P4HU5IB3UUU66TWPBPVTGW",
                paging_token:
                  "9HORIZONS_GB2HXY7UEDCSHOWZ4553QFGFILNU73OFS2P4HU5IB3UUU66TWPBPVTGW_credit_alphanum12",
                accounts: {
                  authorized: 2,
                  authorized_to_maintain_liabilities: 1,
                  unauthorized: 0
                },
                num_claimable_balances: 3,
                num_contracts: 2,
                balances: {
                  authorized: "1000000.0000000",
                  authorized_to_maintain_liabilities: "500000.0000000",
                  unauthorized: "0.0000000"
                },
                claimable_balances_amount: "0.0000000",
                contracts_amount: "1000.0000000",
                amount: "1000000.0000000",
                num_accounts: 2,
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                }
              }
            ]
          }
        };

        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match("https://horizon-live.stellar.org:1337/assets?limit=1")
          )
          .returns(Promise.resolve({ data: assetsResponse }));

        this.server
          .assets()
          .limit("1")
          .call()
          .then(function (response) {
            expect(response.records).to.be.equal(
              assetsResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("requests the correct endpoint (asset_code)", function (done) {
        let assetsCodeResponse = {
          _links: {
            self: {
              href: "https://horizon-live.stellar.org:1337/assets?order=asc\u0026limit=1\u0026cursor=\u0026asset_code=USD"
            },
            next: {
              href: "https://horizon-live.stellar.org:1337/assets?order=asc\u0026limit=1\u0026cursor=USD_GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R_credit_alphanum4\u0026asset_code=USD"
            },
            prev: {
              href: "https://horizon-live.stellar.org:1337/assets?order=desc\u0026limit=1\u0026cursor=USD_GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R_credit_alphanum4\u0026asset_code=USD"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  toml: {
                    href: ""
                  }
                },
                asset_type: "credit_alphanum4",
                asset_code: "USD",
                asset_issuer:
                  "GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R",
                paging_token:
                  "USD_GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R_credit_alphanum4",
                accounts: {
                  authorized: 127,
                  authorized_to_maintain_liabilities: 64,
                  unauthorized: 0
                },
                num_claimable_balances: 3,
                num_contracts: 2,
                balances: {
                  authorized: "111.0010000",
                  authorized_to_maintain_liabilities: "55.5005000",
                  unauthorized: "0.0000000"
                },
                claimable_balances_amount: "0.0000000",
                contracts_amount: "10000.0000000",
                amount: "111.0010000",
                num_accounts: 127,
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                }
              }
            ]
          }
        };
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/assets?asset_code=USD&limit=1"
            )
          )
          .returns(Promise.resolve({ data: assetsCodeResponse }));

        this.server
          .assets()
          .forCode("USD")
          .limit("1")
          .call()
          .then(function (response) {
            expect(response.records).to.be.equal(
              assetsCodeResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("requests the correct endpoint (asset_issuer)", function (done) {
        let assetIssuerResponse = {
          _links: {
            self: {
              href: "http://horizon-testnet.stellar.org:1337/assets?order=asc\u0026limit=10\u0026cursor=\u0026asset_issuer=GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN"
            },
            next: {
              href: "http://horizon-testnet.stellar.org:1337/assets?order=asc\u0026limit=10\u0026cursor=00acc1_GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN_credit_alphanum12\u0026asset_issuer=GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN"
            },
            prev: {
              href: "http://horizon-testnet.stellar.org:1337/assets?order=desc\u0026limit=10\u0026cursor=004d40_GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN_credit_alphanum12\u0026asset_issuer=GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN"
            }
          },
          _embedded: {
            records: [
              {
                _links: {
                  toml: {
                    href: ""
                  }
                },
                asset_type: "credit_alphanum12",
                asset_code: "004d40",
                asset_issuer:
                  "GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN",
                paging_token:
                  "004d40_GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN_credit_alphanum12",
                accounts: {
                  authorized: 18,
                  authorized_to_maintain_liabilities: 9,
                  unauthorized: 0
                },
                num_claimable_balances: 3,
                num_contracts: 2,
                balances: {
                  authorized: "757.0000000",
                  authorized_to_maintain_liabilities: "378.5000000",
                  unauthorized: "0.0000000"
                },
                claimable_balances_amount: "0.0000000",
                contracts_amount: "10000.0000000",
                amount: "757.0000000",
                num_accounts: 18,
                flags: {
                  auth_required: false,
                  auth_revocable: false,
                  auth_immutable: false,
                  auth_clawback_enabled: false
                }
              }
            ]
          }
        };
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/assets?asset_issuer=GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN&limit=1"
            )
          )
          .returns(Promise.resolve({ data: assetIssuerResponse }));

        this.server
          .assets()
          .forIssuer("GCOGPF7IRVXUCJZAQWXVFQEE4HAOCTDGZI2QZSMKLM5BTTGRLY6GDOJN")
          .limit("1")
          .call()
          .then(function (response) {
            expect(response.records).to.be.equal(
              assetIssuerResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      let assetCodeIssuerResponse = {
        _links: {
          self: {
            href: "http://horizon-testnet.stellar.org/assets?order=asc\u0026limit=10\u0026cursor=\u0026asset_code=USD\u0026asset_issuer=GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR"
          },
          next: {
            href: "http://horizon-testnet.stellar.org/assets?order=asc\u0026limit=10\u0026cursor=USD_GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR_credit_alphanum4\u0026asset_code=USD\u0026asset_issuer=GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR"
          },
          prev: {
            href: "http://horizon-testnet.stellar.org/assets?order=desc\u0026limit=10\u0026cursor=USD_GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR_credit_alphanum4\u0026asset_code=USD\u0026asset_issuer=GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR"
          }
        },
        _embedded: {
          records: [
            {
              _links: {
                toml: {
                  href: "https://bakalr/.well-known/stellar.toml"
                }
              },
              asset_type: "credit_alphanum4",
              asset_code: "USD",
              asset_issuer:
                "GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR",
              paging_token:
                "USD_GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR_credit_alphanum4",
              accounts: {
                authorized: 1,
                authorized_to_maintain_liabilities: 0,
                unauthorized: 0
              },
              num_claimable_balances: 0,
              num_contracts: 2,
              balances: {
                authorized: "1387.0000000",
                authorized_to_maintain_liabilities: "0.0000000",
                unauthorized: "0.0000000"
              },
              claimable_balances_amount: "0.0000000",
              contracts_amount: "10000.0000000",
              amount: "1387.0000000",
              num_accounts: 1,
              flags: {
                auth_required: true,
                auth_revocable: true,
                auth_immutable: false,
                auth_clawback_enabled: false
              }
            }
          ]
        }
      };
      it("requests the correct endpoint (asset_code then asset_issuer)", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/assets?asset_issuer=GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR&asset_code=USD"
            )
          )
          .returns(Promise.resolve({ data: assetCodeIssuerResponse }));

        this.server
          .assets()
          .forIssuer("GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR")
          .forCode("USD")
          .call()
          .then(function (response) {
            expect(response.records).to.be.equal(
              assetCodeIssuerResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });

      it("requests the correct endpoint (asset_issuer then asset_code)", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/assets?asset_code=USD&asset_issuer=GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR"
            )
          )
          .returns(Promise.resolve({ data: assetCodeIssuerResponse }));

        this.server
          .assets()
          .forCode("USD")
          .forIssuer("GBW3EZBZKRERB4JUDWGQPIBGHKJ4XPOFG2VQ2WTFR4F7TYC5WS7F3XGR")
          .call()
          .then(function (response) {
            expect(response.records).to.be.equal(
              assetCodeIssuerResponse._embedded.records
            );
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    describe("Regressions", function () {
      it("offers callBuilder does not pollute Server instance URI #379", function (done) {
        this.axiosMock
          .expects("get")
          .withArgs(
            sinon.match(
              "https://horizon-live.stellar.org:1337/accounts/GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K/effects"
            )
          )
          .returns(Promise.resolve({ data: {} }));

        const account =
          "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K";

        const offerCallBuilder = this.server.offers("accounts", account);
        const effectCallBuilder = this.server
          .effects()
          .forAccount(account)
          .limit(1);
        effectCallBuilder
          .call()
          .then(function (response) {
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });
  });
});
