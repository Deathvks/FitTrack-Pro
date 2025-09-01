# Pro Fitness Glass

Pro Fitness Glass es una aplicación web completa diseñada para ser tu compañero de fitness definitivo. Permite a los usuarios registrar sus entrenamientos, crear y gestionar rutinas personalizadas, y visualizar su progreso a lo largo del tiempo de una manera intuitiva y motivadora.

![Imagen de la interfaz de Pro Fitness Glass]

## ✨ Características Principales

* **Dashboard Interactivo:** Visualiza un resumen de tu actividad semanal, incluyendo sesiones, tiempo de entrenamiento y calorías quemadas.
* **Gestión de Rutinas:** Crea, edita y elimina rutinas de entrenamiento personalizadas con ejercicios específicos, series y repeticiones.
* **Registro de Entrenamientos:** Inicia una sesión de entrenamiento basada en tus rutinas, registra el peso y las repeticiones para cada serie y guarda el historial de tus sesiones.
* **Seguimiento de Progreso:** Analiza tu evolución con gráficos interactivos que muestran el progreso en el levantamiento de peso por ejercicio, la evolución de tu peso corporal y las calorías quemadas.
* **Calendario de Actividad:** Navega a través de un calendario para ver qué días has entrenado y acceder al detalle de cada sesión.
* **Autenticación Segura:** Sistema de registro e inicio de sesión de usuarios con autenticación basada en tokens JWT.
* **Perfil Personalizable:** Configura tus datos personales y objetivos de fitness para obtener un seguimiento más preciso.

## 🚀 Stack Tecnológico

La aplicación está construida con un stack moderno y eficiente, separado en dos componentes principales:

### Frontend

* **Framework:** React 19 con Vite.
* **Estilos:** Tailwind CSS para un diseño rápido, responsivo y personalizable.
* **Visualización de Datos:** Recharts para la creación de gráficos interactivos.
* **Iconos:** Lucide React.

### Backend

* **Framework:** Node.js con Express.
* **Base de Datos:** MySQL.
* **ORM:** Sequelize para la gestión de la base de datos y los modelos.
* **Autenticación:** JSON Web Tokens (JWT) con cookie-parser.
* **Validación:** express-validator para validar los datos de entrada en las rutas de la API.

## ⚙️ Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Prerrequisitos

* Node.js (v18 o superior)
* NPM o un gestor de paquetes compatible.
* Una instancia de base de datos MySQL en ejecución.

### 1. Configuración del Backend

```bash
# Navega al directorio del backend
cd backend

# Instala las dependencias
npm install

# Crea un archivo .env a partir del .env.example y configúralo
# con las credenciales de tu base de datos y un secreto para JWT.
# Ejemplo de .env:
# DB_HOST=localhost
# DB_USER=tu_usuario
# DB_PASSWORD=tu_contraseña
# DB_NAME=pro_fitness_glass
# JWT_SECRET=tu_secreto_super_secreto

# Ejecuta el servidor de desarrollo
npm start

# Navega al directorio del frontend
cd frontend

# Instala las dependencias
npm install

# Ejecuta el servidor de desarrollo
npm run dev

La aplicación frontend estará disponible en http://localhost:5173.