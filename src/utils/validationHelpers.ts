export const required = { required: true };
export const requiredMessage = { required: "required field" };
export const percentage = { min: 0, max: 100 };
export const percentageMessage = { min: "Please enter a valid percentage (>= 0)", max: "Please enter a valid percentage (<= 100)" };
export const positiveNumber = { min: 0 };
export const positiveNumberMessage = { min: "Please enter a positive number" };
export const maxLengthErrorMessageFactory = (length: number) => ({maxLength: `Maximum length - ${length}`});