// Emails con acceso al panel de administración (/admin).
// Mantener sincronizado con la lista de admin en las funciones SQL
// (aprobar_pago / rechazar_pago / listar_pagos_en_revision).
export const ADMIN_EMAILS = ["solvithomes@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
