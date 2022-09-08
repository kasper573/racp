import { Loader } from "../Loader";

export class GAT<Stream> extends Loader<Stream> {
  header = "";
  version: number[] = [];
  width = 0;
  height = 0;
  protected async loadImpl() {
    const view = await this.getDataView(0, 14);
    this.header = view.getString(4);
    this.version = view.getBytes(2);
    this.width = view.getUint32();
    this.height = view.getUint32();
  }
}
