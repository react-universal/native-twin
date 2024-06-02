import path from 'path';
import { getFirstResponseOfType, openMockFile } from './_helpers';
import createServer from './server-fixture';

const mockFileName = path.join(__dirname, 'project-fixture', 'main.ts');

const createServerWithMockFile = (fileContents: string) => {
  const server = createServer(path.join(__dirname, 'project-fixture'));
  openMockFile(server, mockFileName, fileContents);
  return server;
};

describe.skip('Completions', () => {
  it('Completions for uncompleted className', async () => {
    const server = createServerWithMockFile('const q = css`bg`');
    server.sendCommand('completions', { file: mockFileName, offset: 17, line: 1 });

    await server.close();
    const completionsResponse = getFirstResponseOfType('completions', server);
    // console.log('RESPONSE: ', JSON.stringify(completionsResponse, null, 2));
    if (completionsResponse.body) {
      console.log('SIZE: ', completionsResponse.body.length);
    }

    expect(completionsResponse.success).toBeTruthy();
  });

  // it('Completions for partial className', () => {
  //   const server = createServerWithMockFile('const q = css`bg-`');
  //   server.sendCommand('completions', { file: mockFileName, offset: 18, line: 1 });

  //   return server.close().then(() => {
  //     const completionsResponse = getFirstResponseOfType('completions', server);
  //     assert.isTrue(completionsResponse.success);
  //   });
  // });

  // it('Completions for string with some complete classNames', () => {
  //   const server = createServerWithMockFile('const q = css`bg-blue-200 absolute `');
  //   server.sendCommand('completions', { file: mockFileName, offset: 36, line: 1 });

  //   return server.close().then(() => {
  //     const completionsResponse = getFirstResponseOfType('completions', server);
  //     assert.isTrue(completionsResponse.success);
  //   });
  // });
});
