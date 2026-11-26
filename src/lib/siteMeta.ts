/** Shared site texts (used by the layout metadata and the /distribuidores promo page). */
/** Brand shown when no business name is set in Ajustes. */
export const SITE_TITLE = 'Catálogo Mayorista';
/** The business name from Ajustes, or the neutral default. */
export const brandOf = (b: { businessName?: string } | null | undefined) => b?.businessName?.trim() || SITE_TITLE;
export const SITE_DESCRIPTION =
  'Distribuidor hortifrutícola para la gastronomía de Punta del Este: frutas, verduras y hojas verdes frescas para restaurantes, hoteles y comercios. Catálogo mayorista y entregas diarias.';

/** Link preview (WhatsApp, Facebook, X) for every page without its own image: the /distribuidores promo page. */
export const SHARE_TITLE = 'Recibí y gestioná los pedidos de tus clientes sin caos';
export const SHARE_DESCRIPTION =
  'Sistema de pedidos B2B para distribuidoras: tus clientes ven sus precios, repiten pedidos en segundos y vos recibís todo ordenado, sin errores por teléfono ni mensajes perdidos.';
/** A 1200 x 630 screenshot of /distribuidores. WhatsApp caches previews hard: a changed image needs a new file name (distribuidores-v2.jpg ...). */
export const SHARE_IMAGE = '/og/distribuidores-v1.jpg';
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;
export const SHARE_IMAGE_ALT = 'Sistema de pedidos B2B para distribuidoras: catálogo con precios por cliente y pedido listo para enviar';
