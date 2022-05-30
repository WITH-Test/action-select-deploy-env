import * as core from "@actions/core";
import {context} from "@actions/github";

const FEATURE_RE: RegExp = /^feature\/[a-z]+0*(?<number>\d+)_/g
const VERSION_RE: RegExp = /^v?\d+\.\d+\.\d+$/
const UNSAFE_CHAR: RegExp = /[^\da-z]+/g

process.on("unhandledRejection", handleError);
main().catch(handleError);

interface Infra {
  environment: string
  key: string
}

function refInfo({ref}: { ref: string }): Infra {
  const isTag = ref.startsWith('refs/tags/')
  if (isTag) {
    const namedTag = ref.replace(/^refs\/tags\//, '')
    if (VERSION_RE.test(namedTag)) {
      return {
        environment: "production",
        key: namedTag
      }
    }
  }

  const isBranch = ref.startsWith('refs/heads/')
  if (isBranch) {
    const branchName = ref.replace(/^refs\/heads\//, '')

    if (['master', 'main'].includes(branchName)) {
      return {
        environment: "staging",
        key: 'main'
      }
    }

    if ('develop' === branchName) {
      return {
        environment: "develop",
        key: branchName
      }
    }

    if (FEATURE_RE.test(branchName)) {

      // TS regexp (named) capturing groups suck. This is ugly but it works?
      let branchNumber: string = ""
      const handleMatch = function (...params: any[] /* $0, $1, $2 offset, input, groups */) {
        // groups is the last argument in the variadic signature.
        const groups = params.pop();
        branchNumber = groups.number
        return groups.number;
      }

      branchName.replace(FEATURE_RE, handleMatch)

      if (branchNumber) {
        return {
          environment: "feature",
          key: `dev_${branchNumber}`
        }
      }
    }
  }

  const friendlyRef = ref.split('/').slice(2).join('/')
  throw new Error("Something went terribly wrong, trying to select " +
    `an environment from ref ${friendlyRef}, but this pattern is not recognized.` +
    " I suggest you bring cookies to the person in charge of builds.")
}

function deployUnit({repo}: {repo: string}, unit: string): string {
  if ('.' !== unit) {
    return `${repo}/${unit}`.toLowerCase()
  }
  return repo.toLowerCase()
}

async function main(): Promise<void> {

  console.log("GitHub context", context)

  const infra = refInfo(context)
  console.log("RefInfo:", infra)

  const unit = core.getInput("deploy_unit")
  core.setOutput("unit", deployUnit(context.repo, unit))

  core.setOutput("environment", infra.environment);
  core.setOutput("key", infra.key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError(err: any): void {
  console.error(err);
  core.setFailed(`Unhandled error: ${err}`);
}
