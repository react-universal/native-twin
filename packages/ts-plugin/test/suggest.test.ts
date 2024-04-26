import path from 'path';
import { getFirstResponseOfType, openMockFile } from './_helpers';
import createServer from './server-fixture';

const mockFileName = path.join(__dirname, 'project-fixture', 'main.ts');

const createServerWithMockFile = (fileContents: string) => {
  const server = createServer(path.join(__dirname, 'project-fixture'));
  openMockFile(server, mockFileName, fileContents);
  return server;
};

describe('TS PLUGIN', () => {
  it('Complete suggestion list', async () => {
    expect(true).toBe(true);
    const server = createServerWithMockFile('const q = css``');
    server.sendCommand('completions', { file: mockFileName, offset: 15, line: 1 });

    await server.close();
    const completionsResponse = getFirstResponseOfType('completions', server);
    if (completionsResponse.body) {
      console.log('SIZE: ', completionsResponse.body.length);
    }

    expect(completionsResponse.success).toBeTruthy();
    expect(completionsResponse.body.length).toStrictEqual(5530);
  });
  it('Enumerate completions', () => {
    // const utility = intellisense.completions().classes.get('border-blue');
    // if (utility) {
    //   console.log('UTIL: ', createCompletionEntryDetails(utility, intellisense.tw));
    // }
    // expect(Array.from(intellisense.completions().classes, ([name]) => name)).toMatchSnapshot(
    //   'Completions Snapshot',
    // );
    expect(true).toBe(true);
  });
});
