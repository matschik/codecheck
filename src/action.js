import core from "@actions/core";
import childProcess from "node:child_process";
import { promisify } from "node:util";
import axios from "axios";

const execFile = promisify(childProcess.execFile);

async function main() {
  const res = await axios.request({
    method: "GET",
    url: "https://api.github.com/gists/d5d6a846e40460db3e1bb06641c54c5b",
  });

  const res2 = await axios.request({
    method: "GET",
    url: res.data.files["checks.json"].raw_url,
  });

  const tests = res2.data;

  let failedNbTest = 0;

  for (const test of tests) {
    const { stdout, stderr } = await execFile("node", [
      test.filename,
      ...(test.input?.split(" ") || []),
    ]);
    const commandOutput = stdout.trim();
    const testOutput = test.output.trim();
    if (commandOutput === testOutput) {
      core.info(`${test.filename} PASS ✅`);
    } else {
      failedNbTest++;
      core.info(`${test.filename} FAILED ❌`);
      core.info(`expected: ${testOutput}`);
      core.info(`received: ${commandOutput}`);
    }
  }

  if (failedNbTest > 0) {
    core.setFailed(`${failedNbTest} tests failed`);
  }
}

main().catch((err) => core.setFailed(err.message));
