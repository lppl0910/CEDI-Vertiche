import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = await readFile(new URL('./FlowTable.jsx', import.meta.url), 'utf8');

test('flow table renders pp/min as the primary indicator for every stage', () => {
  assert.match(source, /function StageKpi/);
  assert.match(source, /<StageKpi[\s\S]*?secondary=/);

  for (const stage of ['prepack', 'qa', 'registro', 'sorter', 'bahias', 'auditoria', 'envio']) {
    assert.match(source, new RegExp(`c\\.key === '${stage}'[\\s\\S]*?<StageKpi`));
  }
});

test('flow table keeps requested operational indicators below pp/min', () => {
  for (const text of [
    '% paquetes recibidos',
    '% aceptación QA',
    '% aceptación auditoría',
    '% ocupación general',
    'falla',
  ]) {
    assert.match(source, new RegExp(text));
  }
});
