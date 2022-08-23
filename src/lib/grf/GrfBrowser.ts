// Based on https://github.com/vthibault/grf-loader

import { GrfBase } from "./GrfBase";

export class GrfBrowser extends GrfBase<File | Blob> {
  public async getStreamBuffer(
    buffer: File | Blob,
    offset: number,
    length: number
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () =>
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(buffer.slice(offset, offset + length));
    });
  }
}
