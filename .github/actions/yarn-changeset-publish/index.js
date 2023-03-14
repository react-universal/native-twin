// .github/actions/yarn-changeset-publish/index.js
// @ts-check
const core = require('@actions/core');
const { getOctokit, context } = require('@actions/github');
const { exec } = require('@actions/exec');
const fs = require('fs');
const readChangesets = require('@changesets/read').default;

async function execWithOutput(command, args, options) {
  let myOutput = '';
  let myError = '';

  return {
    code: await exec(command, args, {
      listeners: {
        stdout: (data) => {
          myOutput += data.toString();
        },
        stderr: (data) => {
          myError += data.toString();
        },
      },

      ...options,
    }),
    stdout: myOutput,
    stderr: myError,
  };
}

function nthIndexOf(str, re, n) {
  let match = re.exec(str);
  let i = 1;
  let lastIndex = -1;

  while ((match = re.exec(str)) != null) {
    if (i >= n) {
      break;
    }
    lastIndex = match.index;
    i++;
  }

  return lastIndex;
}

function getChangeLogForRelease(pkg) {
  try {
    const VERSION_MD_HEADING = /## \d+\.\d+\.\d+/g;
    const changeLogPath = require.resolve(pkg.name + '/CHANGELOG.md');

    const changelog = fs.readFileSync(changeLogPath, 'utf-8');
    const lastVersionHeadingIdx = nthIndexOf(changelog, VERSION_MD_HEADING, 2);

    if (lastVersionHeadingIdx === -1) {
      return changelog;
    }

    return changelog.substring(0, lastVersionHeadingIdx);
  } catch (err) {
    console.error(err);
    return '';
  }
}

async function runPublish() {
  const { stdout } = await execWithOutput(
    'yarn',
    [
      'workspaces',
      'foreach',
      '-ipv',
      '--no-private',
      'npm',
      'publish',
      '--tolerate-republish',
    ],
    {
      cwd: process.cwd(),
    },
  );

  const lines = stdout.split('\n');
  const publishedRgx = /\[([@?a-zA-Z\-\/]+)\]:.*Package archive published/;
  const publishedPackages = [];
  for (const line of lines) {
    const didPublish = line.match(publishedRgx);
    if (didPublish) {
      const pkgName = didPublish[1];
      const pkgJson = require(pkgName + '/package.json');
      publishedPackages.push(pkgJson);
    }
  }

  return publishedPackages;
}

async function main() {
  const githubToken = process.env.GITHUB_TOKEN;
  // @ts-expect-error
  const client = getOctokit(githubToken);

  const changesets = await readChangesets(process.cwd());
  const shouldRelease = changesets.length === 0;

  if (!shouldRelease) {
    core.info('changesets exist, skipping publish');
    process.exit(0);
  }

  const publishedPackages = await runPublish();

  for (const pkg of publishedPackages) {
    const tag_name = `${pkg.name}@${pkg.version}`;
    core.info(`creating release for ${tag_name}`);

    const body = getChangeLogForRelease(pkg);
    // @ts-expect-error
    await client.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name,
      body,
      name: tag_name,
    });
  }
}

main().catch((err) => core.setFailed(err));
