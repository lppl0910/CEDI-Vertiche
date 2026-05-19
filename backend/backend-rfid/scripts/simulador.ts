/**
 * Simulador de lecturas RFID — día completo acelerado con eventos aleatorios (#185)
 * Isaac Calderon Laflor
 *
 * USO: npm run simulate
 * (el servidor backend debe estar corriendo en localhost:3001)
 *
 * Cada corrida es distinta:
 *  · Órdenes avanzan a velocidades diferentes
 *  · Atascos en Sorter (prepacks quedan bloqueados varios ticks)
 *  · Retenciones en QA (revisión manual aleatoria)
 *  · Fallas de lectora (zona completa offline por un rato)
 *  · Lecturas RFID perdidas (misses individuales)
 */

const BASE_URL = 'http://localhost:3001';

// ─── Configuración ────────────────────────────────────────────────────────────
const INTERVALO_MS   = 400;   // ms entre ticks  (↓ = más rápido)
const SCANS_POR_TICK = 8;     // máx prepacks por tick (↑ = más rápido)

// Probabilidades de eventos (ajusta para más o menos caos)
const P_MISS_LECTURA   = 0.10; // % de prepacks ignorados por tick (RFID miss)
const P_ERROR_SORTER   = 0.07; // % al llegar a Sorter → bloqueado en origen
const P_RETENCION_QA   = 0.05; // % al salir de QA → revisión manual
const P_EVENTO_GLOBAL  = 0.018;// % por tick de que ocurra un evento masivo
// ─────────────────────────────────────────────────────────────────────────────

const ETAPAS = [
    'Preregistro', 'QA', 'Registro', 'Sorter',
    'Bahias', 'Auditoria', 'Envio',
] as const;

type Etapa = typeof ETAPAS[number];

interface PrepackInfo {
    id:           string;
    orderId:      string;
    currentEtapa: Etapa | '';
}

const READERS = [
    'READER-A1', 'READER-A2',  // zona A
    'READER-B1', 'READER-B2',  // zona B
    'READER-C1', 'READER-C2',  // zona C (Sorter)
    'READER-D1',               // zona D (Envío)
];

// ─── Estado interno del simulador ────────────────────────────────────────────

/** ppId → ticks restantes bloqueado */
const bloqueados = new Map<string, number>();

/** orderId → multiplicador de velocidad (0.3–1.0) */
const velocidadOrden = new Map<string, number>();

function getVelocidad(orderId: string): number {
    if (!velocidadOrden.has(orderId)) {
        // Cada orden tiene su propia velocidad aleatoria al inicio
        const v = 0.35 + Math.random() * 0.65;
        velocidadOrden.set(orderId, v);
    }
    return velocidadOrden.get(orderId)!;
}

function estaBloqueado(ppId: string): boolean {
    const rem = bloqueados.get(ppId) ?? 0;
    if (rem <= 1) { bloqueados.delete(ppId); return false; }
    bloqueados.set(ppId, rem - 1);
    return true;
}

function bloquear(ppId: string, ticks: number): void {
    bloqueados.set(ppId, ticks);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function siguienteEtapa(etapa: Etapa | string): Etapa | null {
    if (!etapa) return ETAPAS[0]!;
    const idx = ETAPAS.indexOf(etapa as Etapa);
    if (idx === -1 || idx === ETAPAS.length - 1) return null;
    return ETAPAS[idx + 1]!;
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
}

// ─── Eventos aleatorios masivos ───────────────────────────────────────────────

function dispararEvento(prepacks: PrepackInfo[]): void {
    const tipo = Math.random();

    if (tipo < 0.35) {
        // ── Atasco en Sorter ──────────────────────────────────────────────
        const enSorter = prepacks.filter(pp => pp.currentEtapa === 'Sorter');
        if (enSorter.length < 2) return;
        const count = Math.min(Math.floor(Math.random() * 8) + 3, enSorter.length);
        const ticks = Math.floor(Math.random() * 20) + 12;
        shuffle(enSorter).slice(0, count).forEach(pp => bloquear(pp.id, ticks));
        console.log(`\n  ┌─ EVENTO ─────────────────────────────────────────────`);
        console.log(`  │ ⚠  ATASCO SORTER — ${count} prepacks bloqueados ~${Math.round(ticks * INTERVALO_MS / 1000)}s`);
        console.log(`  └──────────────────────────────────────────────────────\n`);

    } else if (tipo < 0.60) {
        // ── Falla de lectora — zona completa offline ──────────────────────
        const zonas = ['READER-A', 'READER-B', 'READER-C'];
        const zonaAfectada = randomItem(zonas);
        const afectados = prepacks.filter(() => Math.random() < 0.4).slice(0, 12);
        const ticks = Math.floor(Math.random() * 18) + 8;
        afectados.forEach(pp => bloquear(pp.id, ticks));
        console.log(`\n  ┌─ EVENTO ─────────────────────────────────────────────`);
        console.log(`  │ 📡 LECTORA OFFLINE — ${zonaAfectada} | ${afectados.length} prepacks sin señal ~${Math.round(ticks * INTERVALO_MS / 1000)}s`);
        console.log(`  └──────────────────────────────────────────────────────\n`);

    } else if (tipo < 0.80) {
        // ── Retención masiva en QA ────────────────────────────────────────
        const enQA = prepacks.filter(pp => pp.currentEtapa === 'QA' || pp.currentEtapa === '');
        if (enQA.length < 2) return;
        const count = Math.min(Math.floor(Math.random() * 5) + 2, enQA.length);
        const ticks = Math.floor(Math.random() * 14) + 6;
        shuffle(enQA).slice(0, count).forEach(pp => bloquear(pp.id, ticks));
        console.log(`\n  ┌─ EVENTO ─────────────────────────────────────────────`);
        console.log(`  │ 🔍 RETENCIÓN QA — ${count} prepacks en revisión manual ~${Math.round(ticks * INTERVALO_MS / 1000)}s`);
        console.log(`  └──────────────────────────────────────────────────────\n`);

    } else {
        // ── Orden prioritaria — una orden random se acelera ───────────────
        const orderIds = [...new Set(prepacks.map(pp => pp.orderId))];
        if (orderIds.length === 0) return;
        const ordenElegida = randomItem(orderIds);
        velocidadOrden.set(ordenElegida, 1.0); // velocidad máxima
        console.log(`\n  ┌─ EVENTO ─────────────────────────────────────────────`);
        console.log(`  │ 🚀 PRIORIDAD — ${ordenElegida} marcada como urgente`);
        console.log(`  └──────────────────────────────────────────────────────\n`);
    }
}

// ─── Lógica de escaneo ────────────────────────────────────────────────────────

async function obtenerPrepacks(): Promise<PrepackInfo[]> {
    const res  = await fetch(`${BASE_URL}/api/ordenes`);
    const data = await res.json() as Array<{ orderId: string; prepacks: PrepackInfo[] }>;

    return data
        .flatMap(orden =>
            (orden.prepacks ?? []).map(pp => ({ ...pp, orderId: orden.orderId }))
        )
        .filter(pp => siguienteEtapa(pp.currentEtapa) !== null);
}

async function escanearPrepack(pp: PrepackInfo): Promise<boolean> {
    const siguiente = siguienteEtapa(pp.currentEtapa)!;

    // ── Error de Sorter: el prepack falla al entrar al sorter ────────────
    if (pp.currentEtapa === 'Registro' && Math.random() < P_ERROR_SORTER) {
        const ticks = Math.floor(Math.random() * 10) + 4;
        bloquear(pp.id, ticks);
        console.log(`  [SIM] ✗ ${pp.id.padEnd(18)} ${pp.orderId} | Error lectura Sorter → bloqueado ${Math.round(ticks * INTERVALO_MS / 1000)}s`);
        return false;
    }

    // ── Retención QA: el prepack no pasa inmediatamente ──────────────────
    if (pp.currentEtapa === 'Preregistro' && Math.random() < P_RETENCION_QA) {
        const ticks = Math.floor(Math.random() * 8) + 3;
        bloquear(pp.id, ticks);
        console.log(`  [SIM] ⏸ ${pp.id.padEnd(18)} ${pp.orderId} | Retención QA — revisión manual ${Math.round(ticks * INTERVALO_MS / 1000)}s`);
        return false;
    }

    const reader = randomItem(READERS);
    const res = await fetch(`${BASE_URL}/api/rfid/scan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tagId: pp.id, readerId: reader, etapa: siguiente }),
    });

    if (res.ok) {
        const origen = (pp.currentEtapa || '∅').padEnd(12);
        console.log(`  [SIM] ✓ ${pp.id.padEnd(18)} ${pp.orderId} | ${origen} → ${siguiente}`);
        return true;
    }
    return false;
}

// ─── Tick principal ───────────────────────────────────────────────────────────

let tickCount = 0;
let scanOk    = 0;
let scanErr   = 0;

async function tick(): Promise<void> {
    tickCount++;

    let prepacks: PrepackInfo[];
    try {
        prepacks = await obtenerPrepacks();
    } catch {
        console.warn('  [SIM] ⚠ Sin conexión al servidor — reintentando...');
        return;
    }

    if (prepacks.length === 0) {
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║  ✓ SIMULACIÓN COMPLETA — día terminado            ║');
        console.log(`║  Ticks: ${String(tickCount).padEnd(6)} Scans OK: ${String(scanOk).padEnd(6)} Errores: ${scanErr}    ║`);
        console.log('╚══════════════════════════════════════════════════╝\n');
        clearInterval(intervalo);
        return;
    }

    // Evento global aleatorio
    if (Math.random() < P_EVENTO_GLOBAL) {
        dispararEvento(prepacks);
    }

    // Filtrar bloqueados y aplicar velocidad por orden
    const candidatos = prepacks
        .filter(pp => !estaBloqueado(pp.id))
        .filter(pp => Math.random() < getVelocidad(pp.orderId))
        .filter(() => Math.random() > P_MISS_LECTURA); // RFID miss individual

    const seleccionados = shuffle(candidatos).slice(0, SCANS_POR_TICK);

    const resultados = await Promise.all(seleccionados.map(pp => escanearPrepack(pp).catch(() => false)));
    scanOk  += resultados.filter(Boolean).length;
    scanErr += resultados.filter(r => !r).length;

    // Resumen cada 30 ticks
    if (tickCount % 30 === 0) {
        const bloq = bloqueados.size;
        console.log(`\n  ── Tick ${String(tickCount).padStart(4)} | Pendientes: ${String(prepacks.length).padStart(4)} | Bloqueados: ${String(bloq).padStart(3)} | OK: ${scanOk} / Err: ${scanErr}\n`);
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const vel = Math.round(1000 / INTERVALO_MS * SCANS_POR_TICK);
console.log('╔══════════════════════════════════════════════════╗');
console.log('║  Simulador RFID — Día completo acelerado         ║');
console.log(`║  Velocidad: ~${vel} scans/seg | Cada corrida es distinta  ║`);
console.log('║                                                  ║');
console.log('║  Eventos posibles:                               ║');
console.log('║   ⚠  Atasco en Sorter     🔍 Retención QA        ║');
console.log('║   📡 Lectora offline      🚀 Orden prioritaria    ║');
console.log('║   ✗  Error lectura RFID   ⏸  Revisión manual      ║');
console.log('║                                                  ║');
console.log('║  Ctrl+C para detener                             ║');
console.log('╚══════════════════════════════════════════════════╝\n');

tick();
const intervalo = setInterval(tick, INTERVALO_MS);
