export const kpiData = {
  prepacksMin:   { valor: 230, delta: +7,   unidad: 'pp/min' },
  rechazoQA:     { valor: 3.8, delta: -0.6, unidad: '%' },
  falloSorter:   { valor: 1.2, delta: +0.3, unidad: '%' },
  tiempoCarga:   { valor: 2.4, delta: -0.2, unidad: 'hrs' },
};

export const equipos = [
  {
    nombre: 'Alpha', orden: 'ORD-2891',
    detalleOrden: {
      totalPrepacks: 45,
      prepacksEsperados: 50,
      items: [
        { prepacks: 5,  descripcion: '10 playeras negras + 10 playeras blancas',  sku: 'PLY-NEG-BLC' },
        { prepacks: 5,  descripcion: '10 playeras verdes + 10 playeras azules',   sku: 'PLY-VRD-AZL' },
        { prepacks: 8,  descripcion: '15 pantalones mezclilla slim',              sku: 'PNT-MZC-SLM' },
        { prepacks: 6,  descripcion: '20 calcetas deportivas blancas',            sku: 'CLC-DEP-BLC' },
        { prepacks: 4,  descripcion: '8 vestidos casuales flores',                sku: 'VSD-CAS-FLR' },
        { prepacks: 7,  descripcion: '12 shorts deportivos negros',               sku: 'SHR-DEP-NEG' },
        { prepacks: 10, descripcion: '25 camisetas básicas blancas',              sku: 'CMS-BAS-BLC' },
      ],
    },
    etapas: {
      prepack:   { status: 'success', ppMin: 42, ordenesRecibidas: 14, ordenesIncompletas: 1 },
      qa:        { status: 'success', ppMin: 38, porcentaje: 98, devolucionesPedidos: 1 },
      registro:  { status: 'warning', ppMin: 35, ppCrossDock: 34, tiempoPromedioRegistro: '11 min' },
      sorter:    { status: 'success', ppMin: 44, fallas: 1, ppBahiaIncorrecta: 3, tiempoInactivo: '5 min' },
      bahias:    {
        status: 'warning',
        ppMin: 30,
        bahiasSaturadas: 1,
        bahias: [
          { id: 'B01', porcentaje: 85, status: 'warning' },
          { id: 'B02', porcentaje: 42, status: 'success' },
          { id: 'B03', porcentaje: 97, status: 'error'   },
          { id: 'B04', porcentaje: 61, status: 'success' },
        ],
      },
      auditoria: { status: 'success', ppMin: 28, valor: 96, fallasRechazadas: 2 },
      envio:     { status: 'success', ppMin: 22, tiempoPromedioRecorrido: '2.1 hrs', ordenesConRetraso: 0 },
    },
  },
  {
    nombre: 'Beta', orden: 'ORD-2892',
    detalleOrden: {
      totalPrepacks: 38,
      prepacksEsperados: 44,
      items: [
        { prepacks: 6,  descripcion: '15 leggings deportivos negros',             sku: 'LGG-DEP-NEG' },
        { prepacks: 4,  descripcion: '10 sudaderas con capucha grises',           sku: 'SUD-CAP-GRS' },
        { prepacks: 8,  descripcion: '20 playeras polo azul marino',              sku: 'PLY-POL-AZM' },
        { prepacks: 5,  descripcion: '12 blusas estampadas multicolor',           sku: 'BLS-EST-MLC' },
        { prepacks: 7,  descripcion: '18 calcetines tobilleros blancos',          sku: 'CLC-TOB-BLC' },
        { prepacks: 8,  descripcion: '16 jeans clásicos azul',                   sku: 'JNS-CLS-AZL' },
      ],
    },
    etapas: {
      prepack:   { status: 'warning', ppMin: 31, ordenesRecibidas: 11, ordenesIncompletas: 3 },
      qa:        { status: 'warning', ppMin: 27, porcentaje: 94, devolucionesPedidos: 4 },
      registro:  { status: 'success', ppMin: 29, ppCrossDock: 28, tiempoPromedioRegistro: '14 min' },
      sorter:    { status: 'warning', ppMin: 33, fallas: 8, ppBahiaIncorrecta: 11, tiempoInactivo: '18 min' },
      bahias:    {
        status: 'success',
        ppMin: 22,
        bahiasSaturadas: 0,
        bahias: [
          { id: 'B05', porcentaje: 28, status: 'success' },
          { id: 'B06', porcentaje: 73, status: 'warning' },
          { id: 'B07', porcentaje: 55, status: 'success' },
        ],
      },
      auditoria: { status: 'error',   ppMin: 19, valor: 91, fallasRechazadas: 9 },
      envio:     { status: 'error',   ppMin: 14, tiempoPromedioRecorrido: '3.8 hrs', ordenesConRetraso: 2 },
    },
  },
  {
    nombre: 'Delta', orden: 'ORD-2893',
    detalleOrden: {
      totalPrepacks: 52,
      prepacksEsperados: 52,
      items: [
        { prepacks: 10, descripcion: '20 camisetas básicas negras y blancas',    sku: 'CMS-BAS-NBC' },
        { prepacks: 8,  descripcion: '16 faldas casuales flores surtidas',       sku: 'FAL-CAS-FLR' },
        { prepacks: 6,  descripcion: '12 chamarras ligeras beige',               sku: 'CHM-LIG-BEI' },
        { prepacks: 9,  descripcion: '18 pantalones de vestir negro',            sku: 'PNT-VST-NEG' },
        { prepacks: 5,  descripcion: '10 blusas manga larga blancas',            sku: 'BLS-MGL-BLC' },
        { prepacks: 7,  descripcion: '14 vestidos de noche azul marino',         sku: 'VSD-NOC-AZM' },
        { prepacks: 7,  descripcion: '21 playeras oversize grises',              sku: 'PLY-OVS-GRS' },
      ],
    },
    etapas: {
      prepack:   { status: 'success', ppMin: 48, ordenesRecibidas: 16, ordenesIncompletas: 0 },
      qa:        { status: 'success', ppMin: 45, porcentaje: 99, devolucionesPedidos: 0 },
      registro:  { status: 'success', ppMin: 43, ppCrossDock: 41, tiempoPromedioRegistro: '9 min' },
      sorter:    { status: 'success', ppMin: 47, fallas: 0, ppBahiaIncorrecta: 0, tiempoInactivo: '2 min' },
      bahias:    {
        status: 'warning',
        ppMin: 36,
        bahiasSaturadas: 2,
        bahias: [
          { id: 'B08', porcentaje: 89,  status: 'warning' },
          { id: 'B09', porcentaje: 12,  status: 'success' },
          { id: 'B10', porcentaje: 100, status: 'error'   },
        ],
      },
      auditoria: { status: 'success', ppMin: 33, valor: 97, fallasRechazadas: 1 },
      envio:     { status: 'warning', ppMin: 26, tiempoPromedioRecorrido: '2.6 hrs', ordenesConRetraso: 1 },
    },
  },
];

export const performanceData = [
  { tiempo: '07:00', preregistro: 38, qa: 34, registro: 30, sorter: 40, bahias: 26, auditoria: 23, envio: 18 },
  { tiempo: '08:00', preregistro: 40, qa: 36, registro: 33, sorter: 41, bahias: 27, auditoria: 25, envio: 19 },
  { tiempo: '09:00', preregistro: 42, qa: 38, registro: 35, sorter: 44, bahias: 30, auditoria: 28, envio: 22 },
  { tiempo: '10:00', preregistro: 45, qa: 40, registro: 38, sorter: 46, bahias: 32, auditoria: 30, envio: 24 },
  { tiempo: '11:00', preregistro: 43, qa: 39, registro: 36, sorter: 45, bahias: 31, auditoria: 29, envio: 23 },
  { tiempo: '12:00', preregistro: 41, qa: 37, registro: 34, sorter: 43, bahias: 29, auditoria: 27, envio: 21 },
  { tiempo: '13:00', preregistro: 44, qa: 41, registro: 37, sorter: 47, bahias: 33, auditoria: 31, envio: 25 },
  { tiempo: '14:00', preregistro: 46, qa: 42, registro: 39, sorter: 48, bahias: 34, auditoria: 32, envio: 26 },
  { tiempo: '15:00', preregistro: 44, qa: 40, registro: 37, sorter: 46, bahias: 32, auditoria: 30, envio: 24 },
  { tiempo: '16:00', preregistro: 42, qa: 38, registro: 35, sorter: 44, bahias: 30, auditoria: 28, envio: 22 },
  { tiempo: '17:00', preregistro: 40, qa: 36, registro: 33, sorter: 42, bahias: 28, auditoria: 26, envio: 20 },
  { tiempo: '18:00', preregistro: 37, qa: 33, registro: 30, sorter: 39, bahias: 25, auditoria: 23, envio: 17 },
  { tiempo: '19:00', preregistro: 34, qa: 30, registro: 27, sorter: 36, bahias: 22, auditoria: 20, envio: 15 },
];

export const sorterGeneral = {
  valor: 7800,
  unidad: 'pp/min',
  status: 'success',
  incidentes: 2,
  capacidadUsada: 78,
};

export const bahiasGeneral = {
  status: 'warning',
  bahias: [
    { id: 'B01', porcentaje: 85, status: 'warning' },
    { id: 'B02', porcentaje: 42, status: 'success' },
    { id: 'B03', porcentaje: 97, status: 'error'   },
    { id: 'B04', porcentaje: 61, status: 'success' },
    { id: 'B05', porcentaje: 28, status: 'success' },
    { id: 'B06', porcentaje: 73, status: 'warning' },
    { id: 'B07', porcentaje: 55, status: 'success' },
    { id: 'B08', porcentaje: 89, status: 'warning' },
    { id: 'B09', porcentaje: 12, status: 'success' },
    { id: 'B10', porcentaje: 100, status: 'error'  },
  ],
};

export const prepacksPorHora = [
  { hora: '06:00', alpha: 2.2, beta: 2.0, delta: 2.5 },
  { hora: '07:00', alpha: 2.3, beta: 2.0, delta: 2.6 },
  { hora: '08:00', alpha: 2.4, beta: 1.9, delta: 2.5 },
  { hora: '09:00', alpha: 2.3, beta: 2.1, delta: 2.7 },
  { hora: '10:00', alpha: 2.4, beta: 2.1, delta: 2.6 },
  { hora: '11:00', alpha: 2.3, beta: 2.0, delta: 2.6 },
];

export const rechazoQAPorEquipo = [
  { equipo: 'Delta', porcentaje: 1.9 },
  { equipo: 'Alpha', porcentaje: 3.2 },
  { equipo: 'Beta',  porcentaje: 5.8 },
];

export const tiempoDescarga = [
  { dia: 'Lun', horas: 2.1 },
  { dia: 'Mar', horas: 2.4 },
  { dia: 'Mié', horas: 1.9 },
  { dia: 'Jue', horas: 2.6 },
  { dia: 'Vie', horas: 2.3 },
  { dia: 'Sáb', horas: 1.8 },
  { dia: 'Dom', horas: 2.0 },
];

export const incidentesSorter = [
  { id: 1, equipo: 'Alpha', tipo: 'Atasco cinta',    hora: '07:42', status: 'warning' },
  { id: 2, equipo: 'Beta',  tipo: 'Error lectura',   hora: '08:15', status: 'error'   },
  { id: 3, equipo: 'Beta',  tipo: 'Fallo sensor',    hora: '09:03', status: 'error'   },
  { id: 4, equipo: 'Delta', tipo: 'Reinicio manual', hora: '10:28', status: 'warning' },
];

// =========================================================
// PREREGISTRO
// =========================================================
export const ordenesIncompletasPorProveedor = [
  { proveedor: 'Prov Estrella SA',   incompletas: 38 },
  { proveedor: 'Textiles Norte',     incompletas: 24 },
  { proveedor: 'Confecciones GDL',   incompletas: 18 },
  { proveedor: 'Moda Express',       incompletas: 9  },
  { proveedor: 'Distribuidora MX',   incompletas: 5  },
  { proveedor: 'Importa Fácil',      incompletas: 3  },
  { proveedor: 'FastThread',         incompletas: 1  },
];

export const tendenciaOrdenesIncompletas = [
  { semana: 'S1', total: 45 },
  { semana: 'S2', total: 38 },
  { semana: 'S3', total: 52 },
  { semana: 'S4', total: 31 },
  { semana: 'S5', total: 28 },
  { semana: 'S6', total: 33 },
];

export const proveedoresEstrella = [
  { proveedor: 'FastThread',        tasaAceptacion: 99.1, volumen: 1240, categoria: 'estrella' },
  { proveedor: 'Textiles Norte',    tasaAceptacion: 97.8, volumen: 980,  categoria: 'estrella' },
  { proveedor: 'Confecciones GDL',  tasaAceptacion: 96.4, volumen: 870,  categoria: 'bueno'    },
  { proveedor: 'Distribuidora MX',  tasaAceptacion: 94.2, volumen: 645,  categoria: 'bueno'    },
  { proveedor: 'Prov Estrella SA',  tasaAceptacion: 88.3, volumen: 1580, categoria: 'riesgo'   },
  { proveedor: 'Moda Express',      tasaAceptacion: 85.7, volumen: 320,  categoria: 'riesgo'   },
];

// =========================================================
// QA
// =========================================================
export const erroresPPPorProveedor = [
  { proveedor: 'Prov Estrella SA',  errores: 41 },
  { proveedor: 'Moda Express',      errores: 27 },
  { proveedor: 'Importa Fácil',     errores: 19 },
  { proveedor: 'Textiles Norte',    errores: 8  },
  { proveedor: 'Confecciones GDL',  errores: 4  },
  { proveedor: 'FastThread',        errores: 1  },
];

export const prepacksRetornadosQA = [
  { pp: 'PP-4421', proveedor: 'Prov Estrella SA',  motivo: 'Pieza dañada',   equipo: 'Beta',  hora: '08:12' },
  { pp: 'PP-4438', proveedor: 'Moda Express',       motivo: 'Incompleto',     equipo: 'Alpha', hora: '08:47' },
  { pp: 'PP-4455', proveedor: 'Importa Fácil',      motivo: 'Error etiqueta', equipo: 'Beta',  hora: '09:05' },
  { pp: 'PP-4461', proveedor: 'Prov Estrella SA',   motivo: 'Pieza dañada',   equipo: 'Beta',  hora: '09:23' },
  { pp: 'PP-4477', proveedor: 'Textiles Norte',     motivo: 'Incompleto',     equipo: 'Delta', hora: '09:51' },
];

export const rechazosPorTipoPrenda = [
  { tipo: 'Playeras',    rechazos: 18 },
  { tipo: 'Pantalones',  rechazos: 11 },
  { tipo: 'Leggings',    rechazos: 9  },
  { tipo: 'Sudaderas',   rechazos: 7  },
  { tipo: 'Accesorios',  rechazos: 4  },
  { tipo: 'Calcetines',  rechazos: 2  },
];

export const motivosRechazoQA = [
  { motivo: 'Pieza dañada',     cantidad: 22 },
  { motivo: 'Incompleto',       cantidad: 18 },
  { motivo: 'Error etiqueta',   cantidad: 8  },
  { motivo: 'Talla incorrecta', cantidad: 5  },
  { motivo: 'Otro',             cantidad: 3  },
];

// =========================================================
// REGISTRO
// =========================================================
export const distribucionAlmacen = [
  { almacen: 'Cross-dock',         prepacks: 312 },
  { almacen: 'Post-distribución',  prepacks: 175 },
  { almacen: 'Apertura',           prepacks: 88  },
];

export const rankingEquiposRegistro = [
  { equipo: 'Delta', tiempoPromedio: '9 min',  tiempoMin: 9,  ppMin: 43, ppCrossDock: 41, status: 'success' },
  { equipo: 'Alpha', tiempoPromedio: '11 min', tiempoMin: 11, ppMin: 35, ppCrossDock: 34, status: 'warning' },
  { equipo: 'Beta',  tiempoPromedio: '14 min', tiempoMin: 14, ppMin: 29, ppCrossDock: 28, status: 'error'   },
];

export const backlogPPs = [
  { pp: 'PP-4502', proveedor: 'Moda Express',     minutosEnSistema: 7,  equipo: 'Alpha', etapa: 'Registro' },
  { pp: 'PP-4498', proveedor: 'Prov Estrella SA', minutosEnSistema: 13, equipo: 'Beta',  etapa: 'Registro' },
  { pp: 'PP-4491', proveedor: 'Importa Fácil',    minutosEnSistema: 11, equipo: 'Beta',  etapa: 'Registro' },
  { pp: 'PP-4487', proveedor: 'Textiles Norte',   minutosEnSistema: 24, equipo: 'Beta',  etapa: 'Sorter'   },
  { pp: 'PP-4483', proveedor: 'Confecciones GDL', minutosEnSistema: 9,  equipo: 'Delta', etapa: 'Registro' },
  { pp: 'PP-4479', proveedor: 'FastThread',        minutosEnSistema: 31, equipo: 'Alpha', etapa: 'Sorter'  },
];

export const tendenciaTiemposRegistro = [
  { semana: 'S1', tiempoPromedio: 13.2, target: 10 },
  { semana: 'S2', tiempoPromedio: 11.8, target: 10 },
  { semana: 'S3', tiempoPromedio: 14.1, target: 10 },
  { semana: 'S4', tiempoPromedio: 10.9, target: 10 },
  { semana: 'S5', tiempoPromedio: 12.3, target: 10 },
  { semana: 'S6', tiempoPromedio: 11.0, target: 10 },
];

// =========================================================
// SORTER
// =========================================================
export const paquetesPorBahia = [
  { bahia: 'B01', paquetes: 142 },
  { bahia: 'B02', paquetes: 98  },
  { bahia: 'B03', paquetes: 187 },
  { bahia: 'B04', paquetes: 121 },
  { bahia: 'B05', paquetes: 76  },
  { bahia: 'B06', paquetes: 153 },
  { bahia: 'B07', paquetes: 109 },
  { bahia: 'B08', paquetes: 164 },
  { bahia: 'B09', paquetes: 44  },
  { bahia: 'B10', paquetes: 189 },
];

export const paquetesIncorrectos = [
  { pp: 'PP-4412', bahiaActual: 'B03', bahiaCorrecta: 'B07', equipo: 'Alpha', hora: '08:31' },
  { pp: 'PP-4419', bahiaActual: 'B06', bahiaCorrecta: 'B02', equipo: 'Beta',  hora: '08:58' },
  { pp: 'PP-4433', bahiaActual: 'B01', bahiaCorrecta: 'B09', equipo: 'Beta',  hora: '09:14' },
  { pp: 'PP-4441', bahiaActual: 'B08', bahiaCorrecta: 'B04', equipo: 'Beta',  hora: '09:37' },
  { pp: 'PP-4448', bahiaActual: 'B05', bahiaCorrecta: 'B10', equipo: 'Delta', hora: '09:52' },
];

export const tiempoSorterTendencia = [
  { semana: 'S1', segundos: 18.4 },
  { semana: 'S2', segundos: 17.9 },
  { semana: 'S3', segundos: 19.2 },
  { semana: 'S4', segundos: 17.1 },
  { semana: 'S5', segundos: 16.8 },
  { semana: 'S6', segundos: 17.5 },
];

// =========================================================
// BAHÍAS
// =========================================================
export const tendenciaOcupacionBahias = [
  { semana: 'S1', B01: 72, B02: 38, B03: 84, B04: 51, B05: 22 },
  { semana: 'S2', B01: 78, B02: 41, B03: 89, B04: 58, B05: 26 },
  { semana: 'S3', B01: 81, B02: 36, B03: 93, B04: 62, B05: 31 },
  { semana: 'S4', B01: 85, B02: 42, B03: 97, B04: 61, B05: 28 },
  { semana: 'S5', B01: 83, B02: 44, B03: 95, B04: 59, B05: 30 },
  { semana: 'S6', B01: 85, B02: 42, B03: 97, B04: 61, B05: 28 },
];

export const capacidadBahias = [
  { bahia: 'B01', capacidad: 200, procesando: 142 },
  { bahia: 'B02', capacidad: 200, procesando: 98  },
  { bahia: 'B03', capacidad: 200, procesando: 187 },
  { bahia: 'B04', capacidad: 200, procesando: 121 },
  { bahia: 'B05', capacidad: 150, procesando: 76  },
  { bahia: 'B06', capacidad: 150, procesando: 153 },
  { bahia: 'B07', capacidad: 150, procesando: 109 },
  { bahia: 'B08', capacidad: 200, procesando: 164 },
  { bahia: 'B09', capacidad: 200, procesando: 44  },
  { bahia: 'B10', capacidad: 200, procesando: 189 },
];

// =========================================================
// AUDITORÍA
// =========================================================
export const cajasIncorrectas = [
  { caja: 'CJA-1021', tipo: 'Sobrante',      equipo: 'Alpha', minutosAuditoria: 4.2,  hora: '07:55', piezas: 2,  proveedor: 'FastThread'      },
  { caja: 'CJA-1034', tipo: 'Faltante',       equipo: 'Beta',  minutosAuditoria: 9.8,  hora: '08:22', piezas: 5,  proveedor: 'Prov Estrella SA' },
  { caja: 'CJA-1047', tipo: 'Error etiqueta', equipo: 'Beta',  minutosAuditoria: 6.1,  hora: '08:49', piezas: 1,  proveedor: 'Importa Fácil'   },
  { caja: 'CJA-1058', tipo: 'Dañado',         equipo: 'Delta', minutosAuditoria: 5.3,  hora: '09:10', piezas: 3,  proveedor: 'Textiles Norte'  },
  { caja: 'CJA-1063', tipo: 'Faltante',       equipo: 'Alpha', minutosAuditoria: 11.4, hora: '09:31', piezas: 8,  proveedor: 'Moda Express'    },
  { caja: 'CJA-1071', tipo: 'Sobrante',       equipo: 'Beta',  minutosAuditoria: 3.7,  hora: '09:44', piezas: 1,  proveedor: 'Confecciones GDL'},
  { caja: 'CJA-1079', tipo: 'Dañado',         equipo: 'Delta', minutosAuditoria: 13.2, hora: '10:05', piezas: 4,  proveedor: 'Moda Express'    },
  { caja: 'CJA-1085', tipo: 'Error etiqueta', equipo: 'Alpha', minutosAuditoria: 2.9,  hora: '10:18', piezas: 1,  proveedor: 'FastThread'      },
];

export const distribucionTiemposAuditoria = [
  { rango: '< 3 min',  cajas: 18 },
  { rango: '3–5 min',  cajas: 31 },
  { rango: '5–8 min',  cajas: 14 },
  { rango: '8–12 min', cajas: 7  },
  { rango: '> 12 min', cajas: 3  },
];

// =========================================================
// ENVÍO
// =========================================================
export const backlogOrdenes = [
  { orden: 'ORD-2891', proveedor: 'FastThread',       minutosEnSistema: 22, prepacks: 45, status: 'success', etapaActual: 'Envío',     tienda: 'T-101 Satélite'  },
  { orden: 'ORD-2892', proveedor: 'Prov Estrella SA', minutosEnSistema: 35, prepacks: 38, status: 'warning', etapaActual: 'Auditoría', tienda: 'T-204 Interlomas' },
  { orden: 'ORD-2893', proveedor: 'Textiles Norte',   minutosEnSistema: 18, prepacks: 52, status: 'success', etapaActual: 'Envío',     tienda: 'T-312 Perinorte'  },
  { orden: 'ORD-2894', proveedor: 'Moda Express',     minutosEnSistema: 43, prepacks: 29, status: 'error',   etapaActual: 'Sorter',    tienda: 'T-087 Toreo'      },
  { orden: 'ORD-2895', proveedor: 'Importa Fácil',    minutosEnSistema: 31, prepacks: 61, status: 'warning', etapaActual: 'Bahías',    tienda: 'T-155 Santa Fe'   },
  { orden: 'ORD-2896', proveedor: 'Confecciones GDL', minutosEnSistema: 12, prepacks: 33, status: 'success', etapaActual: 'Registro',  tienda: 'T-220 Coyoacán'   },
];

export const estatusOrdenes = [
  { orden: 'ORD-2891', proveedor: 'FastThread',       prepacks: 45, etapaActual: 'Envío',     status: 'success', horaIngreso: '08:10', progresoEtapa: 100 },
  { orden: 'ORD-2892', proveedor: 'Prov Estrella SA', prepacks: 38, etapaActual: 'Auditoría', status: 'warning', horaIngreso: '08:22', progresoEtapa: 85  },
  { orden: 'ORD-2893', proveedor: 'Textiles Norte',   prepacks: 52, etapaActual: 'Envío',     status: 'success', horaIngreso: '08:35', progresoEtapa: 100 },
  { orden: 'ORD-2894', proveedor: 'Moda Express',     prepacks: 29, etapaActual: 'Sorter',    status: 'error',   horaIngreso: '08:48', progresoEtapa: 57  },
  { orden: 'ORD-2895', proveedor: 'Importa Fácil',    prepacks: 61, etapaActual: 'Bahías',    status: 'warning', horaIngreso: '09:01', progresoEtapa: 71  },
  { orden: 'ORD-2896', proveedor: 'Confecciones GDL', prepacks: 33, etapaActual: 'Registro',  status: 'success', horaIngreso: '09:14', progresoEtapa: 28  },
];

export const mockChartData = {
  'Prepacks procesados': prepacksPorHora,
  '% Rechazo QA': rechazoQAPorEquipo.map(d => ({ nombre: d.equipo, valor: d.porcentaje })),
  '% Fallo Sorter': [
    { hora: '06:00', valor: 0.8 }, { hora: '07:00', valor: 1.2 },
    { hora: '08:00', valor: 1.5 }, { hora: '09:00', valor: 1.0 },
    { hora: '10:00', valor: 0.9 }, { hora: '11:00', valor: 1.2 },
  ],
  'Tiempo promedio carga': [
    { dia: 'Lun', valor: 2.3 }, { dia: 'Mar', valor: 2.1 },
    { dia: 'Mié', valor: 2.6 }, { dia: 'Jue', valor: 2.4 },
    { dia: 'Vie', valor: 2.2 }, { dia: 'Sáb', valor: 1.9 },
  ],
  'Tiempo promedio descarga': tiempoDescarga.map(d => ({ nombre: d.dia, valor: d.horas })),
  'Fill rate': [
    { equipo: 'Alpha', valor: 96.2 }, { equipo: 'Beta', valor: 91.8 }, { equipo: 'Delta', valor: 98.1 },
  ],
  'Exactitud de recepción': [
    { semana: 'S1', valor: 97.5 }, { semana: 'S2', valor: 98.1 },
    { semana: 'S3', valor: 96.8 }, { semana: 'S4', valor: 97.9 },
  ],
  'Backlog operativo': [
    { equipo: 'Alpha', valor: 245 }, { equipo: 'Beta', valor: 412 }, { equipo: 'Delta', valor: 128 },
  ],
  'Incidencias por proveedor': [
    { proveedor: 'Prov A', valor: 3 }, { proveedor: 'Prov B', valor: 7 },
    { proveedor: 'Prov C', valor: 2 }, { proveedor: 'Prov D', valor: 5 },
  ],
  'Top SKUs': [
    { sku: 'SKU-001', valor: 1240 }, { sku: 'SKU-002', valor: 980 },
    { sku: 'SKU-003', valor: 870 },  { sku: 'SKU-004', valor: 645 },
    { sku: 'SKU-005', valor: 512 },
  ],
  'Auditoría por excepción': [
    { tipo: 'Faltante', valor: 12 }, { tipo: 'Sobrante', valor: 5 },
    { tipo: 'Dañado', valor: 8 },    { tipo: 'Error etiqueta', valor: 3 },
  ],
};