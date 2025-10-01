# 🎫 Sistema de Turnos

Un sistema completo de gestión de turnos con dos interfaces: una pantalla para TV y un panel de operador.

## 🚀 Características

### 📺 Pantalla TV (Vista Principal)
- Muestra hasta 8 turnos en pantalla
- Actualización automática cada 5 segundos
- Modal de llamado con Text-to-Speech
- Diseño optimizado para pantallas grandes
- Fecha y hora en tiempo real

### 👩‍💼 Panel de Operador
- Crear nuevos turnos
- Llamar al siguiente turno en espera
- Actualizar estados de turnos
- Ver estadísticas en tiempo real
- Gestión completa de turnos

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- Sequelize ORM
- MySQL
- CORS configurado

### Frontend
- React 18
- Vite
- React Router
- Axios
- Web Speech API

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MySQL
- npm o yarn

## ⚙️ Configuración

### 1. Configurar Base de Datos

Crear una base de datos MySQL:
```sql
CREATE DATABASE turnero_db;
```

### 2. Configurar Variables de Entorno

Editar el archivo `server/.env`:
```env
# Configuración de la Base de Datos
DB_NAME=turnero_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306

# Configuración del Servidor
PORT=3000
```

### 3. Iniciar el Sistema

#### Opción 1: Script Automático
```bash
./start.sh
```

#### Opción 2: Manual

Terminal 1 - Backend:
```bash
cd server
npm install
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm install
npm run dev
```

## 🌐 URLs de Acceso

- **Pantalla TV**: http://localhost:5173
- **Panel Operador**: http://localhost:5173/operador
- **API Backend**: http://localhost:3000/api/turnos

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/turnos` | Obtener todos los turnos |
| POST | `/api/turnos` | Crear nuevo turno |
| PUT | `/api/turnos/:id` | Actualizar estado de turno |
| DELETE | `/api/turnos/:id` | Eliminar turno |
| POST | `/api/turnos/llamar-siguiente` | Llamar siguiente turno |

## 🎯 Uso del Sistema

### Para el Operador:
1. Acceder al panel de operador
2. Crear turnos ingresando el nombre del cliente
3. Usar "Llamar Siguiente" para llamar al próximo turno
4. Gestionar estados de turnos (atendido, ausente, etc.)

### Para la Pantalla TV:
1. La pantalla se actualiza automáticamente
2. Cuando se llama un turno, aparece un modal destacado
3. Se reproduce el anuncio por voz automáticamente
4. Los turnos cambian de color según su estado

## 🎨 Estados de Turnos

- **Esperando**: Turno en cola (gris)
- **Llamado**: Turno siendo llamado (amarillo + modal)
- **Atendido**: Turno completado (verde)
- **Ausente**: Cliente no se presentó (rojo)

## 🔧 Desarrollo

### Estructura del Proyecto
```
turnos/
├── server/          # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── index.js
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── index.html
└── start.sh         # Script de inicio
```

### Scripts Disponibles

#### Server
- `npm run dev` - Desarrollo con nodemon
- `npm start` - Producción

#### Client
- `npm run dev` - Desarrollo con Vite
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 🐛 Troubleshooting

### Problema: Error de conexión a la base de datos
- Verificar que MySQL esté corriendo
- Revisar credenciales en `.env`
- Asegurar que la base de datos existe

### Problema: CORS errors
- Verificar que el backend esté corriendo en puerto 3000
- Revisar configuración de CORS en `server/index.js`

### Problema: Text-to-Speech no funciona
- Asegurar que el navegador soporte Web Speech API
- Verificar permisos de audio en el navegador
- Funciona mejor en Chrome/Edge

## 📝 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Reportes y estadísticas
- [ ] Múltiples ventanillas
- [ ] Integración con impresora de tickets
- [ ] Modo offline
- [ ] Tema personalizable

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.