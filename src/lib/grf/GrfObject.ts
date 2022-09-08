// Based on https://github.com/vthibault/grf-loader

import { inflate } from "pako";
import { decodeFull, decodeHeader } from "./des";
import { Loader } from "./Loader";

export interface TFileEntry {
  type: number;
  offset: number;
  realSize: number;
  compressedSize: number;
  lengthAligned: number;
}

const FILELIST_TYPE_FILE = 0x01;
const FILELIST_TYPE_ENCRYPT_MIXED = 0x02; // encryption mode 0 (header DES + periodic DES/shuffle)
const FILELIST_TYPE_ENCRYPT_HEADER = 0x04; // encryption mode 1 (header DES only)

const HEADER_SIGNATURE = "Master of Magic";
const HEADER_SIZE = 46;
const FILE_TABLE_SIZE = Uint32Array.BYTES_PER_ELEMENT * 2;

export class GrfObject<Stream> extends Loader<Stream> {
  public version = 0x200;
  public fileCount = 0;
  public files = new Map<string, TFileEntry>();
  private fileTableOffset = 0;

  public async loadImpl(): Promise<void> {
    await this.parseHeader();
    await this.parseFileList();
  }

  private async parseHeader(): Promise<void> {
    const reader = await this.getDataView(0, HEADER_SIZE);

    const signature = reader.getString(15);
    if (signature !== HEADER_SIGNATURE) {
      throw new Error("Not a GRF file (invalid signature)");
    }

    reader.skip(15);
    this.fileTableOffset = reader.getUint32() + HEADER_SIZE;
    const reservedFiles = reader.getUint32();
    this.fileCount = reader.getUint32() - reservedFiles - 7;
    this.version = reader.getUint32();

    if (this.version !== 0x200) {
      throw new Error(`Unsupported version "0x${this.version.toString(16)}"`);
    }
  }

  private async parseFileList(): Promise<void> {
    // Read table list, stored information
    const view = await this.getDataView(this.fileTableOffset, FILE_TABLE_SIZE);
    const compressedSize = view.getUint32();
    const realSize = view.getUint32();

    // Load the chunk and decompress it
    const compressed = await this.getBuffer(
      this.fileTableOffset + FILE_TABLE_SIZE,
      compressedSize
    );

    const data = inflate(compressed);

    // Optimized version without using jDataView (faster)
    for (let i = 0, p = 0; i < this.fileCount; ++i) {
      let filename = "";
      while (data[p]) {
        filename += String.fromCharCode(data[p++]);
      }

      p++;

      const entry: TFileEntry = {
        compressedSize:
          data[p++] | (data[p++] << 8) | (data[p++] << 16) | (data[p++] << 24),
        lengthAligned:
          data[p++] | (data[p++] << 8) | (data[p++] << 16) | (data[p++] << 24),
        realSize:
          data[p++] | (data[p++] << 8) | (data[p++] << 16) | (data[p++] << 24),
        type: data[p++],
        offset:
          (data[p++] |
            (data[p++] << 8) |
            (data[p++] << 16) |
            (data[p++] << 24)) >>>
          0,
      };

      // Not a file (folder ?)
      if (entry.type & FILELIST_TYPE_FILE) {
        this.files.set(filename.toLowerCase(), entry);
      }
    }
  }

  private decodeEntry(data: Uint8Array, entry: TFileEntry): Uint8Array {
    if (entry.type & FILELIST_TYPE_ENCRYPT_MIXED) {
      decodeFull(data, entry.lengthAligned, entry.compressedSize);
    } else if (entry.type & FILELIST_TYPE_ENCRYPT_HEADER) {
      decodeHeader(data, entry.lengthAligned);
    }

    if (entry.realSize === entry.compressedSize) {
      return data;
    }

    return inflate(data);
  }

  public async getFile(
    filename: string
  ): Promise<{ data: Uint8Array | null; error: unknown | null }> {
    if (!this.loaded) {
      return Promise.resolve({ data: null, error: "GRF not loaded yet" });
    }

    const path = filename.toLowerCase();
    const entry = this.files.get(path);

    if (!entry) {
      return Promise.resolve({ data: null, error: `File "${path}" not found` });
    }

    const buffer = await this.getBuffer(
      entry.offset + HEADER_SIZE,
      entry.lengthAligned
    );

    try {
      const data = this.decodeEntry(buffer, entry);
      return Promise.resolve({ data, error: null });
    } catch (error) {
      return Promise.resolve({ data: null, error });
    }
  }
}
