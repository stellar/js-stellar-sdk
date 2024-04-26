# Contract Spec and JSON Schema

Currently the Contract Spec class can generate methods for encoding a JSON object into XDR. JSON schema describes a valid JSON value. There are then validators that can check if the value is valid.

## Example Schema

The following is an example used in the tests:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/tuple_strukt",
  "definitions": {
    "U32": {
      "type": "integer",
      "minimum": 0,
      "maximum": 4294967295
    },
    "I32": {
      "type": "integer",
      "minimum": -2147483648,
      "maximum": 2147483647
    },
    "U64": {
      "type": "string",
      "pattern": "^([1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 20
    },
    "I64": {
      "type": "string",
      "pattern": "^(-?[1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 21
    },
    "U128": {
      "type": "string",
      "pattern": "^([1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 39
    },
    "I128": {
      "type": "string",
      "pattern": "^(-?[1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 40
    },
    "U256": {
      "type": "string",
      "pattern": "^([1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 78
    },
    "I256": {
      "type": "string",
      "pattern": "^(-?[1-9][0-9]*|0)$",
      "minLength": 1,
      "maxLength": 79
    },
    "Address": {
      "type": "string",
      "format": "address",
      "description": "Address can be a public key or contract id"
    },
    "ScString": {
      "type": "string",
      "description": "ScString is a string"
    },
    "ScSymbol": {
      "type": "string",
      "description": "ScString is a string"
    },
    "DataUrl": {
      "type": "string",
      "pattern": "^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?$"
    },
    "Test": {
      "description": "This is from the rust doc above the struct Test",
      "properties": {
        "a": {
          "$ref": "#/definitions/U32"
        },
        "b": {
          "type": "boolean"
        },
        "c": {
          "$ref": "#/definitions/ScSymbol"
        },
        "additionalProperties": false
      },
      "required": [
        "a",
        "b",
        "c"
      ],
      "type": "object"
    },
    "SimpleEnum": {
      "oneOf": [
        {
          "type": "object",
          "title": "First",
          "properties": {
            "tag": "First"
          },
          "additionalProperties": false,
          "required": [
            "tag"
          ]
        },
        {
          "type": "object",
          "title": "Second",
          "properties": {
            "tag": "Second"
          },
          "additionalProperties": false,
          "required": [
            "tag"
          ]
        },
        {
          "type": "object",
          "title": "Third",
          "properties": {
            "tag": "Third"
          },
          "additionalProperties": false,
          "required": [
            "tag"
          ]
        }
      ]
    },
    "RoyalCard": {
      "oneOf": [
        {
          "description": "",
          "title": "Jack",
          "enum": [
            11
          ],
          "type": "number"
        },
        {
          "description": "",
          "title": "Queen",
          "enum": [
            12
          ],
          "type": "number"
        },
        {
          "description": "",
          "title": "King",
          "enum": [
            13
          ],
          "type": "number"
        }
      ]
    },
    "TupleStruct": {
      "type": "array",
      "items": [
        {
          "$ref": "#/definitions/Test"
        },
        {
          "$ref": "#/definitions/SimpleEnum"
        }
      ],
      "minItems": 2,
      "maxItems": 2
    },
    "ComplexEnum": {
      "oneOf": [
        {
          "type": "object",
          "title": "Struct",
          "properties": {
            "tag": "Struct",
            "values": {
              "type": "array",
              "items": [
                {
                  "$ref": "#/definitions/Test"
                }
              ]
            }
          },
          "required": [
            "tag",
            "values"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "title": "Tuple",
          "properties": {
            "tag": "Tuple",
            "values": {
              "type": "array",
              "items": [
                {
                  "$ref": "#/definitions/TupleStruct"
                }
              ]
            }
          },
          "required": [
            "tag",
            "values"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "title": "Enum",
          "properties": {
            "tag": "Enum",
            "values": {
              "type": "array",
              "items": [
                {
                  "$ref": "#/definitions/SimpleEnum"
                }
              ]
            }
          },
          "required": [
            "tag",
            "values"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "title": "Asset",
          "properties": {
            "tag": "Asset",
            "values": {
              "type": "array",
              "items": [
                {
                  "$ref": "#/definitions/Address"
                },
                {
                  "$ref": "#/definitions/I128"
                }
              ]
            }
          },
          "required": [
            "tag",
            "values"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "title": "Void",
          "properties": {
            "tag": "Void"
          },
          "additionalProperties": false,
          "required": [
            "tag"
          ]
        }
      ]
    },
    "hello": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "hello": {
              "$ref": "#/definitions/ScSymbol"
            }
          },
          "type": "object",
          "required": [
            "hello"
          ]
        }
      },
      "additionalProperties": false
    },
    "woid": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {},
          "type": "object"
        }
      },
      "additionalProperties": false
    },
    "val": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {},
          "type": "object"
        }
      },
      "additionalProperties": false
    },
    "u32_fail_on_even": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "u32_": {
              "$ref": "#/definitions/U32"
            }
          },
          "type": "object",
          "required": [
            "u32_"
          ]
        }
      },
      "additionalProperties": false
    },
    "u32_": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "u32_": {
              "$ref": "#/definitions/U32"
            }
          },
          "type": "object",
          "required": [
            "u32_"
          ]
        }
      },
      "additionalProperties": false
    },
    "i32_": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "i32_": {
              "$ref": "#/definitions/I32"
            }
          },
          "type": "object",
          "required": [
            "i32_"
          ]
        }
      },
      "additionalProperties": false
    },
    "i64_": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "i64_": {
              "$ref": "#/definitions/I64"
            }
          },
          "type": "object",
          "required": [
            "i64_"
          ]
        }
      },
      "additionalProperties": false
    },
    "strukt_hel": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "strukt": {
              "$ref": "#/definitions/Test"
            }
          },
          "type": "object",
          "required": [
            "strukt"
          ]
        }
      },
      "description": "Example contract method which takes a struct",
      "additionalProperties": false
    },
    "strukt": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "strukt": {
              "$ref": "#/definitions/Test"
            }
          },
          "type": "object",
          "required": [
            "strukt"
          ]
        }
      },
      "additionalProperties": false
    },
    "simple": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "simple": {
              "$ref": "#/definitions/SimpleEnum"
            }
          },
          "type": "object",
          "required": [
            "simple"
          ]
        }
      },
      "additionalProperties": false
    },
    "complex": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "complex": {
              "$ref": "#/definitions/ComplexEnum"
            }
          },
          "type": "object",
          "required": [
            "complex"
          ]
        }
      },
      "additionalProperties": false
    },
    "addresse": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "addresse": {
              "$ref": "#/definitions/Address"
            }
          },
          "type": "object",
          "required": [
            "addresse"
          ]
        }
      },
      "additionalProperties": false
    },
    "bytes": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "bytes": {
              "$ref": "#/definitions/DataUrl"
            }
          },
          "type": "object",
          "required": [
            "bytes"
          ]
        }
      },
      "additionalProperties": false
    },
    "bytes_n": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "bytes_n": {
              "$ref": "#/definitions/DataUrl",
              "maxLength": 9
            }
          },
          "type": "object",
          "required": [
            "bytes_n"
          ]
        }
      },
      "additionalProperties": false
    },
    "card": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "card": {
              "$ref": "#/definitions/RoyalCard"
            }
          },
          "type": "object",
          "required": [
            "card"
          ]
        }
      },
      "additionalProperties": false
    },
    "boolean": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "boolean": {
              "type": "boolean"
            }
          },
          "type": "object",
          "required": [
            "boolean"
          ]
        }
      },
      "additionalProperties": false
    },
    "not": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "boolean": {
              "type": "boolean"
            }
          },
          "type": "object",
          "required": [
            "boolean"
          ]
        }
      },
      "description": "Negates a boolean value",
      "additionalProperties": false
    },
    "i128": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "i128": {
              "$ref": "#/definitions/I128"
            }
          },
          "type": "object",
          "required": [
            "i128"
          ]
        }
      },
      "additionalProperties": false
    },
    "u128": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "u128": {
              "$ref": "#/definitions/U128"
            }
          },
          "type": "object",
          "required": [
            "u128"
          ]
        }
      },
      "additionalProperties": false
    },
    "multi_args": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "a": {
              "$ref": "#/definitions/U32"
            },
            "b": {
              "type": "boolean"
            }
          },
          "type": "object",
          "required": [
            "a",
            "b"
          ]
        }
      },
      "additionalProperties": false
    },
    "map": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "map": {
              "type": "array",
              "items": {
                "type": "array",
                "items": [
                  {
                    "$ref": "#/definitions/U32"
                  },
                  {
                    "type": "boolean"
                  }
                ],
                "minItems": 2,
                "maxItems": 2
              }
            }
          },
          "type": "object",
          "required": [
            "map"
          ]
        }
      },
      "additionalProperties": false
    },
    "vec": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "vec": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/U32"
              }
            }
          },
          "type": "object",
          "required": [
            "vec"
          ]
        }
      },
      "additionalProperties": false
    },
    "tuple": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "tuple": {
              "type": "array",
              "items": [
                {
                  "$ref": "#/definitions/ScSymbol"
                },
                {
                  "$ref": "#/definitions/U32"
                }
              ],
              "minItems": 2,
              "maxItems": 2
            }
          },
          "type": "object",
          "required": [
            "tuple"
          ]
        }
      },
      "additionalProperties": false
    },
    "option": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "option": {
              "$ref": "#/definitions/U32"
            }
          },
          "type": "object"
        }
      },
      "description": "Example of an optional argument",
      "additionalProperties": false
    },
    "u256": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "u256": {
              "$ref": "#/definitions/U256"
            }
          },
          "type": "object",
          "required": [
            "u256"
          ]
        }
      },
      "additionalProperties": false
    },
    "i256": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "i256": {
              "$ref": "#/definitions/I256"
            }
          },
          "type": "object",
          "required": [
            "i256"
          ]
        }
      },
      "additionalProperties": false
    },
    "string": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "string": {
              "$ref": "#/definitions/ScString"
            }
          },
          "type": "object",
          "required": [
            "string"
          ]
        }
      },
      "additionalProperties": false
    },
    "tuple_strukt": {
      "properties": {
        "args": {
          "additionalProperties": false,
          "properties": {
            "tuple_strukt": {
              "$ref": "#/definitions/TupleStruct"
            }
          },
          "type": "object",
          "required": [
            "tuple_strukt"
          ]
        }
      },
      "additionalProperties": false
    }
  }
}
```