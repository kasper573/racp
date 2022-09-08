import { Reader } from "./Reader";

export abstract class Loader<Stream> extends Reader<Stream> {
  private isLoaded = false;
  get loaded() {
    return this.isLoaded;
  }

  public async load(): Promise<this> {
    if (this.isLoaded) {
      throw new Error("Already loaded");
    }
    await this.loadImpl();
    this.isLoaded = true;
    return this;
  }

  protected abstract loadImpl(): Promise<void>;
}
