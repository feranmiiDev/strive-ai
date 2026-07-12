import os
import pickle
import json
import pandas as pd

# Define paths relative to this file's location
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
MODEL_DIR = os.path.join(PROJECT_ROOT, "model")

# Cache loaded models/scalers to avoid loading them on every request
_models = {}

def get_model_path(filename: str) -> str:
    """Helper to get absolute path to a model file."""
    return os.path.join(MODEL_DIR, filename)

def load_models():
    """Loads and caches all ML models, scalers, and feature definitions."""
    global _models
    if _models:
        return _models

    required_files = {
        "rf_reg": "rf_reg.pkl",
        "xgb_clf": "xgb_clf.pkl",
        "scaler_reg": "scaler_reg.pkl",
        "scaler_clf": "scaler_clf.pkl",
        "feature_columns": "feature_columns.json"
    }

    loaded = {}
    for key, filename in required_files.items():
        filepath = get_model_path(filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Required model file not found: {filepath}")
        
        if filename.endswith(".json"):
            with open(filepath, "r") as f:
                loaded[key] = json.load(f)
        else:
            with open(filepath, "rb") as f:
                loaded[key] = pickle.load(f)
                
    _models = loaded
    return _models

#Step 2
def calculate_ca_score(attendance: float, midterm: float, assignment: float = 0.0, quiz: float = 0.0) -> float:
    """
    Computes CA score out of 100 based on raw inputs:
    - attendance: 0-100% (worth 10 marks)
    - midterm: 0-15 marks
    - assignment: 0-10 marks (defaults to 0)
    - quiz: 0-5 marks (defaults to 0)
    """
    attendance_mark = (attendance / 100.0) * 10.0
    raw_sum = midterm + assignment + quiz + attendance_mark
    ca_score = (raw_sum / 40.0) * 100.0
    return min(max(ca_score, 0.0), 100.0)

def get_grade_and_gp(score: float) -> tuple:
    """
    Converts a performance index (0-100) to standard letter grade
    and grade point on a 5.0 scale (Nigerian University Standard).
    """
    # Clip score just in case
    score = min(max(score, 0.0), 100.0)
    
    if score >= 70.0:
        return "A", 5.0
    elif score >= 60.0:
        return "B", 4.0
    elif score >= 50.0:
        return "C", 3.0
    elif score >= 45.0:
        return "D", 2.0
    elif score >= 40.0:
        return "E", 1.0
    else:
        return "F", 0.0

def get_risk_level(risk_label: int) -> str:
    """
    Maps classification prediction index to a user-friendly risk string.
    """
    risk_map = {
        0: "Low Risk",
        1: "Medium Risk",
        2: "High Risk"
    }
    return risk_map.get(risk_label, "Unknown Risk")

#Step 3
# Rule-based logic for Recommendation Engine
def generate_recommendation(
    attendance: float,
    midterm: float,
    assignment: float,
    quiz: float,
    risk_level: str
) -> dict:
    """
    Analyzes student habits and CA components to generate customized advice,
    study hours, and recommended study sessions.
    """
    # 1. Determine recommended hours and sessions based on predicted risk level
    if risk_level == "High Risk":
        hours = 10
        sessions = 4
        risk_statement = "You are at High Risk of failing this course. Urgent study intervention is required."
    elif risk_level == "Medium Risk":
        hours = 6
        sessions = 3
        risk_statement = "You are at Medium Risk. Increasing your focus on weak areas can push your grade higher."
    else:
        hours = 3
        sessions = 2
        risk_statement = "You are at Low Risk. Maintain your current study habits to secure an excellent grade."

    # 2. Normalize CA components (range 0 to 1) to find the weakest area
    attendance_norm = attendance / 100.0
    midterm_norm = midterm / 15.0
    assignment_norm = assignment / 10.0
    quiz_norm = quiz / 5.0

    norms = {
        "attendance": attendance_norm,
        "midterm exam": midterm_norm,
        "assignments": assignment_norm,
        "quizzes": quiz_norm
    }

    # Find the key (component) that has the lowest normalized percentage value
    weakest_component = min(norms, key=norms.get)

    # 3. Generate specific actionable advice based on the weakest component
    if weakest_component == "attendance":
        weakness_advice = "Your class attendance is your weakest CA area. Make sure to attend all lectures to grasp key concepts."
    elif weakest_component == "midterm exam":
        weakness_advice = "Your midterm exam score is your lowest CA component. Focus on reviewing lecture slides and tutorial questions."
    elif weakest_component == "assignments":
        if assignment == 0.0:
            weakness_advice = "You have 0 marks in assignments. Ensure you submit all homework assignments to boost your CA score."
        else:
            weakness_advice = "Your assignment scores are dragging down your CA. Double-check your answers and consult the tutor for clarification."
    elif weakest_component == "quizzes":
        if quiz == 0.0:
            weakness_advice = "You have 0 marks in quizzes. Take all upcoming quizzes and review quick check questions."
        else:
            weakness_advice = "Your quiz score is your weakest CA component. Practice solving problems under time constraints."
    else:
        weakness_advice = "Review your overall continuous assessments to maintain your progress."

    # 4. Combine the risk warning with the CA advice
    full_recommendation = f"{risk_statement} {weakness_advice}"

    return {
        "recommendation": full_recommendation,
        "study_hours_per_week": hours,
        "study_sessions_per_week": sessions
    }

def predict_course_performance(
    hours_studied: float,
    previous_scores: float,
    extracurricular: int,
    sleep_hours: float,
    course_difficulty: int,
    course_unit: int,
    attendance: float,
    midterm_score: float,
    assignment_score: float = 0.0,
    quiz_score: float = 0.0
) -> dict:
    """
    Runs the complete academic prediction pipeline for a single course:
    1. Computes raw CA score.
    2. Builds the feature vector.
    3. Standardizes features using pre-trained scalers.
    4. Predicts final score (Random Forest Regressor).
    5. Predicts risk class (XGBoost Classifier).
    6. Formulates grades and study recommendations.
    """
    # 1. Load models and scalers
    models = load_models()
    rf_reg = models["rf_reg"]
    xgb_clf = models["xgb_clf"]
    scaler_reg = models["scaler_reg"]
    scaler_clf = models["scaler_clf"]
    
    # 2. Compute CA Score
    ca_score = calculate_ca_score(attendance, midterm_score, assignment_score, quiz_score)
    
    # 3. Create the feature input DataFrame in the exact order the models expect
    input_data = pd.DataFrame([{
        "hours_studied": hours_studied,
        "previous_scores": previous_scores,
        "extracurricular": extracurricular,
        "sleep_hours": sleep_hours,
        "course_difficulty": course_difficulty,
        "course_unit": course_unit,
        "ca_score": ca_score
    }])
    
    # 4. Standardize inputs
    reg_scaled = scaler_reg.transform(input_data)
    clf_scaled = scaler_clf.transform(input_data)
    
    # 5. Predict Score and Risk Level
    predicted_score = float(rf_reg.predict(reg_scaled)[0])
    predicted_risk_idx = int(xgb_clf.predict(clf_scaled)[0])
    
    # 6. Map model indexes to human-readable strings and letter grades
    grade, grade_point = get_grade_and_gp(predicted_score)
    risk_level = get_risk_level(predicted_risk_idx)
    
    # 7. Generate study plan recommendation
    rec_info = generate_recommendation(
        attendance=attendance,
        midterm=midterm_score,
        assignment=assignment_score,
        quiz=quiz_score,
        risk_level=risk_level
    )
    
    return {
        "predicted_score": round(predicted_score, 2),
        "grade": grade,
        "grade_point": grade_point,
        "risk_level": risk_level,
        "recommendation": rec_info["recommendation"],
        "study_hours_per_week": rec_info["study_hours_per_week"],
        "study_sessions_per_week": rec_info["study_sessions_per_week"]
    }