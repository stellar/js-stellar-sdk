/**
 * Removes trailing occurrences of `char` from the end of `input`.
 *
 * @param input - the value to trim
 * @param char - the character to remove from the end
 */
export const trimEnd = (
  input: number | string,
  char: string,
): number | string => {
  const isNumber = typeof input === "number";
  let str = String(input);

  while (str.endsWith(char)) {
    str = str.slice(0, -1);
  }

  return isNumber ? Number(str) : str;
};
