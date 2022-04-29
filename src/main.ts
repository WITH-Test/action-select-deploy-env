import * as core from "@actions/core";
import {context} from "@actions/github";

process.on("unhandledRejection", handleError);
main().catch(handleError);

const FEATURE_RE: RegExp = new RegExp('^feature/[a-z]+(\d+)_')
const VERSION_RE: RegExp = new RegExp ('^v?\d+\.\d+\.\d+$')
const UNSAFE_CHAR: RegExp = new RegExp('[^\da-z]+')



async function main(): Promise<void> {
  console.log('Context', context)

  const trigger = context.ref

  let env

  if (undefined === env) {
    core.setFailed("Something went terribly wrong, trying to generate sub-domain for branch {}, but this pattern of branch doesn't exist. I suggest you bring cookies to the person in charge of builds.")
  } else {

    core.setOutput("environment", env);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError(err: any): void {
  console.error(err);
  core.setFailed(`Unhandled error: ${err}`);
}
