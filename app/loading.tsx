// Feedback instantáneo durante la navegación entre páginas dinámicas.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5fdf9]">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sv-primary/30 border-t-sv-primary" />
    </div>
  );
}
