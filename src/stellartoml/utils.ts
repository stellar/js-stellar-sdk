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

// A loop, not `/[/\\]+$/`: the regex restarts at each position of a separator
// run that is not trailing, which takes quadratic time.
export function stripTrailingSeparators(value: string): string {
  let end = value.length;
  while (end > 0 && (value[end - 1] === "/" || value[end - 1] === "\\")) {
    end -= 1;
  }
  return value.slice(0, end);
}
