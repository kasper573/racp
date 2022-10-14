import { DatabaseDriver } from "./DatabaseDriver";

// Abstractions for interfacing with the rathena "acc_reg_" tables in a type safe manner

export abstract class AccRegDriver<Value = any> {
  abstract read(accountId: number, key: string): Promise<Value | undefined>;

  protected abstract writeImpl(
    accountId: number,
    key: string,
    value: Value
  ): Promise<boolean>;

  async write(
    accountId: number,
    key: string,
    createValue: (currentValue?: Value) => Value
  ): Promise<boolean> {
    try {
      const currentValue = await this.read(accountId, key);
      return this.writeImpl(accountId, key, createValue(currentValue));
    } catch (e) {
      return false;
    }
  }

  createKeyAtom(getKey: () => string): AccRegKeyAtom<this> {
    return new AccRegKeyAtom(this, getKey);
  }
}

export class AccRegKeyAtom<Driver extends AccRegDriver> {
  constructor(private driver: Driver, private getKey: () => string) {}

  read(accountId: number) {
    return this.driver.read(accountId, this.getKey());
  }

  write(accountId: number, value: Parameters<Driver["write"]>[2]) {
    return this.driver.write(accountId, this.getKey(), value);
  }
}

export class AccRegNumDriver extends AccRegDriver<number> {
  constructor(private db: DatabaseDriver) {
    super();
  }

  private createQuery() {
    return this.db.char.table("acc_reg_num");
  }

  async read(accountId: number, key: string) {
    return this.createQuery()
      .where({ account_id: accountId, key })
      .select("value")
      .first()
      .then((result) => (result !== undefined ? +result.value : undefined));
  }

  protected async writeImpl(
    accountId: number,
    key: string,
    value: number
  ): Promise<boolean> {
    const currentValue = await this.read(accountId, key);
    if (currentValue === undefined) {
      return this.createQuery()
        .insert({ account_id: accountId, key, value: value.toString() })
        .then((inserted) => inserted.length > 0);
    }
    return this.createQuery()
      .where({ account_id: accountId, key })
      .update({ value: value.toString() })
      .then((result) => result === 1);
  }
}
