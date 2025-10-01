#!/bin/bash

echo "🚀 Iniciando Sistema de Turnos"

# Configurar variables de entorno si no existen
if [ ! -f server/.env ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando .env.example..."
    cp server/.env.example server/.env 2>/dev/null || echo "ℹ️  Configura manualmente el archivo server/.env"
fi

# Función para matar procesos al recibir señal
cleanup() {
    echo "🛑 Cerrando aplicaciones..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

# Capturar señales para cleanup
trap cleanup SIGINT SIGTERM

echo "📦 Instalando dependencias del servidor..."
cd server
npm install

echo "📦 Instalando dependencias del cliente..."
cd ../client
npm install

echo "🔧 Iniciando servidor backend en puerto 3000..."
cd ../server
npm run dev &
SERVER_PID=$!

# Esperar a que el servidor esté listo
sleep 3

echo "🖥️  Iniciando cliente frontend en puerto 5173..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo "✅ Sistema iniciado!"
echo "📺 Pantalla TV: http://localhost:5173"
echo "👩‍💼 Panel Operador: http://localhost:5173/operador"
echo "🔧 API Backend: http://localhost:3000/api/turnos"
echo ""
echo "Presiona Ctrl+C para detener el sistema"

# Esperar a que los procesos terminen
wait