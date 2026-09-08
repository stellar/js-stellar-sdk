export type UrlTemplateValue = string | number | boolean | string[];

// A path segment addresses exactly one resource, so a raw "/", a dot segment or
// an empty value would re-point the request at a different endpoint.
// `encodeURIComponent` escapes "/" but not ".", hence the explicit dot check.
// `unknown`, not `string`: JS callers reach this, and declaring `string` makes
// both guards below dead to tsc.
// TODO: reject numbers and bigints in the next major, and drop the coercion (see #1706).
// A decimal offer or operation id passed as a number works today.
export function encodeSegment(segment: unknown): string {
  const value =
    typeof segment === "number" || typeof segment === "bigint"
      ? String(segment)
      : segment;

  if (typeof value !== "string") {
    throw new TypeError(
      `expected a string, number or bigint path segment, not ${typeof value}`,
    );
  }
  if (value === "" || value === "." || value === "..") {
    throw new TypeError(
      `expected a single non-empty path segment, not ${JSON.stringify(value)}`,
    );
  }
  try {
    return encodeURIComponent(value);
  } catch {
    // encodeURIComponent throws URIError on a lone surrogate.
    throw new TypeError(
      `expected a well-formed path segment, not ${JSON.stringify(value)}`,
    );
  }
}

function stringifyTemplateValue(value: UrlTemplateValue): string {
  return Array.isArray(value) ? value.join(",") : value.toString();
}

function expandPlaceholders(
  template: string,
  variables: Record<string, UrlTemplateValue | undefined>,
  encode: (value: UrlTemplateValue) => string,
): string {
  return template.replace(/\{([^?][^}]*)\}/g, (_match, name: string) => {
    const value = variables[name];
    return typeof value === "undefined" ? "" : encode(value);
  });
}

export function expandUriTemplate(
  template: string,
  variables: Record<string, UrlTemplateValue | undefined>,
  baseUrl?: string | URL,
): string {
  const queryNames: string[] = [];
  const withoutQueryTemplate = template.replace(
    /\{\?([^}]+)\}/g,
    (_match, names: string) => {
      queryNames.push(...names.split(","));
      return "";
    },
  );

  // Only the path half decides which endpoint the request addresses, so the
  // segment guard stops at the first "?". An empty or dotted query value is
  // legitimate.
  const queryStart = withoutQueryTemplate.indexOf("?");
  const pathTemplate =
    queryStart === -1
      ? withoutQueryTemplate
      : withoutQueryTemplate.slice(0, queryStart);
  const queryTemplate =
    queryStart === -1 ? "" : withoutQueryTemplate.slice(queryStart);

  const expanded =
    expandPlaceholders(pathTemplate, variables, encodeSegment) +
    expandPlaceholders(queryTemplate, variables, (value) =>
      encodeURIComponent(stringifyTemplateValue(value)),
    );

  const url = new URL(expanded, baseUrl);
  queryNames.forEach((name) => {
    const value = variables[name];
    if (typeof value !== "undefined") {
      url.searchParams.set(name, stringifyTemplateValue(value));
    }
  });

  return url.toString();
}
