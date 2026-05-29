export class XdrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "XdrError";
  }
}
