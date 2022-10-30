export class Atom<T> {
  private value?: T;

  constructor(
    private onChange?: (newValue: T | undefined) => void,
    private name = "Value"
  ) {}

  get<AllowUndefined extends boolean = false>(
    allowUndefined: AllowUndefined = false as AllowUndefined
  ): AllowUndefined extends true ? T | undefined : T {
    if (allowUndefined) {
      return this.value as any;
    }
    if (this.value === undefined) {
      throw new Error(`${this.name} must be defined before use`);
    }
    return this.value;
  }

  set(newValue: T | undefined) {
    this.value = newValue;
    this.onChange?.(newValue);
  }
}
