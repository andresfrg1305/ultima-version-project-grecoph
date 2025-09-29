# Esquema de la Base de Datos (Firestore) para Grecoph

Este documento describe la estructura de datos que se utilizará en la base de datos NoSQL de Firebase Firestore. En lugar de "tablas" y "filas", Firestore utiliza "Colecciones" y "Documentos".

## Colecciones Principales

### 1. `profiles`

Almacena la información de todos los usuarios registrados en el sistema, tanto administradores como residentes.

- **Documento ID:** UID del usuario de Firebase Authentication.
- **Campos:**
  - `email`: (string) Email de inicio de sesión.
  - `fullName`: (string) Nombre completo del usuario.
  - `role`: (string) Rol del usuario. Puede ser `'admin'` o `'resident'`.
  - `phone`: (string) Número de teléfono de contacto.
  - `interiorNumber`: (number) Número del interior o torre donde vive.
  - `houseNumber`: (string) Identificador completo de la vivienda (Ej: "Int 5 Casa 101"). **Debe ser único**.
  - `paymentStatus`: (string) Estado de pagos de administración. Puede ser `'current'` (al día) o `'overdue'` (moroso).
  - `lastPaymentDate`: (timestamp) Fecha del último pago de administración realizado.
  - `createdAt`: (timestamp) Fecha de creación del perfil.

### 2. `vehicles`

Almacena la información de todos los vehículos registrados, vinculados a un residente.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `userId`: (string) El ID del documento del residente en la colección `profiles` (Esta es la "llave foránea").
  - `licensePlate`: (string) Placa del vehículo. **Debe ser única**.
  - `brand`: (string) Marca del vehículo (Ej: Renault).
  - `model`: (string) Modelo del vehículo (Ej: Sandero).
  - `color`: (string) Color del vehículo.
  - `active`: (boolean) Indica si el vehículo está actualmente asociado al residente.

### 3. `parkingSpots`

Contiene el estado de todos los parqueaderos físicos del conjunto residencial.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `spotNumber`: (string) Número del parqueadero (Ej: "P01"). **Debe ser único**.
  - `status`: (string) Estado actual. Puede ser `'available'`, `'occupied'`, `'assigned'`.
  - `location`: (string) Ubicación física (Ej: "Nivel 1").

### 4. `parkingAssignments`

Un registro histórico y actual de qué residente tiene asignado qué parqueadero.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `userId`: (string) ID del residente (`profiles`).
  - `vehicleId`: (string) ID del vehículo (`vehicles`).
  - `parkingSpotId`: (string) ID del parqueadero (`parkingSpots`).
  - `startDate`: (timestamp) Fecha de inicio de la asignación.
  - `endDate`: (timestamp) Fecha de fin de la asignación.
  - `paymentStatus`: (string) `'paid'` o `'unpaid'`.
  - `status`: (string) `'active'`, `'expired'`, `'cancelled'`.
  - `createdAt`: (timestamp) Fecha en que se creó el registro de asignación.

### 5. `communityProjects`

Almacena todas las propuestas de proyectos comunitarios.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `title`: (string) Título del proyecto.
  - `description`: (string) Descripción detallada.
  - `justification`: (string) Por qué es necesario el proyecto.
  - `priority`: (string) `'high'`, `'medium'`, `'low'`.
  - `budget`: (number) Presupuesto estimado en COP.
  - `status`: (string) `'proposal'`, `'voting'`, `'approved'`, `'rejected'`.
  - `votingDeadline`: (timestamp) Fecha límite para votar.
  - `createdBy`: (string) ID del usuario (`profiles`) que creó el proyecto.
  - `createdAt`: (timestamp) Fecha de creación.

### 6. `projectQuotes`

Almacena las cotizaciones asociadas a un proyecto.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `projectId`: (string) ID del proyecto (`communityProjects`).
  - `providerName`: (string) Nombre del proveedor.
  - `amount`: (number) Valor de la cotización.
  - `description`: (string) Detalles de la cotización.
  - `fileUrl`: (string) URL al archivo PDF de la cotización (almacenado en Firebase Storage).
  - `fileName`: (string) Nombre del archivo.

### 7. `projectVotes`

Registra los votos de los residentes en los proyectos.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `projectId`: (string) ID del proyecto (`communityProjects`).
  - `userId`: (string) ID del residente (`profiles`) que votó.
  - `voteChoice`: (string) ID de la cotización (`projectQuotes`) por la que se votó.
  - `createdAt`: (timestamp) Fecha del voto.

### 8. `notifications`

Almacena las notificaciones enviadas a los residentes.

- **Documento ID:** Autogenerado por Firestore.
- **Campos:**
  - `userId`: (string) ID del residente (`profiles`) que recibe la notificación.
  - `title`: (string) Título de la notificación.
  - `message`: (string) Contenido del mensaje.
  - `type`: (string) `'parking'`, `'project'`, `'general'`, `'payment'`.
  - `read`: (boolean) Indica si el residente ya la leyó.
  - `createdAt`: (timestamp) Fecha de envío.
