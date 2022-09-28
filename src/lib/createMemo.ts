export function createAsyncMemo<
  Sources extends ReadonlyArray<any>,
  Computation
>(
  getSources: () => Promise<Sources>,
  compute: (...source: Sources) => Computation
) {
  let promisedSources: Sources;
  const memo = createMemo(() => promisedSources, compute);

  async function getCachedOrRecompute(): Promise<Computation> {
    promisedSources = await getSources();
    return memo();
  }

  return getCachedOrRecompute;
}

export function createMemo<Sources extends ReadonlyArray<any>, Computation>(
  getSources: () => Sources,
  compute: (...source: Sources) => Computation
) {
  let sources: Sources | undefined;
  let computation: Computation;

  function getCachedOrRecompute(): Computation {
    const newSources = getSources();
    if (
      sources === undefined ||
      !sources.every((s, i) => s === newSources[i])
    ) {
      sources = newSources;
      computation = compute(...sources);
    }
    return computation;
  }

  return getCachedOrRecompute;
}
