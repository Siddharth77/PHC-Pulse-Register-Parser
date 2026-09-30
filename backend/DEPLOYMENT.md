# PHC Pulse - GCP Cloud Run Deployment Guide

Complete production deployment guide for PHC Pulse backend microservices on Google Cloud Run.

---

## Environment Variables Table

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | Yes | `8080` | Port for Cloud Run HTTP traffic. |
| `USE_LOCAL_DATA` | Yes | `false` | Set to `false` for live Firestore/BigQuery mode, `true` for synthetic offline mode. |
| `IS_SIMULATION` | Yes | `true` | Explicit simulation disclosure flag. |
| `GEMINI_API_KEY` | Yes | Secret Manager | Google GenAI API key. |
| `GEMINI_MODEL_PARSER` | Yes | `gemini-3.8-flash` | Gemini model alias for register OCR/voice parsing. |
| `GEMINI_MODEL_QA` | Yes | `gemini-3.8-flash` | Gemini model alias for grounded supply chain Q&A. |
| `GEMINI_MODEL_EXPLAIN` | Yes | `gemini-3.8-flash` | Gemini model alias for transfer order rationales. |
| `GEMINI_MODEL_ALERT` | Yes | `gemini-3.8-flash` | Gemini model alias for drafting early warning alerts. |
| `GCP_PROJECT_ID` | Yes | Project ID | GCP Project ID. |
| `FIRESTORE_DATABASE_ID` | Optional | `(default)` | Firestore database ID. |
| `BIGQUERY_DATASET_ID` | Optional | `phc_pulse_dw` | BigQuery dataset ID for demand forecasts. |

---

## 1. Google Cloud Service Account Setup (Least Privilege)

```bash
# Set GCP Project
export PROJECT_ID="phc-pulse-prod"
gcloud config set project $PROJECT_ID

# Create Service Account
gcloud iam service-accounts create phc-pulse-runner \
    --description="Least privilege runner for PHC Pulse Backend" \
    --display-name="PHC Pulse Runner"

# Grant Firestore User & BigQuery Data Viewer roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:phc-pulse-runner@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:phc-pulse-runner@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"
```

---

## 2. Store Secrets in Secret Manager

```bash
# Create secret for Gemini API Key
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Add secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Service Account secret accessor role
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
    --member="serviceAccount:phc-pulse-runner@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

---

## 3. Deploy to Cloud Run

```bash
# Submit build via Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/phc-pulse-backend:latest -f backend/Dockerfile .

# Deploy to Cloud Run with Secret Manager binding
gcloud run deploy phc-pulse-backend \
    --image gcr.io/$PROJECT_ID/phc-pulse-backend:latest \
    --region asia-south1 \
    --platform managed \
    --allow-unauthenticated \
    --service-account phc-pulse-runner@$PROJECT_ID.iam.gserviceaccount.com \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
    --set-env-vars="USE_LOCAL_DATA=false,IS_SIMULATION=true,GEMINI_MODEL_PARSER=gemini-3.8-flash,GEMINI_MODEL_QA=gemini-3.8-flash,GEMINI_MODEL_EXPLAIN=gemini-3.8-flash,GEMINI_MODEL_ALERT=gemini-3.8-flash,GCP_PROJECT_ID=$PROJECT_ID"
```

---

## 4. Setup Cloud Scheduler for Periodic Forecast Runs

```bash
# Create Cloud Scheduler job to recompute daily forecasts every morning at 06:00 AM IST
gcloud scheduler jobs create http phc-pulse-daily-forecast \
    --schedule="0 6 * * *" \
    --time-zone="Asia/Kolkata" \
    --uri="https://phc-pulse-backend-xyz.a.run.app/scenario" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"disease_class":"fever_vector","demand_increase_pct":0,"horizon_days":10}'
```

---

## 5. Deployment Pre-Flight Checklist

- [x] All Gemini model aliases configured via environment variables.
- [x] Pre-LLM scope filtering tested and verified across `PHC_STAFF`, `DISTRICT_OFFICER`, and `STATE_OFFICER`.
- [x] No raw patient data or PII present in logs or payloads.
- [x] All impact numbers and federated models explicitly labeled as simulated.
- [x] CORS enabled for Firebase Hosting domain.
