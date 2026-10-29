# VYROX: contexto del proyecto

## Qué es

VYROX es una plataforma web de analítica de fútbol en tiempo real. Toma datos estadísticos de los partidos, calcula pronósticos probabilísticos con modelos matemáticos (Poisson) y genera reportes en lenguaje natural con IA (Google Gemini).

**Problema que resuelve:** los datos deportivos son difíciles de interpretar. VYROX los convierte en métricas visuales y lecturas claras para el aficionado.

**Usuarios:** aficionados al fútbol, analistas de datos deportivos y comunidades interesadas en la analítica predictiva.

**Contexto académico:** es el proyecto formativo final de software de un equipo de aprendices del SENA. Se evalúa en una sustentación que exige documentación de software, diagramas de arquitectura y pruebas, así que esos entregables pesan tanto como el código.

## Etapa actual

Prototipo en desarrollo. Ya existen la maqueta UI/UX en Figma (tema oscuro) y la arquitectura base de frontend y backend; el código se construye en este repo. Hito 1 completo (partidos en vivo por liga, selector de fecha y Match Center con resumen, estadísticas, alineaciones y pronóstico) y pronósticos con Gemini integrados; falta el modelo Poisson del Hito 2.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| IA | Google Gemini API vía REST con `httpx`: alias `gemini-flash-latest` y, si está saturado o lento, `gemini-flash-lite-latest` (`gemini-2.5-flash` ya no responde) |
| Datos de partidos | API-Football (v3.football.api-sports.io), endpoint `/fixtures` |
| Persistencia | Ninguna: arquitectura stateless, sin base de datos. Solo caché en memoria en el backend (se pierde al reiniciar). Los equipos seguidos y el tema se guardan en `localStorage` del navegador. |

## Hitos

1. Llevar los datos en tiempo real desde la API externa hasta la interfaz.
2. Implementar la lógica predictiva (Poisson) en el backend.
3. Integrar la IA para generar los análisis automáticamente y pulir la entrega final para la sustentación.

## Reglas de arquitectura

- **El backend centraliza todas las consultas externas.** El frontend habla solo con el backend de VYROX. Las credenciales (la `API_FOOTBALL_KEY`, enviada en el header `x-apisports-key`, y la clave de Gemini) viven únicamente en `backend/.env`, que no se sube al repo.
- **Cuota de API-Football:** 100 peticiones por día en el plan gratuito. La caché en memoria del backend (`CACHE_TTL`, 300 s por defecto) existe para cuidar esa cuota; si la API falla o se agota la cuota, se sirven los últimos datos guardados.
- **Fechas:** `GET /api/matches?date=YYYY-MM-DD` (por defecto, hoy en Colombia; `timezone=America/Bogota`). El plan gratuito de API-Football solo sirve ayer, hoy y mañana; el backend rechaza otras fechas con 400 sin gastar cuota. La caché es por fecha, y un día ya terminado sin partidos en vivo no se vuelve a pedir.
- **Lista de partidos:** cada grupo y cada partido traen `league_id`, `league_name`, `country` ("World" en competiciones internacionales, que la interfaz muestra como "Internacional"), `league_logo` y `country_flag`. Orden de los grupos: primero las "Mejores ligas" en el orden de `TOP_LEAGUES` (`backend/app/api_football.py`), luego las competiciones internacionales y el resto por país y nombre.
- **Pantalla principal (estilo FotMob):** barra lateral con equipos seguidos, mejores ligas y directorio de todas las ligas por país (solo las que juegan ese día); panel central con ayer/hoy/mañana, filtros (Todos, En vivo, Por horario, búsqueda), bloque "★ Siguiendo" y ligas colapsables. Cada partido abre el Match Center. El logo VYROX vuelve al inicio: fecha de hoy, filtro "Todos", sin liga ni búsquedas.
- **Match Center:** `GET /api/matches/{id}/details` gasta 2 peticiones de API-Football por partido: `/fixtures?id` (eventos, alineaciones y estadísticas) y `/fixtures/headtohead`. El plan gratuito no acepta el parámetro `last`, así que el backend recibe todo el historial y se queda con los 5 últimos partidos terminados, sin contar el propio partido. Caché por partido: 120 s si está en vivo, 6 h si terminó y, si no ha empezado, hasta el inicio. El H2H se guarda 6 h por pareja de equipos. El encabezado (minuto, jornada, estadio, árbitro) sale de `/api/matches` y no gasta cuota.
- **Datos simulados:** si un partido ya jugado no trae alineaciones o estadísticas (ligas sin cobertura) o no hay API key, el backend genera datos de demostración estables por partido y los marca en `simulated`; la interfaz muestra el aviso "Datos simulados". Nunca se envían a Gemini.
- **Marca VYROX IA:** de cara al usuario el motor de pronósticos se llama "VYROX IA" (marca blanca); por dentro usa la API de Google Gemini. El prompt le pide presentarse como VYROX IA y no nombrarse como Gemini.
- **Pronósticos IA:** `POST /api/predictions` pide a Gemini un JSON con esquema fijo (ganador, probabilidades, ambos anotan, más/menos de 2.5, confianza, apuesta recomendada, justificación). El prompt incluye el H2H y las estadísticas reales del partido (del Match Center) para que Gemini cite datos concretos. Cada pronóstico se guarda 6 horas por `match_id`. Sin `GEMINI_API_KEY` o si Gemini falla, responde 200 con `fallback: true` y un mensaje.
- **Cuota justa VYROX:** el pronóstico también pide la probabilidad de la apuesta recomendada, de más de 2.5 goles y de ambos anotan; el backend devuelve `fair_odds` = 100 ÷ probabilidad (sin margen de casa). La pestaña la muestra con un simulador de retorno en COP. No se muestran cuotas de casas de apuestas: API-Football no cubre BetPlay, Rushbet, Wplay ni Codere, y no se inventan cuotas a nombre de empresas reales.
- **Temas claro y oscuro** con la paleta y las tipografías del brandbook (Inter Tight para la interfaz, Space Grotesk para los números). Los colores que cambian con el tema son variables CSS en `frontend/src/index.css` (`surface`, `ink`, `muted`, `chip`…); los colores de marca (`cream`, `forest`, `yellow`, `orange`, `peach`, `sky`) son fijos. El conmutador sol/luna de la cabecera guarda la elección en `localStorage` (`vyrox_theme`); sin elección, se sigue la preferencia del sistema.

## Idioma

- Código (variables, funciones, comentarios): inglés, con buenas prácticas.
- Interfaz y documentación del proyecto: español.

## Fuera de alcance

Apuestas con dinero real, pagos y transmisiones en vivo (streaming).
