export function createStreamMemory<T>(
  stream: NodeJS.WriteStream,
  initial: T,
  createNext: (current: T, nextChunk: unknown) => T
) {
  let current: T = initial;

  function receiveChunk(chunk: unknown) {
    current = createNext(current, chunk);
  }

  const originalWrite = stream.write;
  function patchedWrite(
    ...args: Parameters<typeof stream.write>
  ): ReturnType<typeof stream.write> {
    const [chunk] = args;
    receiveChunk(chunk);
    return originalWrite.call(stream, ...args);
  }

  stream.write = patchedWrite as typeof stream.write;

  return {
    stop: () => {
      stream.write = originalWrite;
    },
    read: (): T => current,
  };
}
