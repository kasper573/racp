// Based on https://github.com/vthibault/grf-loader

import * as JDataView from "jdataview";
import { decodeFull, decodeHeader } from "../des";
import { Inflate } from "../inflate";
import { readFileStream } from "../readFileStream";

const FILELIST_TYPE_FILE = 0x01;
const FILELIST_TYPE_ENCRYPT_MIXED = 0x02; // encryption mode 0 (header DES + periodic DES/shuffle)
const FILELIST_TYPE_ENCRYPT_HEADER = 0x04; // encryption mode 1 (header DES only)

const HEADER_SIGNATURE = "Master of Magic";
const HEADER_SIZE = 46;
const FILE_TABLE_SIZE = Uint32Array.BYTES_PER_ELEMENT * 2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class GRF<Stream = any> {
  public version = 0x200;
  public fileCount = 0;
  public files = new Map<string, GRFEncodedEntry>();
  private fileTableOffset = 0;

  private constructor(private file: File | Blob) {}

  private getBuffer(offset: number, length: number) {
    return readFileStream(this.file, offset, length);
  }

  private async getDataView(
    offset: number,
    length: number
  ): Promise<JDataView> {
    const buffer = await this.getBuffer(offset, length);

    return new JDataView(buffer, void 0, void 0, true);
  }

  static async load(file: File | Blob): Promise<GRF> {
    const grf = new GRF(file);
    await grf.loadHeader();
    await grf.loadFileList();
    return grf;
  }

  private async loadHeader() {
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

  private async loadFileList(): Promise<void> {
    // Read table list, stored information
    const view = await this.getDataView(this.fileTableOffset, FILE_TABLE_SIZE);
    const compressedSize = view.getUint32();
    const realSize = view.getUint32();

    // Load the chunk and decompress it
    const compressed = await this.getBuffer(
      this.fileTableOffset + FILE_TABLE_SIZE,
      compressedSize
    );

    const data = new Uint8Array(realSize);
    new Inflate(compressed).getBytes(data);

    // Optimized version without using jDataView (faster)
    for (let i = 0, p = 0; i < this.fileCount; ++i) {
      let filePath = "";
      while (data[p]) {
        filePath += String.fromCharCode(data[p++]);
      }

      p++;

      const entry: GRFEncodedEntry = {
        path: normalizePath(filePath),
        name: filePath.split(/[\\/]/).pop() ?? filePath,
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
        this.files.set(entry.path, entry);
      }
    }
  }

  public async getEntry(path: string): Promise<GRFDecodedEntry> {
    path = normalizePath(path);
    const entry = this.files.get(path);
    if (!entry) {
      throw new Error(`File "${path}" not found`);
    }

    const encodedData = await this.getBuffer(
      entry.offset + HEADER_SIZE,
      entry.lengthAligned
    );

    return {
      data: decodeEntryData(entry, encodedData),
      name: entry.name,
    };
  }
}

function decodeEntryData(
  entry: GRFEncodedEntry,
  encodedData: Uint8Array
): Uint8Array {
  if (entry.type & FILELIST_TYPE_ENCRYPT_MIXED) {
    decodeFull(encodedData, entry.lengthAligned, entry.compressedSize);
  } else if (entry.type & FILELIST_TYPE_ENCRYPT_HEADER) {
    decodeHeader(encodedData, entry.lengthAligned);
  }

  if (entry.realSize === entry.compressedSize) {
    return encodedData;
  }
  const out = new Uint8Array(entry.realSize);
  new Inflate(encodedData).getBytes(out);
  return out;
}

export interface GRFEncodedEntry {
  path: string;
  name: string;
  type: number;
  offset: number;
  realSize: number;
  compressedSize: number;
  lengthAligned: number;
}

export type GRFDecodedEntry = {
  name: string;
  data: Uint8Array;
};

const normalizePath = (path: string) => path.toLowerCase();
