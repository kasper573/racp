export type GAT = ReturnType<typeof parseGAT>;
export function parseGAT(data: ArrayBufferLike) {
  const view = new DataView(data);
  const width = view.getUint32(6, true);
  const height = view.getUint32(10, true);
  return { width, height };
}
