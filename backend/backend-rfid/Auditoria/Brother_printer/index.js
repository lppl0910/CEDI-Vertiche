import readline from 'readline';

import { iniciarProceso }
from './jobs/job-manager.js';

// ====================
// START
// ====================

console.log('');
console.log('Sistema RFID iniciado');
console.log('ENTER = imprimir etiqueta');
console.log('CTRL + C = salir');
console.log('');

// ====================
// READLINE
// ====================
const rl = readline.createInterface({

    input: process.stdin,

    output: process.stdout
});

// ====================
// ENTER EVENT
// ====================
rl.on('line', () => {

    console.log('Validando caja...');

    iniciarProceso();
});