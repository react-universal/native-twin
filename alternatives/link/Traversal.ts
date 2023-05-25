type BinaryNode<T> = {
  value: T;
  children: any[];
  left: BinaryNode<T>;
  right: BinaryNode<T>;
};

function walk(current: BinaryNode<number> | null, path: number[]): number[] {
  if (!current) return path;
  // Recurse
  // pre
  path.push(current.value);
  // Recurse
  walk(current.left, path);
  walk(current.right, path);
  // post
  return path;
}

function preOrderSearchTraverlsal(head: BinaryNode<number>): number[] {
  return walk(head, []);
}
