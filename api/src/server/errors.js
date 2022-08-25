// Errors

export class CustomError extends Error {
  constructor(message, extra = {}) {
    super(message);
    this.isCustomError = true;
    for (const key in extra) {
      this[key] = extra[key];
    }
    this.messages = [message];
  }

  add(message) {
    this.messages.unshift(message);
    this.message = message;
    return this;
  }
}

export class OperationalError extends CustomError {
  constructor(message, extra = {}) {
    super(message, extra);
    this.type = "operational";
  }
}

//For non-response blocking programming errors, use 'console.error(error)'
export class ProgramError extends CustomError {
  constructor(message, extra = {}) {
    super(message, extra);
    this.type = "program";
  }
}

//For input sanitation or validation errors
export class InputSanitationError extends OperationalError {
  constructor(errors = []) {
    let errorMessage = "invalid input;";
    for (const error of errors) {
      errorMessage =
        errorMessage +
        " " +
        error.msg +
        " : " +
        error.location +
        "." +
        error.param +
        ";";
    }
    super(errorMessage, { name: "invalid_input", httpCode: 400 });
  }
}

//exporting functions to make invocation less verbose
export const opError = function (message, extra = {}) {
  return new OperationalError(message, extra);
};

export const prgError = function (message, extra = {}) {
  return new ProgramError(message, extra);
};

export const inputError = function (validationErrors) {
  return new InputSanitationError(validationErrors);
};
