import { Reader } from "./Reader";

export abstract class Loader<Stream> extends Reader<Stream> {
  private _loaded = false;
  private _error: unknown;

  get error() {
    return this._error;
  }

  get loaded() {
    return this._loaded;
  }

  public async load(): Promise<this> {
    if (this._loaded) {
      throw new Error("Already loaded");
    }
    try {
      await this.loadImpl();
      this._loaded = true;
    } catch (e) {
      this._error = e ?? true;
    }
    return this;
  }

  protected abstract loadImpl(): Promise<void>;
}
