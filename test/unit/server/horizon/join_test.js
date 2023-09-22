const { HorizonServer } = StellarSdk;

describe("Server - CallBuilder#join", function () {
  beforeEach(function () {
    this.server = new HorizonServer("https://horizon-live.stellar.org:1337");
    this.axiosMock = sinon.mock(HorizonAxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe("#join", function () {
    const transaction = {
      memo: "",
      _links: {
        self: {
          href: "https://horizon-live.stellar.org:1337/transactions/de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5",
        },
        account: {
          href: "https://horizon-live.stellar.org:1337/accounts/GBIABVWR2LOKFDMAI6QA2NGT4G54O3BC577GAWDQ6QMOUP5E3ULBBGYX",
        },
        ledger: {
          href: "https://horizon-live.stellar.org:1337/ledgers/679846",
        },
        operations: {
          href: "https://horizon-live.stellar.org:1337/transactions/de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5/operations{?cursor,limit,order}",
          templated: true,
        },
        effects: {
          href: "https://horizon-live.stellar.org:1337/transactions/de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5/effects{?cursor,limit,order}",
          templated: true,
        },
        precedes: {
          href: "https://horizon-live.stellar.org:1337/transactions?order=asc\u0026cursor=2919916336320512",
        },
        succeeds: {
          href: "https://horizon-live.stellar.org:1337/transactions?order=desc\u0026cursor=2919916336320512",
        },
      },
      id: "de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5",
      paging_token: "2919916336320512",
      successful: true,
      hash: "de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5",
      ledger: 679846,
      created_at: "2019-09-12T14:24:35Z",
      source_account:
        "GBIABVWR2LOKFDMAI6QA2NGT4G54O3BC577GAWDQ6QMOUP5E3ULBBGYX",
      source_account_sequence: "2954696981479425",
      fee_charged: 3600,
      max_fee: 3600,
      operation_count: 6,
      envelope_xdr:
        "AAAAAFAA1tHS3KKNgEegDTTT4bvHbCLv/mBYcPQY6j+k3RYQAAAOEAAKf0gAAAABAAAAAAAAAAEAAAAAAAAABgAAAAEAAAAA/vzW27XUS0+Xg+vfq2MERAh2+SdzYshzMcLIcp/NsWwAAAABAAAAAIiGNYyweZIad3hrO4nQqK61U0Rs38vKAESO3qPAncsGAAAAATE4AAAAAAAA/vzW27XUS0+Xg+vfq2MERAh2+SdzYshzMcLIcp/NsWwAAAAAAAAAAwAAAAEAAAAA/vzW27XUS0+Xg+vfq2MERAh2+SdzYshzMcLIcp/NsWwAAAAGAAAAAmJvbmRTaGFyZQAAAAAAAACTGdj4LvjCooulIWoF2ATREiHt8CUE0zFcoY2AYifc9nU43Pt1hkEAAAAAAQAAAABQANbR0tyijYBHoA000+G7x2wi7/5gWHD0GOo/pN0WEAAAAAEAAAAA/vzW27XUS0+Xg+vfq2MERAh2+SdzYshzMcLIcp/NsWwAAAACYm9uZFNoYXJlAAAAAAAAAJMZ2Pgu+MKii6UhagXYBNESIe3wJQTTMVyhjYBiJ9z2AAAAF0h26AAAAAABAAAAAFAA1tHS3KKNgEegDTTT4bvHbCLv/mBYcPQY6j+k3RYQAAAACgAAAB9ySTogICAgICAgM1E5MFVTRCAgICAgICAzUTkwVVNEAAAAAAAAAAABAAAAAFAA1tHS3KKNgEegDTTT4bvHbCLv/mBYcPQY6j+k3RYQAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAADBqFM6zp4S5rWyOHbBzm9AiebKnFa4dy+9cld3GrQbGQAAAP8AAAABAAAAAP781tu11EtPl4Pr36tjBEQIdvknc2LIczHCyHKfzbFsAAAAAgAAAAFVU0QAAAAAAG5o7FuqrASKyy/Xfs1y4q0FPUniqOT6fmkDFwPanOlGAAAAF0h26AAAAAAAhbWa5w582SXJESbYxxNo4JMKItv/gWsw0SO8WqlMNYEAAAABVVNEAAAAAABuaOxbqqwEissv137NcuKtBT1J4qjk+n5pAxcD2pzpRgAAABdIdugAAAAAAgAAAAFVU0QAAAAAAG5o7FuqrASKyy/Xfs1y4q0FPUniqOT6fmkDFwPanOlGAAAAAVVTRAAAAAAAbmjsW6qsBIrLL9d+zXLirQU9SeKo5Pp+aQMXA9qc6UYAAAAAAAAAAZ/NsWwAAABA5QcaEgzj+krAtiH0+iRho6gjxWIUMkTfVo28FqoBqlraePffIIDL7TiJN1gMrdZxiBTrsAJvpRqoJtmjEjL8AQ==",
      result_xdr:
        "AAAAAAAADhAAAAAAAAAABgAAAAAAAAABAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAhbWa5w582SXJESbYxxNo4JMKItv/gWsw0SO8WqlMNYEAAAABVVNEAAAAAABuaOxbqqwEissv137NcuKtBT1J4qjk+n5pAxcD2pzpRgAAABdIdugAAAAAAA==",
      result_meta_xdr:
        "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",
      fee_meta_xdr:
        "AAAAAgAAAAMAClg5AAAAAAAAAABQANbR0tyijYBHoA000+G7x2wi7/5gWHD0GOo/pN0WEAAAAASoF8gAAAp/SAAAAAAAAAAGAAAAAAAAAAAAAAAAAAsLCwAAAAQAAAABE/EpwLKV4cIOVgnzPs38d/VhMlCerZKJeZrQDItSTxAAAAAWAAAAAVRTwbkj89ksTEv7fZ757ymL+5KMn3TClrUC9W2dyLCmAAAAFQAAAAHSdKqZF3xBOHELun5ttDzJCH1pUyeAT2uJcjcDbEJrEAAAABcAAAAB3oygVa95cvgX6dP3x6C0gN6CWTvDePDkj4O44xmF5OUAAAAYAAAAAAAAAAAAAAABAApfpgAAAAAAAAAAUADW0dLcoo2AR6ANNNPhu8dsIu/+YFhw9BjqP6TdFhAAAAAEqBe58AAKf0gAAAAAAAAABgAAAAAAAAAAAAAAAAALCwsAAAAEAAAAARPxKcCyleHCDlYJ8z7N/Hf1YTJQnq2SiXma0AyLUk8QAAAAFgAAAAFUU8G5I/PZLExL+32e+e8pi/uSjJ90wpa1AvVtnciwpgAAABUAAAAB0nSqmRd8QThxC7p+bbQ8yQh9aVMngE9riXI3A2xCaxAAAAAXAAAAAd6MoFWveXL4F+nT98egtIDeglk7w3jw5I+DuOMZheTlAAAAGAAAAAAAAAAA",
      memo_type: "text",
      signatures: [
        "5QcaEgzj+krAtiH0+iRho6gjxWIUMkTfVo28FqoBqlraePffIIDL7TiJN1gMrdZxiBTrsAJvpRqoJtmjEjL8AQ==",
      ],
    };
    const operationsResponse = {
      _links: {
        self: {
          href: "https://horizon-live.stellar.org:1337/operations?cursor=\u0026join=transactions\u0026limit=10\u0026order=asc",
        },
        next: {
          href: "https://horizon-live.stellar.org:1337/operations?cursor=2919916336320518\u0026join=transactions\u0026limit=10\u0026order=asc",
        },
        prev: {
          href: "https://horizon-live.stellar.org:1337/operations?cursor=2919916336320518\u0026join=transactions\u0026limit=1\u0026order=asc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              self: {
                href: "https://horizon-live.stellar.org:1337/operations/2919916336320518",
              },
              transaction: {
                href: "https://horizon-live.stellar.org:1337/transactions/de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5",
              },
              effects: {
                href: "https://horizon-live.stellar.org:1337/operations/2919916336320518/effects",
              },
              succeeds: {
                href: "https://horizon-live.stellar.org:1337/effects?order=desc\u0026cursor=2919916336320518",
              },
              precedes: {
                href: "https://horizon-live.stellar.org:1337/effects?order=asc\u0026cursor=2919916336320518",
              },
            },
            id: "2919916336320518",
            paging_token: "2919916336320518",
            transaction_successful: true,
            source_account:
              "GD7PZVW3WXKEWT4XQPV57K3DARCAQ5XZE5ZWFSDTGHBMQ4U7ZWYWZLPC",
            type: "path_payment",
            type_i: 2,
            created_at: "2019-09-12T14:24:35Z",
            transaction_hash:
              "de8ca055af7972f817e9d3f7c7a0b480de82593bc378f0e48f83b8e31985e4e5",
            transaction,
            asset_type: "credit_alphanum4",
            asset_code: "USD",
            asset_issuer:
              "GBXGR3C3VKWAJCWLF7LX5TLS4KWQKPKJ4KUOJ6T6NEBROA62TTUUM6GD",
            from: "GD7PZVW3WXKEWT4XQPV57K3DARCAQ5XZE5ZWFSDTGHBMQ4U7ZWYWZLPC",
            to: "GCC3LGXHBZ6NSJOJCETNRRYTNDQJGCRC3P7YC2ZQ2ER3YWVJJQ2YDUL7",
            amount: "10000.0000000",
            path: [
              {
                asset_type: "credit_alphanum4",
                asset_code: "USD",
                asset_issuer:
                  "GBXGR3C3VKWAJCWLF7LX5TLS4KWQKPKJ4KUOJ6T6NEBROA62TTUUM6GD",
              },
              {
                asset_type: "credit_alphanum4",
                asset_code: "USD",
                asset_issuer:
                  "GBXGR3C3VKWAJCWLF7LX5TLS4KWQKPKJ4KUOJ6T6NEBROA62TTUUM6GD",
              },
            ],
            source_amount: "10000.0000000",
            source_max: "10000.0000000",
            source_asset_type: "credit_alphanum4",
            source_asset_code: "USD",
            source_asset_issuer:
              "GBXGR3C3VKWAJCWLF7LX5TLS4KWQKPKJ4KUOJ6T6NEBROA62TTUUM6GD",
          },
        ],
      },
    };

    it("loads resources in join and avoids extra call to server", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(
          sinon.match(
            "https://horizon-live.stellar.org:1337/operations?join=transactions",
          ),
        )
        .returns(Promise.resolve({ data: operationsResponse }));

      this.server
        .operations()
        .join("transactions")
        .call()
        .then((response) => {
          const record = response.records[0];
          expect(record.transaction).to.be.a("function");

          record.transaction().then((transaction) => {
            expect(transaction).to.deep.equal(transaction);
            done();
          });
        })
        .catch((e) => {
          done(e);
        });
    });
  });
});
