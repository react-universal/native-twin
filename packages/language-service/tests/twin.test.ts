import { ProtocolNotificationType0 } from "vscode-languageserver-protocol";
import { init } from "./common"

describe('suite', () => {
  test('test a',async () => {
    const server = await init('react');
    console.log('asd',server.project)
    expect(1).toBe(1);
    const doc = await server.openDocument({text: '<div className="bg-green" />',dir: 'react/index.ts'})
    // server.client.dispose();
    console.log(doc)
    await doc.updateSettings({a: 1})
    // server.client.dispose()
    console.log('asdadasd')
  },10000)
})