// Feedback instantáneo durante la navegación entre páginas dinámicas.
// El fondo se adapta al rol vía la clase .theme-pro en <html> (ver globals.css).
export default function Loading() {
  return (
    <div className="app-loading flex min-h-screen items-center justify-center bg-[#f5fdf9]">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sv-primary/30 border-t-sv-primary" />
    </div>
  );
}
