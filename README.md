# PTW Backend Starter (FastAPI + Postgres) — Windows friendly
- FastAPI + SQLAlchemy
- Psycopg **v3** (works well on Windows)
- Docker Compose with Postgres
- Simple role guard via `X-Role`
- Workflow + notification service stubs

## Windows Quickstart
### Docker
```powershell
copy .env.example .env
docker compose up --build
```
Open http://localhost:8000/docs

### Local Python
```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Set host to localhost in .env if not using Docker
python -m uvicorn app.main:app --reload
```
