export async function readFileStream(
  buffer: File | Blob,
  offset: number,
  length: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(buffer.slice(offset, offset + length));
  });
}
