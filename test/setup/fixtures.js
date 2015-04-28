import {Currency} from "../../src/currency";
import {Account} from "../../src/account";

export default {
  DEV_SERVER_ENDPOINT: "http://localhost:1337/fixtures",
  ROOT_ACCOUNT: "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
  TEST_TRANSACTION_BLOB: "899b2840ed5636c56ddc5f14b23975f79f1ba2388d2694e4c56ecdddc960e5ef000003e8000000000000000100000000ffffffff000000010000000000000000899b2840ed5636c56ddc5f14b23975f79f1ba2388d2694e4c56ecdddc960e5ef0000000000000000000003e80000002000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e800000001899b28404b3c23b5b641c1954ce9d730cc1939ba769a8b31c1f084d70848927d738207ced13a979528c7eb582dbc81f87728a1ac991d019a63e4a599c1807c15c2221e09",
  TEST_TRANSACTION_HASH: "bc27b615d05727ce5702815454657c0c8f896ac6bb48bfa0862c44c180a73135",

  TEST_LOAD_ACCOUNT: {
    SUCCESS: {
      REQUEST: "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
      ACCOUNT: Account.fromAddress("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC"),
      RESULT_ACCOUNT: {
        address: "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
        sequence: 2,
        balances: [
          {
            // a currency object
            currency: Currency.native(),
            balance: 99999999999999980
          }
        ]
      },
      RESPONSE: {
        body: {
          "_links": {
            "self": {
              "href": "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC"
            },
            "transactions": {
              "href": "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions{?order}{?limit}{?after}{?before}"
            }
          },
          "id": "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
          "address": "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
          "sequence": 1,
          "balances": [
            {
              "currency": {
                "type": "native"
              },
              "balance": 99999999999999980
            }
          ]
        },
        status: 200
      }
    }
  },

  TEST_GET_ACCOUNT_TRANSACTIONS: {
    DEFAULT: {
      REQUEST: "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?limit=100",
      RESPONSE: {
        body:
        {
          "_links": {
            "next": {
              "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=36323a31&limit=10&order=asc"
            }
          },
          "_embedded": {
            "records": [
              {
                "_links": {
                  "self": {
                    "href": "http://localhost:1337/transactions/86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5"
                  },
                  "account": {
                    "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC"
                  }
                },
                "hash": "86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5",
                "ledger": 55,
                "application_order": [
                  55,
                  1
                ],
                "account": "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
                "account_sequence": 1,
                "max_fee": 1000,
                "fee_paid": 10,
                "operation_count": 1
              }
            ]
          }
        },
        status: 200
      }
    },
    WITH_LIMIT:{
      REQUEST: "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?limit=1",
      RESPONSE: {
        body:
        {
          "_links": {
            "next": {
              "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=36323a31&limit=10&order=asc"
            }
          },
          "_embedded": {
            "records": [
              {
                "_links": {
                  "self": {
                    "href": "http://localhost:1337/transactions/86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5"
                  },
                  "account": {
                    "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC"
                  }
                },
                "hash": "86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5",
                "ledger": 55,
                "application_order": [
                  55,
                  1
                ],
                "account": "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
                "account_sequence": 1,
                "max_fee": 1000,
                "fee_paid": 10,
                "operation_count": 1
              }
            ]
          }
        },
        status: 200
      }
    }
  },

  TEST_GET_NEXT_TRANSACTIONS: {
    // emulate a TransactionPage object with the appropriate next field
    TRANSACTION_PAGE: {
      // we'll make sure this is the endpoint called
      next: "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=36323a31&limit=10&order=asc"
    },
    REQUEST: "/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=36323a31&limit=10&order=asc",
    RESPONSE: {
      body:
      {
        "_links": {
          "next": {
            "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=36323a31&limit=10&order=asc"
          }
        },
        "_embedded": {
          "records": [
            {
              "_links": {
                "self": {
                  "href": "http://localhost:1337/transactions/86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5"
                },
                "account": {
                  "href": "http://localhost:1337/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC"
                }
              },
              "hash": "86c251613f8ac1e4fe713bff1939cdefe46dd2877ddd34671506ad5dbc7e9bb5",
              "ledger": 55,
              "application_order": [
                55,
                1
              ],
              "account": "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC",
              "account_sequence": 1,
              "max_fee": 1000,
              "fee_paid": 10,
              "operation_count": 1
            }
          ]
        }
      },
      status: 200
    }
  }
}