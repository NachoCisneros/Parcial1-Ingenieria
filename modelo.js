// ============================================================
//  MODELO – Lógica de negocio y datos
//  Sistema de Gestión de Turnos
//  Patrones: Singleton (ColaTurnos) + Strategy (algoritmos)
// ============================================================

// ─────────────────────────────────────────────────────────────
//  PATRÓN STRATEGY – Algoritmos de atención
// ─────────────────────────────────────────────────────────────

/**
 * Clase base abstracta para todas las estrategias.
 * Toda estrategia concreta DEBE implementar seleccionarSiguiente() y nombre().
 */
class EstrategiaAtencion {
  seleccionarSiguiente(turnos) {
    throw new Error("seleccionarSiguiente() debe implementarse en la subclase.");
  }
  nombre() {
    throw new Error("nombre() debe implementarse en la subclase.");
  }
}

/** Primero en llegar, primero en ser atendido. */
class EstrategiaFIFO extends EstrategiaAtencion {
  seleccionarSiguiente(turnos) {
    return turnos.length > 0 ? turnos[0] : null;
  }
  nombre() {
    return "FIFO (Orden de llegada)";
  }
}

/**
 * Atiende el turno con mayor prioridad (1 = alta, 2 = media, 3 = baja).
 * En caso de empate respeta el orden de llegada (número de turno menor).
 */
class EstrategiaPrioridad extends EstrategiaAtencion {
  seleccionarSiguiente(turnos) {
    if (turnos.length === 0) return null;
    return turnos.reduce((mejor, t) => {
      if (t.prioridad < mejor.prioridad) return t;
      if (t.prioridad === mejor.prioridad && t.numero < mejor.numero) return t;
      return mejor;
    });
  }
  nombre() {
    return "Por Prioridad (1=Alta, 2=Media, 3=Baja)";
  }
}

/**
 * Atiende de forma ordenada por categoría: A → B → C → D.
 * Evita que una categoría acapare toda la atención.
 */
class EstrategiaCategoria extends EstrategiaAtencion {
  static ORDEN = ["A", "B", "C", "D"];

  seleccionarSiguiente(turnos) {
    if (turnos.length === 0) return null;
    for (const cat of EstrategiaCategoria.ORDEN) {
      const encontrado = turnos.find((t) => t.categoria === cat);
      if (encontrado) return encontrado;
    }
    return turnos[0];
  }
  nombre() {
    return "Por Categoría (A → B → C → D)";
  }
}

// ─────────────────────────────────────────────────────────────
//  PATRÓN SINGLETON – Cola única del sistema
// ─────────────────────────────────────────────────────────────

/**
 * Cola central de turnos.
 * Garantiza UNA sola instancia en toda la aplicación.
 *
 * Uso:
 *   const cola = ColaTurnos.getInstance();
 */
class ColaTurnos {
  /** @type {ColaTurnos|null} */
  static #instancia = null;

  // Constructor privado (por convención; JS no tiene private constructors)
  constructor() {
    if (ColaTurnos.#instancia) {
      return ColaTurnos.#instancia; // devuelve la instancia existente
    }
    this._turnosEspera = [];
    this._turnosAtendidos = [];
    this._contador = 0;
    this._estrategia = new EstrategiaFIFO();
    ColaTurnos.#instancia = this;
  }

  /** Punto de acceso global a la instancia única. */
  static getInstance() {
    if (!ColaTurnos.#instancia) {
      new ColaTurnos();
    }
    return ColaTurnos.#instancia;
  }

  /** Destruye la instancia (útil para aislar tests). */
  static reset() {
    ColaTurnos.#instancia = null;
  }

  // ── Gestión de la estrategia ──────────────────────────────

  cambiarEstrategia(estrategia) {
    if (!(estrategia instanceof EstrategiaAtencion)) {
      throw new TypeError("La estrategia debe ser una instancia de EstrategiaAtencion.");
    }
    this._estrategia = estrategia;
  }

  estrategiaActual() {
    return this._estrategia.nombre();
  }

  // ── Operaciones de negocio ────────────────────────────────

  /**
   * Crea y encola un nuevo turno.
   * @returns {object} el turno creado
   */
  agregarTurno(nombre, categoria = "A", prioridad = 2) {
    if (!nombre || !nombre.trim()) {
      throw new Error("El nombre del cliente no puede estar vacío.");
    }
    if (![1, 2, 3].includes(Number(prioridad))) {
      throw new Error("La prioridad debe ser 1 (alta), 2 (media) o 3 (baja).");
    }
    const cat = categoria.toUpperCase();
    if (!["A", "B", "C", "D"].includes(cat)) {
      throw new Error("La categoría debe ser A, B, C o D.");
    }

    this._contador += 1;
    const ahora = new Date();
    const hora = ahora.toTimeString().slice(0, 8);

    const turno = {
      numero: this._contador,
      nombre: nombre.trim(),
      categoria: cat,
      prioridad: Number(prioridad),
      horaIngreso: hora,
      estado: "esperando",
    };

    this._turnosEspera.push(turno);
    return turno;
  }

  /**
   * Atiende el siguiente turno según la estrategia activa.
   * @returns {object|null} turno atendido, o null si la cola está vacía
   */
  atenderSiguiente() {
    const turno = this._estrategia.seleccionarSiguiente(this._turnosEspera);
    if (!turno) return null;

    this._turnosEspera = this._turnosEspera.filter((t) => t !== turno);
    turno.estado = "atendido";
    turno.horaAtencion = new Date().toTimeString().slice(0, 8);
    this._turnosAtendidos.push(turno);
    return turno;
  }

  /**
   * Cancela un turno en espera por número.
   * @returns {boolean} true si se eliminó, false si no existía
   */
  cancelarTurno(numero) {
    const idx = this._turnosEspera.findIndex((t) => t.numero === Number(numero));
    if (idx === -1) return false;
    this._turnosEspera.splice(idx, 1);
    return true;
  }

  // ── Consultas ─────────────────────────────────────────────

  turnosEnEspera() { return [...this._turnosEspera]; }
  turnosAtendidos() { return [...this._turnosAtendidos]; }
  cantidadEnEspera() { return this._turnosEspera.length; }
  totalAtendidos() { return this._turnosAtendidos.length; }
}

// Exportamos todo para que los otros módulos puedan importar
module.exports = {
  ColaTurnos,
  EstrategiaAtencion,
  EstrategiaFIFO,
  EstrategiaPrioridad,
  EstrategiaCategoria,
};
