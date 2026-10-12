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
 * and a private, local or unspecified IP address. Host names are not resolved,
 * so a name that resolves to a private address is not rejected.
 */
export function validateFederationServer(url: URL): void {
  let reason: string | undefined;
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    reason = `Unsupported protocol ${url.protocol}`;
  } else if (url.username || url.password) {
    reason = "The URL must not contain a user name or password.";
  } else if (isBlockedIp(url.hostname)) {
    reason = "The host is a private, local or unspecified IP address.";
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

// The URL parser normalizes the host: IPv4 to dotted decimal, IPv6 to
// lowercase compressed hex with IPv4 tails as hex.
function isBlockedIp(hostname: string): boolean {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const [a, b] = hostname.split(".").map(Number);
    return isBlockedIpv4(a, b);
  }
  if (!hostname.startsWith("[")) {
    return false;
  }

  const h = ipv6Hextets(hostname.slice(1, -1));
  if ((h[0] & 0xffc0) === 0xfe80 || (h[0] & 0xfe00) === 0xfc00) {
    return true; // fe80::/10 and fc00::/7
  }
  if (IPV4_IN_IPV6_PREFIXES.some((p) => p.every((x, i) => x === h[i]))) {
    return isBlockedIpv4(h[6] >> 8, h[6] & 0xff);
  }
  return false;
}

function isBlockedIpv4(a: number, b: number): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function ipv6Hextets(address: string): number[] {
  const [head, tail] = address.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups =
    tail === undefined
      ? left
      : [
          ...left,
          ...Array<string>(8 - left.length - right.length).fill("0"),
          ...right,
        ];
  const hextets = groups.map((g) => parseInt(g, 16));
  if (hextets.length !== 8 || hextets.some((x) => !(x >= 0 && x <= 0xffff))) {
    throw new Error(`Cannot parse IPv6 address ${JSON.stringify(address)}`);
  }
  return hextets;
}
