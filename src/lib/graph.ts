export function findNode<Node extends GraphNode>(
  root: Node | undefined,
  isMatch: (candidate: Node) => boolean | undefined | null
) {
  return filterGraph(root, (node, breakFn) => {
    const success = isMatch(node);
    if (success) {
      breakFn();
    }
    return success;
  });
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

export interface GraphNode {
  children?: this[];
}
