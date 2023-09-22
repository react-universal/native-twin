const assert = require('chai').assert;
const path = require('path');
const createServer = require('../server-fixture');
const { openMockFile, getFirstResponseOfType } = require('./_helpers');

const mockFileName = path.join(__dirname, '..', 'project-fixture', 'main.ts');

describe('CompletionEntryDetails', () => {
  it('should return details for color completion', () => {
    const server = createServer();
    openMockFile(server, mockFileName, 'const q = css`color:`');
    server.sendCommand('completionEntryDetails', {
      file: mockFileName,
      offset: 21,
      line: 1,
      entryNames: ['blue'],
    });

    return server.close().then(() => {
      const completionsResponse = getFirstResponseOfType('completionEntryDetails', server);
      assert.isTrue(completionsResponse.success);
      assert.strictEqual(completionsResponse.body.length, 1);

      const firstDetails = completionsResponse.body[0];
      assert.strictEqual(firstDetails.name, 'blue');
      assert.strictEqual(firstDetails.documentation[0].text, '#0000ff');
    });
  });
});
