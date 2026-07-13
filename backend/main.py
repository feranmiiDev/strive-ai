from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import PredictionRequest, PredictionResponse, CourseResult
from utils import predict_course_performance
from models import PredictionRequest, PredictionResponse, CourseResult, CourseInput
from fastapi import FastAPI, HTTPException, Depends
from models import (
    PredictionRequest, PredictionResponse, CourseResult, CourseInput,
    ProfileInput, SaveHistoryRequest, CourseRecordInput
)
from utils import predict_course_performance
from supabase_client import supabase, verify_token, query_supabase_rest

# 1. Initialize FastAPI app
app = FastAPI(
    title="Intelligent Academic Performance Analysis API",
    description="Backend API for predicting student grades and generating study plans.",
    version="1.0.0"
)

# 2. Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Health Check Endpoint
@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "message": "Academic Performance API is fully operational!"
    }

# 4. Multi-Course Prediction Endpoint
@app.post("/predict", response_model=PredictionResponse)
def predict_gpa(request: PredictionRequest):
    """
    Accepts a list of courses, predicts performance/risk for each,
    calculates the projected semester GPA, and returns all results.
    """
    if not request.courses:
        raise HTTPException(status_code=400, detail="Course list cannot be empty.")
    
    results = []
    total_grade_points = 0.0
    total_units = 0
    
    # Process each course one by one
    for course in request.courses:
        try:
            # Run the prediction pipeline using our helper function
            pred = predict_course_performance(
                hours_studied=course.hours_studied,
                extracurricular=course.extracurricular,
                sleep_hours=course.sleep_hours,
                course_difficulty=course.course_difficulty,
                course_unit=course.course_unit,
                attendance=course.attendance,
                midterm_score=course.midterm_score,
                assignment_score=course.assignment_score or 0.0,
                quiz_score=course.quiz_score or 0.0
            )
            
            # Create a CourseResult object for the response
            results.append(CourseResult(
                course_name=course.course_name,
                predicted_score=pred["predicted_score"],
                grade=pred["grade"],
                grade_point=pred["grade_point"],
                risk_level=pred["risk_level"],
                recommendation=pred["recommendation"],
                study_hours_per_week=pred["study_hours_per_week"],
                study_sessions_per_week=pred["study_sessions_per_week"]
            ))
            
            # Accumulate grade points and credit units for the GPA calculation
            total_grade_points += pred["grade_point"] * course.course_unit
            total_units += course.course_unit
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error predicting performance for course '{course.course_name}': {str(e)}"
            )
            
    # Calculate Grade Point Average (GPA = sum(GP * units) / sum(units))
    projected_gpa = (total_grade_points / total_units) if total_units > 0 else 0.0
    
    return PredictionResponse(
        results=results,
        projected_gpa=round(projected_gpa, 2)
    )

# 5. Single Course What-If Prediction Endpoint
@app.post("/predict/whatif", response_model=CourseResult)
def predict_whatif(course: CourseInput):
    """
    Accepts a single course's inputs, runs the prediction pipeline,
    and returns the score, grade, risk, and study plan.
    Called dynamically by the frontend whenever a slider moves.
    """
    try:
        pred = predict_course_performance(
            hours_studied=course.hours_studied,
            extracurricular=course.extracurricular,
            sleep_hours=course.sleep_hours,
            course_difficulty=course.course_difficulty,
            course_unit=course.course_unit,
            attendance=course.attendance,
            midterm_score=course.midterm_score,
            assignment_score=course.assignment_score or 0.0,
            quiz_score=course.quiz_score or 0.0
        )
        
        return CourseResult(
            course_name=course.course_name,
            predicted_score=pred["predicted_score"],
            grade=pred["grade"],
            grade_point=pred["grade_point"],
            risk_level=pred["risk_level"],
            recommendation=pred["recommendation"],
            study_hours_per_week=pred["study_hours_per_week"],
            study_sessions_per_week=pred["study_sessions_per_week"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error running what-if prediction: {str(e)}"
        )
    
# 6. Profile Creation Endpoint
@app.post("/profile")
def create_profile(profile: ProfileInput, token: dict = Depends(verify_token)):
    """
    Saves student details (matric number, name) linked to their authenticated email.
    """
    user_id = token.get("sub") # Extract unique user ID from JWT
    email = token.get("email") # Extract email from JWT
    raw_token = token.get("raw_token")
    
    try:
        # Save or update profile in Supabase using direct REST call
        payload = [{
            "id": user_id,
            "matric_number": profile.matric_number,
            "full_name": profile.full_name,
            "school_email": email
        }]
        query_supabase_rest(
            "POST",
            "/rest/v1/profiles",
            json_data=payload,
            raw_token=raw_token,
            prefer_header="resolution=merge-duplicates"
        )
        return {"status": "success", "message": "Profile updated successfully!"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# 7. Save Academic Records (History) Endpoint
@app.post("/history")
def save_academic_history(request: SaveHistoryRequest, token: dict = Depends(verify_token)):
    """
    Saves a list of calculated course records for the logged-in student.
    """
    user_id = token.get("sub")
    email = token.get("email")
    raw_token = token.get("raw_token")
    
    if not request.records:
        raise HTTPException(status_code=400, detail="No records provided to save.")
        
    # Ensure a profile exists for this student to satisfy foreign key constraint
    try:
        profile_data = query_supabase_rest(
            "GET",
            f"/rest/v1/profiles?id=eq.{user_id}",
            raw_token=raw_token
        )
        if not profile_data:
            query_supabase_rest(
                "POST",
                "/rest/v1/profiles",
                json_data=[{
                    "id": user_id,
                    "matric_number": "PSC/2022/1045",
                    "full_name": "Patrick Scarborough",
                    "school_email": email
                }],
                raw_token=raw_token,
                prefer_header="resolution=merge-duplicates"
            )
    except Exception:
        pass
        
    # Prepare records for insertion
    records_to_insert = []
    for r in request.records:
        records_to_insert.append({
            "student_id": user_id,
            "semester": request.semester,
            "course_name": r.course_name,
            "hours_studied": r.hours_studied,
            "previous_scores": 0.0,
            "extracurricular": r.extracurricular,
            "sleep_hours": r.sleep_hours,
            "course_difficulty": r.course_difficulty,
            "course_unit": r.course_unit,
            "attendance": r.attendance,
            "midterm_score": r.midterm_score,
            "assignment_score": r.assignment_score,
            "quiz_score": r.quiz_score,
            "ca_score": r.ca_score,
            "predicted_score": r.predicted_score,
            "grade": r.grade,
            "risk_label": r.risk_label,
            "recommendation": r.recommendation
        })
        
    try:
        # Insert records into academic_records table in Supabase via direct REST call
        query_supabase_rest(
            "POST",
            "/rest/v1/academic_records",
            json_data=records_to_insert,
            raw_token=raw_token
        )
        return {"status": "success", "message": f"Successfully saved {len(request.records)} course records."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# 8. Fetch Academic Records (History) Endpoint
@app.get("/history")
def get_academic_history(token: dict = Depends(verify_token)):
    """
    Retrieves all past academic records for the logged-in student.
    """
    user_id = token.get("sub")
    raw_token = token.get("raw_token")
    
    try:
        # Fetch from Supabase via direct REST call, filtering records by user_id
        data = query_supabase_rest(
            "GET",
            f"/rest/v1/academic_records?student_id=eq.{user_id}&order=created_at.desc",
            raw_token=raw_token
        )
        return {"status": "success", "records": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")