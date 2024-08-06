const parentLevels = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const composeJSXElementParentLevel = (child: string, parent: string | null = null) => {
  if (!parent) return child;
  return `${parent}:${child}`;
};

export const getJSXElementLevel = (pos: number, parent: string | null = null) => {
  if (pos >= parentLevels.length) {
    const newIndex = pos % parentLevels.length;
    const prefix = (pos + 1) % parentLevels.length;
    return composeJSXElementParentLevel(`${parentLevels[newIndex]}${parentLevels[prefix]}`, parent);
  }
  return composeJSXElementParentLevel(parentLevels[pos], parent);
};
