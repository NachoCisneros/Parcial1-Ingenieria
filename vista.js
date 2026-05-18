// ============================================================
//  VISTA – Interfaz de usuario por consola
//  Responsabilidad: mostrar información y capturar entradas.
//  NO contiene lógica de negocio.
// ============================================================

const readline = require("readline");

// Colores ANSI para la terminal
const C = {
  reset:  "\x1b[0m",
  cyan:   "\x1b[36m",
  yellow: "\x1b[33m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
};

class Vista {
  constructor() {
    // Interfaz de readline (modo interactivo)
    this._rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  // ── Encabezados ──────────────────────────────────────────

  mostrarBienvenida() {
    console.log(C.cyan + C.bold + `
╔══════════════════════════════════════════╗
║      SISTEMA DE GESTIÓN DE TURNOS        ║
║         Patrón MVC · Node.js             ║
╚══════════════════════════════════════════╝` + C.reset);
  }

  mostrarMenu() {
    console.log(C.yellow + `
┌──────────────────────────────────────────┐
│                  MENÚ                    │
├──────────────────────────────────────────┤
│  1. Nuevo turno                          │
│  2. Atender siguiente                    │
│  3. Ver cola de espera                   │
│  4. Ver turnos atendidos                 │
│  5. Cancelar turno                       │
│  6. Cambiar estrategia de atención       │
│  0. Salir                                │
└──────────────────────────────────────────┘` + C.reset);
  }

  
  
  // ── Mensajes ─────────────────────────────────────────────

  mostrarTurnoCreado(turno) {
    console.log(C.green + `\n✔  Turno #${String(turno.numero).padStart(3, "0")} registrado` + C.reset);
    console.log(`   Cliente   : ${turno.nombre}`);
    console.log(`   Categoría : ${turno.categoria}  |  Prioridad : ${turno.prioridad}`);
    console.log(`   Hora      : ${turno.horaIngreso}`);
  }

  mostrarTurnoAtendido(turno) {
    console.log(C.green + `\n✔  Atendiendo turno #${String(turno.numero).padStart(3, "0")}` + C.reset);
    console.log(`   Cliente   : ${turno.nombre}`);
    console.log(`   Categoría : ${turno.categoria}  |  Prioridad : ${turno.prioridad}`);
    console.log(`   Hora      : ${turno.horaAtencion}`);
  }

  mostrarCola(turnos, estrategia) {
    console.log(C.cyan + `\n── Cola en espera  (${turnos.length} turnos) ──────────────` + C.reset);
    console.log(`   Estrategia activa: ${estrategia}`);
    if (turnos.length === 0) {
      console.log("   (sin turnos en espera)");
      return;
    }
    console.log(`   ${"#".padEnd(5)} ${"Cliente".padEnd(20)} ${"Cat".padEnd(5)} ${"Prio".padEnd(5)} Ingreso`);
    console.log("   " + "─".repeat(46));
    for (const t of turnos) {
      console.log(
        `   ${String(t.numero).padEnd(5)} ${t.nombre.padEnd(20)} ${t.categoria.padEnd(5)} ${t.prioridad.toString().padEnd(5)} ${t.horaIngreso}`
      );
    }
  }

  mostrarAtendidos(turnos) {
    console.log(C.cyan + `\n── Turnos atendidos (${turnos.length}) ──────────────────` + C.reset);
    if (turnos.length === 0) {
      console.log("   (ninguno aún)");
      return;
    }
    console.log(`   ${"#".padEnd(5)} ${"Cliente".padEnd(20)} ${"Cat".padEnd(5)} Atendido a`);
    console.log("   " + "─".repeat(42));
    for (const t of turnos) {
      console.log(
        `   ${String(t.numero).padEnd(5)} ${t.nombre.padEnd(20)} ${t.categoria.padEnd(5)} ${t.horaAtencion}`
      );
    }
  }

  mostrarEstrategias() {
    console.log(C.yellow + `
   Estrategias disponibles:
     1. FIFO       – orden de llegada
     2. Prioridad  – 1=Alta, 2=Media, 3=Baja
     3. Categoría  – A antes que B, B antes que C…` + C.reset);
  }

  mostrarEstrategiaCambiada(nombre) {
    console.log(C.green + `\n✔  Estrategia cambiada a: ${nombre}` + C.reset);
  }

  mostrarColaVacia() {
    console.log(C.yellow + "\n⚠  No hay turnos en espera." + C.reset);
  }

  mostrarCancelacionOk(numero) {
    console.log(C.green + `\n✔  Turno #${String(numero).padStart(3, "0")} cancelado.` + C.reset);
  }

  mostrarCancelacionError(numero) {
    console.log(C.red + `\n✘  Turno #${String(numero).padStart(3, "0")} no encontrado en la cola.` + C.reset);
  }

  mostrarError(msg) {
    console.log(C.red + `\n✘  Error: ${msg}` + C.reset);
  }

  // ── Entrada del usuario (async/await con Promise) ─────────

  preguntar(prompt) {
    return new Promise((resolve) => {
      this._rl.question(prompt, (respuesta) => resolve(respuesta.trim()));
    });
  }

  cerrar() {
    this._rl.close();
  }
}

module.exports = { Vista };
