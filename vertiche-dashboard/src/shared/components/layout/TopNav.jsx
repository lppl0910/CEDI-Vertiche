import { useState, useRef, useEffect } from 'react';
import { UserCircle, ChevronDown, Monitor, SlidersHorizontal } from 'lucide-react';

const monitoreoTabs = [
  { id: 'flujo',     label: 'Análisis de flujo' },
  { id: 'dashboard', label: 'Dashboard' },
];

const ventasTabs = [
  { id: 'tendencias',  label: 'Tendencias' },
  { id: 'productos',   label: 'Productos' },
  { id: 'tiendas',     label: 'Tiendas' },
 // { id: 'descuentos',  label: 'Descuentos' },
  // { id: 'inventario',  label: 'Inventario' },
];

const interfaces = [
  { id: 'monitoreo', label: 'Monitoreo', available: true },
  { id: 'rfid',      label: 'RFID',      available: true },
  { id: 'ventas',    label: 'Ventas',    available: true },
];

const PERIODS = [
  { id: '7d',  label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: '90d', label: '90 días' },
  { id: '1y',  label: 'Anual' },
];

export default function TopNav({
  currentTab, onTabChange,
  currentInterface = 'monitoreo', onInterfaceChange,
  ventasSection, onVentasSectionChange,
  ventasFilters, onVentasFilterChange,
  onProfileOpen,
}) {
  const [comboOpen,  setComboOpen]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const comboRef  = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (comboRef.current  && !comboRef.current.contains(e.target))  setComboOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeInterface = interfaces.find(i => i.id === currentInterface) || interfaces[0];
  const isVentas = currentInterface === 'ventas';
  const tabs = isVentas ? ventasTabs : monitoreoTabs;
  const activeTabId = isVentas ? ventasSection : currentTab;
  const handleTabClick = isVentas ? onVentasSectionChange : onTabChange;

  const updateFilter = (key, val) => {
    onVentasFilterChange?.({ ...ventasFilters, [key]: val });
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: '#FFFFFF',
      borderBottom: '1px solid #E7E2DC',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      height: 56,
      gap: 16,
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 100 }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#111111', letterSpacing: '-0.02em' }}>
          Vertiche
        </span>
      </div>

      {/* Center: Tabs */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        {tabs.map(tab => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FFFFFF' : '#6B6B6B',
                background: isActive ? '#111111' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.1s, color 0.1s',
                fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8F6F3'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Filtros button (only for ventas) */}
        {isVentas && (
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: filterOpen ? '#111111' : '#6B6B6B',
                background: filterOpen ? '#F0EDE8' : '#F8F6F3',
                border: '1px solid #E7E2DC',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EDE8E2'}
              onMouseLeave={e => e.currentTarget.style.background = filterOpen ? '#F0EDE8' : '#F8F6F3'}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {ventasFilters && (ventasFilters.zona !== 'all' || ventasFilters.temporada !== 'all') && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#111111', display: 'inline-block',
                }} />
              )}
            </button>

            {filterOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E7E2DC',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                width: 240,
                zIndex: 30,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                {/* Period */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Período
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {PERIODS.map(p => {
                      const active = ventasFilters?.period === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => updateFilter('period', p.id)}
                          style={{
                            flex: 1,
                            padding: '5px 0',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: active ? 500 : 400,
                            color: active ? '#FFFFFF' : '#6B6B6B',
                            background: active ? '#111111' : '#F8F6F3',
                            border: '1px solid',
                            borderColor: active ? '#111111' : '#E7E2DC',
                            cursor: 'pointer',
                            fontFamily: 'var(--font)',
                            transition: 'all 0.1s',
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zone */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Zona
                  </div>
                  <select
                    value={ventasFilters?.zona || 'all'}
                    onChange={e => updateFilter('zona', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#1F1F1F',
                      background: '#F8F6F3',
                      border: '1px solid #E7E2DC',
                      fontFamily: 'var(--font)',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="all">Todas las zonas</option>
                    <option value="Norte">Zona Norte</option>
                    <option value="Sur">Zona Sur</option>
                  </select>
                </div>

                {/* Season */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Temporada
                  </div>
                  <select
                    value={ventasFilters?.temporada || 'all'}
                    onChange={e => updateFilter('temporada', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#1F1F1F',
                      background: '#F8F6F3',
                      border: '1px solid #E7E2DC',
                      fontFamily: 'var(--font)',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="all">Todas las temporadas</option>
                    <option value="primavera">Primavera</option>
                    <option value="verano">Verano</option>
                    <option value="otono">Otoño</option>
                    <option value="invierno">Invierno</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interface switcher */}
        <div ref={comboRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setComboOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#1F1F1F',
              background: '#F8F6F3',
              border: '1px solid #E7E2DC',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDE8E2'}
            onMouseLeave={e => e.currentTarget.style.background = '#F8F6F3'}
          >
            <Monitor size={14} color="#6B6B6B" />
            {activeInterface.label}
            <ChevronDown
              size={13}
              color="#6B6B6B"
              style={{ transition: 'transform 0.15s', transform: comboOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {comboOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#FFFFFF',
              border: '1px solid #E7E2DC',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              minWidth: 160,
              overflow: 'hidden',
              zIndex: 30,
            }}>
              <div style={{
                padding: '8px 14px 6px',
                fontSize: 11,
                color: '#6B6B6B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                borderBottom: '1px solid #F0EDE8',
              }}>
                Mis interfaces
              </div>

              {interfaces.map((iface, i) => {
                const isActive = currentInterface === iface.id;
                const isLast = i === interfaces.length - 1;
                return (
                  <button
                    key={iface.id}
                    onClick={() => {
                      if (iface.available) { onInterfaceChange?.(iface.id); setComboOpen(false); }
                    }}
                    disabled={!iface.available}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: !iface.available ? '#BBBBBB' : isActive ? '#111111' : '#1F1F1F',
                      background: isActive ? '#F8F6F3' : '#FFFFFF',
                      border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid #F0EDE8',
                      cursor: iface.available ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font)',
                    }}
                    onMouseEnter={e => { if (iface.available && !isActive) e.currentTarget.style.background = '#F8F6F3'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <span>{iface.label}</span>
                    {!iface.available && (
                      <span style={{ fontSize: 10, color: '#AAAAAA', background: '#F5F5F5', borderRadius: 10, padding: '2px 7px', fontWeight: 500 }}>
                        Próximamente
                      </span>
                    )}
                    {isActive && iface.available && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#111111', display: 'inline-block' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={onProfileOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .1s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8F6F3'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <UserCircle size={24} color="#6B6B6B" />
        </button>
      </div>
    </nav>
  );
}
