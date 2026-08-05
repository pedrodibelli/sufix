// Configuración de negocio centralizada.
// Cambiar acá impacta en toda la app (en vez de tener valores sueltos en componentes).

// Comisión de plataforma que se suma al precio de la consulta, en ARS.
// Flujo viejo (pausado): ver PROPUESTAS_CON_PRECIO_ACTIVO más abajo.
export const COMISION_CONSULTA = 4500;

// ─── Flujo de contacto directo gratis (lanzamiento) ────────────────────────────
// Mientras la plataforma esté arrancando, el contacto es gratis para generar
// movimiento. Cuando decidan volver a cobrar, buscar los usos de
// PROPUESTAS_CON_PRECIO_ACTIVO y CUPO_CONTACTOS_GRATIS.

// Cantidad de PUBLICACIONES (= "usuarios"/consultas, no técnicos) que van a
// recibir contacto gratis: los primeros N trabajos publicados que consiguen al
// menos un técnico interesado. Si después se suman más técnicos a ese mismo
// trabajo, no gastan cupo nuevo — ya está "adentro". Contador global de toda la
// plataforma. Cuando se llega a este número, se deja de otorgar contacto gratis
// a publicaciones NUEVAS hasta que se suba este valor a mano.
export const CUPO_CONTACTOS_GRATIS = 1000;

// Apaga el flujo viejo (precio de consulta + pago de $4500 por transferencia) sin
// borrar el código. En false: el marketplace usa el flujo nuevo de contacto
// directo gratis. Para volver a cobrar, poner esto en true (y revisar que
// MarketplaceGrid vuelva a usar ContactarModal).
export const PROPUESTAS_CON_PRECIO_ACTIVO = false;
