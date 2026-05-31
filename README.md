# TechFix - Sistema de Gestión de Turnos para Taller de Celulares

## Descripción

TechFix es una aplicación web desarrollada en JavaScript que permite registrar, organizar y gestionar turnos para un taller de reparación de celulares. El sistema permite registrar clientes, clasificar servicios, asignar niveles de urgencia y administrar la atención mediante diferentes estrategias de ordenamiento.

---

# Arquitectura MVC

El proyecto implementa el patrón de arquitectura **Modelo - Vista - Controlador (MVC)** para separar responsabilidades y facilitar el mantenimiento del código.

## Modelo (Model)

Representado principalmente por las clases:

* `ColaTurnos`
* `EstrategiaAtencion`
* `EstrategiaFIFO`
* `EstrategiaUrgencia`
* `EstrategiaServicio`

Responsabilidades:

* Gestionar los datos de los turnos.
* Aplicar las reglas de negocio.
* Mantener la cola de espera y el historial de atendidos.
* Determinar qué turno debe ser atendido según la estrategia seleccionada.

## Vista (View)

Representada por las funciones:

* `renderQueue()`
* `renderHist()`
* `renderStratBtns()`
* `render()`
* `toast()`

Responsabilidades:

* Mostrar información al usuario.
* Actualizar la interfaz gráfica.
* Reflejar los cambios producidos en el modelo.

## Controlador (Controller)

Representado por el objeto:

* `accion`

Responsabilidades:

* Recibir acciones del usuario.
* Comunicar la vista con el modelo.
* Coordinar la creación, cancelación y atención de turnos.

### Flujo MVC

1. El usuario realiza una acción en la interfaz.
2. El Controlador recibe el evento.
3. El Modelo procesa la lógica de negocio.
4. La Vista actualiza la información mostrada en pantalla.

---

# Patrones de Diseño Utilizados

## 1. MVC (Model - View - Controller)

### Problema que resuelve

Evita mezclar la lógica de negocio con la interfaz gráfica, facilitando el mantenimiento, las pruebas y la escalabilidad del sistema.

### Aplicación

* Modelo: gestión de turnos.
* Vista: renderizado de la interfaz.
* Controlador: manejo de eventos del usuario.

---

## 2. Singleton

### Clase

`ColaTurnos`

### Problema que resuelve

Garantiza que exista una única instancia de la cola de turnos durante toda la ejecución del programa.

### Implementación

```javascript
static #inst = null;

static getInstance(){
  return ColaTurnos.#inst ?? new ColaTurnos();
}
```

### Beneficio

Toda la aplicación trabaja sobre la misma cola de turnos, evitando inconsistencias en los datos.

---

## 3. Strategy

### Clases

* `EstrategiaFIFO`
* `EstrategiaUrgencia`
* `EstrategiaServicio`

### Problema que resuelve

Permite cambiar dinámicamente la forma en que se selecciona el siguiente turno sin modificar el código principal de la cola.

### Beneficio

El sistema puede alternar entre:

* Atención por orden de llegada.
* Atención por urgencia.
* Atención por tipo de servicio.

Cumpliendo el principio de abierto/cerrado (Open/Closed Principle).

---

# Instrucciones de Ejecución

## Requisitos

* Node.js instalado.
* Navegador web moderno.

## Ejecutar la aplicación

1. Clonar el repositorio:

```bash
git clone https://github.com/NachoCisneros/Parcial1-Ingenieria
```

2. Ingresar a la carpeta del proyecto:

```bash
cd Parcial1-Ingenieria
```

3. Abrir el archivo:

```bash
index.html
```

o utilizar la extensión **Live Server** de Visual Studio Code.

---

# Ejecución de Tests Unitarios

El proyecto incluye pruebas unitarias para verificar el correcto funcionamiento del modelo.

Instalar dependencias:

```bash
npm install
```

Ejecutar los tests:

```bash
npm test
```

o directamente:

```bash
node tests_modelo.js
```

---

# Funcionalidades

* Registro de turnos.
* Gestión de cola de espera.
* Historial de turnos atendidos.
* Priorización por urgencia.
* Priorización por tipo de servicio.
* Cancelación de turnos.
* Estadísticas de atención en tiempo real.

---

# Tecnologías Utilizadas

* HTML5
* CSS3
* JavaScript ES6+
* Node.js
* Programación orientada a objetos
* Patrones de diseño MVC, Singleton y Strategy
