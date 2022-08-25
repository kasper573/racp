export function createSwarms<T>(
  source: T[],
  shouldSwarm: (a: T, b: T) => boolean
) {
  const items = [...source];
  const swarms: T[][] = [];
  while (items.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = items.pop()!;
    const swarm = swarms.find((swarm) =>
      swarm.some((candidate) => shouldSwarm(item, candidate))
    );

    if (swarm) {
      swarm.push(item);
      continue;
    }

    const index = items.findIndex((candidate) => shouldSwarm(item, candidate));
    if (index !== -1) {
      const sibling = items.splice(index, 1)[0];
      swarms.push([sibling, item]);
    } else {
      swarms.push([item]);
    }
  }
  return Object.values(swarms).map((swarm) => swarm);
}
