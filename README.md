# NUVEXA Scout

NUVEXA Scout es una aplicación web local para supervisar y controlar un robot móvil **simulado**. Sirve para probar órdenes, observar cambios de estado y ensayar bloqueos lógicos por obstáculos. No controla hardware.

## Alcance y limitaciones

El modo de simulación está señalado en la interfaz. El movimiento, batería, conexión, sensor frontal y distancia son valores locales simulados; no hay ESP32, telemetría, cámara, Wi-Fi, MQTT ni WebSocket reales. La simulación no certifica seguridad ni previene colisiones físicas. El avance se bloquea ante el obstáculo crítico; giros y retroceso se permiten como maniobras del modelo. Retirar el obstáculo no reanuda el movimiento. La batería se mantiene fija en 86 %. El historial es temporal y se pierde al recargar.

## Requisitos

- Windows 10/11 de 64 bits.
- Node.js 20.9 o posterior (probado con Node.js 24.21.0) y npm.
- No se requieren cuentas, credenciales, hardware ni servicios externos.

## Tecnologías y estructura

- Next.js App Router, React, TypeScript estricto, CSS y Lucide.
- `src/domain/`: tipos, estado inicial y reglas de movimiento.
- `src/application/`: contrato `RobotController`.
- `src/infrastructure/simulation/`: adaptador en memoria y pruebas de dominio.
- `src/app/`: dashboard, metadatos y estilos adaptables.

## Instalar y ejecutar desde CMD

Abre CMD y ejecuta, en este orden:

```bat
cd /d "C:\Users\ASUS\Documents\EMPRENDIMIENTO\robotica\nuvexa-scout"
npm install
npm run dev
```

Abre `http://localhost:3000` en el navegador. Para detener el servidor, vuelve a CMD y pulsa `Ctrl+C`.

## Controles

- Botones del panel o flechas: avanzar, retroceder y girar.
- `Escape`: detener.
- El botón central rojo siempre está disponible.
- «Simular obstáculo» activa el bloqueo del avance; el control de sensor también permite simular desconexión.
- «Reiniciar» devuelve el modelo a su estado inicial seguro.

Los atajos no capturan teclas cuando se escribe en campos editables y al perder el foco de la ventana se envía una detención lógica.

## Comprobaciones

```bat
npm test
npm run typecheck
npm run lint
npm run build
```

Para servir la compilación de producción, después de `npm run build` ejecuta `npm run start` y abre de nuevo `http://localhost:3000`.

## Próxima etapa para hardware

1. Seleccionar ESP32, controladores, motores, batería y sensores con requisitos eléctricos y mecánicos definidos.
2. Acordar un protocolo con órdenes acotadas, secuencias, telemetría, estados y límites de tiempo.
3. Añadir un adaptador físico que implemente el contrato `RobotController`, manteniendo UI y dominio desacoplados.
4. Validar mensajes, rangos, estados y autorización en el dispositivo; diseñar comportamiento seguro ante datos inválidos.
5. Detectar pérdida de conexión con timeout y detener localmente en la controladora.
6. Incorporar una parada de emergencia independiente del navegador y validar primero sin motores, luego con ruedas elevadas y finalmente en una zona controlada.

Esta etapa requiere análisis de riesgos y pruebas físicas específicas. No está implementada en este MVP.
