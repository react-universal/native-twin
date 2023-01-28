import { ExecutorContext } from '@nrwl/devkit';
import { ChildProcess, fork } from 'child_process';
import { join } from 'path';
import type { BuildExecutorSchema } from './schema';

export interface ReactNativeBuildOutput {
  success: boolean;
}

let childProcess: ChildProcess;

export default async function* buildExecutor(
  _options: BuildExecutorSchema,
  context: ExecutorContext,
): AsyncGenerator<ReactNativeBuildOutput> {
  const projectRoot =
    !!context.projectsConfigurations?.projects && context.projectName
      ? context.projectsConfigurations?.projects[context.projectName].root
      : '';
  console.log('PROJECT_ROOT: ', projectRoot);
  try {
    const result = await runCliBuild(context.root, projectRoot);
    console.log('RESULT: ', result);
    yield { success: true };
  } finally {
    if (childProcess) {
      childProcess.kill();
    }
  }
}

function runCliBuild(workspaceRoot: string, projectRoot: string) {
  return new Promise((resolve, reject) => {
    childProcess = fork(join(workspaceRoot, './node_modules/.bin/expo-module'), ['build'], {
      cwd: join(workspaceRoot, projectRoot),
    });

    // Ensure the child process is killed when the parent exits
    process.on('exit', () => childProcess.kill());
    process.on('SIGTERM', () => childProcess.kill());

    childProcess.on('error', (err) => {
      reject(err);
    });
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}
