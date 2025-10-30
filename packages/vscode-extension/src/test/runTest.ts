import { runTests } from '@vscode/test-electron';
import * as os from 'os';
import * as path from 'path';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './index');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      reuseMachineInstall: true,
      launchArgs: [
        '--user-data-dir',
        `${os.tmpdir()}`,
        '--disable-extensions',
        './project-fixture',
      ],
    });
  } catch (e) {
    console.error('Failed to run tests', e);
    process.exit(1);
  }
}

main();
