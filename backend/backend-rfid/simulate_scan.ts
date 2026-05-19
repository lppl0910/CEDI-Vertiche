const BASE_URL = 'http://localhost:3001';

const STAGES = [
  '',            // antes de llegar al CEDI
  'Preregistro',
  'QA',
  'Registro',
  'Sorter',
  'Bahias',
  'Auditoria',
  'Envio',
];

// Mapa de prepackId → etapa actual (estado en memoria)
const prepackStageMap: Record<string, string> = {};

// Mapa de orderId → lista de prepackIds
const orderPrepackMap: Record<string, string[]> = {};

// Set de prepacks que ya terminaron (llegaron a Envio)
const finishedPrepacks = new Set<string>();

// ─── Utilidades ──────────────────────────────────────────────────────────────

function getNextStage(currentStage: string): string | null {
  const idx = STAGES.indexOf(currentStage);
  if (idx === -1 || idx === STAGES.length - 1) return null; // ya está en Envio
  return STAGES[idx + 1];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Fetch inicial de datos ───────────────────────────────────────────────────

async function loadOrders() {
  const res = await fetch(`${BASE_URL}/api/ordenes`);
  const orders: any[] = await res.json();

  for (const order of orders) {
    const orderId = order.orderId;
    orderPrepackMap[orderId] = [];

    for (const prepack of order.prepacks) {
      prepackStageMap[prepack.id] = prepack.currentEtapa;
      orderPrepackMap[orderId].push(prepack.id);
    }
  }

  const totalPrepacks = Object.keys(prepackStageMap).length;
  const totalOrders = Object.keys(orderPrepackMap).length;
  console.log(`✅ Cargadas ${totalOrders} órdenes con ${totalPrepacks} prepacks en total`);
}

// ─── Enviar un scan individual ────────────────────────────────────────────────

async function sendScan(tagId: string, stage: string, readerId = 'SIM-01') {
  const res = await fetch(`${BASE_URL}/api/rfid/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, readerId, etapa: stage }),
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (data.success) {
      prepackStageMap[tagId] = stage; // actualiza estado local
      if (stage === 'Envio') finishedPrepacks.add(tagId);
      return true;
    }
  } catch {
    console.error(`❌ Respuesta inesperada para ${tagId}:`, text);
  }
  return false;
}

// ─── Lógica de scan por lote en Auditoría ────────────────────────────────────

async function sendAuditoriaBatch(orderId: string) {
  // Todos los prepacks de esta orden que están en Bahias (listos para Auditoria)
  const batchPrepacks = orderPrepackMap[orderId].filter(
    (id) => prepackStageMap[id] === 'Bahias' && !finishedPrepacks.has(id)
  );

  if (batchPrepacks.length === 0) return;

  console.log(
    `\n📦 [LOTE AUDITORIA] Orden ${orderId} → ${batchPrepacks.length} prepacks simultáneos`
  );

  // Manda todos los scans al mismo tiempo
  await Promise.all(
    batchPrepacks.map((id) => sendScan(id, 'Auditoria', 'ARCO-AUDITORIA'))
  );

  console.log(
    `   ✓ ${batchPrepacks.map((id) => id).join(', ')} → Auditoria`
  );
}

// ─── Tick principal ───────────────────────────────────────────────────────────

async function tick() {
  const activeOrders = Object.keys(orderPrepackMap).filter((orderId) =>
    orderPrepackMap[orderId].some((id) => !finishedPrepacks.has(id))
  );

  if (activeOrders.length === 0) {
    console.log('\n🎉 Todos los prepacks llegaron a Envio. Simulación terminada.');
    process.exit(0);
  }

  // Elige orden y prepack random
  const orderId = pickRandom(activeOrders);
  const activePrepacks = orderPrepackMap[orderId].filter(
    (id) => !finishedPrepacks.has(id)
  );
  const tagId = pickRandom(activePrepacks);

  const currentStage = prepackStageMap[tagId];
  const nextStage = getNextStage(currentStage);

  if (!nextStage) {
    finishedPrepacks.add(tagId);
    return;
  }

  // Si el siguiente paso es Auditoria → lote completo de la orden
  if (nextStage === 'Auditoria') {
    await sendAuditoriaBatch(orderId);
    return;
  }

  // Scan individual normal
  const ok = await sendScan(tagId, nextStage);
  if (ok) {
    console.log(`📡 ${tagId}  →  ${currentStage} ➜ ${nextStage}`);
  }
}

// ─── Arranque ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando simulador RFID...\n');
  await loadOrders();

  console.log('\n⏱  Enviando scans cada 3 segundos...\n');
  await tick(); // primer tick inmediato
  setInterval(tick, 3_000);
}

main().catch(console.error);