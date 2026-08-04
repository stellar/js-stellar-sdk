// Reprints every skipped and todo test as an explicit block at the end of a
// run.
//
// Vitest's summary collapses them into a single count ("6 skipped"), which is
// trivial to miss in a run of thousands of passing tests. That matters because
// a whole file can stop running without anything turning red — a fixture that
// moved, a `skipIf` predicate that flipped, a stale entry in a skip list — and
// the run still reads green. Naming the lost coverage forces it to be looked
// at rather than scrolled past.
//
// Deliberately advisory: it never fails a run. Whether a given skip is
// acceptable is a case-by-case call, so this only makes the cost visible.
import type { Reporter, TestCase, TestModule } from "vitest/node";

interface SkipRecord {
  file: string;
  project: string;
  name: string;
  note: string | undefined;
}

const RULE = "─".repeat(72);

function toRecord(mod: TestModule, test: TestCase): SkipRecord {
  const result = test.result();
  return {
    file: mod.relativeModuleId,
    project: test.project.name,
    name: test.fullName,
    // `note` only exists on the skipped result shape (set by `ctx.skip(note)`).
    note: result.state === "skipped" ? result.note : undefined,
  };
}

function collect(testModules: ReadonlyArray<TestModule>): {
  skipped: SkipRecord[];
  todo: SkipRecord[];
  wholeFiles: Set<string>;
} {
  const skipped: SkipRecord[] = [];
  const todo: SkipRecord[] = [];
  const wholeFiles = new Set<string>();

  for (const mod of testModules) {
    const all = [...mod.children.allTests()];
    const notRun = all.filter((test) => test.result().state === "skipped");
    if (notRun.length === 0) continue;

    // Nothing in this file ran at all — the loudest case, and the one a
    // single "1 skipped" file count hides completely.
    if (notRun.length === all.length) wholeFiles.add(mod.relativeModuleId);

    for (const test of notRun) {
      const record = toRecord(mod, test);
      // `it.todo` also lands in the skipped state; `options.mode` is the only
      // thing that separates a deliberate placeholder from lost coverage.
      if (test.options.mode === "todo") {
        todo.push(record);
      } else {
        skipped.push(record);
      }
    }
  }

  return { skipped, todo, wholeFiles };
}

function headline(
  skipped: number,
  todo: number,
  wholeFiles: Set<string>,
): string {
  const counts: string[] = [];
  if (skipped > 0) counts.push(`${skipped} skipped`);
  if (todo > 0) counts.push(`${todo} todo`);

  const files = wholeFiles.size;
  const entirely =
    files > 0
      ? `, including ${files} file${files === 1 ? "" : "s"} entirely`
      : "";

  return `DID NOT RUN: ${counts.join(", ")}${entirely}`;
}

function section(
  label: string,
  records: SkipRecord[],
  wholeFiles: Set<string>,
  showProject: boolean,
): string[] {
  const byFile = new Map<string, SkipRecord[]>();
  for (const record of records) {
    const group = byFile.get(record.file);
    if (group) {
      group.push(record);
    } else {
      byFile.set(record.file, [record]);
    }
  }

  const lines = ["", `${label}:`];
  const files = [...byFile.keys()].sort((a, b) => a.localeCompare(b));
  for (const file of files) {
    const group = byFile.get(file) ?? [];
    const flag = wholeFiles.has(file) ? "   <-- ENTIRE FILE" : "";
    lines.push(`  ${file}${flag}`);
    for (const record of group) {
      const project = showProject ? ` [${record.project}]` : "";
      const note = record.note ? ` — ${record.note}` : "";
      lines.push(`    ${record.name}${project}${note}`);
    }
  }

  return lines;
}

export class SkippedTestsReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    const { skipped, todo, wholeFiles } = collect(testModules);
    if (skipped.length === 0 && todo.length === 0) return;

    // Browser runs execute the same files once per browser instance, so the
    // same test name shows up twice; the project name is what tells them apart.
    const projects = new Set(
      [...skipped, ...todo].map((record) => record.project),
    );
    const showProject = projects.size > 1;

    const lines = ["", RULE, headline(skipped.length, todo.length, wholeFiles)];
    if (skipped.length > 0) {
      lines.push(...section("skipped", skipped, wholeFiles, showProject));
    }
    if (todo.length > 0) {
      lines.push(...section("todo", todo, wholeFiles, showProject));
    }
    lines.push(RULE, "");

    process.stdout.write(`${lines.join("\n")}\n`);
  }
}
