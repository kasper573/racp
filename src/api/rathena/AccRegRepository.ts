import { MutableRepository } from "../../lib/repo/MutableRepository";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { DatabaseDriver } from "./DatabaseDriver";

// Abstractions for interfacing with the rathena "acc_reg_" tables in a type safe manner

export type AccRegRepositoryOptions<T> = RepositoryOptions<T> & {
  db: DatabaseDriver;
  accountId: number;
  key: string | (() => Promise<string>);
};

export class AccRegNumRepository extends MutableRepository<number> {
  constructor(private options: AccRegRepositoryOptions<number>) {
    super({ defaultValue: 0, ...options });
  }

  private async getKey() {
    return typeof this.options.key === "string"
      ? this.options.key
      : this.options.key();
  }

  private createQuery() {
    return this.options.db.char.table("acc_reg_num");
  }

  private async getQueryProps() {
    return {
      account_id: this.options.accountId,
      key: await this.getKey(),
    };
  }

  protected async readImpl() {
    return this.createQuery()
      .where(await this.getQueryProps())
      .select("value")
      .first()
      .then((result) => (result !== undefined ? +result.value : undefined));
  }

  protected async writeImpl(value: number) {
    const currentValue = await this.readImpl();
    const queryProps = await this.getQueryProps();
    let affectedRows = 0;
    if (currentValue === undefined) {
      affectedRows = await this.createQuery()
        .insert({ ...queryProps, value: value.toString() })
        .then((inserted) => inserted.length);
    } else {
      affectedRows = await this.createQuery()
        .where(queryProps)
        .update({ value: value.toString() });
    }
    if (affectedRows === 0) {
      throw new Error("No rows affected");
    }
  }
}
