import jsXdr from "@stellar/js-xdr";
const { XdrWriter, XdrReader } = jsXdr;

// Named exports for better tree shaking
export { XdrWriter, XdrReader };

// Default export for backward compatibility
const cereal = { XdrWriter, XdrReader };
export default cereal;
