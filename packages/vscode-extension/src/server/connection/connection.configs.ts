import { Hash } from 'effect';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';

interface ServerConfig {
  readonly hasConfigurationCapability: boolean;
  readonly hasWorkspaceFolderCapability: boolean;
  readonly hasDiagnosticRelatedInformationCapability: boolean;
}

export class ServerConfigState extends Data.TaggedClass('ServerConfigState')<ServerConfig> {
  setConfig(values: ServerConfig) {
    return new ServerConfigState({ ...values });
  }
}

const a = Data.struct({
  a: 1,
});

const b = Data.struct({
  a: 1,
});

a === b; // ?
Equal.equals(a, b); // ?

class AA implements Equal.Equal {
  constructor(readonly name: string) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    if (that instanceof AA) {
      return Equal.equals(this.name, that.name);
    }
    return false;
  }

  [Hash.symbol](): number {
    return this.name.length;
  }
}

const aa = new AA('Chris');
const bb = new AA('Chris');

Equal.equals(aa, bb); //?
