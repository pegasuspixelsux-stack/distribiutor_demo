import { adminDb, allowAttempt, clientIp } from '@/lib/server/admin';
import { phoneKey } from '@/src/utils/phone';

// Phone + 4-digit PIN sign-in for wholesale customers. The PIN table (client_pins) is closed to browsers, so a PIN
// can only be checked here, where attempts are limited: guessing all 10,000 PINs for a phone is no longer possible.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_PHONE = 5;
const MAX_PER_IP = 30;

export async function POST(request: Request) {
  const db = adminDb();
  if (!db) return Response.json({ error: 'not_configured' }, { status: 503 });

  let body: { phone?: unknown; pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  const phone = typeof body.phone === 'string' ? phoneKey(body.phone) : '';
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  if (!/^\d{6,15}$/.test(phone) || !/^\d{4}$/.test(pin)) {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }

  // Both limits count every attempt, so a burst from one place or against one phone is cut off.
  const [phoneOk, ipOk] = await Promise.all([
    allowAttempt(db, `pin-phone:${phone}`, MAX_PER_PHONE, WINDOW_MS),
    allowAttempt(db, `pin-ip:${clientIp(request)}`, MAX_PER_IP, WINDOW_MS),
  ]);
  if (!phoneOk || !ipOk) {
    return Response.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': String(WINDOW_MS / 1000) } });
  }

  const snap = await db.collection('client_pins').doc(`${phone}-${pin}`).get();
  const token = snap.data()?.token;
  if (typeof token !== 'string') return Response.json({ error: 'invalid' }, { status: 401 });
  return Response.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
