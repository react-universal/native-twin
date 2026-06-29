export const templatePropsToSheetEntriesObject = (templates: any[]) => {
  return templates.reduce(
    (prev, current) => {
      if (prev[current.target]) {
        prev[current.target]?.push(...current.entries);
      }
      if (!prev[current.target]) {
        prev[current.target] = current.entries;
      }
      return prev;
    },
    {} as Record<string, any[]>,
  );
};
