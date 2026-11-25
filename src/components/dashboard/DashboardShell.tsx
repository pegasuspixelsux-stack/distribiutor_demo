'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Building2,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Percent,
  Plus,
  PlusSquare,
  Settings,
  Tags,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { brandOf } from '../../lib/siteMeta';
import { roleLabels } from '../../utils/format';
import { useLeads } from '../../hooks/useLeads';
import { groupOrders } from '../../utils/orders';
import LeadInbox from '../LeadInbox';

const nav: { href: string; label: string; icon: typeof Users; exact?: boolean; adminOnly?: boolean }[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: Inbox },
  { href: '/dashboard/daily-order', label: 'Pedido del día', icon: ClipboardList },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/price-levels', label: 'Niveles de precio', icon: Percent },
  { href: '/dashboard/categories', label: 'Categorías', icon: Tags },
  { href: '/dashboard/productos', label: 'Productos', icon: Building2 },
  { href: '/dashboard/productos/new', label: 'Agregar producto', icon: PlusSquare },
  { href: '/dashboard/customers', label: 'Clientes', icon: Users },
  // Staff / operators: add agents, change roles, deactivate accounts.
  { href: '/admin', label: 'Usuarios', icon: UserCog, adminOnly: true },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { agent, logout } = useAuth();
  const business = useBusiness();
  const brand = brandOf(business);
  const { leads, loading, error } = useLeads(100);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);

  const newLeads = groupOrders(leads).filter((g) => g.status === 'new').length; // new ORDERS, not product lines
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    // "Properties" should not light up on the Add Listing page.
    if (href === '/dashboard/productos') {
      return pathname.startsWith(href) && !pathname.startsWith('/dashboard/productos/new');
    }
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-6 h-16 flex items-center justify-between shrink-0">
        <Link href="/dashboard" aria-label={`${brand}, inicio del panel`} className="inline-flex items-center min-w-0">
          {business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo} alt={brand} className="h-11 w-auto max-w-40 object-contain" />
          ) : (
            <span className="truncate text-lg font-semibold tracking-tight text-white">{brand}</span>
          )}
        </Link>
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
          className="lg:hidden p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="px-6 pt-4 pb-2 text-xs uppercase tracking-widest text-white/80 font-semibold">Panel</p>
      <nav className="px-3 space-y-1" aria-label="Panel">
        {nav.filter((n) => !n.adminOnly || agent?.role === 'admin').map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                active ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 text-yellow-300" /> {label}
              {href === '/dashboard/pedidos' && newLeads > 0 && (
                <span
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-300 text-black"
                >
                  {newLeads}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-6">
        <Link href="/" className="text-xs text-white hover:underline">
          ← Ver el sitio
        </Link>
        <p className="mt-3 text-xs font-medium tracking-wide text-white/70">MerkadoB2B v3.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[var(--brand-bg,#2E7D32)] text-white">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-40 ${menuOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-[var(--brand-bg,#2E7D32)] text-white shadow-2xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar}
        </aside>
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#FBFBFD]/80 backdrop-blur-md border-b border-[#000000]/5">
          <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-full hover:bg-[#F5F5F7]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <p className="min-w-0 truncate text-sm sm:text-base font-medium tracking-tight" aria-live="polite">
              Bienvenido, {(agent?.name || agent?.email || '').split(' ')[0]}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <Link
                href="/dashboard/productos/new"
                className="inline-flex items-center gap-2 bg-[#1D1D1F] text-white text-xs font-medium px-4 py-2.5 rounded-full hover:bg-[#333336] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo producto</span>
              </Link>

              <button
                onClick={() => setInboxOpen(true)}
                aria-label={`Abrir bandeja de pedidos, ${newLeads} nuevos`}
                className="relative p-2.5 rounded-full bg-white border border-[#000000]/5 hover:bg-[#F5F5F7]"
              >
                <Inbox className="w-4 h-4" />
                {newLeads > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#1D1D1F] text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-[#FBFBFD]">
                    {newLeads > 99 ? '99+' : newLeads}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#000000]/10">
                <div className="w-9 h-9 rounded-full bg-[#1D1D1F] text-white text-sm font-medium flex items-center justify-center">
                  {(agent?.name || agent?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block leading-tight">
                  <p className="text-sm font-medium">{agent?.name || agent?.email}</p>
                  <p className="text-xs text-[#515154]">{agent ? (roleLabels[agent.role] ?? agent.role) : ""}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    router.replace('/admin/login');
                  }}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  className="p-2 rounded-full hover:bg-[#F5F5F7]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-8 py-10 max-w-6xl">{children}</main>
      </div>

      <LeadInbox
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        leads={leads}
        loading={loading}
        error={error}
        agentName={agent?.name ?? ''}
      />
    </div>
  );
}
