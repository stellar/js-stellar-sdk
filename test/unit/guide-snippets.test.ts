import { describe, expect, it } from "vitest";

import {
  checkDoc,
  expandSnippetMarkers,
  parseRegions,
  scanMarkdown,
  snippetRegion,
} from "../../config/snippets.js";

// Unit tests for the docs snippet-expansion machinery (config/snippets.ts).
// The 13 live markers in docs/guides only exercise the happy path; the edge
// cases (overlapping regions, bare #endregion, nested fences, dedent) live
// here so other guide authors hit clear errors, not silent misrenders.

describe("parseRegions", () => {
  it("extracts a simple region, excluding the marker lines", () => {
    const regions = parseRegions(
      ["setup();", "// #region a", "one();", "two();", "// #endregion a"].join(
        "\n",
      ),
      "f.ts",
    );
    expect(regions.get("a")).toBe("one();\ntwo();");
    expect(regions.size).toBe(1);
  });

  it("lets overlapping regions share lines", () => {
    const regions = parseRegions(
      [
        "// #region full",
        "// #region step",
        "shared();",
        "// #endregion step",
        "recapOnly();",
        "// #endregion full",
      ].join("\n"),
      "f.ts",
    );
    expect(regions.get("step")).toBe("shared();");
    expect(regions.get("full")).toBe("shared();\nrecapOnly();");
  });

  it("joins a reopened region's parts with a blank line", () => {
    const regions = parseRegions(
      [
        "// #region a",
        "first();",
        "// #endregion a",
        "hidden();",
        "// #region a",
        "second();",
        "// #endregion a",
      ].join("\n"),
      "f.ts",
    );
    expect(regions.get("a")).toBe("first();\n\nsecond();");
  });

  it("joins seamlessly when the next part continues an indented expression", () => {
    const regions = parseRegions(
      [
        "// #region a",
        "builder",
        "  .one()",
        "// #endregion a",
        "  .hidden()",
        "// #region a",
        "  .two();",
        "// #endregion a",
      ].join("\n"),
      "f.ts",
    );
    expect(regions.get("a")).toBe("builder\n  .one()\n  .two();");
  });

  it("dedents a region carved from inside a block", () => {
    const regions = parseRegions(
      [
        "try {",
        "  // #region a",
        "  inner();",
        "    deeper();",
        "  // #endregion a",
        "} catch {}",
      ].join("\n"),
      "f.ts",
    );
    expect(regions.get("a")).toBe("inner();\n  deeper();");
  });

  it("keeps indentation when a region has a column-0 line", () => {
    const regions = parseRegions(
      ["// #region a", "top();", "  .chained();", "// #endregion a"].join("\n"),
      "f.ts",
    );
    expect(regions.get("a")).toBe("top();\n  .chained();");
  });

  it("resolves a bare #endregion when exactly one region is open", () => {
    const regions = parseRegions(
      ["// #region only", "x();", "// #endregion"].join("\n"),
      "f.ts",
    );
    expect(regions.get("only")).toBe("x();");
  });

  it("rejects a bare #endregion when multiple regions are open", () => {
    expect(() =>
      parseRegions(
        ["// #region a", "// #region b", "x();", "// #endregion"].join("\n"),
        "f.ts",
      ),
    ).toThrow(/ambiguous/);
  });

  it("rejects a stray #endregion with nothing open", () => {
    expect(() => parseRegions("// #endregion", "f.ts")).toThrow(
      /without an open #region/,
    );
    expect(() => parseRegions("// #endregion ghost", "f.ts")).toThrow(
      /without an open #region/,
    );
  });

  it("rejects closing a region that is not the open one", () => {
    expect(() =>
      parseRegions(
        ["// #region a", "// #region b", "// #endregion c"].join("\n"),
        "f.ts",
      ),
    ).toThrow(/#endregion c without open #region/);
  });

  it("rejects reopening a region before it closes", () => {
    expect(() =>
      parseRegions(["// #region a", "// #region a"].join("\n"), "f.ts"),
    ).toThrow(/reopened before closing/);
  });

  it("rejects an unclosed region", () => {
    expect(() => parseRegions("// #region a\nx();", "f.ts")).toThrow(
      /never closed/,
    );
  });

  it("trims blank edge lines from a region's content", () => {
    const regions = parseRegions(
      ["// #region a", "", "x();", "", "// #endregion a"].join("\n"),
      "f.ts",
    );
    expect(regions.get("a")).toBe("x();");
  });
});

describe("scanMarkdown", () => {
  it("classifies markers and captures file/region", () => {
    const line = "<!-- snippet: send-a-payment.ts#build -->";
    expect(scanMarkdown(line)[0]).toEqual({
      line,
      kind: "marker",
      file: "send-a-payment.ts",
      region: "build",
    });
  });

  it("flags near-miss markers (typos, indentation) instead of ignoring them", () => {
    for (const line of [
      "<!-- snippet send-a-payment.ts#build -->", // missing colon
      "  <!-- snippet: send-a-payment.ts#build -->", // indented
      "<!-- snippets are injected here -->", // prose mentioning snippets
    ]) {
      expect(scanMarkdown(line)[0].kind).toBe("near-miss");
    }
  });

  it("never treats fenced content as a marker", () => {
    const kinds = scanMarkdown(
      ["```markdown", "<!-- snippet: send-a-payment.ts#build -->", "```"].join(
        "\n",
      ),
    ).map((s) => s.kind);
    expect(kinds).toEqual(["fence-open", "code", "fence-close"]);
  });

  it("handles nested fences: an outer 4-backtick block displaying a 3-backtick one", () => {
    const kinds = scanMarkdown(
      ["````md", "```ts", "code();", "```", "````", "text"].join("\n"),
    ).map((s) => s.kind);
    expect(kinds).toEqual([
      "fence-open",
      "code",
      "code",
      "code",
      "fence-close",
      "text",
    ]);
  });

  it("does not close a fence on a mismatched character or shorter run", () => {
    const kinds = scanMarkdown(["````", "```", "~~~~", "````"].join("\n")).map(
      (s) => s.kind,
    );
    expect(kinds).toEqual(["fence-open", "code", "code", "fence-close"]);
  });

  it("marks a fence untested only when its info string has the word untested", () => {
    for (const [line, untested] of [
      ["```ts", false],
      ["```", false],
      ["```ts untested", true],
      ["~~~ts untested", true],
      ["```ts title=x untested", true],
      ['```ts title="untested"', false],
      ["```ts untested-later", false],
      // The first word is the language, so the site would render "untested".
      ["```untested", false],
      ["``` untested", false],
    ] as const) {
      expect(scanMarkdown(line)[0], line).toEqual({
        line,
        kind: "fence-open",
        untested,
      });
    }
  });

  it("treats an untested fence nested in another fence as code", () => {
    const kinds = scanMarkdown(
      ["````md", "```ts untested", "code();", "```", "````"].join("\n"),
    ).map((s) => s.kind);
    expect(kinds).toEqual([
      "fence-open",
      "code",
      "code",
      "code",
      "fence-close",
    ]);
  });
});

describe("checkDoc", () => {
  const MARKER_LINE = "<!-- snippet: connect-and-fund.ts#create-keypair -->";

  it("rejects a plain fence in a guide", () => {
    expect(checkDoc("g.md", "text\n```ts\nx();\n```", true)).toEqual({
      problems: [
        'g.md:2: untested code block — replace it with a snippet marker, or add "untested" to its fence line',
      ],
      tested: 0,
      untested: 0,
    });
  });

  it("counts markers as tested and untested fences as untested", () => {
    const md = [MARKER_LINE, "prose", "```ts untested", "x();", "```"];
    expect(checkDoc("g.md", md.join("\n"), true)).toEqual({
      problems: [],
      tested: 1,
      untested: 1,
    });
  });

  it("allows plain and untested fences outside guides, without counting them", () => {
    for (const fence of ["```ts", "```ts untested"]) {
      expect(checkDoc("m.md", `${fence}\nx();\n\`\`\``, false), fence).toEqual({
        problems: [],
        tested: 0,
        untested: 0,
      });
    }
  });

  it("reports only the after-marker error for a fence after a marker", () => {
    for (const fence of ["```ts", "```ts untested"]) {
      for (const isGuide of [true, false]) {
        const md = [MARKER_LINE, "", fence, "x();", "```"].join("\n");
        expect(checkDoc("d.md", md, isGuide), `${fence} ${isGuide}`).toEqual({
          problems: [
            `d.md:3: inline code block after snippet marker "${MARKER_LINE}" — remove it; the snippet is injected at build time`,
          ],
          tested: 1,
          untested: 0,
        });
      }
    }
  });

  it("reports a marker that does not resolve and a near-miss marker", () => {
    const md = [
      "<!-- snippet: connect-and-fund.ts#no-such-region -->",
      "<!-- snippet connect-and-fund.ts#create-keypair -->",
    ].join("\n");
    const { problems, tested } = checkDoc("d.md", md, true);
    expect(tested).toBe(0);
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/^d\.md:1: .*no-such-region/);
    expect(problems[1]).toMatch(/^d\.md: line 2: malformed snippet marker/);
  });
});

describe("expandSnippetMarkers", () => {
  it("throws a line-numbered error on a malformed marker", () => {
    expect(() =>
      expandSnippetMarkers("fine\n<!-- snippet send-a-payment.ts#build -->"),
    ).toThrow(/line 2: malformed snippet marker/);
  });

  it("replaces a real marker with a fenced block of the region's code", () => {
    // Uses a live region so this also guards the docs' most-copied block.
    const expanded = expandSnippetMarkers(
      "<!-- snippet: connect-and-fund.ts#create-keypair -->",
    );
    expect(expanded).toMatch(/^```ts\n/);
    expect(expanded).toMatch(/Keypair\.random\(\)/);
    expect(expanded).toMatch(/\n```$/);
    expect(expanded).not.toMatch(/#region/);
  });

  it("throws when the marker references a missing region", () => {
    expect(() =>
      expandSnippetMarkers("<!-- snippet: connect-and-fund.ts#nope -->"),
    ).toThrow(/no #region nope/);
  });
});

describe("snippetRegion", () => {
  it("rejects references that escape examples/guides/", () => {
    expect(() => snippetRegion("../../src/index.ts", "x")).toThrow(
      /outside examples\/guides/,
    );
  });
});
