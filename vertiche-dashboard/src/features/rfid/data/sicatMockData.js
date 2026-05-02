export const STAGE_KEYS   = ['prereg','qa','reg','sorter','bahias','audit','envio'];
export const STAGE_LABELS = ['PREREGISTRO','QA','REGISTRO','SORTER','BAHÍAS','AUDITORÍA','ENVÍO'];
export const SLA_MINS     = { prereg:20, qa:25, reg:20, sorter:35, bahias:30, audit:20, envio:15 };
export const BAHIA_STORES = ['T-02','T-03','T-05','T-06','T-08','T-09','T-12','T-14','T-15','T-17'];

const PRODUCTS  = ['Pantalones Mezclilla','Camisetas Básicas','Chamarras Invierno','Vestidos Verano','Shorts Casual','Faldas Plisadas','Suéteres Tejido'];
const COLORLIST = ['Rojo','Verde','Azul','Amarillo','Negro','Blanco','Gris','Marino'];
const SIZELIST  = ['XS','S','M','L','XL'];

function mkS(proc, total, startMin, durMin, status, extra = {}) {
  return { proc, total, startMin, durMin, status, ...extra };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function pad(n) { return String(n).padStart(2, '0'); }

export function fmtTs(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function fmtMin(m) {
  if (m === null || m === undefined) return '';
  if (m < 60) return m + 'min';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'min';
}

export function stageColor(s) {
  if (!s || s.status === 'pending') return 'gray';
  if (s.status === 'falla') return 'red';
  if (s.status === 'done')  return 'green';
  return 'amber';
}

export function stagePctStr(s) {
  if (!s || s.status === 'pending') return '—';
  if (s.status === 'done')  return (s.total > 0 ? Math.round(s.proc / s.total * 100) : 100) + '%';
  if (s.status === 'falla') return (s.total > 0 ? Math.round(s.proc / s.total * 100) : 0) + '%';
  return s.total > 0 ? Math.round(s.proc / s.total * 100) + '%' : '—';
}

export function stageCountStr(s) {
  if (!s || s.status === 'pending') return '';
  return `${s.proc}/${s.total} pp`;
}

export function stageTimeStr(o, key) {
  const s = o[key];
  if (!s || s.status === 'pending') return '—';
  const startTs = o.arrivalTs + s.startMin * 60000;
  if (s.status === 'done' || s.status === 'falla') {
    const endTs = startTs + (s.durMin || 0) * 60000;
    return fmtTs(startTs) + ' → ' + fmtTs(endTs);
  }
  return fmtTs(startTs) + ' → ···';
}

export function stageElapsedMin(o, key) {
  const s = o[key];
  if (!s || s.status === 'pending') return null;
  if (s.status === 'done' || s.status === 'falla') return s.durMin;
  const startTs = o.arrivalTs + s.startMin * 60000;
  return Math.max(0, Math.round((Date.now() - startTs) / 60000));
}

export function slaCls(el, key) {
  if (el === null) return 'none';
  const lim = SLA_MINS[key] || 20;
  if (el > lim)         return 'over';
  if (el > lim * 0.75)  return 'warn';
  return 'ok';
}

export function orderAdvance(o) {
  return STAGE_KEYS.filter(k => o[k] && (o[k].status === 'done' || o[k].status === 'falla')).length;
}

export function orderAlertCls(o) {
  if (o.hasFalla) return 'red';
  for (const k of STAGE_KEYS) {
    const s = o[k];
    if (s && s.status === 'active') {
      const el = stageElapsedMin(o, k);
      if (el !== null && el > (SLA_MINS[k] || 20)) return 'yellow';
    }
  }
  return '';
}

export function timeAgo(ts) {
  const d = Math.round((Date.now() - ts) / 60000);
  if (d < 1)  return 'ahora mismo';
  if (d < 60) return 'hace ' + d + 'min';
  const h = Math.floor(d / 60);
  const m = d % 60;
  return 'hace ' + h + 'h' + (m > 0 ? ' ' + m + 'min' : '');
}

export function fallaDescStr(o, k, s) {
  if (k === 'sorter') return s.fallaDesc || `${s.fallaCount || 1} prepack(s) desviado(s)`;
  if (k === 'reg')    return s.fallaDesc || 'Error en sistema de registro';
  if (k === 'qa')     return `Alta tasa de rechazo — ${s.rej || 0} rechazados (${o.id})`;
  return `Incidencia en ${k.toUpperCase()} — ${o.id}`;
}

function computeStageResult(o, k, i) {
  const s = o[k];
  if (!s || s.status === 'pending') return 'pend';
  if (k === 'prereg') return i < s.proc ? 'ok' : 'pend';
  if (k === 'qa') {
    const rejFrom = s.total - (s.rej || 0);
    return i >= rejFrom ? 'fail' : (i < s.proc ? 'ok' : 'pend');
  }
  if (k === 'sorter') {
    const fallaFrom = s.total - (s.fallaCount || 0);
    if (s.status === 'falla' && i >= fallaFrom) return 'fail';
    return i < s.proc ? 'ok' : (s.status === 'active' ? 'act' : 'pend');
  }
  if (k === 'envio') return s.sent ? 'ok' : 'pend';
  if (s.status === 'active') return i < s.proc ? 'ok' : 'act';
  if (s.status === 'done')   return i < s.proc ? 'ok' : 'pend';
  if (s.status === 'falla')  return i < s.proc ? 'ok' : 'fail';
  return 'pend';
}

function enrichOrder(o) {
  const product   = PRODUCTS[o.pidx % PRODUCTS.length];
  const colors    = shuffle(COLORLIST).slice(0, 3 + (o.pidx % 3));
  const sizes     = shuffle(SIZELIST).slice(0, 2 + (o.pidx % 3));
  const totalPP   = o.prereg.total;

  const prepacks = Array.from({ length: totalPP }, (_, i) => {
    const bahiaIdx   = Math.min(9, Math.floor(i / Math.max(1, totalPP / 5)));
    return {
      id:           'PP-' + String(i + 1).padStart(3, '0'),
      color:        colors[i % colors.length],
      size:         sizes[i % sizes.length],
      store:        BAHIA_STORES[bahiaIdx],
      bahiaIdx,
      stageResults: STAGE_KEYS.map(k => computeStageResult(o, k, i)),
    };
  });

  return { ...o, product, colors, sizes, prepacks, expanded: false, hexpanded: false };
}

export function buildOrders() {
  const now = Date.now();
  const ago = m => now - m * 60000;

  return [
    { id:'ORD-2891', team:'Alpha', pidx:0, arrivalTs:ago(72), hasFalla:true,
      prereg: mkS(50,50,  0,18,'done'),
      qa:     mkS(49,50, 20,22,'done',{rej:1}),
      reg:    mkS(49,50, 44,15,'done'),
      sorter: mkS(48,49, 61,23,'falla',{fallaCount:1, fallaDesc:'1 prepack desviado — error lectura RFID en cinta 2'}),
      bahias: mkS(48,49, 86,18,'done',{dist:[12,10,8,14,4,0,0,0,0,0]}),
      audit:  mkS(48,49,106,16,'done'),
      envio:  mkS(48,49,124,10,'done',{sent:true}),
    },
    { id:'ORD-2892', team:'Beta', pidx:1, arrivalTs:ago(54), hasFalla:true,
      prereg: mkS(44,44,  0,19,'done'),
      qa:     mkS(42,44, 21,24,'done',{rej:2}),
      reg:    mkS(42,44, 47,16,'done'),
      sorter: mkS(34,42, 65,null,'falla',{fallaCount:8, fallaDesc:'8 prepacks desviados — revisar cinta 3, posible atasco'}),
      bahias: mkS( 0,34,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,34,  0,null,'pending'),
      envio:  mkS( 0,34,  0,null,'pending',{sent:false}),
    },
    { id:'ORD-2893', team:'Delta', pidx:2, arrivalTs:ago(39), hasFalla:false,
      prereg: mkS(52,52,  0,16,'done'),
      qa:     mkS(52,52, 18,19,'done',{rej:0}),
      reg:    mkS(52,52, 39,14,'done'),
      sorter: mkS(46,52, 55,null,'active',{fallaCount:0, fallaDesc:''}),
      bahias: mkS( 0,52,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,52,  0,null,'pending'),
      envio:  mkS( 0,52,  0,null,'pending',{sent:false}),
    },
    { id:'ORD-2894', team:'Gamma', pidx:3, arrivalTs:ago(26), hasFalla:true,
      prereg: mkS(40,40,  0,14,'done'),
      qa:     mkS(35,40, 16,17,'done',{rej:5}),
      reg:    mkS(20,35, 35,null,'falla',{fallaDesc:'Scanner B3 offline — registro incompleto'}),
      sorter: mkS( 0,20,  0,null,'pending',{fallaCount:0, fallaDesc:''}),
      bahias: mkS( 0,20,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,20,  0,null,'pending'),
      envio:  mkS( 0,20,  0,null,'pending',{sent:false}),
    },
    { id:'ORD-2895', team:'Alpha', pidx:4, arrivalTs:ago(19), hasFalla:false,
      prereg: mkS(60,60,  0,17,'done'),
      qa:     mkS(42,60, 19,null,'active',{rej:0}),
      reg:    mkS( 0,60,  0,null,'pending'),
      sorter: mkS( 0,60,  0,null,'pending',{fallaCount:0, fallaDesc:''}),
      bahias: mkS( 0,60,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,60,  0,null,'pending'),
      envio:  mkS( 0,60,  0,null,'pending',{sent:false}),
    },
    { id:'ORD-2896', team:'Beta', pidx:5, arrivalTs:ago(11), hasFalla:false,
      prereg: mkS(22,45,  0,null,'active'),
      qa:     mkS( 0,45,  0,null,'pending',{rej:0}),
      reg:    mkS( 0,45,  0,null,'pending'),
      sorter: mkS( 0,45,  0,null,'pending',{fallaCount:0, fallaDesc:''}),
      bahias: mkS( 0,45,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,45,  0,null,'pending'),
      envio:  mkS( 0,45,  0,null,'pending',{sent:false}),
    },
    { id:'ORD-2897', team:'Delta', pidx:6, arrivalTs:ago(5), hasFalla:false,
      prereg: mkS( 5,35,  0,null,'active'),
      qa:     mkS( 0,35,  0,null,'pending',{rej:0}),
      reg:    mkS( 0,35,  0,null,'pending'),
      sorter: mkS( 0,35,  0,null,'pending',{fallaCount:0, fallaDesc:''}),
      bahias: mkS( 0,35,  0,null,'pending',{dist:[0,0,0,0,0,0,0,0,0,0]}),
      audit:  mkS( 0,35,  0,null,'pending'),
      envio:  mkS( 0,35,  0,null,'pending',{sent:false}),
    },
  ].map(enrichOrder);
}

export function buildHistorical() {
  const now = Date.now();
  const agoH = h => now - h * 3600000;

  return [
    { id:'ORD-2888', team:'Alpha', pidx:0, arrivalTs:agoH(2.5), hasFalla:false,
      prereg: mkS(48,48,  0,17,'done'),
      qa:     mkS(48,48, 19,21,'done',{rej:0}),
      reg:    mkS(48,48, 42,14,'done'),
      sorter: mkS(48,48, 58,22,'done',{fallaCount:0, fallaDesc:''}),
      bahias: mkS(48,48, 82,16,'done',{dist:[14,12,10,8,4,0,0,0,0,0]}),
      audit:  mkS(48,48,100,14,'done'),
      envio:  mkS(48,48,116,10,'done',{sent:true}),
    },
    { id:'ORD-2887', team:'Beta', pidx:1, arrivalTs:agoH(3.8), hasFalla:true,
      prereg: mkS(55,55,  0,19,'done'),
      qa:     mkS(53,55, 21,23,'done',{rej:2}),
      reg:    mkS(53,55, 46,15,'done'),
      sorter: mkS(51,53, 63,28,'falla',{fallaCount:3, fallaDesc:'3 prepacks desviados — lectora RFID 4'}),
      bahias: mkS(51,53, 93,17,'done',{dist:[16,12,8,10,5,0,0,0,0,0]}),
      audit:  mkS(51,53,112,15,'done'),
      envio:  mkS(51,53,129,11,'done',{sent:true}),
    },
    { id:'ORD-2885', team:'Delta', pidx:2, arrivalTs:agoH(5.2), hasFalla:false,
      prereg: mkS(62,62,  0,20,'done'),
      qa:     mkS(62,62, 22,24,'done',{rej:0}),
      reg:    mkS(62,62, 48,16,'done'),
      sorter: mkS(62,62, 66,26,'done',{fallaCount:0, fallaDesc:''}),
      bahias: mkS(62,62, 94,18,'done',{dist:[18,14,12,10,8,0,0,0,0,0]}),
      audit:  mkS(62,62,114,16,'done'),
      envio:  mkS(62,62,132,12,'done',{sent:true}),
    },
    { id:'ORD-2884', team:'Gamma', pidx:3, arrivalTs:agoH(6.5), hasFalla:true,
      prereg: mkS(38,38,  0,15,'done'),
      qa:     mkS(34,38, 17,20,'done',{rej:4}),
      reg:    mkS(34,38, 39,18,'falla',{fallaDesc:'Scanner offline — intervención manual requerida'}),
      sorter: mkS(34,34, 59,24,'done',{fallaCount:0, fallaDesc:''}),
      bahias: mkS(34,34, 85,15,'done',{dist:[10,8,6,8,2,0,0,0,0,0]}),
      audit:  mkS(34,34,102,13,'done'),
      envio:  mkS(34,34,117, 9,'done',{sent:true}),
    },
    { id:'ORD-2882', team:'Alpha', pidx:4, arrivalTs:agoH(8.1), hasFalla:false,
      prereg: mkS(70,70,  0,22,'done'),
      qa:     mkS(70,70, 24,26,'done',{rej:0}),
      reg:    mkS(70,70, 52,18,'done'),
      sorter: mkS(70,70, 72,28,'done',{fallaCount:0, fallaDesc:''}),
      bahias: mkS(70,70,102,20,'done',{dist:[20,16,12,14,8,0,0,0,0,0]}),
      audit:  mkS(70,70,124,18,'done'),
      envio:  mkS(70,70,144,12,'done',{sent:true}),
    },
  ].map(enrichOrder);
}

export function initIncidencias(orders, historicalOrders) {
  const incidencias = [];
  [...orders, ...historicalOrders].forEach(o => {
    STAGE_KEYS.forEach(k => {
      const s = o[k];
      if (!s || s.status !== 'falla') return;
      incidencias.push({
        id:         'INC-' + String(incidencias.length + 1).padStart(3, '0'),
        orderId:    o.id,
        stage:      k,
        desc:       fallaDescStr(o, k, s),
        status:     (o.envio && o.envio.sent) ? 'resolved' : 'open',
        causa:      (o.envio && o.envio.sent) ? 'Procesada durante turno — causa documentada.' : '',
        ts:         o.arrivalTs + (s.startMin + (s.durMin || 10)) * 60000,
        resolvedAt: (o.envio && o.envio.sent) ? Date.now() - 3600000 : null,
      });
    });
  });
  return incidencias;
}

export function simulateStep(orders, incidencias) {
  const newOrders = orders.map(o => {
    if (o.envio.sent) return o;

    const newO = {
      ...o,
      prereg: { ...o.prereg },
      qa:     { ...o.qa },
      reg:    { ...o.reg },
      sorter: { ...o.sorter },
      bahias: { ...o.bahias },
      audit:  { ...o.audit },
      envio:  { ...o.envio },
    };

    STAGE_KEYS.forEach(k => {
      const s = newO[k];
      if (!s || s.status !== 'active') return;
      if (s.proc < s.total && Math.random() > 0.4) {
        s.proc = Math.min(s.total, s.proc + 1);
      }
      if (s.proc >= s.total) {
        const startTs = newO.arrivalTs + s.startMin * 60000;
        const el      = Math.max(1, Math.round((Date.now() - startTs) / 60000));
        s.status = 'done';
        s.durMin = el || SLA_MINS[k];
        const ni = STAGE_KEYS.indexOf(k) + 1;
        if (ni < STAGE_KEYS.length) {
          const nk = STAGE_KEYS[ni];
          if (newO[nk] && newO[nk].status === 'pending') {
            newO[nk] = { ...newO[nk], status:'active', proc:0, startMin: s.startMin + s.durMin, total: s.total };
          }
        }
      }
    });

    if (STAGE_KEYS.some(k => newO[k] && newO[k].status === 'falla')) newO.hasFalla = true;

    newO.prepacks = newO.prepacks.map((pp, i) => ({
      ...pp,
      stageResults: STAGE_KEYS.map(k => computeStageResult(newO, k, i)),
    }));

    return newO;
  });

  const newIncidencias = [...incidencias];
  newOrders.forEach(o => {
    STAGE_KEYS.forEach(k => {
      const s = o[k];
      if (s && s.status === 'falla' && !newIncidencias.find(i => i.orderId === o.id && i.stage === k)) {
        newIncidencias.push({
          id:         'INC-' + String(newIncidencias.length + 1).padStart(3, '0'),
          orderId:    o.id,
          stage:      k,
          desc:       fallaDescStr(o, k, s),
          status:     'open',
          causa:      '',
          ts:         Date.now(),
          resolvedAt: null,
        });
      }
    });
  });

  return { orders: newOrders, incidencias: newIncidencias };
}
