// ============================================================
//  TESTS UNITARIOS – Lógica de negocio del Modelo
//  Usa el test runner NATIVO de Node.js (v18+).
//  Sin dependencias externas. Sin npm install.
//
//  Ejecutar: node --test tests_modelo.js
// ============================================ddd================

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

