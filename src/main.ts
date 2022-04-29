import * as core from "@actions/core";
import {context} from "@actions/github";

const FEATURE_RE: RegExp = new RegExp('^feature\/[a-z]+(\d+)_')
const VERSION_RE: RegExp = new RegExp('^v?\d+\.\d+\.\d+$')
const UNSAFE_CHAR: RegExp = new RegExp('[^\da-z]+')

process.on("unhandledRejection", handleError);
main().catch(handleError);


async function generateInfra(ref: string): Promise<string> {
  const isTag = ref.startsWith('refs/tags/')

  if (isTag) {
    const namedTag = ref.replace(/^refs\/tags\//, '')

    return "production"
  }
  const errorMsg = "Something went terribly wrong, trying to select " +
    "an environment from ref {ref}, but this pattern is not recognized." +
    " I suggest you bring cookies to the person in charge of builds."

  const isBranch = ref.startsWith('refs/heads/')
  if (!isBranch) {
    throw new Error(errorMsg.replace('{ref}', ref))
  }

  const branchName = ref.replace(/^refs\/heads\//, '')
  console.log('matched', branchName)
  if (['master', 'main'].includes(branchName)) {
    return "staging"
  } else if ('develop' === branchName) {
    return "develop"
  } else if (FEATURE_RE.test(branchName)) {
    const safeBranch = branchName.replace(UNSAFE_CHAR, '')
    return "feature"
  }

  throw new Error(errorMsg.replace('{ref}', branchName))
}


async function main(): Promise<void> {
  const env = await generateInfra(context.ref)

  if (undefined === env) {
    core.setFailed("Something went terribly wrong, trying to generate " +
      `sub-domain for branch ${context.ref}, but this pattern of branch doesn't exist.` +
      " I suggest you bring cookies to the person in charge of builds.")
  } else {
    core.setOutput("environment", env);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError(err: any): void {
  console.error(err);
  core.setFailed(`Unhandled error: ${err}`);
}
