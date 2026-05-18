// ============================================================
//  TESTS UNITARIOS – Lógica de negocio del Modelo
//  Usa el test runner NATIVO de Node.js (v18+).
//  Sin dependencias externas. Sin npm install.
//
//  Ejecutar: node --test tests_modelo.js
// ============================================================

const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const {
  ColaTurnos,
  EstrategiaFIFO,
  EstrategiaPrioridad,
  EstrategiaCategoria,
} = require("./modelo");

// Resetea el Singleton antes de cada test para garantizar aislamiento
beforeEach(() => ColaTurnos.reset());

// ══════════════════════════════════════════════════════════
//  TEST 1 – Singleton
// ══════════════════════════════════════════════════════════

describe("Singleton · ColaTurnos", () => {

  test("getInstance() siempre devuelve el mismo objeto", () => {
    const a = ColaTurnos.getInstance();
    const b = ColaTurnos.getInstance();
    assert.strictEqual(a, b, "Deben ser la misma referencia en memoria");
  });

  test("estado es compartido entre referencias", () => {
    const a = ColaTurnos.getInstance();
    const b = ColaTurnos.getInstance();
    a.agregarTurno("Ana", "A", 2);
    assert.strictEqual(b.cantidadEnEspera(), 1, "b debe ver el turno agregado por a");
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 2 – Agregar turnos
// ══════════════════════════════════════════════════════════

describe("agregarTurno()", () => {

  test("crea el turno con los campos correctos", () => {
    const cola = ColaTurnos.getInstance();
    const t = cola.agregarTurno("Carlos", "B", 1);

    assert.strictEqual(t.nombre,    "Carlos");
    assert.strictEqual(t.categoria, "B");
    assert.strictEqual(t.prioridad, 1);
    assert.strictEqual(t.estado,    "esperando");
    assert.strictEqual(cola.cantidadEnEspera(), 1);
  });

  test("lanza error si el nombre está vacío", () => {
    const cola = ColaTurnos.getInstance();
    assert.throws(
      () => cola.agregarTurno("", "A", 2),
      /vacío/,
      "Debe lanzar error por nombre vacío"
    );
  });

  test("lanza error si la prioridad es inválida", () => {
    const cola = ColaTurnos.getInstance();
    assert.throws(
      () => cola.agregarTurno("Luis", "A", 99),
      /prioridad/,
      "Debe lanzar error por prioridad fuera de rango"
    );
  });

  test("lanza error si la categoría es inválida", () => {
    const cola = ColaTurnos.getInstance();
    assert.throws(
      () => cola.agregarTurno("Marta", "Z", 2),
      /categoría/,
      "Debe lanzar error por categoría no permitida"
    );
  });

  test("los números de turno son incrementales", () => {
    const cola = ColaTurnos.getInstance();
    const t1 = cola.agregarTurno("A", "A", 2);
    const t2 = cola.agregarTurno("B", "A", 2);
    const t3 = cola.agregarTurno("C", "A", 2);
    assert.strictEqual(t1.numero, 1);
    assert.strictEqual(t2.numero, 2);
    assert.strictEqual(t3.numero, 3);
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 3 – Estrategia FIFO
// ══════════════════════════════════════════════════════════

describe("EstrategiaFIFO", () => {

  test("atiende en orden exacto de llegada", () => {
    const cola = ColaTurnos.getInstance();
    cola.cambiarEstrategia(new EstrategiaFIFO());

    cola.agregarTurno("Primero", "A", 3);
    cola.agregarTurno("Segundo", "A", 1); // alta prioridad pero llegó después
    cola.agregarTurno("Tercero", "A", 2);

    assert.strictEqual(cola.atenderSiguiente().nombre, "Primero");
    assert.strictEqual(cola.atenderSiguiente().nombre, "Segundo");
    assert.strictEqual(cola.atenderSiguiente().nombre, "Tercero");
  });

  test("devuelve null si la cola está vacía", () => {
    const cola = ColaTurnos.getInstance();
    assert.strictEqual(cola.atenderSiguiente(), null);
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 4 – Estrategia Prioridad
// ══════════════════════════════════════════════════════════

describe("EstrategiaPrioridad", () => {

  test("atiende el de mayor prioridad primero", () => {
    const cola = ColaTurnos.getInstance();
    cola.cambiarEstrategia(new EstrategiaPrioridad());

    cola.agregarTurno("Baja",  "A", 3);
    cola.agregarTurno("Media", "A", 2);
    cola.agregarTurno("Alta",  "A", 1);

    assert.strictEqual(cola.atenderSiguiente().nombre, "Alta");
    assert.strictEqual(cola.atenderSiguiente().nombre, "Media");
    assert.strictEqual(cola.atenderSiguiente().nombre, "Baja");
  });

  test("desempate por orden de llegada (número de turno menor)", () => {
    const cola = ColaTurnos.getInstance();
    cola.cambiarEstrategia(new EstrategiaPrioridad());

    const t1 = cola.agregarTurno("Primero", "A", 2);
    const t2 = cola.agregarTurno("Segundo", "A", 2);

    const atendido = cola.atenderSiguiente();
    assert.strictEqual(atendido.numero, t1.numero, "Debe ganar el que llegó primero");
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 5 – Estrategia Categoría
// ══════════════════════════════════════════════════════════

describe("EstrategiaCategoria", () => {

  test("respeta el orden A → B → C", () => {
    const cola = ColaTurnos.getInstance();
    cola.cambiarEstrategia(new EstrategiaCategoria());

    cola.agregarTurno("Cat-C", "C", 2);
    cola.agregarTurno("Cat-A", "A", 2);
    cola.agregarTurno("Cat-B", "B", 2);

    assert.strictEqual(cola.atenderSiguiente().categoria, "A");
    assert.strictEqual(cola.atenderSiguiente().categoria, "B");
    assert.strictEqual(cola.atenderSiguiente().categoria, "C");
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 6 – Cancelar turno
// ══════════════════════════════════════════════════════════

describe("cancelarTurno()", () => {

  test("elimina un turno existente y devuelve true", () => {
    const cola = ColaTurnos.getInstance();
    const t = cola.agregarTurno("Pedro", "A", 2);

    assert.strictEqual(cola.cancelarTurno(t.numero), true);
    assert.strictEqual(cola.cantidadEnEspera(), 0);
  });

  test("devuelve false si el número no existe", () => {
    const cola = ColaTurnos.getInstance();
    assert.strictEqual(cola.cancelarTurno(999), false);
  });

  test("no afecta a los demás turnos", () => {
    const cola = ColaTurnos.getInstance();
    const t1 = cola.agregarTurno("Ana",  "A", 2);
    const t2 = cola.agregarTurno("Luis", "A", 2);
    const t3 = cola.agregarTurno("Eva",  "A", 2);

    cola.cancelarTurno(t2.numero);

    const numeros = cola.turnosEnEspera().map((t) => t.numero);
    assert.ok(numeros.includes(t1.numero), "t1 debe seguir en la cola");
    assert.ok(!numeros.includes(t2.numero), "t2 debe haberse eliminado");
    assert.ok(numeros.includes(t3.numero), "t3 debe seguir en la cola");
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 7 – Estado del turno tras ser atendido
// ══════════════════════════════════════════════════════════

describe("atenderSiguiente() · estado del turno", () => {

  test("el turno atendido tiene estado='atendido' y horaAtencion", () => {
    const cola = ColaTurnos.getInstance();
    cola.agregarTurno("Roberto", "B", 2);

    const t = cola.atenderSiguiente();
    assert.strictEqual(t.estado, "atendido");
    assert.ok(t.horaAtencion, "Debe registrar la hora de atención");
  });

  test("el turno pasa del espera al historial de atendidos", () => {
    const cola = ColaTurnos.getInstance();
    cola.agregarTurno("Sofía", "A", 1);
    cola.atenderSiguiente();

    assert.strictEqual(cola.totalAtendidos(),      1);
    assert.strictEqual(cola.cantidadEnEspera(),    0);
  });

});

// ══════════════════════════════════════════════════════════
//  TEST 8 – Cambio de estrategia en caliente
// ══════════════════════════════════════════════════════════

describe("cambiarEstrategia()", () => {

  test("lanza TypeError si no es una EstrategiaAtencion", () => {
    const cola = ColaTurnos.getInstance();
    assert.throws(
      () => cola.cambiarEstrategia("fifo"),
      TypeError,
      "Un string no es una estrategia válida"
    );
  });

  test("cambio en caliente respeta la nueva estrategia para el siguiente turno", () => {
    const cola = ColaTurnos.getInstance();
    cola.cambiarEstrategia(new EstrategiaFIFO());

    cola.agregarTurno("Baja", "A", 3);
    cola.agregarTurno("Alta", "A", 1);

    // Cambiamos a Prioridad ANTES de atender
    cola.cambiarEstrategia(new EstrategiaPrioridad());

    // Debe atender "Alta" aunque llegó segundo
    assert.strictEqual(cola.atenderSiguiente().nombre, "Alta");
  });

});
