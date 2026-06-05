export type UrlTemplateValue = string | number | boolean | string[];

function stringifyTemplateValue(value: UrlTemplateValue): string {
  return Array.isArray(value) ? value.join(",") : value.toString();
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

  const expanded = withoutQueryTemplate.replace(
    /\{([^?][^}]*)\}/g,
    (_match, name: string) => {
      const value = variables[name];
      return typeof value === "undefined"
        ? ""
        : encodeURIComponent(stringifyTemplateValue(value));
    },
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
