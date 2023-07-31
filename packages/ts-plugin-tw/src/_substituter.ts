export function getSubstitutions(
  contents: string,
  spans: ReadonlyArray<{ start: number; end: number }>,
): string {
  const parts: string[] = [];
  let lastIndex = 0;
  const lineStarts = contents
    .split('\n')
    .map((line) => line.length)
    .reduce(
      (previousValue, currentValue, currentIndex) => [
        ...previousValue,
        currentValue + previousValue[currentIndex]! + 1,
      ],
      [0],
    );
  let lineStartIndex = 0;
  for (const span of spans) {
    while (lineStarts[lineStartIndex]! <= span.start) {
      lineStartIndex++;
    }
    const preTillLineStart = contents.slice(
      lineStarts[lineStartIndex - 1],
      span.start,
    );
    const preTillLastIndex = contents.slice(lastIndex, span.start);
    const post = contents.slice(span.end);
    const placeholder = contents.slice(span.start, span.end);

    parts.push(preTillLastIndex);
    parts.push(
      getSubstitution({
        preTillLineStart,
        preTillLastIndex,
        placeholder,
        post,
      }),
    );
    lastIndex = span.end;
  }
  parts.push(contents.slice(lastIndex));
  return parts.join('');
}

function getSubstitution(context: {
  placeholder: string;
  preTillLineStart: string;
  preTillLastIndex: string;
  post: string;
}): string {
  // Check to see if it's an in-property interplation, or a mixin,
  // and determine which character to use in either case
  // if in-property, replace with "xxxxxx"
  // if a mixin, replace with "      "
  const replacementChar = getReplacementCharacter(
    context.preTillLineStart,
    context.preTillLastIndex,
    context.post,
  );
  const result = context.placeholder.replace(/./gm, (c) =>
    c === '\n' ? '\n' : replacementChar,
  );

  // If followed by a semicolon, we may have to eat the semi colon using a false property
  if (replacementChar === ' ' && context.post.match(/^\s*;/)) {
    // Handle case where we need to eat the semi colon:
    //
    // styled.x`
    //     ${'color: red'};
    // `
    //
    // vs. the other case where we do not:
    //
    // styled.x`
    //     color: ${'red'};
    // `
    if (context.preTillLastIndex.match(/(;|^|\}|\{)[\s|\n]*$/)) {
      // Mixin, replace with a dummy variable declaration, so scss server doesn't complain about rogue semicolon
      return '$a:0' + result.slice(4);
    }
    return context.placeholder.replace(/./gm, (c) => (c === '\n' ? '\n' : 'x'));
  }

  // Placeholder used as property name:
  //
  // styled.x`
  //    ${'color'}: red;
  // `
  //
  // But note that this shouldn't be included:
  //
  // styled.x`
  //     ${'button'}:hover & {
  //         color: red
  //     }
  // `
  //
  // Replace with fake property name
  if (context.post.match(/^\s*[:]/) && !context.post.match(/^\s*[:].+?[\{&]/)) {
    return '$a' + result.slice(2);
  }

  // Placeholder for component
  //
  // styled.x`
  //     ${'button'}:hover & {
  //         color: red
  //     }
  // `
  // Replace with fake selector
  if (context.post.match(/^\s*[:].+?[\{&]/)) {
    return '&' + ' '.repeat(result.length - 1);
  }

  // Placeholder used as hex value:
  //
  // styled.x`
  //    color: #${'000'};
  // `
  if (context.preTillLastIndex.match(/#\s*$/)) {
    return '000' + ' '.repeat(Math.max(context.placeholder.length - 3, 0));
  }

  return result;
}

function getReplacementCharacter(
  preTillLineStart: string,
  preTillLastIndex: string,
  post: string,
) {
  const emptySpacesRegExp = /(^|\n)\s*$/g;
  if (
    preTillLineStart.match(emptySpacesRegExp) &&
    preTillLastIndex.match(emptySpacesRegExp)
  ) {
    if (!post.match(/^\s*[{:,]/)) {
      // ${'button'} {
      return ' ';
    }
  }

  // If the placeholder looks like a unit that would not work when replaced with an identifier,
  // try replaceing with a number.
  if (post.match(/^%/)) {
    return '0';
  }

  // Otherwise replace with an identifier
  return 'x';
}
