# VYROX

Plataforma web de analítica de fútbol en tiempo real con pronósticos probabilísticos y análisis con IA. Contexto completo del proyecto en [docs/proyecto.md](docs/proyecto.md).

Requisitos: Python 3.10+ y Node.js 20.19+.

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (en macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # pon tu API key de API-Football; sin key se sirven datos de ejemplo
uvicorn app.main:app --reload --env-file .env
```

Pruebas: `python -m pytest` dentro de `backend/`.

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Vite redirige las peticiones a `/api` hacia el backend en el puerto 8000, así que ambos deben estar corriendo.
