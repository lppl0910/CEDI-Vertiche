export function rnd(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
