import type { TwinModuleAst } from '../Domain/TwinAst';
import type { TwinExtractor } from '../StyleSheet';

export class ProjectTransformer {
  module: TwinModuleAst;
  extractor: TwinExtractor;
  constructor(data: {
    module: TwinModuleAst;
    extractor: TwinExtractor;
  }) {
    this.module = data.module;
    this.extractor = data.extractor;
  }

  data() {
    this.module;
  }
}
