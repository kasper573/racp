export async function readFileStream(
  buffer: File | Blob,
  offset = 0,
  length: number = buffer.size - offset
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(buffer.slice(offset, offset + length));
  });
}
