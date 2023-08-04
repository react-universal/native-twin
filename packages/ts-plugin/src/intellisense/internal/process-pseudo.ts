export function extractPseudoClasses(onVariant: (completion: string) => void) {
  for (const pseudoClass of simplePseudoClasses) {
    const name = pseudoClass.slice(1) + ':';
    onVariant(name);
  }
}

const simplePseudoClasses = [
  ':active',
  ':after',
  ':any-link',
  ':before',
  // ":blank", // Experimental
  ':checked',
  // ":current", // Experimental
  ':default',
  ':defined',
  ':disabled',
  ':empty',
  ':enabled',
  // ':first',
  ':first-child',
  ':first-letter',
  ':first-line',
  ':first-of-type',
  ':focus',
  ':focus-visible',
  ':focus-within',
  ':fullscreen',
  // ":future", // Experimental
  ':hover',
  ':in-range',
  ':indeterminate',
  ':invalid',
  ':last-child',
  ':last-of-type',
  ':link',
  // ":local-link", // Experimental
  // ":nth-col", // Experimental
  // ":nth-last-col", // Experimental
  ':only-child',
  ':only-of-type',
  ':optional',
  ':out-of-range',
  // ":past", // Experimental
  ':paused',
  ':picture-in-picture',
  ':placeholder-shown',
  ':playing',
  ':read-only',
  ':read-write',
  ':required',
  // ":root",
  // ":scope",
  ':target',
  // ":target-within", // Experimental
  // ":user-invalid", // Experimental
  // ":user-valid", // Experimental
  ':valid',
  ':visited',
];
