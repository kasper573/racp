import * as JDataView from "jdataview";

export class GAT {
  header = "";
  version: number[] = [];
  width = 0;
  height = 0;

  constructor(data: Uint8Array, public name = "") {
    const view = new JDataView(data, void 0, void 0, true);
    this.header = view.getString(4);
    this.version = view.getBytes(2);
    this.width = view.getUint32();
    this.height = view.getUint32();
  }
}
