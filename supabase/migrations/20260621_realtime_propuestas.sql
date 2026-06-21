-- Habilita Realtime en `propuestas` para que el puntito y las propuestas
-- aparezcan en vivo (sin refrescar). El RLS de la tabla filtra qué recibe cada
-- usuario.
alter publication supabase_realtime add table propuestas;
