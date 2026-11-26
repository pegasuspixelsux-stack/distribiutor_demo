'use client'; // Error boundaries must be Client Components

/** Last-resort fallback when the root layout itself fails: plain HTML, no app providers. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  console.error(error);
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#FBFBFD', color: '#1D1D1F' }}>
        <title>Algo salió mal</title>
        <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600 }}>Algo salió mal</h1>
            <p style={{ fontSize: 14, color: '#515154' }}>No pudimos cargar el sitio. Intentá de nuevo en unos segundos.</p>
            <button
              type="button"
              onClick={() => retry()}
              style={{ minHeight: 44, padding: '0 24px', borderRadius: 999, border: 0, background: '#1D1D1F', color: '#fff', fontSize: 14, cursor: 'pointer' }}
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
