const BASE_URL = 'http://localhost:3001';

const STAGES = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

//Lista de pp vacia, se llenara con los datos de la orden de prueba
const PREPACKS: string[] = [];

async function fetchPrePacks() {
  const res = await fetch(`${BASE_URL}/api/ordenes/ORD-001/progreso`);
  const data = await res.json();
  console.log('Prepacks actuales:', data.totalPrepacks);
  data.prepacks.forEach((p: any) => PREPACKS.push(p.id));
}

let stageIndex = 0;
let prepackIndex = 0;

async function sendScan() {
  const tagId = PREPACKS[prepackIndex];
  const stage = STAGES[stageIndex];

  const res = await fetch(`${BASE_URL}/api/rfid/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagId, readerId: 'SIM-01', etapa: stage }),
  });

  const data = await res.json();
  console.log(`✓ ${tagId} → ${stage}`, data.success ? 'OK' : 'ERROR');

  stageIndex++;
}

fetchPrePacks().then(() => {
    console.log('Simulador iniciado, mandando scan cada 3s...');
    sendScan(); // primer scan inmediato
    setInterval(sendScan, 3_000);
});