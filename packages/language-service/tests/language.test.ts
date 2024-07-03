import { FixtureContext, withFixture } from './common';

function buildCompletion(c: FixtureContext) {
  return async function completion({
    lang,
    text,
    position,
    context = {
      triggerKind: 1,
    },
    settings,
    dir = '',
  }) {
    let textDocument = await c.openDocument({ text, lang, settings, dir });

    return c.sendRequest('textDocument/completion', {
      textDocument,
      position,
      context,
    });
  };
}

describe('asd', () => {
  withFixture('react', (ctx) => {
    let completion = buildCompletion(ctx);
    async function expectCompletions({ expect, lang, text, position, settings }) {
      let result: any = await completion({ lang, text, position, settings });
      let textEdit = expect.objectContaining({
        range: { start: position, end: position },
      });

      expect(result.items.length).toBe(11457);
      expect(result.items.filter((item) => item.label.endsWith(':')).length).toBe(165);
      expect(result).toEqual({
        isIncomplete: false,
        items: expect.arrayContaining([
          expect.objectContaining({ label: 'hover:', textEdit }),
          expect.objectContaining({ label: 'uppercase', textEdit }),
        ]),
      });
    }

    it('HTML', (done) => {
      expectCompletions({
        expect,
        text: 'css``',
        position: { line: 0, character: 4 },
        lang: 'typescript',
      }).then(() => done());
    });
  });
});
