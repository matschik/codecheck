import core from "@actions/core";
import childProcess from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(childProcess.execFile);

async function main() {
  const { stdout, stderr } = await execFile("node", ["fixtures/mycode.js"]);

  console.log({ stdout, stderr });
}

main().catch((err) => core.setFailed(err.message));
