import { resolve } from 'node:path';
import { runLanguageServer } from './node/language-server-runner.js';
import { LanguageName } from './node/server-commons.js';

export const runTwinServer = (baseDir: string, relativeDir: string) => {
  const processRunPath = resolve(baseDir, relativeDir);
  runLanguageServer({
    serverName: 'TWIN',
    pathName: '/twin',
    serverPort: 30001,
    runCommand: LanguageName.node,
    runCommandArgs: [processRunPath, '--stdio'],
    wsServerOptions: {
      noServer: true,
      perMessageDeflate: false,
    },
  });
};
