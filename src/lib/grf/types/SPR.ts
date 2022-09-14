import { range } from "lodash";
import * as JDataView from "jdataview";
import { Loader } from "../Loader";
import { StreamReader } from "../Reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SPR<Stream = any> extends Loader<Stream> {
  header = "";
  version = 0;
  indexedBitmaps: IndexedBitmap[] = [];
  rgbaBitmaps: RGBABitmap[] = [];
  palette: RGBAPalette = [];

  get frameCount(): number {
    return this.indexedBitmaps.length + this.rgbaBitmaps.length;
  }

  constructor(
    readFromStream: StreamReader<Stream>,
    stream: Stream,
    public name = ""
  ) {
    super(readFromStream, stream);
  }

  protected async loadImpl() {
    const view = await this.getDataView();

    this.header = view.getString(2);
    this.version = parseFloat(view.getBytes(2).reverse().join("."));

    switch (this.version) {
      case 1.0:
      case 1.1: {
        const frameCount = view.getUint16();
        this.indexedBitmaps = readIndexedBitmaps(view, frameCount);
        break;
      }
      case 2.0:
      case 2.1: {
        const rleEncoded = this.version > 2;
        const readIndexed = rleEncoded
          ? readIndexedBitmapsRLE
          : readIndexedBitmaps;
        const indexedFrameCount = view.getUint16();
        const rgbaFrameCount = view.getUint16();
        this.indexedBitmaps = readIndexed(view, indexedFrameCount);
        this.rgbaBitmaps = readRGBABitmaps(view, rgbaFrameCount);
        break;
      }
      default:
        throw new Error(`Unsupported version "${this.version}"`);
    }

    const remaining = view.byteLength - view.tell();
    if (remaining === paletteSize) {
      this.palette = view.getBytes(paletteSize);
    }
  }

  compileFrame(frame: number): RGBABitmap {
    if (frame < this.indexedBitmaps.length) {
      return applyPalette(this.indexedBitmaps[frame], this.palette);
    }
    return this.rgbaBitmaps[frame - this.indexedBitmaps.length];
  }

  compileFrames(): RGBABitmap[] {
    return range(this.frameCount).map((frame) => this.compileFrame(frame));
  }
}

function applyPalette(
  { indexes, width, height }: IndexedBitmap,
  palette: RGBAPalette
): RGBABitmap {
  let index: number, offset: number;
  const data = new Uint8Array(width * height * 4);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      index = indexes[x + y * width] * 4;
      offset = (x + y * width) * 4;
      data[offset] = palette[index];
      data[offset + 1] = palette[index + 1];
      data[offset + 2] = palette[index + 2];
      data[offset + 3] = index ? 255 : 0;
    }
  }

  return {
    data,
    width,
    height,
  };
}

function readRGBABitmaps(view: JDataView, frameCount: number) {
  const bitmaps: RGBABitmap[] = new Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    const width = view.getUint16();
    const height = view.getUint16();
    const data = new Uint8Array(view.getBytes(width * height * 4));
    bitmaps[i] = { data, width, height };
  }
  return bitmaps;
}

function readIndexedBitmaps(view: JDataView, frameCount: number) {
  const bitmaps: IndexedBitmap[] = new Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    const width = view.getUint16();
    const height = view.getUint16();
    const indexes = new Uint8Array(view.getBytes(width * height));
    bitmaps[i] = { indexes, width, height };
  }
  return bitmaps;
}

function readIndexedBitmapsRLE(view: JDataView, frameCount: number) {
  const bitmaps: IndexedBitmap[] = new Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    const width = view.getUint16();
    const height = view.getUint16();
    const indexes = new Uint8Array(width * height);
    const end = view.getUint16() + view.tell();
    let offset = 0;
    while (view.tell() < end) {
      const c = view.getBytes(1)[0];
      indexes[offset++] = c;

      if (!c) {
        const index = view.getBytes(1)[0];
        if (!index) {
          indexes[offset++] = index;
        } else {
          for (let j = 1; j < index; ++j) {
            indexes[offset++] = c;
          }
        }
      }
    }

    bitmaps[i] = { indexes, width, height };
  }
  return bitmaps;
}

export type RGBAPalette = number[];

export interface IndexedBitmap {
  width: number;
  height: number;
  indexes: Uint8Array;
}

export interface RGBABitmap {
  width: number;
  height: number;
  data: Uint8Array;
}

const paletteSize = 1024;
