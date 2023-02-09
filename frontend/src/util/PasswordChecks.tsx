export function containsUppercase(str: string) {
  return /[A-Z]/.test(str);
}

export function containsLowercase(str: string) {
  return /[a-z]/.test(str);
}

export function containsNumber(myString: string) {
  return /\d/.test(myString);
}
