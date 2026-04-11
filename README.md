# CEDI-Vertiche

## Acerca del Proyecto

CEDI-Vertiche es un proyecto integral desarrollado en el bloque "Desarrollo de Software" del grupo 101. Este repositorio constituye el eje central del desarrollo colaborativo, integrando componentes de backend, base de datos, frontend y sistemas IoT para crear una solución completa y escalable.

## Índice de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)

## Estructura del Proyecto

El repositorio se organiza en los siguientes directorios:

### Configuración y Control de Versiones

- **`.github`** - Configuración de control de acceso y revisiones
  - Contiene la definición de CODEOWNERS para garantizar que los cambios en ramas críticas (integración y main) sean revisados por los miembros apropiados del equipo

### Backend

- **`backend/`** - Microservicios y APIs del sistema
  - `.../backend-monitoreo/` - API de monitoreo y supervisión
  - `.../backend-rfid/` - API de gestión RFID
  - `.../backend-ventas/` - API de gestión de ventas
  - Cada equipo tiene acceso a su carpeta correspondiente para desarrollar e implementar la lógica de negocio y comunicación con la base de datos

### Base de Datos

- **`data/`** - Definición, configuración y despliegue de bases de datos
  - `.../db-monitoreo/` - Base de datos de monitoreo
  - `.../db-ventas/` - Base de datos de ventas
  - Los equipos pueden contribuir con cambios de esquema o solicitar modificaciones según su rol

### Frontend

- **`frontend/`** - Interfaces de usuario y dashboards
  - `.../dashboard-monitoreo/` - Panel de control de monitoreo
  - `.../dashboard-ventas/` - Panel de control de ventas

### IoT e Hardware

- **`iot/`** - Scripts de comunicación e integración con hardware
  - `.../iot-rfid/` - Configuración y comunicación RFID
  - `.../iot-sorter/` - Configuración de sistemas de clasificación
  - Incluye scripts de inicialización, configuración de dispositivos y protocolos de comunicación

### Utilidades y Herramientas

- **`docs/`** - Documentación completa del proyecto
  - Guías de desarrollo, especificaciones técnicas y referencias de arquitectura

- **`scripts/`** - Herramientas auxiliares de desarrollo
  - Scripts para simulación de comportamientos
  - Herramientas de visualización provisional
  - Utilidades de prueba y validación
