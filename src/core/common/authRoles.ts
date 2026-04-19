/** Normalisasi `roles` dari payload user API (string[], objek Spatie `{ name }`, atau `role` tunggal). */
export function normalizeRolesFromApiUser(user: unknown): string[] {
  if (!user || typeof user !== 'object') return [];
  const o = user as Record<string, unknown>;

  if (Array.isArray(o.roles)) {
    return o.roles.map((r) => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object' && 'name' in r && typeof (r as { name: unknown }).name === 'string') {
        return (r as { name: string }).name;
      }
      return String(r);
    });
  }

  if (typeof o.role === 'string') return [o.role];

  return [];
}

export function profileHasAdminRole(roles: string[] | undefined): boolean {
  return (roles ?? []).some((r) => String(r).toUpperCase() === 'ADMIN');
}
