// https://stackoverflow.com/questions/60670291/can-i-assign-multiple-variables-the-same-value-without-having-one-line-per-varia
export function* always(x: number) {
  while (true) yield x;
}
