/** Inisial untuk avatar (2 huruf), aman untuk string kosong. */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  const s = name.trim();
  if (s.length >= 2) return s.slice(0, 2).toUpperCase();
  if (s.length === 1) return `${s}${s}`.toUpperCase();
  return '?';
}

/** Avatar sidebar: nama dulu, kalau kosong pakai bagian lokal email. */
export function initialsForProfile(profile: { name: string; email: string } | null): string {
  if (!profile) return '?';
  const n = profile.name.trim();
  if (n) return initialsFromName(n);
  const e = profile.email.trim();
  if (e) {
    const local = e.split('@')[0] ?? e;
    return local.slice(0, 2).toUpperCase() || '?';
  }
  return '?';
}
