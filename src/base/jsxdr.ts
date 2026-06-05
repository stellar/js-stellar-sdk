import { XdrWriter, XdrReader } from "@stellar/js-xdr";

// Named exports for better tree shaking
export { XdrWriter, XdrReader };

// Default export for backward compatibility
const cereal = { XdrWriter, XdrReader };
export default cereal;
