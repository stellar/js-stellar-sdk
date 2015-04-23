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
                sequence: 1,
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
    }
}