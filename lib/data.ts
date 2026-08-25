export type Category = {
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  count: number;
  accent: string;
  hue?: number;
};

export type Pro = {
  id: string;
  slug: string;
  name: string;
  title: string;
  avatar: string;
  zone: string;
  verifiedSince: string;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  jobsCompleted: number;
  bio: string;
  skills: string[];
  badges: string[];
  languages: string[];
  matricula?: string;
  highlights: { label: string; value: string }[];
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  proId: string;
  priceFrom: number;
  image: string;
  rating: number;
  reviewsCount: number;
  zones: string[];
  delivery: string;
  shortPitch: string;
  description: string;
  includes: string[];
  faq: { q: string; a: string }[];
  tags: string[];
};

export type PostedJob = {
  id: string;
  title: string;
  categorySlug: string;
  postedBy: string;
  postedAgo: string;
  zone: string;
  budget: { min: number; max: number };
  bidsCount: number;
  status: "abierto" | "en_revision" | "asignado";
  description: string;
  urgency: "hoy" | "esta_semana" | "flexible";
  photo: string | null;
  photos: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "plomeria",
    name: "Plomería",
    blurb: "Pérdida de agua, canilla rota, destape",
    icon: "🔧",
    count: 142,
    accent: "from-sky-100 to-sky-50",
    hue: 220,
  },
  {
    slug: "electricidad",
    name: "Electricidad",
    blurb: "Se fue la luz, enchufe quemado, corte",
    icon: "⚡",
    count: 118,
    accent: "from-amber-100 to-amber-50",
    hue: 85,
  },
  {
    slug: "gas",
    name: "Gas matriculado",
    blurb: "Olor a gas, calefón que no enciende",
    icon: "🔥",
    count: 47,
    accent: "from-rose-100 to-rose-50",
    hue: 30,
  },
  {
    slug: "aire",
    name: "Aire acondicionado",
    blurb: "No enfría, hace ruido, no enciende",
    icon: "❄️",
    count: 96,
    accent: "from-cyan-100 to-cyan-50",
    hue: 200,
  },
  {
    slug: "cerrajeria",
    name: "Cerrajería",
    blurb: "Me quedé afuera, cerradura trabada",
    icon: "🔑",
    count: 64,
    accent: "from-zinc-100 to-zinc-50",
    hue: 260,
  },
  {
    slug: "pintura",
    name: "Pintura",
    blurb: "Paredes descascaradas, humedad, renovar",
    icon: "🎨",
    count: 73,
    accent: "from-violet-100 to-violet-50",
    hue: 25,
  },
  {
    slug: "carpinteria",
    name: "Carpintería",
    blurb: "Puerta que no cierra, mueble roto",
    icon: "🪵",
    count: 51,
    accent: "from-orange-100 to-orange-50",
    hue: 60,
  },
  {
    slug: "albanileria",
    name: "Albañilería",
    blurb: "Grietas, piso roto, reforma de baño",
    icon: "🧱",
    count: 38,
    accent: "from-stone-100 to-stone-50",
    hue: 45,
  },
  {
    slug: "electrodomesticos",
    name: "Electrodomésticos",
    blurb: "Heladera que no enfría, lavarropas roto",
    icon: "📺",
    count: 42,
    accent: "from-emerald-100 to-emerald-50",
    hue: 290,
  },
  {
    slug: "vidrieria",
    name: "Vidriería",
    blurb: "Vidrio roto, ventana que no cierra",
    icon: "🪟",
    count: 22,
    accent: "from-blue-100 to-blue-50",
    hue: 210,
  },
];

export const PROS: Pro[] = [
  {
    id: "p1",
    slug: "martin-acosta",
    name: "Martín Acosta",
    title: "Plomero y gasista matriculado",
    avatar: "https://i.pravatar.cc/240?img=12",
    zone: "Palermo · Recoleta · Belgrano",
    verifiedSince: "Marzo 2026",
    rating: 4.96,
    reviewsCount: 87,
    responseTime: "Responde en ~12 min",
    jobsCompleted: 134,
    bio: "Egresado de la EET N°7 de Lanús, 9 años de oficio. Especializado en termofusión, calefones y detección de pérdidas no destructiva. Trabajo limpio, factura siempre.",
    skills: [
      "Termofusión",
      "Detección de pérdidas",
      "Instalación de termotanques",
      "Desagües cloacales",
      "Gas natural — RUM 12.847",
    ],
    badges: ["Top Pro", "Matriculado", "Verificado en sitio"],
    languages: ["Español"],
    matricula: "RUM 12.847 · ENARGAS",
    highlights: [
      { label: "Trabajos cerrados", value: "134" },
      { label: "Calificación", value: "4.96" },
      { label: "Reintervención", value: "0.7%" },
      { label: "En Sufix desde", value: "Mar 2026" },
    ],
  },
  {
    id: "p2",
    slug: "lucia-fernandez",
    name: "Lucía Fernández",
    title: "Electricista domiciliaria",
    avatar: "https://i.pravatar.cc/240?img=47",
    zone: "Núñez · Belgrano · Vicente López",
    verifiedSince: "Febrero 2026",
    rating: 4.92,
    reviewsCount: 64,
    responseTime: "Responde en ~20 min",
    jobsCompleted: 98,
    bio: "Técnica electricista (UTN). Hago instalaciones bajo norma AEA 90364, tableros, puesta a tierra y diagnóstico de cortocircuitos. Te explico el problema antes de cobrarlo.",
    skills: [
      "Tableros y disyuntores",
      "Puesta a tierra",
      "Iluminación LED",
      "Domótica básica",
      "Certificación AEA",
    ],
    badges: ["Matriculada", "Verificada en sitio"],
    languages: ["Español", "Inglés"],
    matricula: "Matrícula CPETIyAM N°4129",
    highlights: [
      { label: "Trabajos cerrados", value: "98" },
      { label: "Calificación", value: "4.92" },
      { label: "Reintervención", value: "1.2%" },
      { label: "En Sufix desde", value: "Feb 2026" },
    ],
  },
  {
    id: "p3",
    slug: "ezequiel-rios",
    name: "Ezequiel Ríos",
    title: "Técnico en aires acondicionados",
    avatar: "https://i.pravatar.cc/240?img=33",
    zone: "Caballito · Almagro · Villa Crespo",
    verifiedSince: "Enero 2026",
    rating: 4.88,
    reviewsCount: 112,
    responseTime: "Responde en ~8 min",
    jobsCompleted: 201,
    bio: "12 años instalando y haciendo service de splits y centrales. Trabajo con todas las marcas. Te dejo el equipo cargado y la factura A si la necesitás.",
    skills: [
      "Instalación de splits",
      "Carga de gas R32 / R410A",
      "Limpieza profunda",
      "Reubicación de equipos",
    ],
    badges: ["Top Pro", "Verificado en sitio"],
    languages: ["Español"],
    highlights: [
      { label: "Trabajos cerrados", value: "201" },
      { label: "Calificación", value: "4.88" },
      { label: "Reintervención", value: "1.9%" },
      { label: "En Sufix desde", value: "Ene 2026" },
    ],
  },
  {
    id: "p4",
    slug: "santiago-paredes",
    name: "Santiago Paredes",
    title: "Cerrajero 24/7",
    avatar: "https://i.pravatar.cc/240?img=15",
    zone: "CABA — toda la ciudad",
    verifiedSince: "Marzo 2026",
    rating: 4.97,
    reviewsCount: 219,
    responseTime: "Responde en ~3 min",
    jobsCompleted: 312,
    bio: "Cerrajería de urgencia, día y noche. Apertura sin daño, cambio de combinaciones, instalación de cerraduras multipunto y blindaje de puertas.",
    skills: [
      "Apertura sin daño",
      "Cerraduras Trabex / Kallay",
      "Blindajes",
      "Cajas fuertes",
    ],
    badges: ["24/7", "Verificado en sitio", "Top Pro"],
    languages: ["Español"],
    highlights: [
      { label: "Trabajos cerrados", value: "312" },
      { label: "Calificación", value: "4.97" },
      { label: "Tiempo en sitio", value: "<40 min" },
      { label: "En Sufix desde", value: "Mar 2026" },
    ],
  },
  {
    id: "p5",
    slug: "carolina-vidal",
    name: "Carolina Vidal",
    title: "Pintora especializada",
    avatar: "https://i.pravatar.cc/240?img=44",
    zone: "Palermo · Villa Crespo · Colegiales",
    verifiedSince: "Abril 2026",
    rating: 4.94,
    reviewsCount: 41,
    responseTime: "Responde en ~30 min",
    jobsCompleted: 56,
    bio: "Pintura de interiores con acabados premium y tratamientos antihumedad. Muebles en blanco, lacas, microcemento liso. Cubro y dejo todo como estaba.",
    skills: [
      "Antihumedad",
      "Lacas y enduidos",
      "Microcemento liso",
      "Empapelado",
    ],
    badges: ["Top Pro", "Verificada en sitio"],
    languages: ["Español"],
    highlights: [
      { label: "Trabajos cerrados", value: "56" },
      { label: "Calificación", value: "4.94" },
      { label: "Reintervención", value: "0.0%" },
      { label: "En Sufix desde", value: "Abr 2026" },
    ],
  },
  {
    id: "p6",
    slug: "ivan-quispe",
    name: "Iván Quispe",
    title: "Carpintero a medida",
    avatar: "https://i.pravatar.cc/240?img=68",
    zone: "Belgrano · Núñez · Vicente López",
    verifiedSince: "Febrero 2026",
    rating: 4.91,
    reviewsCount: 38,
    responseTime: "Responde en ~1 h",
    jobsCompleted: 47,
    bio: "Muebles a medida, restauración y ajuste de aberturas. Trabajo con melamina y madera maciza. Mediciones y plano antes de cotizar.",
    skills: [
      "Placards y vestidores",
      "Muebles de cocina",
      "Restauración",
      "Ajustes de aberturas",
    ],
    badges: ["Verificado en sitio"],
    languages: ["Español"],
    highlights: [
      { label: "Trabajos cerrados", value: "47" },
      { label: "Calificación", value: "4.91" },
      { label: "Reintervención", value: "0.4%" },
      { label: "En Sufix desde", value: "Feb 2026" },
    ],
  },
];

export const SERVICES: Service[] = [
  {
    id: "s1",
    slug: "instalacion-split-hasta-3000-frigorias",
    title:
      "Instalación de split hasta 3000 frigorías con garantía 6 meses",
    categorySlug: "aire",
    proId: "p3",
    priceFrom: 95000,
    image:
      "https://images.unsplash.com/photo-1631545806609-ad65bda6d3a4?auto=format&fit=crop&w=1200&q=70",
    rating: 4.88,
    reviewsCount: 64,
    zones: ["Caballito", "Almagro", "Villa Crespo", "Palermo"],
    delivery: "Mismo día o 24 hs",
    shortPitch:
      "Instalación completa con caños, soporte y carga de gas. Te dejo facturado y andando.",
    description:
      "Hago instalación completa de splits hasta 3000 frigorías: tendido de cañería (hasta 4m), soporte, vacío, carga y verificación. Marcas LG, Samsung, Surrey, BGH, Philco. Si la unidad necesita más caño o accesorios especiales, lo coordinamos antes del día del trabajo.",
    includes: [
      "Cañería de cobre hasta 4 metros",
      "Soporte de pared galvanizado",
      "Vacío y prueba de hermeticidad",
      "Carga de gas refrigerante",
      "Limpieza del puesto de trabajo",
      "Garantía escrita de 6 meses",
    ],
    faq: [
      {
        q: "¿Incluye el equipo?",
        a: "No. El cliente compra el split (te puedo recomendar dónde) y yo hago la instalación.",
      },
      {
        q: "¿Necesito permiso del consorcio?",
        a: "Para condensadora a balcón propio no. Para fachada o palier sí, te ayudo con el trámite.",
      },
    ],
    tags: ["Aire", "Instalación", "Garantía"],
  },
  {
    id: "s2",
    slug: "destape-cocina-bano-sin-romper",
    title: "Destape de cocina y baño sin romper — equipo profesional",
    categorySlug: "plomeria",
    proId: "p1",
    priceFrom: 28000,
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=70",
    rating: 4.97,
    reviewsCount: 52,
    zones: ["Palermo", "Recoleta", "Belgrano"],
    delivery: "En el día",
    shortPitch:
      "Cable eléctrico de hasta 30 m, hidrojet para los duros. No rompo, no marco azulejos.",
    description:
      "Destapes de pileta de cocina, baño y rejillas. Vengo con sonda eléctrica, sondas manuales y cámara si hace falta. Si el caño está roto, te muestro en cámara antes de proponer obra.",
    includes: [
      "Diagnóstico inicial gratuito",
      "Cable eléctrico hasta 30 m",
      "Limpieza al terminar",
      "Garantía de servicio 30 días",
    ],
    faq: [
      {
        q: "¿Cuánto tarda?",
        a: "Promedio 45 min. Casos con cámara o caño roto pueden llevar más.",
      },
    ],
    tags: ["Plomería", "Urgencia"],
  },
  {
    id: "s3",
    slug: "diagnostico-tablero-electrico-domiciliario",
    title: "Diagnóstico de tablero eléctrico domiciliario + arreglo",
    categorySlug: "electricidad",
    proId: "p2",
    priceFrom: 22000,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=70",
    rating: 4.92,
    reviewsCount: 38,
    zones: ["Núñez", "Belgrano", "Vicente López"],
    delivery: "24 hs",
    shortPitch:
      "Si te saltan los térmicos o tenés cortes, diagnostico el circuito y lo dejo bajo norma AEA.",
    description:
      "Diagnóstico completo del tablero: revisión de disyuntor, térmicos, derivaciones y puesta a tierra. Te entrego informe escrito con lo que encontré y opciones de arreglo. Si querés, lo arreglo en el mismo viaje.",
    includes: [
      "Inspección con pinza amperométrica",
      "Verificación de puesta a tierra",
      "Informe escrito de hallazgos",
      "Materiales hasta $8.000 incluidos",
    ],
    faq: [
      {
        q: "¿Hacés certificación AEA?",
        a: "Sí. Para venta o alquiler te emito la documentación correspondiente.",
      },
    ],
    tags: ["Electricidad", "Diagnóstico"],
  },
  {
    id: "s4",
    slug: "apertura-puerta-urgencia-sin-dano",
    title: "Apertura de puerta de urgencia — sin daño, 24/7",
    categorySlug: "cerrajeria",
    proId: "p4",
    priceFrom: 35000,
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1200&q=70",
    rating: 4.97,
    reviewsCount: 142,
    zones: ["CABA — toda la ciudad"],
    delivery: "Llego en 30–60 min",
    shortPitch:
      "Te dejaste las llaves adentro o se rompió la cerradura. Llego rápido y abro sin marcar la puerta.",
    description:
      "Apertura de cerraduras Trabex, Kallay, Acytra, Multilock y similares. Llegada estimada 30–60 min según zona. Si la cerradura está rota, te cotizo el cambio antes de hacer nada.",
    includes: [
      "Llegada en menos de 60 min",
      "Apertura sin daño",
      "Atención 24/7",
      "Documentación de propietario verificada en el momento",
    ],
    faq: [
      {
        q: "¿Y si la cerradura no se puede abrir sin daño?",
        a: "Te aviso antes y decidís. Si se rompe la cerradura por necesidad, el cambio se cotiza aparte y no se cobra la apertura.",
      },
    ],
    tags: ["Cerrajería", "Urgencia"],
  },
  {
    id: "s5",
    slug: "pintura-monoambiente-completa",
    title: "Pintura de monoambiente o 1 ambiente — todo incluido",
    categorySlug: "pintura",
    proId: "p5",
    priceFrom: 185000,
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=70",
    rating: 4.94,
    reviewsCount: 24,
    zones: ["Palermo", "Villa Crespo", "Colegiales"],
    delivery: "2–3 días",
    shortPitch:
      "Paredes, techo y pequeñas reparaciones. Pintura látex premium, cubro todo y limpio.",
    description:
      "Pintura completa de hasta 40 m². Incluye enduido en imperfecciones, lijado, cubrimiento total de muebles y dos manos de látex premium. Color a elección dentro de paleta estándar.",
    includes: [
      "Enduido y lijado",
      "Cubrimiento total de muebles",
      "Dos manos de látex premium",
      "Limpieza final",
    ],
    faq: [
      {
        q: "¿Hay que vaciar el ambiente?",
        a: "No. Movemos y cubrimos los muebles. Sólo te pido despejar lo que esté contra las paredes.",
      },
    ],
    tags: ["Pintura", "Interiores"],
  },
  {
    id: "s6",
    slug: "placard-a-medida-melamina",
    title: "Placard a medida en melamina — diseño + instalación",
    categorySlug: "carpinteria",
    proId: "p6",
    priceFrom: 320000,
    image:
      "https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?auto=format&fit=crop&w=1200&q=70",
    rating: 4.91,
    reviewsCount: 18,
    zones: ["Belgrano", "Núñez", "Vicente López"],
    delivery: "10–15 días",
    shortPitch:
      "Diseño 3D, fabricación en taller, instalación en domicilio. Herrajes Blum.",
    description:
      "Te visito, mido y te paso un render 3D del placard. Una vez aprobado, fabrico en taller y lo instalo en un día. Herrajes alemanes Blum con garantía de por vida.",
    includes: [
      "Medición y diseño 3D",
      "Melamina Egger 18 mm",
      "Herrajes Blum",
      "Instalación en 1 día",
    ],
    faq: [
      {
        q: "¿Puedo elegir color?",
        a: "Sí, tenés más de 40 colores y texturas de melamina para elegir.",
      },
    ],
    tags: ["Carpintería", "Muebles a medida"],
  },
  {
    id: "s7",
    slug: "service-heladera-no-frost",
    title: "Service de heladera no-frost — diagnóstico en domicilio",
    categorySlug: "electrodomesticos",
    proId: "p3",
    priceFrom: 18000,
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=70",
    rating: 4.85,
    reviewsCount: 31,
    zones: ["Caballito", "Almagro", "Villa Crespo"],
    delivery: "24–48 hs",
    shortPitch:
      "Diagnóstico en domicilio descontado del arreglo. Marcas: Whirlpool, Samsung, LG, Gafa.",
    description:
      "Diagnóstico domiciliario en el día o al siguiente. Si decidís hacer el arreglo conmigo, el valor del diagnóstico se descuenta del total.",
    includes: [
      "Diagnóstico en domicilio",
      "Revisión de compresor y placa",
      "Garantía 90 días en mano de obra",
    ],
    faq: [
      { q: "¿Trabajás con todas las marcas?", a: "Sí, todas las nacionales y las premium." },
    ],
    tags: ["Electrodomésticos", "Service"],
  },
  {
    id: "s8",
    slug: "deteccion-perdida-gas-no-destructiva",
    title: "Detección de pérdida de gas no destructiva + certificado",
    categorySlug: "gas",
    proId: "p1",
    priceFrom: 48000,
    image:
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=70",
    rating: 4.99,
    reviewsCount: 22,
    zones: ["Palermo", "Recoleta", "Belgrano"],
    delivery: "En el día",
    shortPitch:
      "Detección con equipo electrónico, sin romper paredes. Certificado de gas matriculado.",
    description:
      "Si tu detector se queja o sentís olor, vengo con equipo electrónico. Localizo la pérdida, te informo y, si está dentro de mi alcance, lo reparo en el mismo viaje. Entrego documentación.",
    includes: [
      "Detección no destructiva",
      "Informe firmado",
      "Certificado para Metrogas si corresponde",
    ],
    faq: [
      {
        q: "¿Cubre todos los artefactos?",
        a: "Sí, incluye revisión de termotanque, cocina, calefón y conexiones.",
      },
    ],
    tags: ["Gas", "Matriculado", "Urgencia"],
  },
];

export const ZONES = [
  "Palermo",
  "Recoleta",
  "Belgrano",
  "Núñez",
  "Puerto Madero",
  "Caballito",
  "Villa Crespo",
  "Colegiales",
  "Almagro",
  "Vicente López",
  "Olivos",
  "San Isidro",
];

// Las primeras 9 son barrios de CABA propiamente dicha; las últimas 3
// (Vicente López, Olivos, San Isidro) son Zona Norte del GBA. Se usa para
// el botón "Toda CABA" (ZonaChips) y su equivalente en el buscador: en vez
// de forzar a agregar cada barrio nuevo de Capital a mano (ej. Devoto), un
// técnico que cubre "toda Capital" tilda un solo botón que selecciona estos
// 9 de una — sigue siendo un array de barrios reales, no un valor mágico
// nuevo, así que el resto de la app (filtros, tarjetas) no tiene que saber
// que existe este atajo.
export const ZONAS_CABA = ZONES.slice(0, 9);

export const URGENCIES = [
  { value: "hoy", label: "Hoy mismo", note: "necesito que venga en el día" },
  {
    value: "esta_semana",
    label: "Esta semana",
    note: "puedo esperar 2–5 días",
  },
  { value: "flexible", label: "Flexible", note: "no es urgente" },
];

export function findService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
export function findPro(slug: string) {
  return PROS.find((p) => p.slug === slug);
}
export function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function proById(id: string) {
  return PROS.find((p) => p.id === id);
}
export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function servicesByCategory(slug: string) {
  return SERVICES.filter((s) => s.categorySlug === slug);
}

export function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}
