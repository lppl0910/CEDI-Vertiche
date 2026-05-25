import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import GEO_DATA from '../../data/mexicoGeo.json';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

/**
 * Métricas disponibles para el selector de vista del mapa.
 * Cada entrada define la clave del campo en los datos del API,
 * la etiqueta del botón y el formateador para el tooltip.
 * @type {Array<{ key: string, label: string, fmt: (v: number) => string }>}
 */
const METRICS = [
  { key: 'ingresos', label: 'Ingresos ($K)', fmt: v => `$${v}K` },
  { key: 'ticket',   label: 'Ticket Prom.',  fmt: v => `$${v.toLocaleString('es-MX')}` },
  { key: 'unidades', label: 'Unidades',      fmt: v => v.toLocaleString('es-MX') },
];

/**
 * Color máximo de la escala de gradiente según la zona activa.
 * El color mínimo es siempre beige #F0EDE9 (equivale a "sin actividad").
 * Norte usa negro; Sur usa taupe; 'all' usa verde — para diferenciación visual por zona.
 * @type {{ Norte: string, Sur: string, all: string }}
 */
const ZONE_COLOR = { Norte: '#111111', Sur: '#A48F7A', all: '#6E8B6B' };

/**
 * Mapa de calor de ventas por estado de la república mexicana, renderizado con D3.
 *
 * Arquitectura D3 dentro de React:
 *   - useRef controla el elemento SVG nativo (D3 lo manipula directamente)
 *   - El useEffect ejecuta toda la lógica D3; el tooltip es estado de React
 *     para que las variables CSS del sistema de diseño se apliquen correctamente
 *
 * El mapa se redibuja completamente (svg.selectAll('*').remove()) en cada cambio
 * de datos, métrica o zona — esto es intencional para garantizar que la escala
 * de color se recalcule con los nuevos valores máximos.
 *
 * Proyección: Mercator con fitSize — centra y escala automáticamente el GeoJSON
 * al viewport del SVG sin necesidad de calcular coordenadas manualmente.
 *
 * @param {Object} props
 * @param {Array<{
 *   estado: string,
 *   region: 'Norte' | 'Sur',
 *   ingresos: number,
 *   ticket: number,
 *   unidades: number
 * }>} [props.data=[]]
 *   Estados con métricas. Los estados ausentes se colorean en gris (#E8E4DF).
 *   El campo `estado` debe coincidir con la propiedad `nom_edo` de mexicoGeo.json.
 * @param {'Norte'|'Sur'|'all'} [props.zona='all'] - Controla el color máximo del gradiente
 */
export function MapaCalorMexico({ data = [], zona = 'all' }) {
  const svgRef                = useRef(null);
  const [metric, setMetric]   = useState('ingresos');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width  = svgRef.current.clientWidth || 560;
    const height = 320;

    // Índice por nombre de estado para lookup O(1) al colorear features del GeoJSON.
    // La clave debe coincidir exactamente con `nom_edo` del archivo mexicoGeo.json.
    const dataMap = {};
    data.forEach(d => { dataMap[d.estado] = d; });

    // Los valores 0 o negativos se filtran para que una tienda sin ventas
    // no distorsione el máximo de la escala de color.
    const values = data.map(d => d[metric]).filter(v => v > 0);
    const maxVal = values.length > 0 ? Math.max(...values) : 1;

    // Escala D3: interpola de beige (#F0EDE9 = sin actividad) al color de zona (máxima actividad).
    const colorScale = d3.scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolate('#F0EDE9', ZONE_COLOR[zona] || ZONE_COLOR.all));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const projection = d3.geoMercator().fitSize([width, height], GEO_DATA);
    const path       = d3.geoPath().projection(projection);

    svg.selectAll('path')
      .data(GEO_DATA.features)
      .join('path')
      .attr('d', path)
      .attr('fill', feature => {
        const nombre = feature.properties.nom_edo;
        const d      = dataMap[nombre];
        // Estado sin tiendas en la zona activa → gris suave
        if (!d) return '#E8E4DF';
        return colorScale(d[metric] || 0);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', feature => (dataMap[feature.properties.nom_edo] ? 'pointer' : 'default'))
      .on('mousemove', (event, feature) => {
        const nombre = feature.properties.nom_edo;
        const d      = dataMap[nombre];
        if (!d) { setTooltip(null); return; }
        const m = METRICS.find(m => m.key === metric);
        setTooltip({
          x:      event.offsetX,
          y:      event.offsetY,
          estado: nombre,
          region: d.region,
          value:  m.fmt(d[metric]),
          label:  m.label,
        });
      })
      .on('mouseleave', () => setTooltip(null));

  }, [data, metric, zona]);

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <ChartTitle
          title="Ventas por Estado"
          sub="Mapa de calor — hover para detalle"
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              style={{
                fontSize:     9,
                padding:      '2px 7px',
                borderRadius: 4,
                cursor:       'pointer',
                background:   metric === m.key ? 'var(--accent-black)' : 'transparent',
                color:        metric === m.key ? '#fff' : 'var(--text-secondary)',
                border:       '1px solid var(--border)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          height={320}
          style={{ display: 'block' }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position:      'absolute',
            left:          tooltip.x + 12,
            top:           tooltip.y - 10,
            background:    'var(--card)',
            border:        '1px solid var(--border)',
            borderRadius:  6,
            padding:       '6px 10px',
            fontSize:      11,
            pointerEvents: 'none',
            boxShadow:     '0 2px 8px rgba(0,0,0,0.12)',
            zIndex:        10,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.estado}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{tooltip.region}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{tooltip.label}: </span>
              <span style={{ fontWeight: 600 }}>{tooltip.value}</span>
            </div>
          </div>
        )}

        {/* Leyenda gradiente */}
        <div style={{
          position:   'absolute',
          bottom:     8,
          right:      8,
          fontSize:   9,
          color:      'var(--text-secondary)',
          display:    'flex',
          alignItems: 'center',
          gap:        4,
        }}>
          <span>Menor</span>
          <div style={{
            width:        60,
            height:       8,
            borderRadius: 4,
            background:   `linear-gradient(to right, #F0EDE9, ${ZONE_COLOR[zona] || ZONE_COLOR.all})`,
            border:       '1px solid var(--border)',
          }} />
          <span>Mayor</span>
        </div>
      </div>
    </Card>
  );
}
