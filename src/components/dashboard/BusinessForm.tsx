'use client';

import { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useBusiness } from '@/src/context/BusinessContext';
import { saveBusinessSettings } from '@/src/services/businessService';
import type { BusinessSettings } from '@/src/types/firestore';
import { cardClass, inputClass, labelClass } from '@/src/components/dashboard/ui';
import ImageUpload from '@/src/components/ImageUpload';

/**
 * "Datos del negocio": the operator's name (title of the catalogue), address, contact, RUT / license and hours.
 * They appear in the site header and footer and on the printed sheets. Only administrators can change them.
 */
export default function BusinessForm() {
  const { agent } = useAuth();
  const current = useBusiness();
  const [form, setForm] = useState<BusinessSettings>(current);
  const [synced, setSynced] = useState<BusinessSettings>(current);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const canEdit = agent?.role === 'admin';

  const differs = (a: BusinessSettings, b: BusinessSettings) =>
    (Object.keys(a) as (keyof BusinessSettings)[]).some((k) => a[k].trim() !== b[k]);

  // The saved settings arrive from Firestore after mount (and update live). Load them into the form,
  // including the logo, unless the admin has unsaved edits.
  if (current !== synced) {
    setSynced(current);
    if (!differs(form, synced)) setForm(current);
  }

  const set = <K extends keyof BusinessSettings>(key: K, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = differs(form, current);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return setMessage({ ok: false, text: 'El correo no parece válido.' });
    }
    if (form.backgroundColor.trim() && !/^#[0-9a-fA-F]{6}$/.test(form.backgroundColor.trim())) {
      return setMessage({ ok: false, text: 'El color debe ser un código como #2E7D32.' });
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveBusinessSettings(form);
      setMessage({ ok: true, text: 'Datos del negocio guardados. Ya se ven en el sitio.' });
    } catch (err) {
      const denied = (err as { code?: string }).code === 'permission-denied';
      setMessage({
        ok: false,
        text: denied
          ? 'Permiso denegado. Solo un administrador puede cambiarlos, y hay que publicar las reglas de Firestore actualizadas.'
          : 'No se pudieron guardar los datos.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={`${cardClass} p-6 md:p-8 max-w-xl space-y-5 mt-6`}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Datos del negocio</h2>
        <p className="text-xs text-[#515154] mt-1">
          Se muestran en el título del catálogo, en el pie del sitio y en las hojas impresas.
          {!canEdit && ' Solo un administrador puede cambiarlos.'}
        </p>
      </div>

      <div>
        <label htmlFor="b-name" className={labelClass}>Nombre del operador (título del catálogo)</label>
        <input id="b-name" className={inputClass} value={form.businessName} disabled={!canEdit} maxLength={120} onChange={(e) => set('businessName', e.target.value)} placeholder="Nombre de tu negocio" />
        <p className="text-xs text-[#86868B] mt-1">Se muestra como título en la barra superior y el pie cuando no hay logo. Si lo dejás vacío se usa “Catálogo Mayorista”.</p>
      </div>
      <div>
        <span className={labelClass}>Logo</span>
        <div className="flex items-center gap-4">
          <span className="shrink-0 rounded-xl border border-[#000000]/10 bg-white p-1.5">
            {form.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt="Logo actual" className="h-14 w-14 object-contain" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center text-center text-[10px] leading-tight text-[#86868B]">Sin logo</span>
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            {canEdit && <ImageUpload folder="/Merkado-v2/branding" onUploaded={({ url }) => set('logo', url)} onError={(text) => setMessage({ ok: false, text })} />}
            {canEdit && form.logo && (
              <button type="button" onClick={() => set('logo', '')} className="text-xs underline underline-offset-2 text-[#515154] hover:text-[#1D1D1F]">
                Quitar logo (se muestra el nombre)
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-[#86868B] mt-1.5">Sale arriba en la barra y en el pie del sitio. Sin logo, ahí se muestra el nombre del operador como título. Mejor una imagen con fondo transparente (PNG).</p>
      </div>
      <div className="rounded-2xl border border-[#000000]/10 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold tracking-tight">Portada (hero del inicio)</p>
          <p className="text-xs text-[#86868B] mt-1">Imagen, etiqueta, título y texto de la portada del inicio. Lo que dejes vacío no se muestra.</p>
        </div>
        <div>
          <span className={labelClass}>Imagen de portada</span>
          <div className="space-y-2">
            <span className="block overflow-hidden rounded-xl border border-[#000000]/10 bg-[var(--brand-bg,#2E7D32)]">
              {form.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.heroImage} alt="Imagen de portada" className="h-32 w-full object-cover" />
              ) : (
                <span className="flex h-32 items-center justify-center text-xs text-white/80">Sin imagen: se usa el color de fondo</span>
              )}
            </span>
            {canEdit && <ImageUpload folder="/Merkado-v2/branding" onUploaded={({ url }) => set('heroImage', url)} onError={(text) => setMessage({ ok: false, text })} />}
            {canEdit && form.heroImage && (
              <button type="button" onClick={() => set('heroImage', '')} className="text-xs underline underline-offset-2 text-[#515154] hover:text-[#1D1D1F]">
                Quitar imagen
              </button>
            )}
          </div>
          <p className="text-xs text-[#86868B] mt-1.5">Foto de fondo de la portada. Mejor horizontal, de al menos 1600 px de ancho.</p>
        </div>
        <div>
          <span className={labelClass}>Logo de la portada</span>
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-xl border border-[#000000]/10 bg-white p-1.5">
              {form.heroLogo || form.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.heroLogo || form.logo} alt="Logo de la portada" className="h-14 w-14 object-contain" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center text-center text-[10px] leading-tight text-[#86868B]">Sin logo</span>
              )}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              {canEdit && <ImageUpload folder="/Merkado-v2/branding" onUploaded={({ url }) => set('heroLogo', url)} onError={(text) => setMessage({ ok: false, text })} />}
              {canEdit && form.heroLogo && (
                <button type="button" onClick={() => set('heroLogo', '')} className="text-xs underline underline-offset-2 text-[#515154] hover:text-[#1D1D1F]">
                  Quitar y usar el logo general
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="b-hero-eyebrow" className={labelClass}>Etiqueta superior (eyebrow)</label>
          <input id="b-hero-eyebrow" className={inputClass} value={form.heroEyebrow} disabled={!canEdit} maxLength={80} onChange={(e) => set('heroEyebrow', e.target.value)} placeholder="Distribución hortifrutícola B2B" />
        </div>
        <div>
          <label htmlFor="b-hero-heading" className={labelClass}>Título principal</label>
          <textarea id="b-hero-heading" rows={2} className={`${inputClass} resize-none`} value={form.heroHeading} disabled={!canEdit} maxLength={160} onChange={(e) => set('heroHeading', e.target.value)} placeholder="El distribuidor hortifrutícola para la gastronomía de Punta del Este." />
        </div>
        <div>
          <label htmlFor="b-hero-text" className={labelClass}>Texto de la portada</label>
          <textarea id="b-hero-text" rows={4} className={`${inputClass} resize-none`} value={form.heroText} disabled={!canEdit} maxLength={500} onChange={(e) => set('heroText', e.target.value)} placeholder="Abastecemos a restaurantes, hoteles y comercios…" />
          <p className="text-xs text-[#86868B] mt-1">Los saltos de línea se respetan.</p>
        </div>
        <div>
          <label htmlFor="b-bg" className={labelClass}>Color de fondo (celular)</label>
          <div className="flex items-center gap-3">
            <input id="b-bg" type="color" value={form.backgroundColor || '#2E7D32'} disabled={!canEdit} onChange={(e) => set('backgroundColor', e.target.value)} className="h-11 w-14 rounded-lg border border-[#000000]/10 bg-white p-1 cursor-pointer" />
            <input aria-label="Color en hexadecimal" className={`${inputClass} max-w-32 uppercase`} value={form.backgroundColor} disabled={!canEdit} maxLength={7} onChange={(e) => set('backgroundColor', e.target.value)} placeholder="#2E7D32" />
            {canEdit && form.backgroundColor && (
              <button type="button" onClick={() => set('backgroundColor', '')} className="text-xs underline underline-offset-2 text-[#515154] hover:text-[#1D1D1F]">Usar el verde por defecto</button>
            )}
          </div>
          <p className="text-xs text-[#86868B] mt-1">Fondo de la página en el celular, la portada y la barra superior del navegador.</p>
        </div>
        <div>
          <label htmlFor="b-hero-title" className={labelClass}>Título de la portada</label>
          <input id="b-hero-title" className={inputClass} value={form.heroTitle} disabled={!canEdit} maxLength={60} onChange={(e) => set('heroTitle', e.target.value)} placeholder="Título" />
        </div>
        <div>
          <label htmlFor="b-hero-slogan" className={labelClass}>Lema</label>
          <input id="b-hero-slogan" className={inputClass} value={form.heroSlogan} disabled={!canEdit} maxLength={100} onChange={(e) => set('heroSlogan', e.target.value)} placeholder="Desde 1998" />
        </div>
      </div>
      <div>
        <label htmlFor="b-address" className={labelClass}>Dirección</label>
        <input id="b-address" className={inputClass} value={form.address} disabled={!canEdit} maxLength={200} onChange={(e) => set('address', e.target.value)} placeholder="Calle y número, ciudad" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="b-email" className={labelClass}>Correo electrónico</label>
          <input id="b-email" type="email" className={inputClass} value={form.email} disabled={!canEdit} maxLength={200} onChange={(e) => set('email', e.target.value)} placeholder="contacto@tuempresa.com" />
        </div>
        <div>
          <label htmlFor="b-wa" className={labelClass}>WhatsApp</label>
          <input id="b-wa" type="tel" className={inputClass} value={form.whatsapp} disabled={!canEdit} maxLength={50} onChange={(e) => set('whatsapp', e.target.value)} placeholder="099 123 456" />
        </div>
        <div>
          <label htmlFor="b-phone" className={labelClass}>Teléfono</label>
          <input id="b-phone" type="tel" className={inputClass} value={form.phone} disabled={!canEdit} maxLength={50} onChange={(e) => set('phone', e.target.value)} placeholder="2xxx xxxx" />
        </div>
        <div>
          <label htmlFor="b-rut" className={labelClass}>RUT</label>
          <input id="b-rut" className={inputClass} value={form.rut} disabled={!canEdit} maxLength={60} onChange={(e) => set('rut', e.target.value)} placeholder="21 234567 0012" />
        </div>
      </div>
      <div>
        <label htmlFor="b-license" className={labelClass}>Habilitación / licencia</label>
        <input id="b-license" className={inputClass} value={form.license} disabled={!canEdit} maxLength={120} onChange={(e) => set('license', e.target.value)} placeholder="Nº de habilitación municipal o sanitaria" />
      </div>
      <div>
        <label htmlFor="b-hours" className={labelClass}>Horario de atención</label>
        <textarea id="b-hours" rows={3} className={`${inputClass} resize-none`} value={form.hours} disabled={!canEdit} maxLength={400} onChange={(e) => set('hours', e.target.value)} placeholder={'Lunes a sábado de 5:00 a 14:00\nDomingos cerrado'} />
      </div>

      <div>
        <p className={labelClass}>Redes sociales</p>
        <div className="space-y-3">
          <input aria-label="Instagram" className={inputClass} value={form.instagram} disabled={!canEdit} maxLength={200} onChange={(e) => set('instagram', e.target.value)} placeholder="Instagram: @tuempresa o el enlace" />
          <input aria-label="Facebook" className={inputClass} value={form.facebook} disabled={!canEdit} maxLength={200} onChange={(e) => set('facebook', e.target.value)} placeholder="Facebook: nombre de la página o el enlace" />
          <input aria-label="YouTube" className={inputClass} value={form.youtube} disabled={!canEdit} maxLength={200} onChange={(e) => set('youtube', e.target.value)} placeholder="YouTube: enlace del canal" />
        </div>
        <p className="text-xs text-[#86868B] mt-1.5">Salen como íconos en el menú del celular. El WhatsApp de arriba también aparece. Lo que dejes vacío no se muestra.</p>
      </div>

      {message && (
        <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      {canEdit && (
        <button
          type="submit"
          disabled={saving || !dirty}
          className="bg-[#1D1D1F] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#333336] transition-all disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar datos del negocio'}
        </button>
      )}
    </form>
  );
}
