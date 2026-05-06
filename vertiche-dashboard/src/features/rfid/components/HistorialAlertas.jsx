import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function HistorialAlertas({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <div style={{ padding: '2rem', color: '#6B6B6B', textAlign: 'center' }}>
        No hay alertas registradas en el historial.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--font)' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertCircle size={24} color="#111111" />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#111111' }}>
          Historial de Alertas
        </h2>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E7E2DC', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', textAlign: 'left', color: '#6B6B6B' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>ID Prepack</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Orden</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Etapa</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Descripción</th>

              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((alerta) => (
              <tr key={alerta.id} style={{ borderBottom: '1px solid #F0EDE8' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1F1F1F' }}>{alerta.ppId}</td>
                <td style={{ padding: '12px 16px', color: '#6B6B6B' }}>{alerta.orderId}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#F0EDE8', padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#1F1F1F' }}>
                    {alerta.stage}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#1F1F1F', maxWidth: 300 }}>{alerta.desc}</td>

                <td style={{ padding: '12px 16px', color: '#6B6B6B', fontSize: 12 }}>
                  {alerta.ts ? new Date(alerta.ts).toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
