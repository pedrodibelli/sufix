-- Permite que el demandante vea SU PROPIO historial de contactos (los
-- técnicos a los que les tocó "Contactar por WhatsApp"), para la nueva
-- pantalla "Técnicos que contacté" en /mis-consultas. La policy que ya
-- existía (contactos_select_propio) solo dejaba ver al TÉCNICO contactado;
-- esta es la mirada complementaria, del lado de quien contacta. Postgres
-- combina las policies de SELECT con OR, así que no afecta la anterior.
create policy "contactos_select_propio_como_contactante"
on contactos_tecnico for select
to authenticated
using (contactado_por = auth.uid());
