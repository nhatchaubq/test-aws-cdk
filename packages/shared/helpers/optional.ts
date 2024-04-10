export class Optional<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  hasValue(): boolean {
    return typeof this.value !== 'undefined' && this.value != null;
  }

  map<K>(transform: (_: T) => K): Optional<K> {
    if (typeof this.value === 'undefined' || this.value === null) {
      return optional(undefined!);
    }
    return optional(transform(this.value));
  }

  getValue(): T {
    if (typeof this.value === 'undefined' || this.value === null) {
      throw new Error(
        'You are getting `undefined` or `null` value. This error is to prevent unwanted other errors due to `undefined` and `null`. To skip this error and use the value with your own purpose, use method `getDangerousValue`, it will skip the check. Also, you can use method `hasValue` to check if there is a value or not.'
      );
    }
    return this.value;
  }

  getDangerousValue(): T {
    return this.value;
  }

  when({
    hasValue,
    hasNoValue,
  }: {
    hasValue: (_: T) => unknown;
    hasNoValue: unknown;
  }) {
    if (typeof this.value === 'undefined' || this.value === null) {
      return hasNoValue;
    }
    return hasValue(this.value);
  }
}

export function optional<T>(value: T): Optional<T> {
  return new Optional(value);
}
