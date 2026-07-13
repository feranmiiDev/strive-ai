import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  // Session & Authentication States
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Profile States
  const [fullName, setFullName] = useState('Patrick Scarborough');
  const [matricNumber, setMatricNumber] = useState('PSC/2022/1045');
  const [profileSaving, setProfileSaving] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, curriculum, profile, simulations

  // Selected course index for simulation
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);

  // Profile badge header dropdown trigger
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Logout custom modal overlay trigger
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Project documentation modal overlay trigger
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Goal Setting States
  const [targetGpa, setTargetGpa] = useState(4.5);
  const [isGoalCommitted, setIsGoalCommitted] = useState(false);

  // Responsive Sidebar Toggle State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Academic Course Entries State (CSC 401, MAT 302, ENG 210 matching the image)
  const [courses, setCourses] = useState([
    {
      course_name: 'CSC 401: Intro to AI',
      hours_studied: 18,
      extracurricular: 0,
      sleep_hours: 7.0,
      course_difficulty: 2,
      course_unit: 3,
      attendance: 90,
      midterm_score: 12,
      assignment_score: 8,
      quiz_score: 4
    },
    {
      course_name: 'MAT 302: Advanced Calculus',
      hours_studied: 8,
      extracurricular: 0,
      sleep_hours: 6.5,
      course_difficulty: 3,
      course_unit: 4,
      attendance: 85,
      midterm_score: 11,
      assignment_score: 7,
      quiz_score: 3
    },
    {
      course_name: 'ENG 210: Tech Writing',
      hours_studied: 6,
      extracurricular: 1,
      sleep_hours: 8.0,
      course_difficulty: 1,
      course_unit: 2,
      attendance: 94,
      midterm_score: 13,
      assignment_score: 9,
      quiz_score: 5
    }
  ]);

  const [predictLoading, setPredictLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // PRELOADED INTERACTIVE RESULTS STATE MATCHING THE IMAGE WITH STRICT A-F NIGERIAN GRADES
  const [results, setResults] = useState({
    results: [
      {
        course_name: 'CSC 401: Intro to AI',
        predicted_score: 65.0,
        grade: 'B',
        grade_point: 4.0,
        risk_level: 'Stable',
        recommendation: 'Practice CSC 401 quiz on neural network architectures to secure B grade.',
        study_hours_per_week: 18,
        study_sessions_per_week: 4
      },
      {
        course_name: 'MAT 302: Advanced Calculus',
        predicted_score: 62.0,
        grade: 'B',
        grade_point: 4.0,
        risk_level: 'Stable',
        recommendation: 'Review MAT 302: Focus on Fourier transforms in Chapter 4.',
        study_hours_per_week: 8,
        study_sessions_per_week: 3
      },
      {
        course_name: 'ENG 210: Tech Writing',
        predicted_score: 58.0,
        grade: 'C',
        grade_point: 3.0,
        risk_level: 'Stable',
        recommendation: 'Practice ENG 210 documentation formatting to maintain high score.',
        study_hours_per_week: 6,
        study_sessions_per_week: 2
      }
    ],
    projected_gpa: 3.8
  });

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Clear URL hash (e.g. #docs) on mount to keep the address bar clean
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Monitor Authentication Session & pre-populate name
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const emailParts = session.user.email.split('@');
        if (emailParts.length > 0) {
          const nameFromEmail = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
          setFullName(nameFromEmail);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        const emailParts = session.user.email.split('@');
        if (emailParts.length > 0) {
          const nameFromEmail = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
          setFullName(nameFromEmail);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Authentication with school email restrictions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const schoolEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu(\.[a-zA-Z]{2,})?$/;

    try {
      if (isRegistering) {
        const isValid = schoolEmailRegex.test(authEmail.trim());
        if (!isValid) {
          throw new Error('Access Denied. Registration is restricted to official university emails (ending in .edu or .edu.ng).');
        }

        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert('Registration successful! Please check your email for verification.');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Trigger custom logout modal
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setApiError(null);

    try {
      const token = session?.access_token;
      const response = await fetch('http://127.0.0.1:8000/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matric_number: matricNumber,
          full_name: fullName
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update profile.');
      }
      alert('Profile registered successfully!');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // Manage courses dynamically
  const addCourse = () => {
    setCourses([
      ...courses,
      {
        course_name: '',
        hours_studied: 6,
        extracurricular: 0,
        sleep_hours: 7,
        course_difficulty: 2,
        course_unit: 3,
        attendance: 80,
        midterm_score: 10,
        assignment_score: 7,
        quiz_score: 3
      }
    ]);
  };

  const removeCourse = (index) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
      if (selectedCourseIndex >= courses.length - 1) {
        setSelectedCourseIndex(0);
      }
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedCourses = [...courses];
    if (field === 'course_name') {
      updatedCourses[index][field] = value;
    } else if (field === 'course_difficulty' || field === 'course_unit' || field === 'extracurricular') {
      updatedCourses[index][field] = parseInt(value) || 0;
    } else {
      updatedCourses[index][field] = value === '' ? '' : parseFloat(value);
    }
    setCourses(updatedCourses);
  };

  // Real-time slider simulations inside the Grade Sandbox (Screen 1)
  const handleSliderChange = async (index, field, value) => {
    const numVal = parseFloat(value);
    const updatedCourses = [...courses];
    if (!updatedCourses[index]) return;
    
    updatedCourses[index][field] = numVal;
    setCourses(updatedCourses);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict/whatif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourses[index])
      });

      if (!response.ok) throw new Error('Simulation failed.');

      const updatedResult = await response.json();
      const newResults = {
        ...results,
        results: [...results.results]
      };
      newResults.results[index] = updatedResult;

      // Recalculate Semester GPA dynamically
      let totalGradePoints = 0;
      let totalUnits = 0;
      newResults.results.forEach((res, i) => {
        const units = updatedCourses[i]?.course_unit || 3;
        totalGradePoints += res.grade_point * units;
        totalUnits += units;
      });
      newResults.projected_gpa = totalUnits > 0 ? parseFloat((totalGradePoints / totalUnits).toFixed(2)) : 0.0;

      setResults(newResults);
    } catch (err) {
      console.error(err);
    }
  };

  // Archive semester data logs to the DB
  const handleSaveHistory = async () => {
    if (!results) return;
    try {
      const token = session?.access_token;
      const recordsPayload = results.results.map((res, i) => ({
        course_name: res.course_name,
        hours_studied: courses[i]?.hours_studied || 0,
        extracurricular: courses[i]?.extracurricular || 0,
        sleep_hours: courses[i]?.sleep_hours || 0,
        course_difficulty: courses[i]?.course_difficulty || 1,
        course_unit: courses[i]?.course_unit || 3,
        attendance: courses[i]?.attendance || 0,
        midterm_score: courses[i]?.midterm_score || 0,
        assignment_score: courses[i]?.assignment_score || 0.0,
        quiz_score: courses[i]?.quiz_score || 0.0,
        ca_score: ((courses[i]?.midterm_score || 0) + ((courses[i]?.attendance || 0) * 0.1) + (courses[i]?.assignment_score || 0) + (courses[i]?.quiz_score || 0)),
        predicted_score: res.predicted_score,
        grade: res.grade,
        risk_label: res.risk_level.toLowerCase().includes('high') ? 2 : res.risk_level.toLowerCase().includes('medium') ? 1 : 0,
        recommendation: res.recommendation
      }));

      const response = await fetch('http://127.0.0.1:8000/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semester: 'Year 4 Sem 1',
          records: recordsPayload
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Database insertion failed.');
      }
      alert('Semester records archived to database successfully!');
    } catch (err) {
      alert('Error saving record: ' + err.message);
    }
  };

  // Trigger prediction calculations
  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    setApiError(null);

    const emptyNames = courses.some(c => !c.course_name.trim());
    if (emptyNames) {
      setApiError('Please fill in all course names.');
      setPredictLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courses })
      });

      if (!response.ok) throw new Error('Prediction failed.');

      const data = await response.json();
      setResults(data);
      setActiveTab('dashboard'); // Redirect to dashboard
    } catch (err) {
      setApiError(err.message);
    } finally {
      setPredictLoading(false);
    }
  };

  // AUTH VIEW (SCREEN 5)
  // AUTH VIEW (SCREEN 5)
  if (!session) {
    return (
      <div className="auth-split-wrapper">
        
        {/* Left Column: Brand & Landing Content */}
        <div className="auth-split-left animate-fadein">
          <div className="auth-left-content">
            <div className="auth-brand-logo">
              <svg className="brand-logo-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L19 9L12 16L5 9Z" />
                <path d="M12 16V22" />
                <path d="M7 21H17" />
                <path d="M12 6L13.2 8.8L16 10L13.2 11.2L12 14L10.8 11.2L8 10L10.8 8.8Z" fill="currentColor" stroke="none" />
              </svg>
              <h2>Strive.ai</h2>
            </div>

            <div className="landing-badge-pill">
              AI-Powered Academic Prediction Engine
            </div>

            <h1 className="landing-headline">
              Know where you're headed before <span className="gradient-text-emerald">results day.</span>
            </h1>

            <p className="landing-subtitle">
              Enter your current academic data and get a data-backed prediction of your semester outcomes, a projected GPA, and a personalised study plan tailored to your weakest areas.
            </p>
          </div>
        </div>

        {/* Right Column: Glassmorphic Login/Register Card */}
        <div className="auth-split-right animate-fadein">
          <div className="auth-glass-card">
            
            <div className="auth-card-top-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>

            <div className="auth-header-block">
              <h2>{isRegistering ? 'Create Account' : 'Welcome back'}</h2>
              <p>{isRegistering ? 'Sign up to register your credentials' : 'Sign in to continue to your account'}</p>
            </div>

            {authError && (
              <div className="auth-error">
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="auth-form">
              <div className="input-row">
                <label>University Email</label>
                <div className="input-with-icon">
                  <span className="input-field-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="label-forgot-row">
                  <label>Password</label>
                  {!isRegistering && <a href="#forgot" className="forgot-link">Forgot?</a>}
                </div>
                <div className="input-with-icon">
                  <span className="input-field-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary auth-btn" disabled={authLoading}>
                {authLoading ? 'Verifying Credentials...' : isRegistering ? 'Register Account' : 'Sign In'}
              </button>
            </form>

            <button 
              type="button" 
              className="auth-toggle-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New student? Register an account'}
            </button>
            
            <div className="auth-footer-links">
              <button 
                type="button" 
                className="link-btn-text" 
                onClick={() => setShowDocsModal(true)}
              >
                Docs
              </button>
              <span>•</span>
              <a 
                href="https://github.com/feranmiiDev/strive-ai" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
            <p className="copyright-text">© 2026 Strive.ai. All rights reserved.</p>
          </div>
        </div>

        {/* Documentation / Project Guide Modal overlay */}
        {showDocsModal && (
          <div className="modal-overlay animate-fadein">
            <div className="modal-card docs-modal-card animate-scaleup">
              <div className="modal-card-header">
                <h3>Strive.ai Project Documentation</h3>
                <button className="close-docs-btn" onClick={() => setShowDocsModal(false)}>&times;</button>
              </div>
              <div className="modal-card-body docs-modal-body">
                <section className="docs-section">
                  <h4>1. Project Abstract</h4>
                  <p>
                    Strive.ai is an intelligent academic performance forecasting system designed to solve grade ambiguities. 
                    By leveraging machine learning, the system evaluates study habits, course difficulties, credit units, 
                    and continuous assessment scores to predict final semester grades, project overall GPAs, and formulate 
                    personalized study recommendations.
                  </p>
                </section>

                <section className="docs-section">
                  <h4>2. System Architecture & Models</h4>
                  <div className="docs-model-grid">
                    <div className="model-spec-box">
                      <h5>Random Forest Regressor</h5>
                      <p>Predicts continuous grade point outcomes based on Study Hours, Sleep, Difficulty, and CA Scores.</p>
                      <span className="metric-badge">R² Accuracy: ~92%</span>
                    </div>
                    <div className="model-spec-box">
                      <h5>XGBoost Classifier</h5>
                      <p>Categorizes students into warning tiers (Stable, Warning, Critical) to guide academic triage.</p>
                      <span className="metric-badge">Classification: F1 0.89</span>
                    </div>
                  </div>
                </section>

                <section className="docs-section">
                  <h4>3. User Instructions</h4>
                  <ol className="docs-steps-list">
                    <li><strong>Authenticate</strong>: Sign in with your university student email.</li>
                    <li><strong>Setup Profile</strong>: Go to Account Settings to configure your Matriculation credentials.</li>
                    <li><strong>Plan Curriculum</strong>: Under "My Courses", load your credit unit weights, midterm scores, and attendance rates.</li>
                    <li><strong>Predict</strong>: Run "Calculate Analytics" to invoke the backend models and view forecasts.</li>
                    <li><strong>Simulate</strong>: Use the "Simulations Sandbox" page to test score targets by adjusting continuous assessment sliders.</li>
                  </ol>
                </section>
              </div>
              <div className="modal-card-footer">
                <button onClick={() => setShowDocsModal(false)} className="btn-bronze-calculate">
                  Close Documentation
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Helper helper to get course code & clean course name
  const parseCourseName = (fullNameStr) => {
    const parts = fullNameStr.split(':');
    if (parts.length > 1) {
      return { code: parts[0].trim(), name: parts[1].trim() };
    }
    const words = fullNameStr.split(' ');
    if (words.length > 1 && words[0].length <= 7) {
      return { code: words[0].trim(), name: words.slice(1).join(' ').trim() };
    }
    return { code: fullNameStr.substring(0, 7), name: fullNameStr };
  };

  return (
    <div className="app-shell">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-box">
            {/* Custom S-like Logo matching screenshot */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M12 2L19 9L12 16L5 9Z" />
              <path d="M12 16V22" />
              <path d="M7 21H17" />
              <path d="M12 6L13.2 8.8L16 10L13.2 11.2L12 14L10.8 11.2L8 10L10.8 8.8Z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="brand-texts">
            <h2>Strive.ai</h2>
          </div>
          {/* Close button on mobile side nav */}
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close Navigation">&times;</button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Dashboard
            {activeTab === 'dashboard' && <span className="active-dot"></span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => { setActiveTab('curriculum'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            My Courses
            {activeTab === 'curriculum' && <span className="active-dot"></span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'simulations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('simulations'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Simulations
            {activeTab === 'simulations' && <span className="active-dot"></span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('recommendations'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            AI Recommendations
            {activeTab === 'recommendations' && <span className="active-dot"></span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('goal'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Goal Setting
            {activeTab === 'goal' && <span className="active-dot"></span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Account Settings
            {activeTab === 'profile' && <span className="active-dot"></span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => { handleLogout(); setSidebarOpen(false); }} className="sidebar-link-btn logout-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay backdrop for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <main className="content-pane">
        
        <header className="main-header">
          <div className="header-titles-with-toggle">
            <button 
              className="navbar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'curriculum' ? 'My Courses' : activeTab === 'simulations' ? 'Simulations Sandbox' : activeTab === 'recommendations' ? 'AI Recommendations' : activeTab === 'goal' ? 'Goal Setting' : 'Account Settings'}</h1>
          </div>
          
          <div className="header-controls">
            {/* Bell Icon with notification badge */}
            <button className="icon-btn-circle notification-bell-btn" onClick={() => alert('Support Hub connectivity optimal.')}>
              <div className="bell-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="bell-badge-red"></span>
              </div>
            </button>

            {/* Light/Dark mode switcher */}
            <button 
              className="icon-btn-circle mode-toggle-btn" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                /* Sun Icon */
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                /* Moon Icon */
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Static User Badge */}
            <div className="profile-badge-dropdown" onClick={() => setActiveTab('profile')} title="Go to Account Settings">
              <div className="user-badge">{fullName.charAt(0)}</div>
            </div>
          </div>
        </header>

        {apiError && <div className="error-alert">Error: {apiError}</div>}

        {/* TAB 1: DASHBOARD VIEW (MATCHES SCREENSHOT LAYOUT) */}
        {activeTab === 'dashboard' && (
          <div className="page-section animate-slideup">
            
            {/* Title Greeting Section */}
            <div className="dashboard-greeting-row">
              <h2>Welcome back, {fullName}!</h2>
              <p className="predicted-gpa-subtitle">Your current predicted GPA is <strong>{results ? results.projected_gpa.toFixed(1) : '3.8'}</strong>.</p>
            </div>

            {/* New Main Grid Layout: Left Column (70%) and Right Column (30%) */}
            <div className="dashboard-main-grid">
              
              {/* LEFT COLUMN: Tables & Simulations */}
              <div className="grid-col-left">
                
                {/* 1. Course Predictions Card */}
                <div className="dashboard-table-card">
                  <div className="card-heading-section">
                    <h3>Course Predictions</h3>
                  </div>

                  <div className="unified-predictions-panel">
                    <div className="predictions-table-area">
                      <div className="table-responsive-container">
                        <table className="predictions-table">
                          <thead>
                            <tr>
                              <th>Course Code</th>
                              <th>Course Name</th>
                              <th>Predicted Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results && results.results.map((res, index) => {
                              const parsed = parseCourseName(res.course_name);
                              const isSelected = index === selectedCourseIndex;
                              
                              return (
                                <tr 
                                  key={index} 
                                  className={`clickable-row ${isSelected ? 'selected-row' : ''}`}
                                  onClick={() => setSelectedCourseIndex(index)}
                                >
                                  <td><strong>{parsed.code}</strong></td>
                                  <td>{parsed.name}</td>
                                  <td>
                                    <span className={`table-grade-pill grade-${res.grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                                      {res.grade}
                                      {/* Custom miniature icon badge inside pill */}
                                      <span className="pill-mini-icon">🎓</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right-aligned Simulated GPA display box */}
                    <div className="simulated-gpa-container-box">
                      <div className="gpa-bubble-outer">
                        <div className="gpa-bubble-inner">
                          <span className="sim-gpa-title-lbl">Overall GPA</span>
                          <span className="sim-gpa-value-num">
                            {results ? results.projected_gpa.toFixed(2) : '3.80'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Active Academic Goal Card */}
                <div className="dashboard-goals-card animate-fadein">
                  <div className="card-heading-section">
                    <h3>Active Academic Goal</h3>
                  </div>

                  <div className="dashboard-goals-content">
                    {isGoalCommitted ? (
                      <div className="active-goal-summary">
                        <div className="goal-gpa-grid-row">
                          <div className="goal-metric-box">
                            <span className="goal-metric-lbl">Target Semester GPA</span>
                            <span className="goal-metric-val">{targetGpa.toFixed(2)}</span>
                          </div>
                          <div className="goal-metric-box">
                            <span className="goal-metric-lbl">Projected GPA</span>
                            <span className="goal-metric-val">{results ? results.projected_gpa.toFixed(2) : '3.80'}</span>
                          </div>
                        </div>

                        <div className="goal-gpa-progress">
                          <div className="progress-bar-labels">
                            <span>Goal progress</span>
                            <span>{results ? Math.min(Math.round((results.projected_gpa / targetGpa) * 100), 100) : 84}%</span>
                          </div>
                          <div className="goal-progress-track">
                            <div 
                              className="goal-progress-fill" 
                              style={{ width: `${results ? Math.min((results.projected_gpa / targetGpa) * 100, 100) : 84}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="active-goal-roadmap-summary">
                          {results && results.projected_gpa >= targetGpa ? (
                            <p className="goal-dashboard-status success-text">🎉 Excellent! You are currently on track to hit your target.</p>
                          ) : (
                            <div className="goal-dashboard-action-list">
                              <p className="goal-dashboard-status alert-text">📈 Action Required: Improve grades in the following courses:</p>
                              <div className="dashboard-actions-grid">
                                {results && results.results.map((res, i) => {
                                  const parsed = parseCourseName(res.course_name);
                                  if (res.grade_point < 5.0) {
                                    return (
                                      <div key={i} className="dashboard-goal-item">
                                        <strong>{parsed.code}</strong>: Upgrade {res.grade} → A
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setActiveTab('goal')} 
                          className="btn-bronze-calculate"
                          style={{ width: '100%', marginTop: '16px' }}
                        >
                          Modify Goal Planner
                        </button>
                      </div>
                    ) : (
                      <div className="no-active-goal-state">
                        <span className="no-goal-icon">🎯</span>
                        <p>You have not committed to an academic goal for this semester yet.</p>
                        <button 
                          onClick={() => setActiveTab('goal')} 
                          className="btn-primary-profile"
                        >
                          Set Target GPA & Plan Goals
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: AI Recommendations Side Feed */}
              <div className="grid-col-right">
                <div className="recommendations-sidebar-card">
                  <div className="card-heading-section">
                    <h3>AI Study Recommendations</h3>
                  </div>

                  <div className="recommendations-stack-list">
                    {results && results.results.map((res, index) => (
                      <div key={index} className="recommendation-bubble-item">
                        <p>{res.recommendation || "Maintain your current load to protect grade parameters."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Archive History log button */}
            <div className="ready-to-strive-footer">
              <div className="ready-text">
                <h3>Archive Results</h3>
                <p>Lock in this simulated semester outcome and store it securely inside the university log database.</p>
              </div>
              <button onClick={handleSaveHistory} className="btn-bronze-calculate">
                Save Simulation History
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE PLANNER / CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="page-section animate-slideup">
            <form onSubmit={handlePredictSubmit} className="curriculum-container">
              <div className="section-header-curriculum">
                <h2>Configure <span className="bronze-text">My Courses</span></h2>
                <p>Register actual continuous assessments to run prediction engines and compile GPA distributions.</p>
              </div>

              <div className="curriculum-grid-full">
                {courses.map((course, index) => (
                  <div key={index} className="curriculum-card-expanded">
                    <div className="curriculum-card-header">
                      <h3>Course Entry #{index + 1}</h3>
                      {courses.length > 1 && (
                        <button 
                          type="button" 
                          className="btn-trash-delete"
                          onClick={() => removeCourse(index)}
                        >
                          <svg className="trash-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid-inputs">
                      <div className="form-group span-2">
                        <label>Course Code / Title</label>
                        <input
                          type="text"
                          placeholder="e.g. CSC 401: Intro to AI"
                          value={course.course_name}
                          onChange={(e) => handleInputChange(index, 'course_name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Credit Unit</label>
                        <select
                          value={course.course_unit}
                          onChange={(e) => handleInputChange(index, 'course_unit', e.target.value)}
                        >
                          <option value={1}>1 Unit</option>
                          <option value={2}>2 Units</option>
                          <option value={3}>3 Units</option>
                          <option value={4}>4 Units</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Difficulty</label>
                        <select
                          value={course.course_difficulty}
                          onChange={(e) => handleInputChange(index, 'course_difficulty', e.target.value)}
                        >
                          <option value={1}>Easy (1)</option>
                          <option value={2}>Medium (2)</option>
                          <option value={3}>Hard (3)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Study Hours/Wk</label>
                        <input
                          type="number"
                          min="0"
                          max="168"
                          value={course.hours_studied}
                          onChange={(e) => handleInputChange(index, 'hours_studied', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Sleep Hours/Night</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={course.sleep_hours}
                          onChange={(e) => handleInputChange(index, 'sleep_hours', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Extracurriculars?</label>
                        <select
                          value={course.extracurricular}
                          onChange={(e) => handleInputChange(index, 'extracurricular', e.target.value)}
                        >
                          <option value={0}>No (0)</option>
                          <option value={1}>Yes (1)</option>
                        </select>
                      </div>



                      <div className="form-group">
                        <label>Attendance %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={course.attendance}
                          onChange={(e) => handleInputChange(index, 'attendance', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Midterm (0-15)</label>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={course.midterm_score}
                          onChange={(e) => handleInputChange(index, 'midterm_score', e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Assignments (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={course.assignment_score}
                          onChange={(e) => handleInputChange(index, 'assignment_score', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Quizzes (0-5)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={course.quiz_score}
                          onChange={(e) => handleInputChange(index, 'quiz_score', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="add-course-dotted-card-full" onClick={addCourse}>
                  <span className="plus-icon">+</span>
                  <h4>Add New Course Field</h4>
                  <p>Append another subject dataset for calculation</p>
                </div>
              </div>

              {/* Ready to Strive footer submit row */}
              <div className="ready-to-strive-footer">
                <div className="ready-text">
                  <h3>Ready to Calculate?</h3>
                  <p>Our predictive system will compile your academic datasets to evaluate performance margins and GPA outcomes.</p>
                </div>
                <button type="submit" className="btn-bronze-calculate" disabled={predictLoading}>
                  {predictLoading ? 'Analyzing...' : 'Calculate Analytics'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SIMULATIONS WORKSPACE */}
        {activeTab === 'simulations' && (
          <div className="page-section animate-slideup">
            <div className="simulations-workspace-grid">
              
              {/* Left Column: Full Variable Sandbox Sliders for Each Course */}
              <div className="simulations-workspace-left">
                {courses.map((course, idx) => {
                  const parsed = parseCourseName(course.course_name);
                  const result = results?.results[idx];
                  return (
                    <div key={idx} className="simulations-full-course-card">
                      <div className="sim-card-header">
                        <h3>{parsed.code}: {parsed.name}</h3>
                        <span className={`table-grade-pill grade-${result?.grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                          Grade: {result?.grade || 'N/A'}
                        </span>
                      </div>

                      <div className="sim-sliders-large-grid">
                        
                        {/* 1. Study Hours */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Study Hours/Week</span>
                            <span className="sim-slider-val-badge">{course.hours_studied}h</span>
                          </div>
                          <input 
                            type="range" min="0" max="30" step="1"
                            value={course.hours_studied}
                            onChange={(e) => handleSliderChange(idx, 'hours_studied', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                        {/* 2. Class Attendance */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Class Attendance</span>
                            <span className="sim-slider-val-badge">{course.attendance}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="1"
                            value={course.attendance}
                            onChange={(e) => handleSliderChange(idx, 'attendance', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                        {/* 3. Sleep Hours */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Sleep Hours/Night</span>
                            <span className="sim-slider-val-badge">{course.sleep_hours}h</span>
                          </div>
                          <input 
                            type="range" min="3" max="12" step="0.5"
                            value={course.sleep_hours}
                            onChange={(e) => handleSliderChange(idx, 'sleep_hours', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                        {/* 4. Midterm Score */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Midterm Exam (0-15)</span>
                            <span className="sim-slider-val-badge">{course.midterm_score} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="15" step="0.5"
                            value={course.midterm_score}
                            onChange={(e) => handleSliderChange(idx, 'midterm_score', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                        {/* 5. Assignment Score */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Assignments (0-10)</span>
                            <span className="sim-slider-val-badge">{course.assignment_score} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="10" step="0.5"
                            value={course.assignment_score}
                            onChange={(e) => handleSliderChange(idx, 'assignment_score', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                        {/* 6. Quiz Score */}
                        <div className="sim-slider-row">
                          <div className="sim-slider-lbl-row">
                            <span className="sim-slider-title">Quizzes (0-5)</span>
                            <span className="sim-slider-val-badge">{course.quiz_score} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="5" step="0.5"
                            value={course.quiz_score}
                            onChange={(e) => handleSliderChange(idx, 'quiz_score', e.target.value)}
                            className="emerald-slider"
                          />
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Sticky Summary & Projections */}
              <div className="simulations-workspace-right">
                <div className="sticky-simulation-card">
                  <div className="card-heading-section">
                    <h3>Simulated Outcome</h3>
                  </div>

                  <div className="simulated-gpa-gauge-box">
                    <div className="sim-gpa-circular-indicator">
                      <span className="sim-gpa-gauge-title">Confidence Level</span>
                      <span className="sim-gpa-gauge-value">
                        {results && results.results.length > 0
                          ? `${Math.round(results.results.reduce((acc, curr) => acc + curr.predicted_score, 0) / results.results.length)}%`
                          : '71%'}
                      </span>
                    </div>
                  </div>

                  <div className="sim-outcome-breakdown">
                    <h4>Course Summary Details</h4>
                    <div className="sim-summary-table-container">
                      <table className="sim-summary-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Simulated GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results && results.results.map((res, i) => {
                            const parsed = parseCourseName(res.course_name);
                            return (
                              <tr key={i}>
                                <td><strong>{parsed.code}</strong></td>
                                <td>
                                  <span className={`table-grade-pill grade-${res.grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                                    {res.grade}
                                  </span>
                                </td>
                                <td>{res.grade_point.toFixed(2)} GP</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button onClick={handleSaveHistory} className="btn-primary-profile btn-save-sim-outcome">
                    Archive Simulation Outcome
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT SETTINGS / STUDENT PROFILE */}
        {activeTab === 'profile' && (
          <div className="page-section animate-slideup">
            <div className="profile-container-glass">
              {/* Close icon button returning user back to dashboard */}
              <button 
                className="close-profile-btn" 
                onClick={() => setActiveTab('dashboard')} 
                title="Return to Dashboard"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="section-header">
                <h2>Account Settings Registry</h2>
                <p>Register your personal credentials to synchronize files with our database log.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form-branded">
                <div className="form-group">
                  <label>Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Adams"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Matriculation Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MAT/2022/1045"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary-profile" disabled={profileSaving}>
                  {profileSaving ? 'Saving Credentials...' : 'Save Profile Settings'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: AI RECOMMENDATIONS WORKSPACE */}
        {activeTab === 'recommendations' && (
          <div className="page-section animate-slideup">
            <div className="recommendations-workspace-container">
              <div className="section-header-curriculum">
                <h2>AI Study Recommendations</h2>
                <p>Personalized learning pathways generated by the prediction engine to optimize your grades.</p>
              </div>

              <div className="recommendations-large-grid">
                {results && results.results.map((res, index) => {
                  const parsed = parseCourseName(res.course_name);
                  const isHighRisk = res.risk_level.toLowerCase().includes('high');
                  
                  return (
                    <div key={index} className="recommendation-course-card">
                      <div className="recommendation-card-header">
                        <div className="rec-course-title">
                          <h3>{parsed.code}: {parsed.name}</h3>
                        </div>
                        <div className="rec-badges-row">
                          <span className={`table-grade-pill grade-${res.grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                            Predicted: {res.grade}
                          </span>
                          <span className={`table-grade-pill ${isHighRisk ? 'grade-f' : 'grade-a'}`}>
                            {res.risk_level}
                          </span>
                        </div>
                      </div>

                      <div className="recommendation-card-body">
                        <div className="rec-text-bubble">
                          <p>{res.recommendation || "Maintain your current load to protect grade parameters."}</p>
                        </div>

                        <div className="rec-stats-row">
                          <div className="rec-stat-box">
                            <span className="rec-stat-lbl">Rec. Study Hours</span>
                            <span className="rec-stat-val">{res.study_hours_per_week || 6} hrs/wk</span>
                          </div>
                          <div className="rec-stat-box">
                            <span className="rec-stat-lbl">Rec. Sessions</span>
                            <span className="rec-stat-val">{res.study_sessions_per_week || 3} sessions/wk</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GOAL SETTING WORKSPACE */}
        {activeTab === 'goal' && (
          <div className="page-section animate-slideup">
            <div className="goal-workspace-container">
              <div className="section-header-curriculum">
                <h2>Target GPA & Goal Planner</h2>
                <p>Define your academic target for this semester and generate a customized path of actions to achieve it.</p>
              </div>

              <div className="goal-split-layout">
                {/* Left side: Goal config card */}
                <div className="goal-config-card">
                  <div className="card-heading-section">
                    <h3>Configure Target GPA</h3>
                  </div>
                  <div className="goal-input-box">
                    <div className="goal-val-row">
                      <span className="goal-current-indicator">Current projected: <strong>{results ? results.projected_gpa.toFixed(2) : '3.80'} GPA</strong></span>
                      <span className="goal-target-badge">{targetGpa.toFixed(1)} Target</span>
                    </div>
                    <input 
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={targetGpa}
                      onChange={(e) => {
                        setTargetGpa(parseFloat(e.target.value));
                        setIsGoalCommitted(false);
                      }}
                      className="emerald-slider"
                    />
                    <div className="sim-slider-ticks">
                      <span>1.0</span>
                      <span>2.5</span>
                      <span>3.5</span>
                      <span>4.5</span>
                      <span>5.0</span>
                    </div>
                  </div>

                  <div className="goal-gpa-progress">
                    <div className="progress-bar-labels">
                      <span>Progress towards goal</span>
                      <span>{results ? Math.min(Math.round((results.projected_gpa / targetGpa) * 100), 100) : 84}%</span>
                    </div>
                    <div className="goal-progress-track">
                      <div 
                        className="goal-progress-fill" 
                        style={{ width: `${results ? Math.min((results.projected_gpa / targetGpa) * 100, 100) : 84}%` }}
                      ></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsGoalCommitted(true);
                      alert('Goal committed successfully! Your target has been updated.');
                    }} 
                    className="btn-primary-profile"
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    {isGoalCommitted ? '✓ Goal Committed' : 'Commit to Target'}
                  </button>
                </div>

                {/* Right side: Actionable Roadmap */}
                <div className="goal-roadmap-card">
                  <div className="card-heading-section">
                    <h3>AI Actionable Roadmap</h3>
                  </div>

                  <div className="roadmap-content-box">
                    {results && results.projected_gpa >= targetGpa ? (
                      <div className="goal-success-bubble">
                        <span className="success-icon">🎉</span>
                        <div>
                          <h5>Goal Target Met!</h5>
                          <p>Your current projected GPA ({results.projected_gpa.toFixed(2)}) is equal to or exceeds your target. Maintain your current study hours and lecture attendance to secure these results on transcripts day!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="goal-action-list">
                        <p className="roadmap-intro-txt">To increase your GPA from <strong>{results ? results.projected_gpa.toFixed(2) : '3.80'}</strong> to <strong>{targetGpa.toFixed(2)}</strong>, target the following study improvements:</p>
                        
                        {results && results.results.map((res, i) => {
                          const parsed = parseCourseName(res.course_name);
                          const currentGP = res.grade_point;
                          
                          // If grade is not already A (5.0), recommend upgrade path
                          if (currentGP < 5.0) {
                            const neededHours = currentGP < 3.0 ? 12 : currentGP < 4.0 ? 8 : 5;
                            const neededAttendance = currentGP < 3.0 ? 95 : currentGP < 4.0 ? 90 : 85;
                            return (
                              <div key={i} className="roadmap-action-item">
                                <div className="action-item-header">
                                  <span className="action-course-code">{parsed.code}</span>
                                  <span className="action-grade-upgrade">Upgrade {res.grade} → A</span>
                                </div>
                                <ul className="action-bullets">
                                  <li>Increase weekly study hours to at least <strong>{neededHours} hrs/week</strong> (currently {courses[i]?.hours_studied || 6}h).</li>
                                  <li>Improve Class Attendance rate to <strong>{neededAttendance}%</strong> (currently {courses[i]?.attendance || 75}%).</li>
                                  <li>Consult course materials to improve continuous assessment test scores.</li>
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })}

                        {results && results.results.every(res => res.grade_point === 5.0) && (
                          <p className="roadmap-no-actions">You are already on track for straight A's! Keep up the brilliant work.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay animate-fadein">
          <div className="modal-card animate-scaleup">
            <div className="modal-card-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-card-body">
              <p>Are you sure you want to sign out of Strive.ai?</p>
            </div>
            <div className="modal-card-footer">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="btn-modal-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setShowLogoutModal(false);
                  await supabase.auth.signOut();
                  setResults(null);
                  setActiveTab('dashboard');
                }} 
                className="btn-modal-logout"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;