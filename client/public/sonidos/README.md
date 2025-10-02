# Sonidos Personalizados para Turnos

## 📁 Cómo agregar tu sonido personalizado

### 1. **Archivo de sonido**
- Coloca tu archivo de audio en esta carpeta: `/client/public/sonidos/`
- **Nombre requerido:** `turno-pitido.mp3` (o cambia la extensión en el código)
- **Formatos soportados:** MP3, WAV, OGG, M4A

### 2. **Características recomendadas**
- **Duración:** 1-3 segundos (ideal 2 segundos)
- **Volumen:** Normalizado, sin distorsión
- **Tipo:** Sonido llamativo pero no molesto
- **Ejemplos:** Ding, campana, timbre, chime

### 3. **Ejemplos de sonidos que funcionan bien**
- ✅ Sonido de notificación de iPhone
- ✅ Ding de Windows
- ✅ Campana de hotel
- ✅ Chime de banco
- ✅ Sonido de timbre suave

### 4. **Si quieres cambiar el archivo**
Edita esta línea en `PantallaTurnos.jsx`:
```javascript
const audio = new Audio('/sonidos/turno-pitido.mp3')
```

Cambia `turno-pitido.mp3` por el nombre de tu archivo.

### 5. **Fallback automático**
Si el archivo no se encuentra o no puede reproducirse, el sistema usará automáticamente un sonido sintético simple.

## 🔧 Personalización avanzada

### Cambiar volumen
```javascript
audio.volume = 0.7 // 0.0 (silencio) a 1.0 (máximo)
```

### Usar múltiples sonidos
Puedes crear diferentes sonidos para diferentes tipos de turnos modificando la lógica en el código.

## 📝 Notas
- Los archivos deben estar en `public/sonidos/` para ser accesibles
- El navegador debe soportar el formato de audio elegido
- Prueba siempre con el botón 🔊 antes de usar en producción