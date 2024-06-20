
export class WithMethodMultipleInvocationsError extends Error {
    static Default_MessageFormatter = (wc: string) => `The '${wc}' method was invoked multiple times.`;

  
    constructor(witherName: string) {
    super(WithMethodMultipleInvocationsError.Default_MessageFormatter(witherName));
    this.name = 'WithMethodMultipleInvocationsError';
  }
}

export class IllegalReadOnlyPropertyAccessError extends Error {
    static Default_MessageFormatter = (prop: string, wither: string) => `Using a builder turns all properties read-only. Try modifying the property '${prop}' using the method named '${wither}'.`;

    constructor(propName: string, wither: string) {
    super(IllegalReadOnlyPropertyAccessError.Default_MessageFormatter(propName, wither));
    this.name = 'IllegalReadOnlyPropertyAccessError';
  }
}

export class IllegalWitherModificationAttemptError extends Error {
    static Default_MessageFormatter = (wither: string) => `You cannot modify the, or any, wither property '${wither}'.`;

    constructor(wither: string) {
    super(IllegalWitherModificationAttemptError.Default_MessageFormatter(wither));
    this.name = 'IllegalWitherModificationAttemptError';
  }
}