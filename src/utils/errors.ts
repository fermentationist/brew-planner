// Errors

interface ExtraFields {
  [key: string]: any
}

export class CustomError extends Error {
  isCustomError: boolean;
  messages: string[];
  [key: string]: any;
  constructor(message: string, extra: ExtraFields = {}) {
    super(message);
    this.isCustomError = true;
    for (const key in extra) {
      this[key] = extra[key];
    }
    this.messages = [message];
  }

  add(message: string) {
    this.messages.unshift(message);
    this.message = message;
    return this;
  }
}

export class OperationalError extends CustomError {
  type: string;
  constructor(message: string, extra = {}) {
    super(message, extra);
    this.type = "operational";
  }
}

//For non-response blocking programming errors, use 'console.error(error)'
export class ProgramError extends CustomError {
  type: string;
  constructor(message: string, extra = {}) {
    super(message, extra);
    this.type = "program";
  }
}

//exporting functions to make invocation less verbose
export const opError = function (message: string, extra = {}) {
  return new OperationalError(message, extra);
};

export const prgError = function (message: string, extra = {}) {
  return new ProgramError(message, extra);
};
