export function validateAllowedRedirects(allowedRedirects: unknown): void {
  // `null` means unset, because callers apply `?? 0`.
  if (allowedRedirects === undefined || allowedRedirects === null) {
    return;
  }
  // A safe integer keeps the redirect counter's decrement exact.
  if (
    typeof allowedRedirects !== "number" ||
    !Number.isSafeInteger(allowedRedirects) ||
    allowedRedirects < 0
  ) {
    throw new Error(
      `allowedRedirects must be 0 or a whole number up to ${Number.MAX_SAFE_INTEGER}, got ${String(allowedRedirects)}`,
    );
  }
}
