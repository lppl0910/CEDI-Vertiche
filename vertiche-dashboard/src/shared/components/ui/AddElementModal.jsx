import { useState } from 'react';
import { X } from 'lucide-react';

const DATOS_OPCIONES = [
  'Prepacks procesados', '% Rechazo QA', '% Fallo Sorter',
  'Tiempo promedio carga', 'Tiempo promedio descarga', 'Fill rate',
  'Exactitud de recepción', 'Backlog operativo', 'Incidencias por proveedor',
  'Top SKUs', 'Auditoría por excepción',
];

const GRAFICAS = [
  { id: 'line',  label: 'Líneas',           desc: 'Tendencias en el tiempo' },
  { id: 'bar-v', label: 'Barras verticales', desc: 'Comparativos por periodo' },
  { id: 'bar-h', label: 'Barras horiz.',     desc: 'Rankings' },
  { id: 'donut', label: 'Donut',             desc: 'Distribución proporcional' },
];

export default function AddElementModal({ onClose, onAdd }) {
  const [tipo, setTipo] = useState('chart');
  const [dato, setDato] = useState('');
  const [grafica, setGrafica] = useState('line');
  const [usaTemporalidad, setUsaTemporalidad] = useState(false);
  const [temporalidad, setTemporalidad] = useState('hora');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleAdd = () => {
    if (!dato) return;
    onAdd({
      tipo,
      grafica: tipo === 'chart' ? grafica : null,
      dato,
      temporalidad: usaTemporalidad ? temporalidad : null,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 16, padding: 32, width: 480,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1F1F1F' }}>Añadir elemento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#6B6B6B" />
          </button>
        </div>

        {/* Paso 1: Tipo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 500 }}>
            1. Tipo de elemento
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ id: 'chart', emoji: '📊', label: 'Gráfica' }, { id: 'kpi', emoji: '🔢', label: 'KPI Card' }].map(t => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                style={{
                  flex: 1, padding: '16px 12px', borderRadius: 10, cursor: 'pointer',
                  border: tipo === t.id ? '2px solid #111111' : '1px solid #E7E2DC',
                  background: tipo === t.id ? '#F8F6F3' : '#FFFFFF',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font)',
                }}
              >
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1F1F1F' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paso 2: Datos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 500 }}>
            2. Datos a mostrar
          </div>
          <select
            value={dato}
            onChange={e => setDato(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #E7E2DC', fontSize: 13, color: dato ? '#1F1F1F' : '#6B6B6B',
              background: '#FFFFFF', fontFamily: 'var(--font)', cursor: 'pointer',
            }}
          >
            <option value="">Selecciona dato a mostrar</option>
            {DATOS_OPCIONES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Paso 3: Tipo de gráfica (solo si chart) */}
        {tipo === 'chart' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 500 }}>
              3. Tipo de gráfica
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {GRAFICAS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGrafica(g.id)}
                  style={{
                    padding: '12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: grafica === g.id ? '2px solid #111111' : '1px solid #E7E2DC',
                    background: grafica === g.id ? '#F8F6F3' : '#FFFFFF',
                    fontFamily: 'var(--font)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1F1F1F' }}>{g.label}</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 4: Temporalidad */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 500 }}>
            4. Temporalidad
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={usaTemporalidad}
              onChange={e => setUsaTemporalidad(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: '#1F1F1F' }}>Este widget tiene temporalidad propia</span>
          </label>
          {usaTemporalidad && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['min', 'hora', 'día'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTemporalidad(t)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                      background: temporalidad === t ? '#111111' : '#F8F6F3',
                      color: temporalidad === t ? '#FFFFFF' : '#6B6B6B',
                      border: 'none', fontFamily: 'var(--font)', fontWeight: 500,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font)' }}
                />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!dato}
            style={{ padding: '12px 24px', opacity: dato ? 1 : 0.5, cursor: dato ? 'pointer' : 'not-allowed' }}
          >
            Añadir widget
          </button>
        </div>
      </div>
    </div>
  );
}
