"use client";

import { useEffect } from "react";

// Salta al #ancla de la URL cuando la página se abre ya con un hash.
//
// El navegador debería hacerlo solo, y a veces lo hace — pero es una carrera
// que se pierde más de lo que se gana (verificado el 2026-09-21, igual en
// producción que en local): Next manda el HTML en streaming, así que cuando
// el navegador procesa el fragmento la sección de arriba todavía no tiene su
// alto final. Como en ese momento #tecnicos está a 0px del tope, "saltar" a
// él no mueve nada; cuando el hero termina de armarse la sección ya quedó
// 471px más abajo y la página sigue arriba de todo.
//
// Se nota en los links "Buscar técnicos" del footer, de /como-funciona y de
// /categoria, que apuntan a "/#tecnicos": llevaban a la home y te dejaban
// mirando el hero, como si no hubieran hecho nada. (El CTA de la propia home
// sí funcionaba, porque ahí la página ya está armada cuando lo tocás.)
//
// Acá el salto se hace después de hidratar, que es cuando el alto ya es el
// definitivo. Si el ancla ya está donde tiene que estar no se toca nada, para
// no pelearse con el scroll que el navegador haya restaurado.
export function AnclaAlCargar() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    const salto = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      if (Math.abs(el.getBoundingClientRect().top) < 4) return;
      el.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(salto);
  }, []);

  return null;
}
