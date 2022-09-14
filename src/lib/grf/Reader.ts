import * as JDataView from "jdataview";

export abstract class Reader<Stream> {
  protected readonly littleEndian: boolean = true;

  constructor(
    protected readFromStream: StreamReader<Stream>,
    protected stream: Stream
  ) {}

  getBuffer(offset?: number, length?: number) {
    return this.readFromStream(this.stream, offset, length);
  }

  async getDataView(offset?: number, length?: number): Promise<JDataView> {
    const buffer = await this.readFromStream(this.stream, offset, length);

    return new JDataView(buffer, void 0, void 0, this.littleEndian);
  }
}

export type StreamReader<Stream> = (
  stream: Stream,
  offset?: number,
  length?: number
) => Promise<Uint8Array>;
