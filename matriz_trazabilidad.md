# Matriz de Trazabilidad Unificada - CEDI Vertiche

*Nota: Esta matriz unifica los requerimientos funcionales, no funcionales (más de 50 especificaciones técnicas de la arquitectura Node/React) y los **casos de prueba (TP-)** adaptados a la realidad de la base de código actual, omitiendo integraciones de hardware obsoletas.*

## 1. Requisitos Funcionales

| ID Req | Nombre requisito | Descripción del Requerimiento | Casos de Uso | Pruebas Asociadas | Código Fuente | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQF-001** | API Recepción RFID | Endpoint POST `/api/rfid/scan` para registrar tags físicos. | UC-01 | **TP-REQF-001:** Simular payload POST de 500 tags RFID; validar registro en BD/Mock < 3s y timestamp. | `server.ts` | Completado |
| **REQF-002** | Sincronización WebSockets | El dashboard debe reflejar prepacks en vivo sin recargar la web. | UC-02, UC-09 | **TP-REQ-MON-F001:** Dashboard muestra flujos en vivo vs BD; error de sincronía <= 1%. | `server.ts` | Completado |
| **REQF-003** | Trazabilidad Prepack Modal | Modal cronológico de prepack, tiempos de ciclo, bahía y fallas. | UC-04, UC-10 | **TP-REQ-MON-F002:** Buscar prepack por ID; mostrar línea de dock→bahía.<br>**TP-REQF-012:** Verificar timestamps y cálculo de ciclo de vida. | `PrepPackModal.jsx` | Completado |
| **REQF-004** | Dashboard SICAT Filtros | Filtrar la lista de órdenes por "Etapa" y orden de llegada. | UC-03, UC-10 | **TP-REQ-MON-F007:** Filtro por etapa/tienda; resultados consistentes con BD sin mezclar datos. | `OrdenesFilterBar.jsx` | Completado |
| **REQF-005** | Gestión de Incidencias | Registrar causas raíz de errores y transicionar de Abierta→Resuelta. | UC-05, UC-08 | **TP-REQF-003:** Inyectar alerta crítica; validar bloqueo en UI y alerta roja.<br>**TP-REQ-MON-F008:** Validar persistencia hasta resolución. | `Incidencias.jsx` | Completado |
| **REQF-006** | Segmentación Comercial | Dashboard con secciones de Tendencias, Productos, Inventario. | UC-06, UC-09 | **TP-REQ-MON-F006:** KPI de eficiencia validado contra unidades vendidas. | `Ventas.jsx` | Completado |
| **REQF-007** | Agrupación Jerárquica DB | Organizar estructuralmente los paquetes: Lote → Orden → Prepack. | N/A | **TP-REQF-010:** Leer DB Mock y verificar agrupación correcta de sub-elementos bajo el mismo ID de caja. | `mockData.ts` | Completado |
| **REQF-008** | Asistente Virtual CEDI | Chat inteligente flotante interactivo para dudas sobre la operación. | UC-10 | N/A (Interfaz implementada) | `Ventas.jsx` | Completado |

---

## 2. Requisitos No Funcionales (Optimizados y Trazables)

| ID Req | Nombre requisito | Descripción del Requerimiento | Pruebas Asociadas | Código Fuente | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RNF-001** | WebSockets de Baja Latencia | Envío de updates Express→React vía Socket.io de forma persistente. | **TP-REQNF-003:** Medir latencia lector→servidor p95 <= 50ms.<br>**TP-REQ-MON-NF-006:** Desfase UI vs BD <= 3s. | `server.ts` | Completado |
| **RNF-002** | Renderizado TTI Rápido (SPA) | Navegación instantánea de vistas mediante `history.pushState`. | **TP-REQ-MON-NF-001:** Medir carga inicial TTI < 2s en LAN (3 corridas). | `App.jsx` | Completado |
| **RNF-003** | Consistencia Estética UI | Paleta estandarizada: Verde éxito, Amarillo alerta, Rojo error. | **TP-REQ-MON-F010:** Tablero severidad refleja Verde/Am/Rojo en <= 3s.<br>**TP-REQF-011:** Colores legibles a 3m. | `Incidencias.jsx` | Completado |
| **RNF-004** | Responsividad Autoajustable | Layout, modales (`94vw`) y tablas (`overflow-x`) escalables. | **TP-REQ-MON-NF-002:** Layout desktop/tablet sin cortes de canvas. | Múltiples `.jsx` | Completado |
| **RNF-005** | Usabilidad de 3 Clics | Arquitectura de información plana y accesible. | **TP-REQ-MON-NF-003:** Navegar a KPI/trazabilidad en <= 3 interacciones. | `Sidebar.jsx` | Completado |
| **RNF-006** | Compatibilidad Cross-Browser | Soporte puro web para motores modernos sin dependencias raras. | **TP-REQ-MON-NF-004:** Ejecución en Chrome/Edge/Safari (0 errores). | Vite Config | Completado |
| **RNF-007** | Accesibilidad Visual | Contraste adecuado para condiciones de luz de almacén. | **TP-REQ-MON-NF-005:** Verificar WCAG AA en gráficos y fondos grises. | `index.css` | Completado |
| **RNF-008** | Idioma Oficial del UI | Homologación estricta de términos al castellano. | **TP-REQ-MON-NF-007:** 100% de la interfaz sin cadenas residuales en inglés. | Todo el UI | Completado |
| **RNF-009** | Fiabilidad Inmutable DB | Los eventos operacionales no pueden ser borrados, solo transicionados. | **TP-REQ-MON-F003:** Historial auditable inmutable con trazas completas. | `alertasData.ts` | Completado |
| **RNF-010** | Aceleración GPU de Animaciones | Animaciones de redibujado (Chat/Modales) en hardware vía CSS puro. | N/A | `@keyframes` | Completado |
| **RNF-011** | Tipado Estricto de Backend | Uso absoluto de TypeScript para validación estructural de la API. | N/A | `tsconfig.json` | Completado |
| **RNF-012** | Prevención de Memory Leaks | `useEffect` con limpieza estricta de Listeners en componentes raíz. | N/A | `App.jsx` | Completado |
| **RNF-013** | Algoritmo React Keys | Iteraciones de arrays (Ej. Tabla incidencias) con Keys inyectadas. | N/A | `Incidencias.jsx`| Completado |
| **RNF-014** | Canvas/SVG Recharts | Visualización de cientos de datapoints con motor vectorizado. | N/A | `Ventas.jsx` | Completado |
| **RNF-015** | Límite DOM Payload | Paginación o slicing (`.slice(0, 10)`) en vistas top/pareto. | N/A | `Ventas.jsx` | Completado |
| **RNF-016** | Reutilización AppShell | Envoltorio global para no redibujar el menú lateral jamás. | N/A | `AppShell.jsx` | Completado |
| **RNF-017** | Interfaces de Dominio | Tipos `.types.ts` centralizados abstraídos del Controller. | N/A | `rfid.types.ts` | Completado |
| **RNF-018** | Patrón Service-Layer | Lógica de negocio (simulador) separada del archivo de rutas. | N/A | `ordenService.ts`| Completado |
| **RNF-019** | Mock Data Isolation | BD emulada apartada del core transaccional para rápido swap a SQL. | N/A | `mockData.ts` | Completado |
| **RNF-020** | Feature-Sliced Design | Frontend en `src/features/` vs componentes tontos en `shared`. | N/A | Frontend Src | Completado |
| **RNF-021** | Design Tokens | Colores/Variables alojados en objeto constante `const C = {...}`. | N/A | `Ventas.jsx` | Completado |
| **RNF-022** | Primitivas UI Funcionales | `Card`, `ChartTitle` unificados para DRY (Don't Repeat Yourself). | N/A | `Ventas.jsx` | Completado |
| **RNF-023** | Inline CSS-in-JS | Scoping puro de CSS por componente usando style object literals. | N/A | Múltiples `.jsx` | Completado |
| **RNF-024** | ES6+ Imports | Destructuración estándar y top-level module imports. | N/A | N/A | Completado |
| **RNF-025** | Optional Chaining `?.` | Defensa frontal contra payloads vacíos provenientes de la API. | N/A | Componentes | Completado |
| **RNF-026** | Catch Blocks Expresivos | Devolución de `{ error: '...' }` y HTTP 500 en fallas de Node. | N/A | `alertas.ts` | Completado |
| **RNF-027** | Status 404 Estricto | Frenado temprano en request GET/POST si la entidad no existe. | N/A | `server.ts` | Completado |
| **RNF-028** | Fallback Visual a Nulo | Evitar Crash de React devolviendo `return null` en modals sin data. | N/A | `PrepPackModal` | Completado |
| **RNF-029** | In-Memory Chat State | Mantener `messages` del Asistente aunque el FAB se colapse. | N/A | `Ventas.jsx` | Completado |
| **RNF-030** | Empty States Tabulares | Colspans estilizados (`Sin incidencias`) si un fetch regresa vacío. | N/A | `Incidencias.jsx`| Completado |
| **RNF-031** | Unidades Relativas (`min`) | Dimensiones fluidas para contenedores principales (Ej. Modales). | N/A | CSS en línea | Completado |
| **RNF-032** | Backdrop Filters | Desenfoque `blur(2px)` sobre la UI trasera para enfoque mental. | N/A | Modales | Completado |
| **RNF-033** | Micro-Transiciones UX | Cambio de color/sombra fluido de 0.15s en botones/filas de tabla. | N/A | `transition` | Completado |
| **RNF-034** | Tipografía Inter/Sans | Legibilidad maximizada sobre resoluciones del almacén. | N/A | `index.css` | Completado |
| **RNF-035** | Click-Outside Handler | Modales que se auto-cierran al cliquear área oscura de fondo. | N/A | Event delegation | Completado |
| **RNF-036** | Millares y Monedas LOCALE | `$50K` o `,` decimal en lugar de largas cadenas crudas (UX). | N/A | `toLocaleString` | Completado |
| **RNF-037** | Focus States (A11Y) | Bordes contrastantes al tipear en cajas de causa de incidencia. | N/A | Evento `onFocus` | Completado |
| **RNF-038** | Parseo Recharts Custom | Textos limpios de tooltip vía formatter prop en vez de JSON crudo. | N/A | Gráficas | Completado |
| **RNF-039** | CORS Backend | Middleware Express permitiendo queries desde host frontal dev. | N/A | `server.ts` | Completado |
| **RNF-040** | CORS Sockets | Bypass de validación handshake cross-origin de `socket.io`. | N/A | `server.ts` | Completado |
| **RNF-041** | Payload Parsing | Parseo nativo de application/json para bloquear streams crudos. | N/A | `express.json()` | Completado |
| **RNF-042** | Sanitización Trim | Pre-procesado `trim()` en strings antes de lanzar mutaciones. | N/A | Formularios | Completado |
| **RNF-043** | XSS Preventivo | Deshabilitar el uso de DOM crudo inyectable en React App. | N/A | React Core | Completado |
| **RNF-044** | API Nomenclatura Rest | URLs de recursos plurarizadas y estandarizadas HTTP (`/api/ordenes`). | N/A | `routes` | Completado |
| **RNF-045** | Verbos HTTP Idempotentes | Separación conceptual estricta de rutas `.get()` y rutas `.post()`. | N/A | API | Completado |
| **RNF-046** | Esquema Respuesta API | Objeto JSON raíz conteniendo prop `success` como bandera de estado. | N/A | Express Res | Completado |
| **RNF-047** | Diccionarios Locales | Búsqueda de etapas mapeada vs Constantes Array rápidas in-RAM. | N/A | `ordenService.ts`| Completado |
| **RNF-048** | Agnosticismo SSR | Window/Document checking previene fallos de build en infra nodejs/SSR. | N/A | `App.jsx` | Completado |
| **RNF-049** | Semántica Tabla HTML | Marcado Thead/Tbody puro facilitando scrapeo y herramientas visuales. | N/A | Componentes | Completado |
| **RNF-050** | SVG In-line | Zero-Network roundtrips para iconos/flechas embebidos directo en JS. | N/A | UI Components | Completado |
| **RNF-051** | Default Props | Componentes blindados contra omisión de dependencias padre (`section='...'`).| N/A | Múltiples `.jsx` | Completado |
| **RNF-052** | Singleton Mock DB | La BD local de prueba no muta su instancia entre llamadas HTTP aisladas. | N/A | `mockData.ts` | Completado |
| **RNF-053** | Logging de Transito | Registro console.log() de IPs o clientes de Sockets para telemetría. | N/A | `server.ts` | Completado |
