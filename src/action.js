import core from "@actions/core";
import childProcess from "node:child_process";
import { promisify } from "node:util";
import axios from "axios";
import { access } from "node:fs/promises";

const execFile = promisify(childProcess.execFile);

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchGistTests() {
  const res = await axios.request({
    method: "GET",
    url: "https://api.github.com/gists/d5d6a846e40460db3e1bb06641c54c5b",
  });

  const res2 = await axios.request({
    method: "GET",
    url: res.data.files["checks.json"].raw_url,
  });

  const tests = res2.data;

  return tests;
}

async function main() {
  const tests = await fetchGistTests();

  let failedNbTest = 0;

  for (const test of tests) {
    const filepath = test.filename;
    if (!(await fileExists(filepath))) {
      continue;
    }
    const programArgs = [filepath];

    const testOutput = test.output?.trim();
    const testInput = test.input?.trim();

    if (testInput) {
      programArgs.push(...testInput.split(" "));
    }
    const commandStr = `node ${programArgs.join(" ")}`;
    core.info(commandStr);
    const { stdout, stderr } = await execFile("node", programArgs);
    const commandOutput = stdout.trim();

    if (commandOutput === testOutput) {
      core.info("PASS ✅");
    } else {
      failedNbTest++;
      core.info(`FAILED ❌`);
      core.info(`expected: ${testOutput}`);
      core.info(`received: ${commandOutput}`);
    }
    core.info("\n");
  }

  if (failedNbTest > 0) {
    core.setFailed(`${failedNbTest} tests failed`);
  }
}

main().catch((err) => core.setFailed(err.message));
