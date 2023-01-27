import { ExecutorContext } from "@nrwl/devkit";
import { join } from "path";
import { ChildProcess, fork } from "child_process";
import type { BuildExecutorSchema } from "./schema";

export interface ReactNativeBuildOutput {
  success: boolean;
}

let childProcess: ChildProcess;

export default async function* buildExecutor(
  _options: BuildExecutorSchema,
  context: ExecutorContext
): AsyncGenerator<ReactNativeBuildOutput> {
  const projectRoot =
    !!context.projectsConfigurations?.projects && context.projectName
      ? context.projectsConfigurations?.projects[context.projectName].root
      : "";

  try {
    await runCliBuild(context.root, projectRoot);
    yield { success: true };
  } finally {
    if (childProcess) {
      childProcess.kill();
    }
  }
}

function runCliBuild(
  workspaceRoot: string,
  projectRoot: string,
) {
  return new Promise((resolve, reject) => {
    childProcess = fork(
      join(workspaceRoot, './node_modules/.bin/expo-module'),
      ["yarn", "build"],
      { cwd: join(workspaceRoot, projectRoot) }
    );

    // Ensure the child process is killed when the parent exits
    process.on("exit", () => childProcess.kill());
    process.on("SIGTERM", () => childProcess.kill());

    childProcess.on("error", (err) => {
      reject(err);
    });
    childProcess.on("exit", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}
