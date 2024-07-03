import { fork } from 'node:child_process';
import path from 'node:path';
import { Duplex } from 'node:stream';
import type { ProtocolConnection } from 'vscode-languageclient/node';
import { createConnection } from 'vscode-languageserver/node';

export function connect() {
  class TestStream extends Duplex {
    override _write(chunk: string, _encoding: string, done: () => void) {
      this.emit('data', chunk);
      console.log('DATA: ', Buffer.from(chunk).toString('utf-8'));
      done();
    }

    override _read(_size: number): void {}
  }

  const input = new TestStream();
  const output = new TestStream();

  const server = createConnection(input, output);

  const client = createConnection(output, input) as unknown as ProtocolConnection;
  client.listen();
  // client.onError((error) => {
  //   console.log('ERROR: ', error);
  // });
  console.log('CLIENT: ', client);

  return {
    client,
    server,
  };
}

export async function launch() {
  const child = fork(
    path.resolve('@native-twin/language-server/.bin/native-twin-language-server'),
    { silent: false },
  );
  if (!child.stdout || !child.stdin) throw new Error('No Child std found');
  console.log('CHILD: ', child);

  const client = createConnection(child.stdout, child.stdin);

  client.listen();

  return client;
}
