import { MutableRepository } from "../../lib/repo/MutableRepository";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { DatabaseDriver } from "./DatabaseDriver";

// Abstractions for interfacing with the rathena "acc_reg_" tables in a type safe manner

export type AccRegRepositoryOptions<T> = RepositoryOptions<T> & {
  db: DatabaseDriver;
  accountId: number;
  key: string;
};

export class AccRegNumRepository extends MutableRepository<number> {
  constructor(private options: AccRegRepositoryOptions<number>) {
    super({ defaultValue: 0, ...options });
  }

  private createQuery() {
    return this.options.db.char.table("acc_reg_num");
  }

  private get queryProps() {
    return {
      account_id: this.options.accountId,
      key: this.options.key,
    };
  }

  protected async readImpl() {
    return this.createQuery()
      .where(this.queryProps)
      .select("value")
      .first()
      .then((result) => (result !== undefined ? +result.value : 0));
  }

  protected async writeImpl(value: number) {
    const currentValue = await this.read();
    let affectedRows = 0;
    if (currentValue === undefined) {
      affectedRows = await this.createQuery()
        .insert({ ...this.queryProps, value: value.toString() })
        .then((inserted) => inserted.length);
    } else {
      affectedRows = await this.createQuery()
        .where(this.queryProps)
        .update({ value: value.toString() });
    }
    if (affectedRows === 0) {
      throw new Error("No rows affected");
    }
  }
}
