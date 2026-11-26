import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Server-only Firestore with admin rights (it bypasses the security rules), for the API routes that must read
 * or write what browsers are not allowed to: PIN lookups, rate limits, and orders with prices worked out here.
 * Needs FIREBASE_SERVICE_ACCOUNT_KEY: the service-account JSON from Firebase Console > Project settings >
 * Service accounts > Generate new private key, pasted as one line. Never prefix it with NEXT_PUBLIC_.
 * Returns null when it is not configured, so the routes can answer with a clear error.
 */
export function adminDb(): Firestore | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  let app: App | undefined = getApps()[0];
  if (!app) {
    let account: { project_id?: string; client_email?: string; private_key?: string };
    try {
      account = JSON.parse(raw);
    } catch {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.');
      return null;
    }
    app = initializeApp({
      credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        // Some dashboards store the key's line breaks as the two characters "\n".
        privateKey: account.private_key?.replace(/\n/g, '\n'),
      }),
    });
  }
  return getFirestore(app);
}

/** The caller's IP address as Vercel reports it (first hop of x-forwarded-for). */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Fixed-window attempt limit kept in Firestore (`rate_limits`, which browsers cannot read or write).
 * Counts one attempt against `key` and returns false once more than `max` were made within `windowMs`.
 */
export async function allowAttempt(db: Firestore, key: string, max: number, windowMs: number): Promise<boolean> {
  const ref = db.collection('rate_limits').doc(key.replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 300));
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.data() as { count?: number; resetAt?: number } | undefined;
    if (!data?.resetAt || data.resetAt <= now) {
      tx.set(ref, { count: 1, resetAt: now + windowMs });
      return true;
    }
    const count = (data.count ?? 0) + 1;
    tx.update(ref, { count });
    return count <= max;
  });
}
