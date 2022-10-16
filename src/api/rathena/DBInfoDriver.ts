import { FileRepository } from "../../lib/repo/FileRepository";
import { typedKeys } from "../../lib/std/typedKeys";
import { Config } from "./ConfigDriver";

export class DBInfoDriver {
  constructor(public readonly file: FileRepository<Config>) {}

  async read(prefix: string): Promise<DBInfo> {
    const values = (await this.file.read()) ?? {};
    const requireProp = (prop: keyof DBInfo) => {
      const key = createKey(prefix, prop);
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
      host: requireProp("host"),
      port: parseInt(requireProp("port"), 10),
      user: requireProp("user"),
      password: requireProp("password"),
      database: requireProp("database")
    };
  }

  async update(changes: Record<string, DBInfo>) {
    const values = (await this.file.read()) ?? {};
    for (const [prefix, info] of Object.entries(changes)) {
      for (const prop of typedKeys(info)) {
        values[createKey(prefix, prop)] = `${info[prop]}`;
      }
    }
    return this.file.write(values);
  }
}

const propMap: Record<keyof DBInfo, string> = {
  host: "ip",
  port: "port",
  user: "id",
  password: "pw",
  database: "db",
};

const createKey = (prefix: string, prop: keyof DBInfo) =>
  `${prefix}_${propMap[prop]}`;

export type DBInfo = Readonly<{
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}>;
