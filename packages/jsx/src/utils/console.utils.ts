export function printUpgradeWarning(
  warning: string,
  originalProps: Record<string, any> | null | undefined,
) {
  console.warn(
    `NativeTwin upgrade warning.\n\n${warning}.\n\nIf add/removing sibling components cause this warning, add a unique "key" prop so React can correctly track this component.`,
  );
  try {
    // Not all props can be stringified
    console.warn(
      `The previous warning was caused by a component with these props: ${JSON.stringify(
        originalProps,
      )}`,
    );
  } catch {
    if (originalProps) {
      console.warn(
        `The previous warning was caused by a component with these props: ${JSON.stringify(
          Object.keys(originalProps),
        )}. Some props could not be stringified, so only the keys are shown.`,
      );
    }
  }
}
