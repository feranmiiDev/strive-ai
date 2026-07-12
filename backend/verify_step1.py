import sys
import os

# Add the backend directory to python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from utils import load_models

try:
    print("Attempting to load models...")
    models = load_models()
    print("Models and scalers loaded successfully!")
    print("Feature columns expected by model:", models["feature_columns"])
    print("Regressor type:", type(models["rf_reg"]))
    print("Classifier type:", type(models["xgb_clf"]))
    print("Scaler Regressors type:", type(models["scaler_reg"]))
    print("Scaler Classifier type:", type(models["scaler_clf"]))
except Exception as e:
    print("Error loading models:", e)
    sys.exit(1)
sys.exit(0)
