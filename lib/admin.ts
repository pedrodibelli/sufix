// Emails con acceso al panel de administración (/admin).
// Mantener sincronizado con la lista de admin en las funciones SQL
// (aprobar_pago / rechazar_pago / listar_pagos_en_revision / listar_disputas /
// resolver_disputa) — ver supabase/migrations/20260822d_admin_sufixar.sql.
// Se agrega sufixar@gmail.com sin sacar el viejo, por las dudas.
export const ADMIN_EMAILS = ["solvithomes@gmail.com", "sufixar@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
