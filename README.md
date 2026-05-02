# vertiche-dashboard

Dashboard interno de operaciones para Vertiche. Cubre tres módulos independientes: **Monitoreo** de flujo de almacén, seguimiento **RFID** de órdenes (SICAT) y análisis de **Ventas**. Cada módulo es desarrollado por un equipo distinto sobre el mismo repositorio.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Primeros pasos](#primeros-pasos)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Módulos de la aplicación](#módulos-de-la-aplicación)
   - [Monitoreo](#monitoreo)
   - [RFID / SICAT](#rfid--sicat)
   - [Ventas](#ventas)
5. [Componentes compartidos](#componentes-compartidos)
6. [Datos mock](#datos-mock)
7. [Estilos y design tokens](#estilos-y-design-tokens)
8. [Tests](#tests)
9. [Flujo de trabajo en equipo](#flujo-de-trabajo-en-equipo)
10. [Ownership por carpeta](#ownership-por-carpeta)
11. [Configuración de GitHub](#configuración-de-github)

---

## Stack tecnológico

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| React | 19 | UI |
| Vite | 8 | Bundler y dev server |
| Tailwind CSS | 4 | Utilidades CSS |
| Recharts | 3 | Gráficas |
| Lucide React | 1 | Íconos |

No hay router externo: la navegación entre módulos y tabs se maneja con la History API (`window.history.pushState`) directamente en `App.jsx`.

---

## Primeros pasos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests
npm test
```

---

## Estructura del proyecto

```
vertiche-dashboard/
├── src/
│   ├── App.jsx               # Enrutador principal, punto de entrada de la UI
│   ├── App.css               # Estilos base de App
│   ├── main.jsx              # Monta React en el DOM
│   ├── index.css             # Design tokens globales y Tailwind
│   │
│   ├── features/             # Módulos por equipo (ownership estricto)
│   │   ├── monitoreo/        # ← SOLO equipo Monitoreo
│   │   │   ├── pages/
│   │   │   │   ├── AnalisisFlujo.jsx
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── components/
│   │   │   │   ├── FlowTable.jsx
│   │   │   │   ├── PerformanceChart.jsx
│   │   │   │   └── DynamicChart.jsx
│   │   │   └── data/
│   │   │       └── mockData.js
│   │   │
│   │   ├── rfid/             # ← SOLO equipo RFID
│   │   │   ├── pages/
│   │   │   │   └── SicatRfid.jsx
│   │   │   ├── components/
│   │   │   │   ├── SicatHeader.jsx
│   │   │   │   ├── SicatAnalisisFlujo.jsx
│   │   │   │   ├── Historial.jsx
│   │   │   │   ├── Incidencias.jsx
│   │   │   │   ├── BahiasPopup.jsx
│   │   │   │   └── PrepPackModal.jsx
│   │   │   └── data/
│   │   │       └── sicatMockData.js
│   │   │
│   │   └── ventas/           # ← SOLO equipo Ventas
│   │       ├── pages/
│   │       │   └── Ventas.jsx
│   │       └── data/
│   │           └── ventasData.js
│   │
│   └── shared/               # ← SOLO el lead modifica esto
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppShell.jsx
│       │   │   ├── TopNav.jsx
│       │   │   └── Sidebar.jsx
│       │   └── ui/
│       │       ├── KPICard.jsx
│       │       ├── StatusPill.jsx
│       │       ├── FilterDropdown.jsx
│       │       └── AddElementModal.jsx
│       └── pages/
│           └── UserProfile.jsx
│
├── public/                   # Assets estáticos
├── .github/
│   ├── CODEOWNERS            # Define quién debe aprobar PRs por carpeta
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md           # Guía de workflow para los tres equipos
├── package.json
└── vite.config.js
```

---

## Módulos de la aplicación

### Monitoreo

Módulo de monitoreo en tiempo real del flujo de almacén. Cubre dos vistas.

#### `pages/AnalisisFlujo.jsx`

Vista principal del módulo. Muestra el estado actual de las 7 etapas del proceso (Preregistro → QA → Registro → Sorter → Bahías → Auditoría → Envío) usando `FlowTable` y una gráfica de tendencia con `PerformanceChart`.

#### `pages/Dashboard.jsx`

Dashboard de KPIs detallados. Contiene múltiples secciones plegables con gráficas de barras, líneas y pie para métricas como backlog de órdenes y prepacks, ranking de equipos, ocupación de bahías, tiempos de registro y auditoría, y tasa de rechazo QA. Usa `KPICard` de `shared/` para mostrar métricas individuales.

#### `components/FlowTable.jsx`

Tabla horizontal con una columna por etapa. Cada columna muestra:
- **Fila 1:** Círculo con `pp/min` (prendas por minuto), coloreado según estatus (OK / Atención / Excepción)
- **Fila 2:** KPI secundario (órdenes incompletas, % aceptación, etc.)
- **Fila 3:** KPI terciario (tiempos, prendas rechazadas, etc.)

Las columnas son clickeables y navegan al sub-dashboard de esa etapa. Recibe un array `data` con múltiples equipos y los agrega en una sola fila consolidada.

#### `components/PerformanceChart.jsx`

Gráfica de líneas que muestra `pp/min` por etapa a lo largo del tiempo. Cada etapa tiene su color fijo. Tooltip personalizado con fondo oscuro.

#### `components/DynamicChart.jsx`

Componente genérico que renderiza Line, Bar o Pie chart según los datos recibidos. Usado en algunas secciones del Dashboard como gráfica configurable.

#### `data/mockData.js`

Datos simulados para el módulo Monitoreo. Exporta `equipos` (array de equipos con métricas por etapa), `performanceData` (series temporales de pp/min), y múltiples datasets para el Dashboard: `bahiasGeneral`, `backlogPPs`, `rankingEquiposRegistro`, `tendenciaOrdenesIncompletas`, entre otros.

---

### RFID / SICAT

Módulo de seguimiento de órdenes mediante RFID. Simula el avance de órdenes a través de las etapas del proceso en tiempo real (actualiza cada 3 segundos).

#### `pages/SicatRfid.jsx`

Componente raíz del módulo. Gestiona el estado global de RFID: inicializa órdenes e historial al montar, corre `simulateStep` cada 3 s para avanzar el estado, y enruta entre las tres tabs (Análisis de flujo, Historial, Incidencias).

#### `components/SicatHeader.jsx`

Barra de navegación propia del módulo RFID. Muestra un reloj en tiempo real (HH:MM:SS), tabs de navegación con badge de incidencias abiertas, contador de órdenes activas, selector de módulo y botón de perfil.

#### `components/SicatAnalisisFlujo.jsx`

Tabla de seguimiento por orden. Cada fila es una orden activa; cada columna es una etapa del proceso. Muestra porcentaje de avance, código de color por estatus (verde / ámbar / rojo), tiempo transcurrido vs SLA, y checklist de verificación por etapa. Integra `BahiasPopup` y `PrepPackModal` como overlays.

#### `components/Historial.jsx`

Vista de órdenes completadas y su recorrido por etapas. Muestra detalle de tiempos, fallos y resultados finales. Permite expandir cada orden para ver su historial de stages.

#### `components/Incidencias.jsx`

Lista y gestión de incidencias detectadas en el proceso. Cada incidencia tiene estatus (`open`, `escalated`, `resolved`) y puede actualizarse desde la UI. El badge en `SicatHeader` muestra el conteo de incidencias abiertas y escaladas.

#### `components/BahiasPopup.jsx`

Modal que muestra el porcentaje de ocupación de cada bahía activa, con barras de progreso coloreadas según el estatus. Se abre al hacer click en la columna Bahías de la tabla de flujo RFID.

#### `components/PrepPackModal.jsx`

Modal de detalle de un prepack específico. Muestra el avance por stage, tiempos y checklist de verificación.

#### `data/sicatMockData.js`

Motor de simulación del módulo RFID. Exporta:

| Export | Descripción |
|--------|-------------|
| `buildOrders()` | Genera órdenes con estado inicial aleatorio |
| `buildHistorical()` | Genera órdenes completadas para el historial |
| `initIncidencias(orders, historical)` | Detecta incidencias en el estado inicial |
| `simulateStep(orders, incidencias)` | Avanza el estado un tick (llamado cada 3 s) |
| `fmtTs`, `fmtMin`, `timeAgo` | Helpers de formato de tiempo |
| `stageColor`, `stagePctStr`, `slaCls` | Helpers de color y estatus |
| `STAGE_KEYS`, `STAGE_LABELS`, `BAHIA_STORES` | Constantes del dominio |

---

### Ventas

Módulo de análisis de ventas con cinco secciones navegables desde `TopNav`.

#### `pages/Ventas.jsx`

Componente único del módulo. Recibe dos props desde `App.jsx`: `section` (sección activa) y `filters` (filtros globales: periodo, zona, temporada). Renderiza la sección correspondiente con gráficas de Recharts.

| Sección | Contenido |
|---------|-----------|
| `tendencias` | Evolución mensual de ventas, comparativo YoY |
| `productos` | Top productos, distribución por talla, recibido vs vendido |
| `tiendas` | Ventas por tienda, ticket promedio por zona |
| `descuentos` | Descuento promedio por categoría, scatter precio vs descuento |
| `inventario` | Rotación de inventario, cobertura, alertas de stock |

#### `data/ventasData.js`

Datos simulados de ventas. Exporta series mensuales (`DATA`), comparativos año contra año (`yoy23`, `yoy24`), ranking de productos (`TOP_PRODS`), datos por tienda (`TIENDAS`), alertas de stock (`STOCK_ALERTS`), y datasets adicionales para cada sección: `SCATTER_DCTO`, `TICKET_ZONA`, `SEASON_DATA`, `TALLAS`, `INVENTORY_ROTATION`, `RECIBIDO_VENDIDO`, `DCTO_CAT`, `QUARTERLY_REVENUE`, `FESTIVOS_DATA`, `COVERAGE_KPIS`.

---

## Componentes compartidos

> Estos archivos son propiedad del lead. Ningún equipo los modifica sin coordinación previa.

### Layout

#### `shared/components/layout/AppShell.jsx`

Wrapper de layout para los módulos Monitoreo y Ventas. Compone `TopNav` y el área de contenido. El módulo RFID tiene su propio layout (`SicatHeader`) y no usa `AppShell`.

#### `shared/components/layout/TopNav.jsx`

Barra de navegación superior compartida entre Monitoreo y Ventas. Contiene:
- **Selector de módulo** — dropdown para cambiar entre Monitoreo, RFID y Ventas
- **Tabs** — cambian según el módulo activo (tabs de monitoreo o de ventas)
- **Filtros de Ventas** — panel desplegable con periodo, zona y temporada; visible solo en el módulo Ventas
- **Botón de perfil** — abre `UserProfile`

#### `shared/components/layout/Sidebar.jsx`

Panel lateral de filtros para el módulo Monitoreo. Permite filtrar por número de orden (búsqueda en vivo) o por tienda destino.

### UI Atoms

#### `shared/components/ui/KPICard.jsx`

Tarjeta de métrica individual. Props: `label`, `value`, `unit`, `delta`. Muestra flecha y color verde/rojo según si el delta es favorable. La polaridad se invierte automáticamente para métricas de rechazo y fallo (donde un aumento es negativo).

#### `shared/components/ui/StatusPill.jsx`

Badge de estado con fondo de color suave. Acepta `status` (`success`, `warning`, `error`, `info`) y un `label`. Usado para indicar el estado de órdenes, etapas e incidencias.

#### `shared/components/ui/FilterDropdown.jsx`

Dropdown personalizado (sin `<select>` nativo). Muestra opciones en un panel flotante. Props: `label`, `options` (array `{value, label}`), `value`, `onChange`.

#### `shared/components/ui/AddElementModal.jsx`

Modal genérico para agregar elementos a listas dentro del dashboard.

### `shared/pages/UserProfile.jsx`

Pantalla de perfil de usuario. Se monta sobre toda la UI reemplazando la vista actual. Se activa desde el botón de avatar en `TopNav` o `SicatHeader`.

---

## Datos mock

Todos los módulos trabajan con datos simulados localmente; no hay llamadas a API por ahora. Cuando se conecten APIs reales, cada equipo reemplaza su propio archivo de datos sin tocar los de los otros módulos.

| Archivo | Módulo | Descripción |
|---------|--------|-------------|
| `features/monitoreo/data/mockData.js` | Monitoreo | KPIs, series temporales, datos de bahías y equipos |
| `features/rfid/data/sicatMockData.js` | RFID | Motor de simulación de órdenes en tiempo real |
| `features/ventas/data/ventasData.js` | Ventas | Datos de ventas, inventario, tiendas y descuentos |

---

## Estilos y design tokens

#### `src/index.css`

Define los design tokens globales como variables CSS en `:root`. Todos los componentes usan estas variables en lugar de colores hardcodeados.

```
--bg-main        #F8F6F3   Fondo general (beige cálido)
--bg-card        #FFFFFF   Fondo de tarjetas
--text-primary   #1F1F1F   Texto principal
--text-secondary #6B6B6B   Texto secundario
--border         #E7E2DC   Bordes

--accent-black   #111111
--accent-beige   #D8C3A5
--accent-blush   #D9B8B0
--accent-taupe   #A48F7A

--success        #6E8B6B   Verde
--warning        #C9963B   Ámbar
--error          #B65E4A   Rojo
```

La fuente principal es **Inter** cargada desde Google Fonts.

#### `src/App.css`

Estilos específicos del componente App y clases de utilidad usadas internamente.

#### `vite.config.js`

Configuración mínima de Vite. Activa `@vitejs/plugin-react` (soporte JSX y Fast Refresh) y `@tailwindcss/vite` (integración de Tailwind v4).

---

## Tests

```bash
npm test
```

Usa el runner nativo de Node.js (`node:test`) sin dependencias externas.

| Archivo | Qué verifica |
|---------|-------------|
| `features/monitoreo/components/FlowTable.test.mjs` | Que `FlowTable` renderiza `pp/min` como indicador primario por etapa y muestra los KPIs operacionales secundarios correctos |
| `features/monitoreo/pages/Dashboard.test.mjs` | Tests del componente Dashboard |
| `scripts/*.test.mjs` | Tests de los scripts auxiliares (markitdown) |

---

## Flujo de trabajo en equipo

Tres equipos trabajan en paralelo. Para evitar conflictos:

```
1. Crear rama desde main
   git checkout main && git pull
   git checkout -b rfid/nombre-del-cambio
   # o ventas/..., monitoreo/...

2. Trabajar SOLO dentro de features/<mi-equipo>/

3. Verificar antes de subir
   npm run build   # debe pasar sin errores
   npm test

4. Abrir Pull Request a main
   El template de PR carga automáticamente con el checklist

5. El líder del equipo aprueba y mergea
```

**Regla de oro: nadie hace push directo a `main`.**

Ver `CONTRIBUTING.md` para el workflow completo y preguntas frecuentes.

---

## Ownership por carpeta

| Carpeta | Equipo responsable | Quién aprueba PRs |
|---------|-------------------|-------------------|
| `src/features/rfid/` | Equipo RFID | Líder RFID |
| `src/features/ventas/` | Equipo Ventas | Líder Ventas |
| `src/features/monitoreo/` | Equipo Monitoreo | Líder Monitoreo |
| `src/shared/` | Lead / Owner | Lead |
| `src/App.jsx`, `src/main.jsx` | Lead / Owner | Lead |

El archivo `.github/CODEOWNERS` registra los usuarios de GitHub de cada líder. Si un PR toca múltiples carpetas, **todos** los CODEOWNERS afectados deben aprobar antes de que el merge sea posible.

---

## Configuración de GitHub

Pasos que el lead realiza una sola vez tras hacer push del repositorio:

1. Ir a **Settings → Branches → Add branch ruleset** para la rama `main`
2. Activar:
   - Require a pull request before merging
   - Require approvals: **1**
   - Require review from Code Owners
   - Do not allow bypassing the above settings

Esto garantiza que ningún push directo ni merge sin revisión llegue a `main`, incluso desde cuentas de administrador.

Antes de activar las reglas, reemplazar en `.github/CODEOWNERS` los placeholders `LEAD_GITHUB_USERNAME`, `LIDER_RFID_GITHUB`, `LIDER_VENTAS_GITHUB` y `LIDER_MONITOREO_GITHUB` con los usernames reales de GitHub de cada responsable.
