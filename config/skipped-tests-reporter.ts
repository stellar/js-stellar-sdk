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

// Per-path tally. A run can load one path several times — the browser suite
// loads every file once per browser — so whole-file status has to be counted
// against the number of modules for that path, not stored as a single flag.
// Otherwise a file skipped in one browser reads as dead in all of them.
interface FileStatus {
  modules: number;
  wholeSkipped: number;
  // Projects behind `wholeSkipped`, kept for display when only some skipped.
  projects: Set<string>;
}

type FileStatuses = Map<string, FileStatus>;

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
  statuses: FileStatuses;
} {
  const skipped: SkipRecord[] = [];
  const todo: SkipRecord[] = [];
  const statuses: FileStatuses = new Map();

  for (const mod of testModules) {
    const file = mod.relativeModuleId;
    const status = statuses.get(file) ?? {
      modules: 0,
      wholeSkipped: 0,
      projects: new Set<string>(),
    };
    // Counted before the early continue below: a project that ran the file in
    // full still has to weigh in on "did every project skip this?".
    status.modules += 1;
    statuses.set(file, status);

    const all = [...mod.children.allTests()];
    const notRun = all.filter((test) => test.result().state === "skipped");
    if (notRun.length === 0) continue;

    // Nothing in this file ran at all — the loudest case, and the one a
    // single "1 skipped" file count hides completely.
    if (notRun.length === all.length) {
      status.wholeSkipped += 1;
      status.projects.add(mod.project.name);
    }

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

  return { skipped, todo, statuses };
}

// A path only counts as entirely skipped when every module for it skipped
// everything.
function isFullySkipped(status: FileStatus): boolean {
  return status.wholeSkipped > 0 && status.wholeSkipped === status.modules;
}

function entireFileFlag(file: string, statuses: FileStatuses): string {
  const status = statuses.get(file);
  if (!status || status.wholeSkipped === 0) return "";
  if (isFullySkipped(status)) return "   <-- ENTIRE FILE";

  // Only some projects skipped the whole file, so say which — the file did run
  // elsewhere and a bare "ENTIRE FILE" would be a false alarm.
  const named = [...status.projects].filter((project) => project !== "").sort();
  const where = named.map((project) => `[${project}]`).join(", ");
  return where
    ? `   <-- ENTIRE FILE in ${where}`
    : "   <-- ENTIRE FILE in some projects";
}

function headline(
  skipped: number,
  todo: number,
  statuses: FileStatuses,
): string {
  const counts: string[] = [];
  if (skipped > 0) counts.push(`${skipped} skipped`);
  if (todo > 0) counts.push(`${todo} todo`);

  const files = [...statuses.values()].filter(isFullySkipped).length;
  const entirely =
    files > 0
      ? `, including ${files} file${files === 1 ? "" : "s"} entirely`
      : "";

  return `DID NOT RUN: ${counts.join(", ")}${entirely}`;
}

function section(
  label: string,
  records: SkipRecord[],
  statuses: FileStatuses,
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
    lines.push(`  ${file}${entireFileFlag(file, statuses)}`);
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
    const { skipped, todo, statuses } = collect(testModules);
    if (skipped.length === 0 && todo.length === 0) return;

    // Browser runs execute the same files once per browser instance, so the
    // same test name shows up twice; the project name is what tells them apart.
    // Derived from the projects active in the run rather than the ones holding
    // skips, so a finding that applies to only one project still names it.
    const projects = new Set(testModules.map((mod) => mod.project.name));
    const showProject = projects.size > 1;

    const lines = ["", RULE, headline(skipped.length, todo.length, statuses)];
    if (skipped.length > 0) {
      lines.push(...section("skipped", skipped, statuses, showProject));
    }
    if (todo.length > 0) {
      lines.push(...section("todo", todo, statuses, showProject));
    }
    lines.push(RULE, "");

    process.stdout.write(`${lines.join("\n")}\n`);
  }
}
