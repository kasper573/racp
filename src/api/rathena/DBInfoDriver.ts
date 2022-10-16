import { FileRepository } from "../../lib/repo/FileRepository";
import { Config } from "./ConfigDriver";

export class DBInfoDriver {
  constructor(public readonly file: FileRepository<Config>) {}

  async read(prefix: string): Promise<DBInfo> {
    const values = (await this.file.read()) ?? {};
    const requireProp = (suffix: string) => {
      const key = createKey(prefix, suffix);
      const value = values[key];
      if (value === undefined) {
        throw new Error(
          `Config file "${this.file.filename}" is missing key "${key}"`
        );
      }
      return value;
    };

    // prettier-ignore
    return {
      host: requireProp(`ip`),
      port: parseInt(requireProp(`port`), 10),
      user: requireProp(`id`),
      password: requireProp(`pw`),
      database: requireProp(`db`)
    };
  }

  async update(changes: Record<string, DBInfo>) {
    const values = (await this.file.read()) ?? {};
    for (const [prefix, info] of Object.entries(changes)) {
      for (const [suffix, value] of Object.entries(info)) {
        values[createKey(prefix, suffix)] = `${value}`;
      }
    }
    return this.file.write(values);
  }
}

const createKey = (prefix: string, suffix: string) => `${prefix}_${suffix}`;

export type DBInfo = Readonly<{
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}>;
