#!/usr/bin/env bash
# Este script se ejecuta antes del build en Render

echo "Instalando dependencias del servidor..."
cd server && npm install