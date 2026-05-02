import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = await readFile(new URL('./Dashboard.jsx', import.meta.url), 'utf8');

test('dashboard defines stage subroutes in the requested order', () => {
  const expected = [
    '/dashboard/preregistro',
    '/dashboard/qa',
    '/dashboard/registro',
    '/dashboard/sorter',
    '/dashboard/bahias',
    '/dashboard/auditoria',
    '/dashboard/envio',
  ];

  let lastIndex = -1;
  for (const route of expected) {
    const index = source.indexOf(`path: '${route}'`);
    assert.notEqual(index, -1, `${route} is missing`);
    assert.ok(index > lastIndex, `${route} is out of order`);
    lastIndex = index;
  }
});

test('dashboard keeps team performance only in preregistro, QA and registro', () => {
  assert.match(source, /teamPerformanceStages\s*=\s*\[\s*'preregistro',\s*'qa',\s*'registro'\s*\]/);
});

test('dashboard includes stage-specific operational metrics', () => {
  for (const text of [
    'Ordenes recibidas',
    'Aceptacion QA',
    'Fallas a bahia incorrecta',
    'Ocupacion por carril',
    'Aceptacion auditoria',
    'Paquetes enviados',
  ]) {
    assert.match(source, new RegExp(text));
  }
});

test('dashboard shows pp/min as the primary KPI for every flow stage', () => {
  const stageBlocks = source.match(/primaryKpi: \{ label: 'pp\/min'/g) || [];
  assert.equal(stageBlocks.length, 7);
});

test('dashboard keeps operational KPIs below the pp/min indicator', () => {
  assert.match(source, /primaryKpi/);
  assert.match(source, /secondaryKpis/);
});

test('dashboard includes requested KPI label changes', () => {
  assert.match(source, /% paquetes recibidos/);
  assert.match(source, /% ocupacion general/);
});
