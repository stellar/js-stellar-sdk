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

/**
 * Checks a `FEDERATION_SERVER` URL that comes from a `stellar.toml` file. It
 * rejects a scheme other than `http:` and `https:`, and a user name or
 * password. It does not check the host: the toml author picks the name, and
 * any name can resolve to a private address, so the app must filter hosts.
 */
export function validateFederationServer(url: URL): void {
  let reason: string | undefined;
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    reason = `Unsupported protocol ${url.protocol}`;
  } else if (url.username || url.password) {
    reason = "The URL must not contain a user name or password.";
  }
  if (reason) {
    throw new Error(
      `Invalid FEDERATION_SERVER: ${JSON.stringify(url.href)}. ${reason}`,
    );
  }
}
