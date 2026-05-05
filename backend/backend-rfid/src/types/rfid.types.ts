/*
    Este archivo define los tipos de datos relacionados con el sistema RFID, 
    incluyendo las etapas del proceso, eventos de etapa, 
    información de prepacks y progreso de órdenes.
    Author: Adrian Proano Bernal
*/

/*
    Definición de las etapas del proceso de manejo de prepacks,
    Se hizo algo llamado union type para definir las etapas posibles, esto permite que el código sea más legible y fácil de mantener.
    Basicamente le estamos diciendo a typescript que el tipo Etapa solo puede ser uno de los siguientes valores: 
    'Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria' o 'Envio'.
    Author: Adrian Proano Bernal
*/

export type Etapa = 
    | '' // Etapa vacía para prepacks que aún no han sido escaneados
    | 'Preregistro'
    | 'QA'
    | 'Registro'
    | 'Sorter'
    | 'Bahias'
    | 'Auditoria'
    | 'Envio'


/*
    Definicion de la interfaz EventoEtapa, que representa un evento que ocurre en una etapa específica del proceso de manejo de prepacks.
    Esta interfaz tiene tres propiedades:
    - etapa: de tipo Etapa, que indica en qué etapa ocurrió el evento.
    - timestamp: de tipo Date, que registra la fecha y hora en que ocurrió el evento.
    - readerId: de tipo string, que identifica el lector RFID que registró el evento.
    
    Utilizamos "interface" para definir la estructura de un objeto en TypeScript. 
    Esto nos permite asegurarnos de que cualquier objeto que se considere un 
    EventoEtapa tenga estas tres propiedades con los tipos correctos, y que typescript nos ayude a detectar errores 
    si intentamos crear un EventoEtapa sin alguna de estas propiedades o con un tipo incorrecto.
    
    Author: Adrian Proano Bernal
*/


export interface EventoEtapa {
    etapa: Etapa;
    timestamp: Date;
    readerId: string;
}

/*
    Definición de la interfaz Prepack, que representa un prepack en el sistema RFID.
    Esta interfaz tiene las siguientes propiedades:
    - id: de tipo string, que es un identificador único para el prepack.
    - orderId: de tipo string, que indica a qué orden pertenece el prepack.
    - currentEtapa: de tipo Etapa, que indica la etapa actual del prepack en el proceso.
    - historial: un array de objetos que siguen la estructura definida por la interfaz EventoEtapa, 
        que registra el historial de eventos del prepack a lo largo de las diferentes etapas.

    Author: Adrian Proano Bernal
*/

export interface Prepack {
    id: string;
    orderId: string;
    currentEtapa: Etapa;
    historial: EventoEtapa[];
}

/*
    Definición de la interfaz ProgresoEtapa, que representa el progreso de una etapa específica en el proceso de manejo de prepacks.
    Esta interfaz tiene las siguientes propiedades:
    - etapa: de tipo Etapa, que indica a qué etapa se refiere el progreso.
    - count: de tipo number, que indica cuántos prepacks han pasado por esa etapa.
    - total: de tipo number, que indica el número total de prepacks en la orden.
    - percentage: de tipo number, que representa el porcentaje de prepacks que han pasado por esa etapa en relación al total.

    Esta sera la respuesta que nuestro API mandara al frontend para mostrar el progreso de cada etapa en la interfaz de usuario.

    Author: Adrian Proano Bernal
*/


export interface ProgresoEtapa {
    etapa: Etapa;
    count: number;
    total: number;
    percentage: number;
}

/*
    Definición de la interfaz ProgresoOrden, que representa el progreso general de una orden en el proceso de manejo de prepacks.
    Esta interfaz tiene las siguientes propiedades:
    - orderId: de tipo string, que es el identificador único de la orden.
    - totalPrepacks: de tipo number, que indica el número total de prepacks asociados a la orden.
    - progresoEtapa: un array de objetos que siguen la estructura definida por la interfaz ProgresoEtapa, 
        que representa el progreso en cada etapa del proceso para esa orden.
    - prepacks: un array de objetos que siguen la estructura definida por la interfaz Prepack, 
        que representa los prepacks asociados a esa orden.

    Author: Adrian Proano Bernal
*/

export interface ProgresoOrden {
    orderId: string;
    totalPrepacks: number;
    progresoEtapa: ProgresoEtapa[];
    prepacks: Prepack[];
}