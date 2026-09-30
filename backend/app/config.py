import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "PHC Pulse Backend API"
    environment: str = "development"
    use_local_data: bool = True
    is_simulation: bool = True
    
    # Gemini Model Aliases (non-hardcoded)
    gemini_model_parser: str = "gemini-3.8-flash"
    gemini_model_qa: str = "gemini-3.8-flash"
    gemini_model_explain: str = "gemini-3.8-flash"
    gemini_model_alert: str = "gemini-3.8-flash"
    
    # Secret Manager / Env API Keys
    gemini_api_key: str = ""
    
    # GCP Project Settings
    gcp_project_id: str = "phc-pulse-demo"
    firestore_database_id: str = "(default)"
    bigquery_dataset_id: str = "phc_pulse_dw"
    gcs_bucket_name: str = "phc-pulse-register-photos"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
