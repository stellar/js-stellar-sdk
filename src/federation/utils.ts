export function validateDomain(domain: string): void {
  // Validate domain per RFC 1035 with an optional port (as required by SEP-0002): each dot-separated
  // label must start with a letter, end with a letter or digit, and contain only
  // letters, digits, or hyphens.
  if (
    !/^(?:[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)*[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?::\d+)?$/.test(
      domain,
    )
  ) {
    throw new Error(
      "The provided domain is invalid. Ensure that the domain adheres to RFC 1035",
    );
  }
}
