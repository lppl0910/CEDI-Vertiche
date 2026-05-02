import { constants, existsSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

export function buildUsage() {
  return [
    'Uso: npm run markitdown -- <archivo-o-url> [opciones]',
    '',
    'Instalacion inicial:',
    '  npm run setup:markitdown',
    '',
    'Ejemplos:',
    '  npm run markitdown -- archivo.pdf -o archivo.md',
    '  npm run markitdown -- archivo.docx > archivo.md',
    '  npm run markitdown -- https://www.youtube.com/watch?v=VIDEO -o video.md',
  ].join('\n');
}

export function parseArguments(args) {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    throw new Error(buildUsage());
  }

  return args;
}

function executableNames(name, platform) {
  return platform === 'win32' ? [`${name}.exe`, `${name}.cmd`, name] : [name];
}

function findOnPath(name, env, platform, exists) {
  const pathValue = env.PATH || '';
  const dirs = pathValue.split(delimiter).filter(Boolean);

  for (const dir of dirs) {
    for (const executable of executableNames(name, platform)) {
      const candidate = join(dir, executable);
      if (exists(candidate)) return candidate;
    }
  }

  return null;
}

export function resolveMarkitdownCommand({
  cwd = process.cwd(),
  env = process.env,
  platform = process.platform,
  exists = existsSync,
} = {}) {
  const projectExecutable = platform === 'win32'
    ? join(cwd, '.venv', 'Scripts', 'markitdown.exe')
    : join(cwd, '.venv', 'bin', 'markitdown');

  if (exists(projectExecutable)) {
    return { command: projectExecutable, args: [] };
  }

  const pathExecutable = findOnPath('markitdown', env, platform, exists);
  if (pathExecutable) {
    return { command: pathExecutable, args: [] };
  }

  const pythonExecutable = findOnPath('python3', env, platform, exists)
    || findOnPath('python', env, platform, exists);

  if (pythonExecutable) {
    return { command: pythonExecutable, args: ['-m', 'markitdown'] };
  }

  throw new Error([
    'No encontre MarkItDown ni Python.',
    'Ejecuta primero: npm run setup:markitdown',
  ].join('\n'));
}

async function assertExecutable(command) {
  await access(command, constants.X_OK);
}

async function main() {
  let args;
  try {
    args = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = process.argv.slice(2).length === 0 ? 1 : 0;
    return;
  }

  const resolved = resolveMarkitdownCommand();
  await assertExecutable(resolved.command);

  const child = spawn(resolved.command, [...resolved.args, ...args], {
    stdio: 'inherit',
  });

  child.on('exit', code => {
    process.exitCode = code ?? 1;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
