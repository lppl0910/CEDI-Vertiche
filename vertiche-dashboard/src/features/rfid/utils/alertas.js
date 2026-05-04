export const SLA_POR_ETAPA = {
  Preregistro: 10,
  QA: 15,
  Registro: 10,
  Sorter: 5,
  Bahias: 20,
  Auditoria: 12,
  Envio: 8,
};

// Returns 'success' | 'warning' | 'error'
export function clasificarAlerta(etapa, timestampEntrada) {
  if (!timestampEntrada || !SLA_POR_ETAPA[etapa]) return 'success';
  const elapsedMin = (Date.now() - new Date(timestampEntrada).getTime()) / 60000;
  const sla = SLA_POR_ETAPA[etapa];
  if (elapsedMin >= sla)       return 'error';
  if (elapsedMin >= sla * 0.7) return 'warning';
  return 'success';
}

// Returns prepacks where time in current etapa > SLA
export function detectarPrepacksDetenidos(prepacks) {
  return prepacks.filter(pp => {
    const sla = SLA_POR_ETAPA[pp.currentEtapa];
    if (!sla) return false;
    const eventos = pp.historial ?? [];
    const etapaEvents = eventos
      .filter(e => e.etapa === pp.currentEtapa)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (etapaEvents.length === 0) return false;
    const elapsedMin = (Date.now() - new Date(etapaEvents[0].timestamp).getTime()) / 60000;
    return elapsedMin > sla;
  });
}
