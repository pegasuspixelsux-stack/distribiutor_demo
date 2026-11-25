/** Shared site texts (used by the layout metadata and the Open Graph page). */
/** Brand shown when no business name is set in Ajustes. */
export const SITE_TITLE = 'Catálogo Mayorista';
/** The business name from Ajustes, or the neutral default. */
export const brandOf = (b: { businessName?: string } | null | undefined) => b?.businessName?.trim() || SITE_TITLE;
export const SITE_DESCRIPTION =
  'Distribuidor hortifrutícola para la gastronomía de Punta del Este: frutas, verduras y hojas verdes frescas para restaurantes, hoteles y comercios. Catálogo mayorista y entregas diarias.';

/** Link preview (WhatsApp, Facebook, X): the text of the /opengraph flyer and a screenshot of it. */
export const SHARE_TITLE = 'Tus clientes piden solos. Siempre con tu margen.';
export const SHARE_DESCRIPTION =
  'La app de pedidos para distribuidores de frutas y verduras. Pedidos fáciles de procesar · Precios dinámicos, cambios en segundos · Niveles de precio por cliente · Protegé tu margen en cada venta · Tus clientes repiten su pedido en un clic · Fidelizá con favoritos y app propia';
/** A 1440 x 1440 px (square) screenshot of the /opengraph hero. WhatsApp caches previews hard: a changed image needs a new file name (opengraph-v7.jpg ...). */
export const SHARE_IMAGE = '/opengraph-v6.jpg';
export const SHARE_IMAGE_WIDTH = 1440;
export const SHARE_IMAGE_HEIGHT = 1440;
export const SHARE_IMAGE_ALT = 'La app de pedidos para distribuidores de frutas y verduras: el catálogo en un celular';
