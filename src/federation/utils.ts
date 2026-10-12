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
 * rejects a scheme other than `http:` and `https:`, a user name or password,
 * and a private, shared, local or unspecified IP address. Host names are not
 * resolved, so a name that resolves to a private address is not rejected.
 */
export function validateFederationServer(url: URL): void {
  let reason: string | undefined;
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    reason = `Unsupported protocol ${url.protocol}`;
  } else if (url.username || url.password) {
    reason = "The URL must not contain a user name or password.";
  } else if (isBlockedIp(url.hostname)) {
    reason = "The host is a private, shared, local or unspecified IP address.";
  }
  if (reason) {
    throw new Error(
      `Invalid FEDERATION_SERVER: ${JSON.stringify(url.href)}. ${reason}`,
    );
  }
}

// IPv6 prefixes whose last 32 bits are an IPv4 address.
const IPV4_IN_IPV6_PREFIXES = [
  [0, 0, 0, 0, 0, 0], // ::/96, IPv4-compatible; :: and ::1 fall in 0.0.0.0/8
  [0, 0, 0, 0, 0, 0xffff], // ::ffff:0:0/96, IPv4-mapped
  [0x64, 0xff9b, 0, 0, 0, 0], // 64:ff9b::/96, NAT64
];

const IPV4_DOTTED = /^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}\.?$/;
// WHATWG URL parsing treats a host as IPv4 when its last label is a number.
const IPV4_LAST_LABEL = /(^|\.)(\d+|0x[0-9a-f]*)\.?$/i;

// The URL parser normalizes the host: IPv4 to dotted decimal, IPv6 to
// lowercase compressed hex with IPv4 tails as hex. A host in another form
// throws, so a URL implementation that does not normalize fails closed.
function isBlockedIp(hostname: string): boolean {
  if (hostname.startsWith("[")) {
    const h = ipv6Hextets(hostname.slice(1, -1));
    if ((h[0] & 0xffc0) === 0xfe80 || (h[0] & 0xfe00) === 0xfc00) {
      return true; // fe80::/10 and fc00::/7
    }
    if (IPV4_IN_IPV6_PREFIXES.some((p) => p.every((x, i) => x === h[i]))) {
      return isBlockedIpv4(h[6] >> 8, h[6] & 0xff);
    }
    return false;
  }

  const octets = IPV4_DOTTED.test(hostname)
    ? hostname.split(".", 4).map(Number)
    : undefined;
  if (octets?.every((x) => x <= 255)) {
    return isBlockedIpv4(octets[0], octets[1]);
  }
  if (octets || IPV4_LAST_LABEL.test(hostname)) {
    throw new Error(`Cannot parse IPv4 address ${JSON.stringify(hostname)}`);
  }
  return false;
}

function isBlockedIpv4(a: number, b: number): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

const HEXTET = /^[0-9a-f]{1,4}$/i;

// Throws on anything but 8 groups of 1-4 hex digits, such as a dotted IPv4
// tail that a non-normalizing URL implementation left in place.
function ipv6Hextets(address: string): number[] {
  const parts = address.split("::");
  const left = parts[0] ? parts[0].split(":") : [];
  const right = parts[1] ? parts[1].split(":") : [];
  const groups =
    parts.length === 1
      ? left
      : [
          ...left,
          ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill(
            "0",
          ),
          ...right,
        ];
  if (
    parts.length > 2 ||
    groups.length !== 8 ||
    !groups.every((g) => HEXTET.test(g))
  ) {
    throw new Error(`Cannot parse IPv6 address ${JSON.stringify(address)}`);
  }
  return groups.map((g) => parseInt(g, 16));
}

export function validateAllowedRedirects(
  allowedRedirects: number | undefined,
): void {
  // `null` means unset, as in `StellarToml.Resolver.resolve()`.
  if (
    allowedRedirects !== undefined &&
    allowedRedirects !== null &&
    !(Number.isInteger(allowedRedirects) && allowedRedirects >= 0)
  ) {
    throw new Error(
      `allowedRedirects must be 0 or a whole number, got ${String(allowedRedirects)}`,
    );
  }
}
