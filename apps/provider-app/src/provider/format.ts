export function formatEtbRange(min: number, max: number) {
  return `ETB ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

export function firstName(value: string) {
  const [name] = value.trim().split(" ");
  return name || value;
}
