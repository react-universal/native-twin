import { fork } from 'node:child_process';
import { Duplex } from 'node:stream';
import type { ProtocolConnection } from 'vscode-languageclient/node';
import { createConnection } from 'vscode-languageserver/node';

export async function connect() {
  class TestStream extends Duplex {
    _write(chunk: string, _encoding: string, done: () => void) {
      this.emit('data', chunk);
      done();
    }

    _read(_size: number): void {}
  }

  const input = new TestStream();
  const output = new TestStream();

  const server = createConnection(input, output);

  const client = createConnection(output, input) as unknown as ProtocolConnection;
  client.listen();

  return {
    client,
    server,
  };
}

export async function launch() {
  const child = fork('./bin/native-twin-language-server', { silent: true });
  if (!child.stdout || !child.stdin) throw new Error('No Child std found');

  const client = createConnection(child.stdout, child.stdin);

  client.listen();

  return client;
}
