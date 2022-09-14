import { Loader } from "../Loader";
import { StreamReader } from "../Reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class GAT<Stream = any> extends Loader<Stream> {
  header = "";
  version: number[] = [];
  width = 0;
  height = 0;

  constructor(
    readFromStream: StreamReader<Stream>,
    stream: Stream,
    public name = ""
  ) {
    super(readFromStream, stream);
  }

  protected async loadImpl() {
    const view = await this.getDataView(0, 14);
    this.header = view.getString(4);
    this.version = view.getBytes(2);
    this.width = view.getUint32();
    this.height = view.getUint32();
  }
}
