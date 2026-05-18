// ============================================================
//  CONTROLADOR – Intermediario entre Modelo y Vista
//  Responsabilidad: recibir acciones del usuario, invocar el
//  modelo y delegar la presentación a la vista.
// ============================================================

const { ColaTurnos, EstrategiaFIFO, EstrategiaPrioridad, EstrategiaCategoria } = require("./modelo");
const { Vista } = require("./vista");

class Controlador {
  constructor() {
    this._cola  = ColaTurnos.getInstance(); // Singleton – siempre la misma instancia
    this._vista = new Vista();
  }

  // ── Casos de uso ─────────────────────────────────────────

  async nuevoTurno() {
    const nombre    = await this._vista.preguntar("   Nombre del cliente : ");
    const categoria = (await this._vista.preguntar("   Categoría (A/B/C/D) [A]: ")) || "A";
    const priRaw    = (await this._vista.preguntar("   Prioridad 1=Alta 2=Media 3=Baja [2]: ")) || "2";

    try {
      const turno = this._cola.agregarTurno(nombre, categoria, Number(priRaw));
      this._vista.mostrarTurnoCreado(turno);
    } catch (e) {
      this._vista.mostrarError(e.message);
    }
  }

  atenderSiguiente() {
    const turno = this._cola.atenderSiguiente();
    if (turno) {
      this._vista.mostrarTurnoAtendido(turno);
    } else {
      this._vista.mostrarColaVacia();
    }
  }

  verCola() {
    this._vista.mostrarCola(
      this._cola.turnosEnEspera(),
      this._cola.estrategiaActual()
    );
  }

  verAtendidos() {
    this._vista.mostrarAtendidos(this._cola.turnosAtendidos());
  }

  async cancelarTurno() {
    const raw = await this._vista.preguntar("   Número de turno a cancelar: ");
    const numero = parseInt(raw, 10);
    if (isNaN(numero)) {
      this._vista.mostrarError("Ingrese un número válido.");
      return;
    }
    if (this._cola.cancelarTurno(numero)) {
      this._vista.mostrarCancelacionOk(numero);
    } else {
      this._vista.mostrarCancelacionError(numero);
    }
  }

  async cambiarEstrategia() {
    this._vista.mostrarEstrategias();
    const opcion = await this._vista.preguntar("   Estrategia (1/2/3): ");
    const mapa = {
      "1": new EstrategiaFIFO(),
      "2": new EstrategiaPrioridad(),
      "3": new EstrategiaCategoria(),
    };
    const estrategia = mapa[opcion];
    if (estrategia) {
      this._cola.cambiarEstrategia(estrategia);
      this._vista.mostrarEstrategiaCambiada(estrategia.nombre());
    } else {
      this._vista.mostrarError("Opción de estrategia inválida.");
    }
  }

  // ── Bucle principal ───────────────────────────────────────

  async ejecutar() {
    this._vista.mostrarBienvenida();

    while (true) {
      this._vista.mostrarMenu();
      const opcion = await this._vista.preguntar("   Opción: ");

      switch (opcion) {
        case "1": await this.nuevoTurno();       break;
        case "2":      this.atenderSiguiente();  break;
        case "3":      this.verCola();           break;
        case "4":      this.verAtendidos();      break;
        case "5": await this.cancelarTurno();    break;
        case "6": await this.cambiarEstrategia(); break;
        case "0":
          console.log("\n¡Hasta luego!\n");
          this._vista.cerrar();
          process.exit(0);
        default:
          this._vista.mostrarError("Opción no válida.");
      }
    }
  }
}

// Punto de entrada
new Controlador().ejecutar();
