export interface DistribucionColor {
  color: string
  num_color: number
}

export interface DistribucionTalla {
  CH: number
  M: number
  G: number
  XG: number
}

export type EstadoPrepack = '' | 'preregistro' | 'qa' | 'registro' | 'sorter' | 'bahias' | 'auditoria' | 'envio'
export type EstadoOrden = 'en_proceso' | 'completada' | 'enviada'

export interface IPrepack {
  id_prepack: string
  modelo: string
  cantidad_total: number
  estado_actual: EstadoPrepack
  bahia_asignada: number
  distribucion_color: DistribucionColor[]
  distribucion_talla: DistribucionTalla
}

export interface IOrden {
  id_orden: string
  id_tienda?: string
  equipo?: string
  fecha_creacion: Date
  fecha_envio?: Date
  estado: EstadoOrden
  total_prepacks: number
  prepacks: IPrepack[]
}