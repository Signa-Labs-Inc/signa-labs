import { randomUUID } from 'crypto';

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const suffix = randomUUID().slice(0, 8);
  return `${base}-${suffix}`;
}
