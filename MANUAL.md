# Manual Técnico y de Usuario: Rifas Los Andes

## 1. Introducción

Este documento proporciona una descripción técnica detallada de la aplicación "Rifas Los Andes", así como una guía para su administración. El objetivo es servir como referencia completa para desarrolladores que necesiten mantener o extender la aplicación y para administradores que gestionen el contenido y las rifas.

La aplicación es una plataforma web completa que permite a los administradores crear y gestionar rifas online, y a los usuarios comprar boletos para participar en ellas.

### 1.1. Tecnologías Principales

El proyecto sigue una arquitectura de microservicios desacoplada, con un frontend y un backend independientes que se comunican a través de una API REST.

- **Backend:**
  - **Framework:** NestJS (basado en Node.js y Express.js)
  - **Lenguaje:** TypeScript
  - **Base de Datos:** MongoDB (con Mongoose como ODM)
  - **Autenticación:** Passport.js con estrategias JWT (JSON Web Tokens)

- **Frontend:**
  - **Framework:** Next.js (basado en React)
  - **Lenguaje:** TypeScript
  - **Estilos:** Tailwind CSS

- **Entorno y Despliegue:**
  - **Orquestación:** Docker y Docker Compose
  - **Servidor Web / Proxy Inverso:** Nginx
  - **Certificados SSL:** Let's Encrypt

---

## 2. Arquitectura General

La aplicación se compone de cuatro servicios principales orquestados por Docker Compose:

1.  **`frontend`**: La aplicación Next.js que los usuarios ven en su navegador. Se encarga de la interfaz de usuario, la interacción y la presentación de datos.
2.  **`backend`**: El servidor NestJS que expone una API REST. Contiene toda la lógica de negocio, gestiona los datos y se comunica con la base de datos.
3.  **`db`**: La base de datos MongoDB donde se almacena toda la información persistente (usuarios, rifas, boletos, etc.).
4.  **`nginx`**: Actúa como un proxy inverso. Dirige el tráfico del dominio principal al servicio `frontend` y el tráfico de la ruta `/api` al servicio `backend`. También gestiona los certificados SSL para una comunicación segura (HTTPS).

A continuación, un diagrama que ilustra este flujo:

```mermaid
graph TD
    A[Usuario] -- HTTPS --> B(Nginx Proxy);

    subgraph Servidor Docker
        B -- rifalosandes.es --> C[Frontend (Next.js)];
        B -- api.rifalosandes.es --> D[Backend (NestJS)];
        D <--> E[DB (MongoDB)];
    end
```

---

## 3. Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

```
/
├── backend/         # Código fuente del servidor (NestJS)
├── frontend/        # Código fuente del cliente (Next.js)
├── .env             # Variables de entorno (no versionado)
├── docker-compose.yml # Orquestación de servicios para producción
├── docker-compose.dev.yml # Orquestación para desarrollo local
├── nginx.conf       # Configuración del proxy inverso Nginx
└── MANUAL.md        # Este manual
```

---

## 4. Análisis del Backend

El backend es el núcleo de la aplicación. Gestiona la lógica de negocio, la seguridad y la persistencia de datos.

### 4.1. Módulos Principales

El código está organizado en módulos, cada uno con una responsabilidad específica:

- **`auth`**: Gestiona la autenticación de usuarios (login) y la protección de rutas mediante JWT.
- **`user`**: Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para los usuarios.
- **`raffle`**: Lógica de negocio para las rifas, incluyendo la creación, actualización y obtención de la rifa activa.
- **`promotion`**: Gestión de promociones asociadas a las rifas.
- **`ticket`**: Lógica para la creación y consulta de boletos vendidos.
- **`content`**: Gestión de contenido dinámico para el frontend (ej. textos, imágenes de la página principal).
- **`upload`**: Manejo de la subida de archivos (imágenes, etc.).
- **`settings`**: Configuraciones generales de la aplicación.

### 4.2. Endpoints de la API

A continuación se describen los endpoints más importantes. Todos están prefijados con `/api` por Nginx.

#### Módulo `Raffle` (`/raffle`)
- `GET /active-details`: **(Público)** Obtiene los detalles de la rifa activa y sus promociones.
- `GET /active-with-tickets`: **(Público)** Obtiene la rifa activa y la lista de boletos vendidos.
- `GET /`: **(Admin)** Obtiene todas las rifas.
- `POST /`: **(Admin)** Crea una nueva rifa.
- `PUT /:id`: **(Admin)** Actualiza una rifa existente.
- `DELETE /:id`: **(Admin)** Elimina una rifa.

#### Módulo `Ticket` (`/ticket`)
- `POST /`: **(Público)** Crea un nuevo boleto (simula una compra).
- `GET /by-raffle/:raffleId`: **(Público)** Obtiene los boletos de una rifa específica.
- `GET /`: **(Admin)** Obtiene todos los boletos.

#### Módulo `Auth` (`/auth`)
- `POST /login`: **(Público)** Autentica a un usuario y devuelve un token JWT.
- `GET /profile`: **(Admin)** Obtiene el perfil del usuario autenticado.

### 4.3. Modelos de Datos (Schemas)

- **`Raffle`**: Almacena la información de una rifa (nombre, premio, precio del boleto, total de boletos, estado, etc.).
- **`Ticket`**: Representa un boleto vendido (número, datos del comprador, rifa asociada).
- **`User`**: Guarda la información de los administradores (email, contraseña hasheada).
- **`Promotion`**: Almacena las promociones (ej. "3 boletos por $10").

---

## 5. Análisis del Frontend

El frontend es una Single Page Application (SPA) construida con Next.js, que ofrece una experiencia de usuario rápida y fluida.

### 5.1. Estructura del Código (`src`)

- **`pages/`**: Contiene las diferentes páginas de la aplicación. Cada archivo corresponde a una ruta URL. Por ejemplo, `pages/index.tsx` es la página de inicio y `pages/admin/dashboard.tsx` es el panel de administración.
- **`components/`**: Contiene componentes de React reutilizables (botones, modales, secciones de página, etc.).
- **`services/`**: Encapsula la comunicación con la API del backend. Cada servicio (ej. `raffle.service.ts`) se encarga de las llamadas a un módulo específico de la API.
- **`hooks/`**: Contiene hooks de React personalizados para reutilizar lógica con estado (ej. `useRaffleData`).
- **`styles/`**: Estilos globales y configuración de Tailwind CSS.
- **`types/`**: Definiciones de tipos de TypeScript para un código más seguro y mantenible.

### 5.2. Flujo de Datos

1.  Una página (ej. `pages/index.tsx`) utiliza un hook (ej. `useRaffleData`).
2.  El hook llama a una función de un servicio (ej. `RaffleService.getActiveRaffleDetails()`).
3.  El servicio realiza una petición HTTP (usando `axios` o `fetch`) al endpoint correspondiente del backend (ej. `GET /api/raffle/active-details`).
4.  El backend procesa la petición y devuelve los datos en formato JSON.
5.  El servicio recibe la respuesta y la devuelve al hook, que actualiza el estado del componente.
6.  React renderiza de nuevo la página con los datos obtenidos.

---

## 6. Guía de Inicio Rápido (Desarrollo Local)

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

**Requisitos:**
- Docker
- Docker Compose

**Pasos:**

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd RifasLosAndes
    ```

2.  **Crear archivos de entorno:**
    Copia los archivos `.env.example` a `.env` tanto en el directorio raíz, como en `backend/` y `frontend/`. Ajusta las variables si es necesario (para desarrollo local, los valores por defecto suelen ser suficientes).
    ```bash
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```

3.  **Levantar los servicios con Docker Compose:**
    Usa el archivo `docker-compose.dev.yml` que está configurado para desarrollo con hot-reloading.
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

4.  **Acceder a la aplicación:**
    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:8000](http://localhost:8000)

---

## 7. Guía Detallada del Panel de Administración

Esta sección sirve como un manual de usuario completo para el administrador de la plataforma "Rifas Los Andes".

### 7.1. Acceso e Inicio de Sesión

Para comenzar a gestionar la plataforma, navega a la siguiente URL en tu navegador:

- **URL de Acceso:** `https://rifalosandes/admin/login`

Se te presentará una pantalla de inicio de sesión donde deberás ingresar tus credenciales (email y contraseña) proporcionadas por el equipo de desarrollo.

### 7.2. Dashboard (Panel Principal)

Una vez que inicies sesión, serás redirigido al **Dashboard**. Esta es la pantalla principal y te ofrece una vista rápida del estado de la rifa que se encuentra activa en ese momento.

Aquí encontrarás:

- **Nombre de la Rifa Activa:** Identifica claramente qué sorteo está en curso.
- **Barra de Progreso de Boletos:** Un gráfico visual que muestra el porcentaje y la cantidad de boletos:
  - **Vendidos:** Boletos cuya compra ha sido confirmada.
  - **Reservados:** Boletos que han sido seleccionados por un usuario pero cuyo pago aún no se ha completado.
  - **Disponibles:** Boletos que aún nadie ha seleccionado.
- **Resumen de Ingresos:**
  - **Total Recaudado:** La suma de dinero generada por los boletos vendidos.
  - **Proyección Pendiente:** Los ingresos potenciales si todos los boletos reservados se pagan.
  - **Proyección Total:** Los ingresos máximos posibles si se venden todos los boletos de la rifa.
- **Botón "Ver estadísticas":** Te lleva a una vista más detallada con gráficos y análisis de ventas.

### 7.3. Gestión de Rifas

Esta es la sección más importante del panel. Para acceder, haz clic en **"Rifas"** en el menú de navegación lateral.

#### A. Listado de Rifas

Verás una tabla con todas las rifas que has creado. Cada fila muestra:
- Nombre, Premio, Precio, Total de Boletos y **Estado** (`Activa` o `Inactiva`).

**Importante:** Solo puede haber **una rifa activa** a la vez. La rifa activa es la que se muestra a los visitantes en la página principal.

#### B. Acciones sobre una Rifa

En la columna "Acciones", tienes varios botones para cada rifa:

- **Activar/Desactivar:** Cambia el estado de la rifa. Si activas una, cualquier otra que estuviera activa se desactivará automáticamente.
- **Inicializar Boletos:** **(Acción Crítica)** Este botón crea la numeración completa de boletos para una rifa (ej. del 0001 al 5000). **Debes ejecutar esta acción después de crear una rifa para que los boletos puedan ser vendidos.** Si se vuelve a ejecutar, borrará los boletos existentes y los volverá a crear (perdiendo el estado de vendido/reservado).
- **Ver:** Te lleva a una vista de solo lectura de los detalles de la rifa.
- **Editar:** Abre el formulario para modificar los detalles de la rifa.
- **Boletos:** Te lleva a la lista completa de boletos de esa rifa para ver su estado individual.
- **Eliminar:** Borra permanentemente la rifa y todos sus datos asociados. **Esta acción no se puede deshacer.**

#### C. Crear o Editar una Rifa

Al hacer clic en "Crear nueva rifa" o "Editar", accederás a un formulario con los siguientes campos:

- **Nombre de la Rifa:** (Ej: "Rifa Especial Día de la Madre"). *Requerido*.
- **Premio:** Descripción del premio a sortear. *Requerido*.
- **Total de Boletos:** La cantidad total de boletos que tendrá la rifa (ej: 5000). *Requerido*.
- **Precio por Boleto:** El costo de un solo boleto. *Requerido*.
- **Método de Sorteo:** Explica cómo se elegirá al ganador (ej: "Con los últimos 4 dígitos de la Lotería Nacional del 24 de Diciembre").
- **¿Está Activa?:** Marca esta casilla si quieres que esta rifa sea la que se muestre en la página principal.

#### D. Gestión de Promociones

Dentro del mismo formulario de creación/edición de rifas, puedes definir promociones:

- **Añadir Promoción:** Crea paquetes especiales (ej. "3 boletos por $25").
- Para cada promoción, debes definir:
  - **Cantidad:** El número de boletos que incluye el paquete.
  - **Precio:** El costo total del paquete.
  - **Descripción:** Un texto breve que aparecerá en el botón de la promoción.

### 7.4. Gestión de Contenido

Esta sección te permite modificar la mayoría de los textos e imágenes del sitio web público sin necesidad de editar código. Para acceder, haz clic en **"Contenido"** en el menú lateral.

La página de gestión de contenido está organizada en pestañas. Selecciona la pestaña que deseas editar (ej. "Hero Principal") y luego haz clic en el botón **"Editar"** para ir al formulario correspondiente.

#### A. Editar la Sección Principal (Hero)

Esta es la primera sección que ven los visitantes. Aquí puedes cambiar:
- **Título y Subtítulo:** Los textos principales del banner.
- **Descripción:** Un párrafo breve que aparece en el banner.
- **Texto del Botón:** El texto del botón principal (ej. "Comprar Boletos").
- **Imagen de Fondo:** Puedes subir una nueva imagen desde tu computadora o seleccionar una ya existente desde la galería de medios del sitio.

#### B. Editar las Preguntas Frecuentes (FAQ)

En la pestaña de **"Preguntas Frecuentes"**, puedes:
- **Añadir nuevas preguntas:** Haz clic en "Añadir FAQ" para crear una nueva entrada.
- **Editar preguntas existentes:** Modifica la pregunta o la respuesta.
- **Eliminar preguntas:** Borra las preguntas que ya no son relevantes.
- **Reordenar:** Arrastra y suelta las preguntas para cambiar el orden en que aparecen.

#### C. Editar Métodos de Pago

De manera similar a las FAQs, en la pestaña **"Métodos de Pago"** puedes añadir, editar, eliminar y reordenar los íconos y la información de los métodos de pago aceptados.

### 7.5. Gestión de Archivos (Media)

Al hacer clic en **"Archivos"** en el menú lateral, accedes a la biblioteca de medios. Aquí puedes:
- **Subir nuevos archivos:** Arrastra y suelta imágenes o documentos para subirlos al servidor.
- **Ver archivos existentes:** Visualiza todos los archivos que se han subido.
- **Copiar URL:** Haz clic en un archivo para copiar su URL. Esta URL es la que debes pegar en los campos de imagen (como en la sección Hero) si no deseas subir una imagen nueva.

### 7.6. Otras Secciones

- **Perfil:** Te permite cambiar tu propia contraseña de administrador.
- **Usuarios:** (Si tienes los permisos adecuados) Te permite ver, crear y gestionar otros usuarios administradores.
- **Configuración:** Contiene ajustes técnicos de la aplicación que generalmente no necesitan ser modificados.
