import assert from 'node:assert/strict';
import test from 'node:test';

import { buildUsage, parseArguments, resolveMarkitdownCommand } from './markitdown.mjs';

test('parseArguments requires an input file', () => {
  assert.throws(
    () => parseArguments([]),
    /Uso: npm run markitdown -- <archivo-o-url>/,
  );
});

test('parseArguments passes input and output arguments through to MarkItDown', () => {
  assert.deepEqual(parseArguments(['input.pdf', '-o', 'output.md']), [
    'input.pdf',
    '-o',
    'output.md',
  ]);
});

test('resolveMarkitdownCommand prefers the project virtualenv executable', () => {
  const cwd = '/repo';
  const command = resolveMarkitdownCommand({
    cwd,
    env: { PATH: '/usr/bin' },
    platform: 'darwin',
    exists: path => path === '/repo/.venv/bin/markitdown',
  });

  assert.deepEqual(command, {
    command: '/repo/.venv/bin/markitdown',
    args: [],
  });
});

test('resolveMarkitdownCommand falls back to PATH when no project virtualenv exists', () => {
  const command = resolveMarkitdownCommand({
    cwd: '/repo',
    env: { PATH: '/opt/bin:/usr/bin' },
    platform: 'darwin',
    exists: path => path === '/opt/bin/markitdown',
  });

  assert.deepEqual(command, {
    command: '/opt/bin/markitdown',
    args: [],
  });
});

test('resolveMarkitdownCommand falls back to python module execution', () => {
  const command = resolveMarkitdownCommand({
    cwd: '/repo',
    env: { PATH: '/usr/bin' },
    platform: 'darwin',
    exists: path => path === '/usr/bin/python3',
  });

  assert.deepEqual(command, {
    command: '/usr/bin/python3',
    args: ['-m', 'markitdown'],
  });
});

test('buildUsage documents setup and conversion commands', () => {
  const usage = buildUsage();

  assert.match(usage, /npm run setup:markitdown/);
  assert.match(usage, /npm run markitdown -- archivo\.pdf -o archivo\.md/);
});
