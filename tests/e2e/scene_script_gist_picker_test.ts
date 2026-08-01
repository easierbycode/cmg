// E2E: the level editor's scene-script GIST picker, driven in a real browser.
//
// The flow itself -- fixtures, the stand-in api.github.com, the browser hunt
// and the ordered steps -- lives in ./gist_picker_flow.ts, shared verbatim
// with tools/visual-test-runner. This file is just the assertion layer: run
// the steps, fail on any check that did not hold. See that module's header for
// what is faked (one seam) and what is the shipped editor code (everything
// else).
//
// Run with:  deno task test:e2e        (no network needed)
// Or watch:  deno task test:visual     (same steps, screenshotted)
//
// A browser is found automatically -- installed Chrome/Edge first, astral's
// download as a fallback. CHROME_PATH overrides if you need a specific one.

import { assert } from "@std/assert";
import { runFlow, STEPS } from "./gist_picker_flow.ts";

Deno.test("scene-script gist picker: list, select, choose file, pin revision", async () => {
  const result = await runFlow();

  // Report every failed check at once rather than dying on the first, so a
  // broken run tells you everything that moved.
  const problems: string[] = [];
  for (const step of result.steps) {
    if (step.status === "skipped") {
      problems.push(
        `step ${step.index} "${step.name}": skipped (an earlier step failed)`,
      );
      continue;
    }
    if (step.error) {
      problems.push(`step ${step.index} "${step.name}": threw ${step.error}`);
      continue;
    }
    for (const c of step.checks.filter((c) => !c.ok)) {
      problems.push(
        `step ${step.index} "${step.name}" — ${c.label}: ` +
          `got ${Deno.inspect(c.actual)}, expected ${Deno.inspect(c.expected)}`,
      );
    }
  }

  assert(
    result.ok && problems.length === 0,
    `${problems.length} failed check(s) in ${result.browser}:\n  ` +
      problems.join("\n  "),
  );

  // Guard the flow itself: a step list that silently shrank would otherwise
  // still report a green run.
  assert(
    result.steps.length === STEPS.length && STEPS.length === 11,
    `expected all 11 steps to run, saw ${result.steps.length}`,
  );
});
