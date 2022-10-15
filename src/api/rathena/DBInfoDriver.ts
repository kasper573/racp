import { FileRepository } from "../../lib/repo/FileRepository";
import { Config } from "./ConfigDriver";

export class DBInfoDriver {
  constructor(public readonly file: FileRepository<Config>) {}

  async read(prefix: string) {
    const config = (await this.file.read()) ?? {};
    const requireProp = (suffix: string) => {
      const key = `${prefix}_${suffix}`;
      if (!Object.hasOwn(config, key)) {
        throw new Error(`Missing key ${key}`);
      }
      return config[key];
    };

    // prettier-ignore
    return {
      get host() { return requireProp(`ip`);},
      get port() { return parseInt(requireProp(`port`), 10);},
      get user() { return requireProp(`id`);},
      get password() { return requireProp(`pw`);},
      get database() { return requireProp(`db`);},
    };
  }
}
