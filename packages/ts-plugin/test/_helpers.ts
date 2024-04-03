import { assert } from 'chai';

export const openMockFile = (server: any, mockFileName: any, fileContent: any) => {
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

export const getFirstResponseOfType = (command: any, server: any) => {
  const response = server.responses.find((response: any) => response.command === command);
  assert.isTrue(response !== undefined);
  return response;
};

export const getResponsesOfType = (command: any, server: any) => {
  return server.responses.filter((response: any) => response.command === command);
};
