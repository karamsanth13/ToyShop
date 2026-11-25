/**
 * Integration boundary owned by Member 2. Catalogue mutations must remain unavailable
 * until this interface is implemented with Supabase Auth and the agreed role claims.
 * Do not replace this fail-closed stub with browser-provided role checks.
 */
export class AuthIntegrationPendingError extends Error {
  constructor() { super("Admin authorization is not configured."); this.name = "AuthIntegrationPendingError"; }
}

export interface AdminPrincipal { userId: string; role: "admin" | "super_admin" }

export async function requireAdmin(): Promise<AdminPrincipal> {
  throw new AuthIntegrationPendingError();
}
