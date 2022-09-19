import { Reader } from "./Reader";

export abstract class Loader<Stream> extends Reader<Stream> {
  private _loaded = false;

  get loaded() {
    return this._loaded;
  }

  public async load(): Promise<this> {
    if (this._loaded) {
      throw new Error("Already loaded");
    }
    await this.loadImpl();
    this._loaded = true;
    return this;
  }

  protected abstract loadImpl(): Promise<void>;
}
