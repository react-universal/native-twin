function logger(values: any, context: any) {
  console.log('LOGGER: ', values, context);
}

class ClassNameParser {
  private storedClassNames: string[];

  constructor() {
    this.storedClassNames = [];
  }

  @logger
  getStoredClassNames() {
    return this.storedClassNames;
  }
}

const classNameParser = new ClassNameParser();

export default classNameParser;
