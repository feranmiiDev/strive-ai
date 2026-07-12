from utils import calculate_ca_score, get_grade_and_gp, get_risk_level

# Test CA Score: Midterm=10/15, Assignment=7/10, Quiz=3/5, Attendance=80%
# Expected: (10 + 7 + 3 + 8) / 40 * 100 = 70.0%
print("CA Score Test:", calculate_ca_score(80, 10, 7, 3))

# Test Grade: 65.0
# Expected: ('B', 4.0)
print("Grade and GP Test:", get_grade_and_gp(70.0))

# Test Risk Level: 1
# Expected: "Medium Risk"
print("Risk Level Test:", get_risk_level(1))

