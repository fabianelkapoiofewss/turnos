# 🎙️ Guía de Voces Text-to-Speech para Windows

## 🔍 Problema Identificado

En **Ubuntu + Firefox** tienes muchas voces porque:
- Linux tiene mejor soporte nativo para voces
- Firefox accede a más voces del sistema
- Los paquetes de idiomas suelen incluir voces adicionales

En **Windows + Brave** solo tienes 3 voces en inglés porque:
- Brave/Chromium tiene acceso limitado a las voces del sistema
- Windows por defecto solo instala voces básicas en inglés
- Las voces en español no están instaladas por defecto

## 🛠️ Soluciones para Windows

### 📥 Instalar Voces en Español en Windows

1. **Windows 10/11:**
   ```
   Configuración → Hora e idioma → Voz → Administrar voces
   ```
   O:
   ```
   Configuración → Accesibilidad → Narrador → Voz del Narrador
   ```

2. **Agregar idiomas:**
   ```
   Configuración → Hora e idioma → Idioma → Agregar un idioma
   → Buscar "Español" → Instalar
   → Opciones → Descargar paquete de voz
   ```

3. **Voces disponibles para español:**
   - **Helena** (es-ES) - Mujer
   - **Pablo** (es-ES) - Hombre  
   - **Sabina** (es-MX) - Mujer
   - **Raul** (es-MX) - Hombre

### 🌐 Alternativas de Navegador

1. **Google Chrome**: Suele tener mejor soporte que Brave
2. **Microsoft Edge**: Acceso completo a voces de Windows
3. **Firefox**: Buen soporte multiplataforma

### 🔧 Configuración del Sistema

```bash
# En PowerShell (como administrador):
# Listar voces instaladas
Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synthesizer.GetInstalledVoices() | Select-Object -ExpandProperty VoiceInfo
```

## 🎯 Mejoras Implementadas en el Sistema

### ✅ Detección Automática de Plataforma
- El sistema detecta si estás en Windows
- Busca voces específicas de Windows primero
- Fallback inteligente a voces disponibles

### ✅ Mensajes Adaptativos
- Si hay voces en español: mensaje en español
- Si solo hay inglés: mensaje en inglés
- Configuración automática optimizada

### ✅ Debug Mejorado
- Console.log muestra plataforma y voces disponibles
- Información de voz seleccionada
- Indicadores visuales mejorados

### ✅ Interfaz Optimizada
- Información específica para Windows
- Consejos para instalar más voces
- Selector compacto y funcional

## 🏆 Resultado Esperado

Después de instalar voces en español:
- **Antes**: 3 voces en inglés
- **Después**: 7+ voces (inglés + español)
- **Calidad**: Mucho mejor pronunciación en español

## 🚀 Prueba Rápida

1. Ejecuta el sistema actualizado
2. Ve a la pantalla TV (http://localhost:5173)
3. Abre la consola del navegador (F12)
4. Verás logs como:
   ```
   Voces disponibles: X
   Plataforma: Win32
   Voz seleccionada: Microsoft Helena - Spanish (Spain)
   ```

Si ves pocas voces, sigue los pasos de instalación arriba. ¡El sistema ahora está optimizado para Windows! 🎉