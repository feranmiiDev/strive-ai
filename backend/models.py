from pydantic import BaseModel
from typing import Optional, List

# Single course input from student
class CourseInput(BaseModel):
    course_name: str
    hours_studied: float
    previous_scores: float
    extracurricular: int          # 0 or 1
    sleep_hours: float
    course_difficulty: int        # 1, 2, or 3
    course_unit: int              # 1 to 4
    attendance: float             # 0-100%
    midterm_score: float          # 0-15
    assignment_score: Optional[float] = 0.0   # optional, defaults to 0
    quiz_score: Optional[float] = 0.0         # optional, defaults to 0

# Full prediction request — multiple courses at once
class PredictionRequest(BaseModel):
    courses: List[CourseInput]

# Result for a single course
class CourseResult(BaseModel):
    course_name: str
    predicted_score: float
    grade: str
    grade_point: float
    risk_level: str
    recommendation: str
    study_hours_per_week: int
    study_sessions_per_week: int

# Full prediction response
class PredictionResponse(BaseModel):
    results: List[CourseResult]
    projected_gpa: float

# Profile schema for registration details
class ProfileInput(BaseModel):
    matric_number: str
    full_name: str

# Schema for saving a course record into the database
class CourseRecordInput(BaseModel):
    course_name: str
    hours_studied: float
    previous_scores: float
    extracurricular: int
    sleep_hours: float
    course_difficulty: int
    course_unit: int
    attendance: float
    midterm_score: float
    assignment_score: float
    quiz_score: float
    ca_score: float
    predicted_score: float
    grade: str
    risk_label: int
    recommendation: str

# Schema for saving a semester's worth of records
class SaveHistoryRequest(BaseModel):
    semester: str
    records: List[CourseRecordInput]