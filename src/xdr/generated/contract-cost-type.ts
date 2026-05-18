import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ContractCostTypeWire = number;

export type ContractCostTypeName =
  | "wasminsnexec"
  | "memalloc"
  | "memcpy"
  | "memcmp"
  | "dispatchhostfunction"
  | "visitobject"
  | "valser"
  | "valdeser"
  | "computesha256hash"
  | "computeed25519pubkey"
  | "verifyed25519sig"
  | "vminstantiation"
  | "vmcachedinstantiation"
  | "invokevmfunction"
  | "computekeccak256hash"
  | "decodeecdsacurve256sig"
  | "recoverecdsasecp256k1key"
  | "int256addsub"
  | "int256mul"
  | "int256div"
  | "int256pow"
  | "int256shift"
  | "chacha20drawbytes"
  | "parsewasminstructions"
  | "parsewasmfunctions"
  | "parsewasmglobals"
  | "parsewasmtableentries"
  | "parsewasmtypes"
  | "parsewasmdatasegments"
  | "parsewasmelemsegments"
  | "parsewasmimports"
  | "parsewasmexports"
  | "parsewasmdatasegmentbytes"
  | "instantiatewasminstructions"
  | "instantiatewasmfunctions"
  | "instantiatewasmglobals"
  | "instantiatewasmtableentries"
  | "instantiatewasmtypes"
  | "instantiatewasmdatasegments"
  | "instantiatewasmelemsegments"
  | "instantiatewasmimports"
  | "instantiatewasmexports"
  | "instantiatewasmdatasegmentbytes"
  | "sec1decodepointuncompressed"
  | "verifyecdsasecp256r1sig"
  | "bls12381encodefp"
  | "bls12381decodefp"
  | "bls12381g1checkpointoncurve"
  | "bls12381g1checkpointinsubgroup"
  | "bls12381g2checkpointoncurve"
  | "bls12381g2checkpointinsubgroup"
  | "bls12381g1projectivetoaffine"
  | "bls12381g2projectivetoaffine"
  | "bls12381g1add"
  | "bls12381g1mul"
  | "bls12381g1msm"
  | "bls12381mapfptog1"
  | "bls12381hashtog1"
  | "bls12381g2add"
  | "bls12381g2mul"
  | "bls12381g2msm"
  | "bls12381mapfp2tog2"
  | "bls12381hashtog2"
  | "bls12381pairing"
  | "bls12381frfromu256"
  | "bls12381frtou256"
  | "bls12381fraddsub"
  | "bls12381frmul"
  | "bls12381frpow"
  | "bls12381frinv"
  | "bn254encodefp"
  | "bn254decodefp"
  | "bn254g1checkpointoncurve"
  | "bn254g2checkpointoncurve"
  | "bn254g2checkpointinsubgroup"
  | "bn254g1projectivetoaffine"
  | "bn254g1add"
  | "bn254g1mul"
  | "bn254pairing"
  | "bn254frfromu256"
  | "bn254frtou256"
  | "bn254fraddsub"
  | "bn254frmul"
  | "bn254frpow"
  | "bn254frinv"
  | "bn254g1msm";

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
  static readonly wasminsnexec = new ContractCostType("wasminsnexec", 0);
  static readonly memalloc = new ContractCostType("memalloc", 1);
  static readonly memcpy = new ContractCostType("memcpy", 2);
  static readonly memcmp = new ContractCostType("memcmp", 3);
  static readonly dispatchhostfunction = new ContractCostType(
    "dispatchhostfunction",
    4,
  );
  static readonly visitobject = new ContractCostType("visitobject", 5);
  static readonly valser = new ContractCostType("valser", 6);
  static readonly valdeser = new ContractCostType("valdeser", 7);
  static readonly computesha256hash = new ContractCostType(
    "computesha256hash",
    8,
  );
  static readonly computeed25519pubkey = new ContractCostType(
    "computeed25519pubkey",
    9,
  );
  static readonly verifyed25519sig = new ContractCostType(
    "verifyed25519sig",
    10,
  );
  static readonly vminstantiation = new ContractCostType("vminstantiation", 11);
  static readonly vmcachedinstantiation = new ContractCostType(
    "vmcachedinstantiation",
    12,
  );
  static readonly invokevmfunction = new ContractCostType(
    "invokevmfunction",
    13,
  );
  static readonly computekeccak256hash = new ContractCostType(
    "computekeccak256hash",
    14,
  );
  static readonly decodeecdsacurve256sig = new ContractCostType(
    "decodeecdsacurve256sig",
    15,
  );
  static readonly recoverecdsasecp256k1key = new ContractCostType(
    "recoverecdsasecp256k1key",
    16,
  );
  static readonly int256addsub = new ContractCostType("int256addsub", 17);
  static readonly int256mul = new ContractCostType("int256mul", 18);
  static readonly int256div = new ContractCostType("int256div", 19);
  static readonly int256pow = new ContractCostType("int256pow", 20);
  static readonly int256shift = new ContractCostType("int256shift", 21);
  static readonly chacha20drawbytes = new ContractCostType(
    "chacha20drawbytes",
    22,
  );
  static readonly parsewasminstructions = new ContractCostType(
    "parsewasminstructions",
    23,
  );
  static readonly parsewasmfunctions = new ContractCostType(
    "parsewasmfunctions",
    24,
  );
  static readonly parsewasmglobals = new ContractCostType(
    "parsewasmglobals",
    25,
  );
  static readonly parsewasmtableentries = new ContractCostType(
    "parsewasmtableentries",
    26,
  );
  static readonly parsewasmtypes = new ContractCostType("parsewasmtypes", 27);
  static readonly parsewasmdatasegments = new ContractCostType(
    "parsewasmdatasegments",
    28,
  );
  static readonly parsewasmelemsegments = new ContractCostType(
    "parsewasmelemsegments",
    29,
  );
  static readonly parsewasmimports = new ContractCostType(
    "parsewasmimports",
    30,
  );
  static readonly parsewasmexports = new ContractCostType(
    "parsewasmexports",
    31,
  );
  static readonly parsewasmdatasegmentbytes = new ContractCostType(
    "parsewasmdatasegmentbytes",
    32,
  );
  static readonly instantiatewasminstructions = new ContractCostType(
    "instantiatewasminstructions",
    33,
  );
  static readonly instantiatewasmfunctions = new ContractCostType(
    "instantiatewasmfunctions",
    34,
  );
  static readonly instantiatewasmglobals = new ContractCostType(
    "instantiatewasmglobals",
    35,
  );
  static readonly instantiatewasmtableentries = new ContractCostType(
    "instantiatewasmtableentries",
    36,
  );
  static readonly instantiatewasmtypes = new ContractCostType(
    "instantiatewasmtypes",
    37,
  );
  static readonly instantiatewasmdatasegments = new ContractCostType(
    "instantiatewasmdatasegments",
    38,
  );
  static readonly instantiatewasmelemsegments = new ContractCostType(
    "instantiatewasmelemsegments",
    39,
  );
  static readonly instantiatewasmimports = new ContractCostType(
    "instantiatewasmimports",
    40,
  );
  static readonly instantiatewasmexports = new ContractCostType(
    "instantiatewasmexports",
    41,
  );
  static readonly instantiatewasmdatasegmentbytes = new ContractCostType(
    "instantiatewasmdatasegmentbytes",
    42,
  );
  static readonly sec1decodepointuncompressed = new ContractCostType(
    "sec1decodepointuncompressed",
    43,
  );
  static readonly verifyecdsasecp256r1sig = new ContractCostType(
    "verifyecdsasecp256r1sig",
    44,
  );
  static readonly bls12381encodefp = new ContractCostType(
    "bls12381encodefp",
    45,
  );
  static readonly bls12381decodefp = new ContractCostType(
    "bls12381decodefp",
    46,
  );
  static readonly bls12381g1checkpointoncurve = new ContractCostType(
    "bls12381g1checkpointoncurve",
    47,
  );
  static readonly bls12381g1checkpointinsubgroup = new ContractCostType(
    "bls12381g1checkpointinsubgroup",
    48,
  );
  static readonly bls12381g2checkpointoncurve = new ContractCostType(
    "bls12381g2checkpointoncurve",
    49,
  );
  static readonly bls12381g2checkpointinsubgroup = new ContractCostType(
    "bls12381g2checkpointinsubgroup",
    50,
  );
  static readonly bls12381g1projectivetoaffine = new ContractCostType(
    "bls12381g1projectivetoaffine",
    51,
  );
  static readonly bls12381g2projectivetoaffine = new ContractCostType(
    "bls12381g2projectivetoaffine",
    52,
  );
  static readonly bls12381g1add = new ContractCostType("bls12381g1add", 53);
  static readonly bls12381g1mul = new ContractCostType("bls12381g1mul", 54);
  static readonly bls12381g1msm = new ContractCostType("bls12381g1msm", 55);
  static readonly bls12381mapfptog1 = new ContractCostType(
    "bls12381mapfptog1",
    56,
  );
  static readonly bls12381hashtog1 = new ContractCostType(
    "bls12381hashtog1",
    57,
  );
  static readonly bls12381g2add = new ContractCostType("bls12381g2add", 58);
  static readonly bls12381g2mul = new ContractCostType("bls12381g2mul", 59);
  static readonly bls12381g2msm = new ContractCostType("bls12381g2msm", 60);
  static readonly bls12381mapfp2tog2 = new ContractCostType(
    "bls12381mapfp2tog2",
    61,
  );
  static readonly bls12381hashtog2 = new ContractCostType(
    "bls12381hashtog2",
    62,
  );
  static readonly bls12381pairing = new ContractCostType("bls12381pairing", 63);
  static readonly bls12381frfromu256 = new ContractCostType(
    "bls12381frfromu256",
    64,
  );
  static readonly bls12381frtou256 = new ContractCostType(
    "bls12381frtou256",
    65,
  );
  static readonly bls12381fraddsub = new ContractCostType(
    "bls12381fraddsub",
    66,
  );
  static readonly bls12381frmul = new ContractCostType("bls12381frmul", 67);
  static readonly bls12381frpow = new ContractCostType("bls12381frpow", 68);
  static readonly bls12381frinv = new ContractCostType("bls12381frinv", 69);
  static readonly bn254encodefp = new ContractCostType("bn254encodefp", 70);
  static readonly bn254decodefp = new ContractCostType("bn254decodefp", 71);
  static readonly bn254g1checkpointoncurve = new ContractCostType(
    "bn254g1checkpointoncurve",
    72,
  );
  static readonly bn254g2checkpointoncurve = new ContractCostType(
    "bn254g2checkpointoncurve",
    73,
  );
  static readonly bn254g2checkpointinsubgroup = new ContractCostType(
    "bn254g2checkpointinsubgroup",
    74,
  );
  static readonly bn254g1projectivetoaffine = new ContractCostType(
    "bn254g1projectivetoaffine",
    75,
  );
  static readonly bn254g1add = new ContractCostType("bn254g1add", 76);
  static readonly bn254g1mul = new ContractCostType("bn254g1mul", 77);
  static readonly bn254pairing = new ContractCostType("bn254pairing", 78);
  static readonly bn254frfromu256 = new ContractCostType("bn254frfromu256", 79);
  static readonly bn254frtou256 = new ContractCostType("bn254frtou256", 80);
  static readonly bn254fraddsub = new ContractCostType("bn254fraddsub", 81);
  static readonly bn254frmul = new ContractCostType("bn254frmul", 82);
  static readonly bn254frpow = new ContractCostType("bn254frpow", 83);
  static readonly bn254frinv = new ContractCostType("bn254frinv", 84);
  static readonly bn254g1msm = new ContractCostType("bn254g1msm", 85);

  private static readonly byValue: Readonly<Record<number, ContractCostType>> =
    {
      0: ContractCostType.wasminsnexec,
      1: ContractCostType.memalloc,
      2: ContractCostType.memcpy,
      3: ContractCostType.memcmp,
      4: ContractCostType.dispatchhostfunction,
      5: ContractCostType.visitobject,
      6: ContractCostType.valser,
      7: ContractCostType.valdeser,
      8: ContractCostType.computesha256hash,
      9: ContractCostType.computeed25519pubkey,
      10: ContractCostType.verifyed25519sig,
      11: ContractCostType.vminstantiation,
      12: ContractCostType.vmcachedinstantiation,
      13: ContractCostType.invokevmfunction,
      14: ContractCostType.computekeccak256hash,
      15: ContractCostType.decodeecdsacurve256sig,
      16: ContractCostType.recoverecdsasecp256k1key,
      17: ContractCostType.int256addsub,
      18: ContractCostType.int256mul,
      19: ContractCostType.int256div,
      20: ContractCostType.int256pow,
      21: ContractCostType.int256shift,
      22: ContractCostType.chacha20drawbytes,
      23: ContractCostType.parsewasminstructions,
      24: ContractCostType.parsewasmfunctions,
      25: ContractCostType.parsewasmglobals,
      26: ContractCostType.parsewasmtableentries,
      27: ContractCostType.parsewasmtypes,
      28: ContractCostType.parsewasmdatasegments,
      29: ContractCostType.parsewasmelemsegments,
      30: ContractCostType.parsewasmimports,
      31: ContractCostType.parsewasmexports,
      32: ContractCostType.parsewasmdatasegmentbytes,
      33: ContractCostType.instantiatewasminstructions,
      34: ContractCostType.instantiatewasmfunctions,
      35: ContractCostType.instantiatewasmglobals,
      36: ContractCostType.instantiatewasmtableentries,
      37: ContractCostType.instantiatewasmtypes,
      38: ContractCostType.instantiatewasmdatasegments,
      39: ContractCostType.instantiatewasmelemsegments,
      40: ContractCostType.instantiatewasmimports,
      41: ContractCostType.instantiatewasmexports,
      42: ContractCostType.instantiatewasmdatasegmentbytes,
      43: ContractCostType.sec1decodepointuncompressed,
      44: ContractCostType.verifyecdsasecp256r1sig,
      45: ContractCostType.bls12381encodefp,
      46: ContractCostType.bls12381decodefp,
      47: ContractCostType.bls12381g1checkpointoncurve,
      48: ContractCostType.bls12381g1checkpointinsubgroup,
      49: ContractCostType.bls12381g2checkpointoncurve,
      50: ContractCostType.bls12381g2checkpointinsubgroup,
      51: ContractCostType.bls12381g1projectivetoaffine,
      52: ContractCostType.bls12381g2projectivetoaffine,
      53: ContractCostType.bls12381g1add,
      54: ContractCostType.bls12381g1mul,
      55: ContractCostType.bls12381g1msm,
      56: ContractCostType.bls12381mapfptog1,
      57: ContractCostType.bls12381hashtog1,
      58: ContractCostType.bls12381g2add,
      59: ContractCostType.bls12381g2mul,
      60: ContractCostType.bls12381g2msm,
      61: ContractCostType.bls12381mapfp2tog2,
      62: ContractCostType.bls12381hashtog2,
      63: ContractCostType.bls12381pairing,
      64: ContractCostType.bls12381frfromu256,
      65: ContractCostType.bls12381frtou256,
      66: ContractCostType.bls12381fraddsub,
      67: ContractCostType.bls12381frmul,
      68: ContractCostType.bls12381frpow,
      69: ContractCostType.bls12381frinv,
      70: ContractCostType.bn254encodefp,
      71: ContractCostType.bn254decodefp,
      72: ContractCostType.bn254g1checkpointoncurve,
      73: ContractCostType.bn254g2checkpointoncurve,
      74: ContractCostType.bn254g2checkpointinsubgroup,
      75: ContractCostType.bn254g1projectivetoaffine,
      76: ContractCostType.bn254g1add,
      77: ContractCostType.bn254g1mul,
      78: ContractCostType.bn254pairing,
      79: ContractCostType.bn254frfromu256,
      80: ContractCostType.bn254frtou256,
      81: ContractCostType.bn254fraddsub,
      82: ContractCostType.bn254frmul,
      83: ContractCostType.bn254frpow,
      84: ContractCostType.bn254frinv,
      85: ContractCostType.bn254g1msm,
    };

  static readonly schema = enumType("ContractCostType", {
    wasminsnexec: 0,
    memalloc: 1,
    memcpy: 2,
    memcmp: 3,
    dispatchhostfunction: 4,
    visitobject: 5,
    valser: 6,
    valdeser: 7,
    computesha256hash: 8,
    computeed25519pubkey: 9,
    verifyed25519sig: 10,
    vminstantiation: 11,
    vmcachedinstantiation: 12,
    invokevmfunction: 13,
    computekeccak256hash: 14,
    decodeecdsacurve256sig: 15,
    recoverecdsasecp256k1key: 16,
    int256addsub: 17,
    int256mul: 18,
    int256div: 19,
    int256pow: 20,
    int256shift: 21,
    chacha20drawbytes: 22,
    parsewasminstructions: 23,
    parsewasmfunctions: 24,
    parsewasmglobals: 25,
    parsewasmtableentries: 26,
    parsewasmtypes: 27,
    parsewasmdatasegments: 28,
    parsewasmelemsegments: 29,
    parsewasmimports: 30,
    parsewasmexports: 31,
    parsewasmdatasegmentbytes: 32,
    instantiatewasminstructions: 33,
    instantiatewasmfunctions: 34,
    instantiatewasmglobals: 35,
    instantiatewasmtableentries: 36,
    instantiatewasmtypes: 37,
    instantiatewasmdatasegments: 38,
    instantiatewasmelemsegments: 39,
    instantiatewasmimports: 40,
    instantiatewasmexports: 41,
    instantiatewasmdatasegmentbytes: 42,
    sec1decodepointuncompressed: 43,
    verifyecdsasecp256r1sig: 44,
    bls12381encodefp: 45,
    bls12381decodefp: 46,
    bls12381g1checkpointoncurve: 47,
    bls12381g1checkpointinsubgroup: 48,
    bls12381g2checkpointoncurve: 49,
    bls12381g2checkpointinsubgroup: 50,
    bls12381g1projectivetoaffine: 51,
    bls12381g2projectivetoaffine: 52,
    bls12381g1add: 53,
    bls12381g1mul: 54,
    bls12381g1msm: 55,
    bls12381mapfptog1: 56,
    bls12381hashtog1: 57,
    bls12381g2add: 58,
    bls12381g2mul: 59,
    bls12381g2msm: 60,
    bls12381mapfp2tog2: 61,
    bls12381hashtog2: 62,
    bls12381pairing: 63,
    bls12381frfromu256: 64,
    bls12381frtou256: 65,
    bls12381fraddsub: 66,
    bls12381frmul: 67,
    bls12381frpow: 68,
    bls12381frinv: 69,
    bn254encodefp: 70,
    bn254decodefp: 71,
    bn254g1checkpointoncurve: 72,
    bn254g2checkpointoncurve: 73,
    bn254g2checkpointinsubgroup: 74,
    bn254g1projectivetoaffine: 75,
    bn254g1add: 76,
    bn254g1mul: 77,
    bn254pairing: 78,
    bn254frfromu256: 79,
    bn254frtou256: 80,
    bn254fraddsub: 81,
    bn254frmul: 82,
    bn254frpow: 83,
    bn254frinv: 84,
    bn254g1msm: 85,
  });

  static fromValue(value: number): ContractCostType {
    return enumLookup(
      "ContractCostType",
      ContractCostType.byValue,
      value,
    ) as ContractCostType;
  }

  static fromName(name: ContractCostTypeName): ContractCostType {
    switch (name) {
      case "wasminsnexec":
        return ContractCostType.wasminsnexec;
      case "memalloc":
        return ContractCostType.memalloc;
      case "memcpy":
        return ContractCostType.memcpy;
      case "memcmp":
        return ContractCostType.memcmp;
      case "dispatchhostfunction":
        return ContractCostType.dispatchhostfunction;
      case "visitobject":
        return ContractCostType.visitobject;
      case "valser":
        return ContractCostType.valser;
      case "valdeser":
        return ContractCostType.valdeser;
      case "computesha256hash":
        return ContractCostType.computesha256hash;
      case "computeed25519pubkey":
        return ContractCostType.computeed25519pubkey;
      case "verifyed25519sig":
        return ContractCostType.verifyed25519sig;
      case "vminstantiation":
        return ContractCostType.vminstantiation;
      case "vmcachedinstantiation":
        return ContractCostType.vmcachedinstantiation;
      case "invokevmfunction":
        return ContractCostType.invokevmfunction;
      case "computekeccak256hash":
        return ContractCostType.computekeccak256hash;
      case "decodeecdsacurve256sig":
        return ContractCostType.decodeecdsacurve256sig;
      case "recoverecdsasecp256k1key":
        return ContractCostType.recoverecdsasecp256k1key;
      case "int256addsub":
        return ContractCostType.int256addsub;
      case "int256mul":
        return ContractCostType.int256mul;
      case "int256div":
        return ContractCostType.int256div;
      case "int256pow":
        return ContractCostType.int256pow;
      case "int256shift":
        return ContractCostType.int256shift;
      case "chacha20drawbytes":
        return ContractCostType.chacha20drawbytes;
      case "parsewasminstructions":
        return ContractCostType.parsewasminstructions;
      case "parsewasmfunctions":
        return ContractCostType.parsewasmfunctions;
      case "parsewasmglobals":
        return ContractCostType.parsewasmglobals;
      case "parsewasmtableentries":
        return ContractCostType.parsewasmtableentries;
      case "parsewasmtypes":
        return ContractCostType.parsewasmtypes;
      case "parsewasmdatasegments":
        return ContractCostType.parsewasmdatasegments;
      case "parsewasmelemsegments":
        return ContractCostType.parsewasmelemsegments;
      case "parsewasmimports":
        return ContractCostType.parsewasmimports;
      case "parsewasmexports":
        return ContractCostType.parsewasmexports;
      case "parsewasmdatasegmentbytes":
        return ContractCostType.parsewasmdatasegmentbytes;
      case "instantiatewasminstructions":
        return ContractCostType.instantiatewasminstructions;
      case "instantiatewasmfunctions":
        return ContractCostType.instantiatewasmfunctions;
      case "instantiatewasmglobals":
        return ContractCostType.instantiatewasmglobals;
      case "instantiatewasmtableentries":
        return ContractCostType.instantiatewasmtableentries;
      case "instantiatewasmtypes":
        return ContractCostType.instantiatewasmtypes;
      case "instantiatewasmdatasegments":
        return ContractCostType.instantiatewasmdatasegments;
      case "instantiatewasmelemsegments":
        return ContractCostType.instantiatewasmelemsegments;
      case "instantiatewasmimports":
        return ContractCostType.instantiatewasmimports;
      case "instantiatewasmexports":
        return ContractCostType.instantiatewasmexports;
      case "instantiatewasmdatasegmentbytes":
        return ContractCostType.instantiatewasmdatasegmentbytes;
      case "sec1decodepointuncompressed":
        return ContractCostType.sec1decodepointuncompressed;
      case "verifyecdsasecp256r1sig":
        return ContractCostType.verifyecdsasecp256r1sig;
      case "bls12381encodefp":
        return ContractCostType.bls12381encodefp;
      case "bls12381decodefp":
        return ContractCostType.bls12381decodefp;
      case "bls12381g1checkpointoncurve":
        return ContractCostType.bls12381g1checkpointoncurve;
      case "bls12381g1checkpointinsubgroup":
        return ContractCostType.bls12381g1checkpointinsubgroup;
      case "bls12381g2checkpointoncurve":
        return ContractCostType.bls12381g2checkpointoncurve;
      case "bls12381g2checkpointinsubgroup":
        return ContractCostType.bls12381g2checkpointinsubgroup;
      case "bls12381g1projectivetoaffine":
        return ContractCostType.bls12381g1projectivetoaffine;
      case "bls12381g2projectivetoaffine":
        return ContractCostType.bls12381g2projectivetoaffine;
      case "bls12381g1add":
        return ContractCostType.bls12381g1add;
      case "bls12381g1mul":
        return ContractCostType.bls12381g1mul;
      case "bls12381g1msm":
        return ContractCostType.bls12381g1msm;
      case "bls12381mapfptog1":
        return ContractCostType.bls12381mapfptog1;
      case "bls12381hashtog1":
        return ContractCostType.bls12381hashtog1;
      case "bls12381g2add":
        return ContractCostType.bls12381g2add;
      case "bls12381g2mul":
        return ContractCostType.bls12381g2mul;
      case "bls12381g2msm":
        return ContractCostType.bls12381g2msm;
      case "bls12381mapfp2tog2":
        return ContractCostType.bls12381mapfp2tog2;
      case "bls12381hashtog2":
        return ContractCostType.bls12381hashtog2;
      case "bls12381pairing":
        return ContractCostType.bls12381pairing;
      case "bls12381frfromu256":
        return ContractCostType.bls12381frfromu256;
      case "bls12381frtou256":
        return ContractCostType.bls12381frtou256;
      case "bls12381fraddsub":
        return ContractCostType.bls12381fraddsub;
      case "bls12381frmul":
        return ContractCostType.bls12381frmul;
      case "bls12381frpow":
        return ContractCostType.bls12381frpow;
      case "bls12381frinv":
        return ContractCostType.bls12381frinv;
      case "bn254encodefp":
        return ContractCostType.bn254encodefp;
      case "bn254decodefp":
        return ContractCostType.bn254decodefp;
      case "bn254g1checkpointoncurve":
        return ContractCostType.bn254g1checkpointoncurve;
      case "bn254g2checkpointoncurve":
        return ContractCostType.bn254g2checkpointoncurve;
      case "bn254g2checkpointinsubgroup":
        return ContractCostType.bn254g2checkpointinsubgroup;
      case "bn254g1projectivetoaffine":
        return ContractCostType.bn254g1projectivetoaffine;
      case "bn254g1add":
        return ContractCostType.bn254g1add;
      case "bn254g1mul":
        return ContractCostType.bn254g1mul;
      case "bn254pairing":
        return ContractCostType.bn254pairing;
      case "bn254frfromu256":
        return ContractCostType.bn254frfromu256;
      case "bn254frtou256":
        return ContractCostType.bn254frtou256;
      case "bn254fraddsub":
        return ContractCostType.bn254fraddsub;
      case "bn254frmul":
        return ContractCostType.bn254frmul;
      case "bn254frpow":
        return ContractCostType.bn254frpow;
      case "bn254frinv":
        return ContractCostType.bn254frinv;
      case "bn254g1msm":
        return ContractCostType.bn254g1msm;
      default:
        throw new XdrError(`ContractCostType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ContractCostType {
    return ContractCostType.fromValue(wire);
  }
}
