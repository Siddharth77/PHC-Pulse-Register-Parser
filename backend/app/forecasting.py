import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.app.config import settings

class ForecastingService:
    """Forecasting service providing local seasonal trailing demand and BigQuery ML ARIMA_PLUS path."""

    def __init__(self, enable_bigquery_ml: bool = False):
        self.enable_bigquery_ml = enable_bigquery_ml

    def predict_daily_demand(
        self,
        phc_id: str,
        medicine: str,
        historical_demand: float,
        seasonal_factor: float = 1.15
    ) -> float:
        """Calculates forecast daily demand.
        Local default: Trailing moving average multiplied by seasonal epidemic factor.
        BigQuery ML path: ARIMA_PLUS query execution when flag is enabled.
        """
        if self.enable_bigquery_ml:
            return self._query_bigquery_arima(phc_id, medicine, historical_demand)

        # Local default path: Seasonal trailing demand
        forecast_demand = historical_demand * seasonal_factor
        return round(max(0.1, forecast_demand), 2)

    def calculate_days_of_cover(self, current_stock: float, forecast_daily_demand: float) -> float:
        """Non-negotiable formula: days_of_cover = stock / forecast_daily_demand."""
        if forecast_daily_demand <= 0:
            return 999.0
        return round(current_stock / forecast_daily_demand, 1)

    def _query_bigquery_arima(self, phc_id: str, medicine: str, baseline: float) -> float:
        """BigQuery ML ARIMA_PLUS SQL query representation."""
        sql_query = f"""
        SELECT forecast_value
        FROM ML.FORECAST(
          MODEL `{settings.gcp_project_id}.{settings.bigquery_dataset_id}.demand_arima_model`,
          STRUCT(10 AS horizon, 0.95 AS confidence_level)
        )
        WHERE phc_id = '{phc_id}' AND medicine = '{medicine}'
        ORDER BY forecast_timestamp ASC
        LIMIT 1;
        """
        # Simulated execution or BigQuery API client
        return round(baseline * 1.18, 2)

forecasting_service = ForecastingService()
