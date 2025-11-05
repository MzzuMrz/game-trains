# 🚂 Simulador de Tren: Tucumán - Retiro

Un simulador de trenes basado en navegador que replica fielmente el viaje ferroviario real desde la estación San Miguel de Tucumán hasta la estación Retiro (Buenos Aires), utilizando Three.js con una estética low-poly.

## 🎮 Características

- **Ruta Real**: 1,298 km a lo largo de la línea Ferrocarril General Bartolomé Mitre
- **11 Estaciones Principales**: Desde Tucumán hasta Buenos Aires
- **Física Realista**: Aceleración, frenado, momentum y efectos de gradiente
- **4 Zonas Ambientales**: Subtropical, semi-árido, pampas y urbano
- **Ciclo Día/Noche**: Sistema dinámico de iluminación
- **Múltiples Cámaras**: Vista de conductor, seguimiento, fija y cinemática
- **Cabina Inmersiva**: Interior detallado con tablero, controles y espejos
- **Efectos Realistas**: Vibración de cámara y balanceo basado en velocidad
- **Optimización por Chunks**: Carga dinámica del mundo para rendimiento óptimo

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd game-trains

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **W** | Acelerar |
| **S** | Frenar |
| **SPACE** | Freno de emergencia |
| **H** | Bocina |
| **C** | Cambiar modo de cámara |
| **+/-** | Acelerar/desacelerar tiempo |
| **P** | Pausar |

## 🗺️ Estaciones del Recorrido

1. **San Miguel de Tucumán** (0 km) - Provincia de Tucumán
2. **Banda del Río Salí** (12 km) - Provincia de Tucumán
3. **La Cocha** (155 km) - Provincia de Tucumán
4. **Santiago del Estero** (342 km) - Provincia de Santiago del Estero
5. **La Banda** (345 km) - Provincia de Santiago del Estero
6. **Pinto** (465 km) - Provincia de Santiago del Estero
7. **Ceres** (738 km) - Provincia de Santa Fe
8. **Rafaela** (862 km) - Provincia de Santa Fe
9. **Rosario Norte** (1080 km) - Provincia de Santa Fe
10. **San Nicolás** (1171 km) - Provincia de Buenos Aires
11. **Retiro** (1298 km) - Ciudad de Buenos Aires

## 🎨 Estilo Visual

- **Estética Low-Poly**: Geometría simplificada con flat shading
- **Paleta de Colores**: Tonos tierra cálidos transitando a verdes y grises urbanos
- **Límites de Vértices**:
  - Tren: 500-1000 vértices
  - Edificios: 100-300 vértices
  - Vegetación: 50-100 vértices

## 🛠️ Stack Tecnológico

- **Motor 3D**: Three.js
- **Física**: Cannon-es
- **Audio**: Howler.js
- **Estado**: Zustand
- **Build**: Vite

## 📁 Estructura del Proyecto

```
game-trains/
├── src/
│   ├── core/
│   │   ├── Game.js              # Clase principal del juego
│   │   └── CameraController.js  # Sistema de cámaras
│   ├── world/
│   │   ├── TrainModel.js        # Modelo 3D del tren
│   │   ├── CabinInterior.js     # Interior de cabina detallado
│   │   ├── TrackSystem.js       # Sistema de vías
│   │   └── ChunkedWorld.js      # Generación de mundo por chunks
│   ├── physics/
│   │   └── TrainPhysics.js      # Simulación física del tren
│   ├── managers/
│   │   ├── StationManager.js    # Gestión de estaciones
│   │   └── UIController.js      # Control de interfaz
│   ├── data/
│   │   └── stations.js          # Datos de estaciones
│   ├── utils/
│   │   └── helpers.js           # Funciones auxiliares
│   └── main.js                  # Punto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## 🎯 Características Implementadas

### Fase 1 - Core Engine
- ✅ Configuración básica del proyecto con Vite + Three.js
- ✅ Modelo de tren low-poly con locomotora y vagones
- ✅ Sistema de vías con curvas y gradientes
- ✅ Física realista del tren (aceleración, frenado, momentum)
- ✅ Sistema de cámaras con múltiples vistas
- ✅ 11 estaciones del recorrido real
- ✅ Generación de terreno por chunks
- ✅ 4 zonas ambientales (subtropical, semi-árido, pampas, urbano)
- ✅ Ciclo día/noche dinámico
- ✅ HUD completo con información del viaje
- ✅ Sistema de control por teclado

### Fase 1.5 - Enhanced Cabin View ⭐ NEW
- ✅ Interior de cabina completamente modelado
- ✅ Tablero de instrumentos con medidores funcionales
- ✅ Marco de parabrisas y limpiaparabrisas
- ✅ Palancas de acelerador y freno animadas
- ✅ Espejos retrovisores laterales
- ✅ Asientos de conductor y copiloto
- ✅ Efectos de vibración de cámara basados en velocidad
- ✅ Balanceo de cabeza (head bob) realista
- ✅ FOV ajustable por modo de cámara
- ✅ Rotación suave de cámara siguiendo la vía

## 🚧 Próximas Características

- [ ] Sistema de clima dinámico
- [ ] Audio espacial (motor, ambiente, bocina)
- [ ] Sistema de pasajeros con animaciones
- [ ] Tabla de horarios y puntuación
- [ ] Modos históricos (diferentes épocas)
- [ ] Sistema de guardado/carga
- [ ] Modo foto
- [ ] Logros y estadísticas

## 🎓 Uso Educativo

Este proyecto también sirve como recurso educativo sobre:
- Geografía argentina y sus diferentes regiones
- Historia del ferrocarril en Argentina
- Física de vehículos sobre rieles
- Desarrollo de juegos 3D en navegador

## 📝 Licencia

[Especificar licencia]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir cambios importantes.

## 📧 Contacto

[Información de contacto]

---

**¡Disfruta el viaje a través de Argentina! 🇦🇷🚂**
