# VYROX: contexto del proyecto

## Qué es

VYROX es una plataforma web de analítica de fútbol en tiempo real. Toma datos estadísticos de los partidos, calcula pronósticos probabilísticos con modelos matemáticos (Poisson) y genera reportes en lenguaje natural con IA (Google Gemini).

**Problema que resuelve:** los datos deportivos son difíciles de interpretar. VYROX los convierte en métricas visuales y lecturas claras para el aficionado.

**Usuarios:** aficionados al fútbol, analistas de datos deportivos y comunidades interesadas en la analítica predictiva.

**Contexto académico:** es el proyecto formativo final de software de un equipo de aprendices del SENA. Se evalúa en una sustentación que exige documentación de software, diagramas de arquitectura y pruebas, así que esos entregables pesan tanto como el código.

## Etapa actual

Prototipo en desarrollo desde cero. Ya existen la maqueta UI/UX en Figma (tema oscuro) y la arquitectura base de frontend y backend; el código se construye en este repo.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| IA | Google Gemini API |
| Datos de partidos | API-Football (v3.football.api-sports.io), endpoint `/fixtures` |
| Persistencia | Por definir según los requisitos de almacenamiento del SENA. Por ahora, caché en memoria en el backend. |

## Hitos

1. Llevar los datos en tiempo real desde la API externa hasta la interfaz.
2. Implementar la lógica predictiva (Poisson) en el backend.
3. Integrar la IA para generar los análisis automáticamente y pulir la entrega final para la sustentación.

## Reglas de arquitectura

- **El backend centraliza todas las consultas externas.** El frontend habla solo con el backend de VYROX. Las credenciales (la `API_FOOTBALL_KEY`, enviada en el header `x-apisports-key`, y la clave de Gemini) viven únicamente en `backend/.env`, que no se sube al repo.
- **Cuota de API-Football:** 100 peticiones por día en el plan gratuito. La caché en memoria del backend (`CACHE_TTL`, 300 s por defecto) existe para cuidar esa cuota; si la API falla o se agota la cuota, se sirven los últimos datos guardados.
- **Zona horaria:** los partidos se piden por la fecha de hoy en Colombia (`timezone=America/Bogota`).
- **Modo oscuro** como interfaz estándar, siguiendo la maqueta de Figma.

## Idioma

- Código (variables, funciones, comentarios): inglés, con buenas prácticas.
- Interfaz y documentación del proyecto: español.

## Fuera de alcance

Apuestas con dinero real, pagos y transmisiones en vivo (streaming).
