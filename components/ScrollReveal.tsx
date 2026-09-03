"use client";
import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<Element>(".reveal");

    // Al terminar la animación se marca .reveal-done, que apaga la
    // transition y el transform del elemento. Antes quedaban vivos para
    // siempre: el navegador mantenía una capa por cada elemento ya
    // revelado y eso se pagaba en cada frame de scroll.
    const alTerminar = (e: Event) => {
      const el = e.currentTarget as Element;
      el.classList.add("reveal-done");
      el.removeEventListener("transitionend", alTerminar);
    };

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.addEventListener("transitionend", alTerminar);
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => {
      obs.disconnect();
      els.forEach((el) => el.removeEventListener("transitionend", alTerminar));
    };
  }, []);
  return null;
}
