import { useState, useEffect } from 'react';
import FilterDropdown from '../../../shared/components/ui/FilterDropdown';

const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const ETAPA_IDX = Object.fromEntries(ETAPAS.map((e, i) => [e, i]));

const ETAPA_OPTIONS = [
  { value: '', label: 'Todas' },
  ...ETAPAS.map(e => ({ value: e, label: e })),
];

function maxEtapaIdx(orden) {
  if (!orden.prepacks || orden.prepacks.length === 0) return -1;
  return Math.max(...orden.prepacks.map(pp => ETAPA_IDX[pp.currentEtapa] ?? -1));
}

function applyFilters(ordenes, sort, etapaFilter) {
  let res = [...ordenes];

  if (etapaFilter) {
    res = res.filter(o => o.prepacks?.some(pp => pp.currentEtapa === etapaFilter));
  }

  if (sort === 'llegada') {
    res.sort((a, b) => a.orderId.localeCompare(b.orderId));
  } else if (sort === 'avanzada') {
    res.sort((a, b) => maxEtapaIdx(b) - maxEtapaIdx(a));
  }

  return res;
}

const selStyle = {
  height: 36, padding: '0 26px 0 12px', border: '1px solid #E7E2DC',
  borderRadius: 8, fontSize: 13, fontFamily: 'var(--font)', color: '#1F1F1F',
  background: '#FFFFFF', cursor: 'pointer', outline: 'none', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' fill='%236B6B6B'%3E%3Cpath d='M0 0l4.5 5L9 0z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};

export default function OrdenesFilterBar({ ordenes, onChange }) {
  const [sort,        setSort]        = useState('llegada');
  const [etapaFilter, setEtapaFilter] = useState('');

  useEffect(() => {
    onChange(applyFilters(ordenes, sort, etapaFilter));
  }, [ordenes, sort, etapaFilter]);

  const handleSort = (value) => setSort(value);
  const handleEtapa = (value) => setEtapaFilter(value);

  return (
    <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Ordenar:</span>
      <select style={selStyle} value={sort} onChange={e => handleSort(e.target.value)}>
        <option value="llegada">Hora de llegada</option>
        <option value="avanzada">Mas avanzada primero</option>
      </select>
      <div style={{ width: 1, height: 18, background: '#E7E2DC', margin: '0 2px' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Etapa:</span>
      <div style={{ width: 180 }}>
        <FilterDropdown
          label="Todas"
          options={ETAPA_OPTIONS}
          value={etapaFilter}
          onChange={handleEtapa}
        />
      </div>
    </div>
  );
}
