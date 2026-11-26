import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, allowAttempt, clientIp } from '@/lib/server/admin';
import { sampleProperties } from '@/src/data/sampleProperties';
import { PRICE_LEVEL_IDS, type PricingMode } from '@/src/types/firestore';
import { USD_TO_UYU, formatMoney, priceWithShortUnit, quantityLabel } from '@/src/utils/format';
import { optionPrice, saleOptions, type SaleOption, type SaleSource } from '@/src/utils/pricing';

// Places a wholesale customer's order. Browsers can no longer write orders themselves (see firestore.rules):
// they send only what was picked (product, unit, quantity) and the delivery details, and every price is worked
// out here from the product and the customer's price level, so it cannot be changed from the browser.

const MODES: PricingMode[] = ['por_kilo', 'por_caja', 'por_atado', 'por_unidad', 'por_bolson'];
const MAX_LINES = 100;

type Line = { id: string | number; mode: PricingMode; qty: number };
type Contact = {
  name: string;
  phone: string;
  email: string;
  fulfillment: 'delivery' | 'pickup';
  address: string;
  date: string;
  time: string;
  notes: string;
};

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function parseBody(body: unknown): { token: string; lines: Line[]; contact: Contact } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const token = str(b.token, 128);
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return null;
  if (!Array.isArray(b.lines) || b.lines.length === 0 || b.lines.length > MAX_LINES) return null;
  const lines: Line[] = [];
  for (const raw of b.lines) {
    const l = (raw ?? {}) as Record<string, unknown>;
    const id = l.id;
    const validId =
      (typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id)) ||
      (typeof id === 'number' && Number.isInteger(id) && id >= 1);
    const qty = l.qty;
    if (!validId || !MODES.includes(l.mode as PricingMode) || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 999) {
      return null;
    }
    lines.push({ id: id as string | number, mode: l.mode as PricingMode, qty });
  }
  const c = (b.contact ?? {}) as Record<string, unknown>;
  const contact: Contact = {
    name: str(c.name, 200),
    phone: str(c.phone, 50),
    email: str(c.email, 320),
    fulfillment: c.fulfillment === 'pickup' ? 'pickup' : 'delivery',
    address: str(c.address, 300),
    date: str(c.date, 20),
    time: str(c.time, 20),
    notes: str(c.notes, 1000),
  };
  return { token, lines, contact };
}

/** The selling fields of a product as stored (items saved in US$ are converted, like the catalog does). */
function toSaleSource(d: Record<string, unknown>): SaleSource {
  const rate = d.currency === 'USD' ? USD_TO_UYU : 1;
  const money = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n * rate * 100) / 100 : undefined);
  const positive = (n: unknown) => (typeof n === 'number' && n > 0 ? n : undefined);
  return {
    price: money(Number(d.price) || 0) ?? 0,
    salePrice: money(d.salePrice),
    pricingMode: MODES.includes(d.pricingMode as PricingMode) ? (d.pricingMode as PricingMode) : 'por_kilo',
    boxWeight: positive(d.boxWeight),
    unitWeight: positive(d.unitWeight),
    boxPrice: money(d.boxPrice),
    unitPrice: money(d.unitPrice),
    boxUnits: typeof d.boxUnits === 'number' && d.boxUnits >= 1 ? Math.floor(d.boxUnits) : undefined,
    looseAllowed: d.looseAllowed === true ? true : undefined,
  };
}

/** The option for the unit the customer picked, among every unit the product can be sold in. */
function findOption(src: SaleSource, mode: PricingMode, allowLoose: boolean): SaleOption | undefined {
  const base: SaleOption = { mode: src.pricingMode ?? 'por_kilo', price: src.price, salePrice: src.salePrice };
  return [...saleOptions(src, 'wholesale', { allowLoose }), ...saleOptions(src, 'retail'), base].find((o) => o.mode === mode);
}

export async function POST(request: Request) {
  const db = adminDb();
  if (!db) return Response.json({ error: 'not_configured' }, { status: 503 });

  let parsed: ReturnType<typeof parseBody>;
  try {
    parsed = parseBody(await request.json());
  } catch {
    parsed = null;
  }
  if (!parsed) return Response.json({ error: 'invalid' }, { status: 400 });
  const { token, lines, contact } = parsed;

  if (!(await allowAttempt(db, `order-ip:${clientIp(request)}`, 30, 60 * 60 * 1000))) {
    return Response.json({ error: 'too_many' }, { status: 429 });
  }

  // Who is ordering, and at which price level.
  const access = (await db.collection('client_access').doc(token).get()).data();
  if (!access) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (access.status === 'suspended') return Response.json({ error: 'suspended' }, { status: 403 });
  if (!(PRICE_LEVEL_IDS as readonly string[]).includes(access.priceLevelId)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const level = { categoryAdjustments: (access.categoryAdjustments ?? {}) as Record<string, number> };
  const levelName = typeof access.levelName === 'string' ? access.levelName : '';
  const businessName = typeof access.businessName === 'string' ? access.businessName : '';
  const allowLoose = access.allowLoose === true;

  const name = contact.name || businessName;
  const phone = contact.phone || (typeof access.phone === 'string' ? access.phone : '');
  if (!name) return Response.json({ error: 'name' }, { status: 400 });
  if (!phone && !contact.email) return Response.json({ error: 'contact' }, { status: 400 });
  if (contact.fulfillment === 'delivery' && !contact.address) return Response.json({ error: 'address' }, { status: 400 });
  if (!contact.time) return Response.json({ error: 'time' }, { status: 400 });

  // Real products from Firestore; the built-in samples (numeric ids) from the app's own sample list.
  const ids = [...new Set(lines.map((l) => l.id).filter((id): id is string => typeof id === 'string'))];
  const docs = ids.length ? await db.getAll(...ids.map((id) => db.collection('properties').doc(id))) : [];
  const products = new Map(docs.map((d) => [d.id, d.data()]));

  const priced: { line: Line; title: string; unit: number }[] = [];
  for (const line of lines) {
    const d =
      typeof line.id === 'string'
        ? products.get(line.id)
        : (sampleProperties[line.id - 1] as unknown as Record<string, unknown> | undefined);
    if (!d || d.status !== 'active') return Response.json({ error: 'unavailable', id: line.id }, { status: 409 });
    const title = typeof d.title === 'string' ? d.title : '';
    if (d.inStock === false) return Response.json({ error: 'out_of_stock', id: line.id, title }, { status: 409 });
    const option = findOption(toSaleSource(d), line.mode, allowLoose);
    if (!option) return Response.json({ error: 'unit', id: line.id, title }, { status: 409 });
    const categoryId = typeof d.type === 'string' ? d.type : undefined;
    priced.push({ line, title, unit: optionPrice(option, categoryId, level).unit });
  }

  const orderId = db.collection('leads').doc().id;
  const tag = `Mayorista${levelName ? ` · ${levelName}` : ''}`;
  const deliveryLines = [
    contact.fulfillment === 'delivery' ? `Entrega a domicilio: ${contact.address}` : 'Retiro en local',
    `${contact.fulfillment === 'delivery' ? 'Hora de recepción' : 'Hora de retiro'}: ${contact.date ? `${contact.date} ` : ''}${contact.time}`,
    `Contacto: ${name} · WhatsApp: ${phone || '—'}`,
    'Precios sujetos a confirmación: se confirma el pedido con precios ajustados antes del envío.',
    contact.notes && `Instrucciones especiales: ${contact.notes}`,
  ];

  // One lead per product line, written together, sharing the order id (the dashboard groups them).
  const batch = db.batch();
  for (const { line, title, unit } of priced) {
    batch.set(db.collection('leads').doc(), {
      orderId,
      name: businessName ? `${businessName}${name !== businessName ? ` (${name})` : ''}` : name,
      phone,
      unitPrice: unit,
      quantity: line.qty,
      clientId: typeof access.clientId === 'string' ? access.clientId : '',
      priceLevelId: access.priceLevelId,
      email: contact.email,
      property: title,
      ...(typeof line.id === 'string' ? { propertyId: line.id } : {}),
      channel: 'Portal',
      message: [
        `[${tag}] ${title} - ${quantityLabel(line.qty, line.mode)} @ ${priceWithShortUnit(unit, line.mode)} · Subtotal: ${formatMoney(unit * line.qty)}`,
        ...deliveryLines,
      ]
        .filter(Boolean)
        .join('\n'),
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  return Response.json(
    {
      orderId,
      lines: priced.map(({ line, unit }) => ({ id: line.id, mode: line.mode, unitPrice: unit })),
      total: Math.round(priced.reduce((s, p) => s + p.unit * p.line.qty, 0) * 100) / 100,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
