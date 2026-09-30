# PHC Pulse - Cloud Run Backend Microservices

FastAPI + Google GenAI + OR-Tools microservice backend powering PHC Pulse.

## Phase 2a Features Built
- **Pydantic API Contract**: Exact models matching `openapi.yaml`.
- **Dual Data Access Layer**: `LocalFileDataAccess` (`USE_LOCAL_DATA=true`) for offline synthetic data execution and `CloudDataAccess` for Firestore/BigQuery production deployment.
- **Pre-LLM Scope Filtering Middleware**: Strict role-based geographic scoping for `PHC_STAFF`, `DISTRICT_OFFICER`, and `STATE_OFFICER`.
- **Core Endpoints**:
  - `GET /health`
  - `GET /config`
  - `GET /snapshot`
  - `POST /scenario` (Outbreak demand multiplier & risk level recalculations)

## Local Run Instructions

### 1. Install Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Run API Locally
```bash
export USE_LOCAL_DATA=true
uvicorn backend.app.main:app --reload --port 8080
```
Open [http://localhost:8080/docs](http://localhost:8080/docs) for interactive Swagger API documentation.

### 3. Run Unit Tests
```bash
pytest backend/tests/
```

### 4. Build Docker Container Locally
```bash
docker build -t phc-pulse-backend -f backend/Dockerfile .
docker run -p 8080:8080 phc-pulse-backend
```
