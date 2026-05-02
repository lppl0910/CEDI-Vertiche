import { useState } from 'react';
import FilterDropdown from '../ui/FilterDropdown';

const TIENDAS = ['Lindavista', 'Tepito', 'Perisur', 'Satélite', 'Tlalnepantla'];

export default function Sidebar({ temporalidad, onTemporalidad, fechaInicio, onFechaInicio, fechaFin, onFechaFin }) {
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busquedaOrden, setBusquedaOrden] = useState('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('');

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: '#F8F6F3',
      borderRight: '1px solid #E7E2DC',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div>
        <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 500 }}>
          Filtrar por
        </div>
        <FilterDropdown
          label="Selecciona filtro"
          value={filtroTipo}
          onChange={setFiltroTipo}
          options={[
            { value: 'orden',  label: 'Por número de orden' },
            { value: 'tienda', label: 'Por tienda destino' },
          ]}
        />
      </div>

      {filtroTipo === 'orden' && (
        <div>
          <input
            type="text"
            placeholder="Buscar orden..."
            value={busquedaOrden}
            onChange={e => setBusquedaOrden(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid #E7E2DC',
              borderRadius: 8, fontSize: 13, fontFamily: 'var(--font)',
              background: '#FFFFFF', color: '#1F1F1F',
            }}
          />
          {busquedaOrden && (
            <div style={{ marginTop: 8, background: '#FFFFFF', border: '1px solid #E7E2DC', borderRadius: 8, overflow: 'hidden' }}>
              {['ORD-2891', 'ORD-2892', 'ORD-2893']
                .filter(o => o.includes(busquedaOrden.toUpperCase()))
                .map(o => (
                  <div key={o} style={{ padding: '8px 12px', fontSize: 13, color: '#1F1F1F', borderBottom: '1px solid #F0EDE8', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8F6F3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    {o}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {filtroTipo === 'tienda' && (
        <div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 8 }}>Tiendas</div>
          {TIENDAS.map(t => (
            <button
              key={t}
              onClick={() => setTiendaSeleccionada(t === tiendaSeleccionada ? '' : t)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', marginBottom: 4, borderRadius: 8,
                fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                background: t === tiendaSeleccionada ? '#111111' : '#FFFFFF',
                color: t === tiendaSeleccionada ? '#FFFFFF' : '#1F1F1F',
                border: '1px solid #E7E2DC',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Temporalidad */}
      <div>
        <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 500 }}>
          Temporalidad
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {['min', 'hora', 'día'].map(t => (
            <button
              key={t}
              onClick={() => onTemporalidad(t)}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: temporalidad === t ? '#111111' : '#FFFFFF',
                color: temporalidad === t ? '#FFFFFF' : '#6B6B6B',
                border: '1px solid #E7E2DC', fontFamily: 'var(--font)', fontWeight: 500,
                transition: 'all 0.1s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => onFechaInicio(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', background: '#FFFFFF' }}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={e => onFechaFin(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', background: '#FFFFFF' }}
          />
        </div>
      </div>
    </aside>
  );
}
