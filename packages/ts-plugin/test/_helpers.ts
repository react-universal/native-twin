import { assert } from 'chai';

export const openMockFile = (server, mockFileName, fileContent) => {
  server.send({
    command: 'open',
    arguments: {
      file: mockFileName,
      fileContent,
      scriptKindName: 'TS',
    },
  });
  return server;
};

export const getFirstResponseOfType = (command, server) => {
  const response = server.responses.find((response) => response.command === command);
  assert.isTrue(response !== undefined);
  return response;
};

export const getResponsesOfType = (command, server) => {
  return server.responses.filter((response) => response.command === command);
};
