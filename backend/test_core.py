import sys
import os

# Ensure backend directory is in the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from utils import predict_course_performance

def run_tests():
    print("--------------------------------------------------")
    print("Testing Student 1: Strong Student (Easy Course)")
    print("--------------------------------------------------")
    # Studied 10 hours/week, 85% previous score, no extracurricular, 8 hours sleep,
    # course difficulty 1 (Easy), 3 credit units, 90% attendance, midterm score 13/15,
    # assignment score 9/10, quiz score 4/5.
    result_strong = predict_course_performance(
        hours_studied=10.0,
        extracurricular=0,
        sleep_hours=8.0,
        course_difficulty=1,
        course_unit=3,
        attendance=90.0,
        midterm_score=13.0,
        assignment_score=9.0,
        quiz_score=4.0
    )
    for key, val in result_strong.items():
        print(f"{key}: {val}")

    print("\n--------------------------------------------------")
    print("Testing Student 2: Struggling Student (Hard Course + Missing Assignment)")
    print("--------------------------------------------------")
    # Studied 2 hours/week, extracurricular yes, 5 hours sleep,
    # course difficulty 3 (Hard), 4 credit units, 60% attendance, midterm score 5/15,
    # assignment score 0.0 (missing), quiz score 1/5.
    result_struggling = predict_course_performance(
        hours_studied=2.0,
        extracurricular=1,
        sleep_hours=5.0,
        course_difficulty=3,
        course_unit=4,
        attendance=60.0,
        midterm_score=5.0,
        assignment_score=0.0, # Missing submission!
        quiz_score=1.0
    )
    for key, val in result_struggling.items():
        print(f"{key}: {val}")

if __name__ == "__main__":
    run_tests()