# Render Deployment Configuration

## Para el BACKEND (Web Service):
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Root Directory**: `/`

## Para el FRONTEND (Static Site):
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`
- **Root Directory**: `/`

## Variables de entorno necesarias:

### Backend:
- DB_NAME: nombre_de_tu_base_datos
- DB_USER: usuario_de_base_datos  
- DB_PASSWORD: password_de_base_datos
- DB_HOST: host_de_base_datos
- DB_PORT: 3306
- NODE_ENV: production
- FRONTEND_URL: https://tu-frontend.onrender.com

### Frontend:
- VITE_API_URL: https://tu-backend.onrender.com/api/turnos