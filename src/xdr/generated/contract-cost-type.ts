import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ContractCostTypeWire = number;

export type ContractCostTypeName =
  | "wasmInsnExec"
  | "memAlloc"
  | "memCpy"
  | "memCmp"
  | "dispatchHostFunction"
  | "visitObject"
  | "valSer"
  | "valDeser"
  | "computeSha256Hash"
  | "computeEd25519PubKey"
  | "verifyEd25519Sig"
  | "vmInstantiation"
  | "vmCachedInstantiation"
  | "invokeVmFunction"
  | "computeKeccak256Hash"
  | "decodeEcdsaCurve256Sig"
  | "recoverEcdsaSecp256k1Key"
  | "int256AddSub"
  | "int256Mul"
  | "int256Div"
  | "int256Pow"
  | "int256Shift"
  | "chaCha20DrawBytes"
  | "parseWasmInstructions"
  | "parseWasmFunctions"
  | "parseWasmGlobals"
  | "parseWasmTableEntries"
  | "parseWasmTypes"
  | "parseWasmDataSegments"
  | "parseWasmElemSegments"
  | "parseWasmImports"
  | "parseWasmExports"
  | "parseWasmDataSegmentBytes"
  | "instantiateWasmInstructions"
  | "instantiateWasmFunctions"
  | "instantiateWasmGlobals"
  | "instantiateWasmTableEntries"
  | "instantiateWasmTypes"
  | "instantiateWasmDataSegments"
  | "instantiateWasmElemSegments"
  | "instantiateWasmImports"
  | "instantiateWasmExports"
  | "instantiateWasmDataSegmentBytes"
  | "sec1DecodePointUncompressed"
  | "verifyEcdsaSecp256r1Sig"
  | "bls12381EncodeFp"
  | "bls12381DecodeFp"
  | "bls12381G1CheckPointOnCurve"
  | "bls12381G1CheckPointInSubgroup"
  | "bls12381G2CheckPointOnCurve"
  | "bls12381G2CheckPointInSubgroup"
  | "bls12381G1ProjectiveToAffine"
  | "bls12381G2ProjectiveToAffine"
  | "bls12381G1Add"
  | "bls12381G1Mul"
  | "bls12381G1Msm"
  | "bls12381MapFpToG1"
  | "bls12381HashToG1"
  | "bls12381G2Add"
  | "bls12381G2Mul"
  | "bls12381G2Msm"
  | "bls12381MapFp2ToG2"
  | "bls12381HashToG2"
  | "bls12381Pairing"
  | "bls12381FrFromU256"
  | "bls12381FrToU256"
  | "bls12381FrAddSub"
  | "bls12381FrMul"
  | "bls12381FrPow"
  | "bls12381FrInv"
  | "bn254EncodeFp"
  | "bn254DecodeFp"
  | "bn254G1CheckPointOnCurve"
  | "bn254G2CheckPointOnCurve"
  | "bn254G2CheckPointInSubgroup"
  | "bn254G1ProjectiveToAffine"
  | "bn254G1Add"
  | "bn254G1Mul"
  | "bn254Pairing"
  | "bn254FrFromU256"
  | "bn254FrToU256"
  | "bn254FrAddSub"
  | "bn254FrMul"
  | "bn254FrPow"
  | "bn254FrInv"
  | "bn254G1Msm";

/**
 * ```xdr
 * enum ContractCostType {
 *     // Cost of running 1 wasm instruction
 *     WasmInsnExec = 0,
 *     // Cost of allocating a slice of memory (in bytes)
 *     MemAlloc = 1,
 *     // Cost of copying a slice of bytes into a pre-allocated memory
 *     MemCpy = 2,
 *     // Cost of comparing two slices of memory
 *     MemCmp = 3,
 *     // Cost of a host function dispatch, not including the actual work done by
 *     // the function nor the cost of VM invocation machinary
 *     DispatchHostFunction = 4,
 *     // Cost of visiting a host object from the host object storage. Exists to
 *     // make sure some baseline cost coverage, i.e. repeatly visiting objects
 *     // by the guest will always incur some charges.
 *     VisitObject = 5,
 *     // Cost of serializing an xdr object to bytes
 *     ValSer = 6,
 *     // Cost of deserializing an xdr object from bytes
 *     ValDeser = 7,
 *     // Cost of computing the sha256 hash from bytes
 *     ComputeSha256Hash = 8,
 *     // Cost of computing the ed25519 pubkey from bytes
 *     ComputeEd25519PubKey = 9,
 *     // Cost of verifying ed25519 signature of a payload.
 *     VerifyEd25519Sig = 10,
 *     // Cost of instantiation a VM from wasm bytes code.
 *     VmInstantiation = 11,
 *     // Cost of instantiation a VM from a cached state.
 *     VmCachedInstantiation = 12,
 *     // Cost of invoking a function on the VM. If the function is a host function,
 *     // additional cost will be covered by `DispatchHostFunction`.
 *     InvokeVmFunction = 13,
 *     // Cost of computing a keccak256 hash from bytes.
 *     ComputeKeccak256Hash = 14,
 *     // Cost of decoding an ECDSA signature computed from a 256-bit prime modulus
 *     // curve (e.g. secp256k1 and secp256r1)
 *     DecodeEcdsaCurve256Sig = 15,
 *     // Cost of recovering an ECDSA secp256k1 key from a signature.
 *     RecoverEcdsaSecp256k1Key = 16,
 *     // Cost of int256 addition (`+`) and subtraction (`-`) operations
 *     Int256AddSub = 17,
 *     // Cost of int256 multiplication (`*`) operation
 *     Int256Mul = 18,
 *     // Cost of int256 division (`/`) operation
 *     Int256Div = 19,
 *     // Cost of int256 power (`exp`) operation
 *     Int256Pow = 20,
 *     // Cost of int256 shift (`shl`, `shr`) operation
 *     Int256Shift = 21,
 *     // Cost of drawing random bytes using a ChaCha20 PRNG
 *     ChaCha20DrawBytes = 22,
 *
 *     // Cost of parsing wasm bytes that only encode instructions.
 *     ParseWasmInstructions = 23,
 *     // Cost of parsing a known number of wasm functions.
 *     ParseWasmFunctions = 24,
 *     // Cost of parsing a known number of wasm globals.
 *     ParseWasmGlobals = 25,
 *     // Cost of parsing a known number of wasm table entries.
 *     ParseWasmTableEntries = 26,
 *     // Cost of parsing a known number of wasm types.
 *     ParseWasmTypes = 27,
 *     // Cost of parsing a known number of wasm data segments.
 *     ParseWasmDataSegments = 28,
 *     // Cost of parsing a known number of wasm element segments.
 *     ParseWasmElemSegments = 29,
 *     // Cost of parsing a known number of wasm imports.
 *     ParseWasmImports = 30,
 *     // Cost of parsing a known number of wasm exports.
 *     ParseWasmExports = 31,
 *     // Cost of parsing a known number of data segment bytes.
 *     ParseWasmDataSegmentBytes = 32,
 *
 *     // Cost of instantiating wasm bytes that only encode instructions.
 *     InstantiateWasmInstructions = 33,
 *     // Cost of instantiating a known number of wasm functions.
 *     InstantiateWasmFunctions = 34,
 *     // Cost of instantiating a known number of wasm globals.
 *     InstantiateWasmGlobals = 35,
 *     // Cost of instantiating a known number of wasm table entries.
 *     InstantiateWasmTableEntries = 36,
 *     // Cost of instantiating a known number of wasm types.
 *     InstantiateWasmTypes = 37,
 *     // Cost of instantiating a known number of wasm data segments.
 *     InstantiateWasmDataSegments = 38,
 *     // Cost of instantiating a known number of wasm element segments.
 *     InstantiateWasmElemSegments = 39,
 *     // Cost of instantiating a known number of wasm imports.
 *     InstantiateWasmImports = 40,
 *     // Cost of instantiating a known number of wasm exports.
 *     InstantiateWasmExports = 41,
 *     // Cost of instantiating a known number of data segment bytes.
 *     InstantiateWasmDataSegmentBytes = 42,
 *
 *     // Cost of decoding a bytes array representing an uncompressed SEC-1 encoded
 *     // point on a 256-bit elliptic curve
 *     Sec1DecodePointUncompressed = 43,
 *     // Cost of verifying an ECDSA Secp256r1 signature
 *     VerifyEcdsaSecp256r1Sig = 44,
 *
 *     // Cost of encoding a BLS12-381 Fp (base field element)
 *     Bls12381EncodeFp = 45,
 *     // Cost of decoding a BLS12-381 Fp (base field element)
 *     Bls12381DecodeFp = 46,
 *     // Cost of checking a G1 point lies on the curve
 *     Bls12381G1CheckPointOnCurve = 47,
 *     // Cost of checking a G1 point belongs to the correct subgroup
 *     Bls12381G1CheckPointInSubgroup = 48,
 *     // Cost of checking a G2 point lies on the curve
 *     Bls12381G2CheckPointOnCurve = 49,
 *     // Cost of checking a G2 point belongs to the correct subgroup
 *     Bls12381G2CheckPointInSubgroup = 50,
 *     // Cost of converting a BLS12-381 G1 point from projective to affine coordinates
 *     Bls12381G1ProjectiveToAffine = 51,
 *     // Cost of converting a BLS12-381 G2 point from projective to affine coordinates
 *     Bls12381G2ProjectiveToAffine = 52,
 *     // Cost of performing BLS12-381 G1 point addition
 *     Bls12381G1Add = 53,
 *     // Cost of performing BLS12-381 G1 scalar multiplication
 *     Bls12381G1Mul = 54,
 *     // Cost of performing BLS12-381 G1 multi-scalar multiplication (MSM)
 *     Bls12381G1Msm = 55,
 *     // Cost of mapping a BLS12-381 Fp field element to a G1 point
 *     Bls12381MapFpToG1 = 56,
 *     // Cost of hashing to a BLS12-381 G1 point
 *     Bls12381HashToG1 = 57,
 *     // Cost of performing BLS12-381 G2 point addition
 *     Bls12381G2Add = 58,
 *     // Cost of performing BLS12-381 G2 scalar multiplication
 *     Bls12381G2Mul = 59,
 *     // Cost of performing BLS12-381 G2 multi-scalar multiplication (MSM)
 *     Bls12381G2Msm = 60,
 *     // Cost of mapping a BLS12-381 Fp2 field element to a G2 point
 *     Bls12381MapFp2ToG2 = 61,
 *     // Cost of hashing to a BLS12-381 G2 point
 *     Bls12381HashToG2 = 62,
 *     // Cost of performing BLS12-381 pairing operation
 *     Bls12381Pairing = 63,
 *     // Cost of converting a BLS12-381 scalar element from U256
 *     Bls12381FrFromU256 = 64,
 *     // Cost of converting a BLS12-381 scalar element to U256
 *     Bls12381FrToU256 = 65,
 *     // Cost of performing BLS12-381 scalar element addition/subtraction
 *     Bls12381FrAddSub = 66,
 *     // Cost of performing BLS12-381 scalar element multiplication
 *     Bls12381FrMul = 67,
 *     // Cost of performing BLS12-381 scalar element exponentiation
 *     Bls12381FrPow = 68,
 *     // Cost of performing BLS12-381 scalar element inversion
 *     Bls12381FrInv = 69,
 *
 *     // Cost of encoding a BN254 Fp (base field element)
 *     Bn254EncodeFp = 70,
 *     // Cost of decoding a BN254 Fp (base field element)
 *     Bn254DecodeFp = 71,
 *     // Cost of checking a G1 point lies on the curve
 *     Bn254G1CheckPointOnCurve = 72,
 *     // Cost of checking a G2 point lies on the curve
 *     Bn254G2CheckPointOnCurve = 73,
 *     // Cost of checking a G2 point belongs to the correct subgroup
 *     Bn254G2CheckPointInSubgroup = 74,
 *     // Cost of converting a BN254 G1 point from projective to affine coordinates
 *     Bn254G1ProjectiveToAffine = 75,
 *     // Cost of performing BN254 G1 point addition
 *     Bn254G1Add = 76,
 *     // Cost of performing BN254 G1 scalar multiplication
 *     Bn254G1Mul = 77,
 *     // Cost of performing BN254 pairing operation
 *     Bn254Pairing = 78,
 *     // Cost of converting a BN254 scalar element from U256
 *     Bn254FrFromU256 = 79,
 *     // Cost of converting a BN254 scalar element to U256
 *     Bn254FrToU256 = 80,
 *     // // Cost of performing BN254 scalar element addition/subtraction
 *     Bn254FrAddSub = 81,
 *     // Cost of performing BN254 scalar element multiplication
 *     Bn254FrMul = 82,
 *     // Cost of performing BN254 scalar element exponentiation
 *     Bn254FrPow = 83,
 *      // Cost of performing BN254 scalar element inversion
 *     Bn254FrInv = 84,
 *     // Cost of performing BN254 G1 multi-scalar multiplication (MSM)
 *     Bn254G1Msm = 85
 * };
 * ```
 */
export class ContractCostType extends EnumValue<ContractCostTypeName> {
  static readonly wasmInsnExec = new ContractCostType("wasmInsnExec", 0);
  static readonly memAlloc = new ContractCostType("memAlloc", 1);
  static readonly memCpy = new ContractCostType("memCpy", 2);
  static readonly memCmp = new ContractCostType("memCmp", 3);
  static readonly dispatchHostFunction = new ContractCostType(
    "dispatchHostFunction",
    4,
  );
  static readonly visitObject = new ContractCostType("visitObject", 5);
  static readonly valSer = new ContractCostType("valSer", 6);
  static readonly valDeser = new ContractCostType("valDeser", 7);
  static readonly computeSha256Hash = new ContractCostType(
    "computeSha256Hash",
    8,
  );
  static readonly computeEd25519PubKey = new ContractCostType(
    "computeEd25519PubKey",
    9,
  );
  static readonly verifyEd25519Sig = new ContractCostType(
    "verifyEd25519Sig",
    10,
  );
  static readonly vmInstantiation = new ContractCostType("vmInstantiation", 11);
  static readonly vmCachedInstantiation = new ContractCostType(
    "vmCachedInstantiation",
    12,
  );
  static readonly invokeVmFunction = new ContractCostType(
    "invokeVmFunction",
    13,
  );
  static readonly computeKeccak256Hash = new ContractCostType(
    "computeKeccak256Hash",
    14,
  );
  static readonly decodeEcdsaCurve256Sig = new ContractCostType(
    "decodeEcdsaCurve256Sig",
    15,
  );
  static readonly recoverEcdsaSecp256k1Key = new ContractCostType(
    "recoverEcdsaSecp256k1Key",
    16,
  );
  static readonly int256AddSub = new ContractCostType("int256AddSub", 17);
  static readonly int256Mul = new ContractCostType("int256Mul", 18);
  static readonly int256Div = new ContractCostType("int256Div", 19);
  static readonly int256Pow = new ContractCostType("int256Pow", 20);
  static readonly int256Shift = new ContractCostType("int256Shift", 21);
  static readonly chaCha20DrawBytes = new ContractCostType(
    "chaCha20DrawBytes",
    22,
  );
  static readonly parseWasmInstructions = new ContractCostType(
    "parseWasmInstructions",
    23,
  );
  static readonly parseWasmFunctions = new ContractCostType(
    "parseWasmFunctions",
    24,
  );
  static readonly parseWasmGlobals = new ContractCostType(
    "parseWasmGlobals",
    25,
  );
  static readonly parseWasmTableEntries = new ContractCostType(
    "parseWasmTableEntries",
    26,
  );
  static readonly parseWasmTypes = new ContractCostType("parseWasmTypes", 27);
  static readonly parseWasmDataSegments = new ContractCostType(
    "parseWasmDataSegments",
    28,
  );
  static readonly parseWasmElemSegments = new ContractCostType(
    "parseWasmElemSegments",
    29,
  );
  static readonly parseWasmImports = new ContractCostType(
    "parseWasmImports",
    30,
  );
  static readonly parseWasmExports = new ContractCostType(
    "parseWasmExports",
    31,
  );
  static readonly parseWasmDataSegmentBytes = new ContractCostType(
    "parseWasmDataSegmentBytes",
    32,
  );
  static readonly instantiateWasmInstructions = new ContractCostType(
    "instantiateWasmInstructions",
    33,
  );
  static readonly instantiateWasmFunctions = new ContractCostType(
    "instantiateWasmFunctions",
    34,
  );
  static readonly instantiateWasmGlobals = new ContractCostType(
    "instantiateWasmGlobals",
    35,
  );
  static readonly instantiateWasmTableEntries = new ContractCostType(
    "instantiateWasmTableEntries",
    36,
  );
  static readonly instantiateWasmTypes = new ContractCostType(
    "instantiateWasmTypes",
    37,
  );
  static readonly instantiateWasmDataSegments = new ContractCostType(
    "instantiateWasmDataSegments",
    38,
  );
  static readonly instantiateWasmElemSegments = new ContractCostType(
    "instantiateWasmElemSegments",
    39,
  );
  static readonly instantiateWasmImports = new ContractCostType(
    "instantiateWasmImports",
    40,
  );
  static readonly instantiateWasmExports = new ContractCostType(
    "instantiateWasmExports",
    41,
  );
  static readonly instantiateWasmDataSegmentBytes = new ContractCostType(
    "instantiateWasmDataSegmentBytes",
    42,
  );
  static readonly sec1DecodePointUncompressed = new ContractCostType(
    "sec1DecodePointUncompressed",
    43,
  );
  static readonly verifyEcdsaSecp256r1Sig = new ContractCostType(
    "verifyEcdsaSecp256r1Sig",
    44,
  );
  static readonly bls12381EncodeFp = new ContractCostType(
    "bls12381EncodeFp",
    45,
  );
  static readonly bls12381DecodeFp = new ContractCostType(
    "bls12381DecodeFp",
    46,
  );
  static readonly bls12381G1CheckPointOnCurve = new ContractCostType(
    "bls12381G1CheckPointOnCurve",
    47,
  );
  static readonly bls12381G1CheckPointInSubgroup = new ContractCostType(
    "bls12381G1CheckPointInSubgroup",
    48,
  );
  static readonly bls12381G2CheckPointOnCurve = new ContractCostType(
    "bls12381G2CheckPointOnCurve",
    49,
  );
  static readonly bls12381G2CheckPointInSubgroup = new ContractCostType(
    "bls12381G2CheckPointInSubgroup",
    50,
  );
  static readonly bls12381G1ProjectiveToAffine = new ContractCostType(
    "bls12381G1ProjectiveToAffine",
    51,
  );
  static readonly bls12381G2ProjectiveToAffine = new ContractCostType(
    "bls12381G2ProjectiveToAffine",
    52,
  );
  static readonly bls12381G1Add = new ContractCostType("bls12381G1Add", 53);
  static readonly bls12381G1Mul = new ContractCostType("bls12381G1Mul", 54);
  static readonly bls12381G1Msm = new ContractCostType("bls12381G1Msm", 55);
  static readonly bls12381MapFpToG1 = new ContractCostType(
    "bls12381MapFpToG1",
    56,
  );
  static readonly bls12381HashToG1 = new ContractCostType(
    "bls12381HashToG1",
    57,
  );
  static readonly bls12381G2Add = new ContractCostType("bls12381G2Add", 58);
  static readonly bls12381G2Mul = new ContractCostType("bls12381G2Mul", 59);
  static readonly bls12381G2Msm = new ContractCostType("bls12381G2Msm", 60);
  static readonly bls12381MapFp2ToG2 = new ContractCostType(
    "bls12381MapFp2ToG2",
    61,
  );
  static readonly bls12381HashToG2 = new ContractCostType(
    "bls12381HashToG2",
    62,
  );
  static readonly bls12381Pairing = new ContractCostType("bls12381Pairing", 63);
  static readonly bls12381FrFromU256 = new ContractCostType(
    "bls12381FrFromU256",
    64,
  );
  static readonly bls12381FrToU256 = new ContractCostType(
    "bls12381FrToU256",
    65,
  );
  static readonly bls12381FrAddSub = new ContractCostType(
    "bls12381FrAddSub",
    66,
  );
  static readonly bls12381FrMul = new ContractCostType("bls12381FrMul", 67);
  static readonly bls12381FrPow = new ContractCostType("bls12381FrPow", 68);
  static readonly bls12381FrInv = new ContractCostType("bls12381FrInv", 69);
  static readonly bn254EncodeFp = new ContractCostType("bn254EncodeFp", 70);
  static readonly bn254DecodeFp = new ContractCostType("bn254DecodeFp", 71);
  static readonly bn254G1CheckPointOnCurve = new ContractCostType(
    "bn254G1CheckPointOnCurve",
    72,
  );
  static readonly bn254G2CheckPointOnCurve = new ContractCostType(
    "bn254G2CheckPointOnCurve",
    73,
  );
  static readonly bn254G2CheckPointInSubgroup = new ContractCostType(
    "bn254G2CheckPointInSubgroup",
    74,
  );
  static readonly bn254G1ProjectiveToAffine = new ContractCostType(
    "bn254G1ProjectiveToAffine",
    75,
  );
  static readonly bn254G1Add = new ContractCostType("bn254G1Add", 76);
  static readonly bn254G1Mul = new ContractCostType("bn254G1Mul", 77);
  static readonly bn254Pairing = new ContractCostType("bn254Pairing", 78);
  static readonly bn254FrFromU256 = new ContractCostType("bn254FrFromU256", 79);
  static readonly bn254FrToU256 = new ContractCostType("bn254FrToU256", 80);
  static readonly bn254FrAddSub = new ContractCostType("bn254FrAddSub", 81);
  static readonly bn254FrMul = new ContractCostType("bn254FrMul", 82);
  static readonly bn254FrPow = new ContractCostType("bn254FrPow", 83);
  static readonly bn254FrInv = new ContractCostType("bn254FrInv", 84);
  static readonly bn254G1Msm = new ContractCostType("bn254G1Msm", 85);

  static readonly schema = enumType("ContractCostType", {
    wasmInsnExec: 0,
    memAlloc: 1,
    memCpy: 2,
    memCmp: 3,
    dispatchHostFunction: 4,
    visitObject: 5,
    valSer: 6,
    valDeser: 7,
    computeSha256Hash: 8,
    computeEd25519PubKey: 9,
    verifyEd25519Sig: 10,
    vmInstantiation: 11,
    vmCachedInstantiation: 12,
    invokeVmFunction: 13,
    computeKeccak256Hash: 14,
    decodeEcdsaCurve256Sig: 15,
    recoverEcdsaSecp256k1Key: 16,
    int256AddSub: 17,
    int256Mul: 18,
    int256Div: 19,
    int256Pow: 20,
    int256Shift: 21,
    chaCha20DrawBytes: 22,
    parseWasmInstructions: 23,
    parseWasmFunctions: 24,
    parseWasmGlobals: 25,
    parseWasmTableEntries: 26,
    parseWasmTypes: 27,
    parseWasmDataSegments: 28,
    parseWasmElemSegments: 29,
    parseWasmImports: 30,
    parseWasmExports: 31,
    parseWasmDataSegmentBytes: 32,
    instantiateWasmInstructions: 33,
    instantiateWasmFunctions: 34,
    instantiateWasmGlobals: 35,
    instantiateWasmTableEntries: 36,
    instantiateWasmTypes: 37,
    instantiateWasmDataSegments: 38,
    instantiateWasmElemSegments: 39,
    instantiateWasmImports: 40,
    instantiateWasmExports: 41,
    instantiateWasmDataSegmentBytes: 42,
    sec1DecodePointUncompressed: 43,
    verifyEcdsaSecp256r1Sig: 44,
    bls12381EncodeFp: 45,
    bls12381DecodeFp: 46,
    bls12381G1CheckPointOnCurve: 47,
    bls12381G1CheckPointInSubgroup: 48,
    bls12381G2CheckPointOnCurve: 49,
    bls12381G2CheckPointInSubgroup: 50,
    bls12381G1ProjectiveToAffine: 51,
    bls12381G2ProjectiveToAffine: 52,
    bls12381G1Add: 53,
    bls12381G1Mul: 54,
    bls12381G1Msm: 55,
    bls12381MapFpToG1: 56,
    bls12381HashToG1: 57,
    bls12381G2Add: 58,
    bls12381G2Mul: 59,
    bls12381G2Msm: 60,
    bls12381MapFp2ToG2: 61,
    bls12381HashToG2: 62,
    bls12381Pairing: 63,
    bls12381FrFromU256: 64,
    bls12381FrToU256: 65,
    bls12381FrAddSub: 66,
    bls12381FrMul: 67,
    bls12381FrPow: 68,
    bls12381FrInv: 69,
    bn254EncodeFp: 70,
    bn254DecodeFp: 71,
    bn254G1CheckPointOnCurve: 72,
    bn254G2CheckPointOnCurve: 73,
    bn254G2CheckPointInSubgroup: 74,
    bn254G1ProjectiveToAffine: 75,
    bn254G1Add: 76,
    bn254G1Mul: 77,
    bn254Pairing: 78,
    bn254FrFromU256: 79,
    bn254FrToU256: 80,
    bn254FrAddSub: 81,
    bn254FrMul: 82,
    bn254FrPow: 83,
    bn254FrInv: 84,
    bn254G1Msm: 85,
  });

  static fromValue(value: number): ContractCostType {
    return enumFromValue(
      "ContractCostType",
      ContractCostType.schema,
      ContractCostType,
      value,
    );
  }

  static fromName(name: ContractCostTypeName): ContractCostType {
    return enumFromName("ContractCostType", ContractCostType, name);
  }

  static fromXdrObject(wire: number): ContractCostType {
    return ContractCostType.fromValue(wire);
  }
}
