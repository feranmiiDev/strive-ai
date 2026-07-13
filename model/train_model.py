import pandas as pd
import numpy as np
import json
import pickle
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, classification_report, confusion_matrix
from xgboost import XGBRegressor, XGBClassifier
from imblearn.over_sampling import SMOTE


# generate the simulated dataset
np.random.seed(42)
n = 10000

df = pd.DataFrame()
df['hours_studied'] = np.random.randint(0, 13, size=n)  # 0-12 hrs/week
df['extracurricular'] = np.random.randint(0, 2, size=n)  # 0=No, 1=Yes
df['sleep_hours'] = np.random.randint(3, 11, size=n)  # 3-10 hrs
df['course_difficulty'] = np.random.randint(1, 4, size=n) # 1=Easy,2=Medium,3=Hard
df['course_unit'] = np.random.randint(1, 5, size=n)  # 1-4 units

# Raw CA components
attendance = np.random.randint(0, 101, size=n)
midterm_score = np.random.randint(0, 16, size=n)
assignment_score = np.random.randint(0, 11, size=n)
quiz_score = np.random.randint(0, 6, size=n)
attendance_mark = (attendance / 100) * 10
df['ca_score'] = (midterm_score + assignment_score + quiz_score + attendance_mark) / 40 * 100

#BUILD PERFORMANCE_INDEX
noise = np.random.normal(0, 5, size=n)  # realistic randomness

df['performance_index'] = (
    0.60 * df['ca_score'] +
    3.5 * df['hours_studied'] +
    1.2 * df['sleep_hours'] +
    2.2 * df['extracurricular'] -
    5.0 * (df['course_difficulty'] - 1) +
    noise
)

df['performance_index'] = df['performance_index'].clip(0, 100)

# print("Dataset generated:")
# print(df.head())
# print(df.describe())

# create risk labels 
def assign_risk(score):
    if score >= 60:
        return 0  # Low Risk
    elif score >= 45:
        return 1  # Medium Risk
    else:
        return 2  # High Risk

df['risk_label'] = df['performance_index'].apply(assign_risk)

print("Risk label distribution:")
print(df['risk_label'].value_counts())

# Features, Targets, Split
X = df.drop(columns=['performance_index', 'risk_label'])

y_reg = df['performance_index']
y_clf = df['risk_label']

# Save feature column order
feature_columns = X.columns.tolist()
with open('model/feature_columns.json', 'w') as f:
    json.dump(feature_columns, f)

print("Feature columns:", feature_columns)

# Split for regression
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
    X, y_reg, test_size=0.2, random_state=42
)

# Split for classification
X_train_clf, X_test_clf, y_train_clf, y_test_clf = train_test_split(
    X, y_clf, test_size=0.2, random_state=42
)

# print("Train size:", X_train_reg.shape)
# print("Test size:", X_test_reg.shape)

# SCALE, SMOTE, TRAIN 
# Scale features for regression
scaler_reg = StandardScaler()
X_train_reg_scaled = scaler_reg.fit_transform(X_train_reg)
X_test_reg_scaled = scaler_reg.transform(X_test_reg)

# Scale features for classification
scaler_clf = StandardScaler()
X_train_clf_scaled = scaler_clf.fit_transform(X_train_clf)
X_test_clf_scaled = scaler_clf.transform(X_test_clf)

# Save scalers
with open('model/scaler_reg.pkl', 'wb') as f:
    pickle.dump(scaler_reg, f)

with open('model/scaler_clf.pkl', 'wb') as f:
    pickle.dump(scaler_clf, f)

# Apply SMOTE to classification training data only
smote = SMOTE(random_state=42)
X_train_clf_balanced, y_train_clf_balanced = smote.fit_resample(X_train_clf_scaled, y_train_clf)

print("After SMOTE:", pd.Series(y_train_clf_balanced).value_counts())

# Train regression models
rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
rf_reg.fit(X_train_reg_scaled, y_train_reg)

xgb_reg = XGBRegressor(n_estimators=100, random_state=42)
xgb_reg.fit(X_train_reg_scaled, y_train_reg)

# Train classification models
rf_clf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
rf_clf.fit(X_train_clf_balanced, y_train_clf_balanced)

xgb_clf = XGBClassifier(n_estimators=100, random_state=42)
xgb_clf.fit(X_train_clf_balanced, y_train_clf_balanced)

print("All 4 models trained successfully!")

# Evaluate regression models
rf_reg_pred = rf_reg.predict(X_test_reg_scaled)
xgb_reg_pred = xgb_reg.predict(X_test_reg_scaled)
print("=== REGRESSION RESULTS ===")
print(f"Random Forest -> MAE: {mean_absolute_error(y_test_reg, rf_reg_pred):.2f}, R2: {r2_score(y_test_reg, rf_reg_pred):.4f}")
print(f"XGBoost       -> MAE: {mean_absolute_error(y_test_reg, xgb_reg_pred):.2f}, R2: {r2_score(y_test_reg, xgb_reg_pred):.4f}")

# Evaluate classification models
rf_clf_pred = rf_clf.predict(X_test_clf_scaled)
xgb_clf_pred = xgb_clf.predict(X_test_clf_scaled)

print("Random Forest:")
print(classification_report(y_test_clf, rf_clf_pred, target_names=['Low Risk', 'Medium Risk', 'High Risk']))
print("XGBoost:")
print(classification_report(y_test_clf, xgb_clf_pred, target_names=['Low Risk', 'Medium Risk', 'High Risk']))

print("Random Forest Confusion Matrix:")
print(confusion_matrix(y_test_clf, rf_clf_pred))
print("XGBoost Confusion Matrix:")
print(confusion_matrix(y_test_clf, xgb_clf_pred))

# SAVE BEST MODELS 
with open('model/rf_reg.pkl', 'wb') as f:
    pickle.dump(rf_reg, f)

with open('model/xgb_clf.pkl', 'wb') as f:
    pickle.dump(xgb_clf, f)

# --- BLOCK 8: TEST ---------------------------------------------
def get_grade(score):
    if score >= 70: return 'A'
    elif score >= 60: return 'B'
    elif score >= 50: return 'C'
    elif score >= 45: return 'D'
    elif score >= 40: return 'E'
    else: return 'F'

risk_map = {0: 'Low Risk', 1: 'Medium Risk', 2: 'High Risk'}

def predict_student(hours_studied, extracurricular, sleep_hours, course_difficulty, course_unit, ca_score):
    sample = pd.DataFrame([{
        'hours_studied': hours_studied,
        'extracurricular': extracurricular,
        'sleep_hours': sleep_hours,
        'course_difficulty': course_difficulty,
        'course_unit': course_unit,
        'ca_score': ca_score
    }])

    sample_reg_scaled = scaler_reg.transform(sample)
    sample_clf_scaled = scaler_clf.transform(sample)

    predicted_score = rf_reg.predict(sample_reg_scaled)[0]
    predicted_risk = xgb_clf.predict(sample_clf_scaled)[0]

    print(f"Predicted Score: {predicted_score:.2f}")
    print(f"Grade: {get_grade(predicted_score)}")
    print(f"Risk Level: {risk_map[predicted_risk]}")
    print("---")

# Strong student, easy course
print("Strong student, easy course:")
predict_student(10, 0, 8, 1, 3, 80.0)

# Average student, medium course
print("Average student, medium course:")
predict_student(5, 1, 6, 2, 3, 55.0)

# Struggling student, hard course
print("Struggling student, hard course:")
predict_student(2, 1, 4, 3, 2, 30.0)