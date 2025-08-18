# PTW Backend Starter (FastAPI + Postgres) — Windows friendly
- FastAPI + SQLAlchemy
- Psycopg **v3** (works well on Windows)
- Docker Compose with Postgres
- Simple role guard via `X-Role`
- Workflow + notification service stubs

## Windows Quickstart
### Docker
```powershell
cd "C:\Users\G14\OneDrive\Documents\work_iotra\PTW\ptw_backend_starter" # or wherever you unzipped the project
copy .env
docker compose up --build
```
Open http://localhost:8000/docs

### Local Python
```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env
# Set host to localhost in .env if not using Docker
python -m uvicorn app.main:app --reload
```
