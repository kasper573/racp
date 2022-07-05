export function findNode<Node extends GraphNode>(
  root: Node | undefined,
  isMatch: (candidate: Node) => boolean | undefined | null
): Node | undefined {
  return filterGraph(root, (node, breakFn) => {
    const success = isMatch(node);
    if (success) {
      breakFn();
    }
    return success;
  })[0];
}

export function filterGraph<Node extends GraphNode>(
  node: Node | undefined,
  isMatch: (candidate: Node, breakFn: () => void) => boolean | undefined | null
) {
  if (!node) {
    return [];
  }
  const matches: Node[] = [];
  const queue = [node];
  let shouldEnd = false;
  const breakFn = () => (shouldEnd = true);
  while (queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = queue.shift()!;
    if (next.children) {
      queue.push(...next.children);
    }
    if (isMatch(next, breakFn)) {
      matches.push(next);
    }
    if (shouldEnd) {
      break;
    }
  }
  return matches;
}

export function reduceGraph<Node extends GraphNode, Value>(
  node: Node[] | Node | undefined,
  reduce: (value: Value, candidate: Node) => Value,
  startValue: Value
) {
  if (!node) {
    return startValue;
  }
  let value: Value = startValue;
  const queue = Array.isArray(node) ? node.slice() : [node];
  while (queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = queue.shift()!;
    if (next.children) {
      queue.push(...next.children);
    }
    value = reduce(value, next);
  }
  return value;
}

export interface GraphNode {
  children?: this[];
}
